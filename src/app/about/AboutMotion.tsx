'use client';

import { useEffect, type MouseEvent, type ReactNode } from 'react';

export function ExploreFeaturesLink({ children, className }: { children: ReactNode; className?: string }) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    // Keep native behavior for modifier clicks, and preserve the anchor fallback.
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const section = document.getElementById('features');
    if (!section) return;

    event.preventDefault();
    if (window.location.hash !== '#features') {
      window.history.pushState(null, '', '#features');
    }
    section.focus({ preventScroll: true });
    section.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
  }

  return <a href="#features" className={className} onClick={handleClick}>{children}</a>;
}

export function AboutMotion() {
  useEffect(() => {
    const root = document.getElementById('bytemeet-about');
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!root || preference.matches || !('IntersectionObserver' in window) || !('animate' in Element.prototype)) return;

    const animations = new Set<Animation>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (preference.matches) continue;
        const element = entry.target as HTMLElement;
        const delay = Number(element.dataset.aboutDelay || 0);
        const animation = element.animate(
          [
            { opacity: 0, transform: 'translateY(24px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: 650, delay, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' }
        );
        animations.add(animation);
        animation.onfinish = animation.oncancel = () => { animations.delete(animation); };
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });

    root.querySelectorAll('[data-about-reveal]').forEach((element) => observer.observe(element));

    const handlePreferenceChange = () => {
      if (preference.matches) {
        observer.disconnect();
        animations.forEach((animation) => animation.cancel());
        animations.clear();
      }
    };
    preference.addEventListener('change', handlePreferenceChange);

    return () => {
      observer.disconnect();
      preference.removeEventListener('change', handlePreferenceChange);
      animations.forEach((animation) => animation.cancel());
      animations.clear();
    };
  }, []);

  return null;
}
