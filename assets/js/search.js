<script>
 // ========== 1. ADVANCED WORD SEARCH WITH HIGHLIGHTING & PAGINATION ==========
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const svgSearchIcon = document.querySelector('.search-icon');
const mainFeedContainer = document.querySelector('.site-main');

let searchDatabase = [];
let currentSearchPage = 1;
const resultsPerPage = 10;
let activeSearchQuery = "";

// 1. Fetch search data index securely from Jekyll setup
let searchDatabase = [];
let searchLoaded = false;

function loadSearchIndex() {
  if (searchLoaded) return Promise.resolve();
  searchLoaded = true;
  return fetch("{{ '/search.json' | relative_url }}")
    .then(function (response) { return response.json(); })
    .then(function (data) { searchDatabase = data; })
    .catch(function (err) { console.error("Could not load search index:", err); });
}

// Load when user focuses the search box
if (searchInput) {
  searchInput.addEventListener('focus', function () {
    loadSearchIndex();
  }, { once: true });
}

// Core Algorithm: Splits phrases into separate search words and scans all content keys
function getMatchedPosts(queryString) {
  const words = queryString.toLowerCase().split(/\s+/).filter(word => word.length > 0);
  if (words.length === 0) return [];

  return searchDatabase.filter(item => {
    const titleText = (item.title || '').toLowerCase();
    const excerptText = (item.excerpt || '').toLowerCase();
    const bodyText = (item.content || '').toLowerCase();

    return words.every(word => {
      return titleText.includes(word) || excerptText.includes(word) || bodyText.includes(word);
    });
  });
}

