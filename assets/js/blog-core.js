/*
 * Shared blog rules, used both in the browser (window.BlogCore) and by the
 * build script (tools/build-blog.mjs) so pages and pre-rendered posts agree.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BlogCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Categories: set `category: <key>` in a post's front matter. Order here = order of the filter chips.
  const CATS = {
    papers:  { ko: '논문', en: 'Papers' },
    books:   { ko: '책', en: 'Books' },
    study:   { ko: '공부', en: 'Study' },
    journal: { ko: '기록', en: 'Journal' },
  };

  function parseFrontMatter(text) {
    text = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
    const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
    const meta = {};
    if (!m) return { meta, body: text };
    m[1].split('\n').forEach((line) => {
      const i = line.indexOf(':');
      if (i < 1) return;
      let v = line.slice(i + 1).replace(/\s+#.*$/, '').trim();   // allow trailing "# comment"
      if (/^(['"]).*\1$/.test(v)) v = v.slice(1, -1);
      meta[line.slice(0, i).trim().toLowerCase()] = v;
    });
    if (meta.category) meta.category = meta.category.trim().toLowerCase();
    return { meta, body: text.slice(m[0].length) };
  }

  // The old Jekyll posts carry their own home|posts menu; the layout already provides navigation.
  const stripMenu = (body) => body.replace(/<div class="menu">[\s\S]*?<\/div>\s*/gi, '');

  const plain = (body) => stripMenu(body)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s*(#{1,6}|[-*+]|\d+\.|>)\s+/gm, '')
    .replace(/[*_`~|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // List summary: `description`, else the first real paragraph (skips headings, TOCs, images, HTML blocks).
  function excerpt(meta, body, max = 150) {
    if (meta.description) return meta.description;
    const clean = (t) => t
      .replace(/<[^>]+>/g, ' ')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/^\s*([-*+]|\d+\.)\s+/gm, '')
      .replace(/[*_`~]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const blocks = stripMenu(body).replace(/```[\s\S]*?```/g, '').split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
    const isTOC = (b) => b.split('\n').every((l) => /^\s*([-*+]|\d+\.)\s+\[[^\]]*\]\(#[^)]*\)\s*$/.test(l));
    const skip = (b) => /^(#|<|!\[|\||-{3,}|>)/.test(b) || isTOC(b);
    const prose = blocks.find((b) => !skip(b) && !/^\s*([-*+]|\d+\.)\s/.test(b));
    const any = blocks.find((b) => !skip(b));
    const text = clean(prose || any || '');
    return text.length > max ? text.slice(0, max).trim() + '…' : text;
  }

  function firstHeading(body) {
    const m = stripMenu(body).match(/^#{1,3}\s+(.+)$/m);
    return m ? m[1].replace(/[*_`]/g, '').trim() : '';
  }

  // GitHub-style heading ids so in-post tables of contents (#anchor links) work.
  function slugify(text, used = {}) {
    let slug = text.toLowerCase().replace(/[^\p{L}\p{M}\p{Nd}\p{Pc}\s-]/gu, '').replace(/\s/g, '-');
    if (used[slug] != null) { used[slug] += 1; slug = `${slug}-${used[slug]}`; } else { used[slug] = 0; }
    return slug;
  }

  // Posts with a `date` come first, newest first; posts without one keep their posts.json order after them.
  function sortPosts(posts) {
    const time = (p) => { const d = Date.parse(p.meta && p.meta.date); return isNaN(d) ? null : d; };
    const dated = posts.filter((p) => time(p) != null).sort((a, b) => time(b) - time(a));
    const undated = posts.filter((p) => time(p) == null);
    return [...dated, ...undated];
  }

  return { CATS, parseFrontMatter, stripMenu, plain, excerpt, firstHeading, slugify, sortPosts };
});
