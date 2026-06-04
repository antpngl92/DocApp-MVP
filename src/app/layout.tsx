import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";

import { AppToaster } from "@/components/feedback";

import "./globals.css";

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations("metadata");

  return {
    title: t("title"),
    description: t("description"),
  };
};

const RootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          {children}
          <AppToaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

export default RootLayout;
