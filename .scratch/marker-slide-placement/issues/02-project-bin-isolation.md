# 02: Dedicated Project Bin Isolation

**What to build:** An automated Project Bin management mechanism in ExtendScript that creates a dedicated folder (`_Slides_<FolderName>`) in Premiere Pro's Project panel for imported slide presentations, preventing clutter in the project root and reusing existing items without creating duplicates.

**Blocked by:** None (can start immediately)

**Status:** resolved

## Acceptance Criteria

- [x] ExtendScript helper function finds or creates a dedicated `Bin` inside `app.project.rootItem` named `_Slides_<FolderName>` based on the chosen slide folder.
- [x] During slide import, new images are imported directly into this dedicated Bin.
- [x] Existing project items inside the dedicated bin with matching paths are detected and reused instead of re-importing.
- [x] Slide project items are cleanly isolated and not dumped into the root project bin.
