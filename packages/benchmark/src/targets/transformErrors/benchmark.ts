import Benchmark from 'benchmark';

import { type Ratio, getRatio } from '@lumy/benchmark/helpers/getRatio';
import { transformErrors as transformErrors_Ref } from '@lumy/schema-form/core/schemaNodes/BaseNode/utils';

import { ajvErrors } from './data';
import { transformErrors } from './transformErrors';
import { transformErrors as transformErrors_Old } from './transformErrors_old';

const suite = new Benchmark.Suite();

const error1 = JSON.parse(JSON.stringify(ajvErrors));
const testTransformErrors = () => {
  transformErrors(error1, true);
};

const error2 = JSON.parse(JSON.stringify(ajvErrors));
const testTransformErrors_Old = () => {
  transformErrors_Old(error2, true);
};

const error3 = JSON.parse(JSON.stringify(ajvErrors));
const testTransformErrors_Ref = () => {
  transformErrors_Ref(error3, true);
};

export const run = () => {
  return new Promise<Ratio>((resolve) => {
    suite
      .add('transformErrors_Old', testTransformErrors_Old)
      .add('transformErrors', testTransformErrors)
      .add('transformErrors_Ref', testTransformErrors_Ref)
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
