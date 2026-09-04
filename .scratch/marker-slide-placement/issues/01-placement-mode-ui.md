# 01: Placement Mode UI & Dynamic Calculation

**What to build:** Add a Placement Mode dropdown to the panel interface allowing the user to select between "Standard (Between Markers: N-1 Slides)" and "Extend to End (All Markers to Audio End: N Slides)". Update marker queries to dynamically calculate and display both the detected marker count and the required slide count based on the selected mode.

**Blocked by:** None (can start immediately)

**Status:** resolved

## Acceptance Criteria

- [x] A new `Placement Mode` dropdown is added to the panel interface below `Marker Source`.
- [x] Dropdown options include `Standard (N-1 Slides)` (default) and `Extend to End (N Slides)`.
- [x] Clicking `READ MARKERS` displays the active placement mode, total markers found, and expected slide count (e.g. "Found 101 markers -> Requires 100 slides in Standard Mode / 101 slides in Extend Mode").
- [x] Switching between modes updates or clearly indicates the slide count requirement in the status box.
