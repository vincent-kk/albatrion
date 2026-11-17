/**
 * Parse `--flag value` and `--flag=value` pairs for the package scripts.
 * @param {string[]} args - Arguments after the script path.
 * @param {string[]} known - Accepted flag names; any other flag throws.
 * @returns {Record<string, string>} Flag values; positionals land under "_" joined by newlines.
 */
export function parseScriptArgs(args, known) {
  const values = {};
  const positionals = [];
  for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    if (!argument.startsWith('--')) {
      positionals.push(argument);
      continue;
    }
    const [flag, inline] = argument.split(/=(.*)/s);
    if (!known.includes(flag)) throw new Error(`Unknown option: ${flag}`);
    const value = inline ?? args[++index];
    if (value === undefined || flag in values)
      throw new Error(`Missing or duplicate option: ${flag}`);
    values[flag] = value;
  }
  values._ = positionals.join('\n');
  return values;
}
