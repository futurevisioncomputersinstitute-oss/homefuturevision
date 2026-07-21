(function () {
  'use strict';

  var overlayDone = false;

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
      '@media(max-width:900px){#fv-ham{display:flex!important;}.hp-navlinks>div:not(:last-child),[class*="navlinks"]>a{display:none!important;}header nav{display:flex!important;align-items:center!important;justify-content:space-between!important;padding:0 16px!important;width:100%!important;}header{padding:0!important;position:sticky!important;top:0!important;z-index:1000!important;background:#fff!important;}header a[href^="tel:"],header [class*="enrol"]{display:none!important;}}',
      '@media(max-width:768px){[class*="rev-track"],[class*="revtrack"]{display:flex!important;flex-direction:column!important;gap:16px!important;overflow-x:visible!important;}[class*="rev-track"]>*,[class*="revtrack"]>*{flex:0 0 auto!important;width:100%!important;max-width:100%!important;}[style*="flex: 0 0 420px"],[style*="flex:0 0 420px"]{flex:0 0 100%!important;width:100%!important;}[style*="max-width: 420px"],[style*="max-width:420px"]{max-width:100%!important;}section{padding-left:16px!important;padding-right:16px!important;}h1{font-size:clamp(1.4rem,5vw,2.2rem)!important;}h2{font-size:clamp(1.2rem,4vw,1.8rem)!important;}footer{padding:24px 16px!important;}}',
      '#fv-mob{display:none;position:fixed;inset:0;z-index:99999;}',
      '#fv-mob.open{display:block;}',
      '#fv-mob-bg{position:absolute;inset:0;background:rgba(0,0,0,.45);}',
      '#fv-mob-panel{position:absolute;top:0;right:0;width:min(300px,85vw);height:100%;background:#fff;overflow-y:auto;display:flex;flex-direction:column;box-shadow:-4px 0 40px rgba(0,0,0,.15);}',
      '.fv-mh{padding:18px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #dde6f2;}',
      '.fv-mx{background:none;border:none;cursor:pointer;font-size:28px;color:#44546b;line-height:1;padding:0;}',
      '.fv-ml{padding:16px;display:flex;flex-direction:column;gap:2px;flex:1;}',
      '.fv-ml a{display:block;padding:13px 16px;color:#122f54;font-weight:600;font-size:15px;text-decoration:none;border-radius:10px;}',
      '.fv-ml a:hover,.fv-ml a:focus{background:#f4f8fd;}',
      '.fv-ml .fv-sub{padding-left:28px;font-weight:500;font-size:14px;color:#2a5298;}',
      '.fv-ml .fv-section-label{padding:10px 16px 4px;font-size:11px;font-weight:700;letter-spacing:.08em;color:#8a9bb0;text-transform:uppercase;}',
      '.fv-mc{margin:16px;background:#163d6d;color:#fff;font-weight:700;font-size:15px;padding:15px;border-radius:10px;text-align:center;text-decoration:none;display:block;}'
    ].join('');
    (document.head || document.documentElement).appendChild(s);
  }

  function buildOverlay(logoSrc, links) {
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
        '<div class="fv-ml" id="fv-mob-links">' + links + '</div>' +
        '<a href="#enquiry" class="fv-mc">Enrol Now &#x2192;</a>' +
      '</div>';
    (document.body || document.documentElement).appendChild(overlay);

    function toggle(open) {
      overlay.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      var h = document.getElementById('fv-ham');
      if (h) { h.classList.toggle('open', open); h.setAttribute('aria-expanded', open ? 'true' : 'false'); }
    }

    document.getElementById('fv-mob-bg').addEventListener('click', function() { toggle(false); });
    document.getElementById('fv-mob-x').addEventListener('click', function() { toggle(false); });
    overlay.querySelectorAll('.fv-ml a, .fv-mc').forEach(function(a) {
      a.addEventListener('click', function() { toggle(false); });
    });
  }

  function buildLinks(hdr) {
    var links = '';
    var navlinksEl = hdr.querySelector('[class*="navlinks"]') || hdr.querySelector('nav');
    if (!navlinksEl) return links;

    var seen = {};
    navlinksEl.querySelectorAll('a').forEach(function(a) {
      var txt = (a.textContent || '').trim().replace(/\s+/g, ' ');
      var href = a.getAttribute('href') || '#';
      if (!txt || txt.length > 40 || seen[href]) return;
      seen[href] = true;
      if (href === '#courses') {
        links += '<span class="fv-section-label">Courses</span>';
        var courses = [
          ['Python Programming', 'python/'],
          ['Python Foundation', 'python-foundation/'],
          ['Data Science & ML', 'data-science/'],
          ['Data Analytics', 'data-analytics/'],
          ['Power BI', 'power-bi/'],
          ['Advanced Excel', 'advanced-excel/'],
          ['C Programming', 'c-programming/'],
          ['C++ Programming', 'cpp-programming/'],
          ['Graphic Designing', 'graphic-designing/'],
          ['Tally Prime & GST', 'tally-prime-gst/'],
          ['Digital Marketing', 'digital-marketing-seo/'],
          ['Business Analytics', 'business-analytics/'],
          ['Agentic AI', 'agentic-ai/'],
        ];
        courses.forEach(function(c) {
          links += '<a href="' + c[1] + '" class="fv-sub">' + c[0] + '</a>';
        });
      } else {
        links += '<a href="' + href + '">' + txt + '</a>';
      }
    });

    var phoneA = hdr.querySelector('a[href^="tel:"]');
    if (phoneA && !seen[phoneA.getAttribute('href')]) {
      links += '<a href="' + phoneA.getAttribute('href') + '">&#x260E; ' + (phoneA.textContent || '').trim() + '</a>';
    }
    return links;
  }

  function addHamToNav(nav) {
    if (document.getElementById('fv-ham')) return;
    var ham = document.createElement('button');
    ham.id = 'fv-ham';
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
    nav.appendChild(ham);
  }

  function tick() {
    injectCSS();
    var hdr = document.querySelector('header');
    if (!hdr) return;

    if (!overlayDone) {
      var nav = hdr.querySelector('nav');
      var logoImg = hdr.querySelector('img');
      var navEl = hdr.querySelector('[class*="navlinks"]') || nav;
      var hasLinks = navEl && navEl.querySelectorAll('a').length > 0;
      if (nav && logoImg && logoImg.src && hasLinks) {
        overlayDone = true;
        buildOverlay(logoImg.src, buildLinks(hdr));
      }
    }

    var nav2 = hdr.querySelector('nav');
    if (nav2) addHamToNav(nav2);
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