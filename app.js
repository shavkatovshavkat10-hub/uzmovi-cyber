/* ==========================================================================
   UzMovi Cyber - Full-Featured Application Script
   TMDB API Integration, Liquid Glass Architecture, UZ/RU Localization
   ========================================================================== */

// --- TMDB API Credentials ---
const TMDB_CONFIG = {
  API_KEY: '47ac567cd301db9214967f1607095c42',
  BASE_URL: 'https://api.themoviedb.org/3',
  POSTER_BASE: 'https://image.tmdb.org/t/p/w500',
  BACKDROP_BASE: 'https://image.tmdb.org/t/p/original',
  READ_TOKEN: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0N2FjNTY3Y2QzMDFkYjkyMTQ5NjdmMTYwNzA5NWM0MiIsIm5iZiI6MTc4ODUwOTI0Mi44MDcwMDAyLCJzdWIiOiI2YTlhN2MzYTQ2ZDc0MDkwZWY2MmQ2NzciLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.rbKNmLv_Vv8G8zlRfbD7r-pUD2_E2dTQqiZ2K6tfjJ8'
};

// --- Localization Dictionary (UZ / RU) ---
const I18N = {
  'uz-UZ': {
    popular: "Ommabop",
    topRated: "Eng saralari",
    upcoming: "Tez kunda",
    favorites: "Sevilganlar",
    popularMovies: "Ommabop Kinolar",
    topRatedMovies: "Eng Yuqori Reytingli Kinolar",
    upcomingMovies: "Tez Kunda Chiqadigan Kinolar",
    favoriteMovies: "Sevilgan Kinolar",
    searchResults: "Qidiruv natijalari",
    watchTrailer: "Treylerni ko'rish",
    details: "Batafsil",
    sortBy: "Saralash:",
    sortPopularity: "Ommabopligi bo'yicha",
    sortRating: "Reytingi bo'yicha",
    sortDate: "Chiqish sanasi bo'yicha",
    allGenres: "Barcha Janrlar",
    loadMore: "Yana ko'proq yuklash",
    noMoviesFound: "Hech qanday kino topilmadi",
    noMoviesDesc: "Boshqa so'z bilan qidirib ko'ring yoki janr filtrini o'zgartiring.",
    resetFilters: "Filtrlarni tozalash",
    actors: "Bosh rollarda",
    similarMovies: "O'xshash kinolar",
    addToFav: "Saqlab qo'yish",
    removeFromFav: "Saqlangandan o'chirish",
    searchPlaceholder: "Kino, serial qidirish...",
    moviesCount: "ta kino",
    addedToFavToast: "Kino sevilganlarga qo'shildi!",
    removedFavToast: "Kino sevilganlardan o'chirildi",
    langChangedToast: "Til O'zbekchaga almashtirildi",
    videoLoading: "Video pleyer yuklanmoqda...",
    noTrailerFound: "Kechirasiz, ushbu kino uchun treyler topilmadi.",
    runtimeUnit: "s",
    minUnit: "d",
    topBadge: "TOP KINO"
  },
  'ru-RU': {
    popular: "Популярные",
    topRated: "Топ рейтинга",
    upcoming: "Скоро в кино",
    favorites: "Избранное",
    popularMovies: "Популярные фильмы",
    topRatedMovies: "Фильмы с высоким рейтингом",
    upcomingMovies: "Скоро на экранах",
    favoriteMovies: "Избранные фильмы",
    searchResults: "Результаты поиска",
    watchTrailer: "Смотреть трейлер",
    details: "Подробнее",
    sortBy: "Сортировка:",
    sortPopularity: "По популярности",
    sortRating: "По рейтингу",
    sortDate: "По дате выхода",
    allGenres: "Все жанры",
    loadMore: "Загрузить еще",
    noMoviesFound: "Фильмы не найдены",
    noMoviesDesc: "Попробуйте изменить поисковый запрос или фильтры.",
    resetFilters: "Сбросить фильтры",
    actors: "В главных ролях",
    similarMovies: "Похожие фильмы",
    addToFav: "В избранное",
    removeFromFav: "Из избранного",
    searchPlaceholder: "Поиск фильмов, сериалов...",
    moviesCount: "фильмов",
    addedToFavToast: "Фильм добавлен в избранное!",
    removedFavToast: "Фильм удален из избранного",
    langChangedToast: "Язык изменен на русский",
    videoLoading: "Загрузка видеоплеера...",
    noTrailerFound: "К сожалению, трейлер для этого фильма не найден.",
    runtimeUnit: "ч",
    minUnit: "мин",
    topBadge: "ТОП ФИЛЬМ"
  }
};

