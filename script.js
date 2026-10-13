/* =========================================================
   Growvia — script.js (vanilla JS, no dependencies)
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Configuration (edit these) ---------- */
  // Replace with the real WhatsApp number: country code + number, digits only.
  var WHATSAPP_NUMBER = '0000000000';
  var WHATSAPP_MESSAGE = 'Hi Growvia, I would like to discuss a project.';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Helpers ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  var toastEl = $('#toast');
  var toastTimer;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 3200);
  }

  /* ---------- Dynamic year ---------- */
  $('#year').textContent = new Date().getFullYear();

  /* ---------- Header: scrolled state + back to top ---------- */
  var header = $('#siteHeader');
  var toTop = $('#toTop');
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    header.classList.toggle('scrolled', y > 24);
    toTop.classList.toggle('show', y > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  /* ---------- Mobile navigation ---------- */
  var navToggle = $('#navToggle');
  var navMenu = $('#navMenu');
  var servicesToggle = $('#servicesToggle');
  var servicesDropdown = $('#servicesDropdown');
  var mobileQuery = window.matchMedia('(max-width: 900px)');

  function setMenu(open) {
    navMenu.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
    if (!open) setDropdown(false);
  }
  navToggle.addEventListener('click', function () {
    setMenu(!navMenu.classList.contains('open'));
  });

  /* ---------- Services dropdown ---------- */
  function setDropdown(open) {
    servicesDropdown.classList.toggle('open', open);
    servicesToggle.setAttribute('aria-expanded', String(open));
  }
  servicesToggle.addEventListener('click', function (e) {
    e.stopPropagation();
    setDropdown(!servicesDropdown.classList.contains('open'));
  });
  // Hover support on desktop
  var hasDropdown = servicesToggle.parentElement;
  hasDropdown.addEventListener('mouseenter', function () { if (!mobileQuery.matches) setDropdown(true); });
  hasDropdown.addEventListener('mouseleave', function () { if (!mobileQuery.matches) setDropdown(false); });
  document.addEventListener('click', function (e) {
    if (!hasDropdown.contains(e.target)) setDropdown(false);
  });

  // Close menus after choosing a link
  $$('#navMenu a').forEach(function (a) {
    a.addEventListener('click', function () {
      setDropdown(false);
      if (navMenu.classList.contains('open')) setMenu(false);
    });
  });

  // Reset state when resizing to desktop
  mobileQuery.addEventListener('change', function (e) { if (!e.matches) setMenu(false); });

  /* ---------- Smooth scrolling with header offset ---------- */
  // CSS handles scroll-behavior and scroll-padding; this adds focus management
  // and a manual fallback for "#top".
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return; // placeholder links handled elsewhere
      var target = document.getElementById(id.slice(1));
      if (!target) return;
      e.preventDefault();
      if (id === '#top') {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      } else {
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      }
      history.replaceState(null, '', id);
    });
  });

  /* ---------- Active nav link on scroll ---------- */
  var sectionLinks = {};
  $$('.nav-menu a.nav-link').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href && href.length > 1) sectionLinks[href.slice(1)] = a;
  });
  if ('IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        Object.keys(sectionLinks).forEach(function (k) { sectionLinks[k].classList.remove('active'); });
        var link = sectionLinks[entry.target.id];
        if (link) link.classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(sectionLinks).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) navObserver.observe(el);
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = $$('.reveal');
  // Stagger siblings slightly for a cascading feel
  $$('.cards-grid, .features, .industry-grid, .timeline, .work-grid, .accordion').forEach(function (group) {
    $$('.reveal', group).forEach(function (el, i) { el.style.setProperty('--d', (i % 6) * 0.07 + 's'); });
  });

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  // Process timeline connecting line
  var timeline = $('#timeline');
  if (timeline) {
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
      var tlObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { timeline.classList.add('in-view'); obs.disconnect(); }
        });
      }, { threshold: 0.3 });
      tlObserver.observe(timeline);
    } else {
      timeline.classList.add('in-view');
    }
  }

  /* ---------- Service "Learn More": preselect service in the form ---------- */
  $$('.learn-more').forEach(function (link) {
    link.addEventListener('click', function () {
      var svc = link.getAttribute('data-service');
      var select = $('#service');
      if (svc && select) select.value = svc;
    });
  });

  /* ---------- Portfolio ---------- */
  // Concept projects only. Not real client work.
  var projects = [
    {
      key: 'dash', title: 'SaaS Dashboard', industry: 'Fintech',
      services: 'UI/UX Design · Web App Development',
      desc: 'A concept analytics dashboard exploring clear data hierarchy, readable charts, and a calm interface for financial teams.'
    },
    {
      key: 'shop', title: 'E-commerce Website', industry: 'Consumer Brand',
      services: 'Website Design · E-commerce Development',
      desc: 'A concept storefront focused on easy product browsing, clean product cards, and a simple path to checkout.'
    },
    {
      key: 'biz', title: 'Business Website', industry: 'Professional Services',
      services: 'Website Development · SEO',
      desc: 'A concept corporate site that builds trust quickly with clear service pages and a strong enquiry call to action.'
    },
    {
      key: 'brand', title: 'Brand Identity', industry: 'Creative Startup',
      services: 'Branding · Graphic Design',
      desc: 'A concept identity system covering logo, colour palette, and usage guidelines for a young creative studio.'
    },
    {
      key: 'camp', title: 'Digital Campaign', industry: 'Lifestyle Brand',
      services: 'Digital Marketing · Social Media Creatives',
      desc: 'A concept campaign showing a consistent set of social creatives and ad designs built around one idea.'
    },
    {
      key: 'land', title: 'Landing Page', industry: 'Technology Startup',
      services: 'UI Design · Web Development',
      desc: 'A concept launch page with a focused message, a single clear action, and fast, lightweight code.'
    }
  ];

  var previewHTML = {
    dash:
      '<div class="pv pv-dash"><div class="side"><i></i><i></i><i></i><i></i></div>' +
      '<div class="main"><div class="kpis"><b></b><b></b><b></b></div>' +
      '<svg viewBox="0 0 200 80" preserveAspectRatio="none"><path d="M0 60 L30 48 L60 54 L90 30 L120 38 L150 18 L200 8" fill="none" stroke="#c8f169" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M0 60 L30 48 L60 54 L90 30 L120 38 L150 18 L200 8 L200 80 L0 80Z" fill="rgba(200,241,105,.14)"/></svg></div></div>',
    shop:
      '<div class="pv pv-shop"><div class="item"><div class="thumb"></div><i></i><i class="s"></i></div>' +
      '<div class="item"><div class="thumb"></div><i></i><i class="s"></i></div>' +
      '<div class="item"><div class="thumb"></div><i></i><i class="s"></i></div></div>',
    biz:
      '<div class="pv pv-biz"><div class="bar m"></div><div class="bar s"></div><div class="cta"></div>' +
      '<div class="trio"><b></b><b></b><b></b></div></div>',
    brand:
      '<div class="pv pv-brand"><div class="logo"><svg viewBox="0 0 32 32"><path d="M9 21l5-5 3 3 6-8" fill="none" stroke="#c8f169" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 11h4v4" fill="none" stroke="#c8f169" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
      '<div class="sw"><b style="background:#0f3d2e"></b><b style="background:#f6f4ee"></b><b style="background:#1f2a26"></b></div></div>',
    camp:
      '<div class="pv pv-camp"><div class="post"><i></i></div><div class="post"><i></i></div></div>',
    land:
      '<div class="pv pv-land"><div class="bar m"></div><div class="bar s"></div><div class="cta"></div><div class="rocket"></div></div>'
  };

  var grid = $('#workGrid');
  var VISIBLE_DEFAULT = 4;

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  projects.forEach(function (p, i) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'project reveal' + (i >= VISIBLE_DEFAULT ? ' is-hidden' : '');
    btn.setAttribute('data-index', i);
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-label', 'View project: ' + p.title + ' (concept)');
    btn.innerHTML =
      '<div class="project-preview" aria-hidden="true">' +
        '<span class="tag-concept">Concept</span>' +
        previewHTML[p.key] +
        '<div class="project-overlay"><span>View Project</span></div>' +
      '</div>' +
      '<div class="project-meta">' +
        '<p class="ind">' + escapeHTML(p.industry) + '</p>' +
        '<h3>' + escapeHTML(p.title) + '</h3>' +
        '<p class="svc">' + escapeHTML(p.services) + '</p>' +
      '</div>';
    grid.appendChild(btn);
  });

  // Re-run reveal for the newly created cards
  (function revealProjects() {
    var cards = $$('.project', grid);
    cards.forEach(function (el, i) { el.style.setProperty('--d', (i % 6) * 0.07 + 's'); });
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
      var o = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in'); obs.unobserve(en.target); }
        });
      }, { threshold: 0.1 });
      cards.forEach(function (c) { o.observe(c); });
    } else {
      cards.forEach(function (c) { c.classList.add('in'); });
    }
  })();

  // View All / Show Fewer
  var viewAllBtn = $('#viewAllBtn');
  var expanded = false;
  viewAllBtn.addEventListener('click', function () {
    expanded = !expanded;
    $$('.project', grid).forEach(function (card, i) {
      if (i >= VISIBLE_DEFAULT) {
        card.classList.toggle('is-hidden', !expanded);
        if (expanded) card.classList.add('in');
      }
    });
    viewAllBtn.textContent = expanded ? 'Show Fewer Projects' : 'View All Projects';
    viewAllBtn.setAttribute('aria-expanded', String(expanded));
  });

  /* ---------- Project modal ---------- */
  var modal = $('#projectModal');
  var modalPreview = $('#modalPreview');
  var lastFocused = null;

  function openModal(index) {
    var p = projects[index];
    if (!p) return;
    lastFocused = document.activeElement;
    modalPreview.innerHTML = previewHTML[p.key];
    $('#modalIndustry').textContent = p.industry;
    $('#modalTitle').textContent = p.title;
    $('#modalDesc').textContent = p.desc;
    $('#modalServices').textContent = 'Services: ' + p.services;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    $('.modal-close', modal).focus();
  }
  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
    if (lastFocused) lastFocused.focus();
  }

  grid.addEventListener('click', function (e) {
    var card = e.target.closest('.project');
    if (card) openModal(Number(card.getAttribute('data-index')));
  });
  modal.addEventListener('click', function (e) {
    if (e.target.hasAttribute('data-close')) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (!modal.hidden) closeModal();
      else if (navMenu.classList.contains('open')) { setMenu(false); navToggle.focus(); }
      else if (servicesDropdown.classList.contains('open')) { setDropdown(false); servicesToggle.focus(); }
    }
    // Focus trap inside modal
    if (e.key === 'Tab' && !modal.hidden) {
      var focusables = $$('button, [href], [tabindex]:not([tabindex="-1"])', modal);
      if (!focusables.length) return;
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Testimonial carousel ---------- */
  var track = $('#carouselTrack');
  var slides = $$('.testi-card', track);
  var dotsWrap = $('#carDots');
  var current = 0;

  slides.forEach(function (_, i) {
    var dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'car-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', 'Show testimonial ' + (i + 1));
    dot.addEventListener('click', function () { goTo(i); });
    dotsWrap.appendChild(dot);
  });
  var dots = $$('.car-dot', dotsWrap);

  function goTo(i) {
    current = (i + slides.length) % slides.length;
    track.style.transform = 'translateX(' + (-100 * current) + '%)';
    dots.forEach(function (d, k) { d.setAttribute('aria-selected', String(k === current)); });
    slides.forEach(function (s, k) { s.setAttribute('aria-hidden', String(k !== current)); });
  }
  $('#carPrev').addEventListener('click', function () { goTo(current - 1); });
  $('#carNext').addEventListener('click', function () { goTo(current + 1); });
  $('#carousel').addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });
  goTo(0);

  /* ---------- FAQ accordion ---------- */
  var accButtons = $$('.acc-btn');
  accButtons.forEach(function (btn, idx) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.acc-item');
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      item.classList.toggle('open', !open);
    });
    // Arrow / Home / End navigation between questions
    btn.addEventListener('keydown', function (e) {
      var target = null;
      if (e.key === 'ArrowDown') target = accButtons[(idx + 1) % accButtons.length];
      else if (e.key === 'ArrowUp') target = accButtons[(idx - 1 + accButtons.length) % accButtons.length];
      else if (e.key === 'Home') target = accButtons[0];
      else if (e.key === 'End') target = accButtons[accButtons.length - 1];
      if (target) { e.preventDefault(); target.focus(); }
    });
  });

  /* ---------- Contact form ---------- */
  var form = $('#inquiryForm');
  var success = $('#formSuccess');

  var rules = {
    name: function (v) {
      if (!v.trim()) return 'Please enter your full name.';
      if (v.trim().length < 2) return 'Your name looks too short.';
      return '';
    },
    email: function (v) {
      if (!v.trim()) return 'Please enter your email address.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'Enter a valid email, like name@example.com.';
      return '';
    },
    service: function (v) { return v ? '' : 'Please choose the service you need.'; },
    details: function (v) {
      if (!v.trim()) return 'Please tell us a little about your project.';
      if (v.trim().length < 20) return 'Add a bit more detail (at least 20 characters).';
      return '';
    }
  };

  function validateField(name) {
    var input = form.elements[name];
    var field = input.closest('.field');
    var msg = rules[name](input.value);
    field.classList.toggle('invalid', !!msg);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    $('#' + name + '-err').textContent = msg;
    return !msg;
  }

  Object.keys(rules).forEach(function (name) {
    var input = form.elements[name];
    input.addEventListener('blur', function () { validateField(name); });
    input.addEventListener('input', function () {
      if (input.closest('.field').classList.contains('invalid')) validateField(name);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstInvalid = null;
    Object.keys(rules).forEach(function (name) {
      if (!validateField(name) && !firstInvalid) firstInvalid = form.elements[name];
    });
    if (firstInvalid) { firstInvalid.focus(); return; }

    // No backend connected: show an honest success state only.
    // To send real inquiries, post the form data to a form service here.
    success.hidden = false;
    $('#formReset').focus();
  });

  $('#formReset').addEventListener('click', function () {
    form.reset();
    $$('.field', form).forEach(function (f) { f.classList.remove('invalid'); });
    success.hidden = true;
    form.elements.name.focus();
  });

  /* ---------- WhatsApp CTA ---------- */
  var waBtn = $('#whatsappBtn');
  var waReady = /^\d{8,15}$/.test(WHATSAPP_NUMBER) && !/^0+$/.test(WHATSAPP_NUMBER);
  if (waReady) {
    waBtn.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(WHATSAPP_MESSAGE);
  } else {
    waBtn.addEventListener('click', function (e) {
      e.preventDefault();
      showToast('WhatsApp number not set yet. Add it to WHATSAPP_NUMBER in script.js.');
    });
  }

  /* ---------- Placeholder links (social, legal) ---------- */
  $$('.social').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      showToast('Social link is a placeholder. Add your profile URL.');
    });
  });
  $$('[data-legal]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      showToast(a.getAttribute('data-legal') + ' page is not written yet.');
    });
  });
})();