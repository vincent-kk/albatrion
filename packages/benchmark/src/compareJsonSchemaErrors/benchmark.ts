import Benchmark from 'benchmark';

import { getErrorsHash } from '@lumy/schema-form/helpers/error';

import { type Ratio, getRatio } from '../helpers/getRatio';
import { ajvErrors1, ajvErrors2 } from './data';

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

export const run = () => {
  return new Promise<Ratio>((resolve) => {
    suite
      .add('compareJsonSchemaErrorsWithStringify', function () {
        compareJsonSchemaErrorsWithStringify();
      })
      .add('compareJsonSchemaErrorsWithHash', function () {
        compareJsonSchemaErrorsWithHash();
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
