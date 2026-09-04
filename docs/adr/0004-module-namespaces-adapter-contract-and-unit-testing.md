# ADR 0004: ExtendScript Namespacing, Async Host Adapter Contract & Offline Testability

## Status
Accepted

## Context
Refactoring the monolithic Premiere CEP panel requires explicit interface contracts between modules on both the ExtendScript host side and the Chromium panel side. Without strict contracts, module extraction risks breaking global scope or introducing bridge deadlocks.

## Decision
1. **ExtendScript Namespacing (`MSP`):**
   - All internal functions attach to the `MSP` namespace (`MSP.JSON`, `MSP.FS`, `MSP.XMP`, `MSP.Timeline`, `MSP.Engine`).
   - Root `hostscript.jsx` maintains existing global signatures (`mspTestConnection`, `mspGetMarkersInfo`, `mspPlaceSlides`, `mspCopyClipMarkersToTimeline`, `mspDebugClipInfo`) as thin delegation wrappers calling into `MSP` modules.
2. **Async Host Adapter Contract (`js/premiere-adapter.js`):**
   - The panel interacts with Premiere exclusively through a Promise-based adapter.
   - The adapter handles 20-second timeout guardrails, `window.__adobe_cep__` validation, JSON deserialization, and maps ExtendScript `{ ok: false, error: ... }` responses into rejected Promises.
3. **Offline Unit Testability:**
   - Pure JS modules (`MSP.JSON`, `MSP.FS.naturalCompare`, `MSP.XMP.parseMarkers`) end with `if (typeof module !== "undefined" && module.exports) { module.exports = ... }`.
   - Enables fast automated testing in Node.js environments without running Premiere Pro.
4. **Dedicated CSS Presentation (`css/panel.css`):**
   - Extract styling cleanly into `css/panel.css`, maintaining Adobe Creative Cloud Dark Theme design tokens without heavy third-party framework overhead.

## Consequences
- Guaranteed zero regressions for existing CEP invocation call-sites.
- Presentation logic in `app.js` is clean, async/await-driven, and free of ExtendScript string construction.
- Core parsing and sorting algorithms are testable via automated scripts.
