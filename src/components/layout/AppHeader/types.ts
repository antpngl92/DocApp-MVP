import type { NavigationItem } from "@/config/navigation";

type AppHeaderProps = Readonly<{
  brandName?: string;
  contextLabel?: string;
  currentUserName?: string | null;
  navigation: readonly NavigationItem[];
  showCreateAccount?: boolean;
}>;

export type { AppHeaderProps };
