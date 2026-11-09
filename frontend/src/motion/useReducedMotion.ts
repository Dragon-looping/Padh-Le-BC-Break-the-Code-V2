import { useState, useEffect } from 'react';

const STORAGE_KEY = 'padh_le_bc_reduced_motion';

export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        return saved === 'true';
      }
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(reducedMotion));
      if (reducedMotion) {
        document.body.classList.add('reduced-motion');
      } else {
        document.body.classList.remove('reduced-motion');
      }
    } catch {
      // storage error fallback
    }
  }, [reducedMotion]);

  const toggleReducedMotion = () => setReducedMotion((prev) => !prev);

  return { reducedMotion, toggleReducedMotion, setReducedMotion };
}