// --- Application State ---
const state = {
  currentLang: localStorage.getItem('uzmovi_lang') || 'uz-UZ',
  currentPage: 1,
  totalPages: 1,
  currentCategory: 'popular', // 'popular', 'top_rated', 'upcoming', 'favorites', 'search'
  currentGenreId: 'all',
  currentSort: 'popularity.desc',
  searchQuery: '',
  favorites: JSON.parse(localStorage.getItem('uzmovi_favorites')) || [],
  genresMap: {},
  heroMovies: [],
  currentHeroIndex: 0,
  heroTimer: null,
  activeMovie: null,
  activeVideoKey: null,
  isLoading: false
};

// --- Helper Functions ---
function getTranslation(key) {
  return (I18N[state.currentLang] && I18N[state.currentLang][key]) || I18N['uz-UZ'][key] || key;
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--neon-cyan)"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function getPlaceholderPoster(title = '') {
  const safeTitle = encodeURIComponent(title || 'UzMovi');
  return `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750"%3E%3Crect width="100%25" height="100%25" fill="%23111827"/%3E%3Ctext x="50%25" y="45%25" dominant-baseline="middle" text-anchor="middle" fill="%2300f2fe" font-family="sans-serif" font-size="28" font-weight="bold"%3EUZMOVI%3C/text%3E%3Ctext x="50%25" y="52%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="sans-serif" font-size="18"%3E${safeTitle}%3C/text%3E%3C/svg%3E`;
}

