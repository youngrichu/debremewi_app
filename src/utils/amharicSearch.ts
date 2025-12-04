/**
 * Utility functions for Amharic text processing and search normalization.
 * Handles character variations (homophones) by mapping them to a canonical form.
 */

// Mapping of interchangeable Amharic characters to their canonical forms
const AMHARIC_NORMALIZATION_MAP: { [key: string]: string } = {
    // Ha family (ሀ, ሐ, ኀ) -> Normalize to ሀ
    'ሐ': 'ሀ', 'ሑ': 'ሁ', 'ሒ': 'ሂ', 'ሓ': 'ሃ', 'ሔ': 'ሄ', 'ሕ': 'ህ', 'ሖ': 'ሆ',
    'ኀ': 'ሀ', 'ኁ': 'ሁ', 'ኂ': 'ሂ', 'ኃ': 'ሃ', 'ኄ': 'ሄ', 'ኅ': 'ህ', 'ኆ': 'ሆ',

    // Se family (ሰ, ሠ) -> Normalize to ሰ
    'ሠ': 'ሰ', 'ሡ': 'ሱ', 'ሢ': 'ሲ', 'ሣ': 'ሳ', 'ሤ': 'ሴ', 'ሥ': 'ስ', 'ሦ': 'ሶ',

    // A family (አ, ዐ) -> Normalize to አ
    'ዐ': 'አ', 'ዑ': 'ኡ', 'ዒ': 'ኢ', 'ዓ': 'ኣ', 'ዔ': 'ኤ', 'ዕ': 'እ', 'ዖ': 'ኦ',

    // Tse family (ጸ, ፀ) -> Normalize to ጸ
    'ፀ': 'ጸ', 'ፁ': 'ጹ', 'ፂ': 'ጺ', 'ፃ': 'ጻ', 'ፄ': 'ጼ', 'ፅ': 'ጽ', 'ፆ': 'ጾ'
};

/**
 * Normalizes Amharic text by replacing homophones with their canonical forms.
 * Also converts to lowercase for case-insensitive comparison (though Amharic doesn't have casing, 
 * this helps if mixed with English).
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
