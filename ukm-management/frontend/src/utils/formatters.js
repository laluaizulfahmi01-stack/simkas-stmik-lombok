// src/utils/formatters.js - Utility pemformat mata uang dan angka SIMKAS

/**
 * Format angka ke mata uang Rupiah lengkap (contoh: "Rp 1.500.000")
 * @param {number|string} val
 * @returns {string}
 */
export const formatRupiah = val => {
  const n = Number(val) || 0;
  return 'Rp ' + n.toLocaleString('id-ID');
};

/**
 * Format angka ke versi singkatan Rupiah (k untuk ribuan, M untuk jutaan).
 * Tahan terhadap string, null, dan nilai negatif (contoh: -1500000 -> "-Rp 1.5M").
 * Digunakan pada bubble stats dan mini sparkline kartu UKM.
 * @param {number|string} val
 * @returns {string}
 */
export const formatShortRupiah = val => {
  const n = Math.abs(Number(val) || 0);
  const prefix = Number(val) < 0 ? '-' : '';
  if (n >= 1000000) return prefix + 'Rp ' + (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return prefix + 'Rp ' + Math.round(n / 1000) + 'k';
  return prefix + 'Rp ' + n.toLocaleString('id-ID');
};

