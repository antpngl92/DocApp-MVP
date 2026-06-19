# Theme

## Summary

The current app has a light clinic-focused token foundation in `src/app/globals.css`. The approved
product UI direction is defined in:

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
  --background: #f8fafc;
  --surface: #ffffff;
  --surface-muted: #f1f5f9;
  --text-strong: #0f172a;
  --text: #111827;
  --text-muted: #64748b;
  --border: #dbe3ea;
  --primary: #2563eb;
  --primary-hover: #1d4ed8;
  --secondary: #0f766e;
  --success: #15803d;
  --warning: #b45309;
  --danger: #b91c1c;
  --info: #0369a1;
  --shadow-soft: 0 12px 32px rgb(15 23 42 / 7%);
}

body {
  margin: 0;
  min-height: 100vh;
  background: var(--background);
  color: var(--text);
  font-family: Arial, Helvetica, sans-serif;
}
```

## Current Token Values

- Background: `#f8fafc`
- Surface: `#ffffff`
- Surface muted: `#f1f5f9`
- Text strong: `#0f172a`
- Text default: `#111827`
- Text muted: `#64748b`
- Border: `#dbe3ea`
- Primary clinical blue: `#2563eb`
- Primary hover: `#1d4ed8`
- Secondary clinical green: `#0f766e`
- Success: `#15803d`
- Warning: `#b45309`
- Danger: `#b91c1c`
- Info: `#0369a1`
- Soft shadow: `0 12px 32px rgb(15 23 42 / 7%)`

## Typography

Current app fallback:

```txt
Arial, Helvetica, sans-serif
```

Phase 7 may propose a more polished sans-serif direction through SuperDesign, but any approved font
change must be documented and implemented deliberately.

## Visual Guardrails

Use:

- light neutral background
- white/off-white surfaces
- muted clinical blue and green accents
- soft borders
- restrained shadows
- visible status badges
- readable typography

Avoid:

- ads
- heavy gradients as the identity
- decorative blobs or bokeh
- purple-heavy AI startup styling
- marketplace doctor-card visual metaphors
- medical-record or hospital-management UI
- dark, flashy, or entertainment-oriented styling

