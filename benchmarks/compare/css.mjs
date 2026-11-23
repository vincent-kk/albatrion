// Stylesheet stub for render rows: UI libraries import .css files, which Node cannot load.
// Import it before the library; every .css import or require then yields an empty module.
import { registerHooks } from "node:module";

registerHooks({
  load: (url, context, nextLoad) =>
    url.endsWith(".css")
      ? { format: "commonjs", source: "", shortCircuit: true }
      : nextLoad(url, context),
});
