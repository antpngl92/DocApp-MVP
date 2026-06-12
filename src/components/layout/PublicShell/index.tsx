import { getPublicNavigationForCurrentUser } from "@/server/auth/navigation";

import AppShell from "../AppShell";
import type { PublicShellProps } from "./types";

const PublicShell = async ({ children, contextLabel }: PublicShellProps) => {
  const navigation = await getPublicNavigationForCurrentUser();

  return (
    <AppShell contextLabel={contextLabel} navigation={navigation}>
      {children}
    </AppShell>
  );
};

export default PublicShell;
