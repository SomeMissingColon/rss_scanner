const Parser = require('rss-parser');
const fs = require('fs/promises');
const axios = require('axios');

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:97.0) Gecko/20100101 Firefox/97.0',
    'Accept': 'application/rss+xml'
  },
  customFields: {
    item: ['content']
  },
  followRedirects: true
});

async function loadCategories() {
    const content = await fs.readFile('keywords.txt', 'utf8');
    const categories = {};
    content.split('\n').forEach(word => {
      const [category, keyword] = word.replace(/(\r\n|\n|\r)/gm, "").toLowerCase().split(',');
      if (!categories[category]) {
        categories[category] = [];
      }
      console.log(keyword)
      categories[category].push(` ${keyword} `);
    });
    return categories;
   
  }

async function loadRssLinks() {
  const content = await fs.readFile('rsss.txt', 'utf8');
  const rsss = content.split('\n').map(word => word.replace(/(\r\n|\n|\r)/gm, "").toLowerCase());
  return rsss;
}
async function processFeed(rss, categories) {
    try {
      const response = await axios.get(rss);
      if (response.status === 404 || response.data.trim() === '') {
        console.log(`Removing invalid RSS link: ${rss}`);
        return null;
      }
      const feed = await parser.parseString(response.data);
  
      const results = [];
      for (const item of feed.items) {
        const title = item.title?.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || '';
        const content = item.content ? item.content.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';
        const link = item.link;
  
        //console.log(`Processing item: ${title}`);
  
        let matched = false;
        for (const category in categories) {
          if (matched) break;
  
          for (const keyword of categories[category]) {
            if (!matched && (title.includes(keyword) || content.includes(keyword))) {
            
              console.log(`Matched keyword: ${keyword}`);
              const row = [title, link, content, category].toString();
              results.push(row);
              matched = true;
            }
          }
        }
      }
      return { rss, results };
    } catch (err) {
      console.log(`Error processing feed '${rss}':`, err.message);
      return null;
    }
  }
  async function processFeeds(rsss, categories) {
    const promises = rsss.map(rss => processFeed(rss, categories));
    const results = await Promise.all(promises);
    const validResults = results.filter(result => result !== null);
  
    const output = validResults.flatMap(result => result.results);
    console.log("Output:", output); // Add this line
  
    if (output.length > 0) {
      const contentToAppend = output.map(row => `\r\n${row}`).join('');
      await fs.appendFile('ecologicalnews.txt', contentToAppend);
    } else {
      console.log("No matched items found."); // Add this line
    }
  
    const validRssLinks = validResults.map(result => result.rss);
    await fs.writeFile('rsss.txt', validRssLinks.join('\n'));
  }
  

(async () => {
  const categories = await loadCategories();
  const rsss = await loadRssLinks();
  await processFeeds(rsss, categories);
})();
