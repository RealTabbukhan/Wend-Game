import fs from 'fs';
import path from 'path';

export default function sitemap() {
  const baseUrl = 'https://wendplay.com';

  // Static pages
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/archive`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/practice`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/unlimited`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/how-to-play`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/answers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ];

  // Daily puzzle pages — read available dates from data/daily
  const dailyPages = [];
  try {
    const dailyDir = path.join(process.cwd(), 'data', 'daily');
    const files = fs.readdirSync(dailyDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const date = file.replace('.json', '');
      dailyPages.push({
        url: `${baseUrl}/daily/${date}`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.6,
      });
    }
  } catch (e) {}

  return [...staticPages, ...dailyPages];
}
