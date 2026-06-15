import { ADMIN_NAVIGATION } from "@/config/navigation";
import { getTranslations } from "next-intl/server";

import AppShell from "../AppShell";
import type { AdminShellProps } from "./types";

const AdminShell = async ({ children }: AdminShellProps) => {
  const t = await getTranslations("navigation");

  return (
    <AppShell contextLabel={t("adminContext")} navigation={ADMIN_NAVIGATION} showCurrentUserName>
      {children}
    </AppShell>
  );
};

export default AdminShell;
