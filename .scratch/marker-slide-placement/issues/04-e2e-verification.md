# 04: End-to-End Verification & Edge-Case Handling

**What to build:** Comprehensive end-to-end verification of the full extension lifecycle inside Premiere Pro, validating all 101 Audition markers in both Standard and Extend modes, strict error messaging on slide count mismatch, accurate project bin organization, and single-step undo reliability.

**Blocked by:** 03 (Dual-Mode Slide Placement Engine & Timeline Alignment)

**Status:** resolved

## Acceptance Criteria

- [x] Reading markers for `Lec 4.wav` successfully reports all 101 markers and the correct required slide count in both Standard (100 slides) and Extend (101 slides) modes.
- [x] Natural sorting algorithm correctly sequences `Slide 1`, `Slide 2`, ..., `Slide 10`, `Slide 100` instead of ASCII alphabetical order.
- [x] Selecting a folder with mismatched slide count triggers the strict guardrail and displays a clear, actionable error message.
- [x] Placing slides in Standard Mode distributes 100 slides between markers accurately without drift.
- [x] Placing slides in Extend Mode distributes 101 slides ending at the audio clip boundary.
- [x] Pressing `Ctrl+Z` in Premiere Pro undoes the entire slide placement in a single action.
