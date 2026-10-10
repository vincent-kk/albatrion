// Spike: how a standard JSON Schema validator (ajv) judges `if`/`then`/`else`
// placed INSIDE `oneOf` / `anyOf` branches, compared with a plain
// properties+required discriminant branch (control).
// Run from packages/canard/schema-form so `ajv` resolves from this package's
// node_modules: `node architecture/spikes/round9/oneof-if.mjs`
import { createRequire } from 'module';

import Ajv from 'ajv';
import Ajv2020 from 'ajv/dist/2020.js';

const require = createRequire(import.meta.url);
const ajvVersion = require('ajv/package.json').version;
console.log(`ajv version: ${ajvVersion}`);

const ifThenBranches = [
  {
    if: { properties: { kind: { const: 'a' } }, required: ['kind'] },
    then: { properties: { x: { type: 'string' } }, required: ['x'] },
  },
  {
    if: { properties: { kind: { const: 'b' } }, required: ['kind'] },
    then: { properties: { y: { type: 'number' } }, required: ['y'] },
  },
];

const ifThenElseFalseBranches = ifThenBranches.map((branch) => ({
  ...branch,
  else: false,
}));

const controlBranches = [
  {
    properties: { kind: { const: 'a' }, x: { type: 'string' } },
    required: ['kind', 'x'],
  },
  {
    properties: { kind: { const: 'b' }, y: { type: 'number' } },
    required: ['kind', 'y'],
  },
];

function makeSchema(combinator, branches) {
  return {
    type: 'object',
    properties: { kind: { type: 'string' } },
    [combinator]: branches,
  };
}

const schemas = {
  A: makeSchema('oneOf', ifThenBranches),
  B: makeSchema('oneOf', ifThenElseFalseBranches),
  C: makeSchema('anyOf', ifThenBranches),
  D: makeSchema('anyOf', ifThenElseFalseBranches),
  E: makeSchema('oneOf', controlBranches),
  F: makeSchema('allOf', ifThenBranches),
  G: {
    type: 'object',
    properties: { kind: { type: 'string' } },
    ...ifThenBranches[0],
  },
};

const branchesBySchema = {
  A: ifThenBranches,
  B: ifThenElseFalseBranches,
  C: ifThenBranches,
  D: ifThenElseFalseBranches,
  E: controlBranches,
};

const values = {
  v1: { kind: 'a', x: 's' },
  v2: { kind: 'a' },
  v3: { kind: 'b', y: 1 },
  v4: { kind: 'a', x: 's', y: 1 },
  v5: { kind: 'c' },
  v6: {},
  v7: { x: 's' },
};

const ajvVariants = {
  draft07: new Ajv({ strict: false, allErrors: true }),
  '2020': new Ajv2020({ strict: false, allErrors: true }),
};

function errorSummary(errors) {
  if (!errors) return '';
  return errors
    .map((e) => `${e.instancePath || '(root)'} ${e.keyword}`)
    .join('; ');
}

for (const [schemaLabel, schema] of Object.entries(schemas)) {
  for (const [ajvLabel, ajv] of Object.entries(ajvVariants)) {
    const validate = ajv.compile(schema);
    for (const [valueLabel, value] of Object.entries(values)) {
      const valid = validate(value);
      const base = `${schemaLabel} | ${valueLabel} | ${ajvLabel} | valid=${valid}`;
      console.log(valid ? base : `${base} | errors=[${errorSummary(validate.errors)}]`);
    }
  }
}

console.log('');
console.log('--- branch-level check: how many branches individually accept v1 ---');
for (const [schemaLabel, branches] of Object.entries(branchesBySchema)) {
  for (const [ajvLabel, ajv] of Object.entries(ajvVariants)) {
    const perBranchResults = branches.map((branch, index) => {
      const branchSchema = { type: 'object', ...branch };
      const validateBranch = ajv.compile(branchSchema);
      const valid = validateBranch(values.v1);
      return `branch${index}=${valid}`;
    });
    const passCount = perBranchResults.filter((r) => r.endsWith('true')).length;
    console.log(
      `${schemaLabel} | ${ajvLabel} | branch-pass-count(v1)=${passCount} | perBranch=[${perBranchResults.join(', ')}]`,
    );
  }
}
