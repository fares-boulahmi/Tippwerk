# Meet Tippwerk §

## What is it?

Tippwerk is a typing-practice app where **you** decide what gets typed. Instead of random text, you build collections of your own words and sentences, then practise them in a clean, fast typing test inspired by Monkeytype.

## Who is it for?

- **Language learners** who want vocabulary to stick through typing, not just reading. Each word can carry a translation hint.
- **Teachers and study groups** who want to share a ready-made path of word lists.
- **Anyone** who wants a typing test built around their own material, such as technical terms or phrases for an interview.

## The idea in one minute

1. **Collection.** A topic, for example “Alltag A2” or “Bewerbung”.
2. **Sets.** A collection is a chain of sets. Each set has words (`der Tisch | the table`) and sentences.
3. **Sessions.** Tippwerk serves **15 words** at a time, then **3 sentences** at a time, then moves to the next set.
4. **Progress.** It remembers where you stopped, so you press _Continue_ and keep going.
5. **Streaks.** Every session fills a day on a year-long contribution graph.

## What a session feels like

You see a line of words. The word you must type is in monospace. Next to it, in orange italics, is its translation. That hint is never part of what you type. Space moves to the next word, a wrong word is underlined, and the test ends when the last word is correct. You get your WPM and accuracy, your progress is already saved, and _Next session_ is one Enter away.

## Why it works for German

German letters are first-class: `ä ö ü ß`, dead keys and AltGr all work, and words with spaces like `der Tisch` are typed naturally. Repeating real words and full sentences from your own lists builds spelling and recall at the same time.

## Under the hood

Express 5 + Mongoose for the API, React + Vite with Tailwind v4 and daisyUI v5 for the interface, and Google sign-in for accounts. Sets form a linked chain, and adding one is an atomic operation, so the chain stays consistent even with several admins.

## Current status

A working proof of concept. Everyone who signs in can create collections and sets, and results are reported by the browser, so it is not designed for competitive leaderboards.

## Get started

See the [README](./README.md) for setup. In short: sign in with Google, create a collection, add a set, and press _Practice_.
