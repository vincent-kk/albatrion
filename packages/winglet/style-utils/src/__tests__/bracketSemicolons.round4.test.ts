import { expect, it } from 'vitest';
import { compressCss } from '../index';

it.each(['[a;;b]', '[a; ;b]', '[a;/**/;b]'])('preserves semicolons within bracket components: %s', component => {
  expect(compressCss('.a{x:' + component + ';y:z}')).toContain('[a;;b]');
});
