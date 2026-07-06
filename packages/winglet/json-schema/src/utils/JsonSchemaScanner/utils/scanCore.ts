import { isObject } from '@winglet/common-utils/filter';
import { clone } from '@winglet/common-utils/object';
import { JSONPointer } from '@winglet/json/pointer';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import type { SchemaEntry } from '../type';
import { getStackEntriesForNode } from './getStackEntriesForNode';
import { isDefinitionSchema } from './isDefinitionSchema';
import type { KeywordMap } from './keywordDescriptors';

/**
 * Effect kinds yielded by {@link scanCore} to its driver. Each corresponds to a
 * user-supplied callback that may be synchronous or asynchronous; the driver
 * decides how to execute it (the sync driver calls it directly, the async
 * driver awaits thenable results). Kept as plain integer constants for a fast
 * jump-table switch in the drivers.
 */
export const Effect = {
  Filter: 1,
  Mutate: 2,
  Enter: 3,
  Resolve: 4,
  Exit: 5,
} as const;

/** A request handed to the driver on each generator suspension. Reused across
 * yields (single-threaded, sequential DFS) to avoid per-node allocation. */
export interface ScanRequest<Schema extends UnknownSchema = UnknownSchema> {
  type: number;
  entry: SchemaEntry<Schema>;
  reference: string;
}

/** Configuration shared by both drivers. Callbacks are typed loosely because
 * the core never invokes them — it only yields; the driver invokes them. */
export interface ScanConfig<
  Schema extends UnknownSchema = UnknownSchema,
  ContextType = void,
> {
  context: ContextType | undefined;
  maxDepth: number | undefined;
  cloneResolvedSchema: boolean;
  cacheResolvedReference: boolean;
  keywordMap: KeywordMap;
  resolves: Array<[path: string, schema: UnknownSchema]>;
  filter?: (entry: SchemaEntry<Schema>, context?: ContextType) => unknown;
  mutate?: (entry: SchemaEntry<Schema>, context?: ContextType) => unknown;
  enter?: (entry: SchemaEntry<Schema>, context?: ContextType) => unknown;
  exit?: (entry: SchemaEntry<Schema>, context?: ContextType) => unknown;
  resolveReference?: (
    reference: string,
    entry: SchemaEntry<Schema>,
    context?: ContextType,
  ) => unknown;
}

interface Frame<Schema extends UnknownSchema> {
  entry: SchemaEntry<Schema>;
  /** false → not yet visited (VISIT phase); true → children done (EXIT phase) */
  exit: boolean;
}

/**
 * The single traversal engine shared by the sync and async scanners.
 *
 * Performs an explicit-stack (non-recursive, overflow-safe for deep schemas)
 * depth-first traversal and yields a {@link ScanRequest} whenever a user
 * callback needs to run. All non-suspending work — cycle detection, `$ref`
 * inlining (with optional cloning / caching), depth limiting, child discovery —
 * happens inline here, so both drivers stay tiny and behaviourally identical.
 *
 * Phase fusion: Enter → Reference → child discovery run in a single stack visit;
 * only nodes that actually have children keep an EXIT marker frame on the stack.
 * Leaves exit inline. This removes the previous per-node phase Map entirely.
 *
 * @yields ScanRequest — the driver executes the corresponding callback and
 *   resumes the generator with its (already-awaited, for async) result.
 */
export function* scanCore<
  Schema extends UnknownSchema = UnknownSchema,
  ContextType = void,
