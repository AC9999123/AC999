# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static one-page website for Apex Asset Management. No build step, no dependencies, no package manager — open `index.html` directly in a browser.

## Previewing changes

```
# Windows — open in Chrome
start chrome "index.html"

# Or double-click index.html in Explorer / drag into any browser
```

For Chrome headless screenshots (useful for quick visual checks):
```
"C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --screenshot=out.png --window-size=1440,900 "file:///ABSOLUTE/PATH/TO/index.html"
```

Note: headless screenshots capture `opacity: 0` fade-in elements before IntersectionObserver fires, so USP cards and the form will appear invisible. They look correct in a real browser.

## Architecture

Three files, no framework:

| File | Role |
|------|------|
| `index.html` | All markup. Sections in DOM order: `#home` (nav inside `<header>`), `#hero`, `#why-us`, `#testimonials`, `#contact`, `<footer>` |
| `styles.css` | All styles. Numbered sections mirror the HTML order; CSS variables in `:root` at the top govern every color, font, shadow, and spacing value |
| `script.js` | All behaviour. One `DOMContentLoaded` closure; nine named modules in comments (nav scroll, hamburger, smooth scroll, counters, fade-in, carousel, form validation, form fetch, footer year) |

### Key patterns

**CSS variables** — every color and spacing token lives in `:root`. Change `--color-accent` once to re-theme the gold highlights across the entire site.

**Scroll animations** — `.fade-in` starts `opacity:0`. `script.js` module 5 runs an `IntersectionObserver` that adds `.visible` once each element enters the viewport. The cards-grid children stagger via `transition-delay` in CSS.

**Counters** — `.counter-number` elements carry `data-target`, `data-prefix`, and `data-suffix` attributes. Module 4 drives the animation with `requestAnimationFrame` and an ease-out cubic. To change a stat, edit only the HTML attribute.

**Carousel** — purely CSS `transform: translateX`. `carouselTrack` is a flex row; `goToSlide(n)` sets `translateX(-n * 100%)`. Dot state and auto-rotate interval are managed in module 6. Adding a 4th slide requires a new `<article class="testimonial-card">` and a new dot `<button data-index="3">` — `totalSlides` is derived from `dots.length` automatically.

**Form** — submits via `fetch` to `https://formsubmit.co/YOUR_EMAIL` (module 8). The form action URL must be updated before going live. Required fields validated client-side: full name (≥2 chars), email (regex), investment range (non-empty select). Error state is the `.field--error` class on the `.form-group` wrapper.

### Responsive breakpoints

| Breakpoint | What changes |
|---|---|
| ≤ 1024px | Footer switches from 3-col to 2-col grid |
| ≤ 768px | Hamburger appears; nav slides in from right; cards stack; form rows go single-column; footer goes single-column |
| ≤ 480px | Counters stack vertically; testimonial padding reduced |

## FormSubmit activation (required before launch)

1. In `index.html`, replace `your-email@example.com` in the `<form action>` attribute with the real destination address.
2. Submit the form once — FormSubmit sends a one-time activation email to that address. Click the link in it.
3. Subsequent submissions are delivered immediately.
4. `_captcha` is `false` by default; set to `true` to add reCAPTCHA.
