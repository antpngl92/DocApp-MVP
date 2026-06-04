import { FoundationPanel, PageIntro } from "@/components/ui";

import type { FoundationOverviewProps } from "./types";

const FoundationOverview = ({ description, eyebrow, panels, title }: FoundationOverviewProps) => {
  return (
    <div className="space-y-8">
      <PageIntro description={description} eyebrow={eyebrow} title={title} />
      <div className="grid gap-5 lg:grid-cols-2">
        {panels.map((panel) => (
          <FoundationPanel key={panel.title} {...panel} />
        ))}
      </div>
    </div>
  );
};

export default FoundationOverview;