// --- TMDB API Fetcher ---
async function fetchFromTMDB(endpoint, params = {}) {
  const queryParams = new URLSearchParams({
    api_key: TMDB_CONFIG.API_KEY,
    language: state.currentLang,
    ...params
  });

  const url = `${TMDB_CONFIG.BASE_URL}${endpoint}?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${TMDB_CONFIG.READ_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`TMDB Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Fetch error for ${endpoint}:`, error);
    return null;
  }
}

// --- Uzbek Language Fallback Enhancer ---
async function enhanceUzbekData(movie) {
  if (!movie) return movie;

  // If language is uz-UZ and overview or title is missing, fallback to ru-RU
  if (state.currentLang === 'uz-UZ' && (!movie.overview || movie.overview.trim() === '' || !movie.title)) {
    const ruData = await fetchFromTMDB(`/movie/${movie.id}`, { language: 'ru-RU' });
    if (ruData) {
      if (!movie.overview || movie.overview.trim() === '') movie.overview = ruData.overview;
      if (!movie.title) movie.title = ruData.title;
    }
  }
  return movie;
}

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
  initI18nUI();
  setupEventListeners();
  await loadGenres();
  await loadHeroMovies();
  await loadMainMovies();
  updateFavBadge();
});

// --- I18n UI Updater ---
function initI18nUI() {
  document.getElementById('currentLangLabel').textContent = state.currentLang === 'uz-UZ' ? 'UZ' : 'RU';
  document.getElementById('searchInput').placeholder = getTranslation('searchPlaceholder');
  
  // Translate all DOM elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = getTranslation(key);
  });
}

// --- Language Toggle Handler ---
async function toggleLanguage() {
  state.currentLang = state.currentLang === 'uz-UZ' ? 'ru-RU' : 'uz-UZ';
  localStorage.setItem('uzmovi_lang', state.currentLang);
  
  initI18nUI();
  showToast(getTranslation('langChangedToast'));

  // Re-fetch genres, hero, and current grid
  await loadGenres();
  await loadHeroMovies();
  state.currentPage = 1;
  await loadMainMovies();
}

// --- Genres Loader ---
async function loadGenres() {
  const data = await fetchFromTMDB('/genre/movie/list');
  if (data && data.genres) {
    state.genresMap = {};
    data.genres.forEach(g => {
      state.genresMap[g.id] = g.name;
    });

    renderGenrePills(data.genres);
  }
}

function renderGenrePills(genres) {
  const genreBar = document.getElementById('genreBar');
  genreBar.innerHTML = `<button class="genre-pill ${state.currentGenreId === 'all' ? 'active' : ''}" data-id="all">${getTranslation('allGenres')}</button>`;

  genres.forEach(g => {
    const pill = document.createElement('button');
    pill.className = `genre-pill ${state.currentGenreId == g.id ? 'active' : ''}`;
    pill.setAttribute('data-id', g.id);
    pill.textContent = g.name;
    genreBar.appendChild(pill);
  });
}

// --- Hero Banner Carousel ---
async function loadHeroMovies() {
  const data = await fetchFromTMDB('/movie/popular', { page: 1 });
  if (data && data.results && data.results.length > 0) {
    state.heroMovies = data.results.slice(0, 5);
    state.currentHeroIndex = 0;
    renderHeroSlide(0);
    startHeroTimer();
  }
}

async function renderHeroSlide(index) {
  if (!state.heroMovies || state.heroMovies.length === 0) return;
  const movie = await enhanceUzbekData(state.heroMovies[index]);
  if (!movie) return;

  const backdropUrl = movie.backdrop_path ? `${TMDB_CONFIG.BACKDROP_BASE}${movie.backdrop_path}` : getPlaceholderPoster(movie.title);
  const heroBackdrop = document.getElementById('heroBackdrop');
  
  heroBackdrop.style.opacity = '0';
  setTimeout(() => {
    heroBackdrop.style.backgroundImage = `url('${backdropUrl}')`;
    heroBackdrop.style.opacity = '1';
  }, 300);

  document.getElementById('heroTitle').textContent = movie.title || movie.original_title;
  document.getElementById('heroRating').textContent = movie.vote_average ? movie.vote_average.toFixed(1) : '0.0';
  document.getElementById('heroYear').textContent = movie.release_date ? movie.release_date.split('-')[0] : '2026';
  document.getElementById('heroOverview').textContent = movie.overview || getTranslation('noMoviesDesc');
  document.getElementById('heroBadgeText').textContent = getTranslation('topBadge');

  // Genres names
  const genreNames = (movie.genre_ids || [])
    .map(id => state.genresMap[id])
    .filter(Boolean)
    .slice(0, 3)
    .join(' • ');
  document.getElementById('heroGenres').textContent = genreNames || 'Kino';

  // Hero Actions
  const watchBtn = document.getElementById('heroWatchBtn');
  const detailsBtn = document.getElementById('heroDetailsBtn');
  const favBtn = document.getElementById('heroFavBtn');

  watchBtn.onclick = () => openVideoModal(movie.id, movie.title);
  detailsBtn.onclick = () => openMovieDetailModal(movie.id);
  
  // Fav status
  const isFav = isMovieFavorite(movie.id);
  favBtn.className = `btn btn-icon ${isFav ? 'active' : ''}`;
  favBtn.innerHTML = `<i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>`;
  favBtn.onclick = (e) => {
    e.stopPropagation();
    toggleFavoriteMovie(movie);
    const nowFav = isMovieFavorite(movie.id);
    favBtn.className = `btn btn-icon ${nowFav ? 'active' : ''}`;
    favBtn.innerHTML = `<i class="${nowFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>`;
  };

  // Dots
  renderHeroDots();
}

function renderHeroDots() {
  const dotsContainer = document.getElementById('heroDots');
  dotsContainer.innerHTML = '';
  state.heroMovies.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = `hero-dot ${i === state.currentHeroIndex ? 'active' : ''}`;
    dot.onclick = () => {
      state.currentHeroIndex = i;
      renderHeroSlide(i);
      resetHeroTimer();
    };
    dotsContainer.appendChild(dot);
  });
}

function startHeroTimer() {
  clearInterval(state.heroTimer);
  state.heroTimer = setInterval(() => {
    if (state.heroMovies.length > 0) {
      state.currentHeroIndex = (state.currentHeroIndex + 1) % state.heroMovies.length;
      renderHeroSlide(state.currentHeroIndex);
    }
  }, 6000);
}

function resetHeroTimer() {
  startHeroTimer();
}

