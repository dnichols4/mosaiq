import { create } from 'zustand';
// Define API types for TypeScript
declare global {
  interface Window {
    api: {
      saveUrl: (url: string) => Promise<UrlMetadata>;
      getAllUrls: () => Promise<UrlMetadata[]>;
      getUrlContent: (id: string) => Promise<any>;
    };
  }
}

// Define the URL metadata structure (without content)
export interface UrlMetadata {
  id: string;
  url: string;
  title: string;
  excerpt: string;
  dateAdded: string;
}

interface UrlState {
  urls: UrlMetadata[];
  loading: boolean;
  error: string | null;
  fetchUrls: () => Promise<void>;
  addUrl: (url: string) => Promise<void>;
}

export const useUrlStore = create<UrlState>((set) => ({
  urls: [],
  loading: false,
  error: null,
  
  fetchUrls: async () => {
    try {
      set({ loading: true, error: null });
      const urls = await window.api.getAllUrls();
      set({ urls, loading: false });
    } catch (error) {
      console.error('Error fetching URLs:', error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  },
  
  addUrl: async (url: string) => {
    try {
      set({ loading: true, error: null });
      const savedUrl = await window.api.saveUrl(url);
      
      set((state) => ({
        urls: [savedUrl, ...state.urls],
        loading: false
      }));
    } catch (error) {
      console.error('Error adding URL:', error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to save URL' 
      });
    }
  }
}));
