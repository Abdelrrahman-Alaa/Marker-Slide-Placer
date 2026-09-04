# Issue 02: Extract XMP Marker Parser & Timeline Scanner Modules

Status: resolved
Blocked by: 01

## Context
`hostscript.jsx` contains the Audition XMP marker regex parser (`__msp_parseXMPMarkers`), time unit converter (`parseTime`), marker deduplicator (`__msp_countDistinctTimes`), track item extractor (`__msp_extractMarkersFromTrackItem`), and sequence marker collector (`__msp_collectSequenceMarkers`, `__msp_getResolvedMarkers`).

## Objectives
1. Create `jsx/parsers/xmpParser.jsx` containing `MSP.XMP` (`parseMarkers`, `parseTime`, `countDistinctTimes`).
2. Add dual-environment export for `xmpParser.jsx` to enable offline testing.
3. Create `jsx/timeline/markerScanner.jsx` containing `MSP.Timeline` (`extractFromProjectItem`, `extractFromTrackItem`, `collectSequenceMarkers`, `collectAllClipMarkers`, `getResolvedMarkers`).
4. Update `hostscript.jsx` to `#include` both modules and delegate `mspGetMarkersInfo` to `MSP.Timeline.getResolvedMarkers`.
5. Verify with automated test script on sample XMP strings.
