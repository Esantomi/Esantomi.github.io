/*
 * Blog: Markdown posts with front matter.
 *
 *   blog/posts.json   → ["newest-post", "older-post", ...]   (file names without .md)
 *   posts/<name>.md   → front matter (--- title / author / category / date / description ---) + Markdown body
 *
 * Modes (set on the <script> tag):
 *   data-mode="list"   blog/index.html: category chips, search, all posts into #postList
 *   data-mode="post"   one post into #postBody
 *                      - blog/post.html?p=<name>: fetched and rendered in the browser (works without a build)
 *                      - blog/<name>/index.html: pre-rendered by tools/build-blog.mjs (#postBody[data-prerendered])
 * data-base is the path from the page to the site root.
 *
 * Shared parsing rules live in blog-core.js (window.BlogCore), which must load first.
 */
(function () {
  'use strict';

  const { CATS, parseFrontMatter, stripMenu, plain, excerpt, firstHeading, slugify, sortPosts } = window.BlogCore;

  const me = document.currentScript;
  const BASE = me.dataset.base || './';
  const MODE = me.dataset.mode || 'list';
  const POSTS = BASE + 'posts/';   // Markdown files
  const BLOG = BASE + 'blog/';     // pages + posts.json
  const root = document.documentElement;
  const BUILT = root.dataset.built === '1';   // set by the build: posts have their own pages at blog/<name>/
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  const T = {
    ko: { name: '지해인', cv: 'CV', blog: 'Blog', blogLead: '연구 노트와 기록', back: '목록으로',
          empty: '아직 글이 없습니다.', notFound: '글을 찾을 수 없습니다.', read: '읽기',
          all: '전체', searchPh: '제목·본문 검색', noResult: '조건에 맞는 글이 없습니다.', count: (n) => `글 ${n}개`,
          newer: '다음 글', older: '이전 글', toTop: '맨 위로',
          loadErr: '글을 불러오지 못했습니다. 로컬에서 확인할 때는 웹 서버로 열어 주세요 (python3 -m http.server).' },
    en: { name: 'Haein Ji', cv: 'CV', blog: 'Blog', blogLead: 'Research notes and records', back: 'All posts',
          empty: 'No posts yet.', notFound: 'Post not found.', read: 'Read',
          all: 'All', searchPh: 'Search titles and text', noResult: 'No matching posts.', count: (n) => `${n} post${n === 1 ? '' : 's'}`,
          newer: 'Newer', older: 'Older', toTop: 'Back to top',
          loadErr: 'Could not load posts. When previewing locally, serve the folder with a web server (python3 -m http.server).' },
  };
  const lang = () => (root.lang === 'en' ? 'en' : 'ko');
  const catLabel = (k) => (CATS[k] ? CATS[k][lang()] : k);
  const t = (k) => T[lang()][k];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const langQ = (sep) => (lang() === 'en' ? `${sep}lang=en` : '');

  function fmtDate(d) {
    if (!d) return '';
    const dt = new Date(d);
    if (isNaN(dt)) return d;
    return lang() === 'en'
      ? dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      : `${dt.getFullYear()}. ${dt.getMonth() + 1}. ${dt.getDate()}.`;
  }

  function editDistance(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    return d[a.length][b.length];
  }

  async function fetchText(url) {
    const r = await fetch(url, { cache: 'no-cache' });
    if (!r.ok) throw new Error(r.status + ' ' + url);
    return r.text();
  }

  const postUrl = (name) => BUILT
    ? `${BLOG}${encodeURIComponent(name)}/${langQ('?')}`
    : `${BLOG}post.html?p=${encodeURIComponent(name)}${langQ('&')}`;

  /* ───────── data ───────── */
  let cache = null;
  async function loadAll() {
    if (cache) return cache;
    const names = JSON.parse(await fetchText(BLOG + 'posts.json'));
    const posts = await Promise.all(names.map(async (name) => {
      try {
        const { meta, body } = parseFrontMatter(await fetchText(POSTS + encodeURIComponent(name) + '.md'));
        const heading = firstHeading(body);
        const text = plain(body);
        return { name, meta, body, heading, text, excerpt: excerpt(meta, body),
                 category: meta.category || '',
                 hay: [heading, meta.title, meta.description, text].join(' ').toLowerCase() };
      } catch (e) { return null; }
    }));
    cache = sortPosts(posts.filter(Boolean));
    return cache;
  }

  /* ───────── list page ───────── */
  const escRe = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const mark = (html, terms) => terms.length
    ? html.replace(new RegExp(`(${terms.map((x) => escRe(esc(x))).join('|')})`, 'gi'), '<mark>$1</mark>')
    : html;

  // A short passage around the first search hit in the body.
  function snippet(p, terms) {
    const low = p.text.toLowerCase();
    const at = terms.map((x) => low.indexOf(x)).filter((i) => i >= 0).sort((a, b) => a - b)[0];
    if (at == null) return '';
    let start = Math.max(0, at - 50);
    if (start > 0) { const sp = p.text.indexOf(' ', start); if (sp > -1 && sp < at) start = sp + 1; }   // start on a word boundary
    const piece = p.text.slice(start, at + 110);
    return (start > 0 ? '…' : '') + piece + (at + 110 < p.text.length ? '…' : '');
  }

  function itemHTML(p, terms = []) {
    const title = p.heading || p.meta.title || p.name;
    const sub = p.heading && p.meta.title && p.meta.title !== p.heading ? p.meta.title : '';
    const inHead = terms.length && terms.every((x) => (title + ' ' + p.excerpt).toLowerCase().includes(x));
    const ex = terms.length && !inHead ? snippet(p, terms) || p.excerpt : p.excerpt;
    return `
      <li class="postlist__item">
        <a href="${postUrl(p.name)}">
          <div class="postlist__meta">
            ${p.category ? `<span class="postlist__cat">${esc(catLabel(p.category))}</span>` : ''}
            ${p.meta.date ? `<time datetime="${esc(p.meta.date)}">${esc(fmtDate(p.meta.date))}</time>` : ''}
            ${sub ? `<span class="postlist__sub">${esc(sub)}</span>` : ''}
          </div>
          <h3 class="postlist__title">${mark(esc(title), terms)}</h3>
          ${ex ? `<p class="postlist__ex">${mark(esc(ex), terms)}</p>` : ''}
          <span class="postlist__go">${t('read')} <i class="fa-solid fa-arrow-right"></i></span>
        </a>
      </li>`;
  }

  /* List page state: category + search, mirrored in the URL (?c=papers&q=...) */
  const params = new URLSearchParams(location.search);
  const state = { c: params.get('c') || '', q: params.get('q') || '' };

  function syncUrl() {
    const url = new URL(location.href);
    state.c ? url.searchParams.set('c', state.c) : url.searchParams.delete('c');
    state.q ? url.searchParams.set('q', state.q) : url.searchParams.delete('q');
    history.replaceState(null, '', url);
  }

  async function renderList(el) {
    try {
      const posts = await loadAll();
      const catsEl = $('#cats');
      if (catsEl) {
        const keys = [...Object.keys(CATS), ...new Set(posts.map((p) => p.category).filter((k) => k && !CATS[k]))]
          .filter((k) => posts.some((p) => p.category === k));
        catsEl.innerHTML = [['', t('all'), posts.length], ...keys.map((k) => [k, catLabel(k), posts.filter((p) => p.category === k).length])]
          .map(([k, label, n]) => `<button type="button" data-c="${esc(k)}" aria-pressed="${state.c === k}">${esc(label)}<span>${n}</span></button>`)
          .join('');
      }
      const terms = state.q.toLowerCase().split(/\s+/).filter(Boolean);
      const list = posts.filter((p) => (!state.c || p.category === state.c) && terms.every((x) => p.hay.includes(x)));
      const countEl = $('#postCount');
      if (countEl) countEl.textContent = t('count')(list.length);
      el.innerHTML = list.length
        ? list.map((p) => itemHTML(p, terms)).join('')
        : `<li class="postlist__empty">${posts.length ? t('noResult') : t('empty')}</li>`;
    } catch (e) {
      el.innerHTML = `<li class="postlist__empty">${t('loadErr')}</li>`;
    }
  }

  function setupListControls() {
    const list = $('#postList');
    const q = $('#q');
    const cats = $('#cats');
    if (q) {
      q.value = state.q;
      let timer;
      q.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => { state.q = q.value.trim(); syncUrl(); renderList(list); }, 120);
      });
      addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== q) { e.preventDefault(); q.focus(); }
        if (e.key === 'Escape' && document.activeElement === q && q.value) { q.value = ''; q.dispatchEvent(new Event('input')); }
      });
    }
    if (cats) cats.addEventListener('click', (e) => {
      const b = e.target.closest('[data-c]');
      if (!b) return;
      state.c = state.c === b.dataset.c ? '' : b.dataset.c;
      syncUrl();
      renderList(list);
    });
  }

  /* ───────── post page ───────── */
  // Works on freshly rendered and pre-rendered bodies alike.
  function enhanceBody(body) {
    body.querySelectorAll('.menu').forEach((n) => n.remove());
    body.querySelectorAll('a[href^="http"]').forEach((a) => { a.target = '_blank'; a.rel = 'noopener'; });
    body.querySelectorAll('img').forEach((img) => { img.loading = 'lazy'; });

    const used = {};
    const lead = document.querySelector('.post__anchor');
    if (lead && lead.id) used[lead.id] = 0;
    body.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => { if (!h.id) h.id = slugify(h.textContent, used); });

    // Some tables of contents were generated by other tools (bold list items as targets, or
    // slightly different slug rules). Fall back to matching on letters and digits only.
    const norm = (x) => x.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
    const candidates = [...body.querySelectorAll('h1, h2, h3, h4, h5, h6, strong, b')].filter((el) => !el.closest('a'));
    const keys = candidates.map((el) => norm(el.textContent));
    body.querySelectorAll('a[href^="#"]').forEach((a) => {
      const id = decodeURIComponent(a.getAttribute('href').slice(1));
      if (!id || document.getElementById(id)) return;
      const key = norm(a.textContent);
      if (!key) return;
      let i = keys.indexOf(key);                                                                         // same text
      if (i < 0) i = keys.findIndex((k) => k.length >= 4 && (key.startsWith(k) || k.startsWith(key)));  // shortened form
      if (i < 0 && key.length >= 10) i = keys.findIndex((k) => Math.abs(k.length - key.length) <= 2 && editDistance(k, key) <= 2); // small typo
      const hit = candidates[i];
      if (!hit) return;
      const anchor = document.createElement('span');
      anchor.className = 'md-anchor';
      anchor.id = id;
      hit.before(anchor);
    });

    if (location.hash) {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) requestAnimationFrame(() => target.scrollIntoView());
    }
  }

  function renderMeta(meta) {
    const cat = meta.category || '';
    $('#postMeta').innerHTML = [
      cat && `<a class="post__cat" href="${BLOG}?c=${encodeURIComponent(cat)}${langQ('&')}">${esc(catLabel(cat))}</a>`,
      meta.author && esc(meta.author),
      meta.date && `<time datetime="${esc(meta.date)}">${esc(fmtDate(meta.date))}</time>`,
    ].filter(Boolean).join(' · ');
  }

  // prev/next = { name, title } | null. "Newer" is the post above in the list, "Older" the one below.
  function renderNav(newer, older) {
    const nav = $('#postNav');
    if (!nav) return;
    const card = (p, cls, label, icon) => p
      ? `<a class="postnav__item ${cls}" href="${postUrl(p.name)}"><span class="postnav__label">${icon === 'l' ? '<i class="fa-solid fa-arrow-left"></i> ' : ''}${label}${icon === 'r' ? ' <i class="fa-solid fa-arrow-right"></i>' : ''}</span><span class="postnav__title">${esc(p.title)}</span></a>`
      : '<span></span>';
    nav.innerHTML = newer || older ? card(older, 'postnav__older', t('older'), 'l') + card(newer, 'postnav__newer', t('newer'), 'r') : '';
  }

  async function neighbours(name) {
    const names = JSON.parse(await fetchText(BLOG + 'posts.json'));
    const i = names.indexOf(name);
    if (i < 0) return [null, null];
    const info = async (n) => {
      if (!n) return null;
      try {
        const { meta, body } = parseFrontMatter(await fetchText(POSTS + encodeURIComponent(n) + '.md'));
        return { name: n, title: firstHeading(body) || meta.title || n };
      } catch (e) { return null; }
    };
    return Promise.all([info(names[i - 1]), info(names[i + 1])]);
  }

  let post = null;   // { name, meta, title, newer, older }
  async function renderPost() {
    const body = $('#postBody');
    if (!post) {
      // Pre-rendered page (blog/<name>/): data comes with the page.
      const data = $('#postData');
      if (body.dataset.prerendered && data) {
        post = JSON.parse(data.textContent);
        enhanceBody(body);
      } else {
        const name = new URLSearchParams(location.search).get('p');
        if (!name) { location.replace(BLOG + langQ('?')); return; }
        if (BUILT) {   // the post has its own page: send visitors (and old links) there
          location.replace(`${BLOG}${encodeURIComponent(name)}/${langQ('?')}${location.hash}`);
          return;
        }
        try {
          const { meta, body: md } = parseFrontMatter(await fetchText(POSTS + encodeURIComponent(name) + '.md'));
          body.innerHTML = window.marked ? window.marked.parse(stripMenu(md), { gfm: true }) : `<pre>${esc(md)}</pre>`;
          // If the body opens with a heading, promote it to the page title (keeping its anchor).
          const h = body.firstElementChild;
          const lead = h && /^H[12]$/.test(h.tagName) ? h : null;
          const title = lead ? lead.textContent : (meta.title || name);
          if (lead) {
            const anchor = document.createElement('span');
            anchor.className = 'post__anchor';
            anchor.id = slugify(lead.textContent);
            $('#postTitle').before(anchor);
            lead.remove();
          }
          $('#postTitle').textContent = title;
          enhanceBody(body);
          post = { name, meta, title, newer: null, older: null };
          neighbours(name).then(([newer, older]) => { post.newer = newer; post.older = older; renderNav(newer, older); });
        } catch (e) {
          $('#postTitle').textContent = t('notFound');
          body.innerHTML = `<p>${t('loadErr')}</p>`;
          return;
        }
      }
    }
    renderMeta(post.meta);
    renderNav(post.newer, post.older);
    document.title = `${post.title} — ${t('name')}`;
  }

  // Reading progress + back-to-top for long posts.
  function setupReading() {
    const bar = $('.progress span');
    const toTop = $('#toTop');
    const onScroll = () => {
      const h = document.documentElement;
      const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      if (bar) bar.style.transform = `scaleX(${p})`;
      if (toTop) toTop.classList.toggle('show', h.scrollTop > 700);
    };
    addEventListener('scroll', onScroll, { passive: true });
    if (toTop) toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
    onScroll();
  }

  /* ───────── chrome for blog pages (lang + theme) ───────── */
  function applyStatic() {
    $$('[data-b18n]').forEach((el) => { el.textContent = t(el.dataset.b18n); });
    $$('[data-b18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.b18nPh); });
    $$('[data-b18n-label]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.b18nLabel)); });
    $$('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang())));
    $$('a[data-keep-lang]').forEach((a) => {
      const u = new URL(a.getAttribute('href'), location.href);
      if (lang() === 'en') u.searchParams.set('lang', 'en'); else u.searchParams.delete('lang');
      a.href = u.pathname + u.search;
    });
  }

  function setupChrome() {
    $$('.lang button').forEach((b) => b.addEventListener('click', () => {
      const l = b.dataset.lang;
      if (l === lang()) return;
      root.lang = l;
      try { localStorage.setItem('cv-lang', l); } catch (e) {}
      const url = new URL(location.href);
      if (l === 'en') url.searchParams.set('lang', 'en'); else url.searchParams.delete('lang');
      history.replaceState(null, '', url);
      applyStatic();
      if (MODE === 'list') renderList($('#postList'));
      if (MODE === 'post') renderPost();
    }));

    const btn = $('#themeBtn');
    if (btn) {
      const dark = () => root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
      const sync = () => { btn.innerHTML = `<i class="fa-solid ${dark() ? 'fa-sun' : 'fa-moon'}"></i>`; };
      btn.addEventListener('click', () => {
        root.dataset.theme = dark() ? 'light' : 'dark';
        try { localStorage.setItem('cv-theme', root.dataset.theme); } catch (e) {}
        sync();
      });
      sync();
    }
    const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
  }

  /* ───────── boot ───────── */
  setupChrome();
  applyStatic();
  if (MODE === 'list') { setupListControls(); renderList($('#postList')); }
  if (MODE === 'post') { setupReading(); renderPost(); }
})();
