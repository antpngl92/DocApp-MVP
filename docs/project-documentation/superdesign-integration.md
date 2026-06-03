# SuperDesign Integration

This file defines how SuperDesign should be integrated into the DocApp workflow.

SuperDesign is a design exploration and design-to-code handoff tool. It is not the product source of truth. The approved DocApp docs remain authoritative for scope, payment behavior, privacy, access control, and booking lifecycle rules.

## Official Integration Path

The official SuperDesign documentation describes an agent/CLI workflow for coding environments.

Set up SuperDesign for this project with:

```bash
npm install -g @superdesign/cli@latest
superdesign login
npx skills add superdesigndev/superdesign-skill
```

On Windows PowerShell, if `superdesign` is blocked by execution policy because it resolves to `superdesign.ps1`, use the command shim instead:

```powershell
superdesign.cmd --version
superdesign.cmd login
```

The skill can be added at project level or global level. For DocApp, prefer project-level setup so the workflow stays tied to this repository and its product rules.

Do not add `@superdesign/cli` as a runtime application dependency. It is a local design/tooling integration, not app code used by Next.js at runtime.

## Expected Project Artifacts

When SuperDesign is initialized for the project, it may create SuperDesign-specific files or a `superdesign/` folder containing design context, design system notes, or generated HTML references.

For DocApp, keep the local SuperDesign context in:

```txt
.superdesign/
```

The required context files are:

- `.superdesign/design-system.md`
- `.superdesign/init/components.md`
- `.superdesign/init/layouts.md`
- `.superdesign/init/routes.md`
- `.superdesign/init/theme.md`
- `.superdesign/init/pages.md`
- `.superdesign/init/extractable-components.md`

Keep generated artifacts only when they are useful for implementation review.

Recommended committed artifacts:

- approved design context
- reviewed screen/frame summaries
- implementation handoff prompts
- small HTML references only when they are intentionally used as source material

Avoid committing:

- large unreviewed exports
- duplicate exploratory ZIPs
- throwaway generated variants
- files containing real patient data, credentials, tokens, or private clinic information

## DocApp SuperDesign Workflow

Use this workflow for Phase 3 and later UI implementation:

1. Install and log in to SuperDesign locally.
2. Add the SuperDesign skill for this project.
3. Pin or provide the DocApp context from:
   - `docs/MVP.md`
   - `docs/DECISIONS.md`
   - `docs/project-documentation/ui-direction.md`
   - `docs/project-documentation/superdesign-prompts.md`
   - `docs/project-documentation/demo-data.md`
4. Start with the base style prompt from `superdesign-prompts.md`.
5. Use Branch to compare visual variations when exploring style.
6. Once a style is accepted, use Flow for connected journeys.
7. Export or copy design handoff prompts/HTML only after review.
8. Translate approved designs into maintainable Next.js components that follow `project-structure.md` and `code-style.md`.

## Required SuperDesign Project Context

Every SuperDesign session for DocApp should include these rules:

- DocApp is a clinic booking and deposit-management product.
- It is not a public doctor marketplace.
- It is not a medical-record system.
- Patients can register, book appointments, view appointments, and request cancellation only where policy allows.
- Patients cannot request or self-initiate refunds.
- Deposits are non-refundable by default if the patient does not attend, and this must be clearly shown.
- Payment finalization happens only through Stripe webhooks.
- Checkout success pages are read-only.
- Google Calendar events are created after webhook-confirmed payment or authorized manual confirmation.
- Google Calendar sync failure must not erase or cancel a paid booking.
- Manual bookings are clinic-side only.
- No ads anywhere in the app.
- No Radix/shadcn or old prototype UI components should be ported.

## Design Review Output

After using SuperDesign, record the review in a docs file before implementation starts.

Suggested file:

```txt
docs/project-documentation/superdesign-review.md
```

The review should include:

- SuperDesign project/link or exported artifact location, if available
- screens/flows generated
- accepted direction
- rejected direction
- accessibility notes
- status/copy notes
- implementation implications for Phase 4+
- open questions

## Implementation Handoff Rule

SuperDesign HTML is design reference, not automatic production code.

When implementing approved designs:

- use Next.js App Router under `src/app`
- keep page files thin
- create new React components for the rebuild
- follow folder-per-component structure
- keep product constants and labels out of page files
- preserve server/client boundaries
- keep payment, booking, and calendar lifecycle rules in server-side logic
- do not implement out-of-scope features that appear in generated designs

## Official References

- SuperDesign docs: `https://docs.superdesign.dev/`
- SuperDesign agent skill: `https://docs.superdesign.dev/cli-skill-tutorial`
- SuperDesign Flow: `https://docs.superdesign.dev/features/canvas/flow`
- SuperDesign export: `https://docs.superdesign.dev/features/canvas/export`
- SuperDesign prompt library: `https://docs.superdesign.dev/features/design-agent/prompt-library`
