// Initialize Lucide Icons
document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  initHeader();
  initMobileMenu();
  initCurriculumAccordion();
  initFaqAccordion();
  initScrollReveal();
  initEnrollmentForm();
  initEducationToggle();
  initLightbox();
  initPhoneValidation();
  initEnrollmentModal();
  initPromotionManager();
  preventOrphans();
  initLgpdBanner();
  trackViewContent();
  initCarousels();
});

// Sticky Header behavior
function initHeader() {
  const header = document.getElementById('main-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll);
  // Run once on load in case page is refreshed while scrolled
  handleScroll();
}

// Mobile navigation menu toggle
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-btn');
  const navMenu = document.getElementById('site-nav');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!toggleBtn || !navMenu) return;

  const toggleMenu = () => {
    const isOpen = navMenu.classList.toggle('open');
    const icon = toggleBtn.querySelector('i');
    
    // Update icon between menu and x
    if (icon && typeof lucide !== 'undefined') {
      if (isOpen) {
        toggleBtn.innerHTML = '<i data-lucide="x"></i>';
      } else {
        toggleBtn.innerHTML = '<i data-lucide="menu"></i>';
      }
      lucide.createIcons();
    }
  };

  toggleBtn.addEventListener('click', toggleMenu);

  // Close menu when clicking a nav link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('open')) {
        toggleMenu();
      }
    });
  });
}

// Curriculum Accordion logic
function initCurriculumAccordion() {
  const items = document.querySelectorAll('.accordion-item');
  if (items.length === 0) return;

  items.forEach(item => {
    const toggle = item.querySelector('.accordion-toggle');
    const content = item.querySelector('.accordion-content');

    if (!toggle || !content) return;

    toggle.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Collapse all other curriculum items
      items.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherToggle = otherItem.querySelector('.accordion-toggle');
          const otherContent = otherItem.querySelector('.accordion-content');
          if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
          if (otherContent) {
            otherContent.setAttribute('aria-hidden', 'true');
            otherContent.style.maxHeight = '0px';
          }
        }
      });

      if (isActive) {
        item.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        content.setAttribute('aria-hidden', 'true');
        content.style.maxHeight = '0px';
      } else {
        item.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
        content.setAttribute('aria-hidden', 'false');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
}

// FAQ Accordion logic
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length === 0) return;

  faqItems.forEach(item => {
    const toggle = item.querySelector('.faq-toggle');
    const content = item.querySelector('.faq-content');

    if (!toggle || !content) return;

    toggle.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Collapse all other FAQ items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherToggle = otherItem.querySelector('.faq-toggle');
          const otherContent = otherItem.querySelector('.faq-content');
          if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
          if (otherContent) {
            otherContent.setAttribute('aria-hidden', 'true');
            otherContent.style.maxHeight = '0px';
          }
        }
      });

      if (isActive) {
        item.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        content.setAttribute('aria-hidden', 'true');
        content.style.maxHeight = '0px';
      } else {
        item.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
        content.setAttribute('aria-hidden', 'false');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
}

// Scroll reveal animations using IntersectionObserver
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length === 0) return;

  const observerOptions = {
    root: null, // Viewport
    rootMargin: '0px',
    threshold: 0.15 // Trigger when 15% of the element is visible
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Once animated, we don't need to observe it anymore
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  reveals.forEach(element => {
    observer.observe(element);
  });
}

