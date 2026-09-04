# Marker Slide Placer (CEP Extension for Adobe Premiere Pro)

[![Version](https://img.shields.io/badge/version-1.0.5-blue.svg)](CSXS/manifest.xml)
[![Adobe Premiere Pro](https://img.shields.io/badge/Premiere%20Pro-25.0%2B-9999FF.svg)](#system-requirements)
[![CEP Runtime](https://img.shields.io/badge/CEP-12.0-orange.svg)](#system-requirements)

**Marker Slide Placer** is a professional Adobe Premiere Pro CEP extension designed to automate the synchronization, placement, and trimming of presentation slides (PowerPoint, Keynote, Canva exports) onto the timeline based on audio cues and markers.

It supports embedded XMP markers exported directly from Adobe Audition (Clip Markers) as well as sequence-level Timeline Ruler markers.

---

## 🌟 Key Features

- 🎧 **Dual Marker Source Detection (`Auto` / `Audio Clip` / `Sequence Ruler`)**:
  - Automatically extracts embedded cue points from Adobe Audition audio files (`WAV`, `MP3`) via in-memory XMP metadata parsing.
  - Automatically calculates timeline offsets for shifted or trimmed audio clips.
  - Detects sequence ruler markers directly.
- ⏱️ **1-Click Marker Transfer**:
  - Copy all embedded audio clip markers to the sequence timeline ruler with one click.
- 📐 **Two Placement Modes**:
  - **Standard Mode ($N-1$ Slides)**: Places slides between markers (Slide 1 from Marker 1 to 2, Slide 2 from Marker 2 to 3, etc.).
  - **Extend-to-End Mode ($N$ Slides)**: Places an additional final slide from the last marker to the end of the audio clip.
- 📁 **Decoupled Native Folder Picker**:
  - Non-blocking OS directory dialog invoked via `window.cep.fs.showOpenDialogEx` without freezing Premiere Pro or triggering timeout limits during folder browsing.
- 🛡️ **Strict Count Guardrails**:
  - Validates that the number of images in the selected folder exactly matches the required marker segments before performing any timeline mutations.
- 🗂️ **Project Bin Isolation**:
  - Automatically creates and isolates imported slide assets inside a dedicated project bin named `_Slides_<FolderName>`.
- 🔢 **Natural Numeric Sorting**:
  - Intelligently orders slide files by embedded numeric values (`Slide1`, `Slide2`, ..., `Slide10`, `Slide100`) rather than standard ASCII sorting.
- 🖼️ **Auto Frame Scaling**:
  - Automatically sets `setScaleToFrameSize()` on placed slide clips to match the sequence dimensions.
- ⏳ **Configurable Host Timeout Guardrails**:
  - Extended 120-second timeout for heavy batch timeline placement, while maintaining snappy 20-second thresholds for metadata inspection.
- 🎨 **Production Dark UI**:
  - Real-time connection badge, active sequence detection, dynamic summary card, and expandable diagnostics drawer.

---

## 💻 System Requirements

- **Adobe Premiere Pro**: v25.0 or later (v25.2.x fully tested).
- **CEP Runtime**: CSXS 12.0.
- **Operating System**: Windows 10/11 or macOS.
- **Supported Slide Formats**: `PNG`, `JPG`, `JPEG`, `WEBP`, `BMP`, `TIF`, `TIFF`.

---

## 🚀 Installation

### 1. Copy the Extension Folder
Place the `MarkerSlidePlacer_Panel_v1_fixed4` folder into your system CEP extensions directory:

- **Windows**:
  ```text
  C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\MarkerSlidePlacer_Panel
  ```
  *(Or per-user: `%APPDATA%\Adobe\CEP\extensions\MarkerSlidePlacer_Panel`)*

- **macOS**:
  ```text
  /Library/Application Support/Adobe/CEP/extensions/MarkerSlidePlacer_Panel
  ```
  *(Or per-user: `~/Library/Application Support/Adobe/CEP/extensions/MarkerSlidePlacer_Panel`)*

### 2. Enable Debug Mode (`PlayerDebugMode`)
To allow unsigned CEP extensions to run:

- **Windows (Registry)**:
  1. Press `Win + R`, type `regedit`, and press Enter.
  2. Navigate to `HKEY_CURRENT_USER\Software\Adobe\CSXS.12`.
  3. Create or set String Value (`REG_SZ`) named `PlayerDebugMode` with value `1`.

- **macOS (Terminal)**:
  ```bash
  defaults write com.adobe.CSXS.12 PlayerDebugMode 1
  ```

### 3. Launch Extension in Premiere Pro
1. Open Adobe Premiere Pro.
2. In the top menu, navigate to:  
   `Window > Extensions > Marker Slide Placer`.

---

## 📖 Usage Workflow

1. **Prepare Audio in Adobe Audition**:
   - Place cue markers in Audition while listening to the presentation speech.
   - When saving or exporting (`WAV` or `MP3`), ensure **"Include markers and other metadata"** is enabled.
2. **Add Audio to Premiere Pro Sequence**:
   - Drag your exported audio file onto the timeline.
3. **Configure Options in Marker Slide Placer Panel**:
   - **Marker Source**: Choose `Auto`, `Audio Clip Markers`, or `Timeline Markers`.
   - **Placement Mode**: Choose `Standard (N-1 Slides)` or `Extend to End (N Slides)`.
   - **Target Track**: Select the destination video track (e.g., `V1`, `V2`, `V3`).
   - **Auto-Scale**: Check `Auto-scale slides to sequence frame size` to match sequence resolution.
4. **Place Slides**:
   - Click **🚀 PLACE SLIDES**.
   - In the native OS folder picker, select the folder containing your exported slide images.
   - The extension validates the slide count, imports the images into a clean project bin, overwrites them onto the target track at exact marker positions, and trims boundaries seamlessly!

---

## 🏗️ Architecture & Codebase Structure

The project follows a decoupled, clean modular architecture:

```text
MarkerSlidePlacer_Panel/
├── CSXS/
│   └── manifest.xml             # Extension metadata, CSXS 12.0 runtime, Premiere host config
├── css/
│   └── panel.css                # Creative Cloud dark theme styling & responsive grid layout
├── js/
│   ├── premiere-adapter.js      # Promise-based CEP host adapter seam with configurable timeouts
│   └── app.js                   # Panel presentation controller & async event coordinator
├── jsx/                         # Modular ExtendScript host modules (under MSP namespace)
│   ├── utils/
│   │   ├── json.jsx             # ES3-compatible JSON serialization and error formatting
│   │   └── fs.jsx               # File collection, natural sorting, and bin management
│   ├── parsers/
│   │   └── xmpParser.jsx        # In-memory Audition XMP metadata marker extractor
│   ├── timeline/
│   │   └── markerScanner.jsx    # Sequence and track item marker resolution & offset engine
│   └── engine/
│       ├── guardrails.jsx       # Marker segment calculation and strict count guardrail
│       └── slidePlacer.jsx      # Clip placement, safe multi-pass trimming, and frame scaling
├── hostscript.jsx               # Central composition root uniting modules via #include
├── tests/                       # Automated offline test suites
│   ├── test-pure-modules.js     # CLI test runner
│   └── test-pure-modules.html   # Browser / CEP offline visual test harness
├── docs/
│   └── adr/                     # Architectural Decision Records (ADRs 0001 - 0005)
├── CONTEXT.md                   # Domain context and ubiquitous language glossary
└── AGENTS.md                    # Repository guidelines and engineering standards
```

---

## 🔬 Testing & Diagnostics

### Built-in Panel Diagnostics
Click the **"Advanced Diagnostics"** drawer at the bottom of the panel and click **"🔍 Inspect Audio Clips & Markers Info"** to generate an instant diagnostic report covering:
- Premiere Pro version and build.
- Active sequence name and ruler marker count.
- Audio tracks and clip metadata.
- Raw XMP metadata length and parsed marker timestamps.

### Pure Modules Offline Test Suite
Open [`tests/test-pure-modules.html`](tests/test-pure-modules.html) in any web browser to execute automated assertions verifying:
- `MSP.JSON` serialization and error generation.
- `MSP.FS.naturalCompare` alphanumeric sorting.
- `MSP.XMP.parseMarkers` attribute and child-tag XML extraction.
- `MSP.Guardrails.calculateSegments` interval calculations.
- `MSP.Guardrails.validateSlideCount` guardrail validation.

---

## 📝 Architectural Decision Records (ADRs)

Key architectural choices are formally documented in [`docs/adr/`](docs/adr/):
- **ADR 0001**: Audition Marker Extraction, Timeline Alignment, and Strict Count Guardrails
- **ADR 0002**: Production UI Hierarchy, Ambient Status, and Frame Scaling
- **ADR 0003**: Native `#include` Modularization and CEP Host Adapter Seam
- **ADR 0004**: ExtendScript Namespacing, Async Host Adapter Contract, and Offline Testability
- **ADR 0005**: Decoupled CEP Folder Selection and Configurable Host Adapter Timeouts

---

## 📄 License

Proprietary / Internal tool for automated video editing workflows. All rights reserved.
