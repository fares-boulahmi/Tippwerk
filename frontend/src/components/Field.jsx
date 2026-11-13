export default function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-base-content/70">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-base-content/60">{hint}</p>}
    </div>
  );
}
