/**
 * Utility functions for Amharic text processing and search normalization.
 * Handles character variations (homophones) by mapping them to a canonical form.
 * Based on IPA notation table:
 * - Ha family (Row 1): 4th order normalizes to 1st order (ሀ). Others to bold/first in cell.
 * - A family (Row 2): 4th order normalizes to 1st order (አ). Others to bold/first in cell.
 * - Se family (Row 3): Normalizes to bold/first in cell (4th order stays 4th order).
 * - Tse family (Row 4): Normalizes to bold/first in cell (4th order stays 4th order).
 */

const AMHARIC_NORMALIZATION_MAP: { [key: string]: string } = {
    // === Row 1: Ha Family (ሀ) ===
    // 1st order -> ሀ
    'ሐ': 'ሀ', 'ኀ': 'ሀ', 'ኸ': 'ሀ',
    // 2nd order -> ሁ
    'ሑ': 'ሁ', 'ኁ': 'ሁ', 'ኹ': 'ሁ',
    // 3rd order -> ሂ
    'ሒ': 'ሂ', 'ኂ': 'ሂ', 'ኺ': 'ሂ',
    // 4th order -> ሀ (Exception: 4th order normalizes to 1st order for Ha family)
    'ሃ': 'ሀ', 'ሓ': 'ሀ', 'ኃ': 'ሀ', 'ኻ': 'ሀ',
    // 5th order -> ሄ
    'ሔ': 'ሄ', 'ኄ': 'ሄ', 'ኼ': 'ሄ',
    // 6th order -> ህ
    'ሕ': 'ህ', 'ኅ': 'ህ', 'ኽ': 'ህ',
    // 7th order -> ሆ
    'ሖ': 'ሆ', 'ኆ': 'ሆ', 'ኾ': 'ሆ',

    // === Row 2: A Family (አ) ===
    // 1st order -> አ
    'ዐ': 'አ',
    // 2nd order -> ኡ
    'ዑ': 'ኡ',
    // 3rd order -> ኢ
    'ዒ': 'ኢ',
    // 4th order -> አ (Exception: 4th order normalizes to 1st order for A family)
    'ኣ': 'አ', 'ዓ': 'አ',
    // 5th order -> ኤ
    'ዔ': 'ኤ',
    // 6th order -> እ
    'ዕ': 'እ',
    // 7th order -> ኦ
    'ዖ': 'ኦ',

    // === Row 3: Se Family (ሰ) ===
    // 1st order -> ሰ
    'ሠ': 'ሰ',
    // 2nd order -> ሱ
    'ሡ': 'ሱ',
    // 3rd order -> ሲ
    'ሢ': 'ሲ',
    // 4th order -> ሳ (No exception, maps to itself/canonical 4th order)
    'ሣ': 'ሳ',
    // 5th order -> ሴ
    'ሤ': 'ሴ',
    // 6th order -> ስ
    'ሥ': 'ስ',
    // 7th order -> ሶ
    'ሦ': 'ሶ',

    // === Row 4: Tse Family (ጸ) ===
    // 1st order -> ጸ
    'ፀ': 'ጸ',
    // 2nd order -> ጹ
    'ፁ': 'ጹ',
    // 3rd order -> ጺ
    'ፂ': 'ጺ',
    // 4th order -> ጻ (No exception, maps to itself/canonical 4th order)
    'ፃ': 'ጻ',
    // 5th order -> ጼ
    'ፄ': 'ጼ',
    // 6th order -> ጽ
    'ፅ': 'ጽ',
    // 7th order -> ጾ
    'ፆ': 'ጾ',
};

/**
 * Normalizes Amharic text by replacing homophones with their canonical forms.
 * Also converts to lowercase for case-insensitive comparison.
 * 
 * @param text The input text to normalize
 * @returns The normalized text
 */
export const normalizeAmharicText = (text: string): string => {
    if (!text) return '';

    return text
        .split('')
        .map(char => AMHARIC_NORMALIZATION_MAP[char] || char)
        .join('')
        .toLowerCase();
};
