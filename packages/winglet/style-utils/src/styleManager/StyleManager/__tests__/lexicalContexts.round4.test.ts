import { expect, it } from 'vitest';
import { RuleScoper } from '../utils/RuleScoper';
import { normalizeCss } from '../../../__tests__/helpers/normalizeCss';

it.each([
  '.a{background:url(a{b)}',
  '.a{background:url(a\\}b)}',
  '.a{--x:f([) {x}])}',
  '[data-x=a,b]{x:y}',
  '.a:is(.b,.c){x:y}',
])('round-4 scoper shares lexical boundaries: %s', first => {
  const source = first + '.b{color:red}';
  const expected = '.s ' + first + '.s .b{color:red}';
  expect(normalizeCss(new RuleScoper(source, '.s').scopeSheet())).toEqual(normalizeCss(expected));
});
