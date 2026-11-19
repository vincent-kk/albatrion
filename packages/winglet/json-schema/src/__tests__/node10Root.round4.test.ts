import * as ts from 'typescript';
import { expect, it } from 'vitest';
import { checkSchemaConsumer } from './helpers/checkSchemaConsumer';

const source = "import { JSONSchemaScanError } from '@winglet/json-schema'; export const groupOf = (error: JSONSchemaScanError): string => error.group;";
it('a legacy root consumer retains the same inherited error member as a modern consumer', () => {
  expect(checkSchemaConsumer(source, { module: ts.ModuleKind.CommonJS, moduleResolution: ts.ModuleResolutionKind.Node10, skipLibCheck: true })).toEqual(checkSchemaConsumer(source, { skipLibCheck: true }));
});
