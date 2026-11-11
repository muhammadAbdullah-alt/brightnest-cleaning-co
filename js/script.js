/* BrightNest Cleaning Co. v2 — vanilla JS, no dependencies.
   Reads ALL pricing/contact data from js/config.js (BRIGHTNEST_CONFIG).
   Pure function: calculateQuote(beds, baths, type, freq) — testable in Node.
   Modules: config sync, nav, reveal (with safety fallback), quote
   calculator, pricing toggle, package/service sync, testimonials,
   booking modal + validation, contact form, gated mailto/WhatsApp, toast.
   No data is sent to any server. Forms only build a local summary
   (copy / download) and, when contact is enabled in config, a mailto /
   WhatsApp draft the visitor sends themselves. */
(function () {
  'use strict';
  var CFG = window.BRIGHTNEST_CONFIG;
  if (!CFG) { console.error('BRIGHTNEST_CONFIG missing — check js/config.js is loaded before script.js'); return; }
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function money(n) { return '$' + n; }

  /* ---------- 1. Sync DOM from config; warn on drift ---------- */
  function syncFromConfig() {
    $$('[data-package]').forEach(function (el) {
      var p = CFG.packages[el.getAttribute('data-package')];
      if (!p) return;
      var onceEl = $('.amount', el), mode = document.body.getAttribute('data-billing') || 'once';
      if (onceEl) onceEl.textContent = p[mode === 'recurring' ? 'recurring' : 'once'];
    });
    $$('[data-config-phone]').forEach(function (el) { el.textContent = CFG.business.phoneDisplay + ' (DEMO)'; });
    $$('[data-config-email]').forEach(function (el) { el.textContent = CFG.business.email + ' (DEMO)'; });
    // Booking-plan options are rebuilt from config so they can never drift.
    var plan = $('#bookingPlan');
    if (plan) {
      plan.innerHTML = '';
      Object.keys(CFG.packages).forEach(function (k) {
        var p = CFG.packages[k], o = document.createElement('option');
        o.value = k; o.textContent = p.name + ' — from ' + money(p.once);
        if (k === 'signature') o.selected = true;
        plan.appendChild(o);
      });
      var air = document.createElement('option');
      air.value = 'airbnb'; air.textContent = 'Airbnb Turnover — from ' + money(CFG.estimator.base.airbnb);
      plan.appendChild(air);
    }
  }

  /* ---------- 2. Pure quote calculator (also tested in Node) ---------- */
  function calculateQuote(beds, baths, type, freq) {
    beds = Math.min(5, Math.max(1, parseInt(beds, 10) || 2));
    baths = Math.min(4, Math.max(1, parseInt(baths, 10) || 2));
    var base = CFG.estimator.base[type] || CFG.estimator.base.regular;
    if (type === 'airbnb') return { price: base, beds: beds, baths: baths, type: type, freq: freq, note: 'Flat rate — no per-room surcharge.' };
    var price = base + Math.max(0, beds - CFG.estimator.baseBeds) * CFG.estimator.extraBed
      + Math.max(0, baths - CFG.estimator.baseBaths) * CFG.estimator.extraBath;
    price = Math.round(price * (CFG.estimator.discount[freq] || 1));
    return { price: price, beds: beds, baths: baths, type: type, freq: freq, note: '' };
  }
  window.BrightNestCalc = calculateQuote; // exposed for testing / debugging
  var TYPE_LABEL = { regular: 'Regular', deep: 'Deep', move: 'Move-in / out', airbnb: 'Airbnb turnover' };
  var FREQ_LABEL = { weekly: 'Weekly', biweekly: 'Every 2 weeks', monthly: 'Monthly', once: 'One-time' };
  function renderQuote() {
    var q = calculateQuote($('#qBeds').value, $('#qBaths').value, $('#qType').value, $('#qFreq').value);
    $('#quotePrice').textContent = money(q.price);
    $('#quoteDetail').textContent = q.beds + ' bed · ' + q.baths + ' bath · ' + TYPE_LABEL[q.type] + ' · ' + FREQ_LABEL[q.freq] + (q.note ? ' · ' + q.note : '');
    var rec = CFG.estimator.recommendedPackage[q.type];
    var recEl = $('#quoteRecommend');
    if (recEl && rec) recEl.textContent = 'Recommended package: ' + CFG.packages[rec].name + ' — ' + money(CFG.packages[rec].once) + ' one-time.';
    return q;
  }
  ['qBeds', 'qBaths', 'qType', 'qFreq'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('change', renderQuote);
  });

  /* ---------- 3. Mobile nav ---------- */
  var toggle = $('#navToggle'), nav = $('#mainNav');
  if (toggle && nav) toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? '✕' : '☰';
  });
  $$('#mainNav a').forEach(function (a) {
    a.addEventListener('click', function () { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.textContent = '☰'; });
  });

  /* ---------- 4. Reveal on scroll — with safety fallback (BUG FIX) ----------
     v1 bug: .reveal starts at opacity:0. If IntersectionObserver never
     fired (stitched screenshot, old browser, JS error), whole sections
     stayed blank. Now: reveal after 2.5s regardless, plus a no-JS CSS rule. */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    revealEls.forEach(function (el) { io.observe(el); });
  }
  setTimeout(function () { revealEls.forEach(function (el) { el.classList.add('visible'); }); }, 2500);

  /* ---------- 5. Pricing toggle (one-time / recurring) ---------- */
  function setBilling(mode) {
    document.body.setAttribute('data-billing', mode);
    $$('.toggle-btn').forEach(function (b) {
      var active = b.getAttribute('data-billing') === mode;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', String(active));
    });
    $$('[data-package]').forEach(function (card) {
      var p = CFG.packages[card.getAttribute('data-package')];
      var amt = $('.amount', card);
      if (p && amt) amt.textContent = mode === 'recurring' ? p.recurring : p.once;
    });
    var note = $('#billingNote');
    if (note) note.textContent = mode === 'recurring'
      ? 'Recurring prices shown — Essential & Signature save 20%, Premium Deep saves 15%. Illustrative pricing.'
      : 'One-time prices shown. Switch to Recurring to see the discounted rates. Illustrative pricing.';
  }
  $$('.toggle-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { setBilling(btn.getAttribute('data-billing')); });
  });
  setBilling('once');

  /* ---------- 6. Testimonials ---------- */
  var slides = $$('.testimonial'), dotsWrap = $('#testimonialDots');
  var current = 0, timer = null;
  function showSlide(i, manual) {
    if (!slides.length) return;
    current = ((i % slides.length) + slides.length) % slides.length;
    slides.forEach(function (s, j) { s.classList.toggle('active', j === current); s.setAttribute('aria-hidden', String(j !== current)); });
    $$('button', dotsWrap).forEach(function (d, j) { d.classList.toggle('active', j === current); });
    if (manual) restartAuto();
  }
  function restartAuto() { if (timer) clearInterval(timer); timer = setInterval(function () { showSlide(current + 1); }, 7000); }
  if (slides.length && dotsWrap) {
    slides.forEach(function (_, i) {
      var d = document.createElement('button');
      d.type = 'button'; d.setAttribute('aria-label', 'Go to sample review ' + (i + 1));
      if (i === 0) d.classList.add('active');
      d.addEventListener('click', function () { showSlide(i, true); });
      dotsWrap.appendChild(d);
    });
    var prev = $('#prevTestimonial'), next = $('#nextTestimonial');
    if (prev) prev.addEventListener('click', function () { showSlide(current - 1, true); });
    if (next) next.addEventListener('click', function () { showSlide(current + 1, true); });
    restartAuto();
    // Pause autoplay while the visitor is reading / hovering.
    var slider = $('#testimonialSlider');
    if (slider) {
      slider.addEventListener('mouseenter', function () { if (timer) clearInterval(timer); });
      slider.addEventListener('mouseleave', restartAuto);
    }
  }

  /* ---------- 7. Toast ---------- */
  var toastTimer = null;
  function showToast(msg) {
    var t = $('#toast'); if (!t) return;
    t.textContent = msg; t.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 4500);
  }

  /* ---------- 8. Gated contact actions ----------
     Email / WhatsApp only work when config enables them with real details.
     In demo mode they show a clear notice and do NOT open a dead number. */
  function gatedContact(kind, buildUrl) {
    var enabled = kind === 'email' ? CFG.contact.emailEnabled : CFG.contact.whatsappEnabled;
    if (CFG.isDemo || !enabled) {
      showToast('Demo contact — this ' + (kind === 'email' ? 'email address' : 'WhatsApp number') + ' is a fictional placeholder and reaches nobody. Replace it in js/config.js to go live.');
      return false;
    }
    window.open(buildUrl(), '_blank', 'noopener');
    return true;
  }
  $$('[data-whatsapp]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      gatedContact('whatsapp', function () {
        return 'https://wa.me/' + CFG.business.whatsappNumber + '?text=' + encodeURIComponent('Hi ' + CFG.business.name + '! I would like a free cleaning quote.');
      });
    });
  });
  $$('[data-email-link]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      gatedContact('email', function () {
        return 'mailto:' + CFG.business.email + '?subject=' + encodeURIComponent('Free cleaning quote — ' + CFG.business.name);
      });
    });
  });

  /* ---------- 9. Booking modal ---------- */
  var modal = $('#bookingModal'), lastFocus = null;
  function openBooking(planKey) {
    if (!modal) return;
    lastFocus = document.activeElement;
    var sel = $('#bookingPlan');
    if (sel) {
      if (planKey && sel.querySelector('option[value="' + planKey + '"]')) sel.value = planKey;
      else if (planKey) { // accept a package display name as fallback
        Array.prototype.forEach.call(sel.options, function (o) { if (o.textContent.indexOf(planKey) === 0) sel.value = o.value; });
      }
    }
    // Pre-fill service from the estimator so quote -> booking stays in sync.
    var qType = $('#qType');
    if (qType) { var svc = $('#bookingService'); if (svc) svc.value = qType.value; }
    modal.hidden = false; document.body.style.overflow = 'hidden';
    var d = $('#bookingDate');
    if (d && !d.value) {
      var t = new Date(); t.setDate(t.getDate() + 2);
      d.value = t.toISOString().slice(0, 10); d.min = new Date().toISOString().slice(0, 10);
    }
    var closeBtn = $('.modal-close', modal); if (closeBtn) closeBtn.focus();
  }
  function closeBooking() {
    if (!modal) return;
    modal.hidden = true; document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $$('[data-open-booking]').forEach(function (b) { b.addEventListener('click', function () { openBooking(); }); });
  $$('[data-close-booking]').forEach(function (b) { b.addEventListener('click', closeBooking); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal && !modal.hidden) closeBooking(); });
  // Plan buttons now pass the config key, not a display string (v1 bug fix).
  $$('[data-plan]').forEach(function (b) {
    b.addEventListener('click', function () { openBooking(b.getAttribute('data-plan')); });
  });
  // Service cards: set the estimator type first, so the booking modal
  // opens with the matching service + recommended package (v1 had no link).
  $$('[data-service]').forEach(function (b) {
    b.addEventListener('click', function () {
      var svc = b.getAttribute('data-service');
      var qType = $('#qType'); if (qType) { qType.value = svc; renderQuote(); }
      openBooking(CFG.estimator.recommendedPackage[svc] || 'signature');
      var bs = $('#bookingService'); if (bs) bs.value = svc;
    });
  });
  // Service select in the modal updates the package + price hint.
  var bookingService = $('#bookingService');
  if (bookingService) bookingService.addEventListener('change', function () {
    var rec = CFG.estimator.recommendedPackage[bookingService.value];
    var plan = $('#bookingPlan'); if (rec && plan) plan.value = rec;
    var hint = $('#bookingPriceHint');
    if (hint) hint.textContent = 'Estimated from ' + money(CFG.estimator.base[bookingService.value]) + ' for this service type (illustrative — see the quote calculator).';
  });

  function fieldError(input, message) {
    input.setAttribute('aria-invalid', 'true');
    var err = input.parentElement.querySelector('.field-error');
    if (!err) { err = document.createElement('span'); err.className = 'field-error'; err.setAttribute('role', 'alert'); input.parentElement.appendChild(err); }
    err.textContent = message;
  }
  function clearError(input) {
    input.removeAttribute('aria-invalid');
    var err = input.parentElement.querySelector('.field-error');
    if (err) err.remove();
  }
  function validateRequired(form) {
    var ok = true;
    $$('[required]', form).forEach(function (input) {
      clearError(input);
      if (input.type === 'checkbox') { if (!input.checked) { ok = false; fieldError(input, 'Please tick this box to continue.'); } return; }
      if (!input.value || !String(input.value).trim()) { ok = false; fieldError(input, 'This field is required.'); }
      else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) { ok = false; fieldError(input, 'Enter a valid email address, e.g. you@example.com.'); }
      else if (input.type === 'tel' && String(input.value).replace(/\D/g, '').length < 7) { ok = false; fieldError(input, 'Enter a valid phone number (at least 7 digits).'); }
      else if (input.type === 'date' && input.value && input.value < new Date().toISOString().slice(0, 10)) { ok = false; fieldError(input, 'Choose today or a future date.'); }
    });
    return ok;
  }

  // Booking submit: validate, then show a LOCAL summary (nothing is stored
  // or sent). Visitor can copy it or download it as a .txt file.
  var bf = $('#bookingForm');
  if (bf) bf.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateRequired(bf)) { showToast('Please fix the highlighted fields.'); return; }
    var q = renderQuote();
    var plan = $('#bookingPlan');
    var summary = 'BrightNest Cleaning Co. — booking request (DEMO, not sent)\n'
      + 'Package: ' + (plan ? plan.options[plan.selectedIndex].textContent : '') + '\n'
      + 'Service: ' + ($('#bookingService') ? $('#bookingService').value : '') + '\n'
      + 'Date: ' + $('#bookingDate').value + ' · ' + $('#bookingTime').value + '\n'
      + 'Name: ' + $('#bookingName').value + ' · Email: ' + $('#bookingEmail').value + ' · Phone: ' + $('#bookingPhone').value + '\n'
      + 'Address: ' + $('#bookingAddress').value + '\n'
      + 'Illustrative estimate: ' + money(q.price) + ' / visit (' + $('#quoteDetail').textContent + ')\n'
      + 'This request was NOT stored or sent — there is no backend in this demo.';
    var out = $('#bookingSummary'); if (out) { out.textContent = summary; out.hidden = false; }
    var ok = $('#bookingSuccess'); if (ok) ok.hidden = false;
    var dl = $('#downloadBooking'); if (dl) dl.hidden = false;
    showToast('Request prepared locally (demo) — nothing was sent or stored.');
  });
  var dlBtn = $('#downloadBooking');
  if (dlBtn) dlBtn.addEventListener('click', function () {
    var txt = ($('#bookingSummary') || {}).textContent || 'No booking yet.';
    var blob = new Blob([txt], { type: 'text/plain' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'brightnest-booking-request-demo.txt'; a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });

  /* ---------- 10. Quote form: open booking with the CORRECT package ---------- */
  var qf = $('#quoteForm');
  if (qf) qf.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = renderQuote();
    var rec = CFG.estimator.recommendedPackage[q.type] || 'signature';
    openBooking(rec);
    showToast('Your illustrative estimate is ' + money(q.price) + ' / visit — pick a date to confirm (demo).');
  });

  /* ---------- 11. Contact form: validate, local-only ---------- */
  var cf = $('#contactForm');
  if (cf) cf.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateRequired(cf)) { showToast('Please fix the highlighted fields.'); return; }
    var ok = $('#formSuccess'); if (ok) ok.hidden = false;
    showToast('Thanks! Your request was prepared locally (demo) — nothing was sent or stored.');
  });

  syncFromConfig();
  renderQuote();
  setBilling('once');
})();
