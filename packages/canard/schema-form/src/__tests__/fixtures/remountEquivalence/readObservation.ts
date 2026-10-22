import { type FieldNode, FieldNodeState } from '@/schema-form/core';

/**
 * Read committed public channels in current child order, without historical identities.
 * @param root - Independently mounted public node tree.
 * @returns Ordered shape plus named per-occurrence channels and global errors.
 */
export function readObservation(root: FieldNode): Record<string, unknown> {
  const attached: FieldNode[] = [];
  const stack = [root];
  while (stack.length) {
    const node = stack.pop()!;
    if (attached.includes(node)) continue;
    attached.push(node);
    for (let index = (node.children?.length ?? 0) - 1; index >= 0; index--)
      stack.push(node.children![index]);
  }
  return {
    output: root.outputValue,
    shape: attached.map((node) => node.path),
    nodes: Object.fromEntries(
      attached.map((node) => [
        node.path,
        {
          name: node.name,
          type: node.type,
          strategy: node.strategy,
          schemaType: node.schemaType,
          parent: node.parentNode?.path ?? null,
          children: node.children?.map((child) => child.path) ?? null,
          raw: node.raw,
          undeclaredValues: node.undeclaredValues,
          value: node.value,
          outputValue: node.outputValue,
          active: node.active,
          visible: node.visible,
          enabled: node.enabled,
          readOnly: node.readOnly,
          disabled: node.disabled,
          required: node.required,
          nullable: node.nullable,
          watchValues: node.watchValues,
          misfit: node.misfit,
          misfits: node.misfits,
          jsonSchema: node.jsonSchema,
          state: Object.fromEntries(
            Object.entries(node.state).filter(
              ([key]) =>
                ![
                  String(FieldNodeState.Dirty),
                  String(FieldNodeState.Touched),
                ].includes(key),
            ),
          ),
          errors: node.errors,
          arrayLength: Array.isArray(node.outputValue)
            ? node.outputValue.length
            : null,
        },
      ]),
    ),
    globalErrors: root.globalErrors,
  };
}
