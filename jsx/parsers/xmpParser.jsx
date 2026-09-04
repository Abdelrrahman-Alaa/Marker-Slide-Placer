// ====================================================
// Module: MSP.XMP (Audition XMP Marker Parser)
// Universal In-Memory Timestamp & Timecode Extraction
// ====================================================
var MSP = MSP || {};

(function () {
  function parseTime(val, sampleRate) {
    if (!val) return 0;
    if (!sampleRate || sampleRate <= 0) sampleRate = 48000;
    val = String(val).replace(/^\s+|\s+$/g, "");

    // Format: s240000f48000 or s240000
    var sfMatch = val.match(/^s(\d+)(?:f(\d+))?$/i);
    if (sfMatch) {
      var smp = parseFloat(sfMatch[1]);
      var rt = parseFloat(sfMatch[2]) || sampleRate;
      return smp / rt;
    }

    // Format: 240000s48000f48000 or 240000s48000
    var sMatch = val.match(/^(\d+)s(\d+)(?:f(\d+))?$/i);
    if (sMatch) {
      var samples = parseFloat(sMatch[1]);
      var rate = parseFloat(sMatch[2]) || sampleRate;
      return samples / rate;
    }

    // Format: pure integer samples or ticks
    if (/^\d+$/.test(val)) {
      var num = parseFloat(val);
      if (num > 10000000000) return num / 254016000000;
      if (sampleRate > 0 && num > 1000) return num / sampleRate;
      return num;
    }

    // Format: 12.345 or 12.345s
    if (/^[\d\.]+s?$/i.test(val)) return parseFloat(val);

    // Format: 00:01:23:15 or 00:01:23.500
    var tcMatch = val.match(/^(\d{2}):(\d{2}):(\d{2})[:\.](\d+)$/);
    if (tcMatch) {
      var h = parseFloat(tcMatch[1]);
      var m = parseFloat(tcMatch[2]);
      var s = parseFloat(tcMatch[3]);
      var f = parseFloat(tcMatch[4]);
      return h * 3600 + m * 60 + s + (f > 99 ? f / 1000 : f / 30);
    }

    return parseFloat(val) || 0;
  }

  function countDistinctTimes(list) {
    if (!list || !list.length) return 0;
    var count = 0;
    var seen = {};
    for (var i = 0; i < list.length; i++) {
      var key = Math.round(list[i].start * 100);
      if (!seen[key]) {
        seen[key] = true;
        count++;
      }
    }
    return count;
  }

  function getMarkerTime(m) {
    if (!m) return 0;
    try {
      if (typeof m.start === "number") return m.start;
      if (m.start) {
        if (typeof m.start.seconds === "number" && m.start.seconds > 0) {
          return m.start.seconds;
        }
        if (typeof m.start.ticks === "string" || typeof m.start.ticks === "number") {
          var t = parseFloat(m.start.ticks);
          if (t > 0) return t / 254016000000;
        }
        if (typeof m.start.seconds === "number") {
          return m.start.seconds;
        }
      }
    } catch (e) {}
    return 0;
  }

  function parseMarkers(xmpStr) {
    var markers = [];
    if (!xmpStr) return markers;

    var sampleRate = 48000;
    var srMatch =
      xmpStr.match(/audioSampleRate="(\d+)"/i) ||
      xmpStr.match(/<[^>]*audioSampleRate[^>]*>(\d+)/i) ||
      xmpStr.match(/frameRate="f(\d+)"/i) ||
      xmpStr.match(/<[^>]*frameRate[^>]*>f(\d+)/i);
    if (srMatch && srMatch[1]) {
      var parsedSr = parseFloat(srMatch[1]);
      if (parsedSr > 0) sampleRate = parsedSr;
    }

    // 1. Match attributes startTime="..."
    var attrRegex = /startTime="([^"]+)"/gi;
    var match;
    while ((match = attrRegex.exec(xmpStr)) !== null) {
      var stVal = match[1];
      var pos = match.index;
      var context = xmpStr.substring(
        Math.max(0, pos - 150),
        Math.min(xmpStr.length, pos + 250)
      );
      var nameMatch =
        context.match(/name="([^"]+)"/i) ||
        context.match(/<[^>]*name[^>]*>([^<]+)/i);
      var name = nameMatch ? nameMatch[1] : "";
      var sec = parseTime(stVal, sampleRate);
      markers.push({
        name: name,
        start: sec,
        comments: "",
        source: "XMP",
      });
    }

    // 2. Match tags <xmpDM:startTime>...</xmpDM:startTime>
    var tagRegex = /<[^>]*startTime[^>]*>([^<]+)<\/[^>]*startTime>/gi;
    while ((match = tagRegex.exec(xmpStr)) !== null) {
      var tagVal = match[1];
      var pos2 = match.index;
      var context2 = xmpStr.substring(
        Math.max(0, pos2 - 150),
        Math.min(xmpStr.length, pos2 + 250)
      );
      var nameMatch2 =
        context2.match(/<[^>]*name[^>]*>([^<]+)/i) ||
        context2.match(/name="([^"]+)"/i);
      var name2 = nameMatch2 ? nameMatch2[1] : "";
      var sec2 = parseTime(tagVal, sampleRate);

      var exists = false;
      for (var k = 0; k < markers.length; k++) {
        if (Math.abs(markers[k].start - sec2) < 0.01) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        markers.push({
          name: name2,
          start: sec2,
          comments: "",
          source: "XMP",
        });
      }
    }

    markers.sort(function (a, b) {
      return a.start - b.start;
    });

    return markers;
  }

  MSP.XMP = {
    parseTime: parseTime,
    countDistinctTimes: countDistinctTimes,
    getMarkerTime: getMarkerTime,
    parseMarkers: parseMarkers,
  };

  // Backwards compatibility aliases
  if (typeof __msp_parseXMPMarkers === "undefined") {
    __msp_parseXMPMarkers = parseMarkers;
    __msp_getMarkerTime = getMarkerTime;
    __msp_countDistinctTimes = countDistinctTimes;
  }
})();

// Export for Node.js unit testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = MSP.XMP;
}
