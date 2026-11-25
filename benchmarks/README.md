# Benchmarks

Repository-level speed tooling and the design notes behind it. Package-specific benchmarks stay in their packages; this directory holds what is not owned by one package.

| Path                            | Purpose                                                                                                                          |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| [`DESIGN.md`](DESIGN.md)        | Techniques for designing a speed comparison, each with the failure it prevents. Read it before building or changing any harness. |
| [`IMPROVING.md`](IMPROVING.md)  | How to act on an over-limit row without changing behavior: which changes to keep, how to attribute what remains, how to verify.  |
| [`rows/`](rows/README.md) | The 110 rows of the 1.0.0 speed comparison, with their limits and the rows known to exceed them. |
| [`compare/`](compare/README.md) | A kit that compares two prepared trees of this repository row by row, with a control in every row.                               |

## Choosing a tool

A benchmark answers one question. Pick the tool by the question, and build a new one only when no row below matches.

| Question                                                                                | Tool                                                         |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Is commit B slower than commit A for these public calls, across packages?               | [`compare/`](compare/README.md)                              |
| How does `@canard/schema-form` behave in a real browser, against a baseline ref?        | `packages/aileron/benchmark-form` (`bench:form`)             |
| How does `@canard/schema-form` compare with its older versions or other form libraries? | `packages/aileron/benchmark-form` (`bench`, `bench:compare`) |
| How fast is one function of one package while I work on it?                             | That package's own `bench/` or `benchmark/` directory        |

[`rows/`](rows/README.md) holds the rows that compare the public calls changed by the 1.0.0 bug-bounty fixes against the commit before them. A new campaign adds its rows as a directory of its own and points the kit at it; rows describe one campaign's question and are not general.
