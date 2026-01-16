import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

export function getFavoritesRef(userId) {
  return collection(db, 'users', userId, 'favorites');
}

export async function addFavorite(userId, songId) {
  const favoritesRef = getFavoritesRef(userId);

  // Check if already favorited
  const existing = await getFavoriteDoc(userId, songId);
  if (existing) return existing;

  return addDoc(favoritesRef, {
    songId,
    createdAt: serverTimestamp()
  });
}

export async function removeFavorite(userId, songId) {
  const favoriteDoc = await getFavoriteDoc(userId, songId);
  if (favoriteDoc) {
    await deleteDoc(doc(db, 'users', userId, 'favorites', favoriteDoc.id));
  }
}

export async function getFavoriteDoc(userId, songId) {
  const favoritesRef = getFavoritesRef(userId);
  const q = query(favoritesRef, where('songId', '==', songId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

export async function getUserFavorites(userId) {
  const favoritesRef = getFavoritesRef(userId);
  const snapshot = await getDocs(favoritesRef);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export function subscribeToFavorites(userId, callback) {
  const favoritesRef = getFavoritesRef(userId);
  return onSnapshot(favoritesRef, (snapshot) => {
    const favorites = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(favorites);
  });
}

export async function isFavorite(userId, songId) {
  const doc = await getFavoriteDoc(userId, songId);
  return !!doc;
}
