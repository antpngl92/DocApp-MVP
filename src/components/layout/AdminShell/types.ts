import type { ReactNode } from "react";

type AdminShellProps = Readonly<{
  children: ReactNode;
  membershipRole: string;
}>;

export type { AdminShellProps };
