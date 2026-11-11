# BrightNest Cleaning Co. — Premium Website Demo (v2.0)

A fictional, premium, mobile-first cleaning-company website for the US market (Austin, TX).
Plain HTML, CSS and JavaScript — no build step, no paid services, no paid APIs, no backend.

> **Fictional portfolio demo.** BrightNest is not a real company. Prices are illustrative,
> reviews are samples, and the phone / email / WhatsApp details are DEMO placeholders that
> reach nobody. No request on this page is stored or sent. See `QA_REPORT.md` for the full audit.

**Live demo:** the hosted preview in chat (artifact `brightnest-cleaning-co-website`).
**Source files:** this folder — the canonical deliverable. The hosted preview is built from
these same values (see `js/config.js`).

## What's inside

| File | Purpose |
|---|---|
| `index.html` | All content, SEO meta, Schema.org `LocalBusiness` JSON-LD (no fake rating) |
| `js/config.js` | **Single source of truth** — pricing, business details, demo flag. Edit here only. |
| `js/script.js` | Quote calculator, pricing toggle, booking modal + validation, gated contact actions |
| `css/style.css` | Mobile-first styles, design tokens, animations, responsive fixes |
| `README.md` | This file |
| `QA_REPORT.md` | Bugs found & fixed, test results, what still needs a backend |

### What the site does
- Hero with instant quote calculator (bedrooms / bathrooms / type / frequency)
- 6 services, 3 pricing packages with one-time / recurring toggle
- Sample testimonials (clearly labelled fictional), FAQ, how-it-works
- Booking modal + contact form — validated locally, **nothing is sent or stored**
- WhatsApp / email actions are **gated**: in demo mode they show a notice instead of
  opening a dead number. Enable them only with real details in `js/config.js`.
- SEO: title, description, Open Graph, semantic H1–H3, JSON-LD, alt text, `noindex`
  (deliberate — a fictional demo must not rank as a real business)

## The one place to change things — `js/config.js`

```js
isDemo: true,                       // set false + real details to go live
business: { phoneDisplay, phoneTel, whatsappNumber, email, address, … }
packages: { essential: {once:129, recurring:103}, signature:{once:189, recurring:151}, premium:{once:289, recurring:245} }
estimator: { base:{regular:129, deep:249, move:289, airbnb:89}, extraBed:20, extraBath:15,
             discount:{weekly:0.80, biweekly:0.85, monthly:0.90, once:1.00} }
```

`index.html` ships with the same values as a no-JS fallback; `script.js` re-renders every
price / phone / email from `config.js` on load. Change a price in `config.js` and it changes
everywhere — hero calculator, service cards, pricing cards, booking modal.

**Quote formula:** base by type + $20 per bedroom above 2 + $15 per bathroom above 2,
then the frequency discount. Airbnb is flat-rate ($89, no surcharge, no discount).
Verified examples: 2-bed/2-bath Regular biweekly = **$110**; weekly = $103; one-time = $129;
Deep 5-bed/4-bath one-time = $339. Full 12-case matrix in `QA_REPORT.md`.

## Preview (30 seconds)

```bash
cd cleaning-website-demo
python3 -m http.server 8000
# open http://localhost:8000
```
Or double-click `index.html` (works, but a local server is recommended for correct paths).
Or with Node: `npx serve .`

## Deploy — free options

### 1. Netlify Drop (easiest, 2 minutes)
Drag this whole folder onto https://app.netlify.com/drop → live `https://random-name.netlify.app`.

### 2. Vercel (free)
```bash
npm i -g vercel && cd cleaning-website-demo && vercel --prod
```

### 3. GitHub Pages (free)
Upload to a repo → Settings → Pages → Deploy from branch `main` / `/ (root)`.

### 4. Any shared hosting / cPanel
Upload the folder contents to `public_html/`. No database or server code needed.

## Going live — checklist (do all of these before using with real customers)

- [ ] In `js/config.js`: set `isDemo: false`, replace phone, WhatsApp, email, address with
      verified real details. Replace the demo banner / DEMO labels in `index.html`.
