# Spec: Robust Marker Extraction & Dual-Mode Slide Placement Engine

**Status:** `ready-for-agent`

## Problem Statement

Video editors and course creators preparing lecture videos in Adobe Premiere Pro need to synchronize presentation slides with recorded speech that has been marked in Adobe Audition. Previously:
1. Marker extraction failed or collapsed into a single marker when Premiere Pro's native API returned incomplete timestamp properties for imported audio files compared to embedded XMP metadata.
2. Users were restricted to a single marker-to-marker segmentation model ($N-1$ slides for $N$ markers), lacking support for presentations where the final marker introduces a slide that must remain on screen until the lecture audio concludes ($N$ slides).
3. Slide image imports cluttered the root bin of the Premiere Pro project.
4. Mismatches between the number of exported slide images and detected markers caused silent timeline misalignments without strict pre-flight validation.

## Solution

A robust, dual-mode slide placement extension for Adobe Premiere Pro that:
1. Accurately extracts 100% of embedded Audition cue markers from audio tracks using distinct-timestamp evaluation across XMP metadata and native marker collections without sample-rate distortion.
2. Provides a dedicated **Placement Mode** dropdown in the panel UI supporting:
   - **Standard Mode:** Places $N-1$ slides spanning consecutive marker intervals (Marker $i$ to Marker $i+1$).
   - **Extend-to-End Mode:** Places $N$ slides spanning all $N$ markers, with the final slide extending from Marker $N$ to the audio clip's out-point.
3. Automatically creates and isolates imported slide images inside a dedicated project bin named after the source folder (`_Slides_<FolderName>`).
4. Performs strict count validation before altering the timeline, refusing execution if the image count in the chosen folder does not match the active placement mode's required segment count.
5. Compensates for trimmed, cut, or shifted audio tracks on the sequence timeline via automated in/out offset mapping.
6. Sequences slide files using natural numeric sorting.

## User Stories

1. As a video editor, I want the extension to automatically detect all embedded Audition markers from the audio track on my active sequence, so that I don't have to manually replicate dozens of cue points on the timeline.
2. As a video editor, I want to choose between "Standard (N-1 Slides)" and "Extend to End (N Slides)" placement modes via a clean dropdown, so that I can accommodate both presentations with closing markers and presentations with end-of-audio slides.
3. As a video editor, I want the extension to verify that my slide image count matches the required marker segments before placing anything on the timeline, so that I never get misaligned or shifted slides in the middle of a lecture.
4. As a video editor, I want the extension to report detailed diagnostics and exact file vs marker counts when a mismatch occurs, so that I know immediately whether I am missing a slide or exported the wrong folder.
5. As a video editor, I want imported slide images to be placed inside a dedicated `_Slides_<FolderName>` bin in my Project panel, so that my project root remains organized and clean.
6. As a video editor, I want existing slides in the project bin to be reused if they have already been imported, so that duplicate project items are not created unnecessarily.
7. As a video editor, I want slide files with numeric names like `Slide1`, `Slide2`, `Slide10`, `Slide100` to be placed in natural numerical order, so that slide 10 does not mistakenly precede slide 2.
8. As a video editor, I want slide placement to align accurately with speech even if I trimmed the beginning of the audio track or moved the audio clip to a later position on the timeline.
9. As a video editor, I want to copy all detected audio clip markers directly to the sequence timeline ruler with one click, so that I can see visual cues across the entire sequence while editing.
10. As a video editor, I want slide placement to overwrite the selected video track directly, so that updating slides or re-running placement replaces existing items seamlessly.
11. As a video editor, I want the entire placement operation to be fully undoable with a single `Ctrl+Z`, so that I can revert any accidental placement instantly.
12. As a video editor, I want the panel UI to display the active mode, target video track, detected marker count, and required slide count dynamically, so that I have complete confidence before initiating placement.

## Implementation Decisions

1. **Distinct-Timestamp Marker Extraction Strategy:**
   - Ingest markers from both XMP metadata (`xmpDM:startTime`, `startTime`) and native marker collections.
   - Evaluate collections by their count of distinct non-zero timestamps (`__msp_countDistinctTimes`). Select the richer collection to eliminate false collapsing from zero-initialized native collections.
   - Eliminate all artificial sample-rate multiplications; timestamps are parsed and handled as 1:1 absolute seconds.

2. **Placement Mode Architecture:**
   - Add a `placementMode` dropdown to the panel interface with values:
     - `standard`: Calculates $N-1$ segments between Marker $i$ and Marker $i+1$.
     - `extend`: Calculates $N$ segments, where segments $0 \dots N-2$ run from Marker $i$ to Marker $i+1$, and segment $N-1$ runs from Marker $N-1$ to `clipOut`.
   - Update marker info queries (`mspGetMarkersInfo`) to report required slide count based on selected placement mode.

3. **Timeline In/Out Offset Alignment:**
   - Compute `clipStart`, `clipIn`, and `clipOut` from the sequence track item.
   - Map each source marker timestamp to sequence timeline position via `timelinePos = clipStart + (markerTime - clipIn)`.
   - In `extend` mode, the final segment ends at `clipStart + (clipOut - clipIn)` (the timeline end of the audio clip).

4. **Dedicated Project Bin Isolation:**
   - On placement, verify or create a target project bin: `app.project.rootItem.createBin("_Slides_" + folderName)`.
   - Import missing slide files into this dedicated bin.
   - Retrieve project items exclusively from this bin or project hierarchy.

5. **Strict Guardrail & Validation:**
   - Compare `files.length` strictly against `expectedSlideCount`.
   - If `files.length !== expectedSlideCount`, halt execution, emit no timeline changes, and return an explicit JSON error detailing expected vs received counts and current placement mode.

6. **Natural Numeric Sorting:**
   - Sort image file objects using locale-aware numeric comparison (`localeCompare` with `{ numeric: true, sensitivity: 'base' }`).

7. **Undo Scope Grouping:**
   - Wrap the entire import, placement, and trimming sequence inside an ExtendScript undo block (`app.enableUndoScope()`) so the user can revert the entire placement in a single undo step.

## Testing Decisions

- **Test Seam 1: Marker Resolution & Timestamp Evaluation:**
  - Verify that audio files with embedded XMP markers produce the exact list of distinct timestamps regardless of whether native API returns 0s.
  - Verify that 44.1kHz and 48kHz audio files produce identical 1:1 timeline timestamps without drift.
- **Test Seam 2: Dual-Mode Segment Calculation:**
  - Standard Mode with 101 markers produces exactly 100 segments from Marker 0 to Marker 100.
  - Extend Mode with 101 markers produces exactly 101 segments, ending at the audio clip's timeline end.
- **Test Seam 3: Mismatch Guardrail:**
  - Validating 50 slide images against a 101-marker sequence in Standard Mode returns an informative error and makes 0 timeline modifications.
- **Test Seam 4: Project Bin Isolation:**
  - Importing slides creates `_Slides_<FolderName>` and places all imported project items inside it.

## Out of Scope

- Audio transcription or automatic speech-to-text marker generation inside the panel.
- Adding motion graphics templates (MOGRTs) or transition animations (handled manually or in future versions).
- Slide image content OCR or slide text searching.

## Further Notes

- Supported slide image formats: PNG, JPG, JPEG, WEBP, BMP, TIF, TIFF.
- Compatible with Adobe Premiere Pro 25.0+ and CSXS 12.0 runtime.
