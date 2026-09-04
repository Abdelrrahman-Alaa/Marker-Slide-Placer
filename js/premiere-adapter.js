// ====================================================
// Module: PremiereAdapter (CEP Host Adapter Seam)
// Async Promise Wrapper around Adobe ExtendScript Engine
// ====================================================

(function (global) {
  "use strict";

  var DEFAULT_TIMEOUT_MS = 20000;

  function isAvailable() {
    return !!(
      global.__adobe_cep__ &&
      typeof global.__adobe_cep__.evalScript === "function"
    );
  }

  function callHost(script, timeoutMs) {
    var timeout = typeof timeoutMs === "number" ? timeoutMs : DEFAULT_TIMEOUT_MS;

    return new Promise(function (resolve, reject) {
      if (!isAvailable()) {
        return reject(
          new Error("CEP bridge unavailable. Please run inside Premiere Pro.")
        );
      }

      var done = false;
      var timer = null;

      if (timeout > 0) {
        timer = setTimeout(function () {
          if (!done) {
            done = true;
            reject(new Error("Host request timed out after " + (timeout / 1000) + "s."));
          }
        }, timeout);
      }

      try {
        global.__adobe_cep__.evalScript(script, function (rawResponse) {
          if (done) return;
          done = true;
          if (timer) clearTimeout(timer);

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
          if (timer) clearTimeout(timer);
          reject(err);
        }
      }
    });
  }

  var PremiereAdapter = {
    isAvailable: isAvailable,

    selectFolder: function (title, initialPath) {
      return new Promise(function (resolve, reject) {
        try {
          var cepFs = (global.cep && global.cep.fs) || (global.window && global.window.cep && global.window.cep.fs);
          if (cepFs && typeof cepFs.showOpenDialogEx === "function") {
            var result = cepFs.showOpenDialogEx(
              false, // allowMultipleSelection
              true,  // chooseDirectory
              title || "Choose the folder containing your exported PowerPoint slides",
              initialPath || "",
              []
            );
            if (result && result.err === 0 && result.data && result.data.length > 0) {
              resolve(result.data[0]);
            } else {
              resolve(null);
            }
          } else {
            resolve(null);
          }
        } catch (e) {
          reject(e);
        }
      });
    },

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
      var folderPath = options.folderPath || "";
      var timeout = typeof options.timeoutMs === "number" ? options.timeoutMs : 120000;

      var script =
        "mspPlaceSlides(" +
        track +
        ", '" +
        src +
        "', '" +
        mode +
        "', " +
        scale +
        ", " +
        JSON.stringify(folderPath) +
        ")";

      return callHost(script, timeout);
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
