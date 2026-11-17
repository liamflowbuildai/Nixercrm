import { computeFinancialSummary } from "@/lib/finance";
import type { Project, SalesMonth } from "@/lib/types";
import { StatTile } from "./StatTile";

export function FinancialSummary({
  projects,
  months,
}: {
  projects: Project[];
  months: SalesMonth[];
}) {
  const {
    pipelineValue,
    outstanding,
    revenueThisMonth,
    revenueThisYear,
    yearlyMaintenance,
  } = computeFinancialSummary(projects, months);

  const now = new Date();
  const monthLabel = now.toLocaleString("en-IE", { month: "long" });

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <StatTile label="Pipeline value" breakdown={pipelineValue} />
      <StatTile label="Outstanding" breakdown={outstanding} />
      <StatTile label={`Revenue in ${monthLabel}`} breakdown={revenueThisMonth} />
      <StatTile label={`Revenue ${now.getFullYear()}`} breakdown={revenueThisYear} />
      <StatTile label="Maintenance (yearly)" breakdown={yearlyMaintenance} />
    </div>
  );
}
