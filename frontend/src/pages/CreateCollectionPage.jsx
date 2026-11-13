import { useState } from "react";
import { Link, useNavigate } from "react-router";
import api, { errMsg } from "../api/client.js";
import Field from "../components/Field.jsx";

export default function CreateCollectionPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { data } = await api.post("/collections", { title, description });
      navigate(`/collections/${data._id}`);
    } catch (err) {
      setError(errMsg(err));
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <span className="text-xs uppercase font-bold tracking-widest text-primary">
          Admin
        </span>
        <h1 className="font-headline text-4xl mt-1">New collection</h1>
        <p className="text-sm text-base-content/70 mt-1">
          A collection is an ordered chain of sets. You add the sets on the next
          page.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="bg-base-200 rounded-xl p-6 sm:p-8 space-y-5 shadow-sm"
      >
        <Field label="Title">
          <input
            className="input w-full"
            required
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Alltag A2"
          />
        </Field>
        <Field label="Description">
          <textarea
            className="textarea w-full"
            rows={3}
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short note about what is inside"
          />
        </Field>

        {error && (
          <div role="alert" className="alert alert-error alert-soft text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            className="btn btn-primary"
            disabled={saving || !title.trim()}
          >
            {saving && <span className="loading loading-spinner loading-sm" />}{" "}
            Create collection
          </button>
          <Link to="/" className="btn btn-ghost">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
