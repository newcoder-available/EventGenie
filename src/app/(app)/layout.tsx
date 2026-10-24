import { AppShell } from "@/components/layout/AppShell";
import { RequireSession } from "@/components/layout/RequireSession";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireSession>
      <AppShell>{children}</AppShell>
    </RequireSession>
  );
}
