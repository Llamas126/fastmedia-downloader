const fs = require('fs');
const path = require('path');

const baseUrl = 'https://fastmedia.qbitsglobal.com';
const locales = [
  'es', 'en', 'pt', 'fr', 'de', 'it', 'nl', 'pl', 'sv', 'da', 'no', 'fi', 'el',
  'uk', 'ru', 'cs', 'sk', 'sl', 'hr', 'sr', 'bg', 'ro', 'hu', 'lt', 'lv', 'et',
  'ar', 'he', 'fa', 'tr', 'ka', 'hy', 'hi', 'ur', 'mr', 'ta', 'te', 'bn', 'pa',
  'gu', 'kn', 'ml', 'ne', 'si', 'zh', 'ja', 'ko', 'vi', 'th', 'id', 'ms', 'mn',
  'my', 'km', 'lo', 'sw', 'af'
];

const legalPages = ['terms', 'privacy', 'cookies'];

function generateSitemap() {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Home page
  xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>2026-09-09</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
  
  // Root legal pages (Spanish)
  legalPages.forEach(page => {
    xml += `  <url>\n    <loc>${baseUrl}/${page}</loc>\n    <lastmod>2026-09-09</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  });

  // All locale legal pages (with localized root-like pages)
  locales.forEach(locale => {
    legalPages.forEach(page => {
      xml += `  <url>\n    <loc>${baseUrl}/${locale}/${page}</loc>\n    <lastmod>2026-09-09</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });
  });
  
  xml += '</urlset>\n';
  return xml;
}

const sitemap = generateSitemap();
const outputPath = path.join(__dirname, 'services', 'frontend', 'public', 'sitemap.xml');
fs.writeFileSync(outputPath, sitemap, 'utf8');
console.log('Sitemap generated successfully at:', outputPath);
console.log('Total URLs:', 1 + 3 + locales.length * 3);