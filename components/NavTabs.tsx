"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Dashboard" },
  { href: "/pipeline/sales", label: "Sales Pipeline" },
  { href: "/pipeline/website", label: "Website Pipeline" },
  { href: "/accounts", label: "Accounts" },
];

export function NavTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex gap-1 overflow-x-auto">
      {TABS.map((tab) => {
        const active =
          tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`relative whitespace-nowrap px-3 py-3 text-sm transition-colors ${
              active ? "text-fg" : "text-muted hover:text-fg"
            }`}
          >
            {tab.label}
            {active && (
              <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-accent" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
