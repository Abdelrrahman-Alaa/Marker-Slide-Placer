// ====================================================
// Module: MSP.FS (Filesystem & Path Utilities)
// Pure ES3 Natural Sorting & Project Bin Isolation
// ====================================================
var MSP = MSP || {};

(function () {
  function normPath(p) {
    return String(p || "").replace(/\\/g, "/").toLowerCase();
  }

  function naturalCompare(aStr, bStr) {
    var a = String(aStr || "").toLowerCase();
    var b = String(bStr || "").toLowerCase();

    var aChunks = a.match(/(\d+|\D+)/g) || [];
    var bChunks = b.match(/(\d+|\D+)/g) || [];

    var minLen = Math.min(aChunks.length, bChunks.length);
    for (var i = 0; i < minLen; i++) {
      var aChunk = aChunks[i];
      var bChunk = bChunks[i];

      var aIsNum = /^\d+$/.test(aChunk);
      var bIsNum = /^\d+$/.test(bChunk);

      if (aIsNum && bIsNum) {
        var aNum = parseInt(aChunk, 10);
        var bNum = parseInt(bChunk, 10);
        if (aNum !== bNum) {
          return aNum - bNum;
        }
        if (aChunk.length !== bChunk.length) {
          return aChunk.length - bChunk.length;
        }
      } else {
        if (aChunk !== bChunk) {
          return aChunk < bChunk ? -1 : 1;
        }
      }
    }

    return aChunks.length - bChunks.length;
  }

  function collectImageFiles(folder) {
    if (!folder || typeof folder.getFiles !== "function") return [];
    var files = folder.getFiles(function (f) {
      if (typeof File !== "undefined" && !(f instanceof File)) return false;
      var n = f.name.toLowerCase();
      return /\.(png|jpg|jpeg|webp|bmp|tif|tiff)$/i.test(n);
    });
    files.sort(function (a, b) {
      return naturalCompare(a.name, b.name);
    });
    return files;
  }

  function findItemByPath(folder, targetPath) {
    if (!folder || !folder.children) return null;
    var normTarget = normPath(targetPath);
    for (var i = 0; i < folder.children.numItems; i++) {
      var item = folder.children[i];
      if (!item) continue;
      if (typeof ProjectItemType !== "undefined" && item.type === ProjectItemType.BIN) {
        var found = findItemByPath(item, targetPath);
        if (found) return found;
      } else {
        try {
          if (item.getMediaPath && item.getMediaPath()) {
            if (normPath(item.getMediaPath()) === normTarget) {
              return item;
            }
          }
        } catch (e) {}
      }
    }
    return null;
  }

  function getOrCreateSlideBin(folderName) {
    if (!folderName) folderName = "Presentation";
    var binName = "_Slides_" + folderName;
    if (typeof app === "undefined" || !app.project || !app.project.rootItem) return null;
    var root = app.project.rootItem;
    if (!root || !root.children) return root;

    for (var i = 0; i < root.children.numItems; i++) {
      var item = root.children[i];
      if (item && typeof ProjectItemType !== "undefined" && item.type === ProjectItemType.BIN && item.name === binName) {
        return item;
      }
    }

    try {
      var newBin = root.createBin(binName);
      if (newBin) return newBin;
    } catch (e) {}

    return root;
  }

  MSP.FS = {
    normalizePath: normPath,
    naturalCompare: naturalCompare,
    collectImageFiles: collectImageFiles,
    findItemByPath: findItemByPath,
    getOrCreateSlideBin: getOrCreateSlideBin,
  };

  // Backwards compatibility aliases
  if (typeof __msp_normPath === "undefined") {
    __msp_normPath = normPath;
    __msp_naturalCompare = naturalCompare;
    __msp_collectImageFiles = collectImageFiles;
    __msp_findItemByPath = findItemByPath;
    __msp_getOrCreateSlideBin = getOrCreateSlideBin;
  }
})();

// Export for Node.js unit testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = MSP.FS;
}
