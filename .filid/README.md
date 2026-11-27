# FCA audit scope

The source dependency graph models product module ownership. ESLint configurations and the React 18 Vitest configuration wire tools rather than product modules, so their exact configuration filenames are ignored. Benchmark directories use the same exclusion as the existing bench and benchmarks conventions, including the singular benchmark spelling.

The exact-focus production test intentionally imports the built bundle. Only that test is outside the source DAG: its Vitest project and assertions remain unchanged and still check the bundle. This exclusion does not expand to other source-level test runners.

The shared declaration library stays in scope with its real declaration entry and owner. The AJV8 package manifest owns the shared validator compartment beneath its separate dialect entries; neither product area is hidden by an ignore or a missing-entry exemption.
