import type { ReactNode } from "react";

import type { NavigationItem } from "@/config/navigation";

type AppShellProps = Readonly<{
  brandName?: string;
  children: ReactNode;
  contextLabel?: string;
  navigation: readonly NavigationItem[];
  showCurrentUserName?: boolean;
  showCreateAccount?: boolean;
}>;

export type { AppShellProps };
