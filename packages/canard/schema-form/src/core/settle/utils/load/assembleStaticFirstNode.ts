import type { SchemaNodeRecord } from '../../../record';

/** Empty terminal children never allocate a call-local array. */
const NO_CHILDREN: readonly never[] = Object.freeze([]);

/**
 * Assemble and project once, with separate fixed-kind behavior call sites.
 * @param node - First-load occurrence whose children have completed
 * @returns Nothing; eager local/emit values are ready before delivery
 */
export const assembleStaticFirstNode = <Self extends SchemaNodeRecord<Self>>(node: Self): void => {
  const children = node.children ?? NO_CHILDREN;
  let local: unknown;
  let emit: unknown;
  switch (node.behavior.type) {
    case 'object':
      local = node.behavior.assemble(node, children);
      emit = node.behavior.project(node, local);
      break;
    case 'array':
      local = node.behavior.assemble(node, children);
      emit = node.behavior.project(node, local);
      break;
    case 'string':
      local = node.behavior.assemble(node, children);
      emit = node.behavior.project(node, local);
      break;
    case 'number':
      local = node.behavior.assemble(node, children);
      emit = node.behavior.project(node, local);
      break;
    case 'boolean':
      local = node.behavior.assemble(node, children);
      emit = node.behavior.project(node, local);
      break;
    case 'null':
      local = node.behavior.assemble(node, children);
      emit = node.behavior.project(node, local);
  }
  node.local = local;
  node.emit = node.parent === null && emit === undefined &&
    (node.behavior.type === 'object' || node.behavior.type === 'array') ? local : emit;
};
