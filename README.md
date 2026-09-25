# DungeonMind Web

LandingPage is the **public frontend application for dungeonmind.net**.

Despite the repository name, this is no longer merely a landing page. It is the React application shell for DungeonMind's public/authenticated web experience and currently owns:

- public home and blog routes;
- Google-auth frontend state;
- shared navigation/header/theme;
- Card Generator;
- Statblock Generator;
- Player Character Generator;
- Rules Lawyer frontend;
- Map Generator/demo surfaces;
- frontend product state and interaction.

It consumes DungeonMindServer as the public Web API/BFF.

## Runtime shape

Current frontend stack:

- React 18;
- TypeScript 4.9;
- React Router 6;
- Mantine 7;
- Create React App / `react-scripts`;
- shared `dungeonmind-canvas` package from the Canvas repository.

CRA is current implementation truth, not a long-term architecture commitment. The active DungeonMind.net platform-refresh stewardship lane is explicitly evaluating whether migration to Vite is worth doing before Buddy launch.

## Application shell

`src/App.tsx` owns the current route composition and shared providers:

```text
MantineProvider
→ AuthProvider
→ AppProvider
→ BrowserRouter
→ StatBlockGeneratorProvider
→ route surfaces
```

Current routes include home, blog, Rules Lawyer, Card Generator, Statblock Generator, Player Character Generator, Map Generator, and development/demo routes.

`UnifiedHeader` is the shared navigation/header pattern across product surfaces.

## Authentication / API

Frontend auth authority is `src/context/AuthContext.tsx`.

API origin resolution is `src/config.ts`:

- explicit `REACT_APP_DUNGEONMIND_API_URL` wins;
- local development defaults to `http://localhost:7860`;
- production uses `https://www.dungeonmind.net`.

Authentication uses DungeonMindServer OAuth/session endpoints with browser credentials.

## Documentation

Start at [Docs/README.md](Docs/README.md).

Current cross-repository platform-refresh context:

- [Docs/Plans/ANCHOR-dungeonmind-net-platform-refresh.md](Docs/Plans/ANCHOR-dungeonmind-net-platform-refresh.md)

Cross-repository architecture and sequencing belong in DungeonOverMind. Frontend implementation/design belongs here.

## Development

```bash
npm install
npm start
npm test
npm run build
```

The repository currently uses `react-scripts`; there is no Vite implementation yet.

## Ownership boundary

```text
DungeonMind Web frontend implementation → this repository
Public Web API/backend              → DungeonMindServer
Reusable Canvas internals           → Canvas
Reusable inference execution        → GenerationEngine
Durable world knowledge             → DungeonMind
DungeonBuddy product semantics      → DungeonMindBuddy
Cross-repo architecture/sequencing  → DungeonOverMind
```
