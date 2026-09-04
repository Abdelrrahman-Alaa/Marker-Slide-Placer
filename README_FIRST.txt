MARKER SLIDE PLACER — v1.0.5 (Audition Markers & Decoupled Folder Picker)
Premiere Pro 25.x / CEP 12 (CSXS 12) / Modular ExtendScript

INSTALLATION:
1. Close Premiere Pro.
2. Copy or replace this extension folder in:
   Windows: C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\MarkerSlidePlacer_Panel
   macOS:   /Library/Application Support/Adobe/CEP/extensions/MarkerSlidePlacer_Panel
3. Ensure PlayerDebugMode=1 exists at:
   Windows Registry: HKEY_CURRENT_USER\Software\Adobe\CSXS.12
   macOS Terminal:   defaults write com.adobe.CSXS.12 PlayerDebugMode 1
4. Open Premiere Pro and go to:
   Window > Extensions > Marker Slide Placer

USAGE WORKFLOW:
1. Export audio track from Adobe Audition (ensure "Include markers and other metadata" is enabled).
2. Drag the audio file onto your sequence timeline in Premiere Pro.
3. Open "Marker Slide Placer" panel:
   - Marker Source: "Auto" (detects Audition markers or timeline markers).
   - Placement Mode: "Standard (N-1 Slides)" or "Extend to End (N Slides)".
   - Target Track: Choose destination video track (V1, V2, etc.).
   - Auto-Scale: Check to auto-scale slides to sequence resolution.
4. Click "🚀 PLACE SLIDES":
   - Select your PowerPoint slides folder in the native OS folder picker.
   - Slides are imported into a dedicated bin (_Slides_<FolderName>), placed, and trimmed!

KEY FEATURES & UPDATES (v1.0.5):
- Decoupled Native Folder Picker: Zero timeout issues during folder browsing.
- Automatic reading of embedded markers from Audition audio files (XMP metadata).
- 1-Click transfer of Clip Markers to Sequence Timeline Ruler Markers.
- Dual Placement Modes: Standard (N-1) and Extend to End (N).
- Strict Count Guardrail: Prevents timeline mistakes if slide count does not match markers.
- Project Bin Isolation: Keeps project root clean.
- Natural alphanumeric sorting (Slide1, Slide2, ... Slide10, Slide100).
- Configurable Host Timeouts (up to 120s for large batches).

* For comprehensive architecture, API reference, and test suite details, see README.md.

