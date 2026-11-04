import { arrayFixtures } from './arrays';
import { branchFixtures } from './branches';
import { derivedFixture } from './derived';
import { mountFixtures } from './mounts';

export const equivalentFixtures = [
  ...mountFixtures,
  ...branchFixtures,
  ...arrayFixtures,
  derivedFixture,
];
