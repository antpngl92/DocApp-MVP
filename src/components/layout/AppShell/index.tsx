import AppHeader from "../AppHeader";
import type { AppShellProps } from "./types";

const AppShell = ({ children, contextLabel, navigation }: AppShellProps) => {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AppHeader contextLabel={contextLabel} navigation={navigation} />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
};

export default AppShell;
