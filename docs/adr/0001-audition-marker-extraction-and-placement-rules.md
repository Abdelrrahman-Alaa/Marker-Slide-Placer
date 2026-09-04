# ADR 0001: Audition Marker Extraction & Slide Placement Architecture

## Status
Accepted

## Context
The Marker Slide Placer panel automates placing presentation slides on video tracks matching cue points from audio tracks edited in Adobe Audition. Key architectural challenges addressed:
1. Premiere Pro's native `ProjectItem.getMarkers()` returning incomplete timestamp data for imported audio compared to embedded XMP metadata.
2. Distinct requirements for handling the final marker segment ($N-1$ slides vs $N$ slides extending to audio end).
3. Need for clean project organization and prevention of timeline misalignment when audio clips are trimmed or moved.

## Decision
1. **Timestamp Extraction:** Extract markers by evaluating distinct timestamps between XMP metadata and native API collections, avoiding artificial sample-rate scaling.
2. **Dual-Mode Segmentation UI:** Provide a dedicated **Placement Mode** dropdown with:
   - `Standard (Between Markers: N-1 Slides)`
   - `Extend to End (All Markers to Audio End: N Slides)`
3. **Strict Validation Guardrail:** Block timeline placement if the number of slide images in the chosen folder does not exactly equal the required segment count.
4. **Timeline In/Out Offset Alignment:** Map marker times to timeline positions via `clipStart + (markerTime - clipIn)`, ensuring exact sync even when the audio track has non-zero start time or trimmed in-points.
5. **Project Organization:** Automatically create and isolate imported slides inside dedicated project bins (`_Slides_<FolderName>`).
6. **Overwrite Placement with Natural Sorting:** Perform direct clip overwrites on the selected video track and sequence slide files using natural numeric sorting (`Slide1`, `Slide2`, ..., `Slide10`).

## Consequences
- 100% reliable detection of Audition markers across varying WAV/MP3 formats.
- Safe timeline operations with zero risk of slide drift or partial mismatched placements.
- Clean project hierarchy in Premiere Pro.
- Intuitive user control over slide segmentation modes.
