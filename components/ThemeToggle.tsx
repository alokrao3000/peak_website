'use client';

import { useState } from 'react';

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label="Toggle theme"
      onClick={() => {
        setIsLight((prev) => !prev);
      }}
    >
      <i className={isLight ? 'fas fa-sun' : 'fas fa-moon'} />
    </button>
  );
}