// --- Main Movie Grid Loader ---
async function loadMainMovies(append = false) {
  if (state.isLoading) return;
  state.isLoading = true;

  const movieGrid = document.getElementById('movieGrid');
  const loadSpinner = document.getElementById('loadSpinner');
  const emptyState = document.getElementById('emptyState');
  const resultsCount = document.getElementById('resultsCount');

  if (!append) {
    movieGrid.innerHTML = renderSkeletonCards(10);
    emptyState.classList.add('hidden');
  } else {
    loadSpinner.classList.remove('hidden');
  }

  let data = null;

  if (state.currentCategory === 'favorites') {
    // Favorites category handled separately
    renderFavoritesGrid();
    state.isLoading = false;
    loadSpinner.classList.add('hidden');
    return;
  } else if (state.searchQuery && state.searchQuery.trim() !== '') {
    data = await fetchFromTMDB('/search/movie', {
      query: state.searchQuery,
      page: state.currentPage
    });
    document.getElementById('gridTitleText').textContent = `${getTranslation('searchResults')}: "${state.searchQuery}"`;
  } else if (state.currentGenreId !== 'all') {
    data = await fetchFromTMDB('/discover/movie', {
      with_genres: state.currentGenreId,
      sort_by: state.currentSort,
      page: state.currentPage
    });
    const genreName = state.genresMap[state.currentGenreId] || 'Janr';
    document.getElementById('gridTitleText').textContent = `${genreName} - ${getTranslation('popularMovies')}`;
  } else {
    // Category fetching
    let endpoint = '/movie/popular';
    let titleKey = 'popularMovies';

    if (state.currentCategory === 'top_rated') {
      endpoint = '/movie/top_rated';
      titleKey = 'topRatedMovies';
    } else if (state.currentCategory === 'upcoming') {
      endpoint = '/movie/upcoming';
      titleKey = 'upcomingMovies';
    }

    data = await fetchFromTMDB(endpoint, {
      page: state.currentPage
    });
    document.getElementById('gridTitleText').textContent = getTranslation(titleKey);
  }

  state.isLoading = false;
  loadSpinner.classList.add('hidden');

  if (data && data.results) {
    state.totalPages = data.total_pages || 1;
    resultsCount.textContent = `${data.total_results || data.results.length} ${getTranslation('moviesCount')}`;

    if (!append) movieGrid.innerHTML = '';

    if (data.results.length === 0 && !append) {
      emptyState.classList.remove('hidden');
      document.getElementById('loadMoreBtn').classList.add('hidden');
      return;
    }

    data.results.forEach(movie => {
      movieGrid.appendChild(createMovieCardElement(movie));
    });

    // Toggle Load More Button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (state.currentPage < state.totalPages && state.currentCategory !== 'favorites') {
      loadMoreBtn.classList.remove('hidden');
    } else {
      loadMoreBtn.classList.add('hidden');
    }
  } else {
    if (!append) {
      movieGrid.innerHTML = '';
      emptyState.classList.remove('hidden');
    }
  }
}

// --- Skeleton Card Generator ---
function renderSkeletonCards(count = 10) {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `<div class="skeleton-card"></div>`;
  }
  return html;
}

// --- Movie Card DOM Element Creator ---
function createMovieCardElement(movie) {
  const card = document.createElement('div');
  card.className = 'movie-card';
  card.setAttribute('data-id', movie.id);

  const posterUrl = movie.poster_path ? `${TMDB_CONFIG.POSTER_BASE}${movie.poster_path}` : getPlaceholderPoster(movie.title);
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  const year = movie.release_date ? movie.release_date.split('-')[0] : '2026';
  const isFav = isMovieFavorite(movie.id);

  card.innerHTML = `
    <div class="card-poster-wrap">
      <img src="${posterUrl}" alt="${movie.title || 'Movie'}" class="card-poster" loading="lazy">
      <button class="card-fav-btn ${isFav ? 'active' : ''}" title="Sevilganlar" data-fav-id="${movie.id}">
        <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
      </button>
      <div class="card-rating-badge">
        <i class="fa-solid fa-star"></i> ${rating}
      </div>
      <div class="card-hover-overlay">
        <div class="card-play-icon">
          <i class="fa-solid fa-play"></i>
        </div>
      </div>
    </div>
    <div class="card-info">
      <h3 class="card-title">${movie.title || movie.original_title}</h3>
      <div class="card-meta">
        <span class="card-year">${year}</span>
        <span class="card-quality">HD</span>
      </div>
    </div>
  `;

  // Click handlers
  card.onclick = (e) => {
    if (e.target.closest('.card-fav-btn')) return; // handled separately
    openMovieDetailModal(movie.id);
  };

  const favBtn = card.querySelector('.card-fav-btn');
  favBtn.onclick = (e) => {
    e.stopPropagation();
    toggleFavoriteMovie(movie);
    const nowFav = isMovieFavorite(movie.id);
    favBtn.className = `card-fav-btn ${nowFav ? 'active' : ''}`;
    favBtn.innerHTML = `<i class="${nowFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>`;
    
    if (state.currentCategory === 'favorites') {
      renderFavoritesGrid();
    }
  };

  return card;
}

