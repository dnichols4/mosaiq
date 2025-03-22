import * as cheerio from 'cheerio';

export interface ProcessedContent {
  title: string;
  excerpt: string;
  content: string;
}

// Fetch and process URL content
export async function fetchAndProcessUrl(url: string): Promise<ProcessedContent> {
  try {
    // Fetch the URL content using native fetch
    const response = await fetch(url);
    const html = await response.text();
    
    // Parse with cheerio
    const $ = cheerio.load(html);
    
    // Extract title
    const title = $('title').text().trim() || 'Untitled';
    
    // Clean up the content
    // Remove script and style elements
    $('script, style, iframe, nav, footer, header, aside').remove();
    
    // Find the main content
    // This is a simple heuristic - in a production app, use a more robust algorithm
    let mainContent = $('main').html() || 
                     $('article').html() || 
                     $('#content').html() || 
                     $('.content').html() || 
                     $('body').html();
    
    if (!mainContent) {
      mainContent = '<p>Could not extract meaningful content from this URL.</p>';
    }
    
    // Extract a brief excerpt
    const paragraphs = $('p');
    let excerpt = '';
    
    if (paragraphs.length > 0) {
      // Get the first non-empty paragraph
      for (let i = 0; i < paragraphs.length; i++) {
        const text = $(paragraphs[i]).text().trim();
        if (text && text.length > 50) {
          excerpt = text.substring(0, 200) + (text.length > 200 ? '...' : '');
          break;
        }
      }
    }
    
    if (!excerpt) {
      // Fallback to meta description
      excerpt = $('meta[name="description"]').attr('content') || 
                $('meta[property="og:description"]').attr('content') || 
                'No description available';
    }
    
    return {
      title,
      excerpt,
      content: mainContent
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
