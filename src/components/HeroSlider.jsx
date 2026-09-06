import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchFromTMDB, enhanceMovieData, TMDB_CONFIG, getPlaceholderPoster } from '../services/tmdb';

export default function HeroSlider({ genresMap }) {
  const { lang, t, isFavorite, toggleFavorite, openDetailModal, openVideoModal } = useApp();
  const [heroMovies, setHeroMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadHero() {
      const data = await fetchFromTMDB('/movie/popular', { page: 1 }, lang);
      if (data && data.results && data.results.length > 0 && isMounted) {
        const top5 = data.results.slice(0, 5);
        const enhanced = await Promise.all(top5.map((m) => enhanceMovieData(m, lang)));
        setHeroMovies(enhanced);
        setCurrentIndex(0);
      }
    }
    loadHero();
    return () => { isMounted = false; };
  }, [lang]);

  // Auto rotate timer
  useEffect(() => {
    if (!heroMovies || heroMovies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroMovies.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroMovies]);

  if (!heroMovies || heroMovies.length === 0) return null;

  const currentMovie = heroMovies[currentIndex];
  const backdropUrl = currentMovie.backdrop_path
    ? `${TMDB_CONFIG.BACKDROP_BASE}${currentMovie.backdrop_path}`
    : getPlaceholderPoster(currentMovie.title);

  const rating = currentMovie.vote_average ? currentMovie.vote_average.toFixed(1) : '0.0';
  const year = currentMovie.release_date ? currentMovie.release_date.split('-')[0] : '2026';
  
  const genreNames = (currentMovie.genre_ids || [])
    .map((id) => genresMap[id])
    .filter(Boolean)
    .slice(0, 3)
    .join(' • ');

  const fav = isFavorite(currentMovie.id);

  const handleWatchMovie = () => {
    openVideoModal(currentMovie);
  };

  return (
    <section className="hero-section">
      <div
        className="hero-backdrop"
        style={{ backgroundImage: `url('${backdropUrl}')` }}
      ></div>
      <div className="hero-overlay"></div>

      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <i className="fa-solid fa-bolt"></i> <span>{t('topBadge')}</span>
          </div>
          <h1 className="hero-title">{currentMovie.title || currentMovie.original_title}</h1>

          <div className="hero-meta">
            <span className="hero-rating">
              <i className="fa-solid fa-star"></i> <strong>{rating}</strong>
            </span>
            <span className="hero-year">{year}</span>
            <span className="hero-quality">4K ULTRA HD</span>
            {genreNames && <span className="hero-genres">{genreNames}</span>}
          </div>

          <p className="hero-overview">
            {currentMovie.overview || t('noMoviesDesc')}
          </p>

          <div className="hero-actions">
            <button className="btn btn-primary" onClick={handleWatchMovie}>
              <i className="fa-solid fa-play"></i> <span>{t('watchMovie')}</span>
            </button>
            <button className="btn btn-glass" onClick={() => openDetailModal(currentMovie.id)}>
              <i className="fa-solid fa-circle-info"></i> <span>{t('details')}</span>
            </button>
            <button
              className={`btn btn-icon ${fav ? 'active' : ''}`}
              onClick={() => toggleFavorite(currentMovie)}
              title="Saqlash"
            >
              <i className={`${fav ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
            </button>
          </div>
        </div>

        {/* Carousel Controls */}
        <div className="hero-controls">
          <button
            className="hero-nav-btn"
            onClick={() => setCurrentIndex((prev) => (prev - 1 + heroMovies.length) % heroMovies.length)}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <div className="hero-dots">
            {heroMovies.map((_, idx) => (
              <div
                key={idx}
                className={`hero-dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              ></div>
            ))}
          </div>
          <button
            className="hero-nav-btn"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % heroMovies.length)}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </section>
  );
}
