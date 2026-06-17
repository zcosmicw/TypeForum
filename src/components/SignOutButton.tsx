import { signOut } from "@/lib/actions/auth";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
      >
        Log out
      </button>
    </form>
  );
}
