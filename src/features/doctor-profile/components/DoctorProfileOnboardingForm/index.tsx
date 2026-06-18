"use client";

import { UserRoundPlus } from "lucide-react";
import { useId, useState } from "react";

import type {
  DoctorProfileOnboardingFormProps,
  DoctorProfileOnboardingFormSubmitPayload,
} from "./types";

const DoctorProfileOnboardingForm = ({
  content,
  email,
  initialName,
  onSubmit,
}: DoctorProfileOnboardingFormProps) => {
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const specialtyId = useId();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedName = name.trim().replace(/\s+/g, " ");

    if (!normalizedName) {
      setIsSubmitted(false);
      setNameError(content.nameError);
      return;
    }

    const payload: DoctorProfileOnboardingFormSubmitPayload = {
      name: normalizedName,
      phone: phone.trim() || null,
      specialty: specialty.trim() || null,
    };

    setNameError(null);
    setServerError(null);
    setIsSubmitting(true);

    try {
      await onSubmit?.(payload);
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
          <UserRoundPlus aria-hidden="true" size={20} />
        </span>
        <div>
          <h2 className="font-bold text-[var(--text-strong)]">{content.submitLabel}</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
            {content.emailHelp}
          </p>
        </div>
      </div>

      <form className="mt-5 grid gap-4" noValidate onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-[var(--text-strong)]" htmlFor={nameId}>
              {content.nameLabel}
            </label>
            <input
              aria-describedby={nameError ? `${nameId}-error` : undefined}
              aria-invalid={nameError ? "true" : "false"}
              className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm text-[var(--text-strong)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-blue-100"
              id={nameId}
              onChange={(event) => {
                setName(event.target.value);
                setNameError(null);
                setServerError(null);
                setIsSubmitted(false);
              }}
              placeholder={content.namePlaceholder}
              type="text"
              value={name}
            />
            {nameError ? (
              <p className="mt-2 text-sm font-medium text-red-700" id={`${nameId}-error`}>
                {nameError}
              </p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-semibold text-[var(--text-strong)]" htmlFor={emailId}>
              {content.emailLabel}
            </label>
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] bg-slate-50 px-3 text-sm text-[var(--text-muted)]"
              id={emailId}
              readOnly
              type="email"
              value={email}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-[var(--text-strong)]" htmlFor={phoneId}>
              {content.phoneLabel}
            </label>
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm text-[var(--text-strong)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-blue-100"
              id={phoneId}
              onChange={(event) => {
                setPhone(event.target.value);
                setServerError(null);
                setIsSubmitted(false);
              }}
              placeholder={content.phonePlaceholder}
              type="tel"
              value={phone}
            />
          </div>

          <div>
            <label
              className="text-sm font-semibold text-[var(--text-strong)]"
              htmlFor={specialtyId}
            >
              {content.specialtyLabel}
            </label>
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm text-[var(--text-strong)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-blue-100"
              id={specialtyId}
              onChange={(event) => {
                setSpecialty(event.target.value);
                setServerError(null);
                setIsSubmitted(false);
              }}
              placeholder={content.specialtyPlaceholder}
              type="text"
              value={specialty}
            />
          </div>
        </div>

        <div>
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--primary)] px-4 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
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

export default DoctorProfileOnboardingForm;
