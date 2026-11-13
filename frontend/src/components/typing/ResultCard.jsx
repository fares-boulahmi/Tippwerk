import { useEffect } from "react";
import Icon from "../Icon.jsx";

function Tile({ label, value }) {
  return (
    <div className="bg-base-200 rounded-lg p-4">
      <div className="text-[11px] uppercase tracking-wider text-base-content/60 font-semibold">
        {label}
      </div>
      <div className="font-headline text-3xl mt-1">{value}</div>
    </div>
  );
}

export default function ResultCard({
  result,
  total,
  saving,
  saveError,
  onRetrySave,
  onNext,
}) {
  const { wpm, raw, accuracy, secs, correctWords, chars } = result;
  const ready = !saving && !saveError;

  // Enter -> next session
  useEffect(() => {
    const onKey = (e) => e.key === "Enter" && ready && onNext();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ready, onNext]);

  return (
    <div className="grid md:grid-cols-[auto_1fr] gap-10 items-center">
      <div className="space-y-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-base-content/60 font-semibold">
            wpm
          </div>
          <div className="font-headline text-8xl leading-none text-primary">
            {wpm}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-base-content/60 font-semibold">
            accuracy
          </div>
          <div className="font-headline text-6xl leading-none">{accuracy}%</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Tile label="raw" value={raw} />
        <Tile label="time" value={`${Math.round(secs)}s`} />
        <Tile label="words ok" value={`${correctWords}/${total}`} />
        <div
          className="bg-base-200 rounded-lg p-4"
          title="correct / incorrect / extra / missed"
        >
          <div className="text-[11px] uppercase tracking-wider text-base-content/60 font-semibold">
            characters
          </div>
          <div className="font-headline text-3xl mt-1">
            {chars.correct}/{chars.incorrect}/{chars.extra}/{chars.missed}
          </div>
        </div>
      </div>

      <div className="md:col-span-2 flex flex-wrap items-center gap-4">
        {saveError ? (
          <>
            <span className="text-error text-sm flex items-center gap-1.5">
              <Icon name="error" /> Could not save progress: {saveError}
            </span>
            <button className="btn btn-sm" onClick={onRetrySave}>
              Retry
            </button>
          </>
        ) : (
          <button
            className="btn btn-primary"
            disabled={saving}
            onClick={onNext}
          >
            {saving ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <Icon name="arrow_forward" />
            )}
            Next session
          </button>
        )}
        {ready && (
          <span className="text-xs text-base-content/50">
            <kbd className="kbd kbd-xs">enter</kbd> to continue
          </span>
        )}
      </div>
    </div>
  );
}
