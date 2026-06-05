import { CalendarCheck } from "lucide-react";

import type { PatientRegistrationProps } from "./types";

const PatientRegistration = ({
  clerkSignUp,
  description,
  eyebrow,
  helpText,
  privacyNote,
  title,
}: PatientRegistrationProps) => {
  return (
    <div className="w-full">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 py-4 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="max-w-2xl">
          <p className="mb-3 text-xs font-bold uppercase text-[var(--secondary)]">{eyebrow}</p>
          <h1 className="text-3xl font-bold text-[var(--text-strong)] sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[var(--text-muted)]">
            {description}
          </p>

          <div className="mt-8 rounded-lg border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-soft)]">
            <div className="flex gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-[var(--primary)]">
                <CalendarCheck aria-hidden="true" size={20} />
              </span>
              <p className="text-sm leading-6 text-[var(--text)]">{privacyNote}</p>
            </div>
          </div>
        </section>

        <section
          aria-label={title}
          className="flex min-h-[34rem] items-center justify-center rounded-lg border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-soft)] sm:p-6"
        >
          {clerkSignUp}
        </section>

        <p className="text-center text-xs leading-5 text-[var(--text-muted)] lg:col-start-2">
          {helpText}
        </p>
      </div>
    </div>
  );
};

export default PatientRegistration;
