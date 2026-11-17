import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { NavTabs } from "@/components/NavTabs";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 pt-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-4">
            <Link
              href="/projects/new"
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-lt"
            >
              + New Client
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
        </div>
        <div className="mx-auto max-w-[1400px] px-1 sm:px-3">
          <NavTabs />
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
