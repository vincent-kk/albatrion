// Node invokes this resolver hook during a separate provenance replay.
import { appendFileSync } from 'node:fs';

export async function resolve(specifier, context, nextResolve) {
  const result = await nextResolve(specifier, context);
  appendFileSync(
    process.env.SPEED_TRACE_FILE,
    `SPEED_RESOLVE ${JSON.stringify({ specifier, parent: context.parentURL, url: result.url })}\n`,
  );
  return result;
}
