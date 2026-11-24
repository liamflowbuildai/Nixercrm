import { DashboardView } from "@/components/dashboard/DashboardView";
import { parseRange } from "@/lib/analytics";
import { loadCrmData } from "@/lib/data";

export default async function DashboardPage(props: PageProps<"/">) {
  const searchParams = await props.searchParams;
  const { projects, months, adSpend, maintenancePayments } = await loadCrmData();
  return (
    <DashboardView
      projects={projects}
      months={months}
      adSpend={adSpend}
      payments={maintenancePayments}
      range={parseRange(searchParams.range)}
    />
  );
}