- [ ] Replace all 3 sample testimonials with real, verifiable reviews (with permission).
      Remove `noindex` only then, and only add an `aggregateRating` you have actually earned.
- [ ] Replace illustrative prices with your real prices — in `config.js` only.
- [ ] Replace the 2 Unsplash photos with real photos of your team / work.
- [ ] Connect the forms (see below) — otherwise requests still go nowhere.
- [ ] Set the real domain, add Google Analytics 4 + Search Console, add a privacy policy.
- [ ] Test on a real phone: booking modal, calculator, WhatsApp button, form validation.

## Bugs found & fixed in v2.0 (full list in QA_REPORT.md)

1. **Quote → booking always opened Signature** regardless of cleaning type. Now opens the
   recommended package for the selected type, and service cards open the matching service.
2. **Initial quote price was wrong:** HTML said $161 for 2-bed/2-bath Regular biweekly;
   the formula gives $110. Fixed in HTML and verified by a 12-case test matrix.
3. **Prices lived in 5+ places** (HTML, JS, booking options, hosted copy) and had already
   drifted once ($219 vs $189). Now one source: `js/config.js`.
4. **Scroll-reveal could leave sections blank** (opacity:0, no fallback — flagged in the
   first audit's stitched screenshot). Now a 2.5s safety fallback + `<noscript>` rule.
5. **Unsupported claims removed:** 4.9★ / 312 homes / 12,400 cleans / 98% rebook / $1M
   insurance / “background-checked & insured” / fake “As featured in” logos / fake rating
   in JSON-LD. Replaced with an honest demo-transparency section.
6. **Booking form had no email/phone** — the business could never reply. Added, validated.
7. **WhatsApp/mailto opened dead placeholder numbers.** Now gated on `config.js`.
8. **Mobile nav positioned with a fixed 64px offset** (could overlap the header); fixed to
   top-anchored menu. Plus `scroll-margin-top` for sticky-header anchor jumps, focus-visible
   styles, skip link, `aria-live` quote price, labelled form fields, image dimensions.
9. **Removed dead code:** unused `--coral` variable, obsolete `keywords` meta, fake
   `aggregateRating`, marketing `console.log`.

## Features that require external services / a backend

These are **not** working in this demo — by design, no backend is included:

| Feature | Needs | Easiest free option |
|---|---|---|
| Contact / booking form actually sending | Form endpoint or CRM | Formspree (free tier) or Netlify Forms — add `action=` to the forms |
| Booking confirmations by email / SMS | Email + SMS provider | Formspree / Resend + Twilio; or a booking tool (Calendly, Jobber, Housecall Pro) |
| Taking payment | Payment provider | Stripe Checkout / Square — never collect card details in this form |
| Real WhatsApp chat | A real WhatsApp Business number | Replace `whatsappNumber` in `config.js`, then the gated button opens `wa.me/…` |
| Real reviews / star rating | Review platform | Google Business Profile — only publish a rating you earned |
| Analytics | Analytics account | Google Analytics 4 + Search Console |
| Real photos | Your own photos | Replace the 2 Unsplash URLs in `index.html` |
| Live availability / calendar | Booking system | Calendly / Google Calendar (with consent) |

Without those, the site is a complete front-end demo: it validates, calculates and prepares
a request locally (copy / download as `.txt`), but sends and stores nothing.

## How this helps a real cleaning company generate leads

1. **Price before email:** the hero calculator gives a price before asking for details.
2. **No dead ends:** every section ends in Get a Quote / Try booking / Contact.
3. **Trust, honestly:** verified claims only, a sample checklist, and a clear no-backend note
   — so a real business can add its real proof without rewriting the site.
4. **Pricing steers profit:** transparent packages push visitors toward Signature recurring.
5. **Local SEO ready:** Austin-focused headings, service areas, `LocalBusiness` schema
   (add a real rating only when earned).
6. **Mobile-first:** sticky Book button, tap-to-call and WhatsApp float turn a phone scroll
   into a booking request — once the backend in the table above is connected.
