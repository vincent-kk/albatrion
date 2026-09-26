import assert from 'node:assert/strict';
import { object } from '../../round8/proto/loop-v4e.mjs';
assert.equal(Object.hasOwn(object(''), 'selection'), false, 'Q8 removes the selection state cell');
