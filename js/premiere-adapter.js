// ====================================================
// Module: PremiereAdapter (CEP Host Adapter Seam)
// Async Promise Wrapper around Adobe ExtendScript Engine
// ====================================================

(function (global) {
  "use strict";

  var TIMEOUT_MS = 20000;

  function isAvailable() {
    return !!(
      global.__adobe_cep__ &&
      typeof global.__adobe_cep__.evalScript === "function"
    );
  }

  function callHost(script) {
    return new Promise(function (resolve, reject) {
      if (!isAvailable()) {
        return reject(
          new Error("CEP bridge unavailable. Please run inside Premiere Pro.")
        );
      }

      var done = false;
      var timer = setTimeout(function () {
        if (!done) {
          done = true;
          reject(new Error("Host request timed out after " + (TIMEOUT_MS / 1000) + "s."));
        }
      }, TIMEOUT_MS);

      try {
        global.__adobe_cep__.evalScript(script, function (rawResponse) {
          if (done) return;
          done = true;
          clearTimeout(timer);

          if (rawResponse === "EvalScript error." || rawResponse === undefined) {
            return reject(new Error("ExtendScript evaluation failed."));
          }

          try {
            var data = JSON.parse(rawResponse);
            if (!data.ok) {
              return reject(new Error(data.error || "Operation failed in Premiere."));
            }
            resolve(data);
          } catch (jsonErr) {
            reject(
              new Error("Failed to parse host response:\n" + rawResponse)
            );
          }
        });
      } catch (err) {
        if (!done) {
          done = true;
          clearTimeout(timer);
          reject(err);
        }
      }
    });
  }

  var PremiereAdapter = {
    isAvailable: isAvailable,

    testConnection: function () {
      return callHost("mspTestConnection()");
    },

    scanMarkers: function (sourceMode, placementMode) {
      var src = sourceMode || "auto";
      var mode = placementMode || "standard";
      return callHost("mspGetMarkersInfo('" + src + "', '" + mode + "')");
    },

    placeSlides: function (options) {
      options = options || {};
      var track = options.track || 1;
      var src = options.sourceMode || "auto";
      var mode = options.placementMode || "standard";
      var scale = options.scaleToFrame !== false;
      return callHost(
        "mspPlaceSlides(" + track + ", '" + src + "', '" + mode + "', " + scale + ")"
      );
    },

    copyMarkersToTimeline: function () {
      return callHost("mspCopyClipMarkersToTimeline()");
    },

    inspectDebug: function () {
      return callHost("mspDebugClipInfo()").then(function (res) {
        return res.debug || "";
      });
    },
  };

  global.PremiereAdapter = PremiereAdapter;
})(typeof window !== "undefined" ? window : this);
