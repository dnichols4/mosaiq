/**
 * Interface defining platform-specific capabilities
 * Used to detect and adapt to different environments
 */
export interface IPlatformCapabilities {
  /**
   * The type of platform
   */
  type: 'desktop' | 'web' | 'mobile';
  
  /**
   * Whether the platform supports file system access
   */
  hasFileSystemAccess: boolean;
  
  /**
   * Whether the platform supports background processing
   */
  hasBackgroundProcessing: boolean;
  
  /**
   * Whether the platform supports local AI processing
   */
  hasLocalAIProcessing: boolean;
  
  /**
   * Whether the platform supports native notifications
   */
  hasNativeNotifications: boolean;
  
  /**
   * Maximum storage capacity available (in bytes, null if unknown)
   */
  storageCapacity: number | null;
  
  /**
   * Whether the platform is currently online
   */
  isOnline: () => Promise<boolean>;
  
  /**
   * Get information about the current platform
   */
  getPlatformInfo: () => Promise<{
    os?: string;
    version?: string;
    arch?: string;
    memory?: number;
  }>;
}
