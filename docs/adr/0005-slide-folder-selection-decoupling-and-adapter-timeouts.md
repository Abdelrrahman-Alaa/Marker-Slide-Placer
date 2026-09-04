# ADR 0005: Decoupled CEP Folder Selection and Configurable Host Adapter Timeouts

## Status
Accepted

## Context
When placing slides, `PremiereAdapter.placeSlides` previously invoked `mspPlaceSlides` on ExtendScript while a global 20-second Promise timeout (`TIMEOUT_MS = 20000`) was active in CEP. Inside ExtendScript, `Folder.selectDialog()` opened a modal OS directory picker.

Because ExtendScript is single-threaded and synchronously blocked during dialog interaction:
1. If the user spent more than 20 seconds navigating to their slides folder, the CEP Promise rejected with `"Host request timed out after 20s"`, and the panel reported an error.
2. ExtendScript remained waiting on the open dialog. Once the user selected a folder, Premiere resumed and placed the slides successfully onto the timeline, creating a confusing discrepancy between the panel's error alert and the actual successful timeline mutation.

## Decision

1. **Decoupled CEP Native Folder Dialog (`PremiereAdapter.selectFolder`):**
   - The OS directory picker is triggered directly from the CEP panel via `window.cep.fs.showOpenDialogEx(false, true, ...)`.
   - The dialog is completely asynchronous and runs outside ExtendScript execution, imposing zero timeout constraints on human folder navigation.
   - If the user cancels the dialog, the UI displays a calm cancellation alert and exits immediately without dispatching any ExtendScript operations.

2. **ExtendScript Host Endpoint Evolution (`mspPlaceSlides`):**
   - `mspPlaceSlides(trackNumber, sourceMode, placementMode, scaleToFrame, folderPath)` and `MSP.Engine.placeSlides` now accept an optional `folderPath` parameter.
   - When provided, `new Folder(folderPath)` is instantiated and validated for existence (`folder.exists`).
   - If omitted, the engine falls back to `Folder.selectDialog()` to ensure 100% backward compatibility for direct script execution or automated harnesses.

3. **Configurable Host Timeout Guardrails:**
   - `PremiereAdapter.callHost(script, timeoutMs)` accepts a custom timeout parameter, defaulting to 20,000ms for lightweight metadata queries (`testConnection`, `scanMarkers`).
   - `placeSlides` sets `timeoutMs = 120000` (120 seconds), providing ample headroom for batch importing, placing, scaling, and trimming hundreds of slides without risking false timeouts on large projects.

## Consequences
- **Eliminated Race Condition:** Browsing for slide folders will never trigger a false timeout error.
- **Improved Host Responsiveness:** ExtendScript execution is reserved purely for file scanning and timeline placement, executing in seconds.
- **Clean Cancellation:** Cancelling the folder dialog incurs zero host overhead or unwanted project changes.
- **Backward Compatibility:** All existing ExtendScript signatures and pure modules remain fully functional.
