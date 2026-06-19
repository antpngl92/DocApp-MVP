import { UserCheck } from "lucide-react";

import type { PendingDoctorApprovalsProps } from "./types";

const formatApprovalDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const PendingDoctorApprovals = ({
  content,
  doctors,
  onApprove,
}: PendingDoctorApprovalsProps) => {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-[var(--primary)]">
          <UserCheck aria-hidden="true" size={20} />
        </span>
        <div>
          <h2 className="font-bold text-[var(--text-strong)]">{content.heading}</h2>
          {!doctors.length ? (
            <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
              {content.emptyDescription}
            </p>
          ) : null}
        </div>
      </div>

      {!doctors.length ? (
        <div className="mt-5 rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-5">
          <p className="text-sm font-semibold text-[var(--text-strong)]">{content.emptyTitle}</p>
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                <th className="border-b border-[var(--border)] px-3 py-3 font-bold">
                  {content.heading}
                </th>
                <th className="border-b border-[var(--border)] px-3 py-3 font-bold">
                  {content.emailLabel}
                </th>
                <th className="border-b border-[var(--border)] px-3 py-3 font-bold">
                  {content.phoneLabel}
                </th>
                <th className="border-b border-[var(--border)] px-3 py-3 font-bold">
                  {content.specialtyLabel}
                </th>
                <th className="border-b border-[var(--border)] px-3 py-3 font-bold">
                  {content.createdLabel}
                </th>
                <th className="border-b border-[var(--border)] px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td className="border-b border-[var(--border)] px-3 py-4 font-semibold text-[var(--text-strong)]">
                    {doctor.name}
                  </td>
                  <td className="border-b border-[var(--border)] px-3 py-4 text-[var(--text-muted)]">
                    {doctor.email}
                  </td>
                  <td className="border-b border-[var(--border)] px-3 py-4 text-[var(--text-muted)]">
                    {doctor.phone ?? content.phoneFallback}
                  </td>
                  <td className="border-b border-[var(--border)] px-3 py-4 text-[var(--text-muted)]">
                    {doctor.specialty ?? content.specialtyFallback}
                  </td>
                  <td className="border-b border-[var(--border)] px-3 py-4 text-[var(--text-muted)]">
                    {formatApprovalDate(doctor.createdAt)}
                  </td>
                  <td className="border-b border-[var(--border)] px-3 py-4 text-right">
                    <form action={onApprove.bind(null, doctor.id)}>
                      <button
                        className="inline-flex min-h-10 items-center justify-center rounded-md bg-[var(--primary)] px-3 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        type="submit"
                      >
                        {content.approveLabel}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export { formatApprovalDate };
export default PendingDoctorApprovals;
