// ====================================================
// Module: MSP.Guardrails (Timing & Slide Count Guardrails)
// Dual-Mode Segmentation & Strict Count Validation
// ====================================================
var MSP = MSP || {};

(function () {
  function calculateSegments(markers, placementMode, audioEnd, sourceName) {
    if (!placementMode) placementMode = "standard";
    if (!sourceName) sourceName = "active source";
    var segments = [];

    if (!markers || markers.length === 0) {
      return {
        ok: false,
        error: "No markers found from " + sourceName + ". Make sure your audio clip has markers.",
      };
    }

    if (placementMode === "extend") {
      // Extend to End Mode: N markers -> N slides ending at audioEnd
      var lastMarkerTime = markers[markers.length - 1].start;
      var effectiveAudioEnd = audioEnd || 0;
      if (effectiveAudioEnd <= lastMarkerTime) {
        effectiveAudioEnd = lastMarkerTime + 10.0;
      }

      for (var s = 0; s < markers.length; s++) {
        var sStart = markers[s].start;
        var sEnd = (s < markers.length - 1) ? markers[s + 1].start : effectiveAudioEnd;
        segments.push({ start: sStart, end: sEnd });
      }
    } else {
      // Standard Mode: N markers -> N-1 slides between markers
      if (markers.length < 2) {
        return {
          ok: false,
          error:
            "Standard Mode requires at least 2 markers (found " +
            markers.length +
            " from " +
            sourceName +
            "). Each slide is placed between consecutive markers. If you want a slide after the last marker, switch Placement Mode to 'Extend to End'.",
        };
      }
      for (var s2 = 0; s2 < markers.length - 1; s2++) {
        var sStart2 = markers[s2].start;
        var sEnd2 = markers[s2 + 1].start;
        segments.push({ start: sStart2, end: sEnd2 });
      }
    }

    return {
      ok: true,
      segments: segments,
    };
  }

  function validateSlideCount(fileCount, segmentCount, placementMode, markerCount) {
    if (fileCount !== segmentCount) {
      var modeLabel =
        placementMode === "extend"
          ? "Extend to End (N Slides)"
          : "Standard (N-1 Slides)";
      return {
        ok: false,
        error:
          "Slide Count Mismatch!\n\n" +
          "Placement Mode: " +
          modeLabel +
          "\n" +
          "Images found in folder: " +
          fileCount +
          "\n" +
          "Required slides by markers: " +
          segmentCount +
          " (from " +
          markerCount +
          " markers)\n\n" +
          (placementMode === "standard"
            ? "Tip: Standard Mode needs N-1 slides for N markers. If you have " +
              fileCount +
              " slides, switch Placement Mode to 'Extend to End'."
            : "Tip: Extend Mode needs N slides for N markers. Please verify your slide export folder."),
      };
    }
    return { ok: true };
  }

  MSP.Guardrails = {
    calculateSegments: calculateSegments,
    validateSlideCount: validateSlideCount,
  };
})();

// Export for Node.js unit testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = MSP.Guardrails;
}
