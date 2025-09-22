// generate-sitemap.js
const fs = require("fs");
const bible = require("./kjv_nested.json");

const BASE_URL = "https://ourbible.github.io/bible";
let urls = [];

for (const book in bible) {
  for (const chapter in bible[book]) {
    // Chapter page
    urls.push(`${BASE_URL}/${encodeURIComponent(book)}/${chapter}`);
    for (const verse in bible[book][chapter]) {
      // Verse page
      urls.push(`${BASE_URL}/${encodeURIComponent(book)}/${chapter}/${verse}`);
    }
  }
}

// Bungkus dalam XML
const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls
    .map(
      u => `  <url>
    <loc>${u}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`
    )
    .join("\n") +
  `\n</urlset>`;

fs.writeFileSync("sitemap.xml", sitemap, "utf8");
console.log("✅ sitemap.xml generated with", urls.length, "urls");
