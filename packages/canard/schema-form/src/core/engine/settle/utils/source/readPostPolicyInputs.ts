import type { BlueprintNode } from '../../../blueprint';
import type { CandidateInput } from '../../types/candidateInput';
import { isPlain } from '../input/isPlain';

/** One surviving post-policy placement with its authored whole boundary. */
interface PostPolicyWrite {
  /** Pointer relative to the original exit owner. */
  readonly suffix: string;
  /** Declaration resolving this candidate. */
  readonly template: BlueprintNode;
  /** Input that still has an eligible right. */
  readonly value: unknown;
  /** Whether the original boundary still covers this whole binding. */
  readonly isWhole: boolean;
}

/**
 * Project a revived record's current rights in authored child order.
 * @param right - Original payload after later writes selected their own channels
 * @returns Eligible writes; omitted keys never reapply over the exit policy
 */
export function* readPostPolicyInputs(
  right: CandidateInput,
): Iterable<PostPolicyWrite> {
  const { suffix, template, value, children } = right;
  if (!right.isApplied) {
    yield { suffix, template, value, isWhole: true };
    return;
  }
  const object =
    template.kind === 'object' &&
    template.strategy === 'branch' &&
    isPlain(value);
  if (!right.isSuperseded && !right.hasSupersededChild) {
    yield { suffix, template, value, isWhole: !object };
    return;
  }
  if (object && !right.isSuperseded) {
    const extras = Object.fromEntries(
      Object.entries(value).filter(
        ([name]) => !template.childEntries.some((entry) => entry.name === name),
      ),
    );
    if (Object.keys(extras).length)
      yield { suffix, template, value: extras, isWhole: false };
  }
  for (const child of children ?? []) yield* readPostPolicyInputs(child);
}
