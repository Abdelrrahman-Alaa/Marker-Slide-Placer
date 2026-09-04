// ====================================================
// Module: MSP.JSON (Pure ES3 JSON Serializer)
// 100% ExtendScript Compatible & Node.js Testable
// ====================================================
var MSP = MSP || {};

(function () {
  function escapeStr(str) {
    if (str === null || str === undefined) return "null";
    return (
      '"' +
      String(str)
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\r/g, "\\r")
        .replace(/\n/g, "\\n")
        .replace(/\t/g, "\\t") +
      '"'
    );
  }

  function toJson(obj) {
    if (obj === null || obj === undefined) return "null";
    if (typeof obj === "number" || typeof obj === "boolean") return String(obj);
    if (typeof obj === "string") return escapeStr(obj);
    if (obj instanceof Array) {
      var arrStr = [];
      for (var i = 0; i < obj.length; i++) {
        arrStr.push(toJson(obj[i]));
      }
      return "[" + arrStr.join(",") + "]";
    }
    if (typeof obj === "object") {
      var props = [];
      for (var k in obj) {
        if (obj.hasOwnProperty(k)) {
          props.push(escapeStr(k) + ":" + toJson(obj[k]));
        }
      }
      return "{" + props.join(",") + "}";
    }
    return '""';
  }

  function err(msg) {
    return '{"ok":false,"error":' + escapeStr(String(msg)) + "}";
  }

  MSP.JSON = {
    escape: escapeStr,
    toJson: toJson,
    err: err,
  };

  // Backwards compatibility aliases
  if (typeof __msp_toJson === "undefined") {
    __msp_toJson = toJson;
    __msp_jsonEscape = escapeStr;
    __msp_err = err;
  }
})();

// Export for Node.js unit testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = MSP.JSON;
}
