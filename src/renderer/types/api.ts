import { ReadingSettings } from '../../data/urlStorage';

// Shared UrlMetadata type to avoid circular dependencies
export interface UrlMetadata {
  id: string;
  url: string;
  title: string;
  excerpt: string;
  dateAdded: string;
}

// Define API interface in one place to avoid conflicts
declare global {
  interface Window {
    api: {
      saveUrl: (url: string) => Promise<UrlMetadata>;
      getAllUrls: () => Promise<UrlMetadata[]>;
      getUrlContent: (id: string) => Promise<any>;
      getReadingSettings: () => Promise<ReadingSettings>;
      updateReadingSettings: (settings: Partial<ReadingSettings>) => Promise<ReadingSettings>;
    };
  }
}
