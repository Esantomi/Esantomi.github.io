#!/usr/bin/env node
/*
 * Builds the deployable site into _site/ (run by .github/workflows/deploy.yml on every push).
 *
 *   - copies the site as-is
 *   - pre-renders every post to blog/<name>/index.html with its own title, description and
 *     link-preview tags, so shared links and search engines see the real post
 *   - sorts blog/posts.json (posts with a `date` first, newest first) and adds any posts/*.md
 *     that were not listed yet
 *   - writes sitemap.xml, robots.txt and feed.xml (RSS)
 *
 * Locally:  cd tools && npm install && npm run build && cd ../_site && python3 -m http.server
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { marked } from 'marked';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, '_site');
const SITE = 'https://haein.info';
const SITE_NAME = 'Haein Ji · 지해인';
const AUTHOR = { '@type': 'Person', name: 'Haein Ji', alternateName: '지해인', url: `${SITE}/` };
const PROFILE_IMAGE = `${SITE}/assets/img/haein.jpg`;   // fallback for posts without images (the CV uses it too)

// A post's preview image is the first image in the post.
function firstImage(html) {
  const m = html.match(/<img\b[^>]*?\ssrc=["']([^"']+)["']/i);
  if (!m) return null;
  const src = m[1].trim();
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('//')) return 'https:' + src;
  return new URL(src, `${SITE}/posts/`).href;   // "/assets/…" → site root; relative → next to the .md file
}

const { CATS, parseFrontMatter, stripMenu, excerpt, slugify, sortPosts } = require(path.join(ROOT, 'assets/js/blog-core.js'));

const SKIP = new Set(['.git', '.github', 'node_modules', 'tools', '_site', 'README.md', '.gitignore']);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, s) => { fs.mkdirSync(path.dirname(path.join(OUT, p)), { recursive: true }); fs.writeFileSync(path.join(OUT, p), s); };
const postPath = (name) => `/blog/${encodeURIComponent(name)}/`;
const isoDate = (d) => { const t = Date.parse(d); return isNaN(t) ? null : new Date(t).toISOString().slice(0, 10); };
const markBuilt = (html) => html.replace(/<html lang="ko">/, '<html lang="ko" data-built="1">');

/* 1. copy the site */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT);
for (const entry of fs.readdirSync(ROOT)) {
  if (!SKIP.has(entry)) fs.cpSync(path.join(ROOT, entry), path.join(OUT, entry), { recursive: true });
}

/* 2. load posts */
const listed = JSON.parse(read('blog/posts.json'));
const files = fs.readdirSync(path.join(ROOT, 'posts')).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3));
const missing = listed.filter((n) => !files.includes(n));
const unlisted = files.filter((n) => !listed.includes(n)).sort();
if (missing.length) console.warn('! listed in blog/posts.json but no posts/<name>.md:', missing.join(', '));
if (unlisted.length) console.log('+ not in blog/posts.json yet, added:', unlisted.join(', '));

const posts = sortPosts([...listed.filter((n) => files.includes(n)), ...unlisted].map((name) => {
  const { meta, body } = parseFrontMatter(read(`posts/${name}.md`));
  const tokens = marked.lexer(stripMenu(body), { gfm: true });
  // If the body opens with a heading, it becomes the page title (as on the client).
  const first = tokens.findIndex((tk) => tk.type !== 'space');
  let title = meta.title || name;
  let leadId = '';
  if (first > -1 && tokens[first].type === 'heading' && tokens[first].depth <= 2) {
    title = tokens[first].text.replace(/[*_`]/g, '').replace(/<[^>]+>/g, '').trim();
    leadId = slugify(title);
    tokens.splice(first, 1);
  }
  const html = marked.parser(tokens, { gfm: true });
  return { name, meta, title, leadId, html, image: firstImage(html), description: excerpt(meta, body, 160), date: isoDate(meta.date) };
}));

write('blog/posts.json', JSON.stringify(posts.map((p) => p.name), null, 2) + '\n');

/* 3. pre-render each post from blog/post.html */
const template = read('blog/post.html');
const catLabel = (k, l = 'ko') => (CATS[k] ? CATS[k][l] : k);

posts.forEach((p, i) => {
  const newer = posts[i - 1] ? { name: posts[i - 1].name, title: posts[i - 1].title } : null;
  const older = posts[i + 1] ? { name: posts[i + 1].name, title: posts[i + 1].title } : null;
  const url = SITE + postPath(p.name);
  const ld = {
    '@context': 'https://schema.org', '@type': 'BlogPosting',
    headline: p.title, description: p.description, url, mainEntityOfPage: url,
    image: p.image || PROFILE_IMAGE, author: AUTHOR, inLanguage: 'ko',
    ...(p.date ? { datePublished: p.date } : {}),
    ...(p.meta.category ? { articleSection: catLabel(p.meta.category, 'en') } : {}),
  };
  const head = [
    `<meta name="description" content="${esc(p.description)}">`,
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:type" content="article">`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}">`,
    `<meta property="og:title" content="${esc(p.title)}">`,
    `<meta property="og:description" content="${esc(p.description)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${esc(p.image || PROFILE_IMAGE)}">`,
    `<meta property="og:locale" content="ko_KR">`,
    p.date && `<meta property="article:published_time" content="${p.date}">`,
    p.meta.category && `<meta property="article:section" content="${esc(catLabel(p.meta.category))}">`,
    `<meta name="twitter:card" content="${p.image ? 'summary_large_image' : 'summary'}">`,
    `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`,
  ].filter(Boolean).map((l) => '  ' + l).join('\n') + '\n';
  const metaLine = [
    p.meta.category && `<a class="post__cat" href="../?c=${encodeURIComponent(p.meta.category)}">${esc(catLabel(p.meta.category))}</a>`,
    p.meta.author && esc(p.meta.author),
    p.date && `<time datetime="${p.date}">${esc(p.meta.date)}</time>`,
  ].filter(Boolean).join(' · ');
  const data = JSON.stringify({ name: p.name, meta: p.meta, title: p.title, newer, older }).replace(/</g, '\\u003c');

  let page = markBuilt(template)
    .replace(/  <!--post-meta:[^\n]*-->\n  <meta name="robots" content="noindex">\n/, head)
    .replace('<title>Post — Haein Ji · 지해인</title>', `<title>${esc(p.title)} — ${esc(SITE_NAME)}</title>`)
    .replace(/  <script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/marked\/[^"]+"><\/script>\n/, '')
    .replace(/(href|src|data-base)="\.\.\//g, '$1="../../')
    .replace(/href="\.\/"/g, 'href="../"')
    .replace('<h1 class="page__title" id="postTitle">&nbsp;</h1>',
      `${p.leadId ? `<span class="post__anchor" id="${esc(p.leadId)}"></span>\n        ` : ''}<h1 class="page__title" id="postTitle">${esc(p.title)}</h1>`)
    .replace('<p class="post__meta" id="postMeta"></p>', `<p class="post__meta" id="postMeta">${metaLine}</p>`)
    .replace('<div class="md" id="postBody"></div>', `<div class="md" id="postBody" data-prerendered="1">\n${p.html}</div>`)
    .replace('  <script src="../../assets/js/blog-core.js"></script>', `  <script type="application/json" id="postData">${data}</script>\n  <script src="../../assets/js/blog-core.js"></script>`);
  write(`blog/${p.name}/index.html`, page);
});

/* 4. built flag on the blog pages (list links go to blog/<name>/; post.html?p= redirects there) */
['blog/index.html', 'blog/post.html'].forEach((f) => write(f, markBuilt(read(f))));

/* 5. sitemap, robots, RSS */
const today = new Date().toISOString().slice(0, 10);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}/</loc><lastmod>${today}</lastmod></url>
  <url><loc>${SITE}/blog/</loc><lastmod>${today}</lastmod></url>
${posts.map((p) => `  <url><loc>${SITE}${postPath(p.name)}</loc>${p.date ? `<lastmod>${p.date}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
write('feed.xml', `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE_NAME)} — Blog</title>
    <link>${SITE}/blog/</link>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>지해인(Haein Ji)의 연구 노트와 기록</description>
    <language>ko</language>
${posts.map((p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE}${postPath(p.name)}</link>
      <guid>${SITE}${postPath(p.name)}</guid>
      <description>${esc(p.description)}</description>${p.meta.category ? `\n      <category>${esc(catLabel(p.meta.category))}</category>` : ''}${p.date ? `\n      <pubDate>${new Date(p.date).toUTCString()}</pubDate>` : ''}
    </item>`).join('\n')}
  </channel>
</rss>
`);

console.log(`✓ ${posts.length} posts → _site/blog/<name>/, sitemap.xml, feed.xml`);
