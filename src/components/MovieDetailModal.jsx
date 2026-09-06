import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchFromTMDB, enhanceMovieData, TMDB_CONFIG, getPlaceholderPoster } from '../services/tmdb';

export default function MovieDetailModal() {
  const { lang, t, activeDetailModal, closeDetailModal, isFavorite, toggleFavorite, openVideoModal } = useApp();
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);

  const movieId = activeDetailModal.movieId;

  useEffect(() => {
    if (!activeDetailModal.open || !movieId) return;

    let isMounted = true;
    async function loadDetails() {
      setLoading(true);
      let details = await fetchFromTMDB(`/movie/${movieId}`, {}, lang);
      if (details) {
        details = await enhanceMovieData(details, lang);
        if (isMounted) setMovie(details);
      }

      // Fetch credits & similar
      const credits = await fetchFromTMDB(`/movie/${movieId}/credits`, {}, lang);
      if (credits && credits.cast && isMounted) {
        setCast(credits.cast.slice(0, 10));
      }

      const simData = await fetchFromTMDB(`/movie/${movieId}/similar`, {}, lang);
      if (simData && simData.results && isMounted) {
        setSimilar(simData.results.slice(0, 8));
      }

      if (isMounted) setLoading(false);
    }

    loadDetails();
    return () => { isMounted = false; };
  }, [activeDetailModal.open, movieId, lang]);

  if (!activeDetailModal.open) return null;

  const backdropUrl = movie && movie.backdrop_path
    ? `${TMDB_CONFIG.BACKDROP_BASE}${movie.backdrop_path}`
    : (movie ? getPlaceholderPoster(movie.title) : '');

  const posterUrl = movie && movie.poster_path
    ? `${TMDB_CONFIG.POSTER_BASE}${movie.poster_path}`
    : (movie ? getPlaceholderPoster(movie.title) : '');

  const rating = movie && movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  const year = movie && movie.release_date ? movie.release_date.split('-')[0] : '2026';
  const fav = movie ? isFavorite(movie.id) : false;

  let runtimeText = 'N/A';
  if (movie && movie.runtime) {
    const hrs = Math.floor(movie.runtime / 60);
    const mins = movie.runtime % 60;
    runtimeText = `${hrs}${t('runtimeUnit')} ${mins}${t('minUnit')}`;
  }

  const handlePlayMovie = () => {
    closeDetailModal();
    openVideoModal(movie);
  };

  return (
    <div className="modal-overlay" onClick={closeDetailModal}>
      <div className="glass-modal modal-detail-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={closeDetailModal}>
          <i className="fa-solid fa-xmark"></i>
        </button>

        {loading || !movie ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--neon-cyan)' }}>
            <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
            <p style={{ marginTop: 12 }}>Yuklanmoqda...</p>
          </div>
        ) : (
          <>
            <div className="detail-backdrop-wrap">
              <div
                className="detail-backdrop"
                style={{ backgroundImage: `url('${backdropUrl}')` }}
              ></div>
              <div className="detail-backdrop-mask"></div>
            </div>

            <div className="detail-body">
              <div className="detail-poster-wrap">
                <img src={posterUrl} alt={movie.title} className="detail-poster" />
                <div className="detail-poster-badge">
                  <i className="fa-solid fa-star"></i> {rating}
                </div>
              </div>

              <div className="detail-info">
                <h2 className="detail-title">{movie.title || movie.original_title}</h2>
                <div className="detail-original-title">{movie.original_title}</div>

                <div className="detail-tags">
                  <span className="tag-pill tag-year">{year}</span>
                  <span className="tag-pill tag-runtime">
                    <i className="fa-solid fa-clock"></i> {runtimeText}
                  </span>
                  <span className="tag-pill tag-status">{movie.status || 'Released'}</span>
                </div>

                <div className="detail-genres">
                  {(movie.genres || []).map((g) => (
                    <span key={g.id} className="genre-tag">
                      {g.name}
                    </span>
                  ))}
                </div>

                <p className="detail-overview">{movie.overview || t('noMoviesDesc')}</p>

                <div className="detail-actions">
                  <button className="btn btn-primary" onClick={handlePlayMovie}>
                    <i className="fa-solid fa-play"></i> <span>{t('watchMovie')}</span>
                  </button>
                  <button className="btn btn-glass" onClick={() => toggleFavorite(movie)}>
                    <i className={`${fav ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>{' '}
                    <span>{fav ? t('removeFromFav') : t('addToFav')}</span>
                  </button>
                </div>

                {/* Cast Section */}
                <div className="detail-cast-section">
                  <h3 className="sub-heading">{t('actors')}</h3>
                  <div className="cast-list">
                    {cast.length > 0 ? (
                      cast.map((actor) => {
                        const avatarUrl = actor.profile_path
                          ? `${TMDB_CONFIG.POSTER_BASE}${actor.profile_path}`
                          : 'https://via.placeholder.com/150/1f2937/ffffff?text=Actor';
                        return (
                          <div key={actor.id} className="cast-item">
                            <img src={avatarUrl} alt={actor.name} className="cast-avatar" />
                            <div className="cast-name">{actor.name}</div>
                            <div className="cast-character">{actor.character || ''}</div>
                          </div>
                        );
                      })
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Aktyorlar ma'lumoti mavjud emas
                      </p>
                    )}
                  </div>
                </div>

                {/* Similar Movies Section */}
                <div className="detail-similar-section">
                  <h3 className="sub-heading">{t('similarMovies')}</h3>
                  <div className="similar-grid">
                    {similar.length > 0 ? (
                      similar.map((sim) => {
                        const simPoster = sim.poster_path
                          ? `${TMDB_CONFIG.POSTER_BASE}${sim.poster_path}`
                          : getPlaceholderPoster(sim.title);
                        return (
                          <div
                            key={sim.id}
                            className="similar-card"
                            onClick={() => {
                              closeDetailModal();
                              setTimeout(() => useApp().openDetailModal(sim.id), 200);
                            }}
                          >
                            <img src={simPoster} alt={sim.title} className="similar-poster" />
                            <div className="similar-title">{sim.title}</div>
                          </div>
                        );
                      })
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        O'xshash kinolar topilmadi
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
