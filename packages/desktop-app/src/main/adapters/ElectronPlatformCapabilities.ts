import { app } from 'electron';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { IPlatformCapabilities } from '@mosaiq/platform-abstractions';
import checkDiskSpace from 'check-disk-space';

/**
 * Implementation of platform capabilities for Electron
 */
export class ElectronPlatformCapabilities implements IPlatformCapabilities {
  type: 'desktop' = 'desktop';
  hasFileSystemAccess: boolean = true;
  hasBackgroundProcessing: boolean = true;
  hasLocalAIProcessing: boolean = true;
  hasNativeNotifications: boolean = true;
  storageCapacity: number | null = null;
  
  constructor() {
    // Calculate storage capacity
    this.calculateStorageCapacity();
  }
  
  /**
   * Calculate storage capacity based on available disk space
   */
  private calculateStorageCapacity(): void {
    try {
      const userDataPath = app.getPath('userData');
      
      // Use 1GB as default capacity initially
      this.storageCapacity = 1 * 1024 * 1024 * 1024; // 1GB in bytes
      
      // Use async/await with immediate invocation
      (async () => {
        try {
          const diskSpace = await checkDiskSpace(userDataPath);
          this.storageCapacity = diskSpace.free;
          console.log(`Disk space available: ${this.storageCapacity} bytes`);
        } catch (error) {
          console.error('Error getting disk space:', error);
          // Keep using the 1GB fallback set above
        }
      })();
    } catch (error) {
      console.error('Error calculating storage capacity:', error);
      this.storageCapacity = null;
    }
  }
  
  /**
   * Check if the application is online
   */
  async isOnline(): Promise<boolean> {
    // Assuming if any network interface has an IPv4 address, we're online
    const networkInterfaces = os.networkInterfaces();
    
    for (const interfaceName in networkInterfaces) {
      const interfaces = networkInterfaces[interfaceName];
      
      if (interfaces) {
        for (const iface of interfaces) {
          if (iface.family === 'IPv4' && !iface.internal) {
            return true;
          }
        }
      }
    }
    
    return false;
  }
  
  /**
   * Get platform information
   */
  async getPlatformInfo() {
    return {
      os: process.platform,
      version: process.versions.electron,
      arch: process.arch,
      memory: os.totalmem(),
    };
  }
}
