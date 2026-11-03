document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.category-tab');
  const searchInput = document.querySelector('.blog-search-input');
  const articles = document.querySelectorAll('.article-card');

  function filterArticles() {
    const activeTab = document.querySelector('.category-tab.active');
    const selectedCategory = activeTab ? activeTab.getAttribute('data-category') : 'all';
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    articles.forEach(card => {
      const cardCategory = card.getAttribute('data-category') || '';
      const title = card.querySelector('h3') ? card.querySelector('h3').textContent.toLowerCase() : '';
      const desc = card.querySelector('p') ? card.querySelector('p').textContent.toLowerCase() : '';

      const matchesCategory = (selectedCategory === 'all' || cardCategory === selectedCategory);
      const matchesSearch = query === '' || title.includes(query) || desc.includes(query);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  if (tabs.length > 0) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        filterArticles();
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterArticles);
  }
});