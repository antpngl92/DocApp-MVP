import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    coverage: {
      exclude: [
        "**/__tests__/**",
        "**/*.d.ts",
        "**/generated/**",
        "coverage/**",
        "next-env.d.ts",
        "src/app/**",
        "src/components/feedback/**",
        "**/FoundationOverview/index.tsx",
        "src/i18n/actions.ts",
        "src/i18n/request.ts",
        "src/lib/prisma.ts",
        "src/test/**",
      ],
      include: [
        "src/components/**/*.{ts,tsx}",
        "src/config/**/*.{ts,tsx}",
        "src/features/**/*.{ts,tsx}",
        "src/i18n/**/*.{ts,tsx}",
        "src/lib/**/*.{ts,tsx}",
        "src/server/**/*.{ts,tsx}",
      ],
      provider: "v8",
      reporter: ["text", "html"],
      thresholds: {
        branches: 95,
        functions: 95,
        lines: 95,
        statements: 95,
      },
    },
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
