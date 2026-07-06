# Toolboxes in Foundry

An interactive deck that tells the story of Foundry Toolboxes: curate tools once,
expose them through one MCP endpoint, and reuse them across every agent. It runs
as a web app, so one slide is a live "Agent + Toolbox vs Agent + Tools"
comparison. Built on the webslides template (React, Vite, Tailwind, with an
optional FastAPI backend).

## The deck

Eight slides, in order:

1. Toolboxes in Foundry (hero)
2. The problem: every agent re-wires every tool
3. What is a toolbox (Discover, Build, Consume, Govern)
4. Build once, consume anywhere (one MCP endpoint, central auth, versioning)
5. Foundry-homed, not Foundry-bound (no lock-in)
6. Use case: one toolbox, three agents
7. Live demo: Agent + Toolbox vs Agent + Tools
8. Ship agents, not plumbing (recap and get started)

Speaker notes for every slide are in `presenter-notes.md`.

## Run it

The deck:

```pwsh
npm install
npm run dev
```

Open http://localhost:5173.

The backend is only needed for the live demo on slide 7:

```pwsh
cd server
uv sync
uv run fastapi dev
```

When the backend is offline (for example, the published deck), slide 7 runs on
realistic demo data labeled `Demo data`. When it is online it is fully live, with
real streaming, evaluations, and token usage. See `server/README.md` for the
demo setup.

## Present

- Left / Right arrows move between slides.
- Spacebar cycles the highlighted card on a slide.
- Swipe moves between slides on touch.

## Export and share

Use the footer Export menu. Local PDF and PowerPoint exports require the backend
and write ignored files to `exports/`; production exports download directly.

| Option | Availability | Output |
| --- | --- | --- |
| PDF | Always | `webslides.pdf` |
| PowerPoint | Always | Editable `webslides.pptx` or image `webslides-img.pptx` |
| GitHub Pages | Dev only | Public static interactive deck |
| Azure | Dev only | Interactive deck plus FastAPI backend |

## Project reference

- Slides: `src/components/slides`
- Deck order: `src/Presentation.tsx`
- Shared UI: `src/components/ui`
- Theme tokens: `src/index.css`
- Backend: `server/`
- Speaker notes and sources: `presenter-notes.md`
