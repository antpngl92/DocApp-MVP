import { Check } from "lucide-react";

import type { FoundationPanelProps } from "./types";

const FoundationPanel = ({ description, icon: Icon, items, title }: FoundationPanelProps) => {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-[var(--primary)]">
          <Icon aria-hidden="true" size={20} />
        </span>
        <div>
          <h2 className="font-bold text-[var(--text-strong)]">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{description}</p>
        </div>
      </div>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li className="flex gap-2 text-sm leading-6 text-[var(--text)]" key={item}>
            <Check aria-hidden="true" className="mt-1 shrink-0 text-[var(--secondary)]" size={15} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default FoundationPanel;
