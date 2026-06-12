import type { NavigationItem } from "@/config/navigation";

type AppHeaderProps = Readonly<{
  contextLabel?: string;
  currentUserName?: string | null;
  navigation: readonly NavigationItem[];
}>;

export type { AppHeaderProps };
