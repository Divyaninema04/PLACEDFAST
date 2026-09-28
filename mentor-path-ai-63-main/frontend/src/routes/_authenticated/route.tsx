import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { authService } from "@/services/auth.service";
import { apiRequest } from "@/services/api";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    try {
      const profile = await apiRequest<any>("/api/profile");
      if (profile && typeof profile === "object") {
        localStorage.setItem("placementpilot_user", JSON.stringify(profile));
        return { user: profile };
      }
    } catch {
      // Fall through to local stored user
    }
    const localUser = authService.getLocalUser();
    return { user: localUser };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <header className="flex h-13 items-center justify-between gap-3 border-b border-border bg-card/50 px-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <span className="font-semibold text-foreground">PlacementPilot</span>
                <span className="text-muted-foreground/50">/</span>
                <span>Workforce & Career Platform</span>
              </div>
            </div>
          </header>
          <main className="flex-1 p-5 sm:p-6 overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}