# Cute Dog Content

Static HTML/CSS/JS site. No frameworks, no build tools.

## Local preview

Because pages link assets with absolute paths (e.g. `/css/styles.css`), open
the site through a local web server, not by double-clicking the HTML files.

Pick one:

```bash
# Python 3 (built in on macOS / Linux)
python3 -m http.server 8000

# Node (if you have it)
npx serve .
```

Then visit <http://localhost:8000>.

## Project structure

```
/
├── index.html         # Home
├── about.html         # About us
├── patreon.html       # Patreon landing
├── contact.html       # Contact form
├── privacy.html       # Privacy policy
├── css/styles.css     # Shared stylesheet
├── js/                # Page scripts (added in later milestones)
└── images/
    ├── dog-photos/    # Pool for success-page random photo
    └── placeholders/  # Hero / about / patreon imagery
```

## Milestones

- **M1** Skeleton & shared layout ✓
- **M2** Static page content
- **M3** Contact form + success page
- **M4** Newsletter signup (Brevo)
- **M5** GDPR: consent banner ✓ (GTM gating deferred)
- **M6** Privacy policy

## Cookies set by this site

| Name | Purpose | Lifetime |
|---|---|---|
| `cdc_consent` | Stores cookie banner decision (`accepted` / `declined`) so the banner is shown only on first visit | 1 year |

## Placeholders to swap before launch

| Where | What | Replace with |
|---|---|---|
| `patreon.html`, `index.html` | Patreon CTA URL | Real Patreon page URL |
| Brevo signup form (M4) | Brevo form / API key | Real Brevo credentials |
| Contact form (M3) | Web3Forms access key | Real Web3Forms access key |
| GTM snippet (M5) | `GTM-XXXXXXX` container ID | Real GTM container ID |
| All pages | Placeholder copy | Final brand copy |
| `images/placeholders/` | Placeholder images | Real brand imagery |
| `images/dog-photos/` | (empty) | Real dog photos + update filename list in `js/success.js` |
