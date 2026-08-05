import type { Scope } from '../scope/index.js';

/** Coding agent whose asset locations this tool knows how to write. */
export type AgentType = 'claude' | 'codex';

/** Top-level asset category, taken from a manifest path's first segment. */
export type AssetKind = 'skills' | 'rules' | 'commands';

/** Every asset location one `(agent, scope)` pair resolves to. */
export interface AgentTarget {
  readonly agent: AgentType;
  readonly scope: Scope;
  /** Agent-neutral root the locations below were derived from. */
  readonly projectRoot: string;
  /** Copy root per kind; `null` when this agent does not place that kind as files. */
  readonly directoryRoots: Readonly<Record<AssetKind, string | null>>;
  /** Document that rules are merged into as marker blocks; `null` when rules are copied. */
  readonly rulesMergeFile: string | null;
  /** Kinds this agent has no location for, each with the reason to report. */
  readonly unsupported: Readonly<Partial<Record<AssetKind, string>>>;
  /** One line naming where this target writes, for renderers to show. */
  readonly description: string;
}

/** Where one manifest entry lands for one agent. */
export type Destination =
  | { readonly kind: 'file'; readonly dstAbs: string }
  | {
      readonly kind: 'block';
      readonly fileAbs: string;
      readonly blockId: string;
    }
  | { readonly kind: 'unsupported'; readonly reason: string };

/** Where to look for content this package once wrote but no longer ships. */
export type OrphanScan =
  | {
      readonly kind: 'directory';
      /** Absolute directory to walk. */
      readonly scanRoot: string;
      /** Prefix that turns a path under `scanRoot` back into a manifest path. */
      readonly relPathPrefix: string;
    }
  | {
      readonly kind: 'block-file';
      readonly fileAbs: string;
      /** Only blocks owned by this package are this scan's business. */
      readonly ownerPackage: string;
    };
