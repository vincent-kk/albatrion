# Validation scheduling

## Purpose

Own one-shot after-frame scheduling and the continuous-input cadence as one domain-free timing policy.

## Conventions

- A run reports whether work started; only true moves the 100 ms cap clock, and every run returns to watch.

- The host owns frame APIs and visibility; inspect them at each request.
- Callers supply the clock. Timing imports no domain state or validation implementation.
- The entry point names the one-shot slot, cadence creator and cadence type; the package entry point stays unchanged.

## Boundaries

### Always do

- Keep the 100 ms cap relative to the last automatic run start.
- Cancel every owned frame, timer and task when the cadence is cancelled.
- Preserve the leading, watch, carry, trailing and fallback contract in DETAIL.

### Ask first

- Changing cadence or fallback thresholds or widening the API.

### Never do

- Read stamps, nodes, commits, pending targets, errors or validator state.
- Import validation, record, settle or write.
