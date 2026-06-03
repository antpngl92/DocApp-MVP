# Layouts

## Root Layout

- Path: `src/app/layout.tsx`
- Description: Next.js root layout. It imports global CSS and renders the page children directly inside `<body>`.

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocApp",
  description: "Deposit-based appointment booking for small clinics.",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
```

## Shared Layout Components

No app shell, header, navigation, sidebar, footer, admin shell, or patient shell components exist yet.

Phase 4 should create those as new rebuild components after Phase 3 design approval.
