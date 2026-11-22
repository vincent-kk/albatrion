import type Ajv from 'ajv';

/**
 * Generate native-compatible decimal tolerance with an explicit zero-divisor rejection.
 * @param context - AJV's supported inline-keyword compilation context.
 * @param keyword - Keyword address supplied by AJV; this definition owns multipleOf.
 * @param schema - Numeric divisor; nonnumeric definitions fail compilation.
 * @returns Statements assigning AJV's validity flag and native-shaped errors.
 * @throws Error when the divisor is not numeric.
 */
export const createMultipleOfCode = (
  context: Ajv.CompilationContext,
  keyword: string,
  schema: unknown,
): string => {
  if (typeof schema !== 'number') throw new Error('multipleOf must be number');
  const data = `data${context.dataLevel || ''}`;
  const division = `division${context.level}`;
  const valid = `valid${context.level}`;
  const precision = context.opts.multipleOfPrecision;
  const invalid = precision
    ? `Math.abs(Math.round(${division}) - ${division}) > 1e-${precision}`
    : `${division} !== parseInt(${division})`;
  const message =
    context.opts.messages === false
      ? ''
      : `, message: ${context.util.toQuotedString(`should be multiple of ${schema}`)}`;
  const verbose = context.opts.verbose
    ? `, schema: ${schema}, parentSchema: validate.schema${context.schemaPath}, data: ${data}`
    : '';
  return `var ${division}; ${valid} = !(${schema} === 0 || (${division} = ${data}/${schema}, ${invalid}));
    if (!${valid}) {
      var err = { keyword: ${context.util.toQuotedString(keyword)}, dataPath: (dataPath || '') + ${context.errorPath}, schemaPath: ${context.util.toQuotedString(`${context.errSchemaPath}/${keyword}`)}, params: { multipleOf: ${schema} }${message}${verbose} };
      if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;
    }`;
};
