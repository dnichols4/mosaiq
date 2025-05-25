import React from 'react';
import { ReadingSettings } from '@mosaiq/common-ui';
import { IPlatformCapabilities, ConceptClassification } from '@mosaiq/platform-abstractions';
import './styles/main.css';
declare global {
    interface Window {
        electronAPI: {
            saveUrl: (url: string) => Promise<any>;
            getAllItems: () => Promise<any[]>;
            getItemWithContent: (id: string) => Promise<any>;
            deleteItem: (id: string) => Promise<void>;
            updateTags: (id: string, tags: string[]) => Promise<any>;
            updateThumbnail: (id: string, imageUrl: string) => Promise<any>;
            updateConcepts: (id: string, concepts: ConceptClassification[]) => Promise<any>;
            classifyContent: (title: string, text: string) => Promise<ConceptClassification[]>;
            getTaxonomyConcepts: () => Promise<any[]>;
            getTaxonomyConcept: (conceptId: string) => Promise<any>;
            searchTaxonomyConcepts: (query: string) => Promise<any[]>;
            getChildConcepts: (conceptId: string) => Promise<any[]>;
            getReadingSettings: () => Promise<ReadingSettings>;
            updateReadingSettings: (settings: Partial<ReadingSettings>) => Promise<ReadingSettings>;
            getAllSettings: () => Promise<any>;
            updateGeneralSettings: (settings: any) => Promise<any>;
            resetSettings: () => Promise<any>;
            getPlatformCapabilities: () => Promise<IPlatformCapabilities>;
            showMessageDialog: (options: any) => Promise<number>;
            showConfirmDialog: (options: any) => Promise<boolean>;
            showPromptDialog: (options: any) => Promise<string | null>;
            openFilePicker: (options: any) => Promise<string | null>;
            openMultipleFilePicker: (options: any) => Promise<string[]>;
            openDirectoryPicker: (options: any) => Promise<string | null>;
            saveFilePicker: (options: any) => Promise<string | null>;
        };
    }
}
export declare const App: React.FC;
//# sourceMappingURL=App.d.ts.map