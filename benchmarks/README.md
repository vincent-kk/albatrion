# Benchmarks

Repository-level speed tooling and the design notes behind it. Package-specific benchmarks stay in their packages; this directory holds what is not owned by one package.

| Path                            | Purpose                                                                                                                          |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| [`DESIGN.md`](DESIGN.md)        | Techniques for designing a speed comparison, each with the failure it prevents. Read it before building or changing any harness. |
| [`compare/`](compare/README.md) | A kit that compares two prepared trees of this repository row by row, with a control in every row.                               |

## Choosing a tool

A benchmark answers one question. Pick the tool by the question, and build a new one only when no row below matches.

| Question                                                                                | Tool                                                         |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Is commit B slower than commit A for these public calls, across packages?               | [`compare/`](compare/README.md)                              |
| How does `@canard/schema-form` behave in a real browser, against a baseline ref?        | `packages/aileron/benchmark-form` (`bench:form`)             |
| How does `@canard/schema-form` compare with its older versions or other form libraries? | `packages/aileron/benchmark-form` (`bench`, `bench:compare`) |
| How fast is one function of one package while I work on it?                             | That package's own `bench/` or `benchmark/` directory        |

A measurement campaign keeps its rows, inputs and results with the campaign (for example `bug-bounty/speed/`), and only points at the kit here. Rows describe one campaign's question; they are not general.
