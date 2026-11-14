import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Surfaces that get the cursor-tracking spotlight
const SPOTLIGHT = '.glass-card, .glass-panel, .project-card, .clean-profile-showcase';
// Surfaces that fade up when scrolled into view
const REVEAL =
  '.glass-card, .project-card, .section-title-wrap, .cta-banner, .github-callout, .about-connect-banner, .contact-form-card, .availability-card';
const TILT = '.clean-profile-showcase';
const MAX_TILT = 7; // degrees

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function updateProgress(bar) {
  if (!bar) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
  bar.style.transform = `scaleX(${progress})`;
}

function Effects() {
  const { pathname } = useLocation();
  const barRef = useRef(null);

  // Cursor glow, card spotlight, profile tilt, scroll progress
  useEffect(() => {
    const bar = barRef.current;
    const onScroll = () => updateProgress(bar);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!finePointer) {
      return () => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      };
    }

    const glow = document.querySelector('.bg-cursor-glow');
    const allowTilt = !prefersReducedMotion();
    let frame = 0;
    let x = 0;
    let y = 0;
    let target = null;
    let tilted = null;

    const resetTilt = () => {
      if (!tilted) return;
      tilted.style.removeProperty('--rx');
      tilted.style.removeProperty('--ry');
      tilted = null;
    };

    const apply = () => {
      frame = 0;
      if (glow) {
        glow.style.opacity = '1';
        glow.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      }

      let tiltTarget = null;
      let el = target instanceof Element ? target.closest(SPOTLIGHT) : null;
      while (el) {
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${x - rect.left}px`);
        el.style.setProperty('--my', `${y - rect.top}px`);

        if (allowTilt && el.matches(TILT)) {
          tiltTarget = el;
          const dx = (x - rect.left) / rect.width - 0.5;
          const dy = (y - rect.top) / rect.height - 0.5;
          el.style.setProperty('--rx', `${(-dy * MAX_TILT * 2).toFixed(2)}deg`);
          el.style.setProperty('--ry', `${(dx * MAX_TILT * 2).toFixed(2)}deg`);
        }
        el = el.parentElement ? el.parentElement.closest(SPOTLIGHT) : null;
      }

      if (tilted && tilted !== tiltTarget) resetTilt();
      tilted = tiltTarget;
    };

    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      target = e.target;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      if (glow) glow.style.opacity = '0';
      resetTilt();
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
      resetTilt();
    };
  }, []);

  // Scroll reveal, re-scanned on every route change
  useEffect(() => {
    updateProgress(barRef.current);
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) return;

    const elements = Array.from(document.querySelectorAll(REVEAL)).filter(
      (el) => !el.closest('.animate-fade-up')
    );

    const observer = new IntersectionObserver(
      (entries) => {
        let order = 0;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          observer.unobserve(el);
          el.style.animationDelay = `${order++ * 70}ms`;
          el.classList.remove('reveal-pending');
          el.classList.add('reveal-in');

          const done = (e) => {
            if (e.target !== el) return;
            el.classList.remove('reveal-in');
            el.style.animationDelay = '';
            el.removeEventListener('animationend', done);
          };
          el.addEventListener('animationend', done);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );

    elements.forEach((el) => {
      el.classList.add('reveal-pending');
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
      elements.forEach((el) => {
        el.classList.remove('reveal-pending', 'reveal-in');
        el.style.animationDelay = '';
      });
    };
  }, [pathname]);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <div className="scroll-progress-bar" ref={barRef} />
    </div>
  );
}

export default Effects;
