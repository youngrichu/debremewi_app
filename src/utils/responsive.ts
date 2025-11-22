import { Dimensions, PixelRatio, Platform } from 'react-native';
import * as Device from 'expo-device';

// Screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions for mobile (iPhone 11 Pro / X)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Check if the device is a tablet
 */
export const isTablet = () => {
    // Use expo-device if available, otherwise fallback to dimension check
    if (Device.deviceType === Device.DeviceType.TABLET) {
        return true;
    }

    // Fallback: Check pixel density and dimensions
    const pixelDensity = PixelRatio.get();
    const adjustedWidth = SCREEN_WIDTH * pixelDensity;
    const adjustedHeight = SCREEN_HEIGHT * pixelDensity;

    if (pixelDensity < 2 && (adjustedWidth >= 1000 || adjustedHeight >= 1000)) {
        return true;
    }

    return pixelDensity === 2 && (adjustedWidth >= 1920 || adjustedHeight >= 1920);
};

export const IS_TABLET = isTablet();

/**
 * Width Percentage
 * Converts a width percentage to independent pixels
 * @param widthPercent Percentage of screen width (string or number)
 */
export const wp = (widthPercent: number | string): number => {
    const elemWidth = typeof widthPercent === 'number' ? widthPercent : parseFloat(widthPercent);
    return PixelRatio.roundToNearestPixel((SCREEN_WIDTH * elemWidth) / 100);
};

/**
 * Height Percentage
 * Converts a height percentage to independent pixels
 * @param heightPercent Percentage of screen height (string or number)
 */
export const hp = (heightPercent: number | string): number => {
    const elemHeight = typeof heightPercent === 'number' ? heightPercent : parseFloat(heightPercent);
    return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT * elemHeight) / 100);
};

/**
 * Scale function
 * Scales a size based on the screen width
 * @param size Size to scale
 */
export const scale = (size: number): number => {
    return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

/**
 * Vertical Scale function
 * Scales a size based on the screen height
 * @param size Size to scale
 */
export const verticalScale = (size: number): number => {
    return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

/**
 * Moderate Scale function
 * Scales a size with a factor to control the resizing
 * @param size Size to scale
 * @param factor Factor to control scaling (default 0.5)
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
    return size + (scale(size) - size) * factor;
};

/**
 * Get responsive font size
 * @param size Base font size
 */
export const getFontSize = (size: number): number => {
    if (IS_TABLET) {
        return size * 1.3; // Increase font size for tablets
    }
    return moderateScale(size);
};

/**
 * Get responsive container width
 * Useful for centering content on tablets
 */
export const getContainerWidth = () => {
    return IS_TABLET ? '95%' : '100%';
};
