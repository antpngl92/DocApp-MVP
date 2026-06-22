import { PUBLIC_NAVIGATION } from "@/config/navigation";

import AppShell from "../AppShell";
import type { PublicShellProps } from "./types";

const PublicShell = async ({
  brandName,
  children,
  contextLabel,
  showCreateAccount,
}: PublicShellProps) => {
  return (
    <AppShell
      brandName={brandName}
      contextLabel={contextLabel}
      navigation={PUBLIC_NAVIGATION}
      showCreateAccount={showCreateAccount}
    >
      {children}
    </AppShell>
  );
};

export default PublicShell;
