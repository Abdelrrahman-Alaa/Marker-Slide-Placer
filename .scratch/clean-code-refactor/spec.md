# Feature Specification: Clean Code Refactor & Deep Modularization

## Overview
Decompose the monolithic single-file architecture of the Marker Slide Placer panel (`hostscript.jsx` with 1209 lines, `index.html` with 615 lines) into deep, isolated modules following the principles in `codebase-design`.

## Architectural Decisions
- **ADR 0003**: Native `#include` preprocessor modularization & CEP Host Adapter Seam.
- **ADR 0004**: `MSP` namespace hierarchy, Promise-based async host adapter, and dual-environment export for offline testability.

## ExtendScript Taxonomy (`jsx/`)
- `jsx/utils/json.jsx`: Pure ES3 JSON serializer (`MSP.JSON`).
- `jsx/utils/fs.jsx`: Path normalization, natural numeric sorting, file discovery (`MSP.FS`).
- `jsx/parsers/xmpParser.jsx`: Universal in-memory Audition XMP marker parser (`MSP.XMP`).
- `jsx/timeline/markerScanner.jsx`: Sequence ruler & audio clip track item scanner (`MSP.Timeline`).
- `jsx/engine/guardrails.jsx`: Strict slide count validation (`MSP.Guardrails`).
- `jsx/engine/slidePlacer.jsx`: Overwrite placement, multi-pass trimming, frame scaling (`MSP.Engine`).
- `hostscript.jsx`: Composition root aggregating `#include` directives and exporting public backward-compatible entrypoints:
  - `mspTestConnection()`
  - `mspGetMarkersInfo(sourceMode, placementMode)`
  - `mspPlaceSlides(trackNumber, sourceMode, placementMode, scaleToFrame)`
  - `mspCopyClipMarkersToTimeline()`
  - `mspDebugClipInfo()`

## Client Panel Taxonomy
- `css/panel.css`: Adobe Creative Cloud Dark Theme design system tokens, layout, cards, buttons, alert banners.
- `js/premiere-adapter.js`: Promise-based host adapter wrapping `evalScript`, timeouts, error normalization.
- `js/app.js`: DOM event listeners, live summary card rendering, alert boxes, calling `PremiereAdapter`.
- `index.html`: Clean HTML5 semantic layout referencing CSS and JS scripts.

## Quality & Safety Constraints
1. **Zero Runtime Breakage**: Every public CEP function signature remains 100% identical.
2. **ES3 Compatibility**: No ES6 keywords (`let`, `const`, `arrow functions`, `class`) inside `jsx/` files.
3. **No Build Step**: Works natively inside Premiere Pro CEP without npm/webpack compilation.
4. **Offline Testability**: Pure parsers exportable to Node.js for unit testing.
