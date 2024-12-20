import { type Ratio, getRatio } from '@/benchmark/helpers/getRatio';
import Benchmark from 'benchmark';

import { schema, value } from './data';
import { getDataWithSchema } from './getDataWithSchema_anyOf';
import { getDataWithSchema as getDataWithSchema_Old } from './getDataWithSchema_anyOf_old';

const suite = new Benchmark.Suite();

const getDataWithSchema_anyOf_Old = () => {
  getDataWithSchema_Old(value, schema);
};

const getDataWithSchema_anyOf = () => {
  getDataWithSchema(value, schema);
};

export const run = () => {
  return new Promise<Ratio>((resolve) => {
    suite
      .add('getDataWithSchema_Old', getDataWithSchema_anyOf_Old)
      .add('getDataWithSchema', getDataWithSchema_anyOf)
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
