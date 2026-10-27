// src/components/ThemeToggle.jsx
import { useTheme } from '../context/ThemeContext';
import { MdDarkMode, MdLightMode } from 'react-icons/md';

export default function ThemeToggle({ variant = 'icon', className = '', style = {} }) {
  const { isDark, toggleTheme } = useTheme();

  if (variant === 'labeled') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`theme-toggle-btn theme-toggle-labeled ${className}`}
        style={style}
        title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
        aria-label="Toggle Theme"
      >
        <span className="theme-toggle-icon">
          {isDark ? <MdLightMode /> : <MdDarkMode />}
        </span>
        <span className="theme-toggle-text">
          {isDark ? 'Mode Terang' : 'Mode Gelap'}
        </span>
        <span className={`theme-toggle-badge ${isDark ? 'badge-dark' : 'badge-light'}`}>
          {isDark ? 'Gelap' : 'Terang'}
        </span>
      </button>
    );
  }

  if (variant === 'switch') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`theme-switch ${isDark ? 'active' : ''} ${className}`}
        style={style}
        title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
        aria-label="Toggle Theme"
      >
        <span className="theme-switch-slider">
          <span className="theme-switch-icon">
            {isDark ? <MdDarkMode /> : <MdLightMode />}
          </span>
        </span>
      </button>
    );
  }

  // Default: round icon button
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle-btn theme-toggle-round ${className}`}
      style={style}
      title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
      aria-label="Toggle Theme"
    >
      <span className="theme-toggle-icon">
        {isDark ? <MdLightMode style={{ color: '#fbbf24' }} /> : <MdDarkMode style={{ color: '#6366f1' }} />}
      </span>
    </button>
  );
}
