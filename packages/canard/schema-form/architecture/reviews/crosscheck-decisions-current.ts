// Executed by vite-node with the existing work-loop spike alias configuration.
import { nodeFromJSONSchema } from '@/schema-form/core';

const cases = {
  selfNegating: { type: 'object', if: { not: { required: ['x'] } }, then: { properties: { x: { type: 'number', default: 1 } } } },
  selfNegatingDeclared: { type: 'object', properties: { x: { type: 'number' } }, if: { not: { required: ['x'] } }, then: { properties: { x: { type: 'number', default: 1 } } } },
  falseProperty: { type: 'object', properties: { x: false } },
  notRequired: { type: 'object', properties: { x: { type: 'string' } }, not: { required: ['x'] } },
  conditionalFalse: { type: 'object', properties: { mode: { type: 'string' }, x: { type: 'string' } }, if: { properties: { mode: { const: 'ban' } }, required: ['mode'] }, then: { properties: { x: false } } },
};
const name = process.argv[2] as keyof typeof cases;
let root: any;
const errorInfo = (error: any) => ({ name, error: error?.specific ?? error?.code ?? error?.name, message: error?.message });
process.on('uncaughtException', (error) => { console.log(JSON.stringify(errorInfo(error))); process.exit(2); });
try {
  root = nodeFromJSONSchema({ jsonSchema: cases[name] as any, defaultValue: name.startsWith('selfNegating') ? {} : { mode: 'ban', x: 'secret' }, onChange: () => {} });
  await new Promise((resolve) => setTimeout(resolve, 30));
  const child = root.find('/x');
  console.log(JSON.stringify({ name, value: root.value, xExists: !!child, xType: child?.type, xValue: child?.value }));
} catch (error) { console.log(JSON.stringify(errorInfo(error))); }
