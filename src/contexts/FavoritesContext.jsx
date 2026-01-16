import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  addFavorite,
  removeFavorite,
  subscribeToFavorites
} from '../services/favoriteService';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToFavorites(user.uid, (favs) => {
      setFavorites(favs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const toggleFavorite = useCallback(async (songId) => {
    if (!user) return;

    const isFav = favorites.some(f => f.songId === songId);

    try {
      if (isFav) {
        await removeFavorite(user.uid, songId);
      } else {
        await addFavorite(user.uid, songId);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }, [user, favorites]);

  const isFavorite = useCallback((songId) => {
    return favorites.some(f => f.songId === songId);
  }, [favorites]);

  const getFavoriteSongIds = useCallback(() => {
    return favorites.map(f => f.songId);
  }, [favorites]);

  const value = {
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
    getFavoriteSongIds
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
}
