import { localISO } from "./dates.js";

/** Streaks + totals from the activity rows returned by GET /progress/activity */
export function activityStats(activity) {
  const active = activity.filter((a) => a.sessions > 0);
  const days = new Set(active.map((a) => a.date));

  // Current streak: today counts if active, otherwise start counting from yesterday
  const cursor = new Date();
  if (!days.has(localISO(cursor))) cursor.setDate(cursor.getDate() - 1);
  let current = 0;
  while (days.has(localISO(cursor))) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Longest streak
  let longest = 0;
  let run = 0;
  let prev = null;
  for (const date of [...days].sort()) {
    const d = new Date(`${date}T00:00:00`);
    run = prev && Math.round((d - prev) / 864e5) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = d;
  }

  return {
    current,
    longest,
    activeDays: days.size,
    sessions: active.reduce((n, a) => n + a.sessions, 0),
    words: active.reduce((n, a) => n + a.words, 0),
  };
}
