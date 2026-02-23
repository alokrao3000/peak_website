'use client';

import { useEffect } from 'react';

export default function LandingClient() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('animate-in');
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('.step, .team-member, .feature-badge, .stat').forEach((el) => observer.observe(el));

    const stats = document.querySelectorAll('.stat-number, .story-stat-number');
    const statObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target as HTMLElement;
          const text = target.textContent ?? '';
          const match = text.match(/\d+/);
          const finalValue = match ? parseInt(match[0], 10) : 0;
          const suffix = text.replace(/\d+/, '').trim();
          const duration = 2000;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentValue = Math.floor(progress * finalValue);
            target.textContent = currentValue.toLocaleString() + (suffix ? ` ${suffix}` : '');
            if (progress < 1) requestAnimationFrame(animate);
          };
          animate();
          statObserver.unobserve(target);
        });
      },
      { threshold: 0.5 }
    );
    stats.forEach((el) => statObserver.observe(el));

    document.body.classList.add('loaded');
    return () => {
      document.body.classList.remove('loaded');
    };
  }, []);

  return null;
}
