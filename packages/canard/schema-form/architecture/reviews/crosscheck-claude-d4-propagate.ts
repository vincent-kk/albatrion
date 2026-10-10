// D-4 evidence: object-branch write without Propagate (SetValueOption.Default) vs with it.
// Run: cd packages/canard/schema-form && node /Users/Vincent/Workspace/albatrion/node_modules/.bin/vite-node \
//   --config architecture/spikes/work-loop/vite.spike.config.mjs architecture/reviews/crosscheck-claude-d4-propagate.ts
import { SetValueOption, nodeFromJSONSchema } from '@/schema-form/core';

const tick = () => new Promise((r) => setTimeout(r, 0));
const schema: any = {
  type: 'object',
  properties: { a: { type: 'number' }, b: { type: 'number' } },
};
for (const [label, opt] of [
  ['Default (EmitChange|PublishUpdateEvent)', SetValueOption.Default],
  ['Default|Propagate', SetValueOption.Default | SetValueOption.Propagate],
  ['Merge', SetValueOption.Merge],
] as Array<[string, number]>) {
  const root: any = nodeFromJSONSchema({
    jsonSchema: schema,
    defaultValue: { a: 1, b: 2 },
    onChange: () => {},
  });
  await tick();
  root.setValue({ a: 9 }, opt);
  await tick();
  console.log(
    JSON.stringify({
      option: label,
      parent: root.value,
      childA: root.find('/a').value,
    }),
  );
}
