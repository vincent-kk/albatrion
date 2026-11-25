A 1c77ced57dcb325d5ebb24d6c884bda0904e0388 · B 53099d518a7920c44c6e1de02c5a6e42a269f49e · v24.20.0 · Apple M1 Max · 24 rounds

| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |
|---|---|---|---|---|---|---|---|---|
| p3-01-ajv7-root-id-compile | @canard/schema-form-ajv7-plugin | compile | string schema with a root id on a freshly bound instance | repaired | 1.060 | 1.080 | 1.000 / 0.998 | over |
| p3-02-ajv7-bind-compile | @canard/schema-form-ajv7-plugin | bind and compile | string schema on a fresh instance | repaired | 1.076 | 1.084 | 0.995 / 1.005 | over |
| p3-03-ajv7-factory-compile | @canard/schema-form-ajv7-plugin | factory compile | string schema through a new factory | repaired | 1.081 | 1.083 | 1.002 / 1.001 | over |
| p3-04-ajv7-factory-fresh | @canard/schema-form-ajv7-plugin | factory compile on a fresh instance | string schema with an id on a fresh instance | repaired | 1.089 | 1.090 | 1.003 / 0.998 | over |
| p3-05-ajv8-factory-fresh | @canard/schema-form-ajv8-plugin | factory compile on a fresh instance | string schema with an id on a fresh instance | repaired | 1.031 | 1.019 | 1.012 / 1.000 | over |
| p3-06-anchor-ssr-initial-errors | @canard/schema-form | server render with initial errors | one string field and one server error | repaired | 1.237 | 1.196 | 1.014 / 1.003 | over |
