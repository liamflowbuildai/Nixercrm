"use client";

import { ColumnChart } from "@/components/charts/ColumnChart";

const eur = (n: number) =>
  n >= 10000 ? `€${Math.round(n / 1000)}K` : `€${Math.round(n).toLocaleString("en-IE")}`;

const SERIES = [
  { key: "sales", label: "Sales System", color: "var(--series-sales)" },
  { key: "web", label: "Websites", color: "var(--series-web)" },
];

export function RevenueTrend({
  data,
}: {
  data: Array<{ key: string; label: string; web: number; sales: number }>;
}) {
  return (
    <ColumnChart
      ariaLabel="Revenue per month, websites and sales system"
      data={data.map((d) => ({ key: d.key, label: d.label, values: { web: d.web, sales: d.sales } }))}
      series={SERIES}
      format={eur}
    />
  );
}

export function DealsTrend({
  data,
}: {
  data: Array<{ key: string; label: string; web: number; sales: number }>;
}) {
  return (
    <ColumnChart
      ariaLabel="New deals added per month, websites and sales system"
      data={data.map((d) => ({ key: d.key, label: d.label, values: { web: d.web, sales: d.sales } }))}
      series={SERIES}
    />
  );
}

export function CallsTrend({
  data,
}: {
  data: Array<{ key: string; label: string; calls: number }>;
}) {
  return (
    <ColumnChart
      ariaLabel="Sales system calls held per month"
      data={data.map((d) => ({ key: d.key, label: d.label, values: { calls: d.calls } }))}
      series={[{ key: "calls", label: "Calls held", color: "var(--series-sales)" }]}
    />
  );
}
