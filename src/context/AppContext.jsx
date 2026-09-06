import React, { createContext, useContext, useState, useEffect } from 'react';

const I18N = {
  'uz-UZ': {
    popular: "Ommabop",
    topRated: "Eng saralari",
    upcoming: "Tez kunda",
    favorites: "Sevilganlar",
    popularMovies: "Ommabop Kinolar",
    topRatedMovies: "Eng Yuqori Reytingli Kinolar",
    upcomingMovies: "Tez Kunda Chiqadigan Kinolar",
    favoriteMovies: "Sevilgan Kinolar",
    searchResults: "Qidiruv natijalari",
    watchTrailer: "Tomosha qilish",
    watchMovie: "Kinoni tomosha qilish",
    details: "Batafsil",
    sortBy: "Saralash:",
    sortPopularity: "Ommabopligi bo'yicha",
    sortRating: "Reytingi bo'yicha",
    sortDate: "Chiqish sanasi bo'yicha",
    allGenres: "Barcha Janrlar",
    loadMore: "Yana ko'proq yuklash",
    noMoviesFound: "Hech qanday kino topilmadi",
    noMoviesDesc: "Boshqa so'z bilan qidirib ko'ring yoki janr filtrini o'zgartiring.",
    resetFilters: "Filtrlarni tozalash",
    actors: "Bosh rollarda",
    similarMovies: "O'xshash kinolar",
    addToFav: "Saqlab qo'yish",
    removeFromFav: "Saqlangandan o'chirish",
    searchPlaceholder: "Kino, serial qidirish...",
    moviesCount: "ta kino",
    addedToFavToast: "Kino sevilganlarga qo'shildi!",
    removedFavToast: "Kino sevilganlardan o'chirildi",
    langChangedToast: "Til O'zbekchaga almashtirildi",
    videoLoading: "Video pleyer yuklanmoqda...",
    noTrailerFound: "Kechirasiz, ushbu kino uchun video topilmadi.",
    runtimeUnit: "s",
    minUnit: "d",
    topBadge: "TOP KINO",
    footerText: "UzMovi Cyber - Barcha sevimli kinolaringiz bir joyda. TMDB API va React 18 asosida ishlaydi."
  },
  'ru-RU': {
    popular: "Популярные",
    topRated: "Топ рейтинга",
    upcoming: "Скоро в кино",
    favorites: "Избранное",
    popularMovies: "Популярные фильмы",
    topRatedMovies: "Фильмы с высоким рейтингом",
    upcomingMovies: "Скоро на экранах",
    favoriteMovies: "Избранные фильмы",
    searchResults: "Результаты поиска",
    watchTrailer: "Смотреть фильм",
    watchMovie: "Смотреть фильм",
    details: "Подробнее",
    sortBy: "Сортировка:",
    sortPopularity: "По популярности",
    sortRating: "По рейтингу",
    sortDate: "По дате выхода",
    allGenres: "Все жанры",
    loadMore: "Загрузить еще",
    noMoviesFound: "Фильмы не найдены",
    noMoviesDesc: "Попробуйте изменить поисковый запрос или фильтры.",
    resetFilters: "Сбросить фильтры",
    actors: "В главных ролях",
    similarMovies: "Похожие фильмы",
    addToFav: "В избранное",
    removeFromFav: "Из избранного",
    searchPlaceholder: "Поиск фильмов, сериалов...",
    moviesCount: "фильмов",
    addedToFavToast: "Фильм добавлен в избранное!",
    removedFavToast: "Фильм удален из избранного",
    langChangedToast: "Язык изменен на русский",
    videoLoading: "Загрузка видеоплеера...",
    noTrailerFound: "К сожалению, видео для этого фильма не найдено.",
    runtimeUnit: "ч",
    minUnit: "мин",
    topBadge: "ТОП ФИЛЬМ",
    footerText: "UzMovi Cyber - Все ваши любимые фильмы в одном месте. Работает на TMDB API и React 18."
  }
};

const AppContext = createContext();

export function AppProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('uzmovi_react_lang') || 'uz-UZ');
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('uzmovi_react_favs')) || [];
    } catch {
      return [];
    }
  });

  const [toasts, setToasts] = useState([]);
  const [activeVideoModal, setActiveVideoModal] = useState({ open: false, movie: null });
  const [activeDetailModal, setActiveDetailModal] = useState({ open: false, movieId: null });

  useEffect(() => {
    localStorage.setItem('uzmovi_react_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('uzmovi_react_favs', JSON.stringify(favorites));
  }, [favorites]);

  const t = (key) => (I18N[lang] && I18N[lang][key]) || I18N['uz-UZ'][key] || key;

  const showToast = (message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const toggleLanguage = () => {
    const nextLang = lang === 'uz-UZ' ? 'ru-RU' : 'uz-UZ';
    setLang(nextLang);
    showToast(nextLang === 'uz-UZ' ? 'Til O\'zbekchaga almashtirildi' : 'Язык изменен на русский');
  };

  const isFavorite = (movieId) => favorites.some((m) => m.id === movieId);

  const toggleFavorite = (movie) => {
    if (!movie || !movie.id) return;
    if (isFavorite(movie.id)) {
      setFavorites((prev) => prev.filter((m) => m.id !== movie.id));
      showToast(t('removedFavToast'));
    } else {
      setFavorites((prev) => [
        ...prev,
        {
          id: movie.id,
          title: movie.title || movie.original_title,
          poster_path: movie.poster_path,
          vote_average: movie.vote_average,
          release_date: movie.release_date
        }
      ]);
      showToast(t('addedToFavToast'));
    }
  };

  const openDetailModal = (movieId) => {
    setActiveDetailModal({ open: true, movieId });
  };

  const closeDetailModal = () => {
    setActiveDetailModal({ open: false, movieId: null });
  };

  const openVideoModal = (movie) => {
    setActiveVideoModal({ open: true, movie });
  };

  const closeVideoModal = () => {
    setActiveVideoModal({ open: false, movie: null });
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        toggleLanguage,
        t,
        favorites,
        isFavorite,
        toggleFavorite,
        toasts,
        showToast,
        activeDetailModal,
        openDetailModal,
        closeDetailModal,
        activeVideoModal,
        openVideoModal,
        closeVideoModal
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
