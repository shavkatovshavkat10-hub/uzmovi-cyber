import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';

export default function FilterBar({
  genres,
  currentGenreId,
  setGenreId,
  currentSort,
  setSort,
  currentCategory,
  searchQuery,
  totalResults
}) {
  const { t } = useApp();
  const genreBarRef = useRef(null);

  const getTitleText = () => {
    if (currentCategory === 'favorites') return t('favoriteMovies');
    if (currentCategory === 'search') return `${t('searchResults')}: "${searchQuery}"`;
    if (currentGenreId !== 'all') {
      const g = genres.find((item) => item.id == currentGenreId);
      return g ? `${g.name} - ${t('popularMovies')}` : t('popularMovies');
    }
    if (currentCategory === 'top_rated') return t('topRatedMovies');
    if (currentCategory === 'upcoming') return t('upcomingMovies');
    return t('popularMovies');
  };

  const handleScroll = (offset) => {
    if (genreBarRef.current) {
      genreBarRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section className="filter-section container">
      <div className="section-header">
        <div className="section-title-wrap">
          <h2 className="section-title">
            <i className="fa-solid fa-compass title-icon"></i>
            <span>{getTitleText()}</span>
          </h2>
          <span className="results-count">
            {totalResults} {t('moviesCount')}
          </span>
        </div>

        {/* Sort Select Box */}
        <div className="sort-wrapper">
          <label htmlFor="sortSelect" className="sort-label">
            <i className="fa-solid fa-arrow-down-short-wide"></i> <span>{t('sortBy')}</span>
          </label>
          <select
            id="sortSelect"
            className="glass-select"
            value={currentSort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="popularity.desc">{t('sortPopularity')}</option>
            <option value="vote_average.desc">{t('sortRating')}</option>
            <option value="primary_release_date.desc">{t('sortDate')}</option>
          </select>
        </div>
      </div>

      {/* Genres Pills Bar */}
      <div className="genre-bar-wrapper">
        <button className="genre-scroll-btn left" onClick={() => handleScroll(-200)}>
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        
        <div className="genre-bar" ref={genreBarRef}>
          <button
            className={`genre-pill ${currentGenreId === 'all' ? 'active' : ''}`}
            onClick={() => setGenreId('all')}
          >
            {t('allGenres')}
          </button>
          {genres.map((g) => (
            <button
              key={g.id}
              className={`genre-pill ${currentGenreId == g.id ? 'active' : ''}`}
              onClick={() => setGenreId(g.id)}
            >
              {g.name}
            </button>
          ))}
        </div>

        <button className="genre-scroll-btn right" onClick={() => handleScroll(200)}>
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </section>
  );
}
