import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import api, { errMsg } from "../api/client.js";
import Icon from "../components/Icon.jsx";
import Spinner from "../components/Spinner.jsx";

export default function CollectionPage() {
  const { id } = useParams();
  const [c, setC] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/collections/${id}`)
      .then((r) => setC(r.data))
      .catch((e) => setError(errMsg(e)));
  }, [id]);

  if (error)
    return (
      <div role="alert" className="alert alert-error">
        {error}
      </div>
    );
  if (!c) return <Spinner />;

  const hasSets = c.sets.length > 0;

  return (
    <div className="space-y-10">
      <Link
        to="/"
        className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
      >
        <Icon name="arrow_back" className="!text-base" /> All collections
      </Link>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <h1 className="font-headline text-4xl lg:text-5xl tracking-tight">
            {c.title}
          </h1>
          {c.description && (
            <p className="text-base-content/70 font-light">{c.description}</p>
          )}
        </div>
        <div className="flex gap-3 shrink-0">
          <Link to={`/collections/${id}/sets/new`} className="btn">
            <Icon name="add" /> Add set
          </Link>
          <Link
            to={`/practice/${id}`}
            className={`btn btn-primary ${hasSets ? "" : "btn-disabled"}`}
          >
            <Icon name="keyboard" /> {c.progress ? "Continue" : "Practice"}
          </Link>
        </div>
      </header>

      {!hasSets ? (
        <div className="bg-base-200 rounded-xl p-10 text-center space-y-4">
          <p className="text-base-content/70">
            This collection has no sets yet.
          </p>
          <Link
            to={`/collections/${id}/sets/new`}
            className="btn btn-primary btn-sm"
          >
            Create the first set
          </Link>
        </div>
      ) : (
        <ol className="space-y-3">
          {c.sets.map((s) => {
            const here =
              c.progress &&
              !c.progress.completed &&
              String(c.progress.setId) === String(s._id);
            return (
              <li
                key={s._id}
                className={`bg-white rounded-xl shadow-sm p-5 flex items-center gap-5 ${here ? "ring-2 ring-primary" : ""}`}
              >
                <div className="w-10 h-10 rounded-full bg-base-200 text-primary flex items-center justify-center font-headline text-xl shrink-0">
                  {s.position}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-headline text-xl truncate">
                    {s.title || `Set ${s.position}`}
                  </div>
                  <div className="text-xs text-base-content/60">
                    {s.wordsCount} words · {s.sentencesCount} sentences
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                  {s._id === c.firstSet && (
                    <span className="badge badge-ghost">first</span>
                  )}
                  {s._id === c.lastSet && (
                    <span className="badge badge-ghost">last</span>
                  )}
                  {here && (
                    <span className="badge badge-primary">
                      you are here · {c.progress.mode}
                    </span>
                  )}
                  {c.progress?.completed && (
                    <span className="badge badge-success badge-soft">done</span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
