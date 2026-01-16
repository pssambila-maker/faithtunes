import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy
} from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

const songsRef = collection(db, 'songs');

export async function getPublishedSongs() {
  const q = query(
    songsRef,
    where('published', '==', true),
    orderBy('title')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function getSongById(songId) {
  const docRef = doc(db, 'songs', songId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    throw new Error('Song not found');
  }

  return { id: snapshot.id, ...snapshot.data() };
}

export async function getAudioUrl(storagePath) {
  const audioRef = ref(storage, storagePath);
  return getDownloadURL(audioRef);
}

export async function getCoverUrl(coverPath) {
  if (!coverPath) return null;
  try {
    const coverRef = ref(storage, coverPath);
    return await getDownloadURL(coverRef);
  } catch (error) {
    console.error('Error getting cover URL:', error);
    return null;
  }
}

export function searchSongs(songs, searchTerm) {
  const term = searchTerm.toLowerCase().trim();

  if (!term) return songs;

  return songs.filter(song => {
    const titleMatch = song.title?.toLowerCase().includes(term);
    const artistMatch = song.artist?.toLowerCase().includes(term);
    const tagMatch = song.tags?.some(tag => tag.toLowerCase().includes(term));
    const scriptureMatch = song.scriptureRefs?.some(ref =>
      ref.toLowerCase().includes(term)
    );

    return titleMatch || artistMatch || tagMatch || scriptureMatch;
  });
}
