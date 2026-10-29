import fs from 'node:fs';
import path from 'node:path';

/** Preserve a failed command receipt instead of parsing its empty stdout as successful evidence. */
export function readWindowCommandResult(root, label) {
  const command = JSON.parse(
    fs.readFileSync(path.join(root, label + '.command.json'), 'utf8'),
  );
  return command.code === 0
    ? {
        completed: true,
        command,
        result: JSON.parse(
          fs.readFileSync(path.join(root, label + '.log'), 'utf8'),
        ),
      }
    : {
        completed: false,
        command,
        stderr: fs.readFileSync(path.join(root, label + '.stderr.log'), 'utf8'),
      };
}
