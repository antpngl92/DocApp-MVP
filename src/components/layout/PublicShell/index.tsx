import { PUBLIC_NAVIGATION } from "@/config/navigation";

import AppShell from "../AppShell";
import type { PublicShellProps } from "./types";

const PublicShell = ({ children, contextLabel }: PublicShellProps) => {
  return (
    <AppShell contextLabel={contextLabel} navigation={PUBLIC_NAVIGATION}>
      {children}
    </AppShell>
  );
};

export default PublicShell;
