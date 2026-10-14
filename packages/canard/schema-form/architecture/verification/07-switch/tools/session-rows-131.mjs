import assert from 'node:assert/strict';
import fs from 'node:fs';

/** Expand canonical 129 setting presets, or JSON row keys/settings, into explicit validated measurement rows. */
export function sessionRows131(input, lane) {
  const core = ['sample-0', 'sample-1', 'sample-2', 'sample-3', 'flat-50', 'flat-100', 'flat-500', 'nested-d3-f4',
    'nested-d5-f4', 'array-100', 'array-500', 'array-1000', 'computed-visible-derived', 'oneOf-5', 'oneOf-10', 'oneOf-20', 'oneOf-40', 'if-then'];
  const react = [...core.filter(name => !['if-then', 'oneOf-40'].includes(name)), 'array-push-100', 'array-replace-200', 'array-push-remove-100'];
  const modes = (fixture, validation) => lane === 'core'
    ? ['mount', 'update', 'update-first', 'update-later', ...(/^oneOf-/.test(fixture) && validation === 'off' ? ['axis-update', 'axis-first', 'axis-later'] : [])]
    : ['mount-wall', 'mount-active', 'update-wall', 'update-active', 'profiler-mount', 'profiler-update', 'commits-mount', 'commits-update'];
  const expand = (fixture, validation = 'off', chosen) => {
    assert((lane === 'core' ? core : react).includes(fixture), `Unsupported ${lane} fixture: ${fixture}`);
    assert(['off', 'on'].includes(validation) && (lane === 'core' || validation === 'off'), `Unsupported validation: ${fixture}/${validation}`);
    const official = modes(fixture, validation), all = [...official, ...official.map(mode => `${mode}-nogc`)];
    return (chosen ?? all).map(mode => {
      assert(all.includes(mode), `Unsupported row: ${fixture}/${validation}/${mode}`);
      return { key: `${fixture}/${validation}/${mode}`, fixture, validation, mode };
    });
  };
  let rows;
  if (['all', `${lane}-129`, 'watch', 'smoke', ...(lane === 'react' ? ['react-129-main', 'react-129-large', 'react-129-array-1000', 'react-129-nested-d5'] : [])].includes(input)) {
    const fixtures = input === 'smoke' ? (lane === 'core' ? ['if-then', 'oneOf-5'] : ['flat-50', 'array-100']) : lane === 'core' ? core : react;
    rows = fixtures.flatMap(fixture => (lane === 'core' && /^(oneOf-|if-then)/.test(fixture) ? ['off', 'on'] : ['off']).flatMap(validation => expand(fixture, validation)));
    if (input === 'react-129-main') rows = rows.filter(row => !['array-1000', 'nested-d5-f4'].includes(row.fixture));
    if (input === 'react-129-large') rows = rows.filter(row => ['array-1000', 'nested-d5-f4'].includes(row.fixture));
    if (input === 'react-129-array-1000') rows = rows.filter(row => row.fixture === 'array-1000');
    if (input === 'react-129-nested-d5') rows = rows.filter(row => row.fixture === 'nested-d5-f4');
    if (input === 'watch') rows = rows.filter(row => row.key.includes('/axis-') || row.fixture === 'if-then' ||
      ['computed-visible-derived', 'sample-1', 'array-500', 'array-replace-200', 'flat-50', 'oneOf-20'].includes(row.fixture));
  } else {
    const json = JSON.parse(fs.readFileSync(input, 'utf8')), list = Array.isArray(json) ? json : json.rows;
    assert(Array.isArray(list) && list.length, '--rows JSON must be a nonempty array or { rows: [...] }');
    rows = list.flatMap(item => {
      if (typeof item === 'string' || item.key) {
        const [fixture, validation, mode, extra] = (typeof item === 'string' ? item : item.key).split('/');
        assert(fixture && validation && !extra);
        return expand(fixture, validation, mode ? [mode] : undefined);
      }
      return expand(item.fixture, item.validation, item.modes);
    });
  }
  assert(rows.length && rows.every((row, index) => rows.findIndex(other => other.key === row.key) === index), 'Duplicate or empty row selection');
  return rows;
}
