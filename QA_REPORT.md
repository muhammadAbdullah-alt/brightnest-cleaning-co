# BrightNest Cleaning Co. — Quality Assurance Report (v2.0)
**Date:** 2026-11-11 · **Auditor:** Muse (senior web dev / UI-UX / QA role, as requested)
**Scope:** existing project in `workspace/cleaning-website-demo/` + hosted preview
(`brightnest-cleaning-co-website`). Visual identity preserved: deep pine / teal / gold,
Fraunces + Inter, same layout and sections. No rebuild from scratch.

## 1. Summary
**15 bugs / credibility issues found. 15 fixed in v2.0. 0 known open defects in the
source files at delivery.** One honest limitation remains (see §6): responsive behaviour
at exactly 375 / 768 / 1440 px was verified by CSS inspection and by the hosted-preview
audit, not by local headless-browser screenshots — I did not have a local screenshot
harness in this session, so I do not claim pixel-perfect screenshots were taken.

## 2. Bugs found & fixed

| # | Severity | Bug / issue | Fix | Verified how |
|---|---|---|---|---|
| 1 | High | Quote form always opened **Signature** in the booking modal, whatever cleaning type was chosen | Quote submit now opens `recommendedPackage[type]`; service cards set `qType` + recommended package | Code review + ID/attribute grep; hosted audit to re-confirm |
| 2 | High | **Initial quote price wrong:** HTML hardcoded $161 for 2-bed/2-bath Regular biweekly; formula gives $110 (129 × 0.85) | HTML fallback corrected to $110; JS renders from config on load | 12-case calculator matrix, all PASS (see §3) |
| 3 | High | Prices hardcoded in 5+ places; had already drifted (hosted $219 vs source $189) | New `js/config.js` — single source of truth; `script.js` re-renders all prices/contacts from it | Grep: no `wa.me`/`mailto:` hrefs left; prices only in config + HTML fallback |
| 4 | High | Scroll-reveal started at `opacity:0` with no fallback — sections could stay blank (flagged in v1 audit's stitched screenshot) | 2.5 s safety fallback reveals all `.reveal` elements; `<noscript>` CSS rule; IntersectionObserver guard | Code review; hosted audit to re-confirm by scrolling |
| 5 | High | Unsupported credibility claims: 4.9★, 312 homes, 12,400 cleans, 98% rebook, $1M liability, “background-checked & insured”, fake “As featured in” logos, fake `aggregateRating` in JSON-LD | All removed. Replaced with demo-transparency stats (6 services / 3 packages / 60 s flow / 0 backends), a site-wide DEMO banner, and an FAQ that states what is fictional | Grep: 0 occurrences of `4.9`, `312`, `12,400`, `Insured`, `$1M`, `background-checked`, `aggregateRating` in `index.html` |
| 6 | High | Booking form had **no email or phone** — a business could never reply to a booking | Added required, validated email + phone fields to the booking modal | ID check: all 33 script-referenced IDs exist in HTML |
| 7 | Medium | WhatsApp / mailto links opened dead placeholder numbers (555 / .demo) | Contact actions gated in `script.js` on `config.contact.*Enabled` + `isDemo`; demo clicks show a clear notice and do not navigate | Grep: 0 `wa.me` / `mailto:` hrefs in HTML; 3× `data-whatsapp`, 1× `data-email-link` |
| 8 | Medium | Contact/booking validation was `novalidate` + `checkValidity()` only — no inline errors, no phone/email format check, past dates allowed | `validateRequired()` with inline `.field-error` messages (role=alert), email regex, phone ≥7 digits, date ≥ today | Code review; error element is a `<span>` (valid inside `<label>`) |
| 9 | Medium | Forms implied requests were sent (“We'd reply within 1 hour”, “confirmation would be emailed”) | Every form now states **nothing is sent or stored**; booking shows a local summary + Download as `.txt` / copy | Text review of all success messages |
| 10 | Medium | Mobile nav used `inset:64px 0 auto 0` — could overlap/misplace under the sticky header | Nav now top-anchored (`top:0`, padding-top 76 px), toggle stays above it (`z-index:50`) | CSS review |
| 11 | Medium | Anchor jumps hid section headings under the sticky header | `section[id]{scroll-margin-top:84px}` | CSS review |
| 12 | Low | No skip link, no focus-visible style, quote price not announced, some inputs unlabelled | Skip link, `:focus-visible` outline, `aria-live="polite"` on price, `for`/`id` on all fields, `aria-hidden` on slider, autoplay pauses on hover | HTML/ID audit |
| 13 | Low | Images had no `width`/`height` (layout shift) and no error fallback | Dimensions + `fetchpriority` on hero, `loading="lazy"` on second image, `onerror` fallback | HTML review |
| 14 | Low | Dead code: unused `--coral` variable, obsolete `keywords` meta, marketing `console.log` | Removed; `robots` is now `noindex, nofollow` (deliberate for a fictional demo) | Grep: `coral` 0, `keywords` 0 |
| 15 | Low | Recurring discount was unexplained and inconsistent-looking ($289→$245 is 15%, others 20%) | Documented explicitly in `config.js` + pricing note: Essential/Signature 20% off, Premium Deep 15% off | Config comment + `#billingNote` text |

## 3. Calculator — tested (Node, from `js/config.js`)

Formula: base by type + $20/bed above 2 + $15/bath above 2, × frequency discount.
Airbnb is flat $89 (no surcharge, no discount). 12/12 PASS:

| Input | Expected | Got |
|---|---|---|
| Regular 2/2 biweekly | $110 | $110 ✓ |
| Regular 2/2 one-time | $129 | $129 ✓ |
| Regular 2/2 weekly | $103 | $103 ✓ |
| Regular 1/1 one-time | $129 | $129 ✓ |
| Deep 5/4 one-time | $339 | $339 ✓ |
| Deep 3/3 weekly | $227 | $227 ✓ |
| Deep 2/2 one-time | $249 | $249 ✓ |
| Move 2/2 one-time | $289 | $289 ✓ |
| Move 4/3 monthly | $310 | $310 ✓ |
| Airbnb 5/4 weekly | $89 | $89 ✓ |
| Airbnb 2/2 one-time | $89 | $89 ✓ |
| Regular 5/4 weekly | $175 | $175 ✓ |

Pricing toggle: Essential $129→$103, Signature $189→$151, Premium Deep $289→$245
(one-time → recurring). Verified from `config.js` values; toggle logic re-renders
`.amount` from the same config object.

## 4. Technical checks actually run (local, 2026-11-11)

- `node --check js/config.js` — PASS · `node --check js/script.js` — PASS
- HTML parses with Python `html.parser` — PASS (31,583 bytes served)
- Local server: `GET /`, `/css/style.css`, `/js/config.js`, `/js/script.js` — all **200**
- All 33 IDs referenced in `script.js` exist in `index.html` — 0 missing
- No `wa.me` / `mailto:` hrefs, no fake-rating / insurance strings — 0 found
- Total payload (local files, excl. fonts/images): ~70 KB. External: Google Fonts
  (2 families) + 2 Unsplash images (w=1000, q=80). No other third-party requests.

## 5. Responsive — 375 / 768 / 1440 px

**What was done:** CSS audit + targeted fixes, not local screenshots (see §6).
- 375 px: grids collapse to 1 column, hero H1 2.45rem, CTAs full-width, WhatsApp float
  shrinks to icon-only, float badge repositioned, modal padding reduced, `overflow-x:hidden`
  on `body`, no fixed-width element wider than the viewport was found.
- 768 px: services/pricing/steps at 2 columns, hero/split/contact at 1 column,
  hamburger menu, header phone hidden.
- 1440 px: 3-column services/pricing, max content width 1140 px, featured card scale 1.03.
- Known risk (honest): the two Unsplash images are remote — if Unsplash is slow or
  blocked, the hero falls back to the second image and the second image hides itself
  (`onerror`). Replace with local images for a production site.

## 6. What was NOT tested — do not treat as verified

- **No local headless-browser screenshots** at 375 / 768 / 1440 px in this session.
  The hosted-preview audit (artifact builder) is the second check for this — confirm
  by scrolling the hosted demo on a real phone before presenting it as finished.
- **No live-browser click-through** of the booking modal / toggle / slider locally.
  Logic was verified by code + config tests above; the hosted audit previously verified
  the same interactions on v1, and must be re-run for v2.
- **No screen-reader test.** Accessibility improvements are code-level (labels,
  skip link, aria-live, focus styles) — test with a real screen reader before launch.

## 7. Features that require external services / a backend

See README § “Features that require external services / a backend”. In short:
form delivery (Formspree / Netlify Forms), email/SMS confirmations, payments (Stripe),
real WhatsApp, real reviews, analytics, real photos, live availability. **None of these
is claimed as working in this demo.**

## 8. Final verdict

**v2.0 is a clean, honest portfolio demo.** Pricing is single-sourced, the calculator is
verified, forms validate and are explicit about storing nothing, and no unverified
business claim remains. It is **not** ready to take real bookings — that needs the
backend items in §7 plus real contact details, real reviews and real prices in
`js/config.js`. Preserve the green-and-white (pine/teal/gold) design — unchanged in v2.
