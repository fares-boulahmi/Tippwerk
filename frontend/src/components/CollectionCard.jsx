import { Link } from "react-router";

export default function CollectionCard({ collection: c }) {
  const p = c.progress;
  const status = !c.setsCount
    ? "No sets yet"
    : !p
      ? "Not started"
      : p.completed
        ? "Completed"
        : `Set ${p.setPosition} · ${p.mode}`;
  const done = p
    ? p.completed
      ? c.setsCount
      : Math.max((p.setPosition || 1) - 1, 0)
    : 0;

  return (
    <article className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-4">
      <div className="flex-1">
        <h3 className="font-headline text-2xl leading-tight">{c.title}</h3>
        {c.description && (
          <p className="text-sm text-base-content/70 mt-1 line-clamp-2">
            {c.description}
          </p>
        )}
      </div>

      <div>
        <div className="flex justify-between text-xs text-base-content/60 mb-1.5">
          <span>{status}</span>
          <span>
            {c.setsCount} {c.setsCount === 1 ? "set" : "sets"}
          </span>
        </div>
        <progress
          className="progress progress-primary w-full h-1.5"
          value={done}
          max={Math.max(c.setsCount, 1)}
        />
      </div>

      <div className="flex gap-2">
        <Link
          to={`/practice/${c._id}`}
          className={`btn btn-primary btn-sm flex-1 ${c.setsCount ? "" : "btn-disabled"}`}
        >
          {p ? "Continue" : "Start"}
        </Link>
        <Link to={`/collections/${c._id}`} className="btn btn-ghost btn-sm">
          Open
        </Link>
      </div>
    </article>
  );
}
