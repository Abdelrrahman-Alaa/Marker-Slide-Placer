# Issue 03: Extract Slide Placement Engine & Guardrails Modules

Status: resolved
Blocked by: 01, 02

## Context
`hostscript.jsx` contains strict slide count guardrail logic, segment boundary calculations (Standard vs Extend-to-End mode), track clip overwrite, track item search (`__msp_findTrackItem`), auto-frame-scaling (`setScaleToFrameSize`), multi-pass trimming retries, and undo scoping.

## Objectives
1. Create `jsx/engine/guardrails.jsx` containing `MSP.Guardrails` (`calculateSegments`, `validateSlideCount`).
2. Create `jsx/engine/slidePlacer.jsx` containing `MSP.Engine` (`placeSlides`, `findTrackItem`, `applyTrimming`, `scaleToFrame`).
3. Update `hostscript.jsx` to `#include` both engine modules and turn `mspPlaceSlides` into a thin delegation wrapper.
4. Verify that timing validations, segment calculations, and parameter defaults match ADR 0001 and ADR 0002.
