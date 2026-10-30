import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

/**
 * Create a live host with a previously visited inactive child and array subtree.
 * @returns Public references and branch controls for the six slot lifetime contracts
 */
export const createRetainedSlotTree = () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      group: {
        type: 'object',
        controls: { active: '../open' },
        properties: {
          childOpen: { type: 'boolean' },
          leaf: { type: 'string' },
          held: { type: 'string', controls: { active: '../childOpen' } },
          list: {
            type: 'array',
            items: {
              type: 'object',
              properties: { text: { type: 'string' } },
            },
          },
        },
      },
    },
  });
  root.setValue({
    open: true,
    group: {
      childOpen: true,
      leaf: 'kept',
      held: 'hidden',
      list: [{ text: 'first' }],
      extra: { retained: true },
    },
  });
  const group = root.find('/group')!;
  const leaf = root.find('/group/leaf')!;
  const held = root.find('/group/held')!;
  const list = root.find('/group/list')!;
  const item = root.find('/group/list/0')!;
  root.find('/group/childOpen')!.setValue(false);
  return {
    root,
    group,
    leaf,
    held,
    list,
    item,
    close: () => root.find('/open')!.setValue(false),
    open: () => root.find('/open')!.setValue(true),
  };
};
