# Routes

## Framework

DocApp uses Next.js App Router with `src/app`.

## Current Route Map

| URL path      | File path                     | Rendering     | Notes                       |
| ------------- | ----------------------------- | ------------- | --------------------------- |
| `/`           | `src/app/page.tsx`            | static page   | Setup placeholder home page |
| `/api/health` | `src/app/api/health/route.ts` | route handler | Smoke/health endpoint       |

## Root Layout

All routes currently use:

```txt
src/app/layout.tsx
```

## Planned Route Groups

Per `docs/project-documentation/project-structure.md`, future app foundation work should create route groups for:

- public/marketing route
- public booking route group
- checkout success/cancel/expired/status routes
- authenticated admin route group
- authenticated patient account route group

These routes are not implemented yet.

## Current Home Page Source

```tsx
const HomePage = () => {
  return (
    <main>
      <h1>DocApp</h1>
      <p>Project setup is ready for the MVP foundation.</p>
    </main>
  );
};

export default HomePage;
```
