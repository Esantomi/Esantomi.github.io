(function () {
  'use strict';

  const CV = window.CV;
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ───────── i18n ───────── */
  const UI = {
    ko: {
      skip: '본문으로 건너뛰기', name: '지해인', aff: '연구원 · 강사<br>한국학중앙연구원 (AKS)<br>성남, 대한민국', hello: '편하게 연락 주세요.',
      heroTitle: '인문학, <em>데이터</em>로&nbsp;다시&nbsp;묻다.<br><span>한국 근대 문학 · 신화 · 종교 · 문화 연구</span>',
      home: 'Home', posts: 'Blog',
      s_bio: '소개', s_education: '학력', s_training: '연수·교육', s_work: '경력', s_pubs: '연구 성과',
      s_projects: '연구 프로젝트', s_talks: '학술 발표', s_teaching: '강의 경력', s_exhibitions: '전시',
      s_awards: '수상 및 장학', s_members: '학회 활동', s_skills: '기술', s_certs: '자격증',
      pubsLead: '단행본, 학술논문, 학위논문, eBook, 데이터셋과 모델',
      tab_all: '전체', tab_books: '단행본', tab_articles: '학술논문', tab_theses: '학위논문', tab_ebooks: 'eBook', tab_datasets: '데이터셋·모델',
      st_articles: '학술논문', st_talks: '학술 발표', st_projects: '연구 프로젝트', st_courses: '강의',
      more: '더 보기', less: '접기', present: '현재', pi: '연구책임자', wip: '진행 중', forthcoming: '출간 예정',
      unlisted: '미등재', intl: '국제', current: '현재',
      nav: { bio: '소개', education: '학력', experience: '경력', publications: '연구 성과', projects: '프로젝트', talks: '발표', teaching: '강의', exhibitions: '전시', awards: '수상', memberships: '학회', training: '연수·교육', skills: '기술' },
    },
    en: {
      skip: 'Skip to content', name: 'Haein Ji', aff: 'Researcher &amp; Instructor<br>The Academy of Korean Studies (AKS)<br>Seongnam, Republic of Korea', hello: 'Please feel free to get in touch.',
      heroTitle: 'The humanities, asked&nbsp;again&nbsp;through&nbsp;<em>data</em>.<br><span>Modern Korean literature · Myth · Religion · Cultural studies</span>',
      home: 'Home', posts: 'Blog',
      s_bio: 'Bio', s_education: 'Education', s_training: 'Training', s_work: 'Work Experience', s_pubs: 'Publications',
      s_projects: 'Projects', s_talks: 'Talks & Presentations', s_teaching: 'Teaching Experience', s_exhibitions: 'Exhibitions',
      s_awards: 'Awards & Honors', s_members: 'Memberships', s_skills: 'Skills', s_certs: 'Certifications',
      pubsLead: 'Books, articles, theses, eBooks, datasets and models',
      tab_all: 'All', tab_books: 'Books', tab_articles: 'Articles', tab_theses: 'Theses', tab_ebooks: 'eBooks', tab_datasets: 'Data & Models',
      st_articles: 'Articles', st_talks: 'Talks', st_projects: 'Projects', st_courses: 'Courses',
      more: 'Show more', less: 'Show less', present: 'Present', pi: 'PI', wip: 'Work in progress', forthcoming: 'Forthcoming',
      unlisted: 'Unlisted', intl: 'Intl.', current: 'Current',
      nav: { bio: 'Bio', education: 'Education', experience: 'Experience', publications: 'Publications', projects: 'Projects', talks: 'Talks', teaching: 'Teaching', exhibitions: 'Exhibitions', awards: 'Awards', memberships: 'Memberships', training: 'Training', skills: 'Skills' },
    },
  };

  let lang = root.lang === 'en' ? 'en' : 'ko';
  const u = (k) => UI[lang][k];
  const tr = (v) => (v && typeof v === 'object' && !Array.isArray(v)) ? (v[lang] ?? v.ko ?? v.en) : (v ?? '');
  const MON = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, June: 6, Jul: 7, July: 7, Aug: 8, Sep: 9, Sept: 9, Oct: 10, Nov: 11, Dec: 12 };
  const mm = (m) => String(MON[m]).padStart(2, '0');
  const dd = (d) => String(d).padStart(2, '0');
  // EN keeps "Mar. 2024"; KO reads naturally as "2024.03".
  const period = (p) => {
    p = tr(p) || '';
    if (lang === 'ko') {
      const M = '(Jan|Feb|Mar|Apr|May|June?|July?|Aug|Sept?|Oct|Nov|Dec)\\.?';
      p = p
        .replace(new RegExp(M + ' (\\d{1,2})[–-](\\d{1,2}), (\\d{4})', 'g'), (_, m, a, b, y) => `${y}.${mm(m)}.${dd(a)}–${dd(b)}`)
        .replace(new RegExp(M + ' (\\d{1,2}), (\\d{4})', 'g'), (_, m, a, y) => `${y}.${mm(m)}.${dd(a)}`)
        .replace(new RegExp(M + ' – ' + M + ' (\\d{4})', 'g'), (_, a, b, y) => `${y}.${mm(a)} – ${y}.${mm(b)}`)
        .replace(new RegExp(M + ' (\\d{4})', 'g'), (_, m, y) => `${y}.${mm(m)}`)
        .replace(/Spring (\d{4})/, '$1 봄학기')
        .replace(/Fall (\d{4})/, '$1 가을학기');
    }
    return p.replace(/Present/g, u('present'));
  };
  const isCurrent = (p) => /Present/.test(tr(p) || '');

  /* ───────── helpers ───────── */
  const ICON = {
    doi: 'fa-solid fa-link', program: 'fa-solid fa-list-ul', youtube: 'fa-brands fa-youtube', image: 'fa-regular fa-image',
    news: 'fa-regular fa-newspaper', link: 'fa-solid fa-arrow-up-right-from-square', invite: 'fa-regular fa-bell', data: 'fa-solid fa-database',
  };
  const DEFAULT_LABEL = { doi: 'DOI', program: 'Program', youtube: 'Video', image: 'Image', news: 'News', link: 'Link', invite: 'Invitation', data: 'Data' };

  const safeUrl = (url) => (/%[0-9A-F]{2}/i.test(url) ? url : encodeURI(url));
  const linkHTML = ([k, url, label]) => {
    const text = label || DEFAULT_LABEL[k] || 'Link';
    const pre = k === 'doi' ? '<span class="lk__doi">DOI</span>' : `<i class="${ICON[k] || ICON.link}" aria-hidden="true"></i>`;
    return `<a class="lk lk--${k}" href="${safeUrl(url)}" target="_blank" rel="noopener">${pre}<span>${text}</span></a>`;
  };
  const links = (l) => (l && l.length ? `<div class="lks">${l.map(linkHTML).join('')}</div>` : '');

  const ME = /(지해인|Ji, H\.)/g;
  const cite = (s) => s.replace(ME, '<strong class="me">$1</strong>');

  const BADGE = {
    kci: '<span class="badge badge--kci">KCI</span>',
    scopus: '<span class="badge badge--scopus">Scopus</span>',
    arxiv: '<span class="badge badge--arxiv">arXiv</span>',
    unlisted: () => `<span class="badge badge--plain">${u('unlisted')}</span>`,
  };
  const badges = (it) => {
    let out = '';
    if (it.status) out += `<span class="badge badge--status"><span class="pulse"></span>${u(it.status)}</span>`;
    (it.badges || []).forEach((b) => { const v = BADGE[b]; out += typeof v === 'function' ? v() : v; });
    if (it.intl) out += `<span class="badge badge--plain">${u('intl')}</span>`;
    if (it.role) out += `<span class="badge badge--plain">${tr(it.role)}</span>`;
    if (it.note) out += `<span class="badge badge--plain">${tr(it.note)}</span>`;
    return out ? `<div class="badges">${out}</div>` : '';
  };

  const yearOf = (it) => { const m = (it.c || '').match(/\((\d{4})/); return m ? m[1] : ''; };

  /* ───────── renderers ───────── */
  function renderStatic() {
    $$('[data-i18n]').forEach((el) => { const v = u(el.dataset.i18n); if (v != null) el.textContent = v; });
    $$('[data-i18n-html]').forEach((el) => { el.innerHTML = u(el.dataset.i18nHtml); });
    $$('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    document.title = lang === 'en' ? 'Haein Ji — Curriculum Vitae' : '지해인 — Curriculum Vitae';
  }

  function renderNav() {
    const ids = Object.keys(UI[lang].nav);
    $('#nav').innerHTML = ids.map((id, i) =>
      `<a href="#${id}" data-target="${id}"><span class="nav__num">${String(i + 1).padStart(2, '0')}</span>${UI[lang].nav[id]}</a>`
    ).join('');
  }

  function renderHero() {
    const stats = [
      [CV.publications.articles.filter((a) => !a.status).length, u('st_articles')],
      [CV.talks.length, u('st_talks')],
      [CV.projects.length, u('st_projects')],
      [CV.teaching.length, u('st_courses')],
    ];
    $('#stats').innerHTML = stats.map(([n, l]) => `<div><dt data-count="${n}">${n}</dt><dd>${l}</dd></div>`).join('');
  }

  function renderBio() {
    $('#bioBody').innerHTML = tr(CV.bio).map((p) => `<p>${p}</p>`).join('');
  }

  function renderTimeline(sel, items, titleFn, subFn) {
    $(sel).innerHTML = items.map((it) => `
      <li class="tl${isCurrent(it.p) ? ' tl--now' : ''}">
        <div class="tl__when">${period(it.p)}</div>
        <div class="tl__body">
          <div class="tl__title">${titleFn(it)}</div>
          <div class="tl__sub">${subFn(it)}</div>
        </div>
      </li>`).join('');
  }

  function renderEducation() {
    renderTimeline('#eduList', CV.education,
      (it) => `<span class="deg">${tr(it.deg)}</span>${tr(it.major)}`,
      (it) => tr(it.school));
  }

  function renderWork() {
    renderTimeline('#workList', CV.work,
      (it) => it.u ? `<a href="${it.u}" target="_blank" rel="noopener" class="ul">${tr(it.t)}</a>` : tr(it.t),
      (it) => tr(it.s));
  }

  function simpleList(sel, items, extra) {
    $(sel).innerHTML = items.map((it) => `
      <li class="row">
        <div class="row__main">
          <div class="row__title">${extra && extra.pre ? extra.pre(it) : ''}${tr(it.t)}</div>
          <div class="row__sub">${extra && extra.sub ? extra.sub(it) : tr(it.s)}</div>
          ${it.note ? `<div class="row__note"><i class="fa-solid fa-trophy"></i> ${tr(it.note)}</div>` : ''}
          ${links(it.l)}
        </div>
        <div class="row__when">${period(it.p)}</div>
      </li>`).join('');
  }

  /* Publications */
  const PUB_KEYS = ['books', 'articles', 'theses', 'ebooks', 'datasets'];
  let pubTab = 'all';

  function pubItem(it, n) {
    const kids = it.children ? `<ul class="pub__kids">${it.children.map((c) => `<li>${badges(c)}<p class="pub__c">${cite(c.c)}</p>${links(c.l)}</li>`).join('')}</ul>` : '';
    return `
      <li class="pub">
        <div class="pub__n">${n}</div>
        <div class="pub__body">
          ${it.head ? `<div class="pub__head">${it.head}</div>` : ''}
          ${badges(it)}
          <p class="pub__c">${cite(it.c)}</p>
          ${links(it.l)}
          ${kids}
        </div>
      </li>`;
  }

  function renderPubTabs() {
    const tabs = ['all', ...PUB_KEYS];
    $('#pubTabs').innerHTML = tabs.map((k) => {
      const count = k === 'all' ? PUB_KEYS.reduce((s, x) => s + CV.publications[x].length, 0) : CV.publications[k].length;
      return `<button role="tab" type="button" data-tab="${k}" aria-selected="${k === pubTab}">${u('tab_' + k)}<span class="tabs__n">${count}</span></button>`;
    }).join('');
  }

  function renderPubs() {
    const keys = pubTab === 'all' ? PUB_KEYS : [pubTab];
    $('#pubBody').innerHTML = keys.map((k) => {
      const items = CV.publications[k];
      return `
        <div class="pubgroup">
          ${pubTab === 'all' ? `<h4 class="sub__title">${u('tab_' + k)}</h4>` : ''}
          <ol class="pubs">${items.map((it, i) => pubItem(it, i + 1)).join('')}</ol>
        </div>`;
    }).join('');
  }

  function renderProjects() {
    $('#projectList').innerHTML = CV.projects.map((it) => `
      <li class="card${isCurrent(it.p) ? ' card--now' : ''}">
        <div class="card__top">
          <span class="card__funder">${tr(CV.funders[it.f])}</span>
          ${it.code ? `<span class="card__code">${it.code}</span>` : ''}
        </div>
        <div class="card__title">${tr(it.t)}</div>
        <div class="card__meta">
          <span>${tr(CV.roles[it.r])}</span>
          <span class="dot"></span>
          <span>${u('pi')}: ${tr(it.pi)}</span>
          <span class="dot"></span>
          <span class="card__when">${period(it.p)}</span>
        </div>
        ${links(it.l)}
      </li>`).join('');
  }

  function renderTalks() {
    let lastYear = '';
    $('#talkList').innerHTML = CV.talks.map((it) => {
      const y = yearOf(it);
      const yr = y !== lastYear ? `<span class="yr">${y}</span>` : '';
      lastYear = y;
      return `<li class="talk">${yr}${badges(it)}<p class="pub__c">${cite(it.c)}</p>${links(it.l)}</li>`;
    }).join('');
  }

  function renderTeaching() {
    simpleList('#teachList', CV.teaching, {
      pre: (it) => it.code ? `<span class="code">${it.code}</span>` : '',
      sub: (it) => `${tr(it.r)} · ${tr(it.s)}`,
    });
  }

  function renderSkills() {
    $('#skillGrid').innerHTML = CV.skills.map((g) => `
      <div class="skill">
        <div class="skill__area">${tr(g.a)}</div>
        <ul class="chips">${g.i.map((x) => `<li>${tr(x)}</li>`).join('')}</ul>
      </div>`).join('');
  }

  /* Collapsible long lists */
  const expanded = {};
  function applyLimits() {
    $$('[data-limit]').forEach((list) => {
      const limit = +list.dataset.limit;
      const items = [...list.children];
      const id = list.id;
      list.nextElementSibling && list.nextElementSibling.classList.contains('more') && list.nextElementSibling.remove();
      if (items.length <= limit) return;
      const open = !!expanded[id];
      items.forEach((li, i) => li.classList.toggle('is-hidden', !open && i >= limit));
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'more';
      btn.setAttribute('aria-expanded', String(open));
      btn.innerHTML = open
        ? `${u('less')} <i class="fa-solid fa-chevron-up"></i>`
        : `${u('more')} <span class="more__n">+${items.length - limit}</span> <i class="fa-solid fa-chevron-down"></i>`;
      btn.addEventListener('click', () => {
        expanded[id] = !open;
        applyLimits();
        if (open) list.closest('section').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      list.after(btn);
    });
  }

  function renderAll() {
    renderStatic();
    renderNav();
    renderHero();
    renderBio();
    renderEducation();
    simpleList('#nonDegreeList', CV.nonDegree);
    renderWork();
    renderPubTabs();
    renderPubs();
    renderProjects();
    renderTalks();
    renderTeaching();
    simpleList('#exhList', CV.exhibitions);
    simpleList('#awardList', CV.awards);
    simpleList('#memberList', CV.memberships);
    renderSkills();
    simpleList('#certList', CV.certs);
    applyLimits();
    setupSpy();
  }

  /* ───────── language ───────── */
  function setLang(l, push) {
    lang = l;
    root.lang = l;
    try { localStorage.setItem('cv-lang', l); } catch (e) {}
    if (push) {
      const url = new URL(location.href);
      if (l === 'en') url.searchParams.set('lang', 'en'); else url.searchParams.delete('lang');
      history.replaceState(null, '', url);
    }
    renderAll();
  }
  $$('.lang button').forEach((b) => b.addEventListener('click', () => { if (b.dataset.lang !== lang) setLang(b.dataset.lang, true); }));

  $('#pubTabs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]');
    if (!b) return;
    pubTab = b.dataset.tab;
    $$('#pubTabs [data-tab]').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    renderPubs();
  });

  /* ───────── theme ───────── */
  const themeBtn = $('#themeBtn');
  const darkNow = () => root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  const syncThemeIcon = () => { themeBtn.innerHTML = `<i class="fa-solid ${darkNow() ? 'fa-sun' : 'fa-moon'}"></i>`; };
  themeBtn.addEventListener('click', () => {
    const next = darkNow() ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('cv-theme', next); } catch (e) {}
    syncThemeIcon();
  });
  syncThemeIcon();

  $('#printBtn').addEventListener('click', () => window.print());

  /* ───────── mobile menu ───────── */
  const menuBtn = $('#menuBtn');
  menuBtn.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  $('#nav').addEventListener('click', (e) => {
    if (e.target.closest('a')) { document.body.classList.remove('menu-open'); menuBtn.setAttribute('aria-expanded', 'false'); }
  });

  /* ───────── scroll spy ───────── */
  let spy;
  function setupSpy() {
    if (spy) spy.disconnect();
    const navLinks = $$('#nav a');
    spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle('active', a.dataset.target === en.target.id));
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    $$('main section[id]').forEach((s) => spy.observe(s));
  }

  /* ───────── reveal on scroll ───────── */
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const rev = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); rev.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach((el) => rev.observe(el));
  } else {
    $$('.reveal').forEach((el) => el.classList.add('in'));
  }

  /* ───────── progress + to-top ───────── */
  const bar = $('.progress span');
  const toTop = $('#toTop');
  const onScroll = () => {
    const h = document.documentElement;
    const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    bar.style.transform = `scaleX(${p})`;
    toTop.classList.toggle('show', h.scrollTop > 700);
    // At the very bottom the last section can't reach the spy band; highlight it explicitly.
    if (h.scrollTop + h.clientHeight >= h.scrollHeight - 4) {
      const links = $$('#nav a');
      links.forEach((a, i) => a.classList.toggle('active', i === links.length - 1));
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  /* Print: expand everything */
  let tabBeforePrint = null;
  addEventListener('beforeprint', () => {
    if (pubTab !== 'all') { tabBeforePrint = pubTab; pubTab = 'all'; renderPubs(); }
    $$('.is-hidden').forEach((el) => el.classList.add('print-show'));
  });
  addEventListener('afterprint', () => {
    $$('.print-show').forEach((el) => el.classList.remove('print-show'));
    if (tabBeforePrint) { pubTab = tabBeforePrint; tabBeforePrint = null; renderPubs(); }
  });

  $('#year').textContent = new Date().getFullYear();

  renderAll();
  onScroll();
})();
