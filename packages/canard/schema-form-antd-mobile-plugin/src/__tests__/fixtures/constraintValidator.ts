import type {
  JSONSchema,
  SchemaFormPlugin,
  ValidationIssue,
} from '@canard/schema-form';

/** Test-only numeric constraints use the documented 1e-9 quotient tolerance; guards and other JSON Schema vocabularies are outside these UI scenes. */
export const constraintValidator = {
  validator: {
    compile(schema) {
      return (value) => {
        const issues: ValidationIssue[] = [];
        const pending: { schema: JSONSchema; value: unknown; path: string }[] =
          [{ schema, value, path: '' }];
        for (const entry of pending) {
          const { schema: rule, value: data, path } = entry;
          const reject = (keyword: string) =>
            issues.push({
              keyword,
              dataPath: path,
              message: `${keyword} constraint`,
            });
          if (typeof data === 'number') {
            if (rule.type === 'integer' && !Number.isInteger(data))
              reject('type');
            if (typeof rule.minimum === 'number' && data < rule.minimum)
              reject('minimum');
            if (typeof rule.maximum === 'number' && data > rule.maximum)
              reject('maximum');
            if (typeof rule.multipleOf === 'number') {
              const quotient = data / rule.multipleOf;
              if (
                !Number.isFinite(quotient) ||
                Math.abs(quotient - Math.round(quotient)) > 1e-9
              )
                reject('multipleOf');
            }
          } else if (Array.isArray(data)) {
            if (
              typeof rule.minItems === 'number' &&
              data.length < rule.minItems
            )
              reject('minItems');
            if (
              typeof rule.maxItems === 'number' &&
              data.length > rule.maxItems
            )
              reject('maxItems');
            for (const [index, item] of data.entries()) {
              const child = Array.isArray(rule.items)
                ? rule.items[index]
                : rule.items;
              if (child && typeof child === 'object')
                pending.push({
                  schema: child,
                  value: item,
                  path: `${path}/${index}`,
                });
            }
          } else if (data && typeof data === 'object') {
            if (
              typeof rule.minProperties === 'number' &&
              Object.keys(data).length < rule.minProperties
            )
              reject('minProperties');
            for (const [key, child] of Object.entries(rule.properties ?? {})) {
              if (child && typeof child === 'object')
                pending.push({
                  schema: child,
                  value: Reflect.get(data, key),
                  path: `${path}/${key.replace(/~/g, '~0').replace(/\//g, '~1')}`,
                });
            }
          }
        }
        return issues.length ? issues : null;
      };
    },
    compileGuard() {
      throw new Error('UI constraint fixture does not evaluate guards');
    },
  },
} satisfies SchemaFormPlugin;
