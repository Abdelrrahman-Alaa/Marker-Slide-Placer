# Issue 04: Decouple Panel UI into CSS, Host Adapter & App Modules

Status: resolved
Blocked by: none (can run parallel or after 01-03)

## Context
`index.html` has 615 lines mixing CSS variables/classes (316 lines), HTML elements (90 lines), and JavaScript logic (206 lines) with direct `evalScript` string concatenation and timeout callbacks.

## Objectives
1. Extract all CSS into `css/panel.css`, maintaining the Adobe Creative Cloud Dark Theme aesthetic.
2. Extract the CEP bridge logic into `js/premiere-adapter.js` exposing a clean Promise-based interface (`testConnection`, `scanMarkers`, `placeSlides`, `copyMarkersToTimeline`, `inspectDebug`).
3. Extract presentation and DOM event handlers into `js/app.js` using `async/await` and driving `PremiereAdapter`.
4. Streamline `index.html` to contain only clean, semantic HTML structure linking to `css/panel.css`, `js/csinterface.js`, `js/premiere-adapter.js`, and `js/app.js`.
