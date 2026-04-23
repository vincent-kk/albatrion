import { confirm } from '@inquirer/prompts';
import pc from 'picocolors';

export async function confirmForceAsync(
  divergedCount: number,
  orphanCount: number,
  relPaths: string[],
): Promise<boolean> {
  const extra = Math.max(0, divergedCount + orphanCount - relPaths.length);

  const divergedPart = pc.red(pc.bold(`${divergedCount} diverged file(s)`));
  const orphanPart =
    orphanCount > 0
      ? ` and ${pc.red(pc.bold(`delete ${orphanCount} orphan(s)`))}`
      : '';

  process.stderr.write(
    `${pc.yellow(pc.bold('!'))} This will overwrite ${divergedPart}${orphanPart}:\n`,
  );
  for (const p of relPaths) {
    process.stderr.write(`  ${pc.dim('-')} ${p}\n`);
  }
  if (extra > 0) {
    process.stderr.write(`  ${pc.dim(`... and ${extra} more`)}\n`);
  }

  const answer = await confirm({
    message: pc.bold('Do you have these in git? Proceed?'),
    default: false,
  });
  return answer;
}
