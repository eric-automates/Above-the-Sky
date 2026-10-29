# Above the Sky — Day One

A browser game prototype, built for GitHub Pages. Put `index.html`, `diagnostics.js`, `integrity.json`, `upper.png`, `lower.png`, `serenity.png`, `bunk-detail.jpg`, `passenger-detail.jpg`, `shuttle-detail.jpg`, and `wreck-detail.jpg` together in the root of a repository. Enable **Settings → Pages → Deploy from a branch**, select the branch and `/ (root)`, and open the Pages URL. No installation, database, server, CDN, or API key is required. The PNG files must remain beside the HTML.

## Controls and mission

- Touch and drag the scene to walk; release to stop. Double-tap a softly glowing object to approach and interact, or double-tap open ground to walk there automatically. Dragging cancels an automatic route. Use the neck hatches to climb into the crew bunks. The forward stairs lead to the cargo-bay catwalk and its stairs to the cargo floor; the aft stairs connect the upper passage with the common area. ZOOM changes the interior view. Mouse drag and double-click also work in a desktop browser.
- Choose a crew member in the sidebar to take control of that character. Other crew members follow role-specific schedules, pathfind through traversable corridors, change decks at connected stairways, and pause at destinations. The controlled character does not follow an autonomous schedule. The selected character moves only in response to your input.
- Find the bridge console to take the helm. Drag to thrust in a direction. Turn with the on-screen curved arrows. Translation and turning have momentum. Hold ■ to brake, double-tap to stop automatically, and triple-tap to stop and keep station. Station keeping records a local position and heading after braking and applies bounded corrective thrust after a disturbance; it is not an orbital position controller.
- Choose DOCK ON TARGET, then tap the derelict or its radar contact. After docking, RETURN TO SHIP, find the lower-deck stairs and suit locker, and use the airlock. Find the note and unlock the locker, then return with the salvage to complete Day One. Return to the helm and choose UNDOCK after everyone is back. The galley, washroom, engineering, medical bay and cargo stores also have interactions.
- Select Mal or Jayne, tap DRAW WEAPON, and tap once in the scene to fire. Double-tap remains reserved for movement and interaction. Tap HOLSTER when finished. Day One has no enemies; the projectile and damage foundation is limited and there are no fully implemented signature skills, ammunition, or other characters’ weapons.
- Progress auto-saves every 20 seconds and SAVE stores it immediately in browser localStorage. GUIDE has a new-game reset. Saves are specific to the browser/device and can be cleared by the browser. Existing saves from the earlier prototype are loaded best-effort; reset if you encounter an old position.

## What this version is and isn't

This version replaces the original placeholder floorplan with two illustrated cutaways and articulated, color-coded 2D crew sprites. The room order was informed by published descriptions of the bridge, neck, galley, aft engine, cargo bay, infirmary and passenger quarters. The upper and lower decks use authored walkable floor shapes and wall outlines with AI-generated art subdued behind them, **not official blueprints or verified screen-accurate reproductions**. The dining table is solid; most other furniture is decorative and does not block movement. Four neck bunk ladders, the cargo catwalk and shuttles, the aft stair, and passenger quarters are interactive. The bunk, shuttle, catwalk and passenger spaces use simplified separate views, not a dimensionally accurate layered model. See `LAYOUT.md` for the reference-backed connections and remaining gaps. The derelict is still schematic. Crew have role-based pathfinding routines rather than autonomous needs, complex jobs or show-accurate likenesses. Mal and Jayne have basic projectiles and cooldowns, but the original combat and signature abilities have not been ported. There is no simulated economy or other-universe roster yet.

Flight uses simplified 2D inertial motion with translation, angular momentum, braking, and an approximate impulse on contact. Docking is a guided controller that matches a rotating target; it is not a validated full rigid-body spacecraft simulator, and docked rigid-body forces are approximated. This is a playable mission slice, not a completed simulation of all requested systems. It has no backend, multiplayer, real shared economy, procedural missions, or full weapon combat. A shared persistent universe would require a server and database.

The state is versioned in localStorage. The code uses a capped animation frame step; future work should migrate the physics to a fixed timestep, add save migrations, and use authored collision and navigation meshes. Minimal source length is not a substitute for profiling or maintainability.

