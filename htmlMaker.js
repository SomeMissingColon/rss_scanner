const fs = require('fs');
const cheerio = require('cheerio');

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function extractImageUrl(content) {
  const $ = cheerio.load(content);
  const img = $('img');
  if (img.length > 0) {
    return img.attr('src');
  } else {
    return 'https://via.placeholder.com/300x200';
  }
}
// Read the ecologicalnews.txt file
const data = fs.readFileSync('ecologicalnews.txt', 'utf8');
const lines = data.split('\r\n');

const articles = [];

// Process each line
lines.forEach(line => {
  if (line) {
    const [title, link, content, category] = line.split(',');
    articles.push({
      title: escapeHtml(title),
      link: escapeHtml(link),
      content: escapeHtml(content),
      category: escapeHtml(category),
    });
  }
});

// Generate the HTML content
const htmlContent = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
     <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
 
    <style>
      .card-img-top {
        max-height: 200px;
        object-fit: cover;
      }
    </style>
    <title>Ecological News</title>
  </head>
  <body>
    <div class="container">
      <h1 class="my-4">Ecological News</h1>
      <div class="mb-4">
        <label for="categoryFilter" class="me-2">Filter by category:</label>
        <select id="categoryFilter" class="me-4">
          <option value="">All categories</option>
          <option value="Innovation">Innovation</option>
          <option value="Art & Artists">Art & Artists</option>
          <option value="politics">Politics</option>
          <option value="local collaboration">Local Collaboration</option>
          <option value="wellness">Wellness</option>
        </select>
        <label for="searchInput" class="me-2">Search:</label>
        <input type="text" id="searchInput" class="me-4" placeholder="Search articles..." />
      </div>
      <div class="row" id="articles-container">
        ${articles.map(article => `
          <div class="col-md-4">
            <div class="card mb-4 article-card" data-category="${article.category}">
              <img src="${extractImageUrl(article.content)}" class="card-img-top" alt="...">
              <div class="card-body">
                <h5 class="card-title">${article.title}</h5>
                <p class="card-text">${article.content}</p>
                <a href="${article.link}" class="btn btn-primary" target="_blank">Read More</a>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <script>
      const categoryFilter = document.getElementById('categoryFilter');
      const searchInput = document.getElementById('searchInput');
      const articlesContainer = document.getElementById('articles-container');
      const articleCards = document.querySelectorAll('.article-card');

      categoryFilter.addEventListener('change', () => {
        filterArticles();
      });

      searchInput.addEventListener('input', () => {
        filterArticles();
      });

      function filterArticles() {
        const selectedCategory = categoryFilter.value;
        const searchText = searchInput.value.toLowerCase();

        while (articlesContainer.firstChild) {
          articlesContainer.removeChild(articlesContainer.firstChild);
        }

        articleCards.forEach(card => {
            const cardTitle = card.querySelector('.card-title').textContent.toLowerCase();
            const cardCategory = card.getAttribute('data-category');
            
            if ((selectedCategory === '' || cardCategory === selectedCategory) && (searchText === '' || cardTitle.includes(searchText))) {
              const clonedCard = card.cloneNode(true);
              const colDiv = document.createElement('div');
              colDiv.className = 'col-md-4';
              colDiv.appendChild(clonedCard);
              articlesContainer.appendChild(colDiv);
            }
          });
        }
      </script>
    </body>
  </html>
  `;
  
  // Write the HTML content to a new file
  fs.writeFileSync('ecologicalnews.html', htmlContent, 'utf8');
  