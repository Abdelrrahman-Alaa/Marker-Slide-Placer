# Issue 01: Extract ExtendScript Utility Modules (JSON & FS)

Status: resolved
Blocked by: none

## Context
`hostscript.jsx` contains low-level JSON serialization (`__msp_toJson`, `__msp_jsonEscape`, `__msp_err`) and file system utilities (`__msp_normPath`, `__msp_naturalCompare`, `__msp_collectImageFiles`, `__msp_findItemByPath`, `__msp_getOrCreateSlideBin`).

## Objectives
1. Create `jsx/utils/json.jsx` containing `MSP.JSON` (`toJson`, `escape`, `err`).
2. Create `jsx/utils/fs.jsx` containing `MSP.FS` (`normalizePath`, `naturalCompare`, `collectImageFiles`, `findItemByPath`, `getOrCreateSlideBin`).
3. Add dual-environment export at the end of both files (`if (typeof module !== "undefined" && module.exports)`).
4. Update `hostscript.jsx` to `#include "jsx/utils/json.jsx"` and `#include "jsx/utils/fs.jsx"`.
5. Verify with offline unit test script that `toJson` and `naturalCompare` produce expected results.
