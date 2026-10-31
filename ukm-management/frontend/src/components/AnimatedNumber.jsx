// src/components/AnimatedNumber.jsx
// Smooth Counting-Up Number Animation for SIMKAS Dashboard & Landing Page Metrics
import { useState, useEffect, useRef } from 'react';

export default function AnimatedNumber({
  value = 0,
  duration = 950,
  prefix = '',
  suffix = '',
  formatType = 'standard', // 'rupiah' | 'shortRupiah' | 'percent' | 'standard'
  formatter = null,
  animateOnView = true,
}) {
  const targetNum = typeof value === 'number'
    ? value
    : parseFloat(String(value).replace(/[^0-9.-]+/g, '')) || 0;

  const [displayValue, setDisplayValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(!animateOnView);
  const containerRef = useRef(null);
  const prevValueRef = useRef(0);

  // Trigger animation when the element enters the viewport
  useEffect(() => {
    if (!animateOnView) {
      setHasStarted(true);
      return;
    }

    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setHasStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [animateOnView]);

  useEffect(() => {
    if (!hasStarted) return;

    // If user prefers reduced motion, set immediately
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(targetNum);
      prevValueRef.current = targetNum;
      return;
    }

    let startTimestamp = null;
    let animFrameId = null;
    const fromVal = prevValueRef.current;
    const toVal = targetNum;

    if (fromVal === toVal) {
      setDisplayValue(toVal);
      return;
    }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutExpo deceleration curve: fast ramp-up -> buttery smooth settle
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = fromVal + (toVal - fromVal) * ease;

      setDisplayValue(current);

      if (progress < 1) {
        animFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(toVal);
        prevValueRef.current = toVal;
      }
    };

    animFrameId = requestAnimationFrame(step);

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [hasStarted, targetNum, duration]);

  // Format the number dynamically as it counts up
  let formattedNumber = '';
  const rounded = Math.round(displayValue);

  if (formatter && typeof formatter === 'function') {
    formattedNumber = formatter(rounded);
  } else if (formatType === 'rupiah') {
    formattedNumber = 'Rp ' + rounded.toLocaleString('id-ID');
  } else if (formatType === 'shortRupiah') {
    const abs = Math.abs(rounded);
    const sign = rounded < 0 ? '-' : '';
    if (abs >= 1000000) {
      const millions = abs / 1000000;
      formattedNumber = sign + 'Rp ' + (millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)) + 'M';
    } else if (abs >= 1000) {
      formattedNumber = sign + 'Rp ' + Math.round(abs / 1000) + 'k';
    } else {
      formattedNumber = sign + 'Rp ' + abs.toLocaleString('id-ID');
    }
  } else if (formatType === 'percent') {
    formattedNumber = `${rounded}%`;
  } else {
    formattedNumber = rounded.toLocaleString('id-ID');
  }

  return (
    <span
      ref={containerRef}
      className="simkas-animated-number"
      style={{
        display: 'inline-block',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.02em',
      }}
    >
      {prefix}{formattedNumber}{suffix}
    </span>
  );
}
