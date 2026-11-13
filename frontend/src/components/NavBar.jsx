import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { errMsg } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import Icon from "./Icon.jsx";

export default function Navbar() {
  const { user, logout, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-base-100/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(58,48,42,0.05)]">
      <div className="h-16 max-w-6xl mx-auto px-6 lg:px-10 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="font-headline font-semibold text-2xl group-hover:text-primary transition-colors">
            Tippwerk
          </span>
          <span className="font-headline italic text-primary text-xl">§</span>
          <span className="hidden md:inline badge badge-ghost badge-sm uppercase tracking-wider">
            Custom typing sets
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {user && (
            <div>
              {user.role === "admin" && (
                <Link to="/collections/new" className="btn btn-ghost btn-sm">
                  <Icon name="add_circle" className="text-primary" />
                  <span className="hidden sm:inline">New collection</span>
                </Link>
              )}
              <Link to="/landing" className="btn btn-ghost btn-sm">
                <Icon name="info" className="text-primary" />
                <span className="hidden sm:inline">About</span>
              </Link>
              <Link to="/practice" className="btn btn-ghost btn-sm">
                <Icon name="keyboard" className="text-primary" />
                <span className="hidden sm:inline">Practice Typing</span>
              </Link>
              <Link to="/" className="btn btn-ghost btn-sm">
                <Icon name="trending_up" className="text-primary" />
                <span className="hidden sm:inline">Progress</span>
              </Link>
            </div>
          )}
          {user ? (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="avatar cursor-pointer">
                <div className="w-8 rounded-full bg-primary text-primary-content flex items-center justify-center">
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt=""
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Icon name="person" />
                  )}
                </div>
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-white rounded-box shadow-lg w-60 p-2 mt-3 z-50"
              >
                <li className="px-3 py-2 pointer-events-none">
                  <span className="font-semibold leading-tight">
                    {user?.name}
                  </span>
                  <span className="text-xs text-base-content/60 break-all">
                    {user?.email}
                  </span>
                </li>
                <li>
                  <button onClick={logout}>
                    <Icon name="logout" /> Sign out
                  </button>
                </li>
              </ul>
            </div>
          ) : (
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
                <div
                  role="alert"
                  className="alert alert-error alert-soft text-sm"
                >
                  <Icon name="error" /> {error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
