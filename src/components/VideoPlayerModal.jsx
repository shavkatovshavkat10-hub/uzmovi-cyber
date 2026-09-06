import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function VideoPlayerModal() {
  const { t, activeVideoModal, closeVideoModal } = useApp();
  const [activeServer, setActiveServer] = useState('server1');
  const [iframeLoading, setIframeLoading] = useState(true);

  const { open, movie } = activeVideoModal;

  useEffect(() => {
    if (open) {
      setActiveServer('server1');
      setIframeLoading(true);
    }
  }, [open]);

  if (!open || !movie) return null;

  let streamUrl = '';
  if (activeServer === 'server1') {
    streamUrl = `https://vidsrc.cc/v2/embed/movie/${movie.id}`;
  } else if (activeServer === 'server2') {
    streamUrl = `https://autoembed.co/movie/tmdb/${movie.id}`;
  }

  return (
    <div className="modal-overlay" onClick={closeVideoModal}>
      <div className="glass-modal modal-video-content" onClick={(e) => e.stopPropagation()}>
        <div className="video-modal-header">
          <div className="video-title-wrap">
            <i className="fa-solid fa-circle-play video-header-icon"></i>
            <h3 className="video-modal-title">
              {movie.title || movie.original_title}
            </h3>
          </div>
          <button className="modal-close-btn" onClick={closeVideoModal}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Full Movie Server Tabs (No YouTube) */}
        <div className="server-tabs">
          <button
            className={`server-tab ${activeServer === 'server1' ? 'active' : ''}`}
            onClick={() => { setActiveServer('server1'); setIframeLoading(true); }}
          >
            <i className="fa-solid fa-server"></i> <span>UzMovi HD Server 1</span>
          </button>
          <button
            className={`server-tab ${activeServer === 'server2' ? 'active' : ''}`}
            onClick={() => { setActiveServer('server2'); setIframeLoading(true); }}
          >
            <i className="fa-solid fa-film"></i> <span>UzMovi HD Server 2</span>
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
          {streamUrl && (
            <iframe
              key={streamUrl}
              src={streamUrl}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setIframeLoading(false)}
            ></iframe>
          )}
        </div>
      </div>
    </div>
  );
}
