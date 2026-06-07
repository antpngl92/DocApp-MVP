import { z } from "zod";

const emptyStringToUndefined = (value: unknown) => {
  return value === "" ? undefined : value;
};

const routeSchema = z
  .string()
  .startsWith("/", { message: "Route environment values must start with /." });

const databaseUrlSchema = z
  .string()
  .min(1, { message: "DATABASE_URL is required." })
  .refine(
    (value) => value.startsWith("postgresql://") || value.startsWith("postgres://"),
    "DATABASE_URL must be a PostgreSQL connection string.",
  );

const optionalNonEmptyString = z.preprocess(emptyStringToUndefined, z.string().min(1).optional());

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_ADMIN_EMAIL: optionalNonEmptyString,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: optionalNonEmptyString,
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.preprocess(
    emptyStringToUndefined,
    routeSchema.default("/sign-in"),
  ),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.preprocess(
    emptyStringToUndefined,
    routeSchema.default("/sign-up"),
  ),
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: z.preprocess(
    emptyStringToUndefined,
    routeSchema.default("/account"),
  ),
  NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: z.preprocess(
    emptyStringToUndefined,
    routeSchema.default("/account"),
  ),
});

const clerkServerEnvSchema = z.object({
  CLERK_SECRET_KEY: z.preprocess(emptyStringToUndefined, z.string().min(1)),
  CLERK_WEBHOOK_SECRET: optionalNonEmptyString,
});

const databaseEnvSchema = z.object({
  DATABASE_URL: z.preprocess(emptyStringToUndefined, databaseUrlSchema),
});

type PublicEnv = z.infer<typeof publicEnvSchema>;
type ClerkServerEnv = z.infer<typeof clerkServerEnvSchema>;
type DatabaseEnv = z.infer<typeof databaseEnvSchema>;
type EnvInput = Record<string, string | undefined>;

const parsePublicEnv = (env: EnvInput = process.env): PublicEnv => {
  return publicEnvSchema.parse(env);
};

const parseClerkServerEnv = (env: EnvInput = process.env): ClerkServerEnv => {
  return clerkServerEnvSchema.parse(env);
};

const parseDatabaseEnv = (env: EnvInput = process.env): DatabaseEnv => {
  return databaseEnvSchema.parse(env);
};

export { parseClerkServerEnv, parseDatabaseEnv, parsePublicEnv };
export type { ClerkServerEnv, DatabaseEnv, PublicEnv };
