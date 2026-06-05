import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";

import { AppToaster } from "@/components/feedback";
import { parsePublicEnv } from "@/lib/env";

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
  const publicEnv = parsePublicEnv();

  return (
    <html lang={locale}>
      <body>
        <ClerkProvider
          signInUrl={publicEnv.NEXT_PUBLIC_CLERK_SIGN_IN_URL}
          signUpUrl={publicEnv.NEXT_PUBLIC_CLERK_SIGN_UP_URL}
          signInFallbackRedirectUrl={publicEnv.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL}
          signUpFallbackRedirectUrl={publicEnv.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL}
        >
          <NextIntlClientProvider>
            {children}
            <AppToaster />
          </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
};

export default RootLayout;
