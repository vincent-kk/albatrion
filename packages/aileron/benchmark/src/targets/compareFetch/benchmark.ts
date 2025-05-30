import Benchmark from 'benchmark';
import jsonPath from 'fast-json-patch';

import { compare } from '@winglet/common-utils';

import { type Ratio, getRatio } from '@/benchmark/helpers/getRatio';

import { value1, value2 } from './data';

const values = [value1, value2, value2, { ...value2 }, { ...value2 }, value1];

let prev1 = value1;
const compareByJsonPath = () => {
  for (const value of values) {
    if (jsonPath.compare(prev1, value).length > 0) {
      prev1 = value;
    }
  }
};

let prev2 = value1;
const compareByJSONPointer = () => {
  for (const value of values) {
    if (compare(prev1, value).length > 0) {
      prev2 = value;
    }
  }
};

const suite = new Benchmark.Suite();

export const run = () => {
  return new Promise<Ratio>((resolve) => {
    suite
      .add('compareByJsonPath', compareByJsonPath)
      .add('compareByJSONPointer', compareByJSONPointer)
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
