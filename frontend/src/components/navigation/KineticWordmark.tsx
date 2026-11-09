import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const GLYPHS = '01#@%&*<>{}[]/?+=~';
const TARGET_TEXT = 'PADH LE ';

export function KineticWordmark({ className }: { className?: string }) {
  const [displayedPrefix, setDisplayedPrefix] = useState(TARGET_TEXT);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Initial decode scramble animation (approx 900ms)
    let frame = 0;
    const totalFrames = 28;
    const interval = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const resolvedChars = Math.floor(progress * TARGET_TEXT.length);

      let scrambled = '';
      for (let i = 0; i < TARGET_TEXT.length; i++) {
        if (i < resolvedChars) {
          scrambled += TARGET_TEXT[i];
        } else if (TARGET_TEXT[i] === ' ') {
          scrambled += ' ';
        } else {
          scrambled += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }
      setDisplayedPrefix(scrambled);

      if (frame >= totalFrames) {
        clearInterval(interval);
        setDisplayedPrefix(TARGET_TEXT);
      }
    }, 32);

    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      to="/"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className={`group inline-flex items-center font-display font-black tracking-tight text-bone-100 hover:text-cyan-400 transition-colors select-none ${className || ''}`}
      aria-label="PADH LE BC: Break the Code Home"
    >
      {/* Screen reader static name */}
      <span className="sr-only">PADH LE BC (Break the Code)</span>

      {/* Visual scramble text */}
      <span aria-hidden="true" className="flex items-center text-xl sm:text-2xl">
        <span className="tracking-wider">{displayedPrefix}</span>
        <span className="text-cyan-400 font-extrabold transition-all duration-300">
          {isHovered ? (
            <span className="inline-block transition-all">
              BC <span className="text-xs text-steel-400 font-mono font-normal">/ BREAK THE CODE</span>
            </span>
          ) : (
            'BC'
          )}
        </span>
        <span className="inline-block w-2 h-4 sm:h-5 bg-cyan-400 ml-1.5 animate-pulse" />
      </span>
    </Link>
  );
}
