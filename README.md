# Apex Asset Management

A modern, sustainability-focused one-page website for an ESG asset management firm — built with pure HTML, CSS, and vanilla JavaScript. No frameworks, no build step.

**Live site:** https://AC9999123.github.io/AC999/

## Preview

![Apex Asset Management](screenshot.png)

---

## Features

- **Sticky navigation** — transparent on hero, solidifies to forest green on scroll; hamburger menu on mobile
- **Hero section** — full-viewport forest green gradient with animated number counters (AUM, clients, years)
- **Why Choose Us** — 4 feature cards (Personalized Strategy, Proven Track Record, Transparent Fees, ESG Investing) with hover lift and staggered fade-in
- **Testimonials carousel** — auto-rotates every 5 s, supports swipe, keyboard, and dot navigation
- **Enquiry form** — client-side validation, async submission via FormSubmit (no backend needed)
- **Responsive** — mobile-first, tested from 320 px to 1920 px
- **Scroll animations** — IntersectionObserver fade-in on all sections

## Tech Stack

| Layer | Choice |
|-------|--------|
| Markup | HTML5 (semantic, ARIA labelled) |
| Styles | CSS3 — custom properties, CSS Grid, Flexbox, `clamp()` |
| Behaviour | Vanilla JavaScript (ES2020, `'use strict'`) |
| Form delivery | [FormSubmit.co](https://formsubmit.co) |
| Hosting | GitHub Pages via GitHub Actions |

## Project Structure

```
index.html                  # All markup — 6 sections in DOM order
styles.css                  # All styles — numbered sections mirror HTML order
script.js                   # All behaviour — 9 modules inside one DOMContentLoaded
.github/
    workflows/
        deploy.yml          # Deploys to GitHub Pages on every push to main
CLAUDE.md                   # Codebase guide for Claude Code
```

## Running Locally

No build step required — open `index.html` directly in any modern browser:

```bash
# Windows
start index.html

# macOS / Linux
open index.html
```

Or serve with any static file server:

```bash
npx serve .
# → http://localhost:3000
```

## Form Setup (FormSubmit)

The enquiry form uses [FormSubmit.co](https://formsubmit.co) for zero-backend email delivery.

1. Open `index.html` and confirm the `<form action>` uses your real email address.
2. Submit the form once — FormSubmit sends a one-time activation email; click the link in it.
3. All subsequent submissions are delivered to your inbox.

To enable reCAPTCHA, change the `_captcha` hidden input from `false` to `true`.

## Deployment

Pushes to `main` automatically deploy to GitHub Pages via the included Actions workflow. No manual steps needed after initial setup.

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#0d3321` | Nav, footer, testimonials background |
| `--color-primary-lt` | `#166534` | Hover states, active links |
| `--color-accent` | `#4ade80` | CTAs, logo mark, counter numbers, card icons |
| `--color-accent-dk` | `#16a34a` | Accent hover state |
| `--color-bg` | `#f0fdf4` | Page background (green-tinted white) |
| `--color-bg-alt` | `#dcfce7` | Alternate section background |
| `--color-text` | `#052e16` | Body text |
| `--color-text-muted` | `#4d7c6a` | Secondary text |

All tokens are CSS custom properties in `:root` — change one value to re-theme the entire site.

## License

MIT