>(
  rootSchema: Schema,
  config: ScanConfig<Schema, ContextType>,
): Generator<ScanRequest<Schema>, void, unknown> {
  const {
    maxDepth,
    cloneResolvedSchema,
    cacheResolvedReference,
    keywordMap,
    resolves,
  } = config;
  const hasFilter = config.filter !== undefined;
  const hasMutate = config.mutate !== undefined;
  const hasEnter = config.enter !== undefined;
  const hasExit = config.exit !== undefined;
  const hasResolve = config.resolveReference !== undefined;

  const stack: Frame<Schema>[] = [
    {
      entry: {
        schema: rootSchema,
        path: JSONPointer.Fragment,
        dataPath: JSONPointer.Root,
        depth: 0,
      } as SchemaEntry<Schema>,
      exit: false,
    },
  ];
  const visitedReference = new Set<string>();
  const referenceCache = cacheResolvedReference
    ? new Map<string, UnknownSchema | undefined>()
    : undefined;

  // Reused request object (safe: DFS is sequential, driver reads before resume).
  const request: ScanRequest<Schema> = {
    type: 0,
    entry: stack[0].entry,
    reference: '',
  };

  while (stack.length > 0) {
    const frame = stack[stack.length - 1];
    const entry = frame.entry;

    if (frame.exit) {
      if (hasExit) {
        request.type = Effect.Exit;
        request.entry = entry;
        yield request;
      }
      if (
        entry.referenceResolved &&
        entry.referencePath &&
        visitedReference.has(entry.referencePath)
      )
        visitedReference.delete(entry.referencePath);
      stack.pop();
      continue;
    }

    // --- VISIT phase (Enter + Reference + child discovery, fused) ---
    if (hasFilter) {
      request.type = Effect.Filter;
      request.entry = entry;
      const keep = yield request;
      if (!keep) {
        stack.pop();
        continue;
      }
    }

    if (hasMutate) {
      request.type = Effect.Mutate;
      request.entry = entry;
      const mutated = yield request;
      if (mutated !== undefined) {
        entry.schema = mutated as Schema;
        resolves.push([entry.path, mutated as UnknownSchema]);
      }
    }

    if (hasEnter) {
      request.type = Effect.Enter;
      request.entry = entry;
      yield request;
    }

    let descend = true;
    const schema = entry.schema;
    if (isObject(schema) && typeof schema.$ref === 'string') {
      const reference = schema.$ref;
      if (visitedReference.has(reference)) {
        entry.hasReference = true;
        entry.referenceSkipped = 'cycle';
        descend = false;
      } else {
        // `isDefinition` is only meaningful (and only computed) when a resolver
        // exists — matching the original short-circuit. The resolve decision
        // stays exactly `hasResolve && !isDefinitionSchema(path)`.
        const isDefinition = hasResolve && isDefinitionSchema(entry.path);
        let resolved: UnknownSchema | undefined;
        if (hasResolve && !isDefinition) {
          if (referenceCache !== undefined && referenceCache.has(reference)) {
            resolved = referenceCache.get(reference);
          } else {
            request.type = Effect.Resolve;
            request.entry = entry;
            request.reference = reference;
            resolved = (yield request) as UnknownSchema | undefined;
            if (referenceCache !== undefined)
              referenceCache.set(reference, resolved);
          }
        }
        if (resolved) {
          const inlined = cloneResolvedSchema
            ? (clone(resolved) as UnknownSchema)
            : resolved;
          resolves.push([entry.path, inlined]);
          entry.schema = inlined as Schema;
          entry.referencePath = reference;
          entry.referenceResolved = true;
          visitedReference.add(reference);
        } else {
          entry.hasReference = true;
          // 'definition' only when the node genuinely lives under $defs/definitions;
          // a missing resolver or a resolver that returned nothing is 'unresolved'.
          entry.referenceSkipped = isDefinition ? 'definition' : 'unresolved';
          descend = false;
        }
      }
    }

    if (descend && !(maxDepth !== undefined && entry.depth + 1 > maxDepth)) {
      const children = getStackEntriesForNode(
        entry,
        keywordMap,
      ) as SchemaEntry<Schema>[];
      const count = children.length;
      if (count > 0) {
        frame.exit = true; // keep this frame as an EXIT marker
        for (let i = count - 1; i >= 0; i--)
          stack.push({ entry: children[i], exit: false });
        continue;
      }
    }

    // Leaf (no children pushed): perform EXIT inline.
    if (hasExit) {
      request.type = Effect.Exit;
      request.entry = entry;
      yield request;
    }
    if (
      entry.referenceResolved &&
      entry.referencePath &&
      visitedReference.has(entry.referencePath)
    )
      visitedReference.delete(entry.referencePath);
    stack.pop();
  }
}
