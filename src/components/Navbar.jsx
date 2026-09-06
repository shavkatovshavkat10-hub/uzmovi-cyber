import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { fetchFromTMDB, getPlaceholderPoster, TMDB_CONFIG } from '../services/tmdb';

export default function Navbar({ currentCategory, setCategory, setSearchQuery, onLogoClick }) {
  const { lang, toggleLanguage, t, favorites, openDetailModal } = useApp();
  const [inputValue, setInputValue] = useState('');
  const [dropdownResults, setDropdownResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  
  const searchBoxRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Debounced live search
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (val.trim().length > 0) {
      debounceTimerRef.current = setTimeout(async () => {
        const data = await fetchFromTMDB('/search/movie', { query: val, page: 1 }, lang);
        if (data && data.results && data.results.length > 0) {
          setDropdownResults(data.results.slice(0, 6));
          setShowDropdown(true);
        } else {
          setDropdownResults([]);
          setShowDropdown(false);
        }
      }, 300);
    } else {
      setDropdownResults([]);
      setShowDropdown(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      setShowDropdown(false);
      setSearchQuery(inputValue.trim());
      setCategory('search');
    }
  };

  const clearSearch = () => {
    setInputValue('');
    setDropdownResults([]);
    setShowDropdown(false);
    if (currentCategory === 'search') {
      setSearchQuery('');
      setCategory('popular');
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleNavClick = (cat) => {
    setCategory(cat);
    setSearchQuery('');
    setInputValue('');
    setMobileDrawerOpen(false);
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <a href="#" className="logo" onClick={(e) => { e.preventDefault(); onLogoClick(); }}>
          <div className="logo-icon"><i class="fa-solid fa-clapperboard"></i></div>
          <div className="logo-text">
            <span className="logo-brand">UZMOVI</span>
            <span className="logo-cyber">CYBER</span>
          </div>
        </a>

        {/* Desktop Links */}
        <nav className="nav-links">
          <button
            className={`nav-link ${currentCategory === 'popular' ? 'active' : ''}`}
            onClick={() => handleNavClick('popular')}
          >
            <i className="fa-solid fa-fire"></i> <span>{t('popular')}</span>
          </button>
          <button
            className={`nav-link ${currentCategory === 'top_rated' ? 'active' : ''}`}
            onClick={() => handleNavClick('top_rated')}
          >
            <i className="fa-solid fa-star"></i> <span>{t('topRated')}</span>
          </button>
          <button
            className={`nav-link ${currentCategory === 'upcoming' ? 'active' : ''}`}
            onClick={() => handleNavClick('upcoming')}
          >
            <i className="fa-solid fa-film"></i> <span>{t('upcoming')}</span>
          </button>
          <button
            className={`nav-link ${currentCategory === 'favorites' ? 'active' : ''}`}
            onClick={() => handleNavClick('favorites')}
          >
            <i className="fa-solid fa-heart"></i> <span>{t('favorites')}</span>
            <span className="fav-count-badge">{favorites.length}</span>
          </button>
        </nav>

        {/* Search & Language Controls */}
        <div className="nav-right">
          {/* Live Search Box */}
          <div className="search-box" ref={searchBoxRef}>
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              className="search-input"
              placeholder={t('searchPlaceholder')}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
            {inputValue && (
              <button className="clear-search-btn" onClick={clearSearch}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}

            {/* Dropdown Suggestions */}
            {showDropdown && dropdownResults.length > 0 && (
              <div className="search-dropdown">
                {dropdownResults.map((movie) => {
                  const posterUrl = movie.poster_path
                    ? `${TMDB_CONFIG.POSTER_BASE}${movie.poster_path}`
                    : getPlaceholderPoster(movie.title);
                  const year = movie.release_date ? movie.release_date.split('-')[0] : '';
                  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '';

                  return (
                    <div
                      key={movie.id}
                      className="search-item"
                      onClick={() => {
                        setShowDropdown(false);
                        openDetailModal(movie.id);
                      }}
                    >
                      <img src={posterUrl} alt={movie.title} className="search-item-thumb" />
                      <div className="search-item-info">
                        <div className="search-item-title">{movie.title || movie.original_title}</div>
                        <div className="search-item-meta">
                          <span><i className="fa-solid fa-star" style={{ color: '#fbbf24' }}></i> {rating}</span>
                          {year && <span>• {year}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Language Toggle */}
          <button className="lang-toggle-btn" onClick={toggleLanguage} title="Tilni almashtirish">
            <i className="fa-solid fa-globe"></i>
            <span>{lang === 'uz-UZ' ? 'UZ' : 'RU'}</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileDrawerOpen((prev) => !prev)}
          >
            <i className={`fa-solid ${mobileDrawerOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="mobile-drawer">
          <button
            className={`mobile-link ${currentCategory === 'popular' ? 'active' : ''}`}
            onClick={() => handleNavClick('popular')}
          >
            <i className="fa-solid fa-fire"></i> <span>{t('popular')}</span>
          </button>
          <button
            className={`mobile-link ${currentCategory === 'top_rated' ? 'active' : ''}`}
            onClick={() => handleNavClick('top_rated')}
          >
            <i className="fa-solid fa-star"></i> <span>{t('topRated')}</span>
          </button>
          <button
            className={`mobile-link ${currentCategory === 'upcoming' ? 'active' : ''}`}
            onClick={() => handleNavClick('upcoming')}
          >
            <i className="fa-solid fa-film"></i> <span>{t('upcoming')}</span>
          </button>
          <button
            className={`mobile-link ${currentCategory === 'favorites' ? 'active' : ''}`}
            onClick={() => handleNavClick('favorites')}
          >
            <i className="fa-solid fa-heart"></i> <span>{t('favorites')} ({favorites.length})</span>
          </button>
        </div>
      )}
    </header>
  );
}
