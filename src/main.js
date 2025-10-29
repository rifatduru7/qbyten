// Main client bundle: header scroll + scroll animations (extracted from inline)

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
  const navCenter = document.querySelector('.nav-center');
  
  if (mobileMenuToggle && mobileMenuOverlay && navCenter) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenuToggle.classList.toggle('active');
      navCenter.classList.toggle('active');
      mobileMenuOverlay.classList.toggle('active');
      
      // Prevent body scroll when menu is open
      if (navCenter.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    });
    
    // Close menu when clicking overlay
    mobileMenuOverlay.addEventListener('click', () => {
      mobileMenuToggle.classList.remove('active');
      navCenter.classList.remove('active');
      mobileMenuOverlay.classList.remove('active');
      document.body.style.overflow = 'auto';
    });
    
    // Close menu when clicking on menu items
    const navLinks = navCenter.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuToggle.classList.remove('active');
        navCenter.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
      });
    });
    
    // Close menu on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navCenter.classList.contains('active')) {
        mobileMenuToggle.classList.remove('active');
        navCenter.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    });
  }

  // Logo Scroll Efekti
  const header = document.querySelector('header');
  const logo = document.querySelector('.logo');
  const onScroll = () => {
    if (!header || !logo) return;
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
      logo.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
      logo.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Scroll Animasyon Observer
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15,
  };

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  const animatedElements = document.querySelectorAll(
    '.scroll-fade-in, .scroll-slide-left, .scroll-slide-right, .scroll-scale-in'
  );
  animatedElements.forEach((el) => scrollObserver.observe(el));

  // Hakkımızda Modal
  const aboutModal = document.getElementById('aboutModal');
  const aboutLink = document.getElementById('hakkimizda-link');
  const closeAbout = document.getElementById('closeModal');
  if (aboutLink && aboutModal) {
    aboutLink.addEventListener('click', (e) => {
      e.preventDefault();
      aboutModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
    aboutModal.addEventListener('click', (e) => {
      if (e.target === aboutModal) {
        aboutModal.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    });
  }
  if (closeAbout && aboutModal) {
    closeAbout.addEventListener('click', () => {
      aboutModal.classList.remove('active');
      document.body.style.overflow = 'auto';
    });
  }

  // İletişim Modal
  const contactModal = document.getElementById('contactModal');
  const contactLink = document.getElementById('iletisim-link');
  const closeContact = document.getElementById('closeContactModal');
  if (contactLink && contactModal) {
    contactLink.addEventListener('click', (e) => {
      e.preventDefault();
      contactModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
    contactModal.addEventListener('click', (e) => {
      if (e.target === contactModal) {
        contactModal.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    });
  }
  if (closeContact && contactModal) {
    closeContact.addEventListener('click', () => {
      contactModal.classList.remove('active');
      document.body.style.overflow = 'auto';
    });
  }

  // ESC ile modal kapatma (her ikisi için)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (aboutModal && aboutModal.classList.contains('active')) {
        aboutModal.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
      if (contactModal && contactModal.classList.contains('active')) {
        contactModal.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    }
  });
});

// Contact Form Functionality
function initContactForm() {
    const form = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');
    
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Basic validation
        if (!data.name || !data.email || !data.subject || !data.message) {
            showFormMessage('Lütfen zorunlu alanları doldurun.', 'error');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showFormMessage('Lütfen geçerli bir e-posta adresi girin.', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Gönderiliyor...</span>';
        submitBtn.disabled = true;
        
        try {
            // Simulate form submission (replace with actual API call)
            await simulateFormSubmission(data);
            
            // Show success message
            showFormMessage('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.', 'success');
            
            // Reset form
            form.reset();
            
        } catch (error) {
            // Show error message
            showFormMessage('Mesaj gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.', 'error');
        } finally {
            // Restore button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
    
    function showFormMessage(message, type) {
        if (!formMessage) return;
        
        formMessage.textContent = message;
        formMessage.className = `form-message ${type}`;
        
        // Show message with animation
        setTimeout(() => {
            formMessage.classList.add('show');
        }, 100);
        
        // Hide message after 5 seconds
        setTimeout(() => {
            formMessage.classList.remove('show');
        }, 5000);
    }
    
    async function simulateFormSubmission(data) {
        // Simulate API call delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 90% success rate
                if (Math.random() > 0.1) {
                    resolve({ success: true });
                } else {
                    reject(new Error('Simulated network error'));
                }
            }, 1500);
        });
    }
    
    // Add real-time validation feedback
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            validateField(field);
        });
        
        field.addEventListener('input', function() {
            if (field.classList.contains('error')) {
                validateField(field);
            }
        });
    });
    
    function validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Bu alan zorunludur.';
        } else if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            isValid = false;
            errorMessage = 'Geçerli bir e-posta adresi girin.';
        }
        
        // Update field appearance
        if (isValid) {
            field.classList.remove('error');
            field.classList.add('valid');
            removeFieldError(field);
        } else {
            field.classList.add('error');
            field.classList.remove('valid');
            showFieldError(field, errorMessage);
        }
        
        return isValid;
    }
    
    function showFieldError(field, message) {
        // Remove existing error message
        removeFieldError(field);
        
        // Create error message element
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: #c62828;
            font-size: 0.8rem;
            margin-top: 0.25rem;
            display: block;
        `;
        
        // Insert error message after the field
        field.parentNode.insertBefore(errorElement, field.nextSibling);
    }
    
    function removeFieldError(field) {
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }
    
    // Add input styling for valid/invalid states
    const style = document.createElement('style');
    style.textContent = `
        .form-group input.error,
        .form-group select.error,
        .form-group textarea.error {
            border-color: #c62828;
            background-color: rgba(244, 67, 54, 0.05);
        }
        
        .form-group input.valid,
        .form-group select.valid,
        .form-group textarea.valid {
            border-color: #2e7d32;
            background-color: rgba(76, 175, 80, 0.05);
        }
    `;
    document.head.appendChild(style);
}

// Services Accordion for Mobile
function initServicesAccordion() {
  const serviceCards = document.querySelectorAll('.service-card');
  const isMobile = window.innerWidth <= 768;
  
  if (!isMobile) {
    // Reset to original state on desktop
    serviceCards.forEach(card => {
      card.classList.remove('accordion');
      const content = card.querySelector('p');
      if (content) {
        content.style.display = '';
        content.style.maxHeight = '';
      }
    });
    return;
  }
  
  serviceCards.forEach((card, index) => {
    // Make cards clickable on mobile
    card.style.cursor = 'pointer';
    card.classList.add('accordion');
    
    // Store original state
    const content = card.querySelector('p');
    const title = card.querySelector('h3');
    
    if (content && title) {
      // Initially collapse all except first one
      const isExpanded = index === 0;
      content.style.display = isExpanded ? 'block' : 'none';
      content.style.maxHeight = isExpanded ? '500px' : '0';
      content.style.overflow = 'hidden';
      content.style.transition = 'max-height 0.3s ease-out, opacity 0.3s ease-out';
      content.style.opacity = isExpanded ? '1' : '0';
      
      // Add click handler
      card.addEventListener('click', function(e) {
        e.preventDefault();
        
        const wasExpanded = content.style.display === 'block';
        
        // Close all other cards
        serviceCards.forEach(otherCard => {
          if (otherCard !== card) {
            const otherContent = otherCard.querySelector('p');
            if (otherContent) {
              otherContent.style.display = 'none';
              otherContent.style.maxHeight = '0';
              otherContent.style.opacity = '0';
              otherCard.classList.remove('expanded');
            }
          }
        });
        
        // Toggle current card
        if (wasExpanded) {
          content.style.display = 'none';
          content.style.maxHeight = '0';
          content.style.opacity = '0';
          card.classList.remove('expanded');
        } else {
          content.style.display = 'block';
          // Force reflow to enable transition
          content.offsetHeight;
          content.style.maxHeight = '500px';
          content.style.opacity = '1';
          card.classList.add('expanded');
        }
      });
      
      // Add visual indicator for expandability
      const indicator = document.createElement('div');
      indicator.className = 'accordion-indicator';
      indicator.innerHTML = isExpanded ? '−' : '+';
      indicator.style.cssText = `
        position: absolute;
        top: 1rem;
        right: 1rem;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: rgba(79, 163, 209, 0.1);
        color: #4fa3d1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 18px;
        transition: transform 0.3s ease, background-color 0.3s ease;
      `;
      
      card.style.position = 'relative';
      card.appendChild(indicator);
      
      // Update indicator on click
      card.addEventListener('click', function() {
        const isExpanded = card.classList.contains('expanded');
        indicator.innerHTML = isExpanded ? '−' : '+';
        indicator.style.backgroundColor = isExpanded ? 'rgba(79, 163, 209, 0.2)' : 'rgba(79, 163, 209, 0.1)';
      });
    }
  });
}

// Initialize accordion on load and resize
document.addEventListener('DOMContentLoaded', () => {
  initServicesAccordion();
  initContactForm();
  
  // Reinitialize on window resize with debouncing
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      initServicesAccordion();
    }, 250);
  });
});

// Initialize 3D scene side-effects (to be migrated)
import './scene.js';
// Bind dynamic content with D1
import './content.js';
