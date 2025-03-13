import Benchmark from 'benchmark';

import { type Ratio, getRatio } from '@/benchmark/helpers/getRatio';

import { data } from './data';
import { stringifyObject as legacySerialize } from './legacyStringifyObject';
import { stableHash } from './org';
import { serialize } from './serialize';
import { serializeObject } from './serializeObject';
import { serializeSingleDepth } from './serializeSingleDepth';
import { serializeWithFullSortedKeys } from './serializeWithFullSortedKeys';

const suite = new Benchmark.Suite();

export const run = () => {
  return new Promise<Ratio>((resolve) => {
    suite
      .add('legacySerialize', function () {
        legacySerialize(data);
      })
      .add('serializeWithFullSortedKeys', function () {
        serializeWithFullSortedKeys(data);
      })
      .add('serializeObject', function () {
        serializeObject(data);
      })
      .add('serializeSingleDepth', function () {
        serializeSingleDepth(data);
      })
      .add('serialize', function () {
        serialize(data);
      })
      .add('stableHash', function () {
        stableHash(data);
      })
      .add('JSON.stringify', function () {
        JSON.stringify(data);
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
