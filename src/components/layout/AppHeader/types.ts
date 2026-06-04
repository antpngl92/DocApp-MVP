import type { NavigationItem } from "@/config/navigation";

type AppHeaderProps = Readonly<{
  contextLabel?: string;
  navigation: readonly NavigationItem[];
}>;

export type { AppHeaderProps };
