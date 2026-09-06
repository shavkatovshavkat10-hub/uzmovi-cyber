// --- TMDB API Credentials & Configuration ---
export const TMDB_CONFIG = {
  API_KEY: '47ac567cd301db9214967f1607095c42',
  BASE_URL: 'https://api.themoviedb.org/3',
  POSTER_BASE: 'https://image.tmdb.org/t/p/w500',
  BACKDROP_BASE: 'https://image.tmdb.org/t/p/original',
  READ_TOKEN: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0N2FjNTY3Y2QzMDFkYjkyMTQ5NjdmMTYwNzA5NWM0MiIsIm5iZiI6MTc4ODUwOTI0Mi44MDcwMDAyLCJzdWIiOiI2YTlhN2MzYTQ2ZDc0MDkwZWY2MmQ2NzciLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.rbKNmLv_Vv8G8zlRfbD7r-pUD2_E2dTQqiZ2K6tfjJ8'
};

// SVG Placeholder generator for missing posters
export function getPlaceholderPoster(title = 'UzMovi') {
  const safeTitle = encodeURIComponent(title || 'UzMovi Cyber');
  return `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750"%3E%3Crect width="100%25" height="100%25" fill="%23111827"/%3E%3Ctext x="50%25" y="45%25" dominant-baseline="middle" text-anchor="middle" fill="%2300f2fe" font-family="sans-serif" font-size="28" font-weight="bold"%3EUZMOVI%3C/text%3E%3Ctext x="50%25" y="52%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="sans-serif" font-size="18"%3E${safeTitle}%3C/text%3E%3C/svg%3E`;
}

// Core TMDB Fetcher
export async function fetchFromTMDB(endpoint, params = {}, lang = 'uz-UZ') {
  const queryParams = new URLSearchParams({
    api_key: TMDB_CONFIG.API_KEY,
    language: lang,
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
      throw new Error(`TMDB API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Fetch error for ${endpoint}:`, error);
    return null;
  }
}

// Enhance Uzbek missing data by fetching Russian/English fallback
export async function enhanceMovieData(movie, lang = 'uz-UZ') {
  if (!movie) return movie;

  if (lang === 'uz-UZ' && (!movie.overview || movie.overview.trim() === '' || !movie.title)) {
    const fallback = await fetchFromTMDB(`/movie/${movie.id}`, { language: 'ru-RU' }, 'ru-RU');
    if (fallback) {
      if (!movie.overview || movie.overview.trim() === '') movie.overview = fallback.overview;
      if (!movie.title) movie.title = fallback.title;
    }
  }

  return movie;
}
