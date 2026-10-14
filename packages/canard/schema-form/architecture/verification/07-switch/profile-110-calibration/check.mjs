// CLI regression probe for 95C-01 calibration A; no product code is loaded.
import assert from 'node:assert/strict';
import { endpointDifference95c01 } from '../tools/endpointDifference95c01.mjs';

// Marginal medians differ by 99, although the median paired tail is 1.
assert.equal(endpointDifference95c01([0, 100, 101], [0, 1, 100]), 1);
assert.equal(endpointDifference95c01([-2, 98, 99], [-1, 0, 99]), 0);
assert.throws(() => endpointDifference95c01([1], [1, 2]));
console.log('PAIRED_ENDPOINT_95C01_OK');
