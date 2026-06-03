# Theme

## Summary

The current app has only baseline global CSS from Phase 1. The approved product UI direction is defined in:

- `docs/project-documentation/ui-direction.md`
- `.superdesign/design-system.md`

## CSS Approach

- Tailwind CSS v4 import in `src/app/globals.css`
- PostCSS plugin: `@tailwindcss/postcss`
- No `tailwind.config.ts` file currently exists in the MVP repo
- No Radix/shadcn theme should be ported

## Global CSS

Path: `src/app/globals.css`

```css
@import "tailwindcss";

:root {
  color-scheme: light;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background: #f8fafc;
  color: #111827;
  font-family: Arial, Helvetica, sans-serif;
}

main {
  padding: 2rem;
}
```

## PostCSS Config

Path: `postcss.config.mjs`

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

## Current Token Hints

Current baseline values:

- page background: `#f8fafc`
- text: `#111827`
- font: `Arial, Helvetica, sans-serif`
- color scheme: light

Approved future UI direction:

- light neutral background
- white/off-white surfaces
- muted clinical blue and green accents
- soft borders
- restrained shadows
- visible status badges
- readable typography
