import { create } from 'zustand';
import { UrlMetadata } from '../types/api';

// Import shared types
import '../types/api';

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
