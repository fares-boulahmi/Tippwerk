import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import api, { errMsg } from "../api/client.js";
import Field from "../components/Field.jsx";
import Spinner from "../components/Spinner.jsx";
import { parseSentences, parseWords } from "../utils/text.js";

export default function CreateSetPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [title, setTitle] = useState("");
  const [wordsText, setWordsText] = useState("");
  const [sentencesText, setSentencesText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/collections/${id}`)
      .then((r) => setCollection(r.data))
      .catch((e) => setError(errMsg(e)));
  }, [id]);

  const { pairs, badLines } = useMemo(() => parseWords(wordsText), [wordsText]);
  const sentences = useMemo(
    () => parseSentences(sentencesText),
    [sentencesText],
  );
  const canSave =
    !saving &&
    badLines.length === 0 &&
    (pairs.length > 0 || sentences.length > 0);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post(`/collections/${id}/sets`, {
        title,
        words: pairs,
        sentences,
      });
      navigate(`/collections/${id}`);
    } catch (err) {
      setError(errMsg(err));
      setSaving(false);
    }
  };

  if (!collection)
    return error ? (
      <div role="alert" className="alert alert-error">
        {error}
      </div>
    ) : (
      <Spinner />
    );

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <Link
          to={`/collections/${id}`}
          className="text-xs font-semibold text-primary hover:underline"
        >
          ← {collection.title}
        </Link>
        <h1 className="font-headline text-4xl mt-2">
          New set #{collection.setsCount + 1}
        </h1>
        <p className="text-sm text-base-content/70 mt-1">
          {collection.setsCount === 0
            ? "This is the first set: it becomes both the first and the last set of the collection."
            : "It will be linked after the current last set and become the new last set."}
        </p>
      </div>

      <form
        onSubmit={submit}
        className="bg-base-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-sm"
      >
        <Field label="Title (optional)">
          <input
            className="input w-full"
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`Set ${collection.setsCount + 1}`}
          />
        </Field>

        <Field
          label="Words"
          hint="One per line: word | translation. The word is typed, the translation is only shown as a hint. (= ; or tab also work as separator)"
        >
          <textarea
            className="textarea w-full font-mono text-sm"
            rows={9}
            value={wordsText}
            onChange={(e) => setWordsText(e.target.value)}
            placeholder={
              "der Tisch | the table\ndie Straße | the street\nkönnen | to be able to"
            }
          />
          <div className="text-xs flex flex-wrap gap-x-4">
            <span className="font-semibold">{pairs.length} words</span>
            <span className="text-base-content/60">
              = {Math.ceil(pairs.length / 15)} sessions of 15
            </span>
            {badLines.length > 0 && (
              <span className="text-error">
                Missing separator or translation on line {badLines.join(", ")}
              </span>
            )}
          </div>
        </Field>

        <Field
          label="Sentences"
          hint="One sentence per line. They are typed exactly as written, punctuation included."
        >
          <textarea
            className="textarea w-full font-mono text-sm"
            rows={7}
            value={sentencesText}
            onChange={(e) => setSentencesText(e.target.value)}
            placeholder={
              "Ich möchte einen Tisch reservieren.\nWie komme ich zum Bahnhof?"
            }
          />
          <div className="text-xs flex flex-wrap gap-x-4">
            <span className="font-semibold">{sentences.length} sentences</span>
            <span className="text-base-content/60">
              = {Math.ceil(sentences.length / 3)} sessions of 3
            </span>
          </div>
        </Field>

        {error && (
          <div role="alert" className="alert alert-error alert-soft text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button className="btn btn-primary" disabled={!canSave}>
            {saving && <span className="loading loading-spinner loading-sm" />}{" "}
            Create set
          </button>
          <Link to={`/collections/${id}`} className="btn btn-ghost">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
