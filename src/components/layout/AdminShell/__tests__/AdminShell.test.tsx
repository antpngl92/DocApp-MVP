import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AdminShell from "..";

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async () => {
    return (key: string) => `navigation.${key}`;
  }),
}));

vi.mock("../../AppShell", () => ({
  default: ({ children, contextLabel }: { children: React.ReactNode; contextLabel: string }) => (
    <section aria-label={contextLabel}>
      <div>{children}</div>
    </section>
  ),
}));

describe("AdminShell", () => {
  it("renders the admin context around children", async () => {
    render(await AdminShell({ children: <div>Admin content</div> }));

    expect(screen.getByLabelText("navigation.adminContext")).toBeInTheDocument();
    expect(screen.getByText("Admin content")).toBeInTheDocument();
  });
});
