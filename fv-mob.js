(function () {
  'use strict';

  var overlayDone = false;

  var BASE = 'https://futurevisioncomputersinstitute-oss.github.io/homefuturevision/';

  var CATS = [
    {
      label: 'Development',
      icon: '&#x1F4BB;',
      courses: [
        ['Python Foundations Program', 'python-foundation/'],
        ['Professional Python Developer', 'python/'],
        ['Python & Agentic AI', 'agentic-ai/'],
        ['C Programming Course', 'c-programming/'],
        ['C++ Programming Course', 'cpp-programming/'],
      ]
    },
    {
      label: 'Analysis & Accounting',
      icon: '&#x1F4CA;',
      courses: [
        ['Advanced Excel Course', 'advanced-excel/'],
        ['Microsoft Power BI Course', 'power-bi/'],
        ['Advanced Excel & Power BI', 'excel-powerbi/'],
        ['Business Analytics Course', 'business-analytics/'],
        ['Advanced Data Analytics', 'data-analytics/'],
        ['Data Science & Agentic AI', 'data-science/'],
        ['Tally Prime with GST', 'tally-prime-gst/'],
        ['Computer Accounting & GST', 'advanced-computer-accounting/'],
      ]
    },
    {
      label: 'Designing & Media',
      icon: '&#x1F3A8;',
      courses: [
        ['Graphic Design + AI Course', 'graphic-designing/'],
        ['Digital Marketing & SEO', 'digital-marketing-seo/'],
      ]
    },
    {
      label: 'Digital Business & Office',
      icon: '&#x1F4BC;',
      courses: [
        ['Computer Basics & Gen AI', 'computer-basics-genai/'],
        ['Professional Office & Gen AI', 'professional-office-genai/'],
      ]
    },
  ];

  var CHEVRON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';

  function injectCSS() {
    if (document.getElementById('fv-mob-css')) return;
    var s = document.createElement('style');
    s.id = 'fv-mob-css';
    s.textContent = [
      '*{box-sizing:border-box;}',
      'body{overflow-x:clip;}',
      'img{max-width:100%;height:auto;}',
      'header img{max-width:160px!important;height:auto!important;max-height:50px!important;}',
      '#fv-ham{display:none;flex-direction:column;justify-content:space-between;width:28px;height:20px;background:none;border:none;cursor:pointer;padding:0;flex-shrink:0;z-index:100;}',
      '#fv-ham span{display:block;height:2.5px;background:#163d6d;border-radius:2px;transition:transform .3s,opacity .3s;}',
      '#fv-ham.open span:nth-child(1){transform:translateY(8.75px) rotate(45deg);}',
      '#fv-ham.open span:nth-child(2){opacity:0;}',
      '#fv-ham.open span:nth-child(3){transform:translateY(-8.75px) rotate(-45deg);}',
      '@media(max-width:900px){#fv-ham{display:flex!important;position:absolute!important;left:16px!important;top:50%!important;transform:translateY(-50%)!important;}.hp-navlinks>div:not(:last-child),[class*="navlinks"]>a{display:none!important;}header nav{display:none!important;}header{padding:0!important;position:sticky!important;top:0!important;z-index:1000!important;background:#fff!important;}header a[href^="tel:"],header [class*="enrol"]{display:none!important;}[class*="hdr-inner"],header>div{justify-content:center!important;position:relative!important;gap:0!important;}}',
      '@media(max-width:768px){[class*="rev-track"],[class*="revtrack"]{display:flex!important;flex-direction:column!important;gap:16px!important;overflow-x:visible!important;}[class*="rev-track"]>*,[class*="revtrack"]>*{flex:0 0 auto!important;width:100%!important;max-width:100%!important;}[style*="flex: 0 0 420px"],[style*="flex:0 0 420px"]{flex:0 0 100%!important;width:100%!important;}[style*="max-width: 420px"],[style*="max-width:420px"]{max-width:100%!important;}section{padding-left:16px!important;padding-right:16px!important;}h1{font-size:clamp(1.4rem,5vw,2.2rem)!important;}h2{font-size:clamp(1.2rem,4vw,1.8rem)!important;}footer{padding:24px 16px!important;}footer [style*="justify-content: space-between"],footer [style*="justify-content:space-between"]{justify-content:center!important;}}',
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
        html += '<a href="' + BASE + c[1] + '">' + c[0] + '</a>';
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

  function tick() {
    injectCSS();
    var hdr = document.querySelector('header');
    if (!hdr) return;

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
