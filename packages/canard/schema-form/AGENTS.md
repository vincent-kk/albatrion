# Schema Form Development Rules

- For a small, fixed set of checks known at build time, prefer direct `&&` or `||` conditions. If iteration makes the code clearer, hoist the keys into a constant array; do not allocate a new array on each call.
- Use `hasOwnProperty` from `@winglet/common-utils/lib` for own-key checks instead of calling `Object.prototype.hasOwnProperty` directly.
