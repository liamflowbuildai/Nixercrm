"use client";

import { useState } from "react";

export type Series = { key: string; label: string; color: string };
export type ColumnDatum = { key: string; label: string; values: Record<string, number> };

function niceMax(v: number): number {
  if (v <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}

// Stacked column chart. Thin 24px columns, 2px surface gap between segments,
// 4px rounded data-end, hover/focus tooltip, legend for 2+ series, table view.
export function ColumnChart({
  data,
  series,
  format = (n) => String(n),
  height = 180,
  ariaLabel,
}: {
  data: ColumnDatum[];
  series: Series[];
  format?: (n: number) => string;
  height?: number;
  ariaLabel: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const totals = data.map((d) => series.reduce((s, x) => s + (d.values[x.key] ?? 0), 0));
  const max = niceMax(Math.max(...totals, 0));
  const ticks = [0, max / 2, max];
  const lastNonZero = totals.length - 1;

  return (
    <figure className="m-0">
      {series.length > 1 && (
        <figcaption className="mb-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
          {series.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
        </figcaption>
      )}
      <div className="relative pl-12" style={{ height }} role="img" aria-label={ariaLabel}>
        {/* gridlines + y ticks */}
        {ticks.map((t) => (
          <div
            key={t}
            className="absolute right-0 left-12 border-t border-border"
            style={{ bottom: `${(t / max) * 100}%` }}
          >
            <span className="tnum absolute -top-2 -left-12 w-10 text-right font-mono text-[10.5px] text-dim">
              {format(t)}
            </span>
          </div>
        ))}
        <div className="relative flex h-full items-end justify-around">
          {data.map((d, i) => {
            const total = totals[i];
            const shown = series.filter((s) => (d.values[s.key] ?? 0) > 0);
            return (
              <button
                key={d.key}
                type="button"
                className="group relative flex h-full flex-1 flex-col items-center justify-end outline-none"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                aria-label={`${d.label}: ${series.map((s) => `${s.label} ${format(d.values[s.key] ?? 0)}`).join(", ")}`}
              >
                {i === lastNonZero && total > 0 && (
                  <span className="tnum mb-1 text-[11px] text-muted">{format(total)}</span>
                )}
                <span
                  className={`flex w-6 flex-col-reverse gap-[2px] transition-[filter] ${
                    active === i ? "brightness-125" : ""
                  }`}
                  style={{ height: `${(total / max) * 100}%` }}
                >
                  {shown.map((s, si) => (
                    <span
                      key={s.key}
                      className={si === shown.length - 1 ? "rounded-t-[4px]" : ""}
                      style={{
                        background: s.color,
                        flexGrow: d.values[s.key] ?? 0,
                        flexBasis: 0,
                        minHeight: 2,
                      }}
                    />
                  ))}
                </span>
                {active === i && (
                  <span className="pointer-events-none absolute bottom-full z-10 mb-2 min-w-36 rounded-lg border border-border-strong bg-surface-2 px-3 py-2 text-left shadow-xl">
                    <span className="tnum block text-sm font-semibold text-fg">{format(total)}</span>
                    <span className="block text-[11px] text-dim">{d.label}</span>
                    {series.length > 1 &&
                      series.map((s) => (
                        <span key={s.key} className="mt-1 flex items-center gap-2 text-xs text-muted">
                          <span className="h-0.5 w-3 rounded" style={{ background: s.color }} />
                          <span className="tnum text-fg">{format(d.values[s.key] ?? 0)}</span>
                          {s.label}
                        </span>
                      ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex justify-around pl-12">
        {data.map((d) => (
          <span key={d.key} className="flex-1 text-center font-mono text-[10.5px] uppercase text-dim">
            {d.label}
          </span>
        ))}
      </div>
      <details className="mt-3 text-xs text-dim">
        <summary className="cursor-pointer hover:text-muted">Show table</summary>
        <table className="tnum mt-2 w-full text-left text-muted">
          <thead>
            <tr className="border-b border-border">
              <th className="py-1 font-normal">Month</th>
              {series.map((s) => (
                <th key={s.key} className="py-1 text-right font-normal">{s.label}</th>
              ))}
              {series.length > 1 && <th className="py-1 text-right font-normal">Total</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={d.key} className="border-b border-border">
                <td className="py-1">{d.label}</td>
                {series.map((s) => (
                  <td key={s.key} className="py-1 text-right">{format(d.values[s.key] ?? 0)}</td>
                ))}
                {series.length > 1 && <td className="py-1 text-right text-fg">{format(totals[i])}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