// --- Favorites Management ---
function isMovieFavorite(movieId) {
  return state.favorites.some(m => m.id === movieId);
}

function toggleFavoriteMovie(movie) {
  const index = state.favorites.findIndex(m => m.id === movie.id);
  if (index > -1) {
    state.favorites.splice(index, 1);
    showToast(getTranslation('removedFavToast'));
  } else {
    state.favorites.push({
      id: movie.id,
      title: movie.title || movie.original_title,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
      release_date: movie.release_date
    });
    showToast(getTranslation('addedToFavToast'));
  }

  localStorage.setItem('uzmovi_favorites', JSON.stringify(state.favorites));
  updateFavBadge();
}

function updateFavBadge() {
  const badge = document.getElementById('favBadge');
  if (badge) badge.textContent = state.favorites.length;
}

function renderFavoritesGrid() {
  const movieGrid = document.getElementById('movieGrid');
  const emptyState = document.getElementById('emptyState');
  const resultsCount = document.getElementById('resultsCount');
  const loadMoreBtn = document.getElementById('loadMoreBtn');

  document.getElementById('gridTitleText').textContent = getTranslation('favoriteMovies');
  resultsCount.textContent = `${state.favorites.length} ${getTranslation('moviesCount')}`;
  loadMoreBtn.classList.add('hidden');

  movieGrid.innerHTML = '';

  if (state.favorites.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  state.favorites.forEach(movie => {
    movieGrid.appendChild(createMovieCardElement(movie));
  });
}

// --- Real-time Live Search & Dropdown Suggestions ---
let searchDebounceTimer = null;

function handleSearchInput(e) {
  const query = e.target.value.trim();
  const clearBtn = document.getElementById('clearSearchBtn');
  const dropdown = document.getElementById('searchDropdown');

  if (query.length > 0) {
    clearBtn.classList.remove('hidden');
  } else {
    clearBtn.classList.add('hidden');
    dropdown.classList.add('hidden');
    return;
  }

  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(async () => {
    const data = await fetchFromTMDB('/search/movie', { query, page: 1 });
    if (data && data.results && data.results.length > 0) {
      renderSearchDropdown(data.results.slice(0, 6));
    } else {
      dropdown.classList.add('hidden');
    }
  }, 300);
}

function renderSearchDropdown(results) {
  const dropdown = document.getElementById('searchDropdown');
  const container = document.getElementById('searchDropdownResults');
  container.innerHTML = '';

  results.forEach(movie => {
    const item = document.createElement('div');
    item.className = 'search-item';
    const posterUrl = movie.poster_path ? `${TMDB_CONFIG.POSTER_BASE}${movie.poster_path}` : getPlaceholderPoster(movie.title);
    const year = movie.release_date ? movie.release_date.split('-')[0] : '';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '';

    item.innerHTML = `
      <img src="${posterUrl}" alt="${movie.title}" class="search-item-thumb">
      <div class="search-item-info">
        <div class="search-item-title">${movie.title}</div>
        <div class="search-item-meta">
          <span><i class="fa-solid fa-star" style="color:#fbbf24"></i> ${rating}</span>
          <span>• ${year}</span>
        </div>
      </div>
    `;

    item.onclick = () => {
      dropdown.classList.add('hidden');
      openMovieDetailModal(movie.id);
    };

    container.appendChild(item);
  });

  dropdown.classList.remove('hidden');
}

function submitFullSearch() {
  const searchInput = document.getElementById('searchInput');
  const query = searchInput.value.trim();
  if (!query) return;

  document.getElementById('searchDropdown').classList.add('hidden');
  state.searchQuery = query;
  state.currentCategory = 'search';
  state.currentPage = 1;
  state.currentGenreId = 'all';

  // Highlight reset
  document.querySelectorAll('.nav-link, .mobile-link, .genre-pill').forEach(el => el.classList.remove('active'));
  loadMainMovies();
}

// --- Movie Detail View Modal ---
async function openMovieDetailModal(movieId) {
  const modal = document.getElementById('detailModal');
  modal.classList.remove('hidden');

  let movie = await fetchFromTMDB(`/movie/${movieId}`);
  if (!movie) return;
  movie = await enhanceUzbekData(movie);
  state.activeMovie = movie;

  const backdropUrl = movie.backdrop_path ? `${TMDB_CONFIG.BACKDROP_BASE}${movie.backdrop_path}` : getPlaceholderPoster(movie.title);
  const posterUrl = movie.poster_path ? `${TMDB_CONFIG.POSTER_BASE}${movie.poster_path}` : getPlaceholderPoster(movie.title);
  
  document.getElementById('detailBackdrop').style.backgroundImage = `url('${backdropUrl}')`;
  document.getElementById('detailPoster').src = posterUrl;
  document.getElementById('detailTitle').textContent = movie.title || movie.original_title;
  document.getElementById('detailOriginalTitle').textContent = movie.original_title || '';
  document.getElementById('detailRatingBadge').innerHTML = `<i class="fa-solid fa-star"></i> ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}`;
  document.getElementById('detailYear').textContent = movie.release_date ? movie.release_date.split('-')[0] : '2026';
  
  // Runtime formatting
  if (movie.runtime) {
    const hrs = Math.floor(movie.runtime / 60);
    const mins = movie.runtime % 60;
    document.getElementById('detailRuntime').innerHTML = `<i class="fa-solid fa-clock"></i> ${hrs}${getTranslation('runtimeUnit')} ${mins}${getTranslation('minUnit')}`;
  } else {
    document.getElementById('detailRuntime').textContent = 'N/A';
  }

  document.getElementById('detailStatus').textContent = movie.status || 'Released';
  document.getElementById('detailOverview').textContent = movie.overview || getTranslation('noMoviesDesc');

  // Genres
  const genresWrap = document.getElementById('detailGenres');
  genresWrap.innerHTML = '';
  (movie.genres || []).forEach(g => {
    const span = document.createElement('span');
    span.className = 'genre-tag';
    span.textContent = g.name;
    genresWrap.appendChild(span);
  });

  // Fav button status in modal
  const favBtn = document.getElementById('detailFavBtn');
  const isFav = isMovieFavorite(movie.id);
  favBtn.innerHTML = `<i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i> <span>${isFav ? getTranslation('removeFromFav') : getTranslation('addToFav')}</span>`;
  favBtn.onclick = () => {
    toggleFavoriteMovie(movie);
    const nowFav = isMovieFavorite(movie.id);
    favBtn.innerHTML = `<i class="${nowFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i> <span>${nowFav ? getTranslation('removeFromFav') : getTranslation('addToFav')}</span>`;
  };

  // Play Trailer
  document.getElementById('detailPlayTrailerBtn').onclick = () => {
    modal.classList.add('hidden');
    openVideoModal(movie.id, movie.title);
  };

  // Fetch Credits & Similar
  loadCastList(movieId);
  loadSimilarMovies(movieId);
}

async function loadCastList(movieId) {
  const container = document.getElementById('detailCastList');
  container.innerHTML = '<p class="text-muted">Yuklanmoqda...</p>';

  const credits = await fetchFromTMDB(`/movie/${movieId}/credits`);
  if (credits && credits.cast && credits.cast.length > 0) {
    container.innerHTML = '';
    credits.cast.slice(0, 10).forEach(actor => {
      const avatarUrl = actor.profile_path ? `${TMDB_CONFIG.POSTER_BASE}${actor.profile_path}` : 'https://via.placeholder.com/150/1f2937/ffffff?text=Actor';
      const item = document.createElement('div');
      item.className = 'cast-item';
      item.innerHTML = `
        <img src="${avatarUrl}" alt="${actor.name}" class="cast-avatar">
        <div class="cast-name">${actor.name}</div>
        <div class="cast-character">${actor.character || ''}</div>
      `;
      container.appendChild(item);
    });
  } else {
    container.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem">Aktyorlar ma'lumoti mavjud emas</p>`;
  }
}

async function loadSimilarMovies(movieId) {
  const container = document.getElementById('detailSimilarGrid');
  container.innerHTML = '';

  const data = await fetchFromTMDB(`/movie/${movieId}/similar`);
  if (data && data.results && data.results.length > 0) {
    data.results.slice(0, 8).forEach(sim => {
      const posterUrl = sim.poster_path ? `${TMDB_CONFIG.POSTER_BASE}${sim.poster_path}` : getPlaceholderPoster(sim.title);
      const card = document.createElement('div');
      card.className = 'similar-card';
      card.innerHTML = `
        <img src="${posterUrl}" alt="${sim.title}" class="similar-poster">
        <div class="similar-title">${sim.title}</div>
      `;
      card.onclick = () => {
        openMovieDetailModal(sim.id);
      };
      container.appendChild(card);
    });
  } else {
    container.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem">O'xshash kinolar topilmadi</p>`;
  }
}

// --- Video Player Modal (Trailer Player) ---
async function openVideoModal(movieId, movieTitle = '') {
  const modal = document.getElementById('videoModal');
  const titleEl = document.getElementById('videoModalTitle');
  const iframe = document.getElementById('videoIframe');
  const loader = document.getElementById('videoLoadingSpinner');

  modal.classList.remove('hidden');
  titleEl.textContent = `${movieTitle} - ${getTranslation('watchTrailer')}`;
  loader.classList.remove('hidden');
  iframe.src = '';

  // Fetch videos from TMDB
  const videoData = await fetchFromTMDB(`/movie/${movieId}/videos`);
  let youtubeKey = null;

  if (videoData && videoData.results && videoData.results.length > 0) {
    // Prefer Official Trailer on YouTube
    const trailer = videoData.results.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')) || videoData.results[0];
    if (trailer) youtubeKey = trailer.key;
  }

  state.activeVideoKey = youtubeKey;

  if (youtubeKey) {
    iframe.src = `https://www.youtube-nocookie.com/embed/${youtubeKey}?autoplay=1&rel=0&modestbranding=1`;
    iframe.onload = () => loader.classList.add('hidden');
  } else {
    loader.classList.add('hidden');
    showToast(getTranslation('noTrailerFound'), 'error');
  }
}

function closeVideoModal() {
  const modal = document.getElementById('videoModal');
  const iframe = document.getElementById('videoIframe');
  iframe.src = ''; // Stop video playback
  modal.classList.add('hidden');
}

// --- Event Listeners Setup ---
function setupEventListeners() {
  // Language Switcher Button
  document.getElementById('langToggleBtn').onclick = toggleLanguage;

  // Search Input Events
  const searchInput = document.getElementById('searchInput');
  searchInput.oninput = handleSearchInput;
  searchInput.onkeydown = (e) => {
    if (e.key === 'Enter') submitFullSearch();
  };

  document.getElementById('clearSearchBtn').onclick = () => {
    searchInput.value = '';
    document.getElementById('clearSearchBtn').classList.add('hidden');
    document.getElementById('searchDropdown').classList.add('hidden');
    if (state.currentCategory === 'search') {
      state.currentCategory = 'popular';
      state.searchQuery = '';
      loadMainMovies();
    }
  };

  // Close search dropdown on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) {
      document.getElementById('searchDropdown').classList.add('hidden');
    }
  });

  // Mobile Menu Toggle
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileDrawer');
  mobileBtn.onclick = () => {
    drawer.classList.toggle('hidden');
  };

  // Desktop & Mobile Navigation Links
  const navHandler = (e) => {
    const link = e.target.closest('[data-category]');
    if (!link) return;
    e.preventDefault();

    const category = link.getAttribute('data-category');
    state.currentCategory = category;
    state.currentPage = 1;
    state.currentGenreId = 'all';
    state.searchQuery = '';

    // Active state toggling
    document.querySelectorAll('.nav-link, .mobile-link').forEach(el => {
      if (el.getAttribute('data-category') === category) el.classList.add('active');
      else el.classList.remove('active');
    });

    document.querySelectorAll('.genre-pill').forEach(p => {
      if (p.getAttribute('data-id') === 'all') p.classList.add('active');
      else p.classList.remove('active');
    });

    drawer.classList.add('hidden');
    loadMainMovies();
  };

  document.querySelector('.nav-links').onclick = navHandler;
  document.getElementById('mobileDrawer').onclick = navHandler;
  document.getElementById('logoBtn').onclick = (e) => {
    e.preventDefault();
    state.currentCategory = 'popular';
    state.currentPage = 1;
    state.currentGenreId = 'all';
    state.searchQuery = '';
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    document.getElementById('navPopular').classList.add('active');
    loadMainMovies();
  };

  // Genre Pills Bar Scrolling & Clicking
  const genreBar = document.getElementById('genreBar');
  genreBar.onclick = (e) => {
    const pill = e.target.closest('.genre-pill');
    if (!pill) return;

    document.querySelectorAll('.genre-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');

    state.currentGenreId = pill.getAttribute('data-id');
    state.currentPage = 1;
    state.searchQuery = '';

    loadMainMovies();
  };

  document.getElementById('genreScrollLeft').onclick = () => {
    genreBar.scrollBy({ left: -200, behavior: 'smooth' });
  };
  document.getElementById('genreScrollRight').onclick = () => {
    genreBar.scrollBy({ left: 200, behavior: 'smooth' });
  };

  // Sort Select Box
  document.getElementById('sortSelect').onchange = (e) => {
    state.currentSort = e.target.value;
    state.currentPage = 1;
    loadMainMovies();
  };

  // Load More Pagination Button
  document.getElementById('loadMoreBtn').onclick = () => {
    state.currentPage++;
    loadMainMovies(true);
  };

  // Reset Filters Button
  document.getElementById('resetFilterBtn').onclick = () => {
    state.currentCategory = 'popular';
    state.currentGenreId = 'all';
    state.searchQuery = '';
    document.getElementById('searchInput').value = '';
    loadMainMovies();
  };

  // Hero Prev / Next Controls
  document.getElementById('heroPrevBtn').onclick = () => {
    if (state.heroMovies.length > 0) {
      state.currentHeroIndex = (state.currentHeroIndex - 1 + state.heroMovies.length) % state.heroMovies.length;
      renderHeroSlide(state.currentHeroIndex);
      resetHeroTimer();
    }
  };
  document.getElementById('heroNextBtn').onclick = () => {
    if (state.heroMovies.length > 0) {
      state.currentHeroIndex = (state.currentHeroIndex + 1) % state.heroMovies.length;
      renderHeroSlide(state.currentHeroIndex);
      resetHeroTimer();
    }
  };

  // Modal Close Buttons & Backdrop Click
  document.getElementById('closeDetailModalBtn').onclick = () => {
    document.getElementById('detailModal').classList.add('hidden');
  };
  document.getElementById('detailModal').onclick = (e) => {
    if (e.target.id === 'detailModal') {
      document.getElementById('detailModal').classList.add('hidden');
    }
  };

  document.getElementById('closeVideoModalBtn').onclick = closeVideoModal;
  document.getElementById('videoModal').onclick = (e) => {
    if (e.target.id === 'videoModal') closeVideoModal();
  };

  // Server Selector Tabs in Video Modal
  document.querySelectorAll('.server-tab').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('.server-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const server = tab.getAttribute('data-server');
      const iframe = document.getElementById('videoIframe');
      
      if (server === 'youtube' && state.activeVideoKey) {
        iframe.src = `https://www.youtube-nocookie.com/embed/${state.activeVideoKey}?autoplay=1`;
      } else if (server === 'videocdn' && state.activeMovie) {
        // Fallback Kodik/Videocdn player frame simulation
        iframe.src = `https://vidsrc.me/embed/movie?tmdb=${state.activeMovie.id}`;
      }
    };
  });
}
