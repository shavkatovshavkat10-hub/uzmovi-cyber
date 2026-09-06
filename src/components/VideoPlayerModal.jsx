import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function VideoPlayerModal() {
  const { t, activeVideoModal, closeVideoModal } = useApp();
  const [activeServer, setActiveServer] = useState('uzmovi');
  const [iframeLoading, setIframeLoading] = useState(true);

  const { open, movie, youtubeKey } = activeVideoModal;

  useEffect(() => {
    if (open) {
      // Default to UzMovi HD Server (full movie) when opening
      setActiveServer('uzmovi');
      setIframeLoading(true);
    }
  }, [open]);

  if (!open || !movie) return null;

  let streamUrl = '';
  if (activeServer === 'youtube') {
    if (youtubeKey) {
      streamUrl = `https://www.youtube-nocookie.com/embed/${youtubeKey}?autoplay=1&rel=0&modestbranding=1`;
    } else {
      streamUrl = '';
    }
  } else if (activeServer === 'uzmovi') {
    // Clean full movie embed stream
    streamUrl = `https://vidsrc.me/embed/movie?tmdb=${movie.id}`;
  }

  return (
    <div className="modal-overlay" onClick={closeVideoModal}>
      <div className="glass-modal modal-video-content" onClick={(e) => e.stopPropagation()}>
        <div className="video-modal-header">
          <div className="video-title-wrap">
            <i className="fa-solid fa-circle-play video-header-icon"></i>
            <h3 className="video-modal-title">
              {movie.title || movie.original_title} - {t('watchTrailer')}
            </h3>
          </div>
          <button className="modal-close-btn" onClick={closeVideoModal}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Server Selector Tabs (Restored to exact initial design) */}
        <div className="server-tabs">
          <button
            className={`server-tab ${activeServer === 'youtube' ? 'active' : ''}`}
            onClick={() => { setActiveServer('youtube'); setIframeLoading(true); }}
          >
            <i className="fa-brands fa-youtube"></i> <span>YouTube Trailer HD</span>
          </button>
          <button
            className={`server-tab ${activeServer === 'uzmovi' ? 'active' : ''}`}
            onClick={() => { setActiveServer('uzmovi'); setIframeLoading(true); }}
          >
            <i className="fa-solid fa-server"></i> <span>UzMovi HD Server</span>
          </button>
        </div>

        {/* Player Frame Container */}
        <div className="video-container">
          {iframeLoading && (
            <div className="video-loader">
              <i className="fa-solid fa-spinner fa-spin"></i>
              <p>{t('videoLoading')}</p>
            </div>
          )}
          {streamUrl ? (
            <iframe
              key={streamUrl}
              src={streamUrl}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setIframeLoading(false)}
              sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
            ></iframe>
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              {t('noTrailerFound')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
