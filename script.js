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
     TRANSLATION HELPER
     Used by modules 8 and 10. Returns the translated string for
     the currently active language, falling back to English.
  ============================================================ */
  function t(key) {
    const lang = localStorage.getItem('apexLang') || 'en';
    return (translations[lang] || translations.en)[key] || key;
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
          showFeedback('success', t('form.successMsg'));
          form.reset();
          form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          // FormSubmit sometimes returns non-OK for the first unactivated submission
          showFeedback('error', t('form.errorMsg'));
        }
      } catch (err) {
        showFeedback('error', t('form.networkErr'));
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


  /* ============================================================
     10. LANGUAGE TOGGLE
     Three-way EN / 中文 / 日本語 toggle. Swaps every [data-i18n]
     element's text and every [data-i18n-placeholder] element's
     placeholder attribute. Persists choice in localStorage.
  ============================================================ */
  const translations = {
    en: {
      'nav.home': 'Home',
      'nav.whyUs': 'Why Us',
      'nav.testimonials': 'Testimonials',
      'nav.contact': 'Contact',

      'hero.eyebrow': 'Sustainable Wealth Management Since 2007',
      'hero.headline': 'Grow Your Wealth<br />with Confidence',
      'hero.sub': 'We craft bespoke, ESG-aligned investment strategies tailored to your financial goals, risk appetite, and long-term vision — sustainable growth backed by decades of market expertise.',
      'hero.cta.primary': 'Get Started',
      'hero.cta.secondary': 'Learn More',

      'counter.aum': 'Assets Under Management',
      'counter.clients': 'Clients Served',
      'counter.years': 'Years of Experience',

      'whyUs.eyebrow': 'Our Difference',
      'whyUs.title': 'Why Choose Us',
      'whyUs.subtitle': 'We combine deep market knowledge with ESG-focused investing and a client-first approach to build sustainable wealth that stands the test of time.',
      'card1.title': 'Personalized Strategy',
      'card1.body': 'Every portfolio is built around your unique goals, timeline, and risk tolerance — no cookie-cutter solutions.',
      'card2.title': 'Proven Track Record',
      'card2.body': 'Consistent outperformance across market cycles, with a disciplined investment process refined over 18 years.',
      'card3.title': 'Transparent Fees',
      'card3.body': 'No hidden charges. Clear fee structures so you always know exactly what you\'re paying and what you\'re getting.',
      'card4.title': 'ESG Investing',
      'card4.body': 'We integrate environmental, social, and governance criteria into every portfolio — aligning your wealth with values that drive long-term, responsible growth.',

      'testimonials.eyebrow': 'Client Stories',
      'testimonials.title': 'What Our Clients Say',
      'testimonials.subtitle': 'Real results from real people — hear from those who\'ve trusted us with their financial future.',
      't1.quote': 'Apex completely transformed my retirement planning. After 12 years with them, my portfolio has grown beyond what I thought possible. Their advisors actually listen and adjust as my life changes.',
      't1.name': 'Margaret T.',
      't1.role': 'Retired Engineer, 64',
      't2.quote': 'As a small business owner, I needed someone who understood my irregular income and business risks. Apex built a strategy that handles both — I finally feel financially secure for the first time.',
      't2.name': 'David R.',
      't2.role': 'Small Business Owner',
      't3.quote': 'The transparency Apex offers is unmatched. I know exactly where every dollar is invested and why. Their quarterly reports are clear, honest, and actually help me understand market movements.',
      't3.name': 'Priya S.',
      't3.role': 'Healthcare Executive',

      'contact.eyebrow': 'Start Today',
      'contact.title': 'Get in Touch',
      'contact.subtitle': 'Tell us about your financial goals and we\'ll reach out within one business day.',
      'form.labelName': 'Full Name ',
      'form.labelEmail': 'Email Address ',
      'form.labelPhone': 'Phone Number',
      'form.labelRange': 'Investment Range ',
      'form.labelMessage': 'Message',
      'form.rangePlaceholder': 'Select a range…',
      'form.rangeOpt1': 'Under $50,000',
      'form.rangeOpt2': '$50,000 – $250,000',
      'form.rangeOpt3': '$250,000 – $1,000,000',
      'form.rangeOpt4': '$1,000,000+',
      'form.submit': 'Send Enquiry',
      'form.successMsg': '&#10003; Thank you! Your enquiry has been sent. A member of our team will be in touch within one business day.',
      'form.errorMsg': 'Something went wrong sending your message. Please try again or email us directly at <a href="mailto:hello@apexasset.com">hello@apexasset.com</a>.',
      'form.networkErr': 'Network error — please check your connection and try again.',

      'footer.tagline': 'Building sustainable financial futures since 2007.',
      'footer.quickLinks': 'Quick Links',
      'footer.contactUs': 'Contact Us',
      'footer.disclaimer': 'Investments carry risk. Past performance does not guarantee future results. All information provided is for informational purposes only and does not constitute financial advice.',

      'ph.name': 'Jane Smith',
      'ph.email': 'jane@example.com',
      'ph.phone': '+1 (555) 000-0000',
      'ph.message': 'Tell us about your financial goals, current situation, or any questions you have…',
    },

    zh: {
      'nav.home': '首页',
      'nav.whyUs': '为何选择我们',
      'nav.testimonials': '客户评价',
      'nav.contact': '联系我们',

      'hero.eyebrow': '可持续财富管理，始于2007年',
      'hero.headline': '从容增长<br />您的财富',
      'hero.sub': '我们为您量身定制符合ESG理念的投资策略，精准契合您的财务目标、风险偏好与长远愿景——以数十年市场经验为基础，实现可持续增长。',
      'hero.cta.primary': '立即开始',
      'hero.cta.secondary': '了解更多',

      'counter.aum': '资产管理规模',
      'counter.clients': '服务客户数',
      'counter.years': '年行业经验',

      'whyUs.eyebrow': '我们的优势',
      'whyUs.title': '为何选择我们',
      'whyUs.subtitle': '我们将深厚的市场知识、ESG投资理念与客户至上的服务理念相结合，为您构建经得起时间考验的可持续财富。',
      'card1.title': '个性化策略',
      'card1.body': '每一份投资组合都围绕您的独特目标、时间规划与风险承受能力量身打造——绝无千篇一律的方案。',
      'card2.title': '卓越业绩记录',
      'card2.body': '历经多个市场周期持续跑赢基准，18年精耕细作锤炼出严谨的投资流程。',
      'card3.title': '透明费用结构',
      'card3.body': '无隐性收费。清晰的费率架构，让您随时清楚自己的每一分付出与收获。',
      'card4.title': 'ESG责任投资',
      'card4.body': '我们将环境、社会与治理标准融入每一份投资组合——让您的财富与推动长期负责任增长的价值观保持一致。',

      'testimonials.eyebrow': '客户心声',
      'testimonials.title': '客户怎么说',
      'testimonials.subtitle': '真实的人，真实的成果——听听那些将财务未来托付给我们的客户分享。',
      't1.quote': 'Apex彻底改变了我的退休规划。与他们合作12年后，我的投资组合增长幅度远超我的预期。他们的顾问真正倾听我的需求，并随着我生活的变化灵活调整策略。',
      't1.name': 'Margaret T.',
      't1.role': '退休工程师，64岁',
      't2.quote': '作为一名小企业主，我需要有人真正理解我不规律的收入和经营风险。Apex制定了一套两者兼顾的策略——我终于第一次感受到了真正的财务安全感。',
      't2.name': 'David R.',
      't2.role': '小企业主',
      't3.quote': 'Apex提供的透明度无与伦比。我清楚地知道每一分钱投向何处，以及背后的原因。他们的季度报告清晰、诚实，真正帮助我理解市场动态。',
      't3.name': 'Priya S.',
      't3.role': '医疗行业高管',

      'contact.eyebrow': '即刻起步',
      'contact.title': '与我们取得联系',
      'contact.subtitle': '请告诉我们您的财务目标，我们将在一个工作日内与您联系。',
      'form.labelName': '姓名 ',
      'form.labelEmail': '电子邮箱 ',
      'form.labelPhone': '联系电话',
      'form.labelRange': '投资金额范围 ',
      'form.labelMessage': '留言',
      'form.rangePlaceholder': '请选择金额范围…',
      'form.rangeOpt1': '5万美元以下',
      'form.rangeOpt2': '5万 – 25万美元',
      'form.rangeOpt3': '25万 – 100万美元',
      'form.rangeOpt4': '100万美元以上',
      'form.submit': '提交咨询',
      'form.successMsg': '&#10003; 感谢您的咨询！我们的团队成员将在一个工作日内与您联系。',
      'form.errorMsg': '消息发送失败，请重试，或直接发送邮件至 <a href="mailto:hello@apexasset.com">hello@apexasset.com</a>。',
      'form.networkErr': '网络错误——请检查您的网络连接后重试。',

      'footer.tagline': '自2007年起，为客户构建可持续的财务未来。',
      'footer.quickLinks': '快速链接',
      'footer.contactUs': '联系我们',
      'footer.disclaimer': '投资存在风险，过往业绩不代表未来表现。本网站所有信息仅供参考，不构成任何投资建议。',

      'ph.name': '张三',
      'ph.email': 'zhangsan@example.com',
      'ph.phone': '+86 (10) 0000-0000',
      'ph.message': '请告诉我们您的财务目标、当前状况或您有任何疑问…',
    },

    ja: {
      'nav.home': 'ホーム',
      'nav.whyUs': '選ばれる理由',
      'nav.testimonials': 'お客様の声',
      'nav.contact': 'お問い合わせ',

      'hero.eyebrow': '2007年から続く持続可能な資産運用',
      'hero.headline': '確かな自信で<br />資産を育てる',
      'hero.sub': 'お客様の財務目標、リスク許容度、長期ビジョンに合わせたESG対応の投資戦略をご提供します。数十年の市場経験に支えられた、持続可能な資産成長を実現します。',
      'hero.cta.primary': '今すぐ始める',
      'hero.cta.secondary': '詳しく見る',

      'counter.aum': '運用資産残高',
      'counter.clients': 'お客様数',
      'counter.years': '年の実績',

      'whyUs.eyebrow': '私たちの強み',
      'whyUs.title': '選ばれる理由',
      'whyUs.subtitle': '深い市場知識、ESG重視の投資哲学、お客様第一の姿勢を融合させ、時代を超えた持続可能な資産形成をご支援します。',
      'card1.title': 'オーダーメイド戦略',
      'card1.body': 'すべてのポートフォリオは、お客様固有の目標・時間軸・リスク許容度に基づいて構築されます。画一的な解決策はご提供しません。',
      'card2.title': '実績に裏打ちされた信頼',
      'card2.body': '18年にわたって磨き上げた規律ある投資プロセスで、様々な市場環境において安定的なアウトパフォーマンスを実現しています。',
      'card3.title': '透明な手数料体系',
      'card3.body': '隠れた費用は一切ありません。明確な手数料体系により、何に対していくら支払うかを常に把握できます。',
      'card4.title': 'ESG投資',
      'card4.body': '環境・社会・ガバナンス基準をすべてのポートフォリオに統合し、長期的で責任ある成長を促す価値観にお客様の資産を整合させます。',

      'testimonials.eyebrow': 'お客様の実績',
      'testimonials.title': 'お客様の声',
      'testimonials.subtitle': 'リアルな人々の実際の成果をご覧ください。資産の将来を私たちに託したお客様の体験談をお届けします。',
      't1.quote': 'Apexは私の退職後の資産計画を完全に変えてくれました。12年間のお付き合いで、ポートフォリオは想像以上に成長しました。担当アドバイザーは私の話をしっかり聞き、生活の変化に応じて柔軟に対応してくれます。',
      't1.name': 'Margaret T.',
      't1.role': '元エンジニア（64歳）',
      't2.quote': '不規則な収入と経営リスクを抱える中小企業オーナーとして、両方を理解してくれる専門家が必要でした。Apexはその双方に対応した戦略を構築してくれ、初めて本当の財務的安心感を得られました。',
      't2.name': 'David R.',
      't2.role': '中小企業経営者',
      't3.quote': 'Apexが提供する透明性は他に類を見ません。すべての資金がどこにどのような理由で投資されているかを正確に把握できます。四半期報告書も明快で誠実であり、市場動向を理解するのに本当に役立っています。',
      't3.name': 'Priya S.',
      't3.role': 'ヘルスケア業界エグゼクティブ',

      'contact.eyebrow': '今日からスタート',
      'contact.title': 'お問い合わせ',
      'contact.subtitle': '財務目標についてお聞かせください。翌営業日以内にご連絡いたします。',
      'form.labelName': 'お名前 ',
      'form.labelEmail': 'メールアドレス ',
      'form.labelPhone': '電話番号',
      'form.labelRange': '投資予定金額 ',
      'form.labelMessage': 'メッセージ',
      'form.rangePlaceholder': '金額帯を選択してください…',
      'form.rangeOpt1': '5万ドル未満',
      'form.rangeOpt2': '5万〜25万ドル',
      'form.rangeOpt3': '25万〜100万ドル',
      'form.rangeOpt4': '100万ドル以上',
      'form.submit': 'お問い合わせを送信',
      'form.successMsg': '&#10003; お問い合わせありがとうございます。翌営業日以内に担当者よりご連絡いたします。',
      'form.errorMsg': 'メッセージの送信に失敗しました。再度お試しいただくか、直接 <a href="mailto:hello@apexasset.com">hello@apexasset.com</a> までメールをお送りください。',
      'form.networkErr': 'ネットワークエラーが発生しました。接続状況をご確認の上、再度お試しください。',

      'footer.tagline': '2007年から、お客様の持続可能な財務未来を構築しています。',
      'footer.quickLinks': 'クイックリンク',
      'footer.contactUs': 'お問い合わせ',
      'footer.disclaimer': '投資にはリスクが伴います。過去のパフォーマンスは将来の結果を保証するものではありません。本サイトに記載された情報はすべて情報提供のみを目的としており、投資アドバイスを構成するものではありません。',

      'ph.name': '山田 太郎',
      'ph.email': 'yamada@example.com',
      'ph.phone': '+81 (3) 0000-0000',
      'ph.message': '財務目標、現在の状況、またはご質問などをお聞かせください…',
    },
  };

  const LANG_KEY = 'apexLang';
  const langBtns = document.querySelectorAll('.lang-btn');

  function applyLang(lang) {
    const t_map = translations[lang];
    if (!t_map) return;

    document.documentElement.lang = lang;

    // Update text content for all [data-i18n] elements
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      if (!(key in t_map)) return;

      // Labels with a required-star child: update only the leading text node
      const requiredSpan = el.querySelector('.required');
      if (requiredSpan) {
        el.childNodes[0].textContent = t_map[key];
      } else if (key === 'hero.headline' || key === 'form.successMsg' || key === 'form.errorMsg') {
        el.innerHTML = t_map[key];
      } else {
        el.textContent = t_map[key];
      }
    });

    // Update placeholder attributes for all [data-i18n-placeholder] elements
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.dataset.i18nPlaceholder;
      if (key in t_map) el.placeholder = t_map[key];
    });

    // Update active button state
    langBtns.forEach((btn) => {
      const isActive = btn.dataset.lang === lang;
      btn.classList.toggle('lang-btn--active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });

    localStorage.setItem(LANG_KEY, lang);
  }

  // Wire button clicks
  langBtns.forEach((btn) => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang));
  });

  // Restore saved language on load
  applyLang(localStorage.getItem(LANG_KEY) || 'en');

}); // end DOMContentLoaded
