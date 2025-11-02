/**
 * Church Brand Color Palette
 * Dubai Debremewi Orthodox Tewahedo Church
 */

export const COLORS = {
  // Primary Church Brand Colors
  primary: '#2473E0',        // Church Blue
  secondary: '#DDC65D',      // Church Gold/Yellow
  success: '#008036',        // Church Green
  
  // Semantic Colors
  error: '#FF3B30',          // Red for errors
  warning: '#FF9500',        // Orange for warnings
  info: '#007AFF',           // Light blue for info
  
  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Gray Scale
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    tertiary: '#F8F8F8',
  },
  
  // Text Colors
  text: {
    primary: '#333333',
    secondary: '#666666',
    tertiary: '#999999',
    inverse: '#FFFFFF',
  },
  
  // Border Colors
  border: {
    light: '#E0E0E0',
    medium: '#DADADA',
    dark: '#CCCCCC',
  },
  
  // Shadow Colors
  shadow: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.2)',
    dark: 'rgba(0, 0, 0, 0.3)',
  },
  
  // Legacy color mappings for gradual migration
  legacy: {
    oldBlue: '#2196F3',      // Old primary blue
    oldOrange: '#FF9800',    // Old orange
    oldGreen: '#4CAF50',     // Old green
  }
} as const;

// Color utility functions
export const getColorWithOpacity = (color: string, opacity: number): string => {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Gradient definitions using church colors
export const GRADIENTS = {
  primary: [COLORS.primary, '#1E5BB8'],           // Blue gradient
  secondary: [COLORS.secondary, '#C4B04A'],       // Gold gradient
  success: [COLORS.success, '#006B2E'],           // Green gradient
  churchPrimary: [COLORS.primary, '#1976D2'],     // Main church gradient
} as const;

// Export individual colors for easy access
export const {
  primary,
  secondary,
  success,
  error,
  warning,
  info,
  white,
  black,
  gray,
  background,
  text,
  border,
  shadow,
} = COLORS;