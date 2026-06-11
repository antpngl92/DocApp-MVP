"use client";

import { MailPlus } from "lucide-react";
import { useId, useState } from "react";

import { DEFAULT_STAFF_INVITATION_ROLE, STAFF_INVITATION_EMAIL_PATTERN } from "./constants";
import type { StaffInvitationFormProps, StaffInvitationFormSubmitPayload } from "./types";

const StaffInvitationForm = ({ content, onInvite, roleOptions }: StaffInvitationFormProps) => {
  const emailId = useId();
  const roleId = useId();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(roleOptions[0]?.value ?? DEFAULT_STAFF_INVITATION_ROLE);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!STAFF_INVITATION_EMAIL_PATTERN.test(normalizedEmail)) {
      setIsSubmitted(false);
      setEmailError(content.emailError);
      return;
    }

    const payload: StaffInvitationFormSubmitPayload = {
      email: normalizedEmail,
      role,
    };

    setEmailError(null);
    setServerError(null);
    setIsSubmitting(true);

    try {
      await onInvite?.(payload);
      setIsSubmitted(true);
    } catch {
      setIsSubmitted(false);
      setServerError(content.serverError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-[var(--primary)]">
          <MailPlus aria-hidden="true" size={20} />
        </span>
        <div>
          <h2 className="font-bold text-[var(--text-strong)]">{content.submitLabel}</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
            {content.connectedLater}
          </p>
        </div>
      </div>

      <form
        className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px_auto]"
        noValidate
        onSubmit={handleSubmit}
      >
        <div>
          <label className="text-sm font-semibold text-[var(--text-strong)]" htmlFor={emailId}>
            {content.emailLabel}
          </label>
          <input
            aria-describedby={emailError ? `${emailId}-error` : undefined}
            aria-invalid={emailError ? "true" : "false"}
            className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm text-[var(--text-strong)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-blue-100"
            id={emailId}
            onChange={(event) => {
              setEmail(event.target.value);
              setEmailError(null);
              setServerError(null);
              setIsSubmitted(false);
            }}
            placeholder={content.emailPlaceholder}
            type="email"
            value={email}
          />
          {emailError ? (
            <p className="mt-2 text-sm font-medium text-red-700" id={`${emailId}-error`}>
              {emailError}
            </p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-semibold text-[var(--text-strong)]" htmlFor={roleId}>
            {content.roleLabel}
          </label>
          <select
            className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm font-medium text-[var(--text-strong)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-blue-100"
            id={roleId}
            onChange={(event) => {
              setRole(event.target.value as typeof role);
              setServerError(null);
              setIsSubmitted(false);
            }}
            value={role}
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-[var(--primary)] px-4 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:w-auto"
            disabled={isSubmitting}
            type="submit"
          >
            {content.submitLabel}
          </button>
        </div>
      </form>

      {serverError ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {serverError}
        </p>
      ) : null}

      {isSubmitted ? (
        <p className="mt-4 rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-[var(--primary)]">
          {content.successMessage}
        </p>
      ) : null}
    </section>
  );
};

export default StaffInvitationForm;
