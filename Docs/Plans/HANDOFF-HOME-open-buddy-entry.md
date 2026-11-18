# HOME: Open Buddy from DungeonMind Web

Status: ACTIVE. Explicit operator goal in the Buddy Home chat authorizes a prominent main-site link to `https://buddy.dungeonmind.net/`, delivered through a reviewable PR. Merge and deployment remain separate authority.

Owner/lane: Buddy Home chat, `codex/buddy-site-entry`, isolated clone `/home/drakosfire/Projects/.codex/buddy-home-welcome/worktrees/LandingPage`, base `ca630551538aa7af1ee1548913e43ef2677c6282`. Managed `create_worktree` was attempted but did not return a checkout; this equivalent isolated clone leaves the dirty operator checkout untouched. Task-owned caches/evidence live in `/home/drakosfire/Projects/.codex/buddy-home-welcome` on verified Projects UUID `48fa5d10-fe99-4557-9fc9-d8a2a4b41ac8`.

Topology checkpoint: parallel-independent with Buddy Home PR https://github.com/Drakosfire/DungeonMindBuddy/pull/3965 at `730a0942684a231063a66e5127db436e07f78ca4`. This explicitly revises the initial serial proposal for these two owner-repository slices. The two changes have disjoint write/runtime ownership and no unmerged API dependency. They can be reviewed/reverted independently. No stack parent or prescribed merge order. Both sites must be verified before declaring the complete goal achieved.

Write lease: this handoff; `src/App.tsx` home-route header composition; new `src/components/BuddyEntryLink.tsx` and its focused test. Consume the existing UnifiedHeader controls slot and Mantine theme. Do not edit the operator's unrelated AppLinks/package changes, shared auth/theme/header internals, routing registry, lockfiles, backend, or deployment configuration. Open PR #5 owns unrelated process guidance; it does not overlap this lease.

Contract: normal same-tab cross-origin navigation from DungeonMind Web Home to Buddy Home. Buddy owns login and World entry through its existing flow and return links to DungeonMind Web. This is a public navigation link, not an SPA mount, SSO redesign, same-origin integration or platform-refresh activation.

Invariant/failure critique: the link must be a real anchor with a visible Open Buddy label, fit the current header at desktop and 320px, preserve the existing Login/Logout controls, support keyboard focus, and neither call a private API nor imply a new account is needed. Do not use client routing for an external origin or add placeholder actions.

Verification: focused rendered anchor test, documentation check, production build (record any inherited failure without changing dependencies), desktop/mobile browser header witness and exact destination check. Inspect cumulative base-to-head diff, commit intended files, push and open PR. Preserve evidence, tool versions and exact source SHA. Existing unrelated failures stay visible. No merge/deployment claim.
