"use client";

import { useActionState } from "react";
import { Logo } from "@/components/Logo";
import { login } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-8">
        <Logo />
      </div>
      <form
        action={action}
        className="w-full max-w-sm rounded-lg border border-border bg-surface-1 p-8"
      >
        <h1 className="mb-6 text-lg font-semibold text-fg">Sign in</h1>

        <label className="mb-1 block text-sm text-muted" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mb-4 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-fg outline-none focus:border-accent"
        />

        <label className="mb-1 block text-sm text-muted" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mb-6 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-fg outline-none focus:border-accent"
        />

        {state?.error && (
          <p className="mb-4 text-sm text-danger">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-accent px-4 py-2 font-medium text-accent-fg disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
