import type { ReactNode } from "react";

type PublicShellProps = Readonly<{
  children: ReactNode;
  contextLabel?: string;
}>;

export type { PublicShellProps };
