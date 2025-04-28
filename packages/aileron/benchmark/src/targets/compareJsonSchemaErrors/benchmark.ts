import Benchmark from 'benchmark';

import { type Ratio, getRatio } from '@/benchmark/helpers/getRatio';
import { equals } from '@/common-utils';
import { getErrorsHash as getErrorsHash_Ref } from '@/schema-form/helpers/error/getErrorHash';

import { ajvErrors1, ajvErrors2 } from './data';
import { getErrorsHash } from './error';

const suite = new Benchmark.Suite();

const prevString = JSON.stringify(ajvErrors1);
const prevHash = getErrorsHash(ajvErrors1);

const compareJsonSchemaErrorsWithStringify = () => {
  const next = JSON.stringify(ajvErrors2);
  return prevString === next;
};
const compareJsonSchemaErrorsWithHash = () => {
  const nextHash = getErrorsHash(ajvErrors2);
  return prevHash === nextHash;
};

const compareJsonSchemaErrorsWithHash_Ref = () => {
  const nextHash = getErrorsHash_Ref(ajvErrors2);
  return prevHash === nextHash;
};

const compareJsonSchemaErrorsWithEquals = () => {
  return equals(ajvErrors1, ajvErrors2);
};

export const run = () => {
  return new Promise<Ratio>((resolve) => {
    suite
      .add('compareJsonSchemaErrorsWithStringify', function () {
        compareJsonSchemaErrorsWithStringify();
      })
      .add('compareJsonSchemaErrorsWithHash', function () {
        compareJsonSchemaErrorsWithHash();
      })
      .add('compareJsonSchemaErrorsWithHash_Ref', function () {
        compareJsonSchemaErrorsWithHash_Ref();
      })
      .add('compareJsonSchemaErrorsWithEquals', function () {
        compareJsonSchemaErrorsWithEquals();
      })
      .on('cycle', function (event: Benchmark.Event) {
        console.log(String(event.target));
      })
      .on('complete', function (this: Benchmark.Suite) {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
        resolve(getRatio(this));
      })
      .run({ async: true });
  });
};
