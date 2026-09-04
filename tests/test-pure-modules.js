// Automated Unit Tests for MSP.JSON and MSP.FS
const assert = require("assert");
const jsonUtil = require("../jsx/utils/json.jsx");
const fsUtil = require("../jsx/utils/fs.jsx");

console.log("--- Running Issue 01 Unit Tests ---");

// Test MSP.JSON
const sampleObj = { ok: true, count: 42, title: 'Hello "World"\nNew line', items: [1, "two", { nested: true }] };
const jsonStr = jsonUtil.toJson(sampleObj);
const parsed = JSON.parse(jsonStr);
assert.strictEqual(parsed.ok, true);
assert.strictEqual(parsed.count, 42);
assert.strictEqual(parsed.title, 'Hello "World"\nNew line');
assert.strictEqual(parsed.items.length, 3);
assert.strictEqual(parsed.items[2].nested, true);
console.log("✅ MSP.JSON serialization passed");

// Test MSP.JSON.err
const errStr = jsonUtil.err("Test failure");
const parsedErr = JSON.parse(errStr);
assert.strictEqual(parsedErr.ok, false);
assert.strictEqual(parsedErr.error, "Test failure");
console.log("✅ MSP.JSON.err passed");

// Test MSP.FS.naturalCompare
const files = ["Slide10.png", "Slide2.png", "Slide1.png", "Slide20.png", "Slide3.png"];
files.sort(fsUtil.naturalCompare);
assert.deepStrictEqual(files, ["Slide1.png", "Slide2.png", "Slide3.png", "Slide10.png", "Slide20.png"]);
console.log("✅ MSP.FS.naturalCompare passed");

// Test MSP.FS.normalizePath
assert.strictEqual(fsUtil.normalizePath("C:\\Users\\User\\Folder/file.png"), "c:/users/user/folder/file.png");
console.log("✅ MSP.FS.normalizePath passed");

console.log("🎉 All Issue 01 tests passed successfully!");
