import Benchmark from 'benchmark';
import jsonPath from 'fast-json-patch';

import { compare } from '@winglet/common-utils';

import { type Ratio, getRatio } from '@/benchmark/helpers/getRatio';

import { value1, value2 } from './data';
import { compare as compareOrg } from './org';

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
    if (compare(prev2, value).length > 0) {
      prev2 = value;
    }
  }
};

let prev_org = value1;
const compareWithOrg = () => {
  for (const value of values) {
    if (compareOrg(prev_org, value).length > 0) {
      prev_org = value;
    }
  }
};

const suite = new Benchmark.Suite();

export const run = () => {
  return new Promise<Ratio>((resolve) => {
    suite
      .add('compareByJSONPointer', compareByJSONPointer)
      .add('compareByJsonPath', compareByJsonPath)
      .add('compareWithOrg', compareWithOrg)
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
