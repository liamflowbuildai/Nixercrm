import Link from "next/link";
import { Logo } from "@/components/Logo";
import { signOut } from "./actions";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <Logo />
        <div className="flex items-center gap-4">
          <Link
            href="/projects/new"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg"
          >
            + New Project
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-muted hover:text-fg"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 px-6 py-6">{children}</main>
    </div>
  );
}
