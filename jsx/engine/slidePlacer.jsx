// ====================================================
// Module: MSP.Engine (Slide Placement & Trimming Engine)
// Clip Placement, Safe Trimming, and Frame Scaling
// ====================================================
var MSP = MSP || {};

(function () {
  function isSameProjectItem(pi1, pi2) {
    if (!pi1 || !pi2) return false;
    try {
      if (pi1.nodeId && pi2.nodeId && pi1.nodeId === pi2.nodeId) return true;
    } catch (e) {}
    try {
      if (pi1.treePath && pi2.treePath && pi1.treePath === pi2.treePath) return true;
    } catch (e) {}
    try {
      if (pi1.getMediaPath && pi2.getMediaPath) {
        var p1 = MSP.FS ? MSP.FS.normalizePath(pi1.getMediaPath()) : __msp_normPath(pi1.getMediaPath());
        var p2 = MSP.FS ? MSP.FS.normalizePath(pi2.getMediaPath()) : __msp_normPath(pi2.getMediaPath());
        if (p1 && p2 && p1 === p2) return true;
      }
    } catch (e) {}
    try {
      if (pi1.name && pi2.name && pi1.name === pi2.name) return true;
    } catch (e) {}
    return false;
  }

  function findTrackItem(track, projectItem, startSeconds) {
    var clips = track.clips;
    var best = null;
    var bestDiff = 999999;

    for (var i = 0; i < clips.numItems; i++) {
      var c = clips[i];
      if (!c) continue;
      try {
        var isSame = false;
        if (c.projectItem) {
          isSame = isSameProjectItem(c.projectItem, projectItem);
        }
        if (!isSame && c.name && projectItem.name) {
          isSame = c.name === projectItem.name;
        }
        if (isSame) {
          var diff = Math.abs(c.start.seconds - startSeconds);
          if (diff < bestDiff) {
            best = c;
            bestDiff = diff;
          }
        }
      } catch (e) {}
    }

    if (best && bestDiff < 1.0) {
      return best;
    }

    best = null;
    bestDiff = 999999;
    for (var j = 0; j < clips.numItems; j++) {
      var cj = clips[j];
      if (!cj) continue;
      try {
        var d = Math.abs(cj.start.seconds - startSeconds);
        if (d < bestDiff) {
          best = cj;
          bestDiff = d;
        }
      } catch (e) {}
    }

    return bestDiff < 0.5 ? best : null;
  }

  function applyTrimming(clip, endSeconds, duration) {
    var trimmed = false;

    // Pass 1: Set clip.end with Time object
    try {
      var tEnd = new Time();
      tEnd.seconds = endSeconds;
      clip.end = tEnd;
      trimmed = true;
    } catch (trimErr1) {}

    // Pass 2: Set clip.outPoint with Time object
    if (!trimmed || (clip.end && Math.abs(clip.end.seconds - endSeconds) > 0.05)) {
      try {
        var inSec = (clip.inPoint && typeof clip.inPoint.seconds === "number") ? clip.inPoint.seconds : 0;
        var tOut = new Time();
        tOut.seconds = inSec + duration;
        clip.outPoint = tOut;
        trimmed = true;
      } catch (trimErr2) {}
    }

    // Pass 3: Direct assignment to clip.end.seconds
    if (!trimmed) {
      try {
        clip.end.seconds = endSeconds;
        trimmed = true;
      } catch (trimErr3) {}
    }

    return trimmed;
  }

  function placeSlides(trackNumber, sourceMode, placementMode, scaleToFrame) {
    if (!placementMode) placementMode = "standard";
    var doScale =
      scaleToFrame === undefined ||
      scaleToFrame === null ||
      scaleToFrame === "" ||
      scaleToFrame === true ||
      scaleToFrame === "true" ||
      scaleToFrame === 1;

    try {
      var seq = MSP.Timeline ? MSP.Timeline.getActiveSequence() : __msp_getActiveSequence();
      if (!seq) {
        return (MSP.JSON ? MSP.JSON.err : __msp_err)(
          "No active sequence. Open the sequence with your markers first."
        );
      }

      var trackIndex = parseInt(trackNumber, 10) - 1;
      if (isNaN(trackIndex) || trackIndex < 0) {
        return (MSP.JSON ? MSP.JSON.err : __msp_err)("Invalid video track number.");
      }
      if (!seq.videoTracks || trackIndex >= seq.videoTracks.numTracks) {
        return (MSP.JSON ? MSP.JSON.err : __msp_err)(
          "V" + (trackIndex + 1) + " does not exist in this sequence."
        );
      }

      var res = MSP.Timeline
        ? MSP.Timeline.getResolvedMarkers(seq, sourceMode)
        : __msp_getResolvedMarkers(seq, sourceMode);
      var markers = res.markers;

      // Calculate segments via Guardrails module
      var segRes = MSP.Guardrails.calculateSegments(
        markers,
        placementMode,
        res.audioEnd,
        res.sourceName
      );
      if (!segRes.ok) {
        return (MSP.JSON ? MSP.JSON.err : __msp_err)(segRes.error);
      }
      var segments = segRes.segments;

      var folder = Folder.selectDialog(
        "Choose the folder containing your exported PowerPoint slides"
      );
      if (!folder) return (MSP.JSON ? MSP.JSON.err : __msp_err)("Folder selection cancelled.");

      var files = MSP.FS ? MSP.FS.collectImageFiles(folder) : __msp_collectImageFiles(folder);
      if (!files.length) {
        return (MSP.JSON ? MSP.JSON.err : __msp_err)(
          "No supported image files (PNG, JPG, JPEG, WEBP, BMP, TIF) found in: " +
            folder.name
        );
      }

      // Enforce Strict Count Guardrail
      var guardrailCheck = MSP.Guardrails.validateSlideCount(
        files.length,
        segments.length,
        placementMode,
        markers.length
      );
      if (!guardrailCheck.ok) {
        return (MSP.JSON ? MSP.JSON.err : __msp_err)(guardrailCheck.error);
      }

      // Project Bin Isolation
      var slideBin = MSP.FS ? MSP.FS.getOrCreateSlideBin(folder.name) : __msp_getOrCreateSlideBin(folder.name);

      var toImport = [];
      for (var f = 0; f < files.length; f++) {
        var existing = MSP.FS
          ? MSP.FS.findItemByPath(app.project.rootItem, files[f].fsName)
          : __msp_findItemByPath(app.project.rootItem, files[f].fsName);
        if (!existing) {
          toImport.push(files[f].fsName);
        }
      }

      if (toImport.length) {
        var ok = app.project.importFiles(toImport, true, slideBin, false);
        if (!ok) {
          return (MSP.JSON ? MSP.JSON.err : __msp_err)(
            "Premiere failed to import slides into project bin '" +
              slideBin.name +
              "'."
          );
        }
      }

      var imported = [];
      for (var r = 0; r < files.length; r++) {
        var pi = MSP.FS
          ? MSP.FS.findItemByPath(app.project.rootItem, files[r].fsName)
          : __msp_findItemByPath(app.project.rootItem, files[r].fsName);
        if (!pi) {
          return (MSP.JSON ? MSP.JSON.err : __msp_err)("Could not find imported slide: " + files[r].name);
        }
        imported.push(pi);
      }

      var track = seq.videoTracks[trackIndex];
      var results = [];

      // Begin Undo Scope
      try {
        if (app.enableUndoScope) {
          app.enableUndoScope("Marker Slide Placer: Place Slides");
        }
      } catch (eUndo1) {}

      for (var i = 0; i < segments.length; i++) {
        var start = segments[i].start;
        var end = segments[i].end;
        if (end <= start) {
          return (MSP.JSON ? MSP.JSON.err : __msp_err)(
            "Invalid timing at slide " +
              (i + 1) +
              ": start (" +
              start.toFixed(3) +
              "s) >= end (" +
              end.toFixed(3) +
              "s)."
          );
        }

        var placed = track.overwriteClip(imported[i], start);
        if (!placed) {
          return (MSP.JSON ? MSP.JSON.err : __msp_err)(
            "Could not place slide " + (i + 1) + ": " + files[i].name
          );
        }

        var clip = findTrackItem(track, imported[i], start);
        if (!clip) {
          return (MSP.JSON ? MSP.JSON.err : __msp_err)(
            "Slide " +
              (i + 1) +
              " was placed, but resulting clip could not be located for trimming."
          );
        }

        if (doScale) {
          try {
            if (typeof clip.setScaleToFrameSize === "function") {
              clip.setScaleToFrameSize();
            }
          } catch (eScale) {}
        }

        var dur = end - start;
        var trimmed = applyTrimming(clip, end, dur);
        if (!trimmed) {
          return (MSP.JSON ? MSP.JSON.err : __msp_err)(
            "Slide " +
              (i + 1) +
              " was placed but could not be trimmed to " +
              end.toFixed(3) +
              "s."
          );
        }

        results.push({ file: files[i].name, start: start, end: end });
      }

      var toJson = MSP.JSON ? MSP.JSON.toJson : __msp_toJson;
      return toJson({
        ok: true,
        count: results.length,
        track: "V" + (trackIndex + 1),
        sequence: seq.name,
        source: res.sourceName,
        placementMode:
          placementMode === "extend"
            ? "Extend to End (N Slides)"
            : "Standard (N-1 Slides)",
        bin: slideBin.name || "_Slides",
        folder: folder.fsName,
        results: results,
      });
    } catch (e) {
      return (MSP.JSON ? MSP.JSON.err : __msp_err)(e);
    }
  }

  MSP.Engine = {
    isSameProjectItem: isSameProjectItem,
    findTrackItem: findTrackItem,
    applyTrimming: applyTrimming,
    placeSlides: placeSlides,
  };

  // Backwards compatibility aliases
  if (typeof __msp_findTrackItem === "undefined") {
    __msp_findTrackItem = findTrackItem;
    __msp_isSameProjectItem = isSameProjectItem;
  }
})();
