# FaithTunes Admin Guide

This guide covers how to add songs to FaithTunes — both by uploading files to Firebase Storage (backend) and by registering them through the Admin Panel (frontend).

---

## Who Can Access the Admin Panel?

Only accounts whose Firebase UID is in the admin allowlist can access the Admin page. Currently authorized accounts:

- `eus.java@gmail.com`
- `pssambila@gmail.com`

When logged in with either of these accounts, an **Admin** link will appear in the left sidebar.

---

## Part 1 — Upload Files to Firebase Storage (Backend)

Every song requires two files uploaded to Firebase Storage before it can be registered:

1. **Audio file** — the `.mp3` (or `.m4a`, `.wav`) of the song
2. **Cover image** — the album art (`.jpg` or `.png`)

### Step-by-step

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and open the **cslm-church** project.

2. In the left menu click **Storage** → **Files**.

3. **Upload the audio file:**
   - Navigate into the `songs/` folder (create it if it doesn't exist).
   - Click **Upload file** and select the `.mp3` file.
   - Once uploaded, note the exact path shown — it will look like:
     ```
     songs/amazing-grace.mp3
     ```

4. **Upload the cover image:**
   - Navigate into the `covers/` folder (create it if it doesn't exist).
   - Click **Upload file** and select the `.jpg` or `.png` image.
   - Note the exact path — it will look like:
     ```
     covers/amazing-grace.jpg
     ```

### Recommended folder structure

```
cslm-church.firebasestorage.app/
├── songs/
│   ├── amazing-grace.mp3
│   ├── how-great-thou-art.mp3
│   └── ...
└── covers/
    ├── amazing-grace.jpg
    ├── how-great-thou-art.jpg
    └── ...
```

### File naming tips

- Use lowercase letters and hyphens — no spaces or special characters.
  - Good: `how-great-thou-art.mp3`
  - Avoid: `How Great Thou Art (2024).mp3`
- Keep file names short and consistent with the song title.
- Recommended audio format: **MP3**, 128–320 kbps.
- Recommended cover size: **500 × 500 px** minimum, square ratio, JPEG or PNG.

---

## Part 2 — Register the Song in the Admin Panel (Frontend)

Once the files are uploaded to Storage, you register the song so it appears in the app.

### Step-by-step

1. Open the app at [https://cslm-church.web.app](https://cslm-church.web.app) and log in with an admin account.

2. Click **Admin** in the left sidebar (shield icon).

3. Click the **Add Song** button (top right).

4. Fill in the form:

   | Field | Required | Description | Example |
   |---|---|---|---|
   | **Title** | Yes | The song's display name | `Amazing Grace` |
   | **Artist** | Yes | Performer or composer name | `John Newton` |
   | **Storage Path** | Yes | Exact path of the audio file in Firebase Storage | `songs/amazing-grace.mp3` |
   | **Cover Path** | No | Exact path of the cover image in Firebase Storage | `covers/amazing-grace.jpg` |
   | **Tags** | No | Comma-separated labels for searching | `worship, hymn, grace` |
   | **Scripture Refs** | No | Comma-separated Bible references | `Ephesians 2:8, John 3:16` |
   | **Published** | — | Tick to make visible to all users. Untick to save as draft. | ✓ |

5. Click **Add Song**. The song will immediately appear in the library (if Published is checked).

### Important — Storage Path must match exactly

The Storage Path and Cover Path fields must be the **exact path** from Firebase Storage. Even a small typo will cause the audio or image to fail to load.

To copy the path accurately:
- Go to Firebase Storage → click the file → copy the path shown at the top (e.g. `songs/amazing-grace.mp3`).
- Do **not** include the storage bucket name (`cslm-church.firebasestorage.app`) — only the path after it.

---

## Part 3 — Editing and Deleting Songs

### Edit a song
1. Go to **Admin** in the sidebar.
2. Find the song in the list and click the **pencil icon** (✏️).
3. The form will pre-fill with the current values.
4. Make your changes and click **Update Song**.

### Delete a song
1. Find the song in the Admin list and click the **trash icon** (🗑️).
2. Confirm the deletion in the prompt.

> **Note:** Deleting a song from the Admin Panel only removes it from the Firestore database. The audio and cover files remain in Firebase Storage. To fully remove them, also delete the files manually from the Firebase Storage console.

### Draft vs Published
- **Published (checked):** Visible to all users in the library and home page.
- **Draft (unchecked):** Hidden from users. Only visible in the Admin Panel with a yellow "Draft" badge. Use this to prepare songs before making them public.

---

## Quick Reference Checklist

When adding a new song, follow this checklist:

- [ ] Audio file uploaded to `songs/` in Firebase Storage
- [ ] Cover image uploaded to `covers/` in Firebase Storage
- [ ] Song registered in Admin Panel with correct Storage Path
- [ ] Cover Path filled in (optional but recommended)
- [ ] Tags added for better search results
- [ ] Scripture references added if applicable
- [ ] Published checkbox ticked when ready to go live

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| Song shows but audio doesn't play | Wrong Storage Path | Check the exact path in Firebase Storage and update it in Admin Panel |
| Cover image missing | Wrong Cover Path or file not uploaded | Verify the file exists in Storage and the path is correct |
| Song not visible to users | Published is unchecked | Edit the song and tick the Published checkbox |
| Admin link not showing in sidebar | Not logged in with an admin account | Log in with `eus.java@gmail.com` or `pssambila@gmail.com` |
| "Access Denied" on Admin page | Using a non-admin account | Switch to an authorized admin account |
