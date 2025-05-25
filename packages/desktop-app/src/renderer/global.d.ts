interface Window {
  electronAPI: {
    // Content-related methods
    saveUrl: (url: string) => Promise<any>;
    getAllItems: () => Promise<any[]>;
    getItemWithContent: (id: string) => Promise<any>;
    deleteItem: (id: string) => Promise<void>;
    updateTags: (id: string, tags: string[]) => Promise<any>;
    updateThumbnail: (id: string, imageUrl: string) => Promise<any>;
    
    // Classification-related methods
    updateConcepts: (id: string, concepts: any[]) => Promise<any>;
    classifyContent: (title: string, text: string, options?: any) => Promise<any>;
    classifyContentItem: (id: string, options?: { force?: boolean }) => Promise<any>;
    batchReclassify: (ids: string[], options?: { force?: boolean }) => Promise<any>;
    cancelClassification: (id: string) => Promise<any>;
    getClassificationStatus: (id: string) => Promise<any>;
    isClassifying: (id: string) => Promise<boolean>;
    extractMetadata: (id: string, options?: any) => Promise<any>;
    setAutoClassification: (enabled: boolean) => Promise<boolean>;
    isAutoClassificationEnabled: () => Promise<boolean>;
    isClassificationAvailable: () => Promise<boolean>;
    getClassificationServiceStatus: () => Promise<any>;
    initializeClassification: (force?: boolean) => Promise<any>;
    
    // Event listeners
    onClassificationProcessorProgress: (callback: (event: any) => void) => (() => void);
    onClassificationServiceProgress: (callback: (event: any) => void) => (() => void);
    
    // Taxonomy-related methods
    getTaxonomyConcepts: () => Promise<any[]>;
    getTaxonomyConcept: (conceptId: string) => Promise<any>;
    searchTaxonomyConcepts: (query: string) => Promise<any[]>;
    getChildConcepts: (conceptId: string) => Promise<any[]>;
    
    // Settings-related methods
    getReadingSettings: () => Promise<any>;
    updateReadingSettings: (settings: any) => Promise<any>;
    getAllSettings: () => Promise<any>;
    updateGeneralSettings: (settings: any) => Promise<any>;
    resetSettings: () => Promise<any>;
    
    // Platform capabilities
    getPlatformCapabilities: () => Promise<any>;
    
    // Dialog-related methods
    showMessageDialog: (options: any) => Promise<any>;
    showConfirmDialog: (options: any) => Promise<any>;
    showPromptDialog: (options: any) => Promise<any>;
    
    // File picker methods
    openFilePicker: (options: any) => Promise<any>;
    openMultipleFilePicker: (options: any) => Promise<any>;
    openDirectoryPicker: (options: any) => Promise<any>;
    saveFilePicker: (options: any) => Promise<any>;
  };
}
