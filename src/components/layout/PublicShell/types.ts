import type { ReactNode } from "react";

type PublicShellProps = Readonly<{
  brandName?: string;
  children: ReactNode;
  contextLabel?: string;
  showCreateAccount?: boolean;
}>;

export type { PublicShellProps };
