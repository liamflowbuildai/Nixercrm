import Link from "next/link";
import type { ReactNode } from "react";

// Flat stat figure: label, value, optional sub-line. Hairline dividers come
// from the parent row, not a box around each figure.
export function Figure({
  label,
  value,
  sub,
  href,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  href?: string;
}) {
  const body = (
    <>
      <span className="block text-[13px] text-muted">{label}</span>
      <span className="mt-2 block text-[28px] font-semibold leading-none tracking-[-0.04em] text-fg">
        {value}
      </span>
      {sub && <span className="mt-2 block text-xs text-dim">{sub}</span>}
    </>
  );
  const cls = "block px-0 py-5 sm:px-6 sm:first:pl-0";
  return href ? (
    <Link href={href} className={`${cls} transition-colors hover:bg-surface-1`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function FigureRow({ children, cols = 4 }: { children: ReactNode; cols?: number }) {
  const grid =
    cols === 5
      ? "sm:grid-cols-3 lg:grid-cols-5"
      : cols === 3
        ? "sm:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4";
  return (
    <div
      className={`grid grid-cols-2 gap-x-4 border-y border-border sm:gap-x-0 sm:divide-x sm:divide-border ${grid}`}
    >
      {children}
    </div>
  );
}

export function Section({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-lg font-semibold text-fg">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function Panel({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 border-t border-border pt-4">
      <h3 className="text-[15px] font-semibold text-fg">{title}</h3>
      {sub && <p className="mt-0.5 text-xs text-dim">{sub}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}
