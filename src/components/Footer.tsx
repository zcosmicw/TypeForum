export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <p className="text-sm text-slate-400">
          <span className="font-semibold text-white">TypeForum</span> — looks,
          health, and self-improvement.
        </p>
        <p className="text-xs text-slate-500">
          Discuss. Share. Connect.
        </p>
      </div>
    </footer>
  );
}
