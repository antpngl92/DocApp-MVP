import { describe, expect, it } from "vitest";

import { parseClerkServerEnv, parsePublicEnv } from "../env";

describe("environment validation", () => {
  it("defaults public Clerk route values to patient-safe routes", () => {
    expect(parsePublicEnv({})).toMatchObject({
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      NEXT_PUBLIC_CLERK_SIGN_IN_URL: "/sign-in",
      NEXT_PUBLIC_CLERK_SIGN_UP_URL: "/sign-up",
      NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: "/account",
      NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: "/account",
    });
  });

  it("rejects invalid public route values", () => {
    expect(() =>
      parsePublicEnv({
        NEXT_PUBLIC_CLERK_SIGN_IN_URL: "sign-in",
      }),
    ).toThrow();
  });

  it("requires the Clerk server key when server Clerk env is parsed", () => {
    expect(() => parseClerkServerEnv({})).toThrow();
    expect(parseClerkServerEnv({ CLERK_SECRET_KEY: "sk_test" })).toMatchObject({
      CLERK_SECRET_KEY: "sk_test",
    });
  });
});
