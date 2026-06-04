import type { ReactNode } from "react";

import type { NavigationItem } from "@/config/navigation";

type AppShellProps = Readonly<{
  children: ReactNode;
  contextLabel?: string;
  navigation: readonly NavigationItem[];
}>;

export type { AppShellProps };
