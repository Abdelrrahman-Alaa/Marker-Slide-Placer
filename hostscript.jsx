// ====================================================
// Marker Slide Placer - Host Script Composition Root
// Deep Modular Architecture (ECMAScript 3 Compatible)
// ====================================================

// 1. Root Namespace Initialization
var MSP = MSP || {};

// 2. Module Composition via Preprocessor Includes
#include "jsx/utils/json.jsx"
#include "jsx/utils/fs.jsx"
#include "jsx/parsers/xmpParser.jsx"
#include "jsx/timeline/markerScanner.jsx"
#include "jsx/engine/guardrails.jsx"
#include "jsx/engine/slidePlacer.jsx"

// ====================================================
// Public CEP Bridge Endpoints
// (Maintains 100% Backward Compatibility with Extension)
// ====================================================

function mspTestConnection() {
  try {
    var seq = MSP.Timeline.getActiveSequence();
    var pVer = "Unknown";
    var pBuild = "Unknown";
    try {
      pVer = app.version;
    } catch (e1) {}
    try {
      pBuild = app.build;
    } catch (e2) {}

    return MSP.JSON.toJson({
      ok: true,
      message:
        "Panel is connected to Premiere ✅\nPremiere: " +
        pVer +
        " (build " +
        pBuild +
        ")" +
        (seq ? "\nActive Sequence: " + seq.name : "\nNo active sequence opened."),
    });
  } catch (e) {
    return MSP.JSON.err(e);
  }
}

function mspGetMarkersInfo(sourceMode, placementMode) {
  if (!placementMode) placementMode = "standard";
  try {
    var seq = MSP.Timeline.getActiveSequence();
    if (!seq) {
      return MSP.JSON.err("No active sequence. Open your target sequence first.");
    }
    var res = MSP.Timeline.getResolvedMarkers(seq, sourceMode);
    var count = res.markers.length;
    var reqSlides = placementMode === "extend" ? count : Math.max(0, count - 1);
    return MSP.JSON.toJson({
      ok: true,
      count: count,
      source: res.sourceName,
      placementMode: placementMode,
      requiredSlides: reqSlides,
      audioEnd: res.audioEnd || 0,
      markers: res.markers,
      diag: res.diag,
    });
  } catch (e) {
    return MSP.JSON.err(e);
  }
}

function mspPlaceSlides(trackNumber, sourceMode, placementMode, scaleToFrame, folderPath) {
  return MSP.Engine.placeSlides(trackNumber, sourceMode, placementMode, scaleToFrame, folderPath);
}

function mspCopyClipMarkersToTimeline() {
  try {
    var seq = MSP.Timeline.getActiveSequence();
    if (!seq) {
      return MSP.JSON.err("No active sequence. Open your target sequence first.");
    }

    var clipData = MSP.Timeline.collectAllClipMarkers(seq);
    var clipMarkers = clipData.markers;
    if (!clipMarkers.length) {
      return MSP.JSON.err(
        "No clip markers found.\n\nDiagnostics:\n" +
          (clipData.diag && clipData.diag.length
            ? clipData.diag.join("\n")
            : "No audio tracks or clips found on timeline.")
      );
    }

    var added = 0;
    for (var i = 0; i < clipMarkers.length; i++) {
      var cm = clipMarkers[i];
      try {
        var m = seq.markers.createMarker(cm.start);
        if (m) {
          if (cm.name) m.name = cm.name;
          if (cm.comments) m.comments = cm.comments;
          added++;
        }
      } catch (me) {}
    }

    return MSP.JSON.toJson({
      ok: true,
      count: added,
      message:
        "Successfully copied " +
        added +
        " markers from audio clip to the timeline ruler! ✅",
    });
  } catch (e) {
    return MSP.JSON.err(e);
  }
}

function mspDebugClipInfo() {
  try {
    var log = [];
    log.push("=== Fast Diagnostic Report ===");
    log.push("Premiere: " + app.version + " (build " + app.build + ")");

    var seq = MSP.Timeline.getActiveSequence();
    if (!seq) {
      log.push("ERROR: No active sequence.");
      return MSP.JSON.toJson({ ok: true, debug: log.join("\n") });
    }
    log.push("Active Sequence: " + seq.name);

    var smCount = 0;
    try {
      if (seq.markers) {
        var sm = seq.markers.getFirstMarker();
        while (sm) {
          smCount++;
          sm = seq.markers.getNextMarker(sm);
        }
      }
    } catch (eSm) {}
    log.push("Sequence Ruler Markers: " + smCount);

    var numAudio = seq.audioTracks ? seq.audioTracks.numTracks : 0;
    log.push("Audio Tracks: " + numAudio);

    for (var t = 0; t < numAudio; t++) {
      var track = seq.audioTracks[t];
      var numClips = track.clips ? track.clips.numItems : 0;
      log.push("\n--- Track A" + (t + 1) + " (" + numClips + " clips) ---");

      for (var c = 0; c < numClips; c++) {
        var clip = track.clips[c];
        log.push("Clip [" + c + "]: '" + (clip.name || "unnamed") + "'");
        log.push("  Timeline Start: " + (clip.start ? clip.start.seconds.toFixed(2) : "?") + "s");

        var pi = clip.projectItem;
        if (!pi) {
          log.push("  ProjectItem: null");
          continue;
        }
        log.push("  ProjectItem Name: '" + (pi.name || "") + "'");

        try {
          if (pi.getXMPMetadata) {
            var xmp = pi.getXMPMetadata();
            log.push("  XMP Length: " + (xmp ? xmp.length : 0) + " chars");
            if (xmp && xmp.length > 0) {
              var hasMarkers = xmp.indexOf("Markers") > -1 || xmp.indexOf("markers") > -1;
              var hasStartTime = xmp.indexOf("startTime") > -1;
              log.push("  XMP has 'markers': " + hasMarkers + ", has 'startTime': " + hasStartTime);

              var parsed = MSP.XMP.parseMarkers(xmp);
              log.push("  Parsed Markers from XMP: " + parsed.length);
              for (var pm = 0; pm < Math.min(parsed.length, 5); pm++) {
                log.push("    - " + parsed[pm].name + " @ " + parsed[pm].start.toFixed(3) + "s");
              }
              if (parsed.length > 5) {
                log.push("    ... and " + (parsed.length - 5) + " more markers");
              }
            }
          }
        } catch (eX) {
          log.push("  XMP Error: " + eX);
        }

        try {
          if (typeof pi.getMarkers === "function") {
            var mc = pi.getMarkers();
            var gCount = 0;
            if (mc) {
              var gm = mc.getFirstMarker();
              while (gm) {
                gCount++;
                gm = mc.getNextMarker(gm);
              }
            }
            log.push("  pi.getMarkers() Count: " + gCount);
          }
        } catch (eG) {
          log.push("  pi.getMarkers() Error: " + eG);
        }

        var extracted = MSP.Timeline.extractFromTrackItem(clip);
        log.push("  Extracted TrackItem Markers: " + extracted.length);
        if (extracted.length > 0) {
          for (var em = 0; em < Math.min(extracted.length, 3); em++) {
            log.push("    - " + extracted[em].name + " @ " + extracted[em].start.toFixed(3) + "s (timeline)");
          }
        }
      }
    }

    return MSP.JSON.toJson({ ok: true, debug: log.join("\n") });
  } catch (e) {
    return MSP.JSON.err("Diagnostic error: " + e);
  }
}
