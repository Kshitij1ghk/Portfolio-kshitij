/* ============================================================
   Kshitij Wankar — Portfolio
   Vanilla JS, no dependencies. Every module guards its own DOM
   so a missing element degrades quietly instead of throwing.
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ==========================================================
     1. THEME — persist choice, default to the OS preference
     ========================================================== */
  (function theme() {
    var root  = document.documentElement;
    var saved = null;
    try { saved = localStorage.getItem('kw-theme'); } catch (e) { /* private mode */ }

    var initial = saved
      || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    root.setAttribute('data-theme', initial);

    var btn = $('#themeToggle');
    if (!btn) return;

    var sync = function () {
      var light = root.getAttribute('data-theme') === 'light';
      btn.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    };
    sync();

    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('kw-theme', next); } catch (e) {}
      sync();
    });
  })();

  /* ==========================================================
     2. NAVBAR — scrolled shadow, reading progress, mobile menu,
        active-section tracking, sliding indicator
     ========================================================== */
  (function navbar() {
    var nav       = $('#nav');
    var progress  = $('#scrollProgress');
    var links     = $('#navLinks');
    var burger    = $('#navBurger');
    var indicator = $('#navIndicator');
    var toTop     = $('#toTop');

    /* --- scrolled state + progress bar + back-to-top --- */
    var ticking = false;
    var onScroll = function () {
      var y = window.scrollY || document.documentElement.scrollTop;
      var max = document.documentElement.scrollHeight - window.innerHeight;

      if (nav) nav.classList.toggle('is-scrolled', y > 8);
      if (toTop) toTop.classList.toggle('is-visible', y > 500);
      if (progress) progress.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + '%';

      ticking = false;
    };

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    if (toTop) {
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }

    /* --- mobile menu --- */
    var setMenu = function (open) {
      if (!links || !burger) return;
      links.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
    };

    if (burger) {
      burger.addEventListener('click', function () {
        setMenu(burger.getAttribute('aria-expanded') !== 'true');
      });
    }

    /* --- close the menu after any nav click --- */
    if (links) {
      links.addEventListener('click', function (e) {
        if (e.target.closest('.nav-link')) setMenu(false);
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });

    /* --- close the menu if the viewport grows past the breakpoint --- */
    window.matchMedia('(min-width: 941px)').addEventListener('change', function (e) {
      if (e.matches) setMenu(false);
    });

    /* --- active section via IntersectionObserver --- */
    var navLinks  = $$('.nav-link');
    var sections  = navLinks
      .map(function (a) { return document.querySelector(a.getAttribute('href')); })
      .filter(Boolean);

    var placeIndicator = function (link) {
      if (!indicator || !link) return;

      /* Below the breakpoint the indicator is display:none and the nav is a
         stacked overlay — measuring it there yields the whole menu's width,
         so clear it and wait for the next desktop-sized layout. */
      if (window.matchMedia('(max-width: 940px)').matches) {
        indicator.style.width = '0px';
        indicator.classList.remove('is-ready');
        return;
      }

      indicator.style.width = link.offsetWidth + 'px';
      indicator.style.transform = 'translateY(-50%) translateX(' + link.offsetLeft + 'px)';
      indicator.classList.add('is-ready');
    };

    var setActive = function (id) {
      navLinks.forEach(function (a) {
        var on = a.getAttribute('href') === '#' + id;
        a.classList.toggle('is-active', on);
        if (on) placeIndicator(a);
      });
    };

    if (sections.length) {
      var visible = {};

      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          visible[entry.target.id] = entry.isIntersecting ? entry.intersectionRatio : 0;
        });

        /* pick whichever tracked section is currently most visible */
        var bestId = null, bestRatio = 0;
        Object.keys(visible).forEach(function (id) {
          if (visible[id] > bestRatio) { bestRatio = visible[id]; bestId = id; }
        });

        if (bestId) setActive(bestId);
      }, { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] });

      sections.forEach(function (s) { spy.observe(s); });
    }

    /* keep the indicator under the right link across resize */
    var reposition = function () {
      var active = $('.nav-link.is-active');
      if (active) placeIndicator(active);
    };
    window.addEventListener('resize', reposition);
    window.addEventListener('load', reposition);
    document.addEventListener('DOMContentLoaded', reposition);
    setActive('home');
  })();

  /* ==========================================================
     3. TYPING EFFECT in the hero
     ========================================================== */
  (function typing() {
    var el = $('#typed');
    if (!el) return;

    var phrases = [
      'C# / .NET applications.',
      'database schemas.',
      'web interfaces.',
      'retrieval systems.',
      'LLM agents & MCP tools.'
    ];

    /* no animation — just show the first phrase */
    if (reduceMotion) { el.textContent = phrases[0]; return; }

    var p = 0, c = 0, deleting = false;

    var tick = function () {
      var word = phrases[p];

      c += deleting ? -1 : 1;
      el.textContent = word.slice(0, c);

      var delay = deleting ? 45 : 78;

      if (!deleting && c === word.length) {
        deleting = true;
        delay = 1750;                       // hold on the full phrase
      } else if (deleting && c === 0) {
        deleting = false;
        p = (p + 1) % phrases.length;
        delay = 380;                        // pause before the next phrase
      }

      setTimeout(tick, delay);
    };

    setTimeout(tick, 420);
  })();

  /* ==========================================================
     4. SCROLL REVEAL
     ========================================================== */
  (function reveal() {
    var items = $$('.reveal');
    if (!items.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);       // reveal once, then stop watching
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (el) { io.observe(el); });
  })();

  /* ==========================================================
     5. ANIMATED STAT COUNTERS
     ========================================================== */
  (function counters() {
    var stats = $$('.stat dd[data-count]');
    if (!stats.length) return;

    var run = function (el) {
      var target   = parseFloat(el.getAttribute('data-count'));
      var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      var duration = 1400;
      var start    = null;

      if (reduceMotion) { el.textContent = target.toFixed(decimals); return; }

      var frame = function (now) {
        if (start === null) start = now;
        var progress = Math.min(1, (now - start) / duration);
        /* easeOutExpo so the number settles instead of stopping dead */
        var eased   = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        el.textContent = (target * eased).toFixed(decimals);
        if (progress < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };

    if (!('IntersectionObserver' in window)) {
      stats.forEach(run);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });

    stats.forEach(function (el) { io.observe(el); });
  })();

  /* ==========================================================
     6. SKILL FILTER + SEARCH
     ========================================================== */
  (function skills() {
    var chips  = $$('.chip');
    var cards  = $$('.skill-card');
    var search = $('#skillSearch');
    var empty  = $('#skillEmpty');

    if (!chips.length && !search) return;

    var category = 'all';
    var query    = '';

    var apply = function () {
      var shown = 0;

      cards.forEach(function (card) {
        var catOk = category === 'all' || card.getAttribute('data-category') === category;
        var textOk = !query || card.textContent.toLowerCase().indexOf(query) !== -1;
        var visible = catOk && textOk;

        card.classList.toggle('is-hidden', !visible);
        if (visible) shown++;
      });

      if (empty) empty.hidden = shown > 0;
    };

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('is-active'); });
        chip.classList.add('is-active');
        category = chip.getAttribute('data-filter');
        apply();
      });
    });

    if (search) {
      search.addEventListener('input', function () {
        query = search.value.trim().toLowerCase();
        apply();
      });
      /* Esc clears the box */
      search.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && search.value) {
          search.value = '';
          query = '';
          apply();
        }
      });
    }
  })();

  /* ==========================================================
     7. COPY EMAIL TO CLIPBOARD
     ========================================================== */
  (function copyEmail() {
    var btn = $('#copyEmail');
    if (!btn) return;

    var label = $('#copyLabel');
    var email = btn.getAttribute('data-email');
    var resetTimer;

    btn.addEventListener('click', function () {
      var done = function (ok) {
        clearTimeout(resetTimer);
        label.textContent = ok ? 'Copied!' : 'Press Ctrl+C';
        if (!ok) btn.classList.add('is-err');
        resetTimer = setTimeout(function () {
          label.textContent = 'Copy email';
          btn.classList.remove('is-err');
        }, 2000);
      };

      /* async Clipboard API needs a secure context (https or localhost) */
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(function () { done(true); }, function () { fallback(); });
      } else {
        fallback();
      }

      /* file:// and http:// fallback — offscreen textarea + execCommand */
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = email;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:-9999px;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, email.length);

        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }

        document.body.removeChild(ta);
        done(ok);
      }
    });
  })();

  /* ==========================================================
     8. FOOTER YEAR
     ========================================================== */
  (function year() {
    var el = $('#year');
    if (el) el.textContent = new Date().getFullYear();
  })();

})();
