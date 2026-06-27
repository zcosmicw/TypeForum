"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, signUp, type AuthState } from "@/lib/actions/auth";

const initialState: AuthState = {};

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const action = mode === "login" ? signIn : signUp;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="panel-border space-y-4 rounded-xl border border-white/10 surface-panel p-6">
      {mode === "signup" && (
        <>
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium text-slate-300">
              Username
            </label>
            <input
              id="username"
              name="username"
              required
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_]+"
              className="w-full rounded-lg border border-white/10 bg-slate-900 text-slate-100 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal"
              placeholder="user_123"
            />
          </div>
          <div>
            <label htmlFor="displayName" className="mb-1 block text-sm font-medium text-slate-300">
              Display name
            </label>
            <input
              id="displayName"
              name="displayName"
              className="w-full rounded-lg border border-white/10 bg-slate-900 text-slate-100 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal"
              placeholder="Mog In Progress"
            />
          </div>
        </>
      )}

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-lg border border-white/10 bg-slate-900 text-slate-100 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal"
          placeholder="you@email.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-300">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="w-full rounded-lg border border-white/10 bg-slate-900 text-slate-100 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal"
          placeholder="At least 8 characters"
        />
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-900/30 px-3 py-2 text-sm text-red-400">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-lg bg-green-900/30 px-3 py-2 text-sm text-green-400">{state.success}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-gradient-to-r from-teal-600 to-teal-400 py-2.5 text-sm font-semibold text-white hover:scale-[1.02] hover:shadow-[0_0_12px_rgba(45,212,191,0.3)] transition-all disabled:opacity-60"
      >
        {pending ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
      </button>

      <p className="text-center text-sm text-slate-500">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/signup" className="font-medium text-brand-teal hover:text-white">
              Join TypeForum
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-brand-teal hover:text-white">
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
