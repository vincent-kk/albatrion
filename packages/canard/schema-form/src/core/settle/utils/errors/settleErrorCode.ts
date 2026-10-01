/** Host or transition calculation exceeded its permitted work. */
export const BUDGET_EXCEEDED = 'BUDGET_EXCEEDED';
/** Recursive shape could not settle to a finite occurrence chain. */
export const RECURSIVE_SHAPE_DIVERGED = 'RECURSIVE_SHAPE_DIVERGED';
/** A compiled active expression threw during evaluation. */
export const EXPRESSION_THREW = 'EXPRESSION_THREW';
/** An injected synchronous if predicate threw during evaluation. */
export const GUARD_FAILED = 'GUARD_FAILED';
/** Simultaneously active declarations cannot share a node kind or type. */
export const SHARED_NODE_CONFLICT = 'SHARED_NODE_CONFLICT';
/** A disposed node cannot accept a later write. */
export const DISPOSED_NODE_WRITE = 'DISPOSED_NODE_WRITE';
/** A dynamic injection addressed no declared target. */
export const INJECT_TARGET_MISSING = 'INJECT_TARGET_MISSING';
/** An automatic write supplied a shape a virtual node cannot accept. */
export const INVALID_VIRTUAL_NODE_VALUES = 'INVALID_VIRTUAL_NODE_VALUES';
