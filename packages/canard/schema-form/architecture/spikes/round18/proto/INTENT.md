# Round 18 Settle Prototype

## Purpose

Provide an independently executable model of the accepted settling rules before the production engine implements them. The prototype makes ledger claims observable through deterministic probes and counters.

## Conventions

- Treat the architecture ledger as the contract; preserve earlier probe coverage and record intentional expectation changes by ledger ID.
- Keep the prototype independent of production nodes and React.
- Use named exports at the prototype boundary and explicit inputs for rule evaluation.

## Boundaries

- Own the executable settling model and its regression evidence, not the production schema compiler or rendering system.
- Preserve raw values separately from projected output, and separate write interpretation from gate evaluation.
- Keep the older prototypes unchanged so their behavior remains available for comparison.

## Always do

- Prove new behavior with a failing pre-change probe and a passing implemented probe.
- Report visits, rounds, conflicts, and budget outcomes where a contract depends on cost or termination.
- Apply the current ledger's root-output and two-stage interpretation rules.

## Ask first

- Escalate a ledger contradiction or a probe whose expected result the current ledger does not determine.
- Obtain a design decision before widening the prototype into production-engine responsibilities.

## Never do

- Import this prototype into shipped runtime code.
- Change earlier regression expectations merely to obtain a passing run.
- Restore a superseded ledger rule or silently skip a required probe.
