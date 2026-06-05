"use client";

import { SignOutButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";

import { ROUTES } from "@/config/routes";

import type { AuthControlsProps } from "./types";

const linkClassName =
  "inline-flex min-h-10 items-center rounded-md px-2 text-sm font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--text-strong)] sm:px-3";

const primaryLinkClassName =
  "inline-flex min-h-10 items-center rounded-md bg-[var(--primary)] px-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)]";

const signOutClassName =
  "inline-flex min-h-10 items-center rounded-md border border-[var(--border)] bg-white px-3 text-sm font-semibold text-[var(--text-strong)] transition hover:bg-[var(--surface-muted)]";

const AuthControls = ({ createAccountLabel, signInLabel, signOutLabel }: AuthControlsProps) => {
  const { isSignedIn } = useAuth();

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {isSignedIn ? (
        <SignOutButton redirectUrl={ROUTES.home}>
          <button className={signOutClassName} type="button">
            {signOutLabel}
          </button>
        </SignOutButton>
      ) : (
        <>
          <Link className={linkClassName} href={ROUTES.signIn}>
            {signInLabel}
          </Link>
          <Link className={primaryLinkClassName} href={ROUTES.signUp}>
            {createAccountLabel}
          </Link>
        </>
      )}
    </div>
  );
};

export default AuthControls;
