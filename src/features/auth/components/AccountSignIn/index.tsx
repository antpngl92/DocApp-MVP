import { ShieldCheck } from "lucide-react";

import type { AccountSignInProps } from "./types";

const AccountSignIn = ({
  clerkSignIn,
  description,
  eyebrow,
  helpText,
  securityNote,
  title,
}: AccountSignInProps) => {
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="max-w-2xl">
          <p className="mb-3 text-xs font-bold uppercase text-[var(--secondary)]">{eyebrow}</p>
          <h1 className="text-3xl font-bold text-[var(--text-strong)] sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[var(--text-muted)]">
            {description}
          </p>

          <div className="mt-8 rounded-lg border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-soft)]">
            <div className="flex gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-[var(--primary)]">
                <ShieldCheck aria-hidden="true" size={20} />
              </span>
              <p className="text-sm leading-6 text-[var(--text)]">{securityNote}</p>
            </div>
          </div>
        </section>

        <section
          aria-label={title}
          className="flex min-h-[34rem] items-center justify-center rounded-lg border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-soft)] sm:p-6"
        >
          {clerkSignIn}
        </section>

        <p className="text-center text-xs leading-5 text-[var(--text-muted)] lg:col-start-2">
          {helpText}
        </p>
      </div>
    </main>
  );
};

export default AccountSignIn;
