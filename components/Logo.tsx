import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="text-xl font-bold tracking-tight text-fg no-underline"
    >
      Flow<span className="text-accent">Build</span>
    </Link>
  );
}
