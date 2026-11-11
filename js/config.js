/* BrightNest Cleaning Co. — SINGLE SOURCE OF TRUTH (v2.0, 2026-11-11)
   ----------------------------------------------------------------------
   Change pricing, contact details or business info HERE ONLY.
   - index.html ships with the same values hard-coded as a no-JS fallback.
   - js/script.js reads this file on load, re-renders every price /
     phone / email / WhatsApp link from it, and logs a warning if the
     HTML fallback ever drifts from this file.
   - To go live: set isDemo=false, replace the DEMO phone/email/WhatsApp
     with real, verified details, replace the sample testimonials in
     index.html, and remove the demo banner. Nothing else needs editing
     for pricing/contact changes.
   Works in the browser (window.BRIGHTNEST_CONFIG) and in Node
   (module.exports) so the calculator can be unit-tested. */
(function (root) {
  'use strict';
  var CONFIG = {
    version: '2.0.0',
    isDemo: true, // true = fictional portfolio demo. All contact details below are DEMO placeholders that reach nobody.
    business: {
      name: 'BrightNest Cleaning Co.',
      shortName: 'BrightNest',
      city: 'Austin, TX',
      serviceArea: 'Austin, Round Rock, Cedar Park, Pflugerville, Lakeway',
      hours: 'Mon–Sat, 8am–6pm CT',
      // DEMO placeholders — 555 numbers and .demo addresses are intentionally
      // non-working. Replace with verified real details before launch.
      phoneDisplay: '(512) 555-0148',
      phoneTel: '+15125550148',
      whatsappNumber: '15125550148', // digits only, no +
      email: 'hello@brightnestcleaning.demo',
      address: 'Austin, TX 78701 (demo address)'
    },
    // Packages: once = one-time price, recurring = discounted recurring price.
    // Recurring discount is NOT derived by a single % — Premium Deep is
    // 15% off ($289 -> $245), Essential/Signature are 20% off. Keep the
    // explicit numbers here; do not re-derive them elsewhere.
    packages: {
      essential: { name: 'Essential', once: 129, recurring: 103, blurb: 'For tidy homes that need regular upkeep.' },
      signature: { name: 'Signature', once: 189, recurring: 151, blurb: 'Our best-value clean, most booked in this demo.' },
      premium:   { name: 'Premium Deep', once: 289, recurring: 245, blurb: 'Top-to-bottom reset for first visits & moves.' }
    },
    // Instant-quote estimator. Base price by cleaning type, then
    // +$20 per bedroom above 2, +$15 per bathroom above 2 (capped at
    // 5 beds / 4 baths in the form), then a frequency discount.
    // Airbnb turnovers are flat-rate: no per-room surcharge, no discount.
    estimator: {
      base: { regular: 129, deep: 249, move: 289, airbnb: 89 },
      extraBed: 20, extraBath: 15, baseBeds: 2, baseBaths: 2,
      discount: { weekly: 0.80, biweekly: 0.85, monthly: 0.90, once: 1.00 },
      // Which package the estimator recommends for each cleaning type.
      recommendedPackage: { regular: 'essential', deep: 'signature', move: 'premium', airbnb: 'essential' }
    },
    addons: [
      { name: 'Laundry & fold', price: 25 },
      { name: 'Inside fridge', price: 20 },
      { name: 'Pet-hair treatment', price: 15 },
      { name: 'Key pickup', price: 0 }
    ],
    // Contact actions are GATED on this flag in script.js: in demo mode
    // mailto/WhatsApp do not open a dead number — the user gets a clear
    // "demo contact" notice instead. Set isDemo=false (with real details)
    // to enable them.
    contact: { emailEnabled: false, whatsappEnabled: false }
  };
  // Keep the gating honest: demo mode can never enable real contact actions.
  if (CONFIG.isDemo) { CONFIG.contact.emailEnabled = false; CONFIG.contact.whatsappEnabled = false; }
  if (typeof module !== 'undefined' && module.exports) module.exports = CONFIG;
  root.BRIGHTNEST_CONFIG = CONFIG;
})(typeof window !== 'undefined' ? window : globalThis);
