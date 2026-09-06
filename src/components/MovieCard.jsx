import React from 'react';
import { useApp } from '../context/AppContext';
import { TMDB_CONFIG, getPlaceholderPoster } from '../services/tmdb';

export default function MovieCard({ movie }) {
  const { isFavorite, toggleFavorite, openDetailModal } = useApp();

  const posterUrl = movie.poster_path
    ? `${TMDB_CONFIG.POSTER_BASE}${movie.poster_path}`
    : getPlaceholderPoster(movie.title);

  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  const year = movie.release_date ? movie.release_date.split('-')[0] : '2026';
  const fav = isFavorite(movie.id);

  const handleFavClick = (e) => {
    e.stopPropagation();
    toggleFavorite(movie);
  };

  return (
    <div className="movie-card" onClick={() => openDetailModal(movie.id)}>
      <div className="card-poster-wrap">
        <img
          src={posterUrl}
          alt={movie.title || 'Movie'}
          className="card-poster"
          loading="lazy"
        />
        <button
          className={`card-fav-btn ${fav ? 'active' : ''}`}
          onClick={handleFavClick}
          title="Sevilganlar"
        >
          <i className={`${fav ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
        </button>

        <div className="card-rating-badge">
          <i className="fa-solid fa-star"></i> {rating}
        </div>

        <div className="card-hover-overlay">
          <div className="card-play-icon">
            <i className="fa-solid fa-play"></i>
          </div>
        </div>
      </div>

      <div className="card-info">
        <h3 className="card-title">{movie.title || movie.original_title}</h3>
        <div className="card-meta">
          <span className="card-year">{year}</span>
          <span className="card-quality">HD</span>
        </div>
      </div>
    </div>
  );
}
