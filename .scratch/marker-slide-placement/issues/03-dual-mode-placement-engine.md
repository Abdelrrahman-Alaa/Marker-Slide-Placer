# 03: Dual-Mode Slide Placement Engine & Timeline Alignment

**What to build:** An enhanced slide placement engine supporting both `standard` ($N-1$ slides) and `extend` ($N$ slides extending to audio end) placement modes, integrating the dedicated Project Bin from Ticket 02, applying true timeline offset mapping (`clipStart + (markerTime - clipIn)`), enforcing strict count validation guardrails, using natural numeric sorting for slide files, and wrapping timeline edits in a single ExtendScript undo scope.

**Blocked by:** 01 (Placement Mode UI & Dynamic Calculation), 02 (Dedicated Project Bin Isolation)

**Status:** resolved

## Acceptance Criteria

- [x] `mspPlaceSlides(trackNumber, sourceMode, placementMode)` accepts the active `placementMode` parameter (`standard` vs `extend`).
- [x] In `standard` mode with $N$ markers, exactly $N-1$ segments are calculated from Marker $i$ to Marker $i+1$.
- [x] In `extend` mode with $N$ markers, exactly $N$ segments are calculated, where the $N$-th segment runs from Marker $N-1$ to the audio clip's out-point (`clipStart + (clipOut - clipIn)`).
- [x] Strict count validation compares slide image files against expected segment count; if counts mismatch, execution halts and returns a descriptive error without modifying the timeline.
- [x] Timeline placement compensates for trimmed or shifted audio clips via `clipStart + (markerTime - clipIn)`.
- [x] Slide images are imported into the dedicated project bin (`_Slides_<FolderName>`).
- [x] Slide placement and trimming operations are grouped inside `app.enableUndoScope()`, allowing full rollback with a single `Ctrl+Z`.
