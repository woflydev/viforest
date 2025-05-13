/**
 * Utility functions to detect platform environment
 */

export const isCapacitorPlatform = (): boolean => {
  if (typeof window !== 'undefined') {
    // @ts-ignore - Capacitor adds this to window
    return window?.Capacitor?.isNativePlatform() ?? false;
  }
  return false;
};

export const getPlatformName = (): string => {
  if (typeof window !== 'undefined') {
    // @ts-ignore - Capacitor adds this to window
    return window?.Capacitor?.getPlatform() || 'web';
  }
  return 'web';
};

export const isAndroid = (): boolean => getPlatformName() === 'android';
export const isIOS = (): boolean => getPlatformName() === 'ios';
export const isElectron = (): boolean => getPlatformName() === 'electron';
export const isNative = (): boolean => isAndroid() || isIOS();
export const isWeb = (): boolean => getPlatformName() === 'web';