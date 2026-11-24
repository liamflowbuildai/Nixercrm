import { AccountsView } from "@/components/accounts/AccountsView";
import { loadCrmData } from "@/lib/data";

export default async function AccountsPage() {
  const { projects, months, adSpend, maintenancePayments } = await loadCrmData();
  return (
    <AccountsView
      projects={projects}
      months={months}
      adSpend={adSpend}
      maintenancePayments={maintenancePayments}
    />
  );
}
