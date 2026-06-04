import { LoaderCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";

const LoadingState = async () => {
  const t = await getTranslations("feedback");

  return (
    <div
      aria-live="polite"
      className="grid min-h-64 place-items-center text-[var(--text-muted)]"
      role="status"
    >
      <div className="flex items-center gap-3 text-sm">
        <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
        {t("loading")}
      </div>
    </div>
  );
};

export default LoadingState;
