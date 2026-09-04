# ADR 0003: Native #include Modularization & CEP Host Adapter Seam

## Status
Accepted

## Context
The codebase currently clusters all ExtendScript mechanics in a single monolithic file (`hostscript.jsx`, 1200+ lines) and all UI styling, structure, and host evaluation logic in a single file (`index.html`, 600+ lines). To improve maintainability, locality, and testing, the codebase is being refactored into deep modules.

## Decision
1. **ExtendScript Composition:** Use native ExtendScript `#include` preprocessor directives rather than external compilation tools (Rollup, Webpack, esbuild). Modules declare and attach to an internal namespace (`MSP = MSP || {}`) to avoid global scope pollution. This preserves zero-build friction, instant in-Premiere reload, and native debuggability.
2. **Directory Taxonomy:** Structure ExtendScript modules by domain responsibility:
   - `jsx/utils/`: Pure utilities (ES3 JSON serialization, file sorting).
   - `jsx/parsers/`: In-memory metadata parsers (Audition XMP marker extraction).
   - `jsx/timeline/`: Sequence and track item marker scanners.
   - `jsx/engine/`: Slide placement and strict count guardrail modules.
   - `hostscript.jsx`: Root composition file binding modules and exporting CEP-callable entrypoints.
3. **CEP Host Adapter Seam:** Decouple `index.html` by extracting:
   - `css/panel.css` for presentation.
   - `js/premiere-adapter.js` as an adapter module wrapping raw `evalScript` calls and timeouts.
   - `js/app.js` for DOM interaction and event handling, communicating with Premiere Pro solely through the adapter.
4. **Tracer-Bullet Migration:** Transition iteratively from lowest-dependency utilities upwards, ensuring the panel remains operational at every step.

## Consequences
- Zero build tools or Node.js dependencies required inside the extension bundle.
- Clean isolation between Premiere Pro scripting and HTML5 panel logic.
- UI logic becomes independently testable in a standard browser via mock adapters.
