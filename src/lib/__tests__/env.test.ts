import { describe, expect, it } from "vitest";

import {
  getClerkWebhookSigningSecret,
  parseClerkServerEnv,
  parseClerkWebhookEnv,
  parseDatabaseEnv,
  parsePublicEnv,
} from "../env";

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

  it("requires a Clerk webhook signing secret when webhook env is parsed", () => {
    expect(() => parseClerkWebhookEnv({})).toThrow();

    expect(
      getClerkWebhookSigningSecret(
        parseClerkWebhookEnv({ CLERK_WEBHOOK_SIGNING_SECRET: "whsec_test" }),
      ),
    ).toBe("whsec_test");
  });

  it("supports the legacy Clerk webhook secret name while preferring the official name", () => {
    expect(
      getClerkWebhookSigningSecret(parseClerkWebhookEnv({ CLERK_WEBHOOK_SECRET: "legacy_secret" })),
    ).toBe("legacy_secret");

    expect(
      getClerkWebhookSigningSecret(
        parseClerkWebhookEnv({
          CLERK_WEBHOOK_SECRET: "legacy_secret",
          CLERK_WEBHOOK_SIGNING_SECRET: "official_secret",
        }),
      ),
    ).toBe("official_secret");

    expect(
      getClerkWebhookSigningSecret({
        CLERK_WEBHOOK_SECRET: undefined,
        CLERK_WEBHOOK_SIGNING_SECRET: undefined,
      }),
    ).toBe("");
  });

  it("requires a PostgreSQL database URL when database env is parsed", () => {
    expect(() => parseDatabaseEnv({})).toThrow();
    expect(() => parseDatabaseEnv({ DATABASE_URL: "" })).toThrow();
    expect(() =>
      parseDatabaseEnv({ DATABASE_URL: "mysql://user:pass@localhost:3306/docapp" }),
    ).toThrow();

    expect(
      parseDatabaseEnv({
        DATABASE_URL: "postgresql://user:pass@localhost:5432/docapp_mvp",
      }),
    ).toMatchObject({
      DATABASE_URL: "postgresql://user:pass@localhost:5432/docapp_mvp",
    });

    expect(
      parseDatabaseEnv({
        DATABASE_URL: "postgres://user:pass@db.prisma.io:5432/docapp_mvp",
      }),
    ).toMatchObject({
      DATABASE_URL: "postgres://user:pass@db.prisma.io:5432/docapp_mvp",
    });
  });
});
