---
"@canard/schema-form": patch
---

A `registerPlugin` call that throws now applies no part of the plugin. Before, an invalid `fieldInputDefinitions` entry threw after the plugin's renderers were already active, so the app kept running with a half-applied plugin.
