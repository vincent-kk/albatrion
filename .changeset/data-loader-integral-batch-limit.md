---
"@winglet/data-loader": patch
---

`DataLoader` rejects `NaN` and fractional `maxBatchSize` values at construction instead of silently changing batching behavior. Positive integer limits and the unlimited `Infinity` default remain supported, and `disableBatch` keeps precedence.
