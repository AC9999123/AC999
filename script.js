/* ============================================================
   script.js — Apex Asset Management
   Modules:
     1.  Nav scroll behavior
     2.  Hamburger menu toggle
     3.  Smooth scroll
     4.  Counter animation (IntersectionObserver)
     5.  Scroll fade-in (IntersectionObserver)
     6.  Testimonial carousel (auto-rotate + manual)
     7.  Form client-side validation
     8.  Form async submission (fetch → FormSubmit)
     9.  Footer copyright year
============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     1. NAV SCROLL BEHAVIOR
     Adds .nav--scrolled when user scrolls past 50px so the
     nav background solidifies from transparent to navy.
  ============================================================ */
  const nav = document.querySelector('.nav');

  function handleNavScroll() {
    if (window.scrollY > 50) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // run once on load in case user refreshes mid-page


  /* ============================================================
     2. HAMBURGER MENU TOGGLE
     Toggles .nav--open on the nav element and updates
     aria-expanded for accessibility.
  ============================================================ */
  const hamburger = document.querySelector('.hamburger');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('nav--open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
      // Prevent body scroll when menu is open
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu when clicking the overlay (the ::before pseudo-element covers the backdrop)
    nav.addEventListener('click', (e) => {
      if (e.target === nav && nav.classList.contains('nav--open')) {
        closeMenu();
      }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('nav--open')) {
        closeMenu();
        hamburger.focus();
      }
    });
  }

  function closeMenu() {
    nav.classList.remove('nav--open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }


  /* ============================================================
     3. SMOOTH SCROLL
     Intercepts all anchor clicks that point to an #id and
     smooth-scrolls to the target, offsetting for the sticky nav.
  ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return; // bare hash — do nothing

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      // Close mobile menu if open
      if (nav.classList.contains('nav--open')) {
        closeMenu();
      }

      // Offset by nav height so content isn't hidden behind sticky bar
      const navHeight = nav.getBoundingClientRect().height;
      const targetY = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });


  /* ============================================================
     4. COUNTER ANIMATION
     Fires once when the .counters block enters the viewport.
     Each [data-target] number animates from 0 → target over ~2s.
     Supports integer and decimal (1dp) targets, with optional
     prefix (e.g. "$") and suffix (e.g. "B", "+", " Yrs").
  ============================================================ */
  const countersBlock = document.querySelector('.counters');

  if (countersBlock) {
    const counterEls = countersBlock.querySelectorAll('.counter-number');
    let countersStarted = false;

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !countersStarted) {
          countersStarted = true;
          counterEls.forEach(animateCounter);
          counterObserver.disconnect();
        }
      });
    }, { threshold: 0.4 });

    counterObserver.observe(countersBlock);
  }

  function animateCounter(el) {
    const target    = parseFloat(el.dataset.target);
    const prefix    = el.dataset.prefix  || '';
    const suffix    = el.dataset.suffix  || '';
    const isDecimal = el.dataset.target.includes('.');
    const duration  = 2000; // ms
    const startTime = performance.now();

    function step(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = eased * target;

      el.textContent = prefix + (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // Ensure we land exactly on the target value
        el.textContent = prefix + (isDecimal ? target.toFixed(1) : target) + suffix;
      }
    }

    requestAnimationFrame(step);
  }


  /* ============================================================
     5. SCROLL FADE-IN
     Observes all .fade-in elements and adds .visible once each
     enters the viewport, triggering the CSS opacity/translate
     transition defined in styles.css.
  ============================================================ */
  const fadeEls = document.querySelectorAll('.fade-in');

  if (fadeEls.length > 0) {
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target); // fire only once
        }
      });
    }, { threshold: 0.15 });

    fadeEls.forEach((el) => fadeObserver.observe(el));
  }


  /* ============================================================
     6. TESTIMONIAL CAROUSEL
     Slide-based carousel with:
       - Auto-rotate every 5s (paused on hover/focus)
       - Prev / Next buttons
       - Dot indicator buttons
       - Keyboard arrow support when focused
  ============================================================ */
  const carouselTrack = document.getElementById('carousel-track');
  const prevBtn       = document.querySelector('.carousel-btn--prev');
  const nextBtn       = document.querySelector('.carousel-btn--next');
  const dots          = document.querySelectorAll('.carousel-dot');
  const carouselEl    = document.querySelector('.carousel');

  if (carouselTrack && dots.length > 0) {
    const totalSlides = dots.length;
    let currentSlide  = 0;
    let autoInterval;

    function goToSlide(index) {
      // Wrap around
      currentSlide = (index + totalSlides) % totalSlides;

      carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

      // Update dots
      dots.forEach((dot, i) => {
        const isActive = i === currentSlide;
        dot.classList.toggle('carousel-dot--active', isActive);
        dot.setAttribute('aria-selected', String(isActive));
      });
    }

    function nextSlide() { goToSlide(currentSlide + 1); }
    function prevSlide() { goToSlide(currentSlide - 1); }

    // Bind prev / next buttons
    if (prevBtn) prevBtn.addEventListener('click', () => { resetAutoRotate(); prevSlide(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { resetAutoRotate(); nextSlide(); });

    // Bind dot buttons
    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.dataset.index, 10);
        resetAutoRotate();
        goToSlide(idx);
      });
    });

    // Keyboard navigation when carousel is focused
    carouselEl.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { resetAutoRotate(); prevSlide(); }
      if (e.key === 'ArrowRight') { resetAutoRotate(); nextSlide(); }
    });

    // Pause on hover / focus
    carouselEl.addEventListener('mouseenter', stopAutoRotate);
    carouselEl.addEventListener('focusin',    stopAutoRotate);
    carouselEl.addEventListener('mouseleave', startAutoRotate);
    carouselEl.addEventListener('focusout',   startAutoRotate);

    // Touch swipe support
    let touchStartX = 0;
    carouselEl.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    carouselEl.addEventListener('touchend', (e) => {
      const delta = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 40) { // minimum swipe distance
        resetAutoRotate();
        delta < 0 ? nextSlide() : prevSlide();
      }
    }, { passive: true });

    function startAutoRotate() {
      autoInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoRotate() {
      clearInterval(autoInterval);
    }

    function resetAutoRotate() {
      stopAutoRotate();
      startAutoRotate();
    }

    startAutoRotate();
  }


  /* ============================================================
     7 & 8. FORM VALIDATION + ASYNC SUBMISSION
     Validates required fields client-side, then submits via
     fetch to the FormSubmit endpoint so the page never reloads.

     NOTE: On the very first submission, FormSubmit sends a
     confirmation email to the address in the form action.
     You must click that activation link before submissions
     are delivered to your inbox.
  ============================================================ */
  const form        = document.getElementById('enquiry-form');
  const submitBtn   = document.getElementById('submit-btn');
  const feedbackEl  = document.getElementById('form-feedback');

  if (form) {

    // Clear field error on input
    form.querySelectorAll('input, select, textarea').forEach((field) => {
      field.addEventListener('input', () => clearFieldError(field));
      field.addEventListener('change', () => clearFieldError(field));
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      hideFeedback();

      const isValid = validateForm();
      if (!isValid) return;

      // Show loading state
      submitBtn.classList.add('btn--loading');
      submitBtn.disabled = true;

      try {
        const formData = new FormData(form);

        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' },
        });

        if (response.ok) {
          showFeedback(
            'success',
            '&#10003; Thank you! Your enquiry has been sent. A member of our team will be in touch within one business day.'
          );
          form.reset();
          form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          // FormSubmit sometimes returns non-OK for the first unactivated submission
          showFeedback(
            'error',
            'Something went wrong sending your message. Please try again or email us directly at <a href="mailto:hello@apexasset.com">hello@apexasset.com</a>.'
          );
        }
      } catch (err) {
        showFeedback(
          'error',
          'Network error — please check your connection and try again.'
        );
      } finally {
        submitBtn.classList.remove('btn--loading');
        submitBtn.disabled = false;
      }
    });
  }

  /* —— Validation helpers —— */

  function validateForm() {
    let valid = true;

    const nameField     = document.getElementById('full-name');
    const emailField    = document.getElementById('email');
    const rangeField    = document.getElementById('investment-range');

    // Full Name: required, at least 2 chars
    if (!nameField.value.trim() || nameField.value.trim().length < 2) {
      showFieldError(nameField, 'Please enter your full name.');
      valid = false;
    }

    // Email: required + basic format check
    if (!emailField.value.trim()) {
      showFieldError(emailField, 'Please enter your email address.');
      valid = false;
    } else if (!isValidEmail(emailField.value.trim())) {
      showFieldError(emailField, 'Please enter a valid email address (e.g. jane@example.com).');
      valid = false;
    }

    // Investment Range: required, must not be the placeholder option
    if (!rangeField.value) {
      showFieldError(rangeField, 'Please select your investment range.');
      valid = false;
    }

    // Scroll to first error
    if (!valid) {
      const firstError = form.querySelector('.field--error');
      if (firstError) {
        const offset = nav.getBoundingClientRect().height + 20;
        const top = firstError.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
        firstError.querySelector('input, select, textarea')?.focus();
      }
    }

    return valid;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  function showFieldError(field, message) {
    const group    = field.closest('.form-group');
    const errorEl  = group.querySelector('.field-error');

    group.classList.add('field--error');
    if (errorEl) errorEl.textContent = message;

    field.setAttribute('aria-describedby', errorEl ? errorEl.id : '');
    field.setAttribute('aria-invalid', 'true');
  }

  function clearFieldError(field) {
    const group   = field.closest('.form-group');
    const errorEl = group?.querySelector('.field-error');

    group?.classList.remove('field--error');
    if (errorEl) errorEl.textContent = '';
    field.removeAttribute('aria-invalid');
  }

  function showFeedback(type, html) {
    feedbackEl.innerHTML = html;
    feedbackEl.className = `form-feedback form-feedback--${type}`;
    feedbackEl.focus?.();
    feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideFeedback() {
    feedbackEl.className = 'form-feedback';
    feedbackEl.innerHTML = '';
  }


  /* ============================================================
     9. FOOTER COPYRIGHT YEAR
     Dynamically writes the current year so the footer never
     shows a stale date.
  ============================================================ */
  const yearEl = document.getElementById('copyright-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

}); // end DOMContentLoaded
