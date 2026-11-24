A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B eefe19e8c35b35ed32d3bc4be5571c1f367b6c11 · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p3-01-ajv7-root-id-compile | @canard/schema-form-ajv7-plugin | compile | string schema with a root id on a freshly bound instance | repaired | 1.068 | 1.074 | 1.003 / 1.000 | over |
| p3-02-ajv7-bind-compile | @canard/schema-form-ajv7-plugin | bind and compile | string schema on a fresh instance | repaired | 1.077 | 1.077 | 1.002 / 0.999 | over |
| p3-03-ajv7-factory-compile | @canard/schema-form-ajv7-plugin | factory compile | string schema through a new factory | repaired | 1.082 | 1.079 | 1.003 / 0.999 | over |
| p3-04-ajv7-factory-fresh | @canard/schema-form-ajv7-plugin | factory compile on a fresh instance | string schema with an id on a fresh instance | repaired | 1.079 | 1.083 | 1.003 / 0.998 | over |
