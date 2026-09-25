# DungeonMind Web Documentation

This repository owns **frontend/product implementation truth** for DungeonMind Web.

Cross-repository architecture, ownership, and sequencing belong in DungeonOverMind.

## Start here

- [../README.md](../README.md) — repository role, runtime, and ownership boundary.
- [Plans/ANCHOR-dungeonmind-net-platform-refresh.md](Plans/ANCHOR-dungeonmind-net-platform-refresh.md) — local anchor for the cross-repository platform-refresh stewardship lane.
- [Design/CARDGENERATOR-PERSISTENCE.md](Design/CARDGENERATOR-PERSISTENCE.md) — current CardGenerator persistence behavior.
- component-local READMEs under `src/components/` when they still describe current implementation.

## Directory roles

### `Plans/`

Only active owner-repository handoffs/anchors. Completed implementation plans and handoffs belong in Archive/Git history.

### `Design/`

Current frontend/product implementation design that remains useful independently of code comments/tests.

### `Archive/`

Historical project/spec/research context only. Archive content cannot override current code/tests.

## Authority rule

For current behavior, prefer:

```text
current code/tests
→ current module/design docs
→ merged PR/commit evidence
→ Archive / Git history
```

An old spec or handoff that says “READY” does not become current authority merely because the file still exists.

## Placement rule

- frontend routes/auth/theme/product interaction → LandingPage;
- backend/API/auth server behavior → DungeonMindServer;
- Canvas package internals → Canvas;
- Buddy product/orchestration → DungeonMindBuddy;
- cross-repository platform architecture → DungeonOverMind.

## Historical project corpus

The 2025 visual-refresh and PlayerCharacterGenerator specification/research trees were archived during the 2026-09-25 authority cleanup. They are useful implementation history, not current product authority.
