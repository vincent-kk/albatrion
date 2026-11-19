import Ajv from 'ajv';
import { expect, it } from 'vitest';

import { pointerCompilerOf } from '../pointerCompilerOf';

it.each([true, false, undefined])(
  'retains a custom constructor nullable profile %s while reusing its private compiler',
  (nullable) => {
    const observed: (boolean | undefined)[] = [];
    class CustomAjv extends Ajv {
      constructor(options?: Ajv.Options) {
        super(options);
        observed.push(options?.nullable);
      }
    }
    const source = new CustomAjv({ nullable, logger: false });
    const compiler = pointerCompilerOf(source);
    expect(pointerCompilerOf(source)).toBe(compiler);
    expect(observed).toEqual([nullable, nullable]);
    const schema = { type: 'number', nullable: true };
    const native = source.compile(schema);
    const isolated = compiler.compile(schema);
    expect([isolated(3), isolated(null)]).toEqual([native(3), native(null)]);
    expect(source._opts.nullable).toBe(nullable);
  },
);
