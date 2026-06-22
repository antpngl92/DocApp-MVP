"use client";

import { SignInButton, SignOutButton, SignUpButton, useAuth } from "@clerk/nextjs";

import { ROUTES } from "@/config/routes";

import type { AuthControlsProps } from "./types";

const secondaryButtonClassName =
  "inline-flex min-h-10 items-center rounded-md px-2 text-sm font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--text-strong)] sm:px-3";

const primaryButtonClassName =
  "inline-flex min-h-10 items-center rounded-md bg-[var(--primary)] px-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)]";

const signOutClassName =
  "inline-flex min-h-10 items-center rounded-md border border-[var(--border)] bg-white px-3 text-sm font-semibold text-[var(--text-strong)] transition hover:bg-[var(--surface-muted)]";

const AuthControls = ({
  createAccountLabel,
  showCreateAccount = true,
  signInLabel,
  signOutLabel,
}: AuthControlsProps) => {
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
          <SignInButton forceRedirectUrl={ROUTES.postAuth} mode="redirect">
            <button className={secondaryButtonClassName} type="button">
              {signInLabel}
            </button>
          </SignInButton>
          {showCreateAccount ? (
            <SignUpButton forceRedirectUrl={ROUTES.postAuth} mode="redirect">
              <button className={primaryButtonClassName} type="button">
                {createAccountLabel}
              </button>
            </SignUpButton>
          ) : null}
        </>
      )}
    </div>
  );
};

export default AuthControls;
