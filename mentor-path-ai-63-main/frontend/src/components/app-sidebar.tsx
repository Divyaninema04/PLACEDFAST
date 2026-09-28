import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  LogOut,
  Rocket,
  User,
  Sparkles,
  GraduationCap,
  Compass,
  Route as RouteIcon,
  TrendingUp,
  ClipboardList,
  Target,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authService } from "@/services/auth.service";

interface NavSection {
  title: string;
  items: {
    title: string;
    url: string;
    icon: typeof LayoutDashboard;
  }[];
}

const navSections: NavSection[] = [
  {
    title: "Navigation",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Market Insights", url: "/labour-market", icon: TrendingUp },
      { title: "Skill Gap", url: "/curriculum-alignment", icon: Target },
      { title: "Career Roadmap", url: "/career", icon: RouteIcon },
      { title: "Opportunities", url: "/opportunities", icon: Compass },
      { title: "Applications", url: "/applications", icon: ClipboardList },
    ],
  },
  {
    title: "Student",
    items: [
      { title: "Resume", url: "/resume", icon: FileText },
      { title: "AI Mentor", url: "/mentor", icon: Sparkles },
      { title: "Academics", url: "/academics", icon: GraduationCap },
      { title: "Profile", url: "/profile", icon: User },
    ],
  },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-2">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Rocket className="h-4 w-4" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-display text-base font-bold tracking-tight leading-tight">
              PlacementPilot
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">
              Career & Skill Intelligence
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-1 py-1">
        {navSections.map((section) => (
          <SidebarGroup key={section.title} className="py-1">
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const active = pathname === item.url || (item.url !== "/dashboard" && item.url !== "/career" && pathname.startsWith(item.url + "/"));
                  return (
                    <SidebarMenuItem key={item.title + item.url}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.title} className="h-8 text-xs">
                        <Link to={item.url}>
                          <item.icon className="h-3.5 w-3.5" />
                          <span className="truncate">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                authService.logout();
                window.location.href = "/auth";
              }}
              tooltip="Sign out"
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}