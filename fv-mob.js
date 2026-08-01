(function () {
  'use strict';

  var overlayDone = false;

  var BASE = 'https://futurevisioncomputersinstitute-oss.github.io/homefuturevision/';

  var CATS = [
    {
      label: 'Development & Agentic AI',
      icon: '&#x1F4BB;',
      courses: [
        ['Python Foundations Program', 'python-foundation/'],
        ['Professional Python Developer', 'professionalpythondeveloper/'],
        ['Advanced Certificate in Python & Agentic AI', 'pythonagentic-ai/'],
        ['C Programming Course', 'c-programming/'],
        ['C++ Programming Course', 'cpp-programming/'],
      ]
    },
    {
      label: 'Analysis & Accounting',
      icon: '&#x1F4CA;',
      courses: [
        ['Advanced Excel & Power BI', 'excel-powerbi/'],
        ['Business Analytics Course', 'business-analytics/'],
        ['Advanced Data Analytics', 'data-analytics/'],
        ['Advanced Certificate in Data Science & Agentic AI', 'data-science/'],
        ['Computer Accounting with GST & Zoho Books', 'advanced-computer-accounting/'],
        ['Professional Business Finance & Accounting', '#'],
        ['Financial Modelling & Analysis', '#'],
      ]
    },
    {
      label: 'Designing & Marketing',
      icon: '&#x1F3A8;',
      courses: [
        ['Basic Graphic Designing Course', '#'],
        ['Graphic Design + AI Course', 'graphic-designing/'],
        ['Advance Graphic Design Course', '#'],
        ['Digital Marketing with Strategies & Business Automation', 'digital-marketing-seo/'],
        ['Advanced Certificate in Digital Design & Marketing with Gen AI', '#'],
        ['Advanced Certificate in Digital Design & Advertisement with Gen AI', '#'],
      ]
    },
    {
      label: 'Foundation Programs',
      icon: '&#x1F4BC;',
      courses: [
        ['Computer Basics & Gen AI Foundation', 'computer-basics-genai/'],
        ['Professional Office & Generative AI Essentials', 'professional-office-genai/'],
      ]
    },
    {
      label: 'Professional Courses',
      icon: '&#x1F393;',
      courses: [
        ['Advanced Data Analytics', 'data-analytics/'],
        ['Advanced Certificate in Data Science & Agentic AI', 'data-science/'],
        ['Advanced Certificate in Python & Agentic AI', 'pythonagentic-ai/'],
        ['Advance Graphic Design Course', '#'],
        ['Digital Marketing with Strategies & Business Automation', 'digital-marketing-seo/'],
        ['Advanced Certificate in Digital Design & Marketing with Gen AI', '#'],
        ['Advanced Certificate in Digital Design & Advertisement with Gen AI', '#'],
      ]
    },
  ];

  var CHEVRON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';

  function courseHref(path) {
    return path === '#' ? '#' : (BASE + path);
  }

  function injectCSS() {
    if (document.getElementById('fv-mob-css')) return;
    var s = document.createElement('style');
    s.id = 'fv-mob-css';
    s.textContent = [
      '*{box-sizing:border-box;}',
      'body{overflow-x:clip;}',
      'div[style*="overflow-x:hidden"]{overflow-x:clip!important;}',
      'img{max-width:100%;height:auto;}',
      'header img{max-width:160px!important;height:auto!important;max-height:50px!important;}',
      '#fv-ham{display:none;flex-direction:column;justify-content:space-between;width:28px;height:20px;background:none;border:none;cursor:pointer;padding:0;flex-shrink:0;z-index:100;}',
      '#fv-ham span{display:block;height:2.5px;background:#163d6d;border-radius:2px;transition:transform .3s,opacity .3s;}',
      '#fv-ham.open span:nth-child(1){transform:translateY(8.75px) rotate(45deg);}',
      '#fv-ham.open span:nth-child(2){opacity:0;}',
      '#fv-ham.open span:nth-child(3){transform:translateY(-8.75px) rotate(-45deg);}',
      '@media(max-width:900px){#fv-ham{display:flex!important;position:absolute!important;left:16px!important;top:50%!important;transform:translateY(-50%)!important;}.hp-navlinks>div:not(:last-child),[class*="navlinks"]>a{display:none!important;}header nav{display:none!important;}header{padding:0!important;position:sticky!important;top:0!important;z-index:1000!important;background:#fff!important;}header a[href^="tel:"],header [class*="enrol"]{display:none!important;}[class*="hdr-inner"],header>div{justify-content:center!important;position:relative!important;gap:0!important;}}',
      '@media(min-width:769px){#reviews .hp-rev-track>div{flex:0 0 380px!important;width:380px!important;max-width:380px!important;}}',
      '@media(min-width:769px) and (max-width:1024px){#top>div{flex-wrap:wrap!important;}#top>div>div{flex:1 1 100%!important;max-width:100%!important;width:100%!important;}#top>div>div:last-child{margin-top:8px!important;}}',
      '@media(max-width:768px){.hp-why-grid{grid-template-columns:repeat(2,1fr)!important;gap:10px!important;}#why{padding:20px 14px!important;}.hp-why-grid>div{padding:16px 12px!important;border-radius:12px!important;}.hp-why-grid>div>div:first-child{width:36px!important;height:36px!important;border-radius:9px!important;font-size:14px!important;}.hp-why-grid>div>div:nth-child(2){font-size:14.5px!important;margin-top:12px!important;}.hp-why-grid>div>p{font-size:12px!important;margin-top:6px!important;line-height:1.45!important;}}',
      '@media(max-width:768px){section{padding-left:16px!important;padding-right:16px!important;}h1{font-size:clamp(1.4rem,5vw,2.2rem)!important;}h2{font-size:clamp(1.2rem,4vw,1.8rem)!important;}footer{padding:24px 16px!important;}footer [style*="justify-content: space-between"],footer [style*="justify-content:space-between"]{justify-content:center!important;}footer .fv-ftr-logo{width:100%!important;justify-content:center!important;}footer .fv-ftr-copywrap{display:contents!important;}footer .fv-ftr-loc{width:100%!important;order:1!important;}footer .fv-ftr-icons{width:100%!important;justify-content:center!important;order:2!important;}footer .fv-ftr-copy{width:100%!important;order:3!important;}}',
      '@media(max-width:768px){.fv-hero-btns{flex-wrap:nowrap!important;justify-content:center!important;gap:8px!important;}.fv-hero-btns>a{flex:0 1 auto!important;min-width:0!important;text-align:center!important;padding:13px 10px!important;font-size:12.5px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;}}',
      '@media(max-width:768px){#reviews .hp-rev-track{display:grid!important;grid-auto-flow:column!important;grid-template-rows:repeat(2,auto)!important;grid-auto-columns:calc(100vw - 32px)!important;gap:14px!important;overflow-x:auto!important;overflow-y:hidden!important;scroll-snap-type:x mandatory!important;-webkit-overflow-scrolling:touch!important;scrollbar-width:none!important;}#reviews .hp-rev-track::-webkit-scrollbar{display:none!important;height:0!important;}#reviews .hp-rev-track>div{width:calc(100vw - 32px)!important;max-width:calc(100vw - 32px)!important;padding:18px!important;border-radius:14px!important;scroll-snap-align:start!important;}#reviews .hp-rev-track [style*="flex:1;"]{min-width:0!important;}#reviews .hp-rev-track [style*="font-weight:700; font-size:14.5px"]{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;}#reviews .hp-rev-track [style*="font-size:11px; color:var(--c-muted)"]{white-space:nowrap!important;}#reviews .hp-rev-track p{font-size:13px!important;line-height:1.55!important;margin-top:10px!important;display:-webkit-box!important;-webkit-box-orient:vertical!important;-webkit-line-clamp:3!important;overflow:hidden!important;}}',
      '#fv-mob{display:none;position:fixed;inset:0;z-index:99999;}',
      '#fv-mob.open{display:block;}',
      '#fv-mob-bg{position:absolute;inset:0;background:rgba(0,0,0,.45);}',
      '#fv-mob-panel{position:absolute;top:0;left:0;width:min(320px,88vw);height:100%;background:#fff;overflow-y:auto;display:flex;flex-direction:column;box-shadow:4px 0 40px rgba(0,0,0,.15);}',
      '.fv-mh{padding:18px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #dde6f2;position:sticky;top:0;background:#fff;z-index:2;}',
      '.fv-mx{background:none;border:none;cursor:pointer;font-size:28px;color:#44546b;line-height:1;padding:0;}',
      '.fv-ml{padding:12px 8px;display:flex;flex-direction:column;gap:2px;flex:1;}',
      '.fv-ml>a{display:block;padding:12px 14px;color:#122f54;font-weight:600;font-size:15px;text-decoration:none;border-radius:10px;}',
      '.fv-ml>a:hover{background:#f4f8fd;}',
      '.fv-cat-wrap{border-radius:10px;overflow:hidden;margin-bottom:2px;}',
      '.fv-cat-hdr{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;cursor:pointer;width:100%;background:none;border:none;font-family:inherit;font-weight:700;font-size:14.5px;color:#122f54;text-align:left;border-radius:10px;gap:8px;}',
      '.fv-cat-hdr:hover{background:#f0f4ff;}',
      '.fv-cat-hdr-left{display:flex;align-items:center;gap:10px;}',
      '.fv-cat-hdr-icon{font-size:16px;line-height:1;}',
      '.fv-cat-chev{transition:transform .25s;flex-shrink:0;color:#8a9bb0;}',
      '.fv-cat-hdr.open .fv-cat-chev{transform:rotate(180deg);}',
      '.fv-cat-links{display:none;padding:4px 0 8px;}',
      '.fv-cat-links.open{display:block;}',
      '.fv-cat-links a{display:block;padding:10px 14px 10px 40px;color:#1d3a6b;font-weight:500;font-size:14px;text-decoration:none;border-radius:8px;}',
      '.fv-cat-links a:hover{background:#f0f4ff;}',
      '.fv-divider{height:1px;background:#eef1f8;margin:8px 14px;}',
      '.fv-ml .fv-phone-link{display:flex;align-items:center;gap:8px;padding:12px 14px;color:#163d6d;font-weight:600;font-size:15px;text-decoration:none;border-radius:10px;}',
      '.fv-ml .fv-phone-link:hover{background:#f4f8fd;}',
      '.fv-mc{margin:12px 16px 20px;background:#163d6d;color:#fff;font-weight:700;font-size:15px;padding:15px;border-radius:10px;text-align:center;text-decoration:none;display:block;}',
      '.fv-mc:hover{background:#0f2747;}',
    ].join('');
    (document.head || document.documentElement).appendChild(s);
  }

  function buildCategoryHTML() {
    var html = '';

    // Courses heading
    html += '<div style="padding:8px 14px 4px;font-size:11px;font-weight:700;letter-spacing:.08em;color:#8a9bb0;text-transform:uppercase;">Courses</div>';

    CATS.forEach(function(cat, ci) {
      var id = 'fv-cat-' + ci;
      html += '<div class="fv-cat-wrap">';
      html += '<button class="fv-cat-hdr" data-cat="' + id + '" aria-expanded="false">';
      html += '<span class="fv-cat-hdr-left">' + cat.label + '</span>';
      html += '<span class="fv-cat-chev">' + CHEVRON + '</span>';
      html += '</button>';
      html += '<div class="fv-cat-links" id="' + id + '">';
      cat.courses.forEach(function(c) {
        html += '<a href="' + courseHref(c[1]) + '">' + c[0] + '</a>';
      });
      html += '</div>';
      html += '</div>';
    });

    return html;
  }

  function buildNavLinks(hdr) {
    var html = '<div class="fv-divider"></div>';
    var navlinksEl = hdr.querySelector('[class*="navlinks"]') || hdr.querySelector('nav');
    if (!navlinksEl) return html;

    var seen = {};
    var skip = ['#courses', '#enquiry'];
    navlinksEl.querySelectorAll('a').forEach(function(a) {
      var txt = (a.textContent || '').trim().replace(/\s+/g, ' ');
      var href = a.getAttribute('href') || '#';
      if (!txt || txt.length > 40 || seen[href] || skip.indexOf(href) > -1) return;
      // skip course dropdown links (they go in categories above)
      if (a.closest('[class*="dd"]') || a.closest('[class*="dropdown"]') || a.closest('#fv-dd-main')) return;
      seen[href] = true;
      html += '<a href="' + href + '">' + txt + '</a>';
    });

    var phoneA = hdr.querySelector('a[href^="tel:"]');
    if (phoneA) {
      html += '<a href="' + phoneA.getAttribute('href') + '" class="fv-phone-link">';
      html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11.4 11.4 0 0 0 3.6.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .58 3.6 1 1 0 0 1-.24 1z"/></svg>';
      html += (phoneA.textContent || '').trim().replace(/\s+/g, ' ');
      html += '</a>';
    }

    return html;
  }

  function wireAccordion(overlay) {
    overlay.querySelectorAll('.fv-cat-hdr').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = btn.getAttribute('data-cat');
        var panel = document.getElementById(id);
        if (!panel) return;
        var isOpen = panel.classList.contains('open');
        // close all
        overlay.querySelectorAll('.fv-cat-links').forEach(function(p) { p.classList.remove('open'); });
        overlay.querySelectorAll('.fv-cat-hdr').forEach(function(b) { b.classList.remove('open'); b.setAttribute('aria-expanded','false'); });
        // open clicked (toggle)
        if (!isOpen) {
          panel.classList.add('open');
          btn.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  function buildOverlay(logoSrc, hdr) {
    if (document.getElementById('fv-mob')) return;
    var overlay = document.createElement('div');
    overlay.id = 'fv-mob';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Mobile navigation');
    overlay.innerHTML =
      '<div id="fv-mob-bg"></div>' +
      '<div id="fv-mob-panel">' +
        '<div class="fv-mh">' +
          (logoSrc ? '<img src="' + logoSrc + '" alt="Future Vision" style="height:36px;width:auto;">' :
            '<strong style="color:#163d6d;font-size:15px;">Future Vision</strong>') +
          '<button class="fv-mx" id="fv-mob-x" aria-label="Close menu">&#x2715;</button>' +
        '</div>' +
        '<div class="fv-ml" id="fv-mob-links">' +
          buildCategoryHTML() +
          buildNavLinks(hdr) +
        '</div>' +
        '<a href="#enquiry" class="fv-mc">Enrol Now &#x2192;</a>' +
      '</div>';
    (document.body || document.documentElement).appendChild(overlay);

    wireAccordion(overlay);

    function toggle(open) {
      overlay.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      var h = document.getElementById('fv-ham');
      if (h) { h.classList.toggle('open', open); h.setAttribute('aria-expanded', open ? 'true' : 'false'); }
    }

    document.getElementById('fv-mob-bg').addEventListener('click', function() { toggle(false); });
    document.getElementById('fv-mob-x').addEventListener('click', function() { toggle(false); });
    overlay.querySelectorAll('.fv-cat-links a, .fv-mc').forEach(function(a) {
      a.addEventListener('click', function() { toggle(false); });
    });
    overlay.querySelectorAll('.fv-ml > a').forEach(function(a) {
      a.addEventListener('click', function() { toggle(false); });
    });
  }

  function addHam(hdr, logoImg) {
    if (document.getElementById('fv-ham')) return;
    var ham = document.createElement('button');
    ham.id = 'fv-ham';
    ham.type = 'button';
    ham.setAttribute('aria-label', 'Open menu');
    ham.setAttribute('aria-expanded', 'false');
    ham.innerHTML = '<span></span><span></span><span></span>';
    ham.addEventListener('click', function() {
      var overlay = document.getElementById('fv-mob');
      if (!overlay) return;
      var open = !overlay.classList.contains('open');
      overlay.classList.toggle('open', open);
      ham.classList.toggle('open', open);
      ham.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    var logoAnchor = logoImg.closest('a') || logoImg.parentElement;
    var parent = (logoAnchor && logoAnchor.parentElement) || hdr;
    if (logoAnchor && parent) {
      parent.insertBefore(ham, logoAnchor);
    } else {
      hdr.insertBefore(ham, hdr.firstChild);
    }
  }

  function initReviewCarousels() {
    if (!window.matchMedia || !window.matchMedia('(max-width:768px)').matches) return;
    document.querySelectorAll('#reviews .hp-rev-track').forEach(function(track) {
      if (track.dataset.fvAuto) return;
      track.dataset.fvAuto = '1';

      var paused = false, resumeTimer;
      function pause() {
        paused = true;
        clearTimeout(resumeTimer);
        resumeTimer = setTimeout(function() { paused = false; }, 5000);
      }
      track.addEventListener('touchstart', pause, { passive: true });
      track.addEventListener('wheel', pause, { passive: true });
      track.addEventListener('mousedown', pause);

      setInterval(function() {
        if (paused || !track.isConnected) return;
        var card = track.children[0];
        if (!card) return;
        var step = card.getBoundingClientRect().width + 14;
        var maxScroll = track.scrollWidth - track.clientWidth;
        if (track.scrollLeft >= maxScroll - 4) {
          track.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          track.scrollBy({ left: step, behavior: 'smooth' });
        }
      }, 3500);
    });
  }

  var CAT_KEYS = ['dev', 'ana', 'des', 'dig', 'pro'];

  function ensureDesktopSlots(dd) {
    var left = dd.querySelector('.fv-dd-left');
    var right = dd.querySelector('.fv-dd-right');
    if (!left || !right) return;

    var refBtn = document.getElementById('fvcat-' + CAT_KEYS[0]);
    var refPanel = document.getElementById('fvpanel-' + CAT_KEYS[0]);
    if (!refBtn || !refPanel) return;

    CAT_KEYS.forEach(function(key) {
      if (!document.getElementById('fvcat-' + key)) {
        var btn = refBtn.cloneNode(true);
        btn.id = 'fvcat-' + key;
        btn.classList.remove('active');
        btn.addEventListener('mouseenter', function() {
          if (window.fvSetCat) window.fvSetCat(key);
        });
        left.appendChild(btn);
      }
      if (!document.getElementById('fvpanel-' + key)) {
        var panel = refPanel.cloneNode(true);
        panel.id = 'fvpanel-' + key;
        panel.style.display = 'none';
        right.appendChild(panel);
      }
    });
  }

  function buildDesktopDropdown() {
    var dd = document.getElementById('fv-dd-main');
    if (!dd || dd.dataset.fvSynced) return;
    dd.dataset.fvSynced = '1';

    ensureDesktopSlots(dd);

    CATS.forEach(function(cat, i) {
      var key = CAT_KEYS[i];
      if (!key) return;

      var catBtn = document.getElementById('fvcat-' + key);
      if (catBtn) {
        var svg = catBtn.querySelector('svg');
        catBtn.textContent = cat.label + ' ';
        if (svg) catBtn.appendChild(svg);
      }

      var panel = document.getElementById('fvpanel-' + key);
      if (panel) {
        var rtitle = panel.querySelector('.fv-dd-rtitle');
        if (rtitle) rtitle.textContent = cat.label;
        var grid = panel.querySelector('.fv-dd-grid');
        if (grid) {
          grid.innerHTML = cat.courses.map(function(c) {
            return '<a class="fv-dd-course" href="' + courseHref(c[1]) + '"><span>' + c[0] + '<\/span><\/a>';
          }).join('');
        }
      }
    });
  }

  function tagHeroButtons() {
    var a = document.querySelector('a[href="#courses"]');
    var b = document.querySelector('a[href="#enquiry"]');
    if (a && b && a.parentElement && a.parentElement === b.parentElement) {
      a.parentElement.classList.add('fv-hero-btns');
    }
  }

  function tagWhoCanJoin() {
    var divs = document.querySelectorAll('section div');
    for (var i = 0; i < divs.length; i++) {
      var txt = (divs[i].textContent || '').trim();
      if (txt === 'Who Can Join') {
        var sec = divs[i].closest('section');
        if (sec) sec.classList.add('fv-join-sec');
        break;
      }
    }
  }

  var HERO_CENTER_PAGES = ['/homefuturevision/computer-basics-genai/', '/homefuturevision/professional-office-genai/'];

  function injectHeroCenterCSS() {
    if (document.getElementById('fv-hero-center-css')) return;
    if (HERO_CENTER_PAGES.indexOf(location.pathname) === -1) return;
    var s = document.createElement('style');
    s.id = 'fv-hero-center-css';
    s.textContent = '@media(max-width:768px){' +
      '#top>div>div:first-child{text-align:center!important;}' +
      '#top>div>div:first-child>div:nth-of-type(2){justify-content:center!important;}' +
      '#top>div>div:first-child>div:nth-of-type(3){display:grid!important;grid-template-columns:repeat(2,1fr)!important;gap:10px!important;}' +
      '#top>div>div:first-child>div:nth-of-type(4){justify-content:center!important;}' +
      '#top+section>div>div>div:last-child{grid-column:1/-1!important;border-right:none!important;}' +
      '#top+section+section>div>div:nth-of-type(2){display:flex!important;flex-direction:column!important;}' +
      '#why>div>div:nth-of-type(2){display:grid!important;grid-template-columns:repeat(2,1fr)!important;gap:10px!important;}' +
      '#why>div>div:nth-of-type(2)>div{flex-direction:column!important;align-items:center!important;text-align:center!important;padding:18px 12px!important;}' +
      '#why>div>div:nth-of-type(2)>div>span{margin:0 0 8px!important;}' +
      '.fv-join-sec>div>div:nth-of-type(2){display:grid!important;grid-template-columns:repeat(2,1fr)!important;gap:10px!important;}' +
      '.fv-join-sec>div>div:nth-of-type(2)>div{text-align:center!important;padding:18px 14px!important;}' +
      '.fv-join-sec>div>div:nth-of-type(2)>div>div:first-child{margin:0 auto!important;}' +
      '.fv-join-sec>div>div:nth-of-type(2)>div:nth-child(odd):last-child{grid-column:1/-1!important;}' +
      '}';
    (document.head || document.documentElement).appendChild(s);
  }

  var SERVICES_URL = BASE + 'services/';

  function addServicesLink(hdr) {
    var navEl = hdr.querySelector('[class*="navlinks"]') || hdr.querySelector('nav');
    if (!navEl || navEl.dataset.fvSvc) return;
    navEl.dataset.fvSvc = '1';
    if (navEl.querySelector('a[href="' + SERVICES_URL + '"]')) return;
    var links = navEl.querySelectorAll(':scope > a');
    var ref = links.length ? links[links.length - 1] : null;
    var a = document.createElement('a');
    a.href = SERVICES_URL;
    a.textContent = 'Services';
    if (ref) {
      if (ref.className) a.className = ref.className;
      if (ref.getAttribute('style')) a.setAttribute('style', ref.getAttribute('style'));
      ref.parentNode.insertBefore(a, ref.nextSibling);
    } else {
      navEl.appendChild(a);
    }
  }

  var SUBNAV_LABELS = {
    top: 'Overview',
    why: 'Why This Course',
    playground: 'Live Playground',
    curriculum: 'Curriculum',
    course: 'Courses',
    tracks: 'Pricing',
    toolkit: 'Toolkit',
    projects: 'Projects',
    faculty: 'Faculty',
    mentor: 'Mentors',
    faq: 'FAQs',
    fees: 'Fees',
    pricing: 'Pricing',
    services: 'Services',
    enquiry: 'Enquiry',
  };

  var HOME_PATHS = ['/homefuturevision/', '/'];

  function subNavLabel(id) {
    if (SUBNAV_LABELS[id]) return SUBNAV_LABELS[id];
    return id.replace(/[-_]/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function injectSubNavCSS() {
    if (document.getElementById('fv-subnav-css')) return;
    var s = document.createElement('style');
    s.id = 'fv-subnav-css';
    s.textContent = [
      '#fv-subnav{position:fixed;left:0;right:0;z-index:45;background:#fff;border-bottom:1px solid #e2e9f1;box-shadow:0 6px 18px rgba(11,27,58,.08);transform:translateY(-110%);transition:transform .28s ease;visibility:hidden;}',
      '#fv-subnav.fv-show{visibility:visible;}',
      '#fv-subnav.fv-show{transform:translateY(0);}',
      '#fv-subnav-inner{display:flex;align-items:center;gap:4px;max-width:1200px;margin:0 auto;padding:0 16px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;}',
      '#fv-subnav-inner::-webkit-scrollbar{display:none;height:0;}',
      '#fv-subnav a{flex-shrink:0;display:inline-block;padding:13px 16px;font-size:13.5px;font-weight:700;color:#44546b;text-decoration:none;white-space:nowrap;border-bottom:2.5px solid transparent;}',
      '#fv-subnav a.fv-active{color:#163d6d;border-bottom-color:#163d6d;}',
      '#fv-subnav a:hover{color:#163d6d;}',
    ].join('');
    (document.head || document.documentElement).appendChild(s);
  }

  var subNavBuilt = false;
  var subNavLinks = [];
  var subNavHeaderH = 0;
  var subNavRecalc = null;

  function buildSubNav(hdr) {
    if (subNavBuilt) return;
    if (HOME_PATHS.indexOf(location.pathname) !== -1) { subNavBuilt = true; return; }

    var sections = Array.prototype.filter.call(
      document.querySelectorAll('section[id]'),
      function (sec) { return sec.closest('header') === null; }
    );
    if (sections.length < 3) { subNavBuilt = true; return; }

    subNavBuilt = true;
    injectSubNavCSS();

    var nav = document.createElement('div');
    nav.id = 'fv-subnav';
    var inner = document.createElement('div');
    inner.id = 'fv-subnav-inner';
    nav.appendChild(inner);

    sections.forEach(function (sec) {
      var id = sec.id;
      var a = document.createElement('a');
      a.href = '#' + id;
      a.textContent = subNavLabel(id);
      a.addEventListener('click', function (ev) {
        ev.preventDefault();
        var offset = (document.querySelector('header') || {}).offsetHeight || 0;
        offset += nav.offsetHeight;
        var top = sec.getBoundingClientRect().top + window.pageYOffset - offset - 10;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
      inner.appendChild(a);
      subNavLinks.push({ id: id, el: sec, link: a });
    });

    (document.body || document.documentElement).appendChild(nav);

    var heroSec = sections[0];

    function positionAndToggle() {
      var liveHdr = document.querySelector('header');
      var hdrBottom = liveHdr ? Math.max(liveHdr.getBoundingClientRect().bottom, 0) : 0;
      subNavHeaderH = hdrBottom;
      nav.style.top = hdrBottom + 'px';
      var heroBottom = heroSec.getBoundingClientRect().bottom;
      if (heroBottom < hdrBottom + 10) {
        nav.classList.add('fv-show');
      } else {
        nav.classList.remove('fv-show');
      }
    }

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { positionAndToggle(); ticking = false; });
    }, { passive: true });
    window.addEventListener('resize', positionAndToggle);
    positionAndToggle();
    subNavRecalc = positionAndToggle;

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var match = subNavLinks.filter(function (l) { return l.el === entry.target; })[0];
          if (!match) return;
          if (entry.isIntersecting) {
            subNavLinks.forEach(function (l) { l.link.classList.remove('fv-active'); });
            match.link.classList.add('fv-active');
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
      sections.forEach(function (sec) { io.observe(sec); });
    }
  }

  function tick() {
    injectCSS();
    injectHeroCenterCSS();
    initReviewCarousels();
    tagHeroButtons();
    if (HERO_CENTER_PAGES.indexOf(location.pathname) !== -1) tagWhoCanJoin();
    var hdr = document.querySelector('header');
    if (!hdr) return;
    buildSubNav(hdr);
    if (subNavRecalc) subNavRecalc();

    addServicesLink(hdr);

    var logoImg = hdr.querySelector('img');

    if (!overlayDone) {
      var nav = hdr.querySelector('nav');
      var navEl = hdr.querySelector('[class*="navlinks"]') || nav;
      var hasLinks = navEl && navEl.querySelectorAll('a').length > 0;
      if (nav && logoImg && logoImg.src && hasLinks) {
        overlayDone = true;
        buildOverlay(logoImg.src, hdr);
      }
    }

    buildDesktopDropdown();

    if (logoImg) addHam(hdr, logoImg);
  }

  var count = 0;
  var fast = setInterval(function() {
    tick();
    count++;
    if (count >= 25) {
      clearInterval(fast);
      setInterval(tick, 2000);
    }
  }, 200);
})();
