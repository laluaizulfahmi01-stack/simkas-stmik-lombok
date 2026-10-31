// src/components/AnimatedNumber.jsx
// Smooth Counting-Up Number Animation for SIMKAS Dashboard Metrics
import { useState, useEffect, useRef } from 'react';

export default function AnimatedNumber({
  value = 0,
  duration = 900,
  prefix = '',
  suffix = '',
  formatType = 'standard', // 'rupiah' | 'shortRupiah' | 'percent' | 'standard'
  formatter = null,
}) {
  const targetNum = typeof value === 'number'
    ? value
    : parseFloat(String(value).replace(/[^0-9.-]+/g, '')) || 0;

  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(0);

  useEffect(() => {
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

      // easeOutExpo deceleration curve: fast ramp-up -> ultra-buttery smooth landing
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
  }, [targetNum, duration]);

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
