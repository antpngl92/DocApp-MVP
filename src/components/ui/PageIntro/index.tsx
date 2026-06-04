import type { PageIntroProps } from "./types";

const PageIntro = ({ description, eyebrow, title }: PageIntroProps) => {
  return (
    <header className="max-w-3xl">
      {eyebrow ? (
        <p className="mb-2 text-xs font-bold uppercase text-[var(--secondary)]">{eyebrow}</p>
      ) : null}
      <h1 className="text-3xl font-bold text-[var(--text-strong)] sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--text-muted)]">{description}</p>
    </header>
  );
};

export default PageIntro;
