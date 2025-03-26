import { IPlatformCapabilities } from '../platform/IPlatformCapabilities';

/**
 * Detect the current platform type
 * @returns The detected platform type
 */
export function detectPlatformType(): 'desktop' | 'web' | 'mobile' {
  // Check if we're in a Node.js environment (likely desktop via Electron)
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    return 'desktop';
  }
  
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Check if it's likely a mobile device based on user agent
    if (typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      return 'mobile';
    }
    
    // Otherwise assume it's a web browser
    return 'web';
  }
  
  // Default to desktop if we can't determine
  return 'desktop';
}

/**
 * Get platform capabilities based on the current environment
 * @returns An object implementing IPlatformCapabilities
 */
export function getPlatformCapabilities(): IPlatformCapabilities {
  const platformType = detectPlatformType();
  
  switch (platformType) {
    case 'desktop':
      return {
        type: 'desktop',
        hasFileSystemAccess: true,
        hasBackgroundProcessing: true,
        hasLocalAIProcessing: true,
        hasNativeNotifications: true,
        storageCapacity: null, // Will be determined at runtime
        isOnline: async () => {
          if (typeof navigator !== 'undefined') {
            return navigator.onLine;
          }
          // In Node.js, we could try to ping a server, but for now we'll assume online
          return true;
        },
        getPlatformInfo: async () => {
          // If running in Electron (has process.versions.electron)
          if (typeof process !== 'undefined' && process.versions && process.versions.electron) {
            return {
              os: process.platform,
              version: process.versions.electron,
              arch: process.arch,
              memory: process.memoryUsage().heapTotal,
            };
          }
          return {};
        }
      };
      
    case 'web':
      return {
        type: 'web',
        hasFileSystemAccess: typeof window !== 'undefined' && 'showOpenFilePicker' in window,
        hasBackgroundProcessing: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
        hasLocalAIProcessing: false, // Web browsers typically don't run local AI models
        hasNativeNotifications: typeof Notification !== 'undefined' && Notification.permission === 'granted',
        storageCapacity: null, // Will try to determine at runtime if possible
        isOnline: async () => {
          if (typeof navigator !== 'undefined') {
            return navigator.onLine;
          }
          return true;
        },
        getPlatformInfo: async () => {
          if (typeof navigator !== 'undefined') {
            return {
              os: navigator.platform,
              version: navigator.appVersion,
              // We don't have access to these in the browser
              arch: undefined,
              memory: navigator && 'deviceMemory' in navigator ? (navigator as any).deviceMemory * 1024 * 1024 * 1024 : undefined,
            };
          }
          return {};
        }
      };
      
    case 'mobile':
      return {
        type: 'mobile',
        hasFileSystemAccess: false, // Mobile browsers typically have limited file access
        hasBackgroundProcessing: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
        hasLocalAIProcessing: false,
        hasNativeNotifications: typeof Notification !== 'undefined' && Notification.permission === 'granted',
        storageCapacity: null,
        isOnline: async () => {
          if (typeof navigator !== 'undefined') {
            return navigator.onLine;
          }
          return true;
        },
        getPlatformInfo: async () => {
          if (typeof navigator !== 'undefined') {
            return {
              os: navigator.platform,
              version: navigator.appVersion,
              // We don't have access to these in the browser
              arch: undefined,
              memory: navigator && 'deviceMemory' in navigator ? (navigator as any).deviceMemory * 1024 * 1024 * 1024 : undefined,
            };
          }
          return {};
        }
      };
  }
}
