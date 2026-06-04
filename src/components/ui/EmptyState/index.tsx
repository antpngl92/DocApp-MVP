import type { EmptyStateProps } from "./types";

const EmptyState = ({ description, icon: Icon, title }: EmptyStateProps) => {
  return (
    <section className="rounded-lg border border-dashed border-[var(--border)] bg-white p-8 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-lg bg-[var(--surface-muted)] text-[var(--text-muted)]">
        <Icon aria-hidden="true" size={22} />
      </span>
      <h2 className="mt-4 font-bold text-[var(--text-strong)]">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[var(--text-muted)]">
        {description}
      </p>
    </section>
  );
};

export default EmptyState;
