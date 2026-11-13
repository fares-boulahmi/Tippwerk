import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import api, { errMsg } from "../api/client.js";
import ActivityGraph from "../components/ActivityGraph.jsx";
import CollectionCard from "../components/CollectionCard.jsx";
import Icon from "../components/Icon.jsx";
import Spinner from "../components/Spinner.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { activityStats } from "../utils/stats.js";

function Stat({ icon, label, value, unit }) {
  return (
    <div className="bg-base-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
          {label}
        </span>
        <Icon name={icon} className="text-primary" />
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-headline text-5xl tracking-tight">{value}</span>
        {unit && (
          <span className="font-headline italic text-lg text-base-content/60">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const [collections, setCollections] = useState(null);
  const [activity, setActivity] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/collections"), api.get("/progress/activity")])
      .then(([c, a]) => {
        setCollections(c.data);
        setActivity(a.data.activity);
      })
      .catch((e) => setError(errMsg(e)));
  }, []);

  const stats = useMemo(() => activityStats(activity), [activity]);

  if (error)
    return (
      <div role="alert" className="alert alert-error">
        {error}
      </div>
    );
  if (!collections) return <Spinner />;

  return (
    <div className="space-y-12">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs uppercase tracking-widest font-semibold text-primary">
              Dashboard
            </span>
          </div>
          <h1 className="font-headline text-4xl lg:text-5xl tracking-tight">
            Willkommen, {user?.name?.split(" ")[0] || "Lerner"}.
          </h1>
          <p className="text-base-content/70 font-light max-w-xl">
            Pick up where you left off, or build something new.
          </p>
        </div>
        {user.role === "admin" && (
          <Link to="/collections/new" className="btn btn-primary">
            <Icon name="add_circle" /> New collection
          </Link>
        )}
      </section>
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <Stat
          icon="local_fire_department"
          label="Streak"
          value={stats.current}
          unit="days"
        />
        <Stat icon="check_circle" label="Sessions" value={stats.sessions} />
        <Stat icon="keyboard" label="Words typed" value={stats.words} />
        <Stat
          icon="calendar_month"
          label="Active days"
          value={stats.activeDays}
          unit={`best streak ${stats.longest}`}
        />
      </section>
      <section className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
        <h2 className="font-headline text-2xl mb-5">
          Practice, last 12 months
        </h2>
        <ActivityGraph activity={activity} />
      </section>
      {user.role === "admin" && (
        <section className="space-y-5">
          <h2 className="font-headline text-3xl">Collections</h2>
          {collections.length === 0 ? (
            <div className="bg-base-200 rounded-xl p-10 text-center space-y-4">
              <p className="text-base-content/70">
                No collections yet. Create the first one and add a set of words
                and sentences.
              </p>
              <Link to="/collections/new" className="btn btn-primary btn-sm">
                Create collection
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {collections.map((c) => (
                <CollectionCard key={c._id} collection={c} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
