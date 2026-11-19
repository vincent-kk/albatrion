import * as ts from 'typescript';
import assert from 'node:assert/strict';
import { it } from 'node:test';
import { checkSchemaConsumer } from '../helpers/checkSchemaConsumer';

const source = "import { JSONSchemaScanError } from '@winglet/json-schema'; export const groupOf = (error: JSONSchemaScanError): string => error.group;";
it('a legacy root consumer retains the same inherited error member as a modern consumer', () => {
  assert.deepEqual(checkSchemaConsumer(source, { module: ts.ModuleKind.CommonJS, moduleResolution: ts.ModuleResolutionKind.Node10, skipLibCheck: true }), checkSchemaConsumer(source, { skipLibCheck: true }));
});
