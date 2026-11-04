import type { FieldNodeDelivery } from '../../record';

/** Event delivered to a node subscriber with merged bits and per-bit data. */
export type FieldNodeEvent = FieldNodeDelivery;

/** Subscriber retained by the root runtime until its cleanup runs. */
export type FieldNodeListener = (event: FieldNodeEvent) => void;
