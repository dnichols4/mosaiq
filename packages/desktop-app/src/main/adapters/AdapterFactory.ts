import { IStorageProvider, IContentProcessor, IPlatformCapabilities, IVectorStorage } from '@mosaiq/platform-abstractions';
import { ElectronStorageAdapter } from './ElectronStorageAdapter';
import { FileSystemContentAdapter } from './FileSystemContentAdapter';
import { ElectronContentProcessor } from './ElectronContentProcessor';
import { ElectronPlatformCapabilities } from './ElectronPlatformCapabilities';
import { ElectronDialogService } from './dialog/ElectronDialogService';
import { ElectronFilePickerService } from './file/ElectronFilePickerService';
import { LocalVectorAdapter } from './LocalVectorAdapter';

/**
 * Factory for creating adapters in the Electron environment
 */
export class AdapterFactory {
  /**
   * Create a metadata storage adapter
   */
  static createMetadataStorage(): IStorageProvider {
    return new ElectronStorageAdapter({ name: 'metadata' });
  }
  
  /**
   * Create a settings storage adapter
   */
  static createSettingsStorage(): IStorageProvider {
    return new ElectronStorageAdapter({ name: 'settings' });
  }
  
  /**
   * Create a content storage adapter
   */
  static createContentStorage(): IStorageProvider {
    return new FileSystemContentAdapter({ storageDirName: 'content' });
  }
  
  /**
   * Create a content processor
   */
  static createContentProcessor(): IContentProcessor {
    return new ElectronContentProcessor();
  }
  
  /**
   * Create platform capabilities
   */
  static createPlatformCapabilities(): IPlatformCapabilities {
    return new ElectronPlatformCapabilities();
  }
  
  /**
   * Create dialog service
   */
  static createDialogService() {
    return new ElectronDialogService();
  }
  
  /**
   * Create file picker service
   */
  static createFilePickerService() {
    return new ElectronFilePickerService();
  }
  
  /**
   * Create vector storage adapter
   */
  static createVectorStorage(): IVectorStorage {
    return new LocalVectorAdapter({ storageDirName: 'vectors' });
  }
}
