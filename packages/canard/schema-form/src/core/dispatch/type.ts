import type { SchemaNodeDelivery } from '../record';

/** Event delivered to a node subscriber with merged bits and per-bit data. */
export type SchemaNodeEvent = SchemaNodeDelivery;

/** Subscriber retained by the root runtime until its cleanup runs. */
export type SchemaNodeListener = (event: SchemaNodeEvent) => void;
