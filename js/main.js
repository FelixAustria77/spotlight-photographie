/* ============================================================
   Spotlight-Photographie – main.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     1. NAVBAR – transparent → frosted on scroll
  ---------------------------------------------------------- */
  const navbar = document.getElementById('navbar');

  function handleNavbarScroll() {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll(); // initial check


  /* ----------------------------------------------------------
     2. MOBILE MENU – toggle
  ---------------------------------------------------------- */
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIconOpen = document.getElementById('menu-icon-open');
  const menuIconClose = document.getElementById('menu-icon-close');

  function openMenu() {
    mobileMenu.classList.add('open');
    menuIconOpen.classList.add('hidden');
    menuIconClose.classList.remove('hidden');
    menuToggle.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    mobileMenu.classList.remove('open');
    menuIconOpen.classList.remove('hidden');
    menuIconClose.classList.add('hidden');
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      if (mobileMenu.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  // Close menu when a nav link is clicked
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (mobileMenu && mobileMenu.classList.contains('open')) {
      if (!navbar.contains(e.target)) {
        closeMenu();
      }
    }
  });


  /* ----------------------------------------------------------
     3. SCROLL REVEAL – Intersection Observer
  ---------------------------------------------------------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal-on-scroll').forEach(el => {
    revealObserver.observe(el);
  });


  /* ----------------------------------------------------------
     4. GALLERY FILTER
  ---------------------------------------------------------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      galleryItems.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.classList.remove('hidden-item');
        } else {
          item.classList.add('hidden-item');
        }
      });
    });
  });


  /* ----------------------------------------------------------
     5. LIGHTBOX
  ---------------------------------------------------------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  let currentLightboxIndex = 0;
  let visibleItems = [];

  function openLightbox(index) {
    visibleItems = [...document.querySelectorAll('.gallery-item:not(.hidden-item)')];
    currentLightboxIndex = index;
    updateLightboxImage();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function updateLightboxImage() {
    const item = visibleItems[currentLightboxIndex];
    if (!item) return;
    const img = item.querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    if (lightboxCaption) {
      lightboxCaption.textContent = img.alt;
    }
  }

  function prevImage() {
    currentLightboxIndex = (currentLightboxIndex - 1 + visibleItems.length) % visibleItems.length;
    updateLightboxImage();
  }

  function nextImage() {
    currentLightboxIndex = (currentLightboxIndex + 1) % visibleItems.length;
    updateLightboxImage();
  }

  // Attach click to gallery items
  document.querySelectorAll('.gallery-item').forEach((item, idx) => {
    item.addEventListener('click', () => {
      // Recalculate visible index based on currently visible items
      visibleItems = [...document.querySelectorAll('.gallery-item:not(.hidden-item)')];
      const visibleIdx = visibleItems.indexOf(item);
      openLightbox(visibleIdx >= 0 ? visibleIdx : 0);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', prevImage);
  if (lightboxNext) lightboxNext.addEventListener('click', nextImage);

  // Close on backdrop click
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  });


  /* ----------------------------------------------------------
     6. CONTACT FORM – Validierung & Absenden
  ---------------------------------------------------------- */
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const formStatus = document.getElementById('form-status');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Basic validation
      const name = form.querySelector('#name').value.trim();
      const email = form.querySelector('#email').value.trim();
      const message = form.querySelector('#message').value.trim();

      if (!name || !email || !message) {
        showFormStatus('Bitte füllen Sie alle Pflichtfelder aus.', 'error');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showFormStatus('Bitte geben Sie eine gültige E-Mail-Adresse ein.', 'error');
        return;
      }

      // Loading state
      submitBtn.disabled = true;
      submitBtn.textContent = 'Wird gesendet…';

      try {
        // Formspree integration (replace YOUR_FORM_ID with actual ID)
        // const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        //   body: JSON.stringify({ name, email, message,
        //     service: form.querySelector('#service').value,
        //     date: form.querySelector('#date').value })
        // });
        // if (!response.ok) throw new Error('Fehler beim Senden');

        // Simulate success (remove when Formspree is connected)
        await new Promise(resolve => setTimeout(resolve, 800));

        showFormStatus('Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet. Ich melde mich innerhalb von 24 Stunden bei Ihnen.', 'success');
        form.reset();

      } catch (err) {
        showFormStatus('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie mich direkt per E-Mail.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Nachricht senden';
      }
    });
  }

  function showFormStatus(message, type) {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.className = 'mt-4 text-center font-body text-sm p-4 ';
    if (type === 'success') {
      formStatus.className += 'bg-olive-100 text-olive-800 border border-olive-200';
    } else {
      formStatus.className += 'bg-red-50 text-red-700 border border-red-200';
    }
    formStatus.classList.remove('hidden');
    formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

});
