import { GoogleLogin } from "@react-oauth/google";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { errMsg } from "../api/client.js";
import Icon from "../components/Icon.jsx";
import { useAuth } from "../context/AuthContext.jsx";

// Static preview of the typing look
function Preview() {
  const word = (letters, hint, extra = "") => (
    <span className="inline-flex items-baseline gap-2 mr-5">
      <span className="font-mono text-2xl">{letters}</span>
      <span className="tl-hint">{hint}</span>
      {extra}
    </span>
  );
  return (
    <div className="bg-base-200 rounded-xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between pb-5 mb-5">
        <span className="text-[11px] uppercase tracking-wider text-base-content/60 font-semibold">
          Preview
        </span>
        <span className="font-mono text-xs px-2.5 py-1 bg-base-300 rounded">
          words · 15
        </span>
      </div>
      <div className="bg-white rounded-lg p-6 leading-[3rem]">
        {word(
          <>
            <span className="tl-correct">Haus</span>
          </>,
          "house",
        )}
        {word(
          <>
            <span className="tl-correct">Au</span>
            <span className="tl-wrong">t</span>
            <span className="tl-untyped">o</span>
          </>,
          "car",
        )}
        {word(<span className="tl-untyped">Tisch</span>, "table")}
        {word(<span className="tl-untyped">Fenster</span>, "window")}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { user, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);
  if (user) return <Navigate to="/" replace />;

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-16 lg:py-24 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center min-h-screen">
      <div className="lg:col-span-7">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="text-xs tracking-widest uppercase font-semibold text-secondary">
            Typing practice for your own material
          </span>
        </div>
        <h1 className="font-headline text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-5">
          Tippwerk <span className="italic text-primary">§</span>
        </h1>
        <p className="font-headline italic text-2xl sm:text-3xl text-secondary mb-8">
          Build collections of words and sentences. Type them like you would on
          Monkeytype.
        </p>
        <p className="text-lg text-base-content/70 font-light max-w-xl mb-10">
          Your progress is tracked set by set — words first, then sentences —
          and your daily practice shows up in a contribution graph.
        </p>

        <div className="flex flex-col gap-3 items-start">
          <GoogleLogin
            shape="pill"
            size="large"
            onSuccess={async (res) => {
              try {
                await loginWithGoogle(res.credential);
                navigate("/", { replace: true });
              } catch (e) {
                setError(errMsg(e));
              }
            }}
            onError={() => setError("Google sign-in failed")}
          />
          {error && (
            <div role="alert" className="alert alert-error alert-soft text-sm">
              <Icon name="error" /> {error}
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-5">
        <Preview />
      </div>
    </div>
  );
}
