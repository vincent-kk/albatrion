import Benchmark from 'benchmark';
import { cloneDeep as esToolsClone } from 'es-toolkit';

import { type Ratio, getRatio } from '@/benchmark/helpers/getRatio';
import { clone } from '@/common-utils/utils/object/clone';

import { data } from './data';

const sample = data;

const suite = new Benchmark.Suite();

export const run = () => {
  return new Promise<Ratio>((resolve) => {
    suite
      .add('JSON clone', function () {
        JSON.parse(JSON.stringify(sample));
      })
      .add('clone', function () {
        clone(sample);
      })
      .add('es-toolkit cloneDeep', function () {
        esToolsClone(sample);
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
