import type { DashboardNavigationIcon } from "@/config/navigation";

type DashboardSidebarItem = Readonly<{
  href: string;
  iconKey: DashboardNavigationIcon;
  label: string;
}>;

type DashboardSidebarContent = Readonly<{
  collapseLabel: string;
  expandLabel: string;
  navigationLabel: string;
  signOutLabel: string;
}>;

type DashboardSidebarProps = Readonly<{
  content: DashboardSidebarContent;
  currentUserName: string | null;
  items: readonly DashboardSidebarItem[];
}>;

export type { DashboardSidebarContent, DashboardSidebarItem, DashboardSidebarProps };
