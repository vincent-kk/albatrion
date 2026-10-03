/** Before-change evidence: the round9 model cannot express the requested policy matrix. */
import assert from 'node:assert/strict';
import { NEW_SWITCHES } from '../round9/proto/loop-v5.mjs';
assert.equal(Object.hasOwn(NEW_SWITCHES, 'CLEAR_PRIORITY'), true, 'round10 needs CLEAR_PRIORITY');
