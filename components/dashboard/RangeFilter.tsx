import Link from "next/link";
import { RANGES, type RangeValue } from "@/lib/analytics";

export function RangeFilter({ value }: { value: RangeValue }) {
  return (
    <div className="flex gap-1 rounded-full border border-border bg-surface-1 p-1" role="group" aria-label="Date range">
      {RANGES.map((r) => (
        <Link
          key={r.value}
          href={r.value === "90d" ? "/" : `/?range=${r.value}`}
          scroll={false}
          aria-pressed={r.value === value}
          className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            r.value === value ? "bg-accent text-accent-fg" : "text-muted hover:text-fg"
          }`}
        >
          {r.label}
        </Link>
      ))}
    </div>
  );
}
