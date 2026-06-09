# GDPR & Cookie Consent — QA Test Plan

**Audience:** QA / privacy reviewer running pre-launch validation when the site is fully live with GTM installed.
**Scope:** Lynch website (`index.html`, `about.html`, `contact.html`, `patreon.html`, `privacy.html`), the cookie banner, the consent persistence layer (`js/consent.js`), and the downstream GTM → GA4 + Mixpanel pipeline.
**Assumed final state:**
- GTM container snippet has been pasted into the `<!-- TODO(marketing): paste GTM container snippet ... -->` slot in every page `<head>`.
- GA4 configuration tag and Mixpanel tag are configured in GTM with consent gating (`analytics_storage` → GA4; `analytics_storage` or `ad_storage` as appropriate → Mixpanel).
- Real GTM container ID has replaced `GTM-XXXXXXX`.
- Mixpanel token has been wired and the `syncMixpanel()` stub in `js/consent.js` has been activated.

---

## 0. Tools to install before testing

| Tool | Purpose |
|---|---|
| Chrome / Firefox DevTools | Inspect `dataLayer`, `document.cookie`, `localStorage`, Network tab |
| **Google Tag Assistant** (Chrome extension) | Verify GTM fires + consent state per tag |
| **GA4 DebugView** (Admin → DebugView) | Confirm only consented events reach GA4; modeled vs full pings |
| **Mixpanel Live View** | Confirm Mixpanel only receives events after analytics opt-in |
| VPN with EU exit node (e.g., DE, FR, NL) | Required for GDPR/DMA enforcement testing |
| Incognito / fresh profile | Clean state for first-visit scenarios |

---

## 1. Pre-flight checks (one-time)

| # | Check | Pass criteria |
|---|---|---|
| 1.1 | View source on each of the 6 HTML pages | Consent Mode v2 default block is present **before** the GTM container script. No raw `GTM-XXXXXXX` placeholders remain. |
| 1.2 | GTM container preview mode | Container loads; "Consent Initialization — All Pages" trigger fires first; default state shows `analytics_storage: denied`, `ad_storage: denied`. |
| 1.3 | GA4 Configuration tag in GTM | "Consent Settings" → Requires additional consent for: `analytics_storage`. |
| 1.4 | Mixpanel tag in GTM | Same consent gating as GA4 (`analytics_storage`). |
| 1.5 | `js/consent.js` `POLICY_VERSION` | Matches the version published in `privacy.html`. Bumping the JS without updating the policy text is a defect. |
| 1.6 | `privacy.html` content | Lists the three categories, names GA4 + Mixpanel as analytics processors, states the 6-month re-ask cadence, links to the in-page Cookie settings via `data-cookie-settings`. |

---

## 2. Functional test cases

Run each case from a clean profile (DevTools → Application → Clear site data) unless noted. Test on at least one EU IP and one non-EU IP. Run on desktop Chrome, mobile Safari, and one Firefox.

### TC-01 — First visit, no prior consent

| Step | Expected |
|---|---|
| Open `index.html` from a clean profile | Banner appears ~700ms after load |
| DevTools → Application → Local Storage | `lynch_cookie_consent_v1` is **absent** |
| Console: `window.dataLayer` | Contains a `['consent','default', {...denied...}]` entry pushed before GTM |
| Network tab, filter `collect` | GA4 hit is sent **but with** `gcs=G100` (denied) and no `cid` persisted; this is a cookieless ping. No `_ga` cookie set. |
| Cookies (Application → Cookies) | No `_ga`, `_gid`, `_gcl_*`, `mp_*` cookies |
| Page navigation (click About) | Banner remains visible on next page; no consent state persisted yet |

### TC-02 — Accept all

| Step | Expected |
|---|---|
| From TC-01 state, click **Accept all** | Banner hides immediately |
| Local Storage | `lynch_cookie_consent_v1` = `{necessary:true, analytics:true, marketing:true, ts:<now>, policyVersion:1}` |
| `dataLayer` | Last `consent` entry: `['consent','update', {ad_storage:'granted', ad_user_data:'granted', ad_personalization:'granted', analytics_storage:'granted'}]` |
| Cookies | `_ga`, `_ga_<STREAMID>`, `_gid` appear within ~1s |
| GA4 DebugView | Event arrives with full client_id; `gcs=G111` |
| Mixpanel Live View | Identify + page-viewed event arrives |
| Tag Assistant | All consent-gated tags show "Consent Granted" |
| Reload page | Banner stays hidden; default-denied push and update push appear sequentially in `dataLayer`; no double prompt |

### TC-03 — Reject all

| Step | Expected |
|---|---|
| Clean profile → load `index.html` → click **Reject all** | Banner hides |
| Local Storage | Stored object has `analytics:false, marketing:false` |
| `dataLayer` last consent | All four signals `denied` |
| Cookies | No `_ga`, `_gid`, `_gcl_*`, `mp_*` set |
| Network → GA4 endpoint | Cookieless ping only (`gcs=G100`), no `cid` cookie value |
| Mixpanel Live View | No events arrive |
| Reload | Banner stays hidden; defaults remain denied |

