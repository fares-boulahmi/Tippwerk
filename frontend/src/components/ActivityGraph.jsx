import { useMemo } from "react";
import { localISO } from "../utils/dates.js";

const WEEKS = 53;
const LEVELS = [
  "bg-base-300",
  "bg-primary/25",
  "bg-primary/50",
  "bg-primary/75",
  "bg-primary",
];
const level = (n) => (n === 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : n <= 6 ? 3 : 4);

function buildWeeks(activity) {
  const byDate = new Map(activity.map((a) => [a.date, a]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // first column starts on the Sunday 52 weeks before this week's Sunday
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() - (WEEKS - 1) * 7);

  let prevMonth = -1;
  return Array.from({ length: WEEKS }, (_, w) => {
    const days = Array.from({ length: 7 }, (_, d) => {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      if (date > today) return null;
      const iso = localISO(date);
      const a = byDate.get(iso);
      return { date: iso, sessions: a?.sessions ?? 0, words: a?.words ?? 0 };
    });
    const firstDay = new Date(start);
    firstDay.setDate(start.getDate() + w * 7);
    const month = firstDay.getMonth();
    const label =
      month !== prevMonth
        ? firstDay.toLocaleString("en", { month: "short" })
        : "";
    prevMonth = month;
    return { days, label };
  });
}

export default function ActivityGraph({ activity }) {
  const weeks = useMemo(() => buildWeeks(activity), [activity]);

  return (
    <div>
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex flex-col gap-1.5">
          <div className="flex gap-[3px] h-4 text-[10px] text-base-content/50">
            {weeks.map((w, i) => (
              <div key={i} className="w-3 shrink-0 relative">
                {w.label && (
                  <span className="absolute left-0 whitespace-nowrap">
                    {w.label}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-[3px]">
            {weeks.map((w, i) => (
              <div key={i} className="flex flex-col gap-[3px]">
                {w.days.map((d, j) =>
                  d ? (
                    <div
                      key={d.date}
                      title={`${d.sessions} session${d.sessions === 1 ? "" : "s"}, ${d.words} words — ${d.date}`}
                      className={`w-3 h-3 rounded-[3px] ${LEVELS[level(d.sessions)]}`}
                    />
                  ) : (
                    <div key={j} className="w-3 h-3" />
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 mt-2 text-[11px] text-base-content/60">
        <span>Less</span>
        {LEVELS.map((c) => (
          <span key={c} className={`w-3 h-3 rounded-[3px] ${c}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
