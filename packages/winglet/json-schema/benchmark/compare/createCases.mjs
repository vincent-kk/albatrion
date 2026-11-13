import {
  genBranchy,
  genDeep,
  genMixed,
  genRefHeavy,
  genWide,
} from '../_lib.mjs';

/**
 * Create deterministic workloads shared by both builds, without timed corpus construction.
 * @returns {object[]} Named cases grouped by the operation whose cost they measure.
 */
export function createCases() {
  const corpora = {
    'branchy(6,5)': genBranchy(6, 5),
    'wide(10000)': genWide(10000),
    'deep(400)': genDeep(400),
    'mixed(4,7)': genMixed(4, 7),
  };
  const cases = [];
  for (const group of ['noCallback', 'noopEnterExit', 'asyncNoop'])
    for (const [name, schema] of Object.entries(corpora))
      cases.push({ name: `${group}/${name}`, group, schema });
  for (const reuseResolver of [false, true])
    cases.push({
      name: `refHeavy/${reuseResolver ? 'reuse' : 'create'}Resolver`,
      group: 'refHeavy',
      schema: genRefHeavy(300),
      reuseResolver,
    });
  for (const group of ['mutation', 'getValue'])
    for (const density of ['sparse', 'dense'])
      cases.push({
        name: `${group}/${density}`,
        group,
        density,
        schema: genWide(2000),
      });
  return cases;
}
