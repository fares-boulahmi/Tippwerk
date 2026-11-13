import { useMemo, useState } from "react";
import { Link } from "react-router";
import ActivityGraph from "../components/ActivityGraph.jsx";
import Icon from "../components/Icon.jsx";
import Navbar from "../components/NavBar.jsx";
import TypingTest from "../components/typing/TypingTest.jsx";
import { localISO } from "../utils/dates.js";

/* ───────── content ───────── */

const DEMO_TOKENS = [
  { target: "Tisch", hint: "table" },
  { target: "Straße", hint: "street" },
  { target: "können", hint: "to be able to" },
  { target: "Bewerbung", hint: "application" },
  { target: "Entwickler", hint: "developer" },
  { target: "Ausbildung", hint: "apprenticeship" },
];

const FEATURES = [
  {
    icon: "keyboard",
    title: "Typing that feels right",
    text: "Space jumps to the next word, backspace only steps back into a wrong word, Ctrl+Backspace deletes a word, Esc restarts. WPM counts only fully correct words.",
  },
  {
    icon: "translate",
    title: "German keyboards just work",
    text: "Umlauts, ß, dead keys and AltGr go through the input event, so ä ö ü ß are typed like any other letter.",
  },
  {
    icon: "playlist_add",
    title: "Words with hints",
    text: "Add one pair per line: “der Tisch | the table”. You type the word. The translation sits beside it as a hint, never part of the test.",
  },
  {
    icon: "link",
    title: "Collections of linked sets",
    text: "A collection is an ordered chain of sets, each with its own words and sentences. Add a set any time and it joins the end of the chain.",
  },
  {
    icon: "restore",
    title: "Resume exactly where you stopped",
    text: "Progress is saved the moment a session ends, per collection. Close the tab on the result screen and nothing is lost.",
  },
  {
    icon: "verified_user",
    title: "Sign in with Google",
    text: "The Google ID token is verified on the server, then you get a JWT. No passwords to create or forget.",
  },
];

const STEPS = [
  {
    title: "1. Create a collection",
    text: "Give it a title and a short description, for example “Alltag A2”.",
  },
  {
    title: "2. Add sets",
    text: "Paste words as “word | translation” and sentences one per line. The form counts your sessions live.",
  },
  {
    title: "3. Practise",
    text: "Hit Continue. Tippwerk serves the next chunk, saves your result, and moves the pointer for you.",
  },
];

const STACK = [
  "Express 5",
  "Mongoose",
  "React + Vite",
  "Tailwind CSS v4",
  "daisyUI v5",
  "Google sign-in",
  "JWT",
];

/** Decorative, seeded sample data so the real ActivityGraph has something to show. */
function sampleActivity() {
  let seed = 7;
  const rows = [];
  for (let i = 0; i < 365; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    const r = seed / 233280;
    const recent = 1 - i / 365; // i = 0 is today
    if (r < 0.45 - 0.25 * recent) continue;
    const d = new Date();
    d.setDate(d.getDate() - i);
    const sessions = 1 + Math.floor(r * 7 * (0.4 + recent));
    rows.push({ date: localISO(d), sessions, words: sessions * 15 });
  }
  return rows;
}

/* ───────── pieces ───────── */

function Section({ id, alt, children }) {
  return (
    <section
      id={id}
      className={`scroll-mt-16 py-16 lg:py-24 ${alt ? "bg-base-200" : ""}`}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-10">{children}</div>
    </section>
  );
}

