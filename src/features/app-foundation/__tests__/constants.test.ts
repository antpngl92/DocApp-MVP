import { describe, expect, it } from "vitest";

import {
  ADMIN_PANEL_DEFINITIONS,
  BOOKING_PANEL_DEFINITIONS,
  CHECKOUT_STATUS_ICON,
  HOME_PANEL_DEFINITIONS,
  PATIENT_PANEL_DEFINITIONS,
  SUPPORT_PANEL_DEFINITIONS,
} from "../constants";

describe("app foundation panel definitions", () => {
  it("defines panels for each public shell route", () => {
    expect(HOME_PANEL_DEFINITIONS).toHaveLength(2);
    expect(BOOKING_PANEL_DEFINITIONS).toHaveLength(3);
    expect(ADMIN_PANEL_DEFINITIONS).toHaveLength(2);
    expect(PATIENT_PANEL_DEFINITIONS).toHaveLength(2);
    expect(SUPPORT_PANEL_DEFINITIONS).toHaveLength(2);
    expect(CHECKOUT_STATUS_ICON).toBeDefined();
  });
});
