import type AjvModule from 'ajv';

type Ajv = AjvModule.Ajv;

/** Lists the native tables whose entries determine the next compilation. */
export const readApplicationProfile = (instance: Ajv): readonly object[] => [
  instance._opts, instance.RULES.custom,
  instance._schemas, instance._refs, instance._formats, instance.RULES.keywords, instance.RULES.all,
];
