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
  preventOrphans();
  initLgpdBanner();
  trackViewContent();
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

  const CHECKOUT_URL = "https://pay.voompcreators.com.br/16531/offer/hEFvqm";

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
      const finalCheckoutUrl = new URL(CHECKOUT_URL);
      
      urlParams.forEach((value, key) => {
        // Forward all URL params to the checkout URL
        finalCheckoutUrl.searchParams.append(key, value);

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