// Enrollment form handling
function initEnrollmentForm() {
  const forms = document.querySelectorAll('#enrollment-form, #hero-registration-form, #hero-enrollment-form, .registration-form');
  if (forms.length === 0) return;

  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const phoneInput = form.querySelector('input[type="tel"]');
      let cleanPhone = '';

      // Phone validation & sanitization (strictly DDD + number, never +55)
      if (phoneInput) {
        const rawValue = phoneInput.value.trim();
        let digits = rawValue.replace(/\D/g, '');
        if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
          digits = digits.substring(2);
        }
        if (digits.length !== 11) {
          phoneInput.setCustomValidity('Por favor, insira o DDD e o número com 9 dígitos (ex: 11999999999).');
          phoneInput.reportValidity();
          return;
        }
        cleanPhone = digits;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      if (!submitBtn) return;

      // Loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i data-lucide="loader" class="animate-spin"></i> Processando inscrição...';
      if (typeof lucide !== 'undefined') lucide.createIcons();

      // Capture form data
      const formData = new FormData(form);
      const name = (formData.get('name') || '').trim();
      const email = (formData.get('email') || '').trim().toLowerCase();
      const education = formData.get('education') || formData.get('occupation') || '';
      const education_area = (formData.get('education_area') || '').trim();

      // Generate unique event ID for Meta CAPI deduplication
      const eventId = 'lead_' + new Date().getTime() + '_' + Math.floor(Math.random() * 1000);

      const formPayload = {
        name,
        email,
        phone: cleanPhone,
        whatsapp: cleanPhone,
        education,
        occupation: education,
        education_area,
        event_id: eventId
      };

      // Fire Meta Pixel Lead event
      if (typeof fbq === 'function') {
        fbq('track', 'Lead', {}, { eventID: eventId });
      }

      // Capture all UTM parameters from the current URL (both standard and prefixed)
      const urlParams = new URLSearchParams(window.location.search);
      const activePromo = getCurrentPromo();
      const finalCheckoutUrl = new URL(activePromo.checkoutUrl);
      
      urlParams.forEach((value, key) => {
        // Forward all URL params to the checkout URL (using set to avoid duplicate keys)
        finalCheckoutUrl.searchParams.set(key, value);

        const upperKey = key.toUpperCase();
        const lowerKey = key.toLowerCase();

        // Exact standard UTM matches
        if (lowerKey.startsWith('utm_')) {
          formPayload[lowerKey] = value;
        }
        
        // Match prefixed UTMs (e.g. WKIA_UTM_SOURCE, WK_UTM_SOURCE, etc.)
        if (upperKey.includes('UTM_SOURCE') && !formPayload.utm_source) {
          formPayload.utm_source = value;
        } else if (upperKey.includes('UTM_MEDIUM') && !formPayload.utm_medium) {
          formPayload.utm_medium = value;
        } else if (upperKey.includes('UTM_CAMPAIGN') && !formPayload.utm_campaign) {
          formPayload.utm_campaign = value;
        } else if (upperKey.includes('UTM_CONTENT') && !formPayload.utm_content) {
          formPayload.utm_content = value;
        } else if (upperKey.includes('UTM_TERM') && !formPayload.utm_term) {
          formPayload.utm_term = value;
        }
      });

      // Send to serverless API with fallback timeout
      try {
        const timeoutPromise = new Promise(resolve => setTimeout(resolve, 2500));
        const fetchPromise = fetch('/api/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formPayload)
        }).then(async response => {
          if (!response.ok) {
            const errText = await response.text();
            console.error('[Subscribe Error]', response.status, errText);
          } else {
            console.log('[Subscribe Success] Lead processado com sucesso');
          }
        }).catch(error => {
          console.error('[Subscribe Exception]', error);
        });

        // Wait for fetch or maximum 2.5s before redirecting
        await Promise.race([fetchPromise, timeoutPromise]);
      } catch (err) {
        console.error('Erro no envio:', err);
      } finally {
        submitBtn.innerHTML = '<i data-lucide="loader" class="animate-spin"></i> Redirecionando...';
        if (typeof lucide !== 'undefined') lucide.createIcons();
        window.location.href = finalCheckoutUrl.toString();
      }
    });
  });
}

