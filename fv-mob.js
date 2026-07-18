(function () {
  'use strict';

  function applyFix(hdr) {
    if (hdr.__fvMobFixed) return;
    hdr.__fvMobFixed = true;

    var styleEl = document.createElement('style');
    styleEl.textContent = [
      'header img{max-width:160px!important;height:auto!important;max-height:50px!important;}',
      '.fv-ham{display:none;flex-direction:column;justify-content:space-between;width:28px;height:20px;background:none;border:none;cursor:pointer;padding:0;flex-shrink:0;}',
      '.fv-ham span{display:block;height:2.5px;background:#163d6d;border-radius:2px;transition:transform .3s,opacity .3s;}',
      '.fv-ham.open span:nth-child(1){transform:translateY(8.75px) rotate(45deg);}',
      '.fv-ham.open span:nth-child(2){opacity:0;}',
      '.fv-ham.open span:nth-child(3){transform:translateY(-8.75px) rotate(-45deg);}',
      '@media(max-width:900px){.fv-ham{display:flex;}}',
      '.fv-mob{display:none;position:fixed;inset:0;z-index:9999;}',
      '.fv-mob.open{display:block;}',
      '.fv-mob-bg{position:absolute;inset:0;background:rgba(0,0,0,.45);}',
      '.fv-mob-panel{position:absolute;top:0;right:0;width:min(300px,85vw);height:100%;background:#fff;overflow-y:auto;display:flex;flex-direction:column;box-shadow:-4px 0 40px rgba(0,0,0,.15);}',
      '.fv-mob-head{padding:18px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #dde6f2;}',
      '.fv-mob-x{background:none;border:none;cursor:pointer;font-size:26px;color:#44546b;line-height:1;padding:0;}',
      '.fv-mob-links{padding:16px;display:flex;flex-direction:column;gap:2px;flex:1;}',
      '.fv-mob-links a{display:block;padding:13px 16px;color:#122f54;font-weight:600;font-size:15px;text-decoration:none;border-radius:10px;transition:background .15s;}',
      '.fv-mob-links a:hover,.fv-mob-links a:focus{background:#f4f8fd;}',
      '.fv-mob-cta{margin:16px;background:#163d6d;color:#fff;font-weight:700;font-size:15px;padding:15px;border-radius:10px;text-align:center;text-decoration:none;display:block;}'
    ].join('');
    document.head.appendChild(styleEl);

    var nav = hdr.querySelector('nav');
    var ham = document.createElement('button');
    ham.className = 'fv-ham';
    ham.setAttribute('aria-label', 'Open menu');
    ham.setAttribute('aria-expanded', 'false');
    ham.innerHTML = '<span></span><span></span><span></span>';
    if (nav) nav.appendChild(ham);

    var logoImg = hdr.querySelector('img');
    var navlinksEl = hdr.querySelector('[class*="navlinks"]');
    var links = '';
    if (navlinksEl) {
      var anchors = navlinksEl.querySelectorAll('a');
      for (var i = 0; i < anchors.length; i++) {
        var a = anchors[i];
        var txt = (a.textContent || '').trim();
        if (txt) links += '<a href="' + (a.getAttribute('href') || '#') + '">' + txt + '</a>';
      }
    }
    if (nav) {
      var phoneA = nav.querySelector('a[href^="tel:"]');
      if (phoneA) {
        var ph = (phoneA.textContent || '').replace(/\s+/g, ' ').trim();
        links += '<a href="' + phoneA.getAttribute('href') + '">☎️ ' + (ph || '9825771678') + '</a>';
      }
    }

    var overlay = document.createElement('div');
    overlay.className = 'fv-mob';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Mobile navigation');
    overlay.innerHTML =
      '<div class="fv-mob-bg"></div>' +
      '<div class="fv-mob-panel">' +
      '<div class="fv-mob-head">' +
      (logoImg ? '<img src="' + logoImg.src + '" alt="Future Vision" style="height:36px;width:auto;">' :
        '<strong style="color:#163d6d;font-size:16px;">Future Vision</strong>') +
      '<button class="fv-mob-x" aria-label="Close menu">×</button>' +
      '</div>' +
      '<div class="fv-mob-links">' + links + '</div>' +
      '<a href="#enquiry" class="fv-mob-cta">Enrol Now →</a>' +
      '</div>';
    document.body.appendChild(overlay);

    function openMob() {
      overlay.classList.add('open');
      ham.classList.add('open');
      ham.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function closeMob() {
      overlay.classList.remove('open');
      ham.classList.remove('open');
      ham.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    ham.addEventListener('click', openMob);
    overlay.querySelector('.fv-mob-bg').addEventListener('click', closeMob);
    overlay.querySelector('.fv-mob-x').addEventListener('click', closeMob);
    var mobLinks = overlay.querySelectorAll('.fv-mob-links a, .fv-mob-cta');
    for (var j = 0; j < mobLinks.length; j++) {
      mobLinks[j].addEventListener('click', closeMob);
    }
  }

  var obs = new MutationObserver(function () {
    var hdr = document.querySelector('header');
    if (hdr) { obs.disconnect(); applyFix(hdr); }
  });
  obs.observe(document, { childList: true, subtree: true });

  var hdrNow = document.querySelector('header');
  if (hdrNow) { obs.disconnect(); applyFix(hdrNow); }
})();
