/**
 * Control option within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} schema schema input accepted by the regression model.
 * @param {*} key key input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function controlOption(context, schema, key) {
  if (schema?.controls && Object.hasOwn(schema.controls, key)) return schema.controls[key];
  if (key === 'clearValue' && schema?.controls && Object.hasOwn(schema.controls, 'unsetValue')) return schema.controls.unsetValue;
  return schema?.control && Object.hasOwn(schema.control, key) ? schema.control[key] : schema?.[`&${key}`];
}
