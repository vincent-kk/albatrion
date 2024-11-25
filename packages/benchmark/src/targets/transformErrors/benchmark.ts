import Benchmark from 'benchmark';

import { type Ratio, getRatio } from '@lumy/benchmark/helpers/getRatio';
import { transformErrors } from '@lumy/schema-form/core/schemaNodes/BaseNode/utils';

import { ajvErrors } from './data';
import { transformErrors as transformErrors_Old } from './transformErrors_old';

const suite = new Benchmark.Suite();

const testTransformErrors = () => {
  transformErrors(ajvErrors);
};
const testTransformErrors_Old = () => {
  transformErrors_Old(ajvErrors);
};

export const run = () => {
  return new Promise<Ratio>((resolve) => {
    suite
      .add('transformErrors', testTransformErrors)
      .add('transformErrors_Old', testTransformErrors_Old)
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
