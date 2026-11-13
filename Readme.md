# Tippwerk §

A Monkeytype-style typing app for your **own** word and sentence sets. Write a collection, add sets of words (with translations) and sentences, then practise them in a fast typing test that remembers where you stopped.

**Stack:** Express 5 + Mongoose · React + Vite · Tailwind CSS v4 + daisyUI v5 · Google sign-in (ID token verified server-side, then a JWT)

Requires **Node 20+** and a running **MongoDB**.

## Features (currently available)

- **Collections and sets.** A collection has a title and description. It holds an ordered, doubly linked chain of sets (`firstSet`, `lastSet`, `previousSet`, `nextSet`).
- **Words with hints.** Words are stored as `[typed, translation]`. Only the first part is typed; the translation is shown inline as a hint.
- **Sentences.** Typed word by word, punctuation included.
- **Guided progress.** Per user, per collection: 15 words per session, then 3 sentences per session, then the next set. Empty lists are skipped.
- **Resume anywhere.** Progress is saved the moment a session ends. Stale or duplicate submits get a `409` and the client resyncs.
- **Monkeytype-style engine.** Space for next word, backspace only into a wrong word, `Ctrl+Backspace` deletes a word, `Esc` restarts, max 10 extra letters per word, WPM counts only fully correct words, accuracy per keystroke.
- **German-friendly input.** `ä ö ü ß`, dead keys and AltGr work. Words containing spaces (`der Tisch`) work too.
- **Dashboard.** Streaks, sessions, words typed, active days, and a 53-week contribution graph.
- **Google sign-in** with a 7-day JWT. Everyone is an admin for now (`User.role` defaults to `admin`).
- **Atomic set creation.** The `lastSet` swap is a single `findOneAndUpdate`, so concurrent creates cannot break the chain.

## Quick start

1. **Google OAuth client:** Google Cloud Console → _APIs & Services → Credentials → Create OAuth client ID → Web application_. Add `http://localhost:5173` under _Authorized JavaScript origins_. Use the same client ID in both `.env` files.
2. **Backend**
   ```bash
   cd backend
   cp .env.example .env   # MONGODB_URI, JWT_SECRET, GOOGLE_CLIENT_ID
   npm install
   npm run dev            # http://localhost:5000
   ```
3. **Frontend**
   ```bash
   cd frontend
   cp .env.example .env   # VITE_GOOGLE_CLIENT_ID
   npm install
   npm run dev            # http://localhost:5173
   ```
4. Sign in → _New collection_ → _Add set_ → _Practice_.

### Environment variables

| File            | Variable                | Purpose                                  |
| --------------- | ----------------------- | ---------------------------------------- |
| `backend/.env`  | `PORT`                  | API port (default 5000)                  |
|                 | `MONGODB_URI`           | MongoDB connection string                |
|                 | `JWT_SECRET`            | Secret for signing JWTs                  |
|                 | `GOOGLE_CLIENT_ID`      | OAuth client ID used to verify ID tokens |
|                 | `CLIENT_URL`            | Allowed CORS origin                      |
| `frontend/.env` | `VITE_API_URL`          | API base URL                             |
|                 | `VITE_GOOGLE_CLIENT_ID` | Same OAuth client ID                     |

## Adding content

In _Add set_, put one word per line as `word | translation` (`=`, `;`, tab or `-` also work as separators) and one sentence per line. The form shows how many sessions your input will produce.

## How progress works

```
words  (index += 15) ──► index ≥ words.length     ──► sentences, index = 0
sentences (index += 3) ──► index ≥ sentences.length ──► next set, words, index = 0
no next set ──► collection completed
```

Logic lives in `backend/src/utils/progressEngine.js` (`settle`).

## API

All routes except `POST /api/auth/google` need `Authorization: Bearer <jwt>`.

| Method | Route                                  | Purpose                                                                 |
| ------ | -------------------------------------- | ----------------------------------------------------------------------- |
| POST   | `/api/auth/google`                     | `{ credential }` → `{ token, user }`                                    |
| GET    | `/api/auth/me`                         | Current user                                                            |
| GET    | `/api/collections`                     | All collections + my progress                                           |
| POST   | `/api/collections`                     | `{ title, description }` (admin)                                        |
| GET    | `/api/collections/:id`                 | Collection, ordered sets (counts), my progress                          |
| POST   | `/api/collections/:id/sets`            | `{ title?, words, sentences }` (admin)                                  |
| GET    | `/api/progress/:collectionId/session`  | Current session: `{ mode, index, items, set, ... }`                     |
| POST   | `/api/progress/:collectionId/complete` | `{ mode, index, wpm, accuracy, chars, wordCount, date }` → next session |
| GET    | `/api/progress/activity`               | Last ~year of daily activity                                            |

## Data model

| Model        | Key fields                                                                 |
| ------------ | -------------------------------------------------------------------------- |
| `User`       | `googleId`, `email`, `name`, `picture`, `role`                             |
| `Collection` | `title`, `description`, `firstSet`, `lastSet`, `setsCount`, `createdBy`    |
| `TypingSet`  | `collectionId`, `position`, `words`, `sentences`, `previousSet`, `nextSet` |
| `Progress`   | `user`, `collectionId`, `currentSet`, `mode`, `index`, `completed`         |
| `Activity`   | `user`, `date`, `sessions`, `words`, `chars`, `bestWpm`                    |

Mongoose reserves the path name `collection`, so the foreign key is `collectionId`.

## Project structure

```text
backend/src/   config · controllers · middleware · models · routes · utils · app.js · server.js
frontend/src/  api · components (+ typing/) · context · pages · utils · App.jsx · main.jsx
```

## Known limitations

- WPM and accuracy are reported by the browser, so they are not cheat-proof.
- Every user is an admin. Tighten `User.role` and keep `requireAdmin` on the create routes.
- Not yet tested against a live MongoDB and real Google sign-in in the original build environment. Check those two connections first.

## Design

Cream palette, EB Garamond headlines, Manrope body, JetBrains Mono for typing, orange primary, Material Symbols, taken from the _Smart German_ design file.
