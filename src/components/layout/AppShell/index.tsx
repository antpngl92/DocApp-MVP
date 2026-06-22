import AppHeader from "../AppHeader";
import type { AppShellProps } from "./types";
import {
  CURRENT_AUTHENTICATED_USER_STATUS,
  getCurrentAuthenticatedUser,
} from "@/server/auth/current-user";
import { getLocalUserDisplayName } from "@/server/auth/utils";

const AppShell = async ({
  brandName,
  children,
  contextLabel,
  navigation,
  showCurrentUserName = false,
  showCreateAccount = true,
}: AppShellProps) => {
  const currentUser = showCurrentUserName ? await getCurrentAuthenticatedUser() : null;
  const currentUserName =
    currentUser?.status === CURRENT_AUTHENTICATED_USER_STATUS.authenticated
      ? getLocalUserDisplayName(currentUser.user)
      : null;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AppHeader
        brandName={brandName}
        contextLabel={contextLabel}
        currentUserName={currentUserName}
        navigation={navigation}
        showCreateAccount={showCreateAccount}
      />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
};

export default AppShell;
