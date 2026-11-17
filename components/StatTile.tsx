import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { FinancialBreakdown } from "@/lib/finance";

export function StatTile({
  label,
  breakdown,
}: {
  label: string;
  breakdown: FinancialBreakdown;
}) {
  const { total, websiteTotal, salesTotal, lines } = breakdown;

  return (
    <details className="group rounded-lg border border-border border-t-2 border-t-accent bg-surface-1 p-4">
      <summary className="relative cursor-pointer">
        <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-fg">
          {formatCurrency(total)}
        </p>
        {salesTotal > 0 && (
          <p className="mt-1 text-xs text-muted">
            Web {formatCurrency(websiteTotal)} · Sales {formatCurrency(salesTotal)}
          </p>
        )}
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
              <span className="truncate">
                {line.project.name}
                {line.project.client_type === "sales_system" && (
                  <span className="ml-1 text-xs text-muted">sales</span>
                )}
              </span>
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
