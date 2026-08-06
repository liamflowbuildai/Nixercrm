import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { FinancialLine } from "@/lib/finance";

export function StatTile({
  label,
  total,
  lines,
}: {
  label: string;
  total: number;
  lines: FinancialLine[];
}) {
  return (
    <details className="group rounded-lg border border-border border-t-2 border-t-accent bg-surface-1 p-4">
      <summary className="relative cursor-pointer">
        <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-fg">
          {formatCurrency(total)}
        </p>
        <span className="absolute right-0 top-0 text-muted transition-transform group-open:rotate-180">
          ⌄
        </span>
      </summary>
      <div className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3 text-sm">
        {lines.length === 0 ? (
          <p className="text-muted">Nothing contributing right now.</p>
        ) : (
          lines.map((line) => (
            <Link
              key={line.project.id}
              href={`/projects/${line.project.id}`}
              className="flex items-center justify-between gap-2 text-fg hover:text-accent"
            >
              <span className="truncate">{line.project.name}</span>
              <span className="shrink-0 text-muted">
                {formatCurrency(line.amount)}
              </span>
            </Link>
          ))
        )}
      </div>
    </details>
  );
}
