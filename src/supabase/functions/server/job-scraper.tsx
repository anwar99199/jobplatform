/**
 * Job Scraper for Jobs of Oman Website
 * Extracts job listings from external websites
 */

import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

export interface ScrapedJob {
  title: string;
  description: string;
  applicationUrl: string;
  date: string;
  source?: string; // New field to track source
}

/**
 * Scrape jobs from jobsofoman.com
 */
export async function scrapeJobsOfOman(): Promise<ScrapedJob[]> {
  const url = 'https://jobsofoman.com/ar/index.php';
  const jobs: ScrapedJob[] = [];
  
  try {
    console.log(`Starting to scrape jobs from: ${url}`);
    
    // Fetch the page with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log(`Fetched HTML (${html.length} chars)`);
    
    // Parse HTML
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    if (!doc) {
      throw new Error('Failed to parse HTML');
    }
    
    // Try to find job listings with multiple strategies
    // We'll look for common patterns in job listing websites
    const possibleSelectors = [
      '.job-listing',
      '.job-item',
      '.job',
      '.vacancy',
      'article.job',
      'div.job',
      '[class*="job"]',
      '[class*="listing"]',
      '[class*="vacancy"]',
      '.post',
      'article'
    ];
    
    let jobElements: any[] = [];
    
    for (const selector of possibleSelectors) {
      const elements = doc.querySelectorAll(selector);
      if (elements && elements.length > 0) {
        jobElements = Array.from(elements);
        console.log(`Found ${jobElements.length} job elements using selector: ${selector}`);
        break;
      }
    }
    
    // If no specific job elements found, try to extract from links and headings
    if (jobElements.length === 0) {
      console.log('No specific job elements found, trying alternative approach...');
      
      // Look for links that might be job postings
      const allLinks = doc.querySelectorAll('a');
      const jobKeywords = ['وظيفة', 'مطلوب', 'فرصة', 'عمل', 'توظيف', 'job', 'vacancy', 'career', 'position'];
      
      console.log(`Found ${allLinks.length} links total`);
      
      // Extract jobs from links with text
      for (let i = 0; i < allLinks.length; i++) {
        const link = allLinks[i];
        const text = link.textContent?.trim() || '';
        const href = link.getAttribute('href') || '';
        
        // Skip empty or very short titles
        if (!text || text.length < 10) continue;
        
        // Skip navigation links
        const skipWords = ['الرئيسية', 'من نحن', 'اتصل', 'عنا', 'الخدمات', 'المدونة',
                          'Home', 'About', 'Contact', 'Services', 'Blog', 'Menu'];
        if (skipWords.some(word => text.includes(word))) {
          continue;
        }
        
        // Check if this looks like a job posting
        const isJobLink = jobKeywords.some(keyword => 
          text.toLowerCase().includes(keyword.toLowerCase()) || 
          href.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (isJobLink) {
          // Try to find description nearby
          const parent = link.parentElement;
          let description = parent?.textContent?.trim() || text;
          
          // Clean up description
          description = description.substring(0, 500);
          
          // Make sure href is absolute
          let fullUrl = href;
          if (href && !href.startsWith('http')) {
            try {
              const baseUrl = new URL(url);
              fullUrl = new URL(href, baseUrl.origin).toString();
            } catch (e) {
              fullUrl = url;
            }
          }
          
          // Avoid duplicates in the same scraping session
          const isDuplicate = jobs.some(j => 
            j.title.toLowerCase() === text.toLowerCase() ||
            j.applicationUrl === fullUrl
          );
          
          if (!isDuplicate && text.length >= 10) {
            jobs.push({
              title: text.substring(0, 200), // Limit title length
              description: description,
              applicationUrl: fullUrl || url,
              date: new Date().toISOString().split('T')[0],
              source: 'jobsofoman.com'
            });
          }
        }
      }
    } else {
      // Extract data from found job elements
      for (const element of jobElements) {
        try {
          // Try to find title
          let title = '';
          const titleSelectors = ['h1', 'h2', 'h3', 'h4', '.title', '.job-title', '[class*="title"]', 'a'];
          
          for (const sel of titleSelectors) {
            const titleEl = element.querySelector(sel);
            if (titleEl && titleEl.textContent) {
              title = titleEl.textContent.trim();
              break;
            }
          }
          
          // If no title found, use element text
          if (!title) {
            title = element.textContent?.trim().substring(0, 100) || 'وظيفة متاحة';
          }
          
          // Try to find description
          let description = '';
          const descSelectors = ['.description', '.job-description', 'p', '.content', '[class*="desc"]', '.excerpt'];
          
          for (const sel of descSelectors) {
            const descEl = element.querySelector(sel);
            if (descEl && descEl.textContent) {
              description = descEl.textContent.trim();
              break;
            }
          }
          
          if (!description) {
            description = element.textContent?.trim() || title;
          }
          
          // Clean and limit description
          description = description.substring(0, 500);
          
          // Try to find link
          let applicationUrl = url;
          const linkEl = element.querySelector('a');
          if (linkEl) {
            const href = linkEl.getAttribute('href');
            if (href) {
              try {
                if (!href.startsWith('http')) {
                  const baseUrl = new URL(url);
                  applicationUrl = new URL(href, baseUrl.origin).toString();
                } else {
                  applicationUrl = href;
                }
              } catch (e) {
                applicationUrl = url;
              }
            }
          }
          
          // Skip if title is too short or empty
          if (!title || title.length < 5) continue;
          
          // Check for duplicates in current session
          const isDuplicate = jobs.some(j => 
            j.title.toLowerCase() === title.toLowerCase() ||
            j.applicationUrl === applicationUrl
          );
          
          if (!isDuplicate) {
            jobs.push({
              title: title.substring(0, 200),
              description: description,
              applicationUrl,
              date: new Date().toISOString().split('T')[0],
              source: 'jobsofoman.com'
            });
          }
        } catch (err) {
          console.error('Error parsing job element:', err);
        }
      }
    }
    
    console.log(`Successfully scraped ${jobs.length} unique jobs`);
    return jobs;
    
  } catch (error) {
    console.error('Error scraping jobs:', error);
    
    // Return empty array instead of throwing to allow graceful handling
    if (error.name === 'AbortError') {
      console.error('Request timed out after 30 seconds');
    }
    
    throw error;
  }
}

/**
 * Generic scraper that can be extended for other websites
 */
export async function scrapeWebsite(url: string): Promise<ScrapedJob[]> {
  // For now, we only support jobsofoman.com
  if (url.includes('jobsofoman.com')) {
    return scrapeJobsOfOman();
  }
  
  throw new Error(`Scraping not supported for URL: ${url}. Currently only jobsofoman.com is supported.`);
}