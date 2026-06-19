import type { DashboardPlaceholderProps } from "./types";

const DashboardPlaceholder = ({ description, eyebrow, title }: DashboardPlaceholderProps) => {
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--secondary)]">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-bold text-[var(--text-strong)]">{title}</h1>
        <p className="max-w-3xl text-base leading-7 text-[var(--text-muted)]">{description}</p>
      </div>
      <div className="rounded-lg border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-soft)]">
        <p className="text-sm text-[var(--text-muted)]">{description}</p>
      </div>
    </section>
  );
};

export default DashboardPlaceholder;