### TC-04 — Customize, analytics-only

| Step | Expected |
|---|---|
| Clean profile → click **Customize** | Preferences panel expands |
| Toggle Analytics ON, leave Marketing OFF | aria-checked reflects clicks |
| Click **Save my choices** | Banner hides |
| Local Storage | `analytics:true, marketing:false` |
| `dataLayer` last consent | `analytics_storage:'granted'`, `ad_storage:'denied'`, `ad_user_data:'denied'`, `ad_personalization:'denied'` |
| Cookies | `_ga*` appears; no `_gcl_*` |
| GA4 DebugView | Events arrive normally |
| Google Ads tags (if any) | Tag Assistant shows "Consent Denied" |

### TC-05 — Revoke after accepting (cookie cleanup)

| Step | Expected |
|---|---|
| Run TC-02 (accept all) and verify `_ga`, `_gid`, `mp_*` cookies exist | Baseline established |
| Click footer **Cookie policy** link (`data-cookie-settings`) | Banner re-opens with prefs panel and toggles pre-filled (both on) |
| Toggle Analytics OFF and Marketing OFF → **Save my choices** | Banner hides |
| Cookies | `_ga`, `_ga_*`, `_gid`, `_gat*`, `mp_*`, `_gcl_*`, `IDE`, `test_cookie` are **gone** (or expired) |
| `dataLayer` last consent | All denied |
| GA4 DebugView | No further events from this session |
| Tag Assistant on next page nav | Tags show "Consent Denied"; only cookieless pings |

### TC-06 — Partial revoke (marketing only)

| Step | Expected |
|---|---|
| Accept all (TC-02), then re-open prefs, toggle Marketing OFF, save | Stored state: `analytics:true, marketing:false` |
| Cookies | `_ga*` preserved; `_gcl_*`, `IDE`, `test_cookie` removed |
| `dataLayer` | `analytics_storage:'granted'`, ad signals `denied` |

### TC-07 — Re-open prefs via footer link

| Step | Expected |
|---|---|
| Any state, click footer "Cookie policy" / Cookie settings on any of the 6 pages | Banner reopens with `.show-prefs` class; toggles reflect current stored state |
| Privacy page inline link `<a href="#" data-cookie-settings>` | Same behavior; no page navigation |

### TC-08 — Consent expiry (6 months)

| Step | Expected |
|---|---|
| Run TC-02 (accept) | Baseline |
| Console: `var c=JSON.parse(localStorage.lynch_cookie_consent_v1); c.ts = Date.now() - 1000*60*60*24*200; localStorage.lynch_cookie_consent_v1 = JSON.stringify(c);` | Simulates ~6.5 months old |
| Reload page | Banner reappears; toggles pre-filled with the old choices (granted) but no `update` push fires yet |
| `dataLayer` | Only the default-denied push; GA4/Mixpanel running in cookieless mode until user re-confirms |
| Click Accept all → save | New `ts` written; full consent flow resumes |

### TC-09 — Policy version bump

| Step | Expected |
|---|---|
| With an existing fresh consent state, edit `js/consent.js` → set `POLICY_VERSION = 2` and ship | On next visit, banner reappears for every prior user |
| Storage `policyVersion` field | Updated to 2 only after the user makes a new choice |

### TC-10 — localStorage unavailable

| Step | Expected |
|---|---|
| DevTools → Settings → block storage for the origin (or use Safari Private mode where storage throws) | No JS error in console |
| Banner | Shows on every page load (cannot persist) |
| `dataLayer` | Default-denied push fires; choices propagate within the session via `gtag('consent','update',...)` but do not persist across navigations |
| GA4 | Cookieless pings only |

### TC-11 — Cross-page consistency

| Step | Expected |
|---|---|
| Accept all on `index.html`, navigate to About, Patreon, Contact, Privacy, Success | Banner stays hidden everywhere |
| `dataLayer` on each page | Default-denied push then update-granted push, in that order |
| `privacy.html` Cookie settings inline link | Opens prefs, not a page reload |

### TC-12 — Contact form (functional cookies only)

| Step | Expected |
|---|---|
| With consent rejected, submit contact form | Form submits successfully; no analytics events |
| Success page | Banner reflects current consent (still rejected); no tracking pings sent |

---

## 3. Network-level GDPR verification (EU IP)

Run with a clean profile via an EU VPN exit.

