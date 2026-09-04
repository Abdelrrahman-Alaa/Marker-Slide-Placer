// ====================================================
// Module: MSP.Timeline (Timeline & Audio Clip Scanner)
// Scans Premiere Sequences, Tracks, and Audio Markers
// ====================================================
var MSP = MSP || {};

(function () {
  function getActiveSequence() {
    return (typeof app !== "undefined" && app && app.project) ? app.project.activeSequence : null;
  }

  function extractMarkersFromProjectItem(pi) {
    var nativeList = [];
    var xmpList = [];
    if (!pi) return nativeList;

    // 1. Try Native pi.getMarkers()
    try {
      if (typeof pi.getMarkers === "function") {
        var mc = pi.getMarkers();
        if (mc) {
          var m2 = mc.getFirstMarker();
          while (m2) {
            var s2 = MSP.XMP ? MSP.XMP.getMarkerTime(m2) : __msp_getMarkerTime(m2);
            nativeList.push({
              name: m2.name || "",
              start: s2,
              comments: m2.comments || "",
              source: "Clip Marker",
            });
            m2 = mc.getNextMarker(m2);
          }
        }
      }
    } catch (e2) {}

    // 2. Try Native pi.markers
    if (nativeList.length === 0) {
      try {
        if (pi.markers) {
          var m = pi.markers.getFirstMarker();
          while (m) {
            var s = MSP.XMP ? MSP.XMP.getMarkerTime(m) : __msp_getMarkerTime(m);
            nativeList.push({
              name: m.name || "",
              start: s,
              comments: m.comments || "",
              source: "Clip Marker",
            });
            m = pi.markers.getNextMarker(m);
          }
        }
      } catch (e1) {}
    }

    // 3. Extract from XMP Metadata
    try {
      if (pi.getXMPMetadata) {
        var xmp = pi.getXMPMetadata();
        if (xmp && xmp.length > 0) {
          xmpList = MSP.XMP ? MSP.XMP.parseMarkers(xmp) : __msp_parseXMPMarkers(xmp);
        }
      }
    } catch (eXmp) {}

    // Pick source with most distinct timestamps
    var countDistinct = MSP.XMP ? MSP.XMP.countDistinctTimes : __msp_countDistinctTimes;
    var nativeDistinct = countDistinct(nativeList);
    var xmpDistinct = countDistinct(xmpList);

    if (xmpDistinct > nativeDistinct) {
      return xmpList;
    } else if (nativeDistinct > 0) {
      return nativeList;
    } else if (xmpList.length > 0) {
      return xmpList;
    }

    return nativeList;
  }

  function extractMarkersFromTrackItem(clip) {
    var out = [];
    if (!clip) return out;

    var clipStart = (clip.start && typeof clip.start.seconds === "number") ? clip.start.seconds : 0;
    var clipEnd = (clip.end && typeof clip.end.seconds === "number") ? clip.end.seconds : 0;
    var clipDur = (clip.duration && typeof clip.duration.seconds === "number" && clip.duration.seconds > 0)
      ? clip.duration.seconds
      : (clipEnd > clipStart ? clipEnd - clipStart : 0);

    var clipIn = (clip.inPoint && typeof clip.inPoint.seconds === "number" && clip.inPoint.seconds > 0)
      ? clip.inPoint.seconds
      : 0;
    var clipOut = (clip.outPoint && typeof clip.outPoint.seconds === "number" && clip.outPoint.seconds > (clipIn + 0.1))
      ? clip.outPoint.seconds
      : (clipDur > 0 ? clipIn + clipDur : 999999);

    // 1. Get rich markers from underlying ProjectItem
    var piMarkers = [];
    if (clip.projectItem) {
      piMarkers = extractMarkersFromProjectItem(clip.projectItem);
    }

    // 2. Get timeline-specific clip markers
    var itemMarkers = [];
    try {
      if (clip.markers) {
        var m = clip.markers.getFirstMarker();
        while (m) {
          var s = MSP.XMP ? MSP.XMP.getMarkerTime(m) : __msp_getMarkerTime(m);
          itemMarkers.push({
            name: m.name || "",
            start: s,
            comments: m.comments || "",
            source: "TrackItem.markers",
          });
          m = clip.markers.getNextMarker(m);
        }
      }
    } catch (e1) {}

    var countDistinct = MSP.XMP ? MSP.XMP.countDistinctTimes : __msp_countDistinctTimes;
    var piDistinct = countDistinct(piMarkers);
    var itemDistinct = countDistinct(itemMarkers);
    var sourceList = piDistinct >= itemDistinct ? piMarkers : itemMarkers;

    for (var i = 0; i < sourceList.length; i++) {
      var rm = sourceList[i];
      var markerTime = rm.start; // 1:1 real seconds
      if (markerTime >= clipIn - 0.2 && markerTime <= clipOut + 0.2) {
        var timelinePos = clipStart + (markerTime - clipIn);
        if (timelinePos >= -0.001) {
          out.push({
            name: rm.name,
            start: timelinePos,
            comments: rm.comments,
            source: "Clip Marker (" + (clip.name || "Audio") + ")",
          });
        }
      }
    }

    return out;
  }

  function getSelectedClips(seq) {
    var selected = [];
    try {
      if (seq && seq.getSelection) {
        var sel = seq.getSelection();
        if (sel && sel.length) {
          for (var i = 0; i < sel.length; i++) {
            if (sel[i]) selected.push(sel[i]);
          }
        }
      }
    } catch (e) {}
    return selected;
  }

  function collectSequenceMarkers(seq) {
    var out = [];
    if (!seq || !seq.markers) return out;
    var mc = seq.markers;
    var m = mc.getFirstMarker();
    while (m) {
      var s = MSP.XMP ? MSP.XMP.getMarkerTime(m) : __msp_getMarkerTime(m);
      out.push({
        name: m.name || "",
        start: s,
        comments: m.comments || "",
        source: "Sequence Timeline",
      });
      m = mc.getNextMarker(m);
    }
    return out;
  }

  function collectAllClipMarkers(seq) {
    var allClipMarkers = [];
    var diagLogs = [];

    // 1. Check selected clips first
    var selClips = getSelectedClips(seq);
    if (selClips.length > 0) {
      diagLogs.push("Checking " + selClips.length + " selected clip(s)...");
      for (var s = 0; s < selClips.length; s++) {
        var sm = extractMarkersFromTrackItem(selClips[s]);
        if (sm.length > 0) {
          diagLogs.push("Selected clip '" + (selClips[s].name || "unnamed") + "': " + sm.length + " marker(s)");
          for (var smi = 0; smi < sm.length; smi++) allClipMarkers.push(sm[smi]);
        }
      }
    }

    // 2. Scan audio tracks
    var markerClipEnd = 0;
    if (seq.audioTracks) {
      diagLogs.push("Scanning " + seq.audioTracks.numTracks + " audio track(s)...");
      for (var t = 0; t < seq.audioTracks.numTracks; t++) {
        var track = seq.audioTracks[t];
        for (var c = 0; c < track.clips.numItems; c++) {
          var clip = track.clips[c];
          var cm = extractMarkersFromTrackItem(clip);
          if (cm.length > 0 && clip.end && typeof clip.end.seconds === "number") {
            if (clip.end.seconds > markerClipEnd) {
              markerClipEnd = clip.end.seconds;
            }
          }
          diagLogs.push("Track A" + (t + 1) + " Clip '" + (clip.name || "unnamed") + "': " + cm.length + " marker(s) found");
          for (var cmi = 0; cmi < cm.length; cmi++) {
            allClipMarkers.push(cm[cmi]);
          }
        }
      }
    }

    // 3. Scan video tracks if no audio markers found
    if (allClipMarkers.length === 0 && seq.videoTracks) {
      diagLogs.push("Scanning video tracks...");
      for (var vt = 0; vt < seq.videoTracks.numTracks; vt++) {
        var vtrack = seq.videoTracks[vt];
        for (var vc = 0; vc < vtrack.clips.numItems; vc++) {
          var vclip = vtrack.clips[vc];
          var vm = extractMarkersFromTrackItem(vclip);
          if (vm.length > 0) {
            diagLogs.push("Track V" + (vt + 1) + " Clip '" + (vclip.name || "unnamed") + "': " + vm.length + " marker(s)");
            for (var vmi = 0; vmi < vm.length; vmi++) allClipMarkers.push(vm[vmi]);
          }
        }
      }
    }

    // 4. Fallback to Project selection
    if (allClipMarkers.length === 0 && app.project && app.project.getSelection) {
      try {
        var projSel = app.project.getSelection();
        if (projSel && projSel.length > 0) {
          diagLogs.push("Checking " + projSel.length + " item(s) selected in Project bin...");
          for (var p = 0; p < projSel.length; p++) {
            var piMarkers = extractMarkersFromProjectItem(projSel[p]);
            if (piMarkers.length > 0) {
              diagLogs.push("Project Item '" + (projSel[p].name || "unnamed") + "': " + piMarkers.length + " marker(s)");
              for (var pmi = 0; pmi < piMarkers.length; pmi++) {
                allClipMarkers.push({
                  name: piMarkers[pmi].name,
                  start: piMarkers[pmi].start,
                  comments: piMarkers[pmi].comments,
                  source: "Project Item (" + (projSel[p].name || "Audio") + ")",
                });
              }
            }
          }
        }
      } catch (eProj) {}
    }

    allClipMarkers.sort(function (a, b) {
      return a.start - b.start;
    });

    var deduped = [];
    for (var d = 0; d < allClipMarkers.length; d++) {
      if (d === 0 || Math.abs(allClipMarkers[d].start - deduped[deduped.length - 1].start) > 0.005) {
        deduped.push(allClipMarkers[d]);
      }
    }

    var detectedAudioEnd = 0;
    if (seq.audioTracks) {
      for (var at = 0; at < seq.audioTracks.numTracks; at++) {
        var aTrk = seq.audioTracks[at];
        for (var ac = 0; ac < aTrk.clips.numItems; ac++) {
          var aClip = aTrk.clips[ac];
          if (aClip.end && typeof aClip.end.seconds === "number" && aClip.end.seconds > detectedAudioEnd) {
            detectedAudioEnd = aClip.end.seconds;
          }
        }
      }
    }

    var finalAudioEnd = markerClipEnd > 0 ? markerClipEnd : detectedAudioEnd;

    return {
      markers: deduped,
      diag: diagLogs,
      audioEnd: finalAudioEnd,
    };
  }

  function getResolvedMarkers(seq, sourceMode) {
    if (!sourceMode) sourceMode = "auto";
    var seqMarkers = collectSequenceMarkers(seq);
    var clipData = collectAllClipMarkers(seq);
    var clipMarkers = clipData.markers;
    var audioEnd = clipData.audioEnd || 0;

    if (sourceMode === "sequence") {
      return {
        sourceName: "Timeline (Sequence Markers)",
        markers: seqMarkers,
        diag: clipData.diag,
        audioEnd: audioEnd,
      };
    } else if (sourceMode === "clip") {
      return {
        sourceName: clipMarkers.length > 0 ? clipMarkers[0].source : "Audio Clip Markers",
        markers: clipMarkers,
        diag: clipData.diag,
        audioEnd: audioEnd,
      };
    } else {
      if (clipMarkers.length >= 2) {
        return {
          sourceName: "Auto: " + (clipMarkers[0].source || "Audio Clip Markers"),
          markers: clipMarkers,
          diag: clipData.diag,
          audioEnd: audioEnd,
        };
      } else if (seqMarkers.length >= 2) {
        return {
          sourceName: "Auto: Timeline Markers",
          markers: seqMarkers,
          diag: clipData.diag,
          audioEnd: audioEnd,
        };
      } else if (clipMarkers.length > 0) {
        return {
          sourceName: "Auto: " + (clipMarkers[0].source || "Audio Clip Markers"),
          markers: clipMarkers,
          diag: clipData.diag,
          audioEnd: audioEnd,
        };
      } else {
        return {
          sourceName: "Auto: Timeline Markers",
          markers: seqMarkers,
          diag: clipData.diag,
          audioEnd: audioEnd,
        };
      }
    }
  }

  MSP.Timeline = {
    getActiveSequence: getActiveSequence,
    extractFromProjectItem: extractMarkersFromProjectItem,
    extractFromTrackItem: extractMarkersFromTrackItem,
    getSelectedClips: getSelectedClips,
    collectSequenceMarkers: collectSequenceMarkers,
    collectAllClipMarkers: collectAllClipMarkers,
    getResolvedMarkers: getResolvedMarkers,
  };

  // Backwards compatibility aliases
  if (typeof __msp_getActiveSequence === "undefined") {
    __msp_getActiveSequence = getActiveSequence;
    __msp_extractMarkersFromProjectItem = extractMarkersFromProjectItem;
    __msp_extractMarkersFromTrackItem = extractMarkersFromTrackItem;
    __msp_getSelectedClips = getSelectedClips;
    __msp_collectSequenceMarkers = collectSequenceMarkers;
    __msp_collectAllClipMarkers = collectAllClipMarkers;
    __msp_getResolvedMarkers = getResolvedMarkers;
  }
})();
