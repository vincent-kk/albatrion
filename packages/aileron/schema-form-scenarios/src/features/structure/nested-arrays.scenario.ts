import type { FormScenario } from '../../types';

/** An array of orders whose items own a nested array of lines with a defaulted field. */
const ordersSchema = {
  type: 'object',
  properties: { orders: { type: 'array', items: { type: 'object', properties: {
    id: { type: 'string' },
    lines: { type: 'array', items: { type: 'object', properties: { sku: { type: 'string' }, qty: { type: 'number', default: 1 } } } },
  } } } },
};

/** Verbs on an outer array move whole nested subtrees; verbs on an inner array leave siblings alone. */
export const nestedArraysScenario: FormScenario = {
  name: 'structure.nested-array-verbs',
  description: 'NODE-051 verbs keep item identity and shift references; WRITE-095 and 18C-105 snapshot slots follow the verb (push stores its value, remove and pop cut the slot, update keeps it); TEST-018 nested arrays repeat the contract at every level.',
  schema: ordersSchema,
  initialValue: { orders: [{ id: 'A', lines: [{ sku: 'a1' }] }, { id: 'B', lines: [{ sku: 'b1' }, { sku: 'b2' }] }] },
  steps: [
    { action: 'batch', steps: [], expect: {
      shape: { '/orders/0/lines/0': 'present', '/orders/1/lines/1': 'present', '/orders/1/lines/2': 'absent' },
      outputValue: { orders: [
        { id: 'A', lines: [{ sku: 'a1', qty: 1 }] },
        { id: 'B', lines: [{ sku: 'b1', qty: 1 }, { sku: 'b2', qty: 1 }] },
      ] },
    } },
    { action: 'push', path: '/orders/0/lines', value: { sku: 'a2', qty: 2 }, expect: {
      result: 2, identity: { '/orders/0/lines/0': '/orders/0/lines/0', '/orders/1': '/orders/1' },
      shape: { '/orders/0/lines/1': 'present' }, values: { '/orders/0/lines/1/qty': 2 }, defaultValues: { '/orders/0/lines/1': { sku: 'a2', qty: 2 } },
    } },
    { action: 'remove', path: '/orders', index: 0, expect: {
      identity: { '/orders/0': '/orders/1', '/orders/0/lines/1': '/orders/1/lines/1' },
      shape: { '/orders/1': 'absent' }, values: { '/orders/0/id': 'B' },
      defaultValues: { '/orders': [{ id: 'B', lines: [{ sku: 'b1' }, { sku: 'b2' }] }], '/orders/0/lines/1': { sku: 'b2' } },
      outputValue: { orders: [{ id: 'B', lines: [{ sku: 'b1', qty: 1 }, { sku: 'b2', qty: 1 }] }] },
    } },
    { action: 'update', path: '/orders/0/lines', index: 1, value: { sku: 'b2x', qty: 5 }, expect: {
      result: { sku: 'b2x', qty: 5 }, identity: { '/orders/0/lines/1': '/orders/0/lines/1' },
      values: { '/orders/0/lines/1/sku': 'b2x', '/orders/0/lines/1/qty': 5 }, defaultValues: { '/orders/0/lines/1': { sku: 'b2' } },
    } },
    { action: 'setValue', path: '/orders/0/lines/0/qty', value: 3, expect: {
      outputValue: { orders: [{ id: 'B', lines: [{ sku: 'b1', qty: 3 }, { sku: 'b2x', qty: 5 }] }] },
    } },
    { action: 'pop', path: '/orders/0/lines', expect: {
      result: { sku: 'b2x', qty: 5 }, shape: { '/orders/0/lines/1': 'absent' }, identity: { '/orders/0/lines/0': '/orders/0/lines/0' },
      defaultValues: { '/orders/0/lines': [{ sku: 'b1' }] },
      outputValue: { orders: [{ id: 'B', lines: [{ sku: 'b1', qty: 3 }] }] },
    } },
    { action: 'push', path: '/orders', value: { id: 'C' }, expect: {
      result: 2, shape: { '/orders/1/id': 'present', '/orders/1/lines/0': 'absent' }, identity: { '/orders/0': '/orders/0' },
      defaultValues: { '/orders/1': { id: 'C' } },
      outputValue: { orders: [{ id: 'B', lines: [{ sku: 'b1', qty: 3 }] }, { id: 'C' }] },
    } },
  ],
};