| # | Check | Pass criteria |
|---|---|---|
| 3.1 | Before any consent, capture all outbound requests | No request carries a persistent identifier (`cid`, `mp_distinct_id`, `_ga` value). GA4 hits include `gcs=G100` and `dma=1` (EU). |
| 3.2 | After Reject all | Same as 3.1. Confirm no Google Ads pixel (`googleadservices.com`, `googlesyndication.com`) fires. |
| 3.3 | After Accept all | `cid` is present and stable across hits; `gcs=G111`; Mixpanel events carry `distinct_id`. |
| 3.4 | After partial (analytics only) | GA4 carries `cid`; Google Ads pixels stay blocked; `gcs=G101`. |
| 3.5 | Beacon API / `sendBeacon` on unload | No identifiers leak in unload pings when consent is denied. |
| 3.6 | Third-party iframes / fonts | Google Fonts loaded via `fonts.googleapis.com` — confirm this is documented as strictly necessary in the privacy policy, or self-host. |

---

## 4. GDPR compliance checklist (policy + UX)

| # | Requirement | Where verified | Pass |
|---|---|---|---|
| 4.1 | Consent is **opt-in**, not opt-out (no pre-ticked boxes) | Banner UI — Analytics and Marketing toggles default to `aria-checked="false"` | ☐ |
| 4.2 | "Reject all" is as prominent as "Accept all" | Banner UI — same `.ck-btn` size, both visible without scrolling | ☐ |
| 4.3 | No "consent wall" — site is usable without accepting | Try every page with Reject all; all content loads | ☐ |
| 4.4 | Granular control by purpose | Three categories with independent toggles | ☐ |
| 4.5 | Easy withdrawal, same effort as giving consent | Footer "Cookie policy" link reachable on every page; one click reopens prefs | ☐ |
| 4.6 | Withdrawal effective immediately | TC-05 confirms cookies cleared + `gtag` update fires synchronously |  ☐ |
| 4.7 | Banner does not load non-essential scripts before consent | Network tab on first load shows no GA4/Mixpanel/Ads requests until update |  ☐ |
| 4.8 | Privacy policy names processors, categories, retention, legal basis, user rights | `privacy.html` content review |  ☐ |
| 4.9 | Re-prompt cadence | 6 months (TC-08) or on policy version bump (TC-09) |  ☐ |
| 4.10 | Records of consent | Stored object has `ts`, `policyVersion`, and per-category booleans — sufficient for "proof of consent" under Art. 7(1) GDPR |  ☐ |
| 4.11 | Children — site does not collect from under-16s | Confirm no kid-targeted UX; add note in privacy if relevant |  ☐ |
| 4.12 | International transfer disclosure | GA4 and Mixpanel send data to the US — privacy policy must name them and disclose SCCs / DPF |  ☐ |
| 4.13 | DPO / contact email for data requests | Privacy policy "Contact" section links to contact form or names an email |  ☐ |
| 4.14 | Cookie inventory matches reality | Run section 5 below to confirm |  ☐ |

---

## 5. Cookie inventory (verify against live state)

Run this in DevTools console after **Accept all** on `index.html`:

```js
document.cookie.split(';').map(c => c.trim().split('=')[0]).sort().join('\n')
```

| Cookie | Set by | Category | Purpose | Expected lifetime |
|---|---|---|---|---|
| `_ga` | GA4 | Analytics | Distinguish users | 2 years |
| `_ga_<STREAM_ID>` | GA4 | Analytics | Session state | 2 years |
| `_gid` | GA4 (legacy/UA, may appear) | Analytics | Distinguish users | 24 hours |
| `_gat*` | GA4 | Analytics | Throttle | 1 minute |
| `mp_<TOKEN>_mixpanel` | Mixpanel | Analytics | Distinct id | 1 year |
| `_gcl_au` | Google Ads | Marketing | Conversion linking | 90 days |
| `IDE`, `test_cookie` | doubleclick.net | Marketing | Ad targeting | up to 13 months |

After **Reject all** the only persisted state should be `localStorage.lynch_cookie_consent_v1`. Any cookie not in this table that appears on the live site is a **defect** and must be added to the inventory + cleared in `js/consent.js`.

---

## 6. Accessibility spot checks

| # | Check |
|---|---|
| 6.1 | Banner is reachable via keyboard tab order; Accept / Reject / Customize / Save are all focusable |
| 6.2 | `role="dialog"`, `aria-live="polite"`, `aria-label="Cookie consent"` present on `#cookieWrap` |
| 6.3 | Toggle buttons have `role="switch"` and `aria-checked` updates on activation |
| 6.4 | Strictly-necessary toggle is `disabled` and announced as such by screen reader |
| 6.5 | Banner contrast meets WCAG AA |

---

## 7. Regression watch on every release

Add to the release checklist for any PR touching `js/consent.js`, the banner markup, or the GTM container:

1. Re-run TC-01, TC-02, TC-03, TC-05 (the four highest-impact paths).
2. Confirm `POLICY_VERSION` and `privacy.html` "Last updated" date are in sync.
3. Confirm no new cookies appear in section 5 that aren't gated or documented.
4. Confirm Tag Assistant shows the expected consent state for every tag.

---

## 8. Sign-off

| Role | Name | Date | Notes |
|---|---|---|---|
| QA | | | |
| Privacy / DPO | | | |
| Engineering | | | |
