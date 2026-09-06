import React from 'react';
import { useApp } from '../context/AppContext';
import MovieCard from './MovieCard';

export default function MovieGrid({
  movies,
  isLoading,
  hasMore,
  onLoadMore,
  onResetFilters,
  currentCategory
}) {
  const { t } = useApp();

  return (
    <section className="movies-section container">
      {/* Movie Grid */}
      <div className="movie-grid">
        {isLoading && movies.length === 0 ? (
          Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="skeleton-card"></div>
          ))
        ) : (
          movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)
        )}
      </div>

      {/* Empty State */}
      {!isLoading && movies.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon"><i class="fa-solid fa-film"></i></div>
          <h3 className="empty-title">{t('noMoviesFound')}</h3>
          <p className="empty-desc">{t('noMoviesDesc')}</p>
          <button className="btn btn-glass" onClick={onResetFilters}>
            {t('resetFilters')}
          </button>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && currentCategory !== 'favorites' && movies.length > 0 && (
        <div className="load-more-wrapper">
          <button
            className="btn btn-glass-glow btn-large"
            onClick={onLoadMore}
            disabled={isLoading}
          >
            <span>{t('loadMore')}</span>
            {isLoading && <i className="fa-solid fa-spinner fa-spin loader-spinner" style={{ marginLeft: 8 }}></i>}
          </button>
        </div>
      )}
    </section>
  );
}
