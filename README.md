# FaithTunes

A mini Spotify clone for faith-based music, built with React (Vite) and Firebase.

## Features

- User authentication (Email/Password + Google Sign-in)
- Song library with search/filter by title, artist, tags, and scripture references
- Audio player with play/pause, progress bar, volume control, and next/previous
- Favorites system to save your favorite songs
- Responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS v4
- **Backend**: Firebase (Auth, Firestore, Storage, Hosting)
- **Icons**: Lucide React

## Setup Instructions

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project called "FaithTunes"
3. Enable the following services:
   - **Authentication**: Enable Email/Password and Google sign-in providers
   - **Firestore Database**: Create database in production mode
   - **Storage**: Set up Cloud Storage

### 2. Get Firebase Configuration

1. In Firebase Console, go to Project Settings > General
2. Scroll down to "Your apps" and click the web icon (</>)
3. Register your app and copy the configuration values

### 3. Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase configuration in `.env`:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

### 4. Update Admin UIDs

Edit `firestore.rules` and `storage.rules` to add your admin user UIDs:

```javascript
function isAdmin() {
  return request.auth != null &&
         request.auth.uid in ['YOUR_ADMIN_UID_HERE'];
}
```

To find your UID:
1. Sign up/login to the app
2. Check Firebase Console > Authentication > Users
3. Copy the User UID

### 5. Deploy Security Rules

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (select existing project)
firebase init

# Deploy rules
firebase deploy --only firestore:rules,storage
```

### 6. Run Development Server

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

### 7. Add Sample Songs

In Firebase Console > Firestore, create a `songs` collection with documents like:

```json
{
  "title": "Amazing Grace",
  "artist": "Chris Tomlin",
  "tags": ["worship", "hymn", "classic"],
  "scriptureRefs": ["Ephesians 2:8", "John 9:25"],
  "storagePath": "songs/amazing-grace.mp3",
  "coverPath": "covers/amazing-grace.jpg",
  "published": true,
  "createdAt": "<timestamp>",
  "updatedAt": "<timestamp>"
}
```

Upload corresponding audio files to Storage under `songs/` and cover images under `covers/`.

## Deployment

```bash
# Build for production
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy everything
firebase deploy
```

## Project Structure

```
faithtunes/
├── src/
│   ├── components/
│   │   ├── auth/          # Login, Signup, GoogleSignIn
│   │   ├── library/       # SongCard, SongList, SearchBar
│   │   ├── player/        # AudioPlayer, ProgressBar
│   │   ├── favorites/     # FavoriteButton
│   │   └── ui/            # Navbar, Loader, ProtectedRoute
│   ├── contexts/          # Auth, Player, Favorites contexts
│   ├── hooks/             # useSongs custom hook
│   ├── services/          # Firebase service modules
│   ├── pages/             # Login, Signup, Library, Favorites
│   ├── App.jsx
│   └── main.jsx
├── firestore.rules        # Firestore security rules
├── storage.rules          # Storage security rules
├── firebase.json          # Firebase configuration
└── .env.example           # Environment template
```

## Security

- Firestore rules ensure users can only read published songs
- Users can only access their own favorites
- Only admin UIDs can create/update/delete songs
- Storage rules protect audio files from unauthorized access
