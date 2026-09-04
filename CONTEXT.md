# Domain Context: Marker Slide Placer

Glossary and domain model for the Marker Slide Placer Adobe Premiere Pro CEP extension.

## Core Concepts

### Audio Clip Marker
A time-coded cue point embedded in an audio file (typically exported from Adobe Audition in WAV/MP3 format with XMP metadata). Contains a name, comment, and timestamp.

### Timeline Ruler Marker
A sequence-level marker positioned directly on the Premiere Pro timeline ruler.

### Marker Segment
A continuous time interval allocated for a single slide.
- **Standard Mode:** The interval between Marker $i$ and Marker $i+1$ (yielding $N-1$ segments for $N$ markers).
- **Extend-to-End Mode:** Includes an additional final segment from Marker $N$ to the end of the audio clip on the timeline (yielding $N$ segments for $N$ markers).

### Placement Mode
A user-selectable mode presented as a dropdown in the panel UI:
1. `Standard (Between Markers: N-1 Slides)`
2. `Extend to End (All Markers to Audio End: N Slides)`

### Slide Placement Engine
The core ExtendScript subsystem that imports image files, locates target video tracks, calculates timeline offsets, places clips via overwrite, and trims boundaries to align with marker segments.

### Slide Bin
A dedicated project folder (`Bin`) created inside Premiere Pro (named `_Slides_<FolderName>`) to keep imported presentation slides organized and isolated from project root items.

### Strict Count Guardrail
A safety validation rule that verifies the number of slide images in the chosen folder exactly equals the required marker segments before any timeline modification occurs.

### Natural Numeric Sorting
Sorting algorithm that sequences slide filenames according to embedded numerical values (`Slide1`, `Slide2`, ..., `Slide10`, `Slide100`) rather than standard ASCII alphabetical order.

### Timeline In/Out Offset Alignment
The algorithm that compensates for trimmed or shifted audio clips on the timeline by translating source marker timestamps through `clipStart + (markerTime - clipIn)`.

### Production UI Hierarchy
A streamlined interface architecture featuring:
- Automatic background host connection checks with ambient status badges.
- A dynamic Summary Card displaying active sequence, detected markers, and required slides.
- A tiered action model prioritizing `Place Slides` as the primary CTA, `Scan Markers` as secondary, and utility operations collapsed or visually de-emphasized.

### Auto Frame Scaling
An optional per-placement setting that applies `setScaleToFrameSize()` on placed slide clips to match the sequence dimensions automatically.

### Slide Source Selection
The decoupled CEP dialog mechanism (`window.cep.fs.showOpenDialogEx`) that prompts the user to select the slides directory natively from the panel layer without blocking the ExtendScript runtime or tying up host execution.

### Host Request Timeout Guardrail
A configurable asynchronous timeout guardrail protecting the CEP panel from indefinite hanging on unresolved ExtendScript calls. Heavy timeline placements use an extended 120-second threshold, completely decoupled from user dialog interaction time.

