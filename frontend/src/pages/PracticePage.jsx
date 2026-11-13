import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import api, { errMsg } from "../api/client.js";
import Icon from "../components/Icon.jsx";
import Spinner from "../components/Spinner.jsx";
import ResultCard from "../components/typing/ResultCard.jsx";
import TypingTest from "../components/typing/TypingTest.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { localISO } from "../utils/dates.js";
import { toTokens } from "../utils/text.js";

export default function PracticePage() {
  const id = useParams().id || "6af6336bd2d9459b774ffabb";
  const [session, setSession] = useState(null); // what the server says I should type now
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // stats of the session I just finished
  const [next, setNext] = useState(null); // the following session (arrives after saving)
  const [saveError, setSaveError] = useState("");
  const payload = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    api
      .get(`/progress/${id}/session`)
      .then((r) => setSession(r.data))
      .catch((e) => setError(errMsg(e)));
  }, [id]);

  const tokens = useMemo(
    () => (session && !session.completed ? toTokens(session) : []),
    [session],
  );

  // Save progress right when the session is finished (not when "Next" is clicked),
  // so closing the tab on the result screen never loses it.
  const save = useCallback(async () => {
    setSaveError("");
    try {
      const { data } = await api.post(
        `/progress/${id}/complete`,
        payload.current,
      );
      setNext(data);
    } catch (e) {
      if (e.response?.status === 409 && e.response.data.session)
        setNext(e.response.data.session); // out of sync -> resync
      else setSaveError(errMsg(e));
    }
  }, [id]);

  const onFinish = useCallback(
    (stats) => {
      payload.current = {
        mode: session.mode,
        index: session.index,
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        chars: stats.chars.correct,
        wordCount: tokens.length,
        date: localISO(),
      };
      setResult(stats);
      setNext(null);
      save();
    },
    [session, tokens, save],
  );

  const goNext = useCallback(() => {
    setSession(next);
    setResult(null);
    setNext(null);
  }, [next]);

  if (error) {
    return (
      <div className="space-y-4">
        <div role="alert" className="alert alert-error">
          {error}
        </div>
        <Link to={`/collections/${id}`} className="btn btn-sm">
          Back to collection
        </Link>
      </div>
    );
  }
  if (!session) return <Spinner />;

  // ── whole collection finished ──
  if (session.completed) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-10 md:p-14 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center text-primary mb-6">
          <Icon name="task_alt" className="!text-3xl" />
        </div>
        <h1 className="font-headline text-5xl mb-4">Collection complete.</h1>
        <p className="text-base-content/70 mb-8">
          You went through every set of “{session.collection.title}”. If new
          sets get added later, continue here and you will pick up right after
          the last one.
        </p>
        <div className="flex gap-3">
          <Link to={`/collections/${id}`} className="btn">
            View sets
          </Link>
          <Link to="/" className="btn btn-primary">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { mode, index, size, total, set, collection } = session;
  const to = Math.min(index + size, total);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        {user.role === "admin" && (
          <div>
            <Link
              to={`/collections/${id}`}
              className="text-xs font-semibold text-primary hover:underline"
            >
              ← {collection.title}
            </Link>
            <h1 className="font-headline text-3xl mt-1">
              {set.title || `Set ${set.position}`}
            </h1>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="badge badge-ghost">
            Set {set.position}/{collection.setsCount}
          </span>
          <span
            className={`badge ${mode === "words" ? "badge-primary" : "badge-accent"}`}
          >
            {mode}
          </span>
          <span className="badge badge-ghost">
            {index + 1}–{to} of {total}
          </span>
        </div>
      </header>

      <progress
        className="progress progress-primary w-full h-1"
        value={index}
        max={total}
      />

      <section className="bg-white rounded-xl shadow-sm p-6 sm:p-10 min-h-[22rem]">
        {result ? (
          <ResultCard
            result={result}
            total={tokens.length}
            saving={!next && !saveError}
            saveError={saveError}
            onRetrySave={save}
            onNext={goNext}
          />
        ) : (
          // key = a fresh typing test for every new chunk
          <TypingTest
            key={`${set.id}-${mode}-${index}`}
            tokens={tokens}
            onFinish={onFinish}
          />
        )}
      </section>

      {!result && mode === "words" && (
        <p className="text-sm text-base-content/60">
          Type the word on the left. The{" "}
          <span className="text-primary italic">coloured text</span> next to it
          is just its translation.
        </p>
      )}
    </div>
  );
}
