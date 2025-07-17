import Benchmark from 'benchmark';

import { type Ratio, getRatio } from '@/benchmark/helpers/getRatio';

import { transformConditionalSchema as transformConditionalSchema_boost1 } from './boost1';
import { transformConditionalSchema as transformConditionalSchema_boost2 } from './boost2';
import { transformConditionalSchema as transformConditionalSchema_boost3 } from './boost3';
import { schema } from './data';
import { transformConditionalSchema as transformConditionalSchema_origin } from './origin';

const suite = new Benchmark.Suite();

const transformConditionalSchema_origin_runner = () => {
  return transformConditionalSchema_origin(schema.then, schema.virtual);
};

const transformConditionalSchema_boost1_runner = () => {
  return transformConditionalSchema_boost1(schema.then, schema.virtual);
};

const transformConditionalSchema_boost2_runner = () => {
  return transformConditionalSchema_boost2(schema.then, schema.virtual);
};

const transformConditionalSchema_boost3_runner = () => {
  return transformConditionalSchema_boost3(schema.then, schema.virtual);
};

export const run = () => {
  return new Promise<Ratio>((resolve) => {
    suite
      .add(
        'transformConditionalSchema_origin',
        transformConditionalSchema_origin_runner,
      )
      .add(
        'transformConditionalSchema_boost1',
        transformConditionalSchema_boost1_runner,
      )
      .add(
        'transformConditionalSchema_boost2',
        transformConditionalSchema_boost2_runner,
      )
      .add(
        'transformConditionalSchema_boost3',
        transformConditionalSchema_boost3_runner,
      )
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
