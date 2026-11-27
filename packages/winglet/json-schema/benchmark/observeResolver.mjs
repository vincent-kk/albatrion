/** Preserve the complete provider protocol while observing each resolve invocation. */
export function observeResolver(resolver, observe) {
  return {
    root: (schema) => resolver.root(schema),
    child: resolver.child && ((...args) => resolver.child(...args)),
    dialect: (context) => resolver.dialect(context),
    resolve: (...args) => {
      observe(...args);
      return resolver.resolve(...args);
    },
  };
}
