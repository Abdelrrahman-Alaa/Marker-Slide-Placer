// ====================================================
// Module: App (Panel UI Controller)
// DOM Binding, Events & Presentation Management
// ====================================================

(function () {
  "use strict";

  var connPill = document.getElementById("connPill");
  var cardSeq = document.getElementById("cardSeq");
  var cardMarkers = document.getElementById("cardMarkers");
  var cardRequired = document.getElementById("cardRequired");
  var cardSource = document.getElementById("cardSource");

  var sourceSelect = document.getElementById("markerSource");
  var modeSelect = document.getElementById("placementMode");
  var trackSelect = document.getElementById("track");
  var scaleCheckbox = document.getElementById("scaleToFrame");
  var alertBox = document.getElementById("alertBox");

  var cachedMarkersCount = 0;

  function showAlert(msg, type) {
    alertBox.className = "alert show alert-" + (type || "info");
    alertBox.textContent = msg;
  }

  function hideAlert() {
    alertBox.className = "alert";
    alertBox.textContent = "";
  }

  function updateRequiredCountDisplay() {
    var mode = modeSelect.value;
    var count = cachedMarkersCount;
    if (count <= 0) {
      cardRequired.textContent = "-";
      return;
    }
    var req = mode === "extend" ? count : Math.max(0, count - 1);
    cardRequired.textContent = req + (mode === "extend" ? " (N)" : " (N-1)");
  }

  async function scanMarkers(silent) {
    var src = sourceSelect.value;
    var mode = modeSelect.value;
    if (!silent) {
      showAlert("Scanning sequence and audio markers...", "info");
    }

    try {
      var data = await PremiereAdapter.scanMarkers(src, mode);
      cachedMarkersCount = data.count || 0;
      cardMarkers.textContent = cachedMarkersCount + " markers";
      cardSource.textContent = data.source || "Audio Clip";
      updateRequiredCountDisplay();

      if (!silent) {
        if (cachedMarkersCount === 0) {
          showAlert(
            "No markers detected in active sequence or audio clips.\nTip: In Audition, ensure 'Include markers and other metadata' is enabled when saving.",
            "error"
          );
        } else {
          var req = mode === "extend" ? cachedMarkersCount : Math.max(0, cachedMarkersCount - 1);
          showAlert(
            "Scan Complete ✅\nFound " +
              cachedMarkersCount +
              " markers from " +
              data.source +
              ".\nRequires exactly " +
              req +
              " slide images (" +
              (mode === "extend" ? "Extend to End Mode" : "Standard Mode") +
              ").",
            "success"
          );
        }
      }
    } catch (err) {
      if (!silent) {
        showAlert(err.message, "error");
      }
      cardMarkers.textContent = "0";
      cardRequired.textContent = "-";
    }
  }

  async function initConnection() {
    try {
      var data = await PremiereAdapter.testConnection();
      connPill.className = "conn-pill conn-connected";
      connPill.textContent = "● Connected";

      // Extract active sequence name if available
      var match = data.message.match(/Active Sequence:\s*(.+)/);
      if (match && match[1]) {
        cardSeq.textContent = match[1].trim();
      } else {
        cardSeq.textContent = "Open a sequence";
      }

      // Initial silent scan
      scanMarkers(true);
    } catch (err) {
      connPill.className = "conn-pill conn-disconnected";
      connPill.textContent = "● Error";
      showAlert(err.message, "error");
    }
  }

  // Event Handlers
  modeSelect.addEventListener("change", function () {
    updateRequiredCountDisplay();
  });

  sourceSelect.addEventListener("change", function () {
    scanMarkers(false);
  });

  document.getElementById("markers").addEventListener("click", function () {
    scanMarkers(false);
  });

  document.getElementById("copyMarkers").addEventListener("click", async function () {
    showAlert("Copying clip markers to timeline ruler...", "info");
    try {
      var data = await PremiereAdapter.copyMarkersToTimeline();
      showAlert(data.message, "success");
    } catch (err) {
      showAlert(err.message, "error");
    }
  });

  document.getElementById("place").addEventListener("click", async function () {
    var track = trackSelect.value;
    var src = sourceSelect.value;
    var mode = modeSelect.value;
    var scale = scaleCheckbox.checked;

    showAlert("Please select your exported PowerPoint slides folder...", "info");

    try {
      var data = await PremiereAdapter.placeSlides({
        track: track,
        sourceMode: src,
        placementMode: mode,
        scaleToFrame: scale,
      });

      var summaryMsg =
        "SUCCESS ✅\n" +
        "Placed " +
        data.count +
        " slides on " +
        data.track +
        "\n" +
        "Mode: " +
        data.placementMode +
        "\n" +
        "Project Bin: " +
        (data.bin || "_Slides") +
        "\n\n" +
        "Slides are accurately placed and trimmed across your markers!";
      showAlert(summaryMsg, "success");
    } catch (err) {
      showAlert("Placement Failed ❌\n\n" + err.message, "error");
    }
  });

  document.getElementById("debug").addEventListener("click", async function () {
    showAlert("Running detailed diagnostics...", "info");
    try {
      var debugReport = await PremiereAdapter.inspectDebug();
      showAlert(debugReport, "info");
    } catch (err) {
      showAlert("Diagnostic error:\n" + err.message, "error");
    }
  });

  // Initialize on panel load
  initConnection();
})();