## Reference and rights

Reviewed [Omni-Shift: Nexus Survivors](https://github.com/eric-automates/Omni-Shift-Nexus-Survivors), especially `js/data-heroes.js` IDs 13–16 and `js/combat.js` signature equipment. This build borrows character/gear concepts, not the existing combat engine. Ship-layout sources are listed in `LAYOUT.md`. Firefly/Serenity characters and setting belong to their respective rights holders; permission may be needed for public distribution.

## Tests

Run `node tests/simulation.cjs` and `node tests/touch.cjs` from this folder (Node is needed only for testing, not for playing). It checks station paths, portal endpoints, twenty simulated minutes of crew routes, player idle behavior, cabin and deck transitions, station keeping, docking, and the note/locker/airlock mission flow. These are automated logic tests with a mocked browser canvas; they do not replace visual, touch-device, or cross-browser testing.

## Feature flow and audit

**Legend:** ✓ working · ◐ partial / simplified · ○ not built yet.

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

The [full feature audit](FLOWCHART.md) lists each requested system and its current status, including missing combat abilities, other ships, and the wider economy. The [layout notes](LAYOUT.md) explain what is and is not blueprint-verified.

## Health & debugger

Open **HEALTH & DEBUG** in the toolbar. It records uncaught page errors, resource failures and unhandled promise rejections from page load, and displays recent FPS and selected ship/crew telemetry. **RUN ALL CHECKS** performs non-destructive checks of local storage, loaded state, deck stations and links, crew destinations, station-route reachability, image loading, mission flags and numeric ship state. It does not run the mission or modify your save. **COPY REPORT** copies a plain-text report, with a selectable text fallback. **CLEAR LOG** only clears the current session's captured events. Reports stay on your device unless you share them.

The integrity audit fetches `integrity.json` and checks the byte length and SHA-256 hash of each listed runtime file, including HTML boundary / trailing-paste checks. GitHub Pages or another HTTP(S) server is recommended: browsers commonly block these reads when opened as `file://`; the monitor reports this as unavailable rather than passing it. SHA-256 requires a supported secure context. The manifest is an **unsigned local baseline**, so it can detect accidental corruption or stale files but cannot prove authenticity if both files and manifest change. It does not validate visual accuracy, full gameplay, or dependencies not registered in the manifest. Referenced page scripts/styles/images missing from the manifest produce a warning. If `diagnostics.js` itself is absent or cannot load, the in-game debugger cannot run.

After editing any runtime file, regenerate the manifest from the repository root with `node tests/update-integrity.cjs`, then publish the updated file and `integrity.json` together. This generator requires Node only for development, not gameplay. Add new runtime assets to the generator's `names` list as the project grows. To test the monitor itself, run `node tests/diagnostics.cjs`; to test gameplay logic, run `node tests/simulation.cjs` and `node tests/touch.cjs`. Both use browser mocks rather than real visual/touch testing.

## Repository review

See [REPOSITORY_REVIEW.md](REPOSITORY_REVIEW.md) for the deployed-repository audit, browser test results, mobile aspect-ratio correction, remaining first-level gaps and a possible procedural-exploration direction.

## Touch update and asset notes

The floating single-pointer drag control and double-tap timing are adapted from the touch input patterns in the original Omni-Shift repository (`js/ui.js`); its combat engine has not been imported. The ship image and room images are AI-generated interpretations informed by the [published ship overview](https://en.wikipedia.org/wiki/Serenity_(Firefly_vessel)) and [layout summary](https://gamerant.com/firefly-class-starship-serenity-explained/), not official plans or confirmed exact recreations. Their collision and interactable positions remain authored approximations, and some decor is not usable. The space view uses an unstretched sprite with a subtle exhaust glow; it does not simulate smoke in vacuum.

The update is intentionally touch-first: no keyboard commands are needed. It was tested with touch events in a Chromium mobile emulation, not on every physical device. Known gaps include screen-accurate character likenesses, exact deck measurements and decoration, fully functional furniture, authentic combat/skills, and complete realistic flight physics.
