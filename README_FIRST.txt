MARKER SLIDE PLACER — v1.0.5 (Audition Markers Support)
Premiere Pro 25.2.x / CEP 12 / ExtendScript

INSTALL
1. Close Premiere Pro.
2. Replace the extension folder in:
   C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\MarkerSlidePlacer_Panel_v1_fixed4
   (or your active extension directory)
3. Ensure PlayerDebugMode=1 exists at:
   HKEY_CURRENT_USER\Software\Adobe\CSXS.12
4. Open Premiere and go to:
   Window > Extensions > Marker Slide Placer

USAGE WITH AUDITION MARKERS (NEW!):
1. Export your audio track from Adobe Audition (markers will be saved inside the audio file).
2. Drag your audio file onto your Sequence in Premiere Pro.
3. Open "Marker Slide Placer" extension.
4. Set "Marker Source" to:
   - "Auto" (automatically detects your Audition audio markers or timeline markers)
   - or "Audio Clip Markers"
5. (Optional) Click "COPY CLIP MARKERS TO TIMELINE" if you want all markers copied onto the ruler.
6. Select the destination Video Track (e.g., V1, V2).
7. Click "PLACE SLIDES" and choose the folder of your exported PowerPoint slides!

FEATURES:
- Automatic reading of embedded markers from Audition audio files (Clip Markers).
- 1-Click transfer of Clip Markers to Sequence Timeline Markers.
- Overwrite and trim slide images between markers accurately.
- Supports PNG, JPG, JPEG, WEBP, BMP, TIF, TIFF.
- Natural sorting (Slide1, Slide2, ... Slide10).
