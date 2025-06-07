import Benchmark from 'benchmark';
import jsonPath from 'fast-json-patch';

import { applyPatch } from '@winglet/json/pointer';

import { type Ratio, getRatio } from '@/benchmark/helpers/getRatio';

import { patches } from './data';

const applyPatchByJsonPath = () => {
  jsonPath.applyPatch(
    {
      user: {
        id: 1,
        name: 'Vincent',
        email: 'vincent@example.com',
        roles: ['user', 'admin'],
        settings: {
          theme: 'dark',
          notifications: true,
        },
      },
      projects: [
        { id: 'p1', title: 'Alpha' },
        { id: 'p2', title: 'Beta' },
      ],
    },
    patches as any,
    false,
    false,
  );
};

const applyPatchByJsonPathFast = () => {
  jsonPath.applyPatch(
    {
      user: {
        id: 1,
        name: 'Vincent',
        email: 'vincent@example.com',
        roles: ['user', 'admin'],
        settings: {
          theme: 'dark',
          notifications: true,
        },
      },
      projects: [
        { id: 'p1', title: 'Alpha' },
        { id: 'p2', title: 'Beta' },
      ],
    },
    patches as any,
  );
};

const applyPatchByJSONPointer = () => {
  applyPatch(
    {
      user: {
        id: 1,
        name: 'Vincent',
        email: 'vincent@example.com',
        roles: ['user', 'admin'],
        settings: {
          theme: 'dark',
          notifications: true,
        },
      },
      projects: [
        { id: 'p1', title: 'Alpha' },
        { id: 'p2', title: 'Beta' },
      ],
    },
    patches as any,
  );
};

const applyPatchByJSONPointerFast = () => {
  applyPatch(
    {
      user: {
        id: 1,
        name: 'Vincent',
        email: 'vincent@example.com',
        roles: ['user', 'admin'],
        settings: {
          theme: 'dark',
          notifications: true,
        },
      },
      projects: [
        { id: 'p1', title: 'Alpha' },
        { id: 'p2', title: 'Beta' },
      ],
    },
    patches as any,
    { immutable: false },
  );
};

const suite = new Benchmark.Suite();

export const run = () => {
  return new Promise<Ratio>((resolve) => {
    suite
      .add('applyPatchByJSONPointer', applyPatchByJSONPointer)
      .add('applyPatchByJSONPointerFast', applyPatchByJSONPointerFast)
      .add('applyPatchByJsonPath', applyPatchByJsonPath)
      .add('applyPatchByJsonPathFast', applyPatchByJsonPathFast)
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
