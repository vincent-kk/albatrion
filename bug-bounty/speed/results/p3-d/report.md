A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B eefe19e8c35b35ed32d3bc4be5571c1f367b6c11 · v24.20.0 · Apple M1 Max · 12 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p3-01-ajv7-root-id-compile | @canard/schema-form-ajv7-plugin | compile | string schema with a root id on a freshly bound instance | repaired | 1.053 | 1.073 | 0.994 / 0.995 | over |
| p3-02-ajv7-bind-compile | @canard/schema-form-ajv7-plugin | bind and compile | string schema on a fresh instance | repaired | 1.078 | 1.086 | 0.999 / 1.000 | over |
| p3-03-ajv7-factory-compile | @canard/schema-form-ajv7-plugin | factory compile | string schema through a new factory | repaired | 1.076 | 1.075 | 0.999 / 0.997 | over |
| p3-04-ajv7-factory-fresh | @canard/schema-form-ajv7-plugin | factory compile on a fresh instance | string schema with an id on a fresh instance | repaired | 1.069 | 1.085 | 1.001 / 0.996 | over |
