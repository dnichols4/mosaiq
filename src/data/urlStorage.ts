import * as fs from 'fs';
import * as path from 'path';
import ElectronStore from 'electron-store';

// Define the URL data structure with enhanced fields
export interface UrlData {
  id?: string;
  url: string;
  title: string;
  author?: string;
  publishDate?: string;
  featuredImage?: string;
  excerpt: string;
  content: string;
  dateAdded: string;
  tags?: string[];
}

// Define reading settings
export interface ReadingSettings {
  fontSize: string;
  lineHeight: string;
  theme: 'light' | 'dark';
  width: string;
}

// Define default reading settings
const defaultSettings: ReadingSettings = {
  fontSize: '18px',
  lineHeight: '1.6',
  theme: 'light',
  width: '680px'
};

// Create stores for URL metadata and reading settings
const metadataStore = new ElectronStore<{
  urls: Record<string, Omit<UrlData, 'content'>>
}>({
  name: 'url-metadata'
});

const settingsStore = new ElectronStore<{
  readingSettings: ReadingSettings
}>({
  name: 'reading-settings',
  defaults: {
    readingSettings: defaultSettings
  }
});

// Storage paths
const STORAGE_DIR = path.join(process.cwd(), 'storage');
const CONTENT_DIR = path.join(STORAGE_DIR, 'content');

// Ensure storage directories exist
function ensureDirectoriesExist() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }
}

// Save URL content to file system
async function saveContentToFile(id: string, content: string): Promise<void> {
  ensureDirectoriesExist();
  
  const filePath = path.join(CONTENT_DIR, `${id}.md`);
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, content, 'utf-8', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Read URL content from file system
async function readContentFromFile(id: string): Promise<string> {
  const filePath = path.join(CONTENT_DIR, `${id}.md`);
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

// Generate a simple ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

// Save a URL and its content
export async function saveUrl(urlData: UrlData): Promise<UrlData> {
  const id = urlData.id || generateId();
  
  // Save the content to file
  await saveContentToFile(id, urlData.content);
  
  // Save metadata to store (omitting content which is stored in the file)
  const metadata = {
    id,
    url: urlData.url,
    title: urlData.title,
    author: urlData.author,
    publishDate: urlData.publishDate,
    featuredImage: urlData.featuredImage,
    excerpt: urlData.excerpt,
    dateAdded: urlData.dateAdded,
    tags: urlData.tags || []
  };
  
  const existingUrls = metadataStore.get('urls', {});
  metadataStore.set('urls', {
    ...existingUrls,
    [id]: metadata
  });
  
  return {
    ...metadata,
    content: urlData.content
  };
}

// Get all saved URLs (metadata only)
export async function getAllUrls(): Promise<Omit<UrlData, 'content'>[]> {
  const urlsRecord = metadataStore.get('urls', {});
  return Object.values(urlsRecord);
}

// Get a single URL with its content
export async function getUrlWithContent(id: string): Promise<UrlData | null> {
  const urlsRecord = metadataStore.get('urls', {});
  const metadata = urlsRecord[id];
  
  if (!metadata) {
    return null;
  }
  
  try {
    const content = await readContentFromFile(id);
    return {
      ...metadata,
      content
    };
  } catch (error) {
    console.error(`Error reading content for URL ${id}:`, error);
    return null;
  }
}

// Delete a URL and its content
export async function deleteUrl(id: string): Promise<void> {
  // Remove from metadata store
  const urlsRecord = metadataStore.get('urls', {});
  if (urlsRecord[id]) {
    const { [id]: _, ...remainingUrls } = urlsRecord;
    metadataStore.set('urls', remainingUrls);
  }
  
  // Delete content file
  const filePath = path.join(CONTENT_DIR, `${id}.md`);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(`Error deleting content file for URL ${id}:`, error);
    // Continue even if file deletion fails
  }
}

// Get reading settings
export function getReadingSettings(): ReadingSettings {
  return settingsStore.get('readingSettings', defaultSettings);
}

// Update reading settings
export function updateReadingSettings(settings: Partial<ReadingSettings>): ReadingSettings {
  const currentSettings = getReadingSettings();
  const updatedSettings = { ...currentSettings, ...settings };
  
  settingsStore.set('readingSettings', updatedSettings);
  return updatedSettings;
}