// Helper Function: Injects <mark> tags to highlight matching search words dynamically
function highlightText(text, queryString) {
  if (!text) return '';
  const words = queryString.split(/\s+/).filter(word => word.length > 0);
  if (words.length === 0) return text;
  
  let highlightedText = text;
  // Sort by length descending to prevent shorter matches inside longer words from breaking HTML structures
  words.sort((a, b) => b.length - a.length).forEach(word => {
    // Regex matches instances of words safely outside HTML entities
    const regex = new RegExp(`(${word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<mark style="background-color: #fef08a; color: #1e293b; padding: 2px 4px; border-radius: 4px; font-weight: 600;">$1</mark>');
  });
  return highlightedText;
}

// 2. Full-View Page Renderer Engine with Dynamic Custom Pagination
function displaySearchPageResults(matchedArticles, query, pageNum) {
  currentSearchPage = pageNum;
  activeSearchQuery = query;

  const totalResults = matchedArticles.length;
  const totalPages = Math.ceil(totalResults / resultsPerPage);

  // Slice array indexes matching target pages
  const startIndex = (pageNum - 1) * resultsPerPage;
  const endIndex = Math.min(startIndex + resultsPerPage, totalResults);
  const paginatedArticles = matchedArticles.slice(startIndex, endIndex);

  let resultsHTML = '';
  
  if (paginatedArticles.length > 0) {
    paginatedArticles.forEach(item => {
      // Highlight terms found across title strings and excerpt summaries
      const displayTitle = highlightText(item.title, query);
      const displayExcerpt = highlightText(item.excerpt, query);

      resultsHTML += `
        <div class="post-card">
          <div class="post-meta">
            <time>${item.date || ''}</time>
          </div>
          <h2><a href="${item.url}">${displayTitle || 'Untitled'}</a></h2>
          <p class="excerpt">${displayExcerpt || ''}</p>
          <a href="${item.url}" class="read-more">Read more →</a>
        </div>
      `;
    });

    // Generate pagination navigation template panel if total matches break beyond 10 posts threshold
    if (totalPages > 1) {
      resultsHTML += `
        <div class="pagination-search-nav" style="display: flex; justify-content: space-between; align-items: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid var(--border);">
          
          <button id="searchPrevBtn" ${pageNum === 1 ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''} 
            style="background: var(--primary); color: #ffffff; border: none; padding: 8px 16px; border-radius: var(--radius); font-weight: 600; cursor: pointer;">
            ← Previous Page
          </button>
          
          <span style="font-size: 14px; color: var(--muted); font-weight: 500;">
            Page ${pageNum} of ${totalPages}
          </span>
          
          <button id="searchNextBtn" ${pageNum === totalPages ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''} 
            style="background: var(--primary); color: #ffffff; border: none; padding: 8px 16px; border-radius: var(--radius); font-weight: 600; cursor: pointer;">
            Next Page →
          </button>
          
        </div>
      `;
    }
  } else {
    resultsHTML = '<div class="post-card" style="text-align:center; padding: 40px;"><p class="excerpt">No articles found matching your criteria.</p></div>';
  }

  // Rewrite site-main elements feed stream structure view frame safely
  mainFeedContainer.innerHTML = `
    <div class="search-page-header" style="margin-bottom: 30px; border-bottom: 2px solid var(--border); padding-bottom: 15px;">
      <h2 style="font-family: 'Amiri', serif; font-size: 28px; color: var(--primary); margin: 0 0 10px 0;">
        Search Results for: "${query}"
      </h2>
      <p style="font-size: 13px; color: var(--muted); margin: 0 0 12px 0;">Found ${totalResults} matching articles</p>
      <button onclick="window.location.reload();" style="background: none; border: none; color: var(--muted); cursor: pointer; text-decoration: underline; font-size: 14px; font-weight: 500; padding: 0;">
        ← Clear search and view all articles
      </button>
    </div>
    <div class="posts-grid-results">
      ${resultsHTML}
    </div>
  `;

  // Attach state events to newly rendered back/forth navigation control triggers
  const prevBtn = document.getElementById('searchPrevBtn');
  const nextBtn = document.getElementById('searchNextBtn');

  if (prevBtn && pageNum > 1) {
    prevBtn.addEventListener('click', () => {
      displaySearchPageResults(matchedArticles, query, pageNum - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (nextBtn && pageNum < totalPages) {
    nextBtn.addEventListener('click', () => {
      displaySearchPageResults(matchedArticles, query, pageNum + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

function initFullViewSearchSearch() {
  const rawQuery = searchInput.value.trim();
  if (rawQuery.length === 0) return;
  searchResults.style.display = 'none';
  if (mainFeedContainer) {
    const matchedArticles = getMatchedPosts(rawQuery);
    displaySearchPageResults(matchedArticles, rawQuery, 1);
  }
}

// 3. Dropdown autocomplete list logic as user types text entries
searchInput.addEventListener('input', function() {
  const query = this.value.trim();
  searchResults.innerHTML = '';

  if (query.length < 2) {
    searchResults.style.display = 'none';
    return;
  }

  const filtered = getMatchedPosts(query);

  if (filtered.length > 0) {
    filtered.slice(0, 8).forEach(item => {  
      const resElement = document.createElement('a');
      resElement.href = item.url;
      resElement.className = 'search-result-item';
      
      // Inject text highlights inside layout dropdown snippets too
      const dropTitle = highlightText(item.title, query);

      resElement.innerHTML = `
        <div class="search-result-title">${dropTitle || 'Untitled'}</div>
        <div class="search-result-meta">${item.date || ''}</div>
        <div class="search-result-excerpt">${item.excerpt || ''}</div>
      `;
      searchResults.appendChild(resElement);
    });
  } else {
    searchResults.innerHTML = '<div class="search-no-results">No articles found.</div>';
  }
  searchResults.style.display = 'block';
});

// 4. Keyboard Action Listener: Enter or mobile Go buttons
searchInput.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    initFullViewSearchSearch();
  }
});

// 4 & 5. Consolidated Event Interceptor: Executes on Enter keys, mobile Go, or Boxed Icon clicks
const searchForm = document.getElementById('searchForm');
if (searchForm) {
  searchForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Stop page from refreshing natively
    initFullViewSearchSearch(); // Triggers your highlighted full-page results view
  });
}



// 6. Dismiss dropdown panels when users select areas off-canvas
document.addEventListener('click', function(e) {
  if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
    searchResults.style.display = 'none';
  }
});


    // ========== 2. SIDEBAR ==========
    const sidebarMenu = document.getElementById("sidebarMenu");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const openMenuBtn = document.getElementById("openMenuBtn");
    const closeMenuBtn = document.getElementById("closeMenuBtn");

    function openSidebar() {
      sidebarMenu.classList.add("is-open");
      sidebarOverlay.classList.add("is-visible");
      openMenuBtn.style.opacity = "0";
      document.body.style.overflow = "hidden"; // prevent background scroll
    }

    function closeSidebar() {
      sidebarMenu.classList.remove("is-open");
      sidebarOverlay.classList.remove("is-visible");
      openMenuBtn.style.opacity = "1";
      document.body.style.overflow = "";
    }

    openMenuBtn.addEventListener("click", openSidebar);
    closeMenuBtn.addEventListener("click", closeSidebar);
    sidebarOverlay.addEventListener("click", closeSidebar);

    // Close sidebar when clicking a link
    document.querySelectorAll('.sidebar-links a').forEach(link => {
      link.addEventListener('click', closeSidebar);
    });

    // ========== 3. BACK TO TOP ==========
    const backToTopButton = document.getElementById("backToTop");

    window.addEventListener("scroll", function() {
      if (window.scrollY > 300) {
        backToTopButton.style.display = "block";
      } else {
        backToTopButton.style.display = "none";
      }
    });

    backToTopButton.addEventListener("click", function() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  </script>

 <script>
document.addEventListener("DOMContentLoaded", function () {
  // Don't run on the media gallery itself
  const path = window.location.pathname;
  if (path.includes('/media/') || path.endsWith('/media.html')) return;

  function getCleanPathString(url) {
    if (!url) return '';
    return url.split('#')[0].split('?')[0].trim();
  }

  function generateCleanImageHash(rawSrc) {
    const cleanUrl = getCleanPathString(rawSrc);
    if (!cleanUrl) return 'img-null';

    let hash = 0;
    for (let i = 0; i < cleanUrl.length; i++) {
      hash = ((hash << 5) - hash) + cleanUrl.charCodeAt(i);
      hash |= 0; // force 32-bit
    }
    return 'img-ref-' + Math.abs(hash);
  }

  // Give every image a stable ID based on its src
  document.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src') || '';
    if (!src || src.startsWith('data:')) return;

    // Only set ID if it doesn't already have one
    if (!img.id) {
      img.id = generateCleanImageHash(src);
    }

    // Offset for sticky headers
    img.style.scrollMarginTop = '120px';
  });

  // Scroll to the target after a short delay (gives images time to be in the DOM)
  if (window.location.hash) {
    const targetId = decodeURIComponent(window.location.hash.slice(1));

    // Try a few times in case of lazy-loading / delayed rendering
    const tryScroll = (attempts = 0) => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (attempts < 8) {
        setTimeout(() => tryScroll(attempts + 1), 150);
      }
    };

    setTimeout(() => tryScroll(), 300);
  }
});
</script>
<script>
  // Close dropdown on Escape
searchInput.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    searchResults.style.display = 'none';
    searchInput.blur();
  }
  if (event.key === 'Enter') {
    event.preventDefault();
    initFullViewSearchSearch();
  }
});

// Keep the existing input listener, but ensure display is set correctly:
searchInput.addEventListener('input', function () {
  const query = this.value.trim();
  searchResults.innerHTML = '';

  if (query.length < 2) {
    searchResults.style.display = 'none';
    return;
  }

  const filtered = getMatchedPosts(query);

  if (filtered.length > 0) {
    filtered.slice(0, 8).forEach(item => {
      const a = document.createElement('a');
      a.href = item.url;
      a.className = 'search-result-item';
      a.setAttribute('role', 'option');
      a.innerHTML = `
        <div class="search-result-title">${highlightText(item.title, query)}</div>
        <div class="search-result-meta">${item.date || ''}</div>
        <div class="search-result-excerpt">${item.excerpt || ''}</div>
      `;
      searchResults.appendChild(a);
    });
  } else {
    searchResults.innerHTML = '<div class="search-no-results">No articles found.</div>';
  }
  searchResults.style.display = 'block';
});

// Outside click (you already have this – keep it)
document.addEventListener('click', function (e) {
  if (!searchInput.contains(e.target) && !searchResults.contains(e.target) && !e.target.closest('.search-icon-box')) {
    searchResults.style.display = 'none';
  }
});
</script>
  
<script>
  function positionSearchDropdown() {
  if (!searchResults || !searchInput) return;
  const rect = searchInput.getBoundingClientRect();
  // Place just under the input
  searchResults.style.top = (rect.bottom + 8) + 'px';
  searchResults.style.left = '10px';
  searchResults.style.right = '10px';
  searchResults.style.width = 'auto';
}

function showSearchDropdown() {
  if (!searchResults) return;
  positionSearchDropdown();
  searchResults.style.display = 'block';
}

function hideSearchDropdown() {
  if (!searchResults) return;
  searchResults.style.display = 'none';
}

// Live suggestions while typing
searchInput.addEventListener('input', function () {
  const query = this.value.trim();
  searchResults.innerHTML = '';

  if (query.length < 2) {
    hideSearchDropdown();
    return;
  }

  const filtered = getMatchedPosts(query);

  if (filtered.length > 0) {
    filtered.slice(0, 8).forEach(item => {
      const a = document.createElement('a');
      a.href = item.url;
      a.className = 'search-result-item';
      a.innerHTML = `
        <div class="search-result-title">${highlightText(item.title, query)}</div>
        <div class="search-result-meta">${item.date || ''}</div>
        <div class="search-result-excerpt">${item.excerpt || ''}</div>
      `;
      searchResults.appendChild(a);
    });
  } else {
    searchResults.innerHTML = '<div class="search-no-results">No articles found.</div>';
  }

  showSearchDropdown();
});

// Keep position correct when scrolling / rotating
window.addEventListener('scroll', function () {
  if (searchResults && searchResults.style.display === 'block') {
    positionSearchDropdown();
  }
}, { passive: true });

window.addEventListener('resize', function () {
  if (searchResults && searchResults.style.display === 'block') {
    positionSearchDropdown();
  }
});

// Close when tapping outside (don’t close when tapping the input or results)
document.addEventListener('click', function (e) {
  if (
    !searchInput.contains(e.target) &&
    !searchResults.contains(e.target) &&
    !e.target.closest('.search-icon-box')
  ) {
    hideSearchDropdown();
  }
});

// Close on Escape
searchInput.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    hideSearchDropdown();
    searchInput.blur();
  }
  if (event.key === 'Enter') {
    event.preventDefault();
    hideSearchDropdown();
    initFullViewSearchSearch();
  }
});
  
</script>


