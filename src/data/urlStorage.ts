import * as fs from 'fs';
import * as path from 'path';
import ElectronStore from 'electron-store';

// Define the URL data structure
export interface UrlData {
  id?: string;
  url: string;
  title: string;
  excerpt: string;
  content: string;
  dateAdded: string;
}

// Create a store for URL metadata
const metadataStore = new ElectronStore<{
  urls: Record<string, Omit<UrlData, 'content'>>
}>({
  name: 'url-metadata'
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
  
  // Save metadata to store
  const metadata = {
    id,
    url: urlData.url,
    title: urlData.title,
    excerpt: urlData.excerpt,
    dateAdded: urlData.dateAdded
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
