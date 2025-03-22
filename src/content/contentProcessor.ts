import * as cheerio from 'cheerio';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

export interface ProcessedContent {
  title: string;
  author?: string;
  publishDate?: string;
  featuredImage?: string;
  excerpt: string;
  content: string;
}

// Fetch and process URL content with enhanced readability
export async function fetchAndProcessUrl(url: string): Promise<ProcessedContent> {
  try {
    // Fetch the URL content using native fetch
    const response = await fetch(url);
    const html = await response.text();
    
    // Use Mozilla's Readability for better content extraction
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    
    // Parse with cheerio for additional metadata
    const $ = cheerio.load(html);
    
    // Extract metadata: author
    let author;
    const authorSelectors = [
      'meta[name="author"]',
      'meta[property="article:author"]',
      '.author',
      '.byline',
      '[rel="author"]'
    ];
    
    for (const selector of authorSelectors) {
      if (author) break;
      const authorElement = $(selector);
      if (authorElement.length) {
        author = authorElement.attr('content') || authorElement.text().trim();
      }
    }
    
    // Extract metadata: publication date
    let publishDate;
    const dateSelectors = [
      'meta[name="date"]',
      'meta[property="article:published_time"]',
      'time',
      '.published-date',
      '.post-date'
    ];
    
    for (const selector of dateSelectors) {
      if (publishDate) break;
      const dateElement = $(selector);
      if (dateElement.length) {
        publishDate = dateElement.attr('content') || 
                      dateElement.attr('datetime') || 
                      dateElement.text().trim();
      }
    }
    
    // Extract metadata: featured image
    let featuredImage;
    const imageSelectors = [
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
      'link[rel="image_src"]'
    ];
    
    for (const selector of imageSelectors) {
      if (featuredImage) break;
      const imgElement = $(selector);
      if (imgElement.length) {
        featuredImage = imgElement.attr('content') || imgElement.attr('href');
      }
    }
    
    // If no featured image found in meta, try to get the first large image
    if (!featuredImage) {
      $('img').each((i, elem) => {
        const img = $(elem);
        const width = img.attr('width');
        const height = img.attr('height');
        
        // Only consider larger images
        if (width && height && parseInt(width) > 300 && parseInt(height) > 200) {
          featuredImage = img.attr('src');
          return false; // break the each loop
        }
      });
    }
    
    // Make sure all URLs are absolute
    if (featuredImage && !featuredImage.startsWith('http')) {
      const baseUrl = new URL(url);
      featuredImage = new URL(featuredImage, baseUrl.origin).toString();
    }
    
    // Process content for better reading experience
    let cleanContent = article?.content || '';
    const contentDoc = new JSDOM(cleanContent).window.document;
    
    // Process links to make them absolute and open in new tab
    Array.from(contentDoc.querySelectorAll('a')).forEach(link => {
      // Make relative links absolute
      if (link.href && !link.href.startsWith('http')) {
        const baseUrl = new URL(url);
        link.href = new URL(link.href, baseUrl.origin).toString();
      }
      
      // Add target="_blank" for external links
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });
    
    // Process images to make URLs absolute
    Array.from(contentDoc.querySelectorAll('img')).forEach(img => {
      if (img.src && !img.src.startsWith('http')) {
        const baseUrl = new URL(url);
        img.src = new URL(img.src, baseUrl.origin).toString();
      }
    });
    
    // Extract excerpt
    let excerpt = article?.excerpt || '';
    if (!excerpt) {
      // Fallback to meta description
      excerpt = $('meta[name="description"]').attr('content') || 
                $('meta[property="og:description"]').attr('content') || 
                'No description available';
    }
    
    // Limit excerpt length
    if (excerpt.length > 200) {
      excerpt = excerpt.substring(0, 197) + '...';
    }
    
    return {
      title: article?.title || $('title').text().trim() || 'Untitled',
      author,
      publishDate,
      featuredImage,
      excerpt,
      content: contentDoc.body.innerHTML
    };
  } catch (error) {
    console.error('Error processing URL:', error);
    return {
      title: 'Error processing URL',
      excerpt: 'There was an error processing this URL.',
      content: '<p>Error: Could not process URL content.</p>'
    };
  }
}
