import { getDashboardNavigationForRole } from "@/config/navigation";
import {
  CURRENT_AUTHENTICATED_USER_STATUS,
  getCurrentAuthenticatedUser,
} from "@/server/auth/current-user";
import { getLocalUserDisplayName } from "@/server/auth/utils";
import { getTranslations } from "next-intl/server";

import DashboardSidebar from "../DashboardSidebar";
import type { AdminShellProps } from "./types";

const AdminShell = async ({ children, membershipRole }: AdminShellProps) => {
  const navigationTranslations = await getTranslations("dashboardShell.navigation");
  const shellTranslations = await getTranslations("dashboardShell");
  const currentUser = await getCurrentAuthenticatedUser();
  const currentUserName =
    currentUser.status === CURRENT_AUTHENTICATED_USER_STATUS.authenticated
      ? getLocalUserDisplayName(currentUser.user)
      : null;
  const navigationItems = getDashboardNavigationForRole(membershipRole).map((item) => ({
    href: item.href,
    iconKey: item.iconKey,
    label: navigationTranslations(item.labelKey),
  }));

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--text)]">
      <DashboardSidebar
        content={{
          collapseLabel: shellTranslations("collapseSidebar"),
          expandLabel: shellTranslations("expandSidebar"),
          navigationLabel: shellTranslations("navigationLabel"),
          signOutLabel: shellTranslations("signOut"),
        }}
        currentUserName={currentUserName}
        items={navigationItems}
      />
      <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
};

export default AdminShell;
