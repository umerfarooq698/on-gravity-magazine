// Automated Free Indexing Engine (Google WebSub + IndexNow)
// Zero billing, Zero API keys required.

const fs = require('fs');
const path = require('path');

const ARTICLES_FILE = path.join(__dirname, '..', 'data', 'articles.ts');

function getAllPublishedUrls() {
  const urls = [
    "https://www.ongravitymagazine.com/",
    "https://www.ongravitymagazine.com/sitemap.xml",
    "https://www.ongravitymagazine.com/feed.xml",
    "https://www.ongravitymagazine.com/rss.xml",
    "https://www.ongravitymagazine.com/about",
    "https://www.ongravitymagazine.com/category/tech",
    "https://www.ongravitymagazine.com/category/life-style",
    "https://www.ongravitymagazine.com/category/celebrity",
    "https://www.ongravitymagazine.com/category/health",
    "https://www.ongravitymagazine.com/category/business",
    "https://www.ongravitymagazine.com/category/news",
    "https://www.ongravitymagazine.com/category/food"
  ];

  if (fs.existsSync(ARTICLES_FILE)) {
    const content = fs.readFileSync(ARTICLES_FILE, 'utf-8');
    const matches = content.match(/"slug":\s*"([^"]+)"/g) || [];
    for (const m of matches) {
      const match = m.match(/"slug":\s*"([^"]+)"/);
      if (match && match[1]) {
        urls.push(`https://www.ongravitymagazine.com/${match[1].toLowerCase().trim()}`);
      }
    }
  }

  return Array.from(new Set(urls));
}

async function pingGoogleWebSub() {
  console.log("=== 1. Pinging Google WebSub (PubSubHubbub) ===");
  const hubs = [
    "https://pubsubhubbub.appspot.com/",
    "https://pubsubhubbub.superfeedr.com/"
  ];

  const feedsToPing = [
    "https://www.ongravitymagazine.com/feed.xml",
    "https://www.ongravitymagazine.com/rss.xml",
    "https://www.ongravitymagazine.com/sitemap.xml"
  ];

  for (const hub of hubs) {
    for (const feedUrl of feedsToPing) {
      try {
        const body = new URLSearchParams({
          "hub.mode": "publish",
          "hub.url": feedUrl
        });

        const res = await fetch(hub, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString()
        });

        console.log(`[Google WebSub] ${hub} -> ${feedUrl} [Status: ${res.status}]`);
      } catch (err) {
        console.warn(`[Google WebSub Error] ${hub}:`, err.message);
      }
    }
  }
}

async function pingIndexNow(urls) {
  console.log(`\n=== 2. Pinging IndexNow API (${urls.length} URLs) ===`);
  const indexNowEndpoints = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow"
  ];

  const payload = {
    host: "www.ongravitymagazine.com",
    key: "a65080e03104882ba93c502e351f98c1",
    keyLocation: "https://www.ongravitymagazine.com/a65080e03104882ba93c502e351f98c1.txt",
    urlList: urls
  };

  for (const endpoint of indexNowEndpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload)
      });
      console.log(`[IndexNow] ${endpoint} [Status: ${res.status}]`);
    } catch (err) {
      console.warn(`[IndexNow Error] ${endpoint}:`, err.message);
    }
  }
}

async function run() {
  console.log("=== STARTING INSTANT AUTO-INDEXING PING ===");
  const allUrls = getAllPublishedUrls();
  console.log(`Found ${allUrls.length} total URLs to push for indexing.`);

  await pingGoogleWebSub();
  await pingIndexNow(allUrls);

  console.log("\n=== AUTO-INDEXING COMPLETED SUCCESSFULLY ===");
}

if (require.main === module) {
  run().catch(console.error);
}

module.exports = { pingGoogleWebSub, pingIndexNow, getAllPublishedUrls };
