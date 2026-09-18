import Benchmark from 'benchmark';

import { type Ratio, getRatio } from '@/benchmark/helpers/getRatio';
import { equals } from '@/common-utils';

import { ajvErrors1, ajvErrors2 } from './data';
import { getErrorsHash } from './error';

const suite = new Benchmark.Suite();

const prevString = JSON.stringify(ajvErrors1);
const prevHash = getErrorsHash(ajvErrors1);

const compareJSONSchemaErrorsWithStringify = () => {
  const next = JSON.stringify(ajvErrors2);
  return prevString === next;
};
const compareJSONSchemaErrorsWithHash = () => {
  const nextHash = getErrorsHash(ajvErrors2);
  return prevHash === nextHash;
};

const compareJSONSchemaErrorsWithEquals = () => {
  return equals(ajvErrors1, ajvErrors2);
};

export const run = () => {
  return new Promise<Ratio>((resolve) => {
    suite
      .add('compareJSONSchemaErrorsWithStringify', function () {
        compareJSONSchemaErrorsWithStringify();
      })
      .add('compareJSONSchemaErrorsWithHash', function () {
        compareJSONSchemaErrorsWithHash();
      })
      .add('compareJSONSchemaErrorsWithEquals', function () {
        compareJSONSchemaErrorsWithEquals();
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
