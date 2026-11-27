import type { AjvInstance as Ajv } from '../types/AjvInstance';

/** Lists the native tables whose entries determine the next compilation. */
export const readApplicationProfile = (instance: Ajv): readonly object[] => [
  instance.opts, instance.opts.code ?? {},
  instance.schemas, instance.refs, instance.formats, instance.RULES.keywords, instance.RULES.all,
];
