import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import CheckoutStatusView from "..";

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async () => {
    return (key: string) => `checkout.${key}`;
  }),
}));

describe("CheckoutStatusView", () => {
  it("renders translated checkout status content", async () => {
    render(await CheckoutStatusView({ status: "success" }));

    expect(screen.getByText("checkout.eyebrow")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "checkout.success.title" })).toBeInTheDocument();
    expect(screen.getByText("checkout.success.description")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "checkout.foundationTitle" })).toBeInTheDocument();
    expect(screen.getByText("checkout.item1")).toBeInTheDocument();
  });
});
