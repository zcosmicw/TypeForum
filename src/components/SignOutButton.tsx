"use client";

import { signOut } from "@/lib/actions/auth";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="hidden rounded-md px-2.5 py-1.5 text-xs font-medium text-text-muted transition-colors hover:text-coral hover:bg-bg-hover sm:block"
    >
      Sign out
    </button>
  );
}
