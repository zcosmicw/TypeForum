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
    <form action={formAction} className="card space-y-5 p-6">
      {mode === "signup" && (
        <>
          <div>
            <label htmlFor="username" className="label-field">
              Username
            </label>
            <input
              id="username"
              name="username"
              required
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_]+"
              className="input-field"
              placeholder="user_123"
            />
          </div>
          <div>
            <label htmlFor="displayName" className="label-field">
              Display name
            </label>
            <input
              id="displayName"
              name="displayName"
              className="input-field"
              placeholder="Your Name"
            />
          </div>
        </>
      )}

      <div>
        <label htmlFor="email" className="label-field">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="input-field"
          placeholder="you@email.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="label-field">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="input-field"
          placeholder="At least 8 characters"
        />
      </div>

      {state.error && (
        <p className="rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm font-medium text-coral">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-lg border border-sage/30 bg-sage/10 px-3 py-2 text-sm font-medium text-sage">{state.success}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full py-2.5"
      >
        {pending ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
      </button>

      <p className="text-center text-sm text-text-muted">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/signup" className="font-medium text-accent hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-accent hover:underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
