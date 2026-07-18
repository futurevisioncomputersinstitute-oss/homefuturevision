(function () {
  'use strict';

  var overlayDone = false;

  function injectCSS() {
    if (document.getElementById('fv-mob-css')) return;
    var s = document.createElement('style');
    s.id = 'fv-mob-css';
    s.textContent = [
      /* logo fix */
      'header img{max-width:160px!important;height:auto!important;max-height:50px!important;}',
      /* hamburger — hidden on desktop, visible on mobile */
      '#fv-ham{display:none;flex-direction:column;justify-content:space-between;',
        'width:28px;height:20px;background:none;border:none;cursor:pointer;padding:0;flex-shrink:0;}',
      '#fv-ham span{display:block;height:2.5px;background:#163d6d;border-radius:2px;transition:transform .3s,opacity .3s;}',
      '#fv-ham.open span:nth-child(1){transform:translateY(8.75px) rotate(45deg);}',
      '#fv-ham.open span:nth-child(2){opacity:0;}',
      '#fv-ham.open span:nth-child(3){transform:translateY(-8.75px) rotate(-45deg);}',
      '@media(max-width:900px){#fv-ham{display:flex;}}',
      /* overlay */
      '#fv-mob{display:none;position:fixed;inset:0;z-index:99999;}',
      '#fv-mob.open{display:block;}',
      '#fv-mob-bg{position:absolute;inset:0;background:rgba(0,0,0,.45);}',
      '#fv-mob-panel{position:absolute;top:0;right:0;width:min(300px,85vw);height:100%;',
        'background:#fff;overflow-y:auto;display:flex;flex-direction:column;box-shadow:-4px 0 40px rgba(0,0,0,.15);}',
      '.fv-mh{padding:18px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #dde6f2;}',
      '.fv-mx{background:none;border:none;cursor:pointer;font-size:28px;color:#44546b;line-height:1;padding:0;}',
      '.fv-ml{padding:16px;display:flex;flex-direction:column;gap:2px;flex:1;}',
      '.fv-ml a{display:block;padding:13px 16px;color:#122f54;font-weight:600;font-size:15px;text-decoration:none;border-radius:10px;}',
      '.fv-ml a:hover,.fv-ml a:focus{background:#f4f8fd;}',
      '.fv-mc{margin:16px;background:#163d6d;color:#fff;font-weight:700;font-size:15px;',
        'padding:15px;border-radius:10px;text-align:center;text-decoration:none;display:block;}'
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
          (logoSrc ? '<img src="' + logoSrc + '" alt="FV" style="height:36px;width:auto;">' :
            '<strong style="color:#163d6d;">Future Vision</strong>') +
          '<button class="fv-mx" id="fv-mob-x" aria-label="Close">×</button>' +
        '</div>' +
        '<div class="fv-ml" id="fv-mob-links">' + links + '</div>' +
        '<a href="#enquiry" class="fv-mc">Enrol Now →</a>' +
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

  function addHamToNav(nav) {
    if (document.getElementById('fv-ham')) return; /* already present */
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

    /* build overlay once we have a header with a logo */
    if (!overlayDone) {
      var nav = hdr.querySelector('nav');
      var logoImg = hdr.querySelector('img');
      if (nav && logoImg && logoImg.src && logoImg.src.indexOf('blob:') === 0) {
        /* logo blob URL means bundle has rendered */
        overlayDone = true;

        var navlinksEl = hdr.querySelector('[class*="navlinks"]');
        var links = '';
        if (navlinksEl) {
          navlinksEl.querySelectorAll('a').forEach(function(a) {
            var txt = (a.textContent || '').trim();
            if (txt) links += '<a href="' + (a.getAttribute('href') || '#') + '">' + txt + '</a>';
          });
        }
        var phoneA = nav.querySelector('a[href^="tel:"]');
        if (phoneA) links += '<a href="' + phoneA.getAttribute('href') + '">☎️ ' + (phoneA.textContent || '9825771678').trim() + '</a>';

        buildOverlay(logoImg.src, links);
      }
    }

    /* ensure hamburger is present in nav — re-add if x-dc re-rendered it away */
    var nav2 = hdr.querySelector('nav');
    if (nav2) addHamToNav(nav2);
  }

  /* poll every 200ms until page settles, then every 2s as safety net */
  var count = 0;
  var fast = setInterval(function() {
    tick();
    count++;
    if (count >= 25) { /* 5 seconds fast polling */
      clearInterval(fast);
      setInterval(tick, 2000); /* slow keep-alive */
    }
  }, 200);
})();
