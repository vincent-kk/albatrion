import { ValidationMode } from '../../../../src';

/**
 * Expand the public validation bitmask into names used by the settings panel.
 * @param mode - Effective Form validation mode, including None.
 * @returns Joined public flag names instead of their numeric representation.
 */
export function describeValidationMode(mode: ValidationMode) {
  return [mode & ValidationMode.OnChange ? 'OnChange' : '', mode & ValidationMode.OnRequest ? 'OnRequest' : ''].filter(Boolean).join(' | ') || 'None';
}