/** Live demo = the app's real TypingTest, so the landing page shows the real engine. */
function TypingDemo() {
  const [round, setRound] = useState(0);
  const [result, setResult] = useState(null);

  const again = () => {
    setResult(null);
    setRound((r) => r + 1);
  };

  return (
    <div className="relative bg-white rounded-xl shadow-md p-6 sm:p-8 max-w-3xl">
      <TypingTest
        key={round}
        tokens={DEMO_TOKENS}
        onFinish={setResult}
        autoFocus={false}
        captureKeys={false}
      />

      {result && (
        <div className="absolute inset-0 rounded-xl bg-white/95 flex flex-col items-center justify-center gap-3 text-center p-6">
          <div className="text-xs uppercase tracking-widest text-base-content/60 font-semibold">
            wpm
          </div>
          <div className="font-headline text-8xl leading-none text-primary">
            {result.wpm}
          </div>
          <div className="text-base-content/70">
            {result.accuracy}% accuracy
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-3">
            <button className="btn btn-primary btn-sm" onClick={again}>
              <Icon name="restart_alt" /> Go again
            </button>
            <Link to="/login" className="btn btn-sm">
              Practise your own words
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function Pointer() {
  const box = "bg-white rounded-lg shadow-sm px-5 py-4";
  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mt-6">
        <div className={box}>
          <div className="font-headline text-2xl">15 words</div>
          <div className="text-xs text-base-content/60">per session</div>
        </div>
        <Icon name="arrow_forward" className="text-primary" />
        <div className={box}>
          <div className="font-headline text-2xl">3 sentences</div>
          <div className="text-xs text-base-content/60">per session</div>
        </div>
        <Icon name="arrow_forward" className="text-primary" />
        <div className={box}>
          <div className="font-headline text-2xl">Next set</div>
          <div className="text-xs text-base-content/60">
            words again, from 0
          </div>
        </div>
      </div>
      <p className="text-base-content/70 mt-5 max-w-xl">
        Empty lists are skipped. A set with no words goes straight to sentences.
        Finish the last set, add a new one later, and you continue right after
        it.
      </p>
      <div className="flex flex-wrap items-center gap-2 mt-6 font-mono text-sm">
        <span className="px-3 py-1.5 rounded-md bg-base-300">Set 1</span>
        <Icon name="sync_alt" className="text-primary" />
        <span className="px-3 py-1.5 rounded-md bg-base-300">Set 2</span>
        <Icon name="sync_alt" className="text-primary" />
        <span className="px-3 py-1.5 rounded-md bg-primary text-primary-content">
          Set 3 · you are here
        </span>
        <Icon name="sync_alt" className="text-primary" />
        <span className="px-3 py-1.5 rounded-md bg-base-300">Set 4</span>
      </div>
    </>
  );
}

/* ───────── page ───────── */

export default function LandingPage() {
  const activity = useMemo(sampleActivity, []);
  // const { user } = useAuth();

  return (
    <div id="top" className="scroll-smooth">
      <Navbar />

      {/* hero */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 pt-14 lg:pt-24 pb-16 space-y-12">
        <div>
          <h1 className="font-headline text-5xl sm:text-6xl lg:text-8xl leading-[1.05] tracking-tight">
            Your own words, typed until they stick.
            <span className="block italic text-secondary">
              Monkeytype for your vocabulary.
            </span>
          </h1>
          <p className="text-xl font-light text-base-content/70 max-w-xl mt-6 mb-8">
            Write your own word lists and sentences, then practise them in a
            fast, clean typing test. Tippwerk remembers where you stopped, set
            by set.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/practice" className="btn btn-primary">
              Start typing
            </Link>
            <a href="#how" className="btn btn-ghost border-base-300">
              See how it works
            </a>
          </div>
        </div>

        <div>
          <TypingDemo />
          <p className="text-xs text-base-content/60 mt-3">
            Live demo: click the words and type. The orange text is only the
            translation.
          </p>
        </div>
      </section>

      {/* features */}
      <Section id="features" alt>
        <h2 className="font-headline text-4xl lg:text-5xl tracking-tight mb-3">
          Built for people who learn from their own material.
        </h2>
        <p className="text-base-content/70 max-w-xl font-light">
          Generic word lists are not your lists. Bring exactly what you need to
          learn and make typing it a habit.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
          {FEATURES.map((f) => (
            <article
              key={f.title}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="w-10 h-10 rounded-full bg-base-200 text-primary flex items-center justify-center mb-4">
                <Icon name={f.icon} />
              </div>
              <h3 className="font-headline text-2xl mb-1.5">{f.title}</h3>
              <p className="text-sm text-base-content/70">{f.text}</p>
            </article>
          ))}
        </div>
      </Section>

      {/* how it works */}
      <Section id="how">
        <h2 className="font-headline text-4xl lg:text-5xl tracking-tight mb-10">
          Three steps, then you just keep typing.
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          {STEPS.map((s) => (
            <article key={s.title} className="bg-base-200 rounded-xl p-6">
              <h3 className="font-headline text-2xl mb-1.5">{s.title}</h3>
              <p className="text-sm text-base-content/70">{s.text}</p>
            </article>
          ))}
        </div>
        <h3 className="font-headline text-3xl mt-14">How the pointer moves</h3>
        <Pointer />
      </Section>

      {/* progress */}
      <Section id="progress" alt>
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-headline text-4xl lg:text-5xl tracking-tight mb-3">
              Show up, see it fill in.
            </h2>
            <p className="text-base-content/70 font-light max-w-md">
              Every finished session adds to a daily contribution graph covering
              the last year. Streaks and totals sit above your collections on
              the dashboard.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <ActivityGraph activity={activity} />
            <p className="text-[11px] text-base-content/50 mt-3">Sample data</p>
          </div>
        </div>
      </Section>

      {/* stack */}
      <Section>
        <h2 className="font-headline text-4xl lg:text-5xl tracking-tight mb-3">
          Small stack, solid parts.
        </h2>
        <p className="text-base-content/70 max-w-xl font-light">
          Creating a set is safe even when two admins add one at the same
          moment: the end of the chain moves in a single atomic update, so the
          links never break.
        </p>
        <div className="flex flex-wrap gap-2.5 mt-6">
          {STACK.map((s) => (
            <span
              key={s}
              className="badge badge-lg bg-white border-base-300 font-semibold"
            >
              {s}
            </span>
          ))}
        </div>
      </Section>

      {/* final call to action */}
      <section className="bg-base-200 py-20 lg:py-28 text-center px-6">
        <h2 className="font-headline text-4xl lg:text-5xl tracking-tight mb-4">
          Bring your words. Start typing.
        </h2>
        <p className="text-base-content/70 max-w-md mx-auto mb-8">
          Sign in with Google, create your first collection, and finish your
          first session in a couple of minutes.
        </p>
        <Link to="/practice" className="btn btn-primary">
          Start typing
        </Link>
      </section>

      <footer className="max-w-6xl mx-auto px-6 lg:px-10 py-8 text-sm text-base-content/60">
        Tippwerk § · Custom typing sets for language learners.
      </footer>
    </div>
  );
}
