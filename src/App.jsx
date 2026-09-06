import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { fetchFromTMDB, enhanceMovieData } from './services/tmdb';

import Navbar from './components/Navbar';
import HeroSlider from './components/HeroSlider';
import FilterBar from './components/FilterBar';
import MovieGrid from './components/MovieGrid';
import MovieDetailModal from './components/MovieDetailModal';
import VideoPlayerModal from './components/VideoPlayerModal';
import ToastContainer from './components/ToastContainer';

export default function App() {
  const { lang, favorites, t } = useApp();

  const [currentCategory, setCategory] = useState('popular'); // 'popular', 'top_rated', 'upcoming', 'favorites', 'search'
  const [currentGenreId, setGenreId] = useState('all');
  const [currentSort, setSort] = useState('popularity.desc');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [genres, setGenres] = useState([]);
  const [genresMap, setGenresMap] = useState({});

  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load Genres on mount & language change
  useEffect(() => {
    let isMounted = true;
    async function loadGenres() {
      const data = await fetchFromTMDB('/genre/movie/list', {}, lang);
      if (data && data.genres && isMounted) {
        setGenres(data.genres);
        const map = {};
        data.genres.forEach((g) => { map[g.id] = g.name; });
        setGenresMap(map);
      }
    }
    loadGenres();
    return () => { isMounted = false; };
  }, [lang]);

  // Main Movies Loader Effect
  useEffect(() => {
    let isMounted = true;

    async function loadMovies() {
      setIsLoading(true);

      if (currentCategory === 'favorites') {
        setMovies(favorites);
        setTotalResults(favorites.length);
        setTotalPages(1);
        setIsLoading(false);
        return;
      }

      let endpoint = '/movie/popular';
      let params = { page, sort_by: currentSort };

      if (currentCategory === 'search' && searchQuery) {
        endpoint = '/search/movie';
        params = { query: searchQuery, page };
      } else if (currentGenreId !== 'all') {
        endpoint = '/discover/movie';
        params = { with_genres: currentGenreId, sort_by: currentSort, page };
      } else if (currentCategory === 'top_rated') {
        endpoint = '/movie/top_rated';
      } else if (currentCategory === 'upcoming') {
        endpoint = '/movie/upcoming';
      }

      const data = await fetchFromTMDB(endpoint, params, lang);

      if (data && data.results && isMounted) {
        const enhanced = await Promise.all(data.results.map((m) => enhanceMovieData(m, lang)));
        
        if (page === 1) {
          setMovies(enhanced);
        } else {
          setMovies((prev) => [...prev, ...enhanced]);
        }

        setTotalPages(data.total_pages || 1);
        setTotalResults(data.total_results || data.results.length);
      } else if (isMounted) {
        if (page === 1) setMovies([]);
      }

      if (isMounted) setIsLoading(false);
    }

    loadMovies();
    return () => { isMounted = false; };
  }, [currentCategory, currentGenreId, currentSort, searchQuery, page, lang, favorites]);

  // Reset page to 1 on filter changes
  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  const handleGenreChange = (genreId) => {
    setGenreId(genreId);
    setPage(1);
  };

  const handleSortChange = (sortVal) => {
    setSort(sortVal);
    setPage(1);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCategory('search');
    setGenreId('all');
    setPage(1);
  };

  const handleResetFilters = () => {
    setCategory('popular');
    setGenreId('all');
    setSearchQuery('');
    setPage(1);
  };

  const handleLogoClick = () => {
    handleResetFilters();
  };

  return (
    <div className="app-container">
      {/* Background Ambient Orbs */}
      <div className="ambient-orb orb-1"></div>
      <div className="ambient-orb orb-2"></div>
      <div className="ambient-orb orb-3"></div>

      {/* Header Navigation */}
      <Navbar
        currentCategory={currentCategory}
        setCategory={handleCategoryChange}
        setSearchQuery={handleSearch}
        onLogoClick={handleLogoClick}
      />

      {/* Main Content */}
      <main className="main-content">
        {/* Hero Slider Banner */}
        <HeroSlider genresMap={genresMap} />

        {/* Filter & Genre Bar */}
        <FilterBar
          genres={genres}
          currentGenreId={currentGenreId}
          setGenreId={handleGenreChange}
          currentSort={currentSort}
          setSort={handleSortChange}
          currentCategory={currentCategory}
          searchQuery={searchQuery}
          totalResults={totalResults}
        />

        {/* Responsive Movie Grid */}
        <MovieGrid
          movies={movies}
          isLoading={isLoading}
          hasMore={page < totalPages}
          onLoadMore={() => setPage((prev) => prev + 1)}
          onResetFilters={handleResetFilters}
          currentCategory={currentCategory}
        />
      </main>

      {/* Modals & Notifications */}
      <MovieDetailModal />
      <VideoPlayerModal />
      <ToastContainer />

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-logo">
            <i className="fa-solid fa-clapperboard"></i> UZMOVI <span>CYBER</span>
          </div>
          <p className="footer-desc">{t('footerText')}</p>
          <div className="footer-credits">
            © 2026 UzMovi Cyber React Architecture. Barcha huquqlar himoyalangan.
          </div>
        </div>
      </footer>
    </div>
  );
}
