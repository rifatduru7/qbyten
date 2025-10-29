// Main client bundle: header scroll + scroll animations (extracted from inline)

document.addEventListener('DOMContentLoaded', () => {
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

// Initialize 3D scene side-effects (to be migrated)
import './scene.js';
// Bind dynamic content with D1
import './content.js';
