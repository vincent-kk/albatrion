// jsdom globals for render rows. Import it before react-dom so React sees a DOM.
import { JSDOM } from "jsdom";

const { window } = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost/",
  pretendToBeVisual: true,
});
for (const key of Object.getOwnPropertyNames(window))
  if (!(key in globalThis)) globalThis[key] = window[key];
globalThis.window = window;
globalThis.document = window.document;
