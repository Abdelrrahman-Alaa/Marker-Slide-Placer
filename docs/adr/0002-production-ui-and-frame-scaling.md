# ADR 0002: Production UI & Frame Scaling Architecture

## Status
Accepted

## Context
The panel's initial iteration featured prominent diagnostic and testing tools (raw terminal output box, explicit "TEST CONNECTION" button, yellow "DEBUG" button) to aid in reverse-engineering ExtendScript behaviors. In production, these elements clutter the screen, increase cognitive load, and risk user confusion. Additionally, mismatched resolution between PowerPoint exports (e.g. 4K) and sequences (e.g. 1080p) could cause slide images to appear mis-scaled if the editor's global preferences don't default to media scaling.

## Decision
1. **Silent Connection Probing:** Perform connection and sequence checks automatically on panel load, displaying a subtle indicator (`🟢 Premiere Pro Connected`) in the header instead of an explicit manual test button.
2. **Visual Summary Card:** Replace the large monospace debug log with a clean metadata card showing:
   - Active Sequence Name
   - Detected Marker Count
   - Required Slide Count for the current mode
3. **Structured Action Hierarchy:**
   - **Primary CTA:** `Place Slides 🚀` (prominent blue button).
   - **Secondary Preview:** `Scan Markers 🔍` (clean button to refresh/preview counts).
   - **Utility Action:** `Copy Markers to Timeline ⏱️` (subtle secondary button).
   - **Troubleshooting Disclosure:** Move deep diagnostic tools into a collapsed `<details>` drawer at the bottom.
4. **Non-Breaking Auto Frame Scaling:** Add an opt-out checkbox (`☑️ Scale slides to frame size`) defaulting to true, which calls `clip.setScaleToFrameSize()` defensively inside a `try/catch` block during placement without affecting core marker or trimming logic.
5. **Preservation of Core Mechanics:** All proven algorithms (1:1 XMP timestamp evaluation, ES3 natural sorting, strict count guardrail, dual-mode segmentation, and dedicated bin isolation) remain 100% untouched and functional.

## Consequences
- Clean, native Adobe Creative Cloud aesthetic.
- Zero risk of regression or breakage in existing marker and slide placement logic.
- Guaranteed proper slide scaling across any sequence resolution.
