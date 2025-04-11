import Benchmark from 'benchmark';

import { type Ratio, getRatio } from '@/benchmark/helpers/getRatio';

import { schema, value } from './data';
import { getDataWithSchema } from './getDataWithSchema';
import { getDataWithSchema as getDataWithSchema_AnyOf } from './getDataWithSchema_anyOf';
import { getDataWithSchema as getDataWithSchema_AnyOf_Old } from './getDataWithSchema_anyOf_old';

const suite = new Benchmark.Suite();

const getDataWithSchema_anyOf_Old = () => {
  getDataWithSchema_AnyOf_Old(value, schema);
};

const getDataWithSchema_anyOf = () => {
  getDataWithSchema_AnyOf(value, schema);
};

const getDataWithSchema_oneOf = () => {
  getDataWithSchema(value, schema);
};

export const run = () => {
  return new Promise<Ratio>((resolve) => {
    suite
      .add('getDataWithSchema_anyOf_Old', getDataWithSchema_anyOf_Old)
      .add('getDataWithSchema_anyOf', getDataWithSchema_anyOf)
      .add('getDataWithSchema_oneOf', getDataWithSchema_oneOf)
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