// Add simple animation styles for loader and success
const customStyle = document.createElement('style');
customStyle.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  @keyframes scaleUp {
    0% { transform: scale(0.6); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
`;
document.head.appendChild(customStyle);

// Toggle education area field based on degree select
function initEducationToggle() {
  const setupToggle = (selectId, groupId, inputId) => {
    const selectEl = document.getElementById(selectId);
    const groupEl = document.getElementById(groupId);
    const inputEl = document.getElementById(inputId);

    if (!selectEl || !groupEl) return;

    selectEl.addEventListener('change', () => {
      if (selectEl.value === 'sim') {
        groupEl.classList.remove('hidden');
        if (inputEl) inputEl.setAttribute('required', 'required');
      } else {
        groupEl.classList.add('hidden');
        if (inputEl) {
          inputEl.removeAttribute('required');
          inputEl.value = ''; // Clean field
        }
      }
    });
  };

  setupToggle('hero-user-education', 'hero-education-area-group', 'hero-user-education-area');
  setupToggle('user-education', 'education-area-group', 'user-education-area');
}

// Lightbox for Vibecoding screenshot
// Lightbox for enlarging images (Vibecoding screenshot, Certificate mockup, etc.)
function initLightbox() {
  const lightbox = document.getElementById('image-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = document.querySelector('.lightbox-close');
  const triggers = document.querySelectorAll('.lightbox-trigger, .vibecoding-visual .vibe-card');

  if (!lightbox || !lightboxImg || triggers.length === 0) return;

  const openLightbox = (imgSrc) => {
    lightboxImg.src = imgSrc;
    lightbox.style.display = 'flex';
    // Force reflow
    lightbox.offsetHeight;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Stop page scroll
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Restore page scroll
    setTimeout(() => {
      if (!lightbox.classList.contains('active')) {
        lightbox.style.display = 'none';
      }
    }, 300); // Match transition speed
  };

  triggers.forEach(trigger => {
    trigger.style.cursor = 'pointer';
    trigger.addEventListener('click', () => {
      const img = trigger.tagName === 'IMG' ? trigger : trigger.querySelector('img');
      if (img) {
        openLightbox(img.src);
      }
    });
  });
  
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target === closeBtn) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}

// Brazilian phone input mask and formatting (XX) XXXXX-XXXX
function initPhoneValidation() {
  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  
  phoneInputs.forEach(phoneInput => {
    phoneInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, "");
      
      // If pasted with country code 55 (12 or 13 digits), remove it
      if (value.startsWith("55") && (value.length === 12 || value.length === 13)) {
        value = value.substring(2);
      }
      
      // Limit to 11 digits (DDD + 9 digits)
      if (value.length > 11) {
        value = value.substring(0, 11);
      }
      
      // Apply mask: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
      let formatted = value;
      if (value.length > 0) {
        formatted = "(" + value;
      }
      if (value.length > 2) {
        formatted = "(" + value.substring(0, 2) + ") " + value.substring(2);
      }
      if (value.length > 7) {
        formatted = "(" + value.substring(0, 2) + ") " + value.substring(2, 7) + "-" + value.substring(7);
      }
      
      e.target.value = formatted;
      phoneInput.setCustomValidity("");
    });
  });
}

// Enrollment Modal logic
function initEnrollmentModal() {
  const modal = document.getElementById('enrollment-modal');
  const openButtons = document.querySelectorAll('.open-modal-btn, .hero-mockup-container');
  const closeButton = modal ? modal.querySelector('.modal-close') : null;
  const overlay = modal ? modal.querySelector('.modal-overlay') : null;

  if (!modal) return;

  const openModal = () => {
    modal.style.display = 'flex';
    // Force reflow
    modal.offsetHeight;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Stop page scroll
  };

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore page scroll
    setTimeout(() => {
      if (!modal.classList.contains('active')) {
        modal.style.display = 'none';
      }
    }, 300); // Match transition duration
  };

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  if (closeButton) {
    closeButton.addEventListener('click', closeModal);
  }

  if (overlay) {
    overlay.addEventListener('click', closeModal);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

// Prevent orphan words (widows) on typography elements
function preventOrphans() {
  const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, .card-subtitle, .section-desc, .hero-subtitle, .card-title, .module-title, .badge-text');
  
  elements.forEach(el => {
    if (el.children.length === 0) {
      // Simple text-only element
      el.innerHTML = el.innerHTML.replace(/\s+([^\s]+)\s*$/, '&nbsp;$1');
    } else {
      // Element with children, process only the last text node
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
      let lastTextNode = null;
      let node;
      while ((node = walker.nextNode())) {
        if (node.nodeValue.trim() !== '') {
          lastTextNode = node;
        }
      }
      
      if (lastTextNode) {
        lastTextNode.nodeValue = lastTextNode.nodeValue.replace(/\s+([^\s]+)\s*$/, '\u00A0$1');
      }
    }
  });
}

// LGPD Consent Banner Logic
function initLgpdBanner() {
  const banner = document.getElementById('lgpd-banner');
  const acceptBtn = document.getElementById('lgpd-accept');
  if (!banner || !acceptBtn) return;

  const consent = localStorage.getItem('lgpd_consent');
  if (!consent) {
    banner.style.display = 'flex';
  }

  acceptBtn.addEventListener('click', () => {
    localStorage.setItem('lgpd_consent', 'true');
    banner.style.display = 'none';
  });
}

// Meta CAPI ViewContent Tracking
function trackViewContent() {
  const eventId = 'view_' + new Date().getTime() + '_' + Math.floor(Math.random() * 1000);
  
  if (typeof fbq === 'function') {
    fbq('track', 'ViewContent', {}, { eventID: eventId });
  }

  // Send to backend CAPI endpoint
  fetch('/api/meta-capi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_name: 'ViewContent', event_id: eventId })
  }).catch(e => console.error('Error tracking ViewContent:', e));
}



// Carousels Logic
function initCarousels() {
  const setupCarousel = (trackId, prevBtnId, nextBtnId, dotsId, slideClass) => {
    const track = document.getElementById(trackId);
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);
    const dotsContainer = document.getElementById(dotsId);
    if (!track || !prevBtn || !nextBtn || !dotsContainer) return;

    const slides = track.querySelectorAll(slideClass);
    if (slides.length === 0) return;

    let currentIndex = 0;
    
    // Function to calculate how many slides to show based on window width
    const getVisibleSlides = () => {
      if (window.innerWidth >= 992) {
        return slideClass === '.mentor-slide' ? 3 : 2;
      } else if (window.innerWidth >= 576) {
        return 2;
      } else {
        return 1;
      }
    };

    let visibleSlides = getVisibleSlides();
    let maxIndex = Math.max(0, slides.length - visibleSlides);

    // Create dots
    const updateDots = () => {
      dotsContainer.innerHTML = '';
      for (let i = 0; i <= maxIndex; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot-indicator');
        if (i === currentIndex) dot.classList.add('active');
        dot.addEventListener('click', () => {
          currentIndex = i;
          updateCarousel();
        });
        dotsContainer.appendChild(dot);
      }
    };

    const updateCarousel = () => {
      // Calculate slide width including gap
      const slideWidth = slides[0].offsetWidth;
      // The gap is 24px as per CSS (.carousel-track-container { gap: 24px; })
      const gap = 24; 
      const moveDistance = (slideWidth + gap) * currentIndex;
      track.style.transform = `translateX(-${moveDistance}px)`;
      
      // Update dots active state
      Array.from(dotsContainer.children).forEach((dot, index) => {
        if (index === currentIndex) dot.classList.add('active');
        else dot.classList.remove('active');
      });
      
      // Update button states
      prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
      prevBtn.style.cursor = currentIndex === 0 ? 'default' : 'pointer';
      nextBtn.style.opacity = currentIndex === maxIndex ? '0.5' : '1';
      nextBtn.style.cursor = currentIndex === maxIndex ? 'default' : 'pointer';
    };

    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    });

    nextBtn.addEventListener('click', () => {
      if (currentIndex < maxIndex) {
        currentIndex++;
        updateCarousel();
      }
    });

    window.addEventListener('resize', () => {
      const newVisibleSlides = getVisibleSlides();
      if (newVisibleSlides !== visibleSlides) {
        visibleSlides = newVisibleSlides;
        maxIndex = Math.max(0, slides.length - visibleSlides);
        if (currentIndex > maxIndex) currentIndex = maxIndex;
        updateDots();
        updateCarousel();
      } else {
        updateCarousel();
      }
    });

    // Initialize
    updateDots();
    updateCarousel();
  };

  setupCarousel('mentors-track', 'mentors-prev', 'mentors-next', 'mentors-dots', '.mentor-slide');
  setupCarousel('testimonials-track', 'testimonials-prev', 'testimonials-next', 'testimonials-dots', '.testimonial-slide');
}

// ==========================================================================
// Promotional Campaign Manager (Dynamic phases, Pop-up & Fixed Banner)
// ==========================================================================

const PROMO_CONFIG = {
  phase1: {
    // Until 30/09 23:59:59 Brasília Time (UTC-3)
    deadline: new Date('2026-09-30T23:59:59-03:00'),
    discountAmount: '200',
    discountFormatted: 'R$ 200',
    priceOriginal: '497,00',
    priceCurrent: '297,00',
    installments: 'R$ 29,70',
    dateLabel: '30/09',
    badgeText: '⚡ CONDIÇÃO ESPECIAL DE LANÇAMENTO',
    titleDiscount: 'R$ 200 de Desconto',
    modalDescHtml: 'Aproveite o valor promocional exclusivo de <span class="promo-strikethrough">R$ 497,00</span> por apenas <strong class="promo-highlight-price">R$ 297,00</strong> (ou 12x de R$ 29,70). Válido até o dia <strong>30/09</strong>!',
    modalCtaText: 'Garantir R$ 200 de Desconto',
    bannerTagText: 'R$ 200 OFF',
    bannerHighlightText: 'Valor Promocional até 30/09:',
    bannerPricingHtml: 'De <del>R$ 497</del> por apenas <strong>R$ 297</strong> (ou 12x de R$ 29,70)',
    bannerBtnText: 'Garantir Desconto',
    checkoutUrl: 'https://pay.voompcreators.com.br/0OL0RYRjOIhiJwBj/offer/zuifLN/?cupom=WORKSHOPIA200'
  },
  phase2: {
    // From 01/10 00:00:00 to 07/10 23:59:59 Brasília Time (UTC-3)
    deadline: new Date('2026-10-07T23:59:59-03:00'),
    discountAmount: '100',
    discountFormatted: 'R$ 100',
    priceOriginal: '497,00',
    priceCurrent: '397,00',
    installments: 'R$ 39,70',
    dateLabel: '07/10',
    badgeText: '⚡ SEGUNDO LOTE PROMOCIONAL',
    titleDiscount: 'R$ 100 de Desconto',
    modalDescHtml: 'Aproveite o valor promocional de <span class="promo-strikethrough">R$ 497,00</span> por apenas <strong class="promo-highlight-price">R$ 397,00</strong> (ou 12x de R$ 39,70). Válido até o dia <strong>07/10</strong>!',
    modalCtaText: 'Garantir R$ 100 de Desconto',
    bannerTagText: 'R$ 100 OFF',
    bannerHighlightText: 'Valor Promocional até 07/10:',
    bannerPricingHtml: 'De <del>R$ 497</del> por apenas <strong>R$ 397</strong> (ou 12x de R$ 39,70)',
    bannerBtnText: 'Garantir Desconto',
    checkoutUrl: 'https://pay.voompcreators.com.br/0OL0RYRjOIhiJwBj/offer/zuifLN?cupom=WORKSHOPIA100'
  }
};

function getCurrentPromo() {
  const now = new Date();
  if (now <= PROMO_CONFIG.phase1.deadline) {
    return { phase: 1, ...PROMO_CONFIG.phase1 };
  } else if (now <= PROMO_CONFIG.phase2.deadline) {
    return { phase: 2, ...PROMO_CONFIG.phase2 };
  } else {
    return { phase: 3, expired: true, ...PROMO_CONFIG.phase2 };
  }
}

function initPromotionManager() {
  const promoModal = document.getElementById('promo-modal');
  const promoBanner = document.getElementById('promo-fixed-banner');
  const enrollmentModal = document.getElementById('enrollment-modal');
  
  const currentPromo = getCurrentPromo();

  // If promotion completely expired after Oct 7th
  if (currentPromo.expired) {
    if (promoBanner) promoBanner.style.display = 'none';
    if (promoModal) promoModal.style.display = 'none';
    return;
  }

  // 1. Update Promo Modal Content
  if (promoModal) {
    const discountTitleEl = document.getElementById('promo-discount-title');
    const descEl = document.getElementById('promo-modal-desc');
    const btnTextEl = document.getElementById('promo-btn-text');
    const closeBtn = document.getElementById('promo-modal-close');
    const overlay = document.getElementById('promo-modal-overlay');
    const ctaBtn = document.getElementById('promo-modal-cta');

    if (discountTitleEl) discountTitleEl.textContent = currentPromo.titleDiscount;
    if (descEl) descEl.innerHTML = currentPromo.modalDescHtml;
    if (btnTextEl) btnTextEl.textContent = currentPromo.modalCtaText;

    const openModal = () => {
      // Don't open if enrollment modal is already open
      if (enrollmentModal && enrollmentModal.classList.contains('active')) return;
      promoModal.style.display = 'flex';
      promoModal.offsetHeight; // Force reflow
      promoModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      promoModal.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => {
        if (!promoModal.classList.contains('active')) {
          promoModal.style.display = 'none';
        }
      }, 300);
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && promoModal.classList.contains('active')) {
        closeModal();
      }
    });

    if (ctaBtn) {
      ctaBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
        // Trigger enrollment modal
        setTimeout(() => {
          if (enrollmentModal) {
            enrollmentModal.style.display = 'flex';
            enrollmentModal.offsetHeight;
            enrollmentModal.classList.add('active');
            document.body.style.overflow = 'hidden';
          }
        }, 150);
      });
    }

    // Automatically open modal once user enters the page (after short 600ms delay)
    setTimeout(() => {
      openModal();
    }, 600);
  }

  // 2. Update Fixed Bottom Banner Content
  if (promoBanner) {
    const tagTextEl = document.getElementById('banner-tag-text');
    const highlightEl = document.getElementById('banner-text-highlight');
    const pricingEl = document.getElementById('banner-pricing');
    const bannerBtnTextEl = document.getElementById('banner-btn-text');
    const bannerCtaBtn = document.getElementById('promo-banner-cta');

    if (tagTextEl) tagTextEl.textContent = currentPromo.bannerTagText;
    if (highlightEl) highlightEl.textContent = currentPromo.bannerHighlightText;
    if (pricingEl) pricingEl.innerHTML = currentPromo.bannerPricingHtml;
    if (bannerBtnTextEl) bannerBtnTextEl.textContent = currentPromo.bannerBtnText;

    if (bannerCtaBtn) {
      bannerCtaBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (enrollmentModal) {
          enrollmentModal.style.display = 'flex';
          enrollmentModal.offsetHeight;
          enrollmentModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    }
  }

  // 3. Update Pricing Section on the page
  const sectionPriceVal = document.getElementById('section-price-val');
  const sectionPriceDetail = document.getElementById('section-price-detail');
  if (sectionPriceVal) sectionPriceVal.textContent = currentPromo.priceCurrent;
  if (sectionPriceDetail) sectionPriceDetail.textContent = `ou em até 12x de ${currentPromo.installments}`;

  // 4. Live Countdown Logic for both Pop-up and Fixed Banner
  const popupDays = document.getElementById('popup-days');
  const popupHours = document.getElementById('popup-hours');
  const popupMinutes = document.getElementById('popup-minutes');
  const popupSeconds = document.getElementById('popup-seconds');

  const bannerDays = document.getElementById('banner-days');
  const bannerHours = document.getElementById('banner-hours');
  const bannerMinutes = document.getElementById('banner-minutes');
  const bannerSeconds = document.getElementById('banner-seconds');

  function updateTimers() {
    const now = new Date();
    const active = getCurrentPromo();
    const diff = active.deadline.getTime() - now.getTime();

    if (diff <= 0) {
      const zeros = '00';
      if (popupDays) popupDays.textContent = zeros;
      if (popupHours) popupHours.textContent = zeros;
      if (popupMinutes) popupMinutes.textContent = zeros;
      if (popupSeconds) popupSeconds.textContent = zeros;

      if (bannerDays) bannerDays.textContent = zeros;
      if (bannerHours) bannerHours.textContent = zeros;
      if (bannerMinutes) bannerMinutes.textContent = zeros;
      if (bannerSeconds) bannerSeconds.textContent = zeros;
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    const dStr = String(d).padStart(2, '0');
    const hStr = String(h).padStart(2, '0');
    const mStr = String(m).padStart(2, '0');
    const sStr = String(s).padStart(2, '0');

    if (popupDays) popupDays.textContent = dStr;
    if (popupHours) popupHours.textContent = hStr;
    if (popupMinutes) popupMinutes.textContent = mStr;
    if (popupSeconds) popupSeconds.textContent = sStr;

    if (bannerDays) bannerDays.textContent = dStr;
    if (bannerHours) bannerHours.textContent = hStr;
    if (bannerMinutes) bannerMinutes.textContent = mStr;
    if (bannerSeconds) bannerSeconds.textContent = sStr;
  }

  updateTimers();
  setInterval(updateTimers, 1000);
}
