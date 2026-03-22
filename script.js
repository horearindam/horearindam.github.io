/* ==============================================
   script.js — Portfolio interactions
   ============================================== */

'use strict';

/* ------------------------------------------
   Theme Toggle (dark / light)
   ------------------------------------------ */
const themeToggle = document.getElementById('themeToggle');
const THEME_KEY   = 'portfolio-theme';

// Apply saved theme immediately (before paint)
(function applyStoredTheme() {
  if (localStorage.getItem(THEME_KEY) === 'light') {
    document.body.classList.add('light');
  }
})();

themeToggle.addEventListener('click', () => {
  const isLight = document.body.classList.toggle('light');
  localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');

  // Brief pop animation on the button
  themeToggle.style.transform = 'rotate(360deg) scale(1.15)';
  setTimeout(() => { themeToggle.style.transform = ''; }, 400);
});


/* ------------------------------------------
   Loading Screen
   ------------------------------------------ */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');

  // Hide loader after the fill bar animation completes (~700ms)
  setTimeout(() => {
    loader.classList.add('hidden');

    // Trigger hero reveal animations
    document.querySelectorAll('.reveal-up').forEach(el => {
      el.classList.add('playing');
    });

    // Start typing after a short pause
    setTimeout(startTyping, 500);
  }, 850);
});


/* ------------------------------------------
   Navbar: scroll shadow + active state
   ------------------------------------------ */
const navbar = document.getElementById('navbar');

let lastScrollY = 0;

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  // Add/remove "scrolled" class for blur effect
  navbar.classList.toggle('scrolled', scrollY > 20);

  // Highlight active section in nav
  highlightActiveLink();

  lastScrollY = scrollY;
}, { passive: true });


/* ------------------------------------------
   Active nav link based on scroll position
   ------------------------------------------ */
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

function highlightActiveLink() {
  const navH   = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
  const offset = navH + 80;
  let current  = '';

  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - offset) {
      current = section.id;
    }
  });

  navLinks.forEach(link => {
    const isActive = link.getAttribute('href') === `#${current}`;
    link.classList.toggle('active', isActive);
  });
}


/* ------------------------------------------
   Smooth scroll for all # anchors
   ------------------------------------------ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
    const top  = target.getBoundingClientRect().top + window.pageYOffset - navH;

    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ------------------------------------------
   Mobile Menu Toggle
   ------------------------------------------ */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
});

// Close mobile menu when a link is clicked
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
  });
});

// Close mobile menu on outside click
document.addEventListener('click', (e) => {
  if (
    mobileMenu.classList.contains('open') &&
    !mobileMenu.contains(e.target) &&
    !hamburger.contains(e.target)
  ) {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
  }
});


/* ------------------------------------------
   Intersection Observer: scroll fade-in
   ------------------------------------------ */
const fadeEls = document.querySelectorAll('.fade-in');

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      // Stagger siblings within the same parent for a cascade effect
      const parent   = entry.target.closest('.section-container, .projects-grid, .experience-list') || entry.target.parentElement;
      const siblings = Array.from(parent.querySelectorAll(':scope > .fade-in, .project-card.fade-in, .exp-item.fade-in'));
      const index    = siblings.indexOf(entry.target);
      const delay    = Math.min(index * 90, 400); // cap at 400ms total stagger

      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);

      io.unobserve(entry.target);
    });
  },
  {
    threshold:  0.08,
    rootMargin: '0px 0px -50px 0px',
  }
);

fadeEls.forEach(el => io.observe(el));


/* ------------------------------------------
   Typing Animation
   ------------------------------------------ */
const phrases = [
  'Systems Programmer',
  'OS Enthusiast',
  'Low-Level Hacker',
  'Embedded Developer',
  'Compiler Explorer',
];

const typingEl = document.getElementById('typingText');
const cursorEl = document.getElementById('cursor');

let phraseIdx  = 0;
let charIdx    = 0;
let isDeleting = false;
let typeTimer  = null;

function type() {
  if (!typingEl) return;

  const phrase = phrases[phraseIdx];

  if (isDeleting) {
    typingEl.textContent = phrase.slice(0, charIdx - 1);
    charIdx--;
  } else {
    typingEl.textContent = phrase.slice(0, charIdx + 1);
    charIdx++;
  }

  let delay = isDeleting ? 45 : 85;

  if (!isDeleting && charIdx === phrase.length) {
    // Pause before deleting
    delay      = 2200;
    isDeleting = true;
  } else if (isDeleting && charIdx === 0) {
    // Move to next phrase
    isDeleting  = false;
    phraseIdx   = (phraseIdx + 1) % phrases.length;
    delay       = 380;
  }

  typeTimer = setTimeout(type, delay);
}

function startTyping() {
  if (typingEl) type();
}

// Pause typing when tab is not visible to save resources
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearTimeout(typeTimer);
  } else {
    type();
  }
});


/* ------------------------------------------
   Keyboard accessibility: close mobile menu
   on Escape key
   ------------------------------------------ */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
    hamburger.focus();
  }
});


/* ------------------------------------------
   Reduced-motion: respect user preference
   ------------------------------------------ */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches) {
  // Skip typing animation for users who prefer reduced motion
  if (typingEl) typingEl.textContent = 'Systems Programmer';
  if (cursorEl) cursorEl.style.animation = 'none';

  // Make all fade-in elements immediately visible
  document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
  document.querySelectorAll('.reveal-up').forEach(el => el.classList.add('playing'));
}
