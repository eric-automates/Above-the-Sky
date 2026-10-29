# Above the Sky — feature flow and audit

**Legend:** ✓ working in the current build · ◐ implemented in part / simplified · ○ not built yet. This is an audit of the requests in the conversation, not a promise that partial features are complete.

```text
✓ Open link / local save
        ↓
◐ Serenity cutaway + crew + needs + interactions
        ↓
◐ Bridge → inertial flight → radar → rotating target → auto-dock
        ↓
✓ Suit check → airlock → explore → find code → unlock → salvage → return
        ↓
✓ Day One complete / undock
        ↓
○ Further jobs → other ships & universes → independent simulated economy
```

## High-level feature inventory

| Status | Feature | Current scope / missing work |
|---|---|---|
| ✓ | Browser / GitHub Pages | Static HTML and local image files; no installation, account, server, database, or external runtime. Local auto-save and manual save; device/browser-specific. |
| ◐ | Ship interior | Upper/lower decks, neck bunk ladders, galley, engineering, cargo, catwalk, shuttles, infirmary, passenger quarters, forward escape-pod station. A simplified interpretation, not a blueprint-verified layout; several spaces are transition views, most objects are decorative. Shuttles and pod do not launch. |
| ◐ | Nine Firefly crew | Mal, Zoe, Wash (alive), Kaylee, Jayne, Inara, Simon, River, and Book can be selected. Small stylized sprites and animated movement/coats, not screen-accurate portraits or detailed clothing physics. |
| ◐ | Autonomous crew | Repeated role-based routes across deck links; non-selected crew move while at the helm. Not full needs-driven jobs, conversations, captain orders, or a self-running ship. Controlled character moves only on input. |
| ◐ | Survival and interactions | Nearby prompts, food/water, washroom, rest, medical care, per-character health/food/water/suit, and loading transitions. Only the controlled character's needs decay; most ship fixtures cannot be used. No deep life simulation. |
| ◐ | Flight | Touch drag thrust, turn controls, inertia, hold-to-brake, double-tap stop, triple-tap position/heading keeping, radar, simplified collision, target selection, auto-dock, and safe undocking. 2D approximations; not a complete Newtonian rigid-body or orbital simulation. |
| ◐ | Docking and perspective | Matches an approximate rotating target and keeps both ships together; background and view show motion. No articulated docking bridge, detailed airlock/pressurization model, or human acclimatization simulation. |
| ◐ | Day One derelict | Suit warning/override and rescue, one handcrafted note and three-dial lock, salvage, return and completion. No combat or horror. The derelict is schematic; the lock has a fixed code, and other puzzle types are not present. |
| ◐ | Original repository reuse | Reviewed the original Firefly-related character and equipment data; used some names/traits and navigation ideas. The original movement/combat systems, signature abilities and most eligible spaceship-linked heroes have **not** been ported. |
| ○ | Shooting, abilities and gear | Signature weapons, meaningful projectiles, damage, character-specific skills, cooldowns and inventory systems are not implemented. No first-mission enemies are planned by the request. |
| ○ | Other ships, characters and worlds | Identify the original roster's spaceship-associated characters, then add their ships and universes later. Not imported or simulated yet. |
| ○ | Persistent wider universe | Independent traffic, NPCs, factions, odd jobs, economy, markets, persistent consequences and off-screen world simulation. A shared online universe would require a backend; static Pages alone cannot provide one. |
| ◐ | Engine and extensibility | Lightweight dependency-free canvas; reusable pathfinding, versioned local state and compact data. Physics uses capped frame steps, not a fixed-step engine; save migration, profiling and broader device testing remain. |
| ◐ | Health & debugger | In-game error log, FPS telemetry, non-destructive state/navigation checks and unsigned SHA-256 file baseline; local-file restrictions and visual/gameplay coverage limitations apply. |
| ◐ | Testing | Automated mocked-canvas tests cover repeated crew routes, station paths, selected-character idling, deck transitions, docking, station keeping, suit/crew state, undocking and the mission flow. Visual fidelity, touchscreen operation and cross-browser performance have not been fully tested. |

For ship research and the accuracy limitations, see [LAYOUT.md](LAYOUT.md). Firefly/Serenity rights belong to their respective owners; public distribution may require permission.
