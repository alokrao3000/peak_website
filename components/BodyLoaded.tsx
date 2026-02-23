'use client';

import { useEffect } from 'react';

/**
 * Ensures body gets the 'loaded' class on all pages so content is visible.
 * globals.css sets body { opacity: 0 } and body.loaded { opacity: 1 }.
 */
export default function BodyLoaded() {
  useEffect(() => {
    document.body.classList.add('loaded');
    return () => document.body.classList.remove('loaded');
  }, []);
  return null;
}
