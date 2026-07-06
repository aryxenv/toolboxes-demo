# Copilot instructions

This repository is a presentation deck that tells the story of Toolboxes in
Foundry: curate tools once, expose them through one MCP endpoint, and reuse them
across every agent. It is built as a web app on the webslides template (React,
Vite, Tailwind, with an optional FastAPI backend). Treat the user as a presenter
or solution engineer first: they care about a polished deck, a working live demo,
exports, and a shareable presentation. The code is the implementation detail
behind that experience.

## Product view

The deck has eight slides: the hero, the tool-sprawl problem, what a toolbox is,
build and consume, no lock-in, a one-toolbox-many-agents use case, a live "Agent
+ Toolbox vs Agent + Tools" demo, and value plus get-started. Speaker notes live
in `presenter-notes.md`.

It lets a user:

- present a browser-based slide deck with keyboard and swipe navigation;
- run a live demo that streams two Foundry agents side by side, or realistic
  demo data when the backend is offline;
- ask Copilot to add, edit, theme, or polish slides;
- export private static PDF/PPTX files locally;
- publish the interactive deck to GitHub Pages when the content is safe to make
  public.

Keep it feeling like a custom Foundry Toolboxes presentation, not a generic app
scaffold. Changes should preserve the presenter workflow: start locally, iterate
visually, export privately, and optionally publish publicly.

## How to interpret user requests

- If the user asks to change the story, content, visual style, layout, or demo,
  make the deck better from a presentation perspective.
- If the user asks for a slide, create or update an actual slide in the deck,
  not just supporting code.
- If the user mentions a customer, account, event, or audience, tailor copy and
  visual choices to that audience.
- If the user asks for export, prefer the built-in local export paths:
  `exports/webslides.pdf`, `exports/webslides.pptx`, and
  `exports/webslides-img.pptx` for development exports. Production file exports
  should download to the user's system.
- The editable PowerPoint export is generated dynamically from the live web deck
  by `services/editable-pptx/` through `scripts/export-pptx.mjs`; the image
  PowerPoint export is generated from the live web deck by
  `scripts/export-pptx-img.mjs`. Do not commit generated files in `exports/`.
- If the user asks about publishing or sharing, distinguish private local
  artifacts from public GitHub Pages deployment.

## Experience principles

- Optimize for clear presentation flow, strong visual hierarchy, and live-demo
  usefulness.
- Prefer concise slide copy. Slides should support a speaker, not become a
  document.
- Keep interactive demos usable inside the deck; presentation keyboard shortcuts
  should not break form controls or app fragments.
- Treat generated exports as local artifacts. Do not commit files in `exports/`.
- Keep customer-specific or private content local unless the user explicitly
  wants to publish it.

## Existing Copilot workflows

Use the repo skills when they match the task:

- `add-a-slide`: add a new slide or section.
- `edit-a-slide`: change existing slide copy, layout, behavior, or ordering.
- `delete-a-slide`: remove an entire slide from the deck cleanly.
- `integrate-demo-into-slides`: turn an app/demo into a slide.
- `theming`: re-theme the deck or replace the account logo.
