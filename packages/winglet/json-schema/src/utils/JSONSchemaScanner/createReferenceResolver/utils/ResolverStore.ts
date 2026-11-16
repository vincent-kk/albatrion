import { hasOwnProperty } from '@winglet/common-utils/lib';
import { escapeSegment, unescapeSegment } from '@winglet/json/pointer';

import { DEFAULT_KEYWORDS, Dialect } from '../../../../keyword';
import { JSONSchemaScanner } from '../../sync';
import { DEFAULT_DIALECT } from '../../utils/dialectFlag/defaultDialect';
import { detectDialect } from '../../utils/dialectFlag/detectDialect';
import { DIALECT_NAMES } from '../../utils/dialectFlag/dialectNames';
import { normalizeSchemaUri } from '../../utils/dialectFlag/normalizeSchemaUri';
import { JSONSchemaScanError } from '../../utils/error/JSONSchemaScanError';
import { JSONSchemaScanErrorCode } from '../../utils/error/JSONSchemaScanErrorCode';
import { buildKeywordMap } from '../../utils/keywordMap/buildKeywordMap';
import { ReferenceSkipReason } from '../../utils/referenceOutcome/ReferenceSkipReason';
import { cloneSchema } from '../../utils/schemaCopy/cloneSchema';
import type { ReferenceKeyword, ReferenceStep } from '../../utils/type';
import { resolveURI } from './resolveURI/resolveURI';
import { shortestReference } from './shortestReference';
import type {
  Anchor,
  DocumentRecord,
  Location,
  ReferenceResolverOptions,
  ResolverContext,
  Resource,
  SchemaValue,
} from './type';

/** These fields affect source scope and are removed only from proven relocatable template copies. */
const identifiers = [
  '$id',
  'id',
  '$schema',
  '$anchor',
  '$dynamicAnchor',
  '$recursiveAnchor',
  '$vocabulary',
];
/** Reference-shaped data is permitted below these annotation/assertion values without rewriting. */
const dataKeywords = ['default', 'const', 'enum', 'examples'];
/** An absolute URI starts with a scheme; any other address is relative to an unknown default base. */
const absoluteURI = /^[A-Za-z][A-Za-z0-9+.-]*:/;

/** Address registry and per-host template cache; scans are delegated to the public synchronous driver. */
export class ResolverStore {
  /** Initial document context is established before the indexing scanner starts. */
  public readonly initial: ResolverContext;
  /** Known resources include retrieval aliases and nested identifiers. */
  private resources = new Map<string, Resource>();
  /** Named fragments by document address; a legacy fragment identifier can name a document no schema declares. */
  private anchors = new Map<string, Map<string, Anchor>>();
  /** Cached lexical context changes; unchanged children use their parent directly. */
  private contexts = new WeakMap<
    ResolverContext,
    WeakMap<object, ResolverContext>
  >();
  /** Cached host-valid templates and preservation decisions. */
  private templates = new Map<Location, Map<Resource, ReferenceStep>>();
  /** Repeated written references avoid URI parsing after a definite target has been prepared. */
  private requests = new WeakMap<
    Resource,
    Partial<Record<ReferenceKeyword, Map<string, ReferenceStep>>>
  >();
  /** Custom metaschema URI aliases are normalized once. */
  private dialectAliases = new Map<string, Dialect>();

  /**
   * Eagerly index the root while retaining registered documents for lazy lookup.
   * @param schema Original input root, never modified.
   * @param options URI, vocabulary and explicit document configuration.
   */
  constructor(
    schema: SchemaValue,
    private readonly options: ReferenceResolverOptions = {},
  ) {
    for (const [uri, dialect] of Object.entries(options.dialects ?? {}))
      this.dialectAliases.set(normalizeSchemaUri(uri), dialect);
    this.initial = this.index(
      schema,
      resolveURI('', options.baseURI ?? '')?.split('#')[0] ?? '',
      options.defaultDialect ?? DEFAULT_DIALECT,
    );
  }

  /**
   * Enter a recognized lexical resource once; unchanged children share context identity.
   * @param parent Already-entered parent resource.
   * @param schema Original lexical child or host-valid copied child.
   * @returns The parent for a boolean schema, an identifier hidden by an old-dialect `$ref`,
   *   an absent or unresolvable identifier, or a non-empty-fragment identifier that cannot
   *   change the base; otherwise the cached context of the identified resource, or of a base
   *   change that declares no resource.
   */
  public child(parent: ResolverContext, schema: SchemaValue): ResolverContext {
    if (typeof schema === 'boolean') return parent;
    const enclosing = parent.resource;
    if (
      enclosing.dialect.startsWith('draft-') &&
      typeof schema.$ref === 'string'
    )
      return parent;
    const dialect = this.dialect(schema.$schema, enclosing.dialect);
    const id = dialect === Dialect.Draft04 ? schema.id : schema.$id;
    if (typeof id !== 'string') return parent;
    const absolute = resolveURI(id, enclosing.uri);
    if (absolute === undefined) return parent;
    const hash = absolute.indexOf('#');
    const uri = hash < 0 ? absolute : absolute.slice(0, hash);
    const named = hash >= 0 && hash < absolute.length - 1;
    if (named && (!dialect.startsWith('draft-') || uri === enclosing.uri))
      return parent;
    let children = this.contexts.get(parent);
    const existing = children?.get(schema);
    if (existing) return existing;
    const resource: Resource = {
      uri,
      document: enclosing.document,
      path: '',
      schema,
      dialect,
      dynamic: false,
    };
    if (named) resource.owner = enclosing.owner ?? enclosing;
    const context = { resource };
    if (!children) this.contexts.set(parent, (children = new WeakMap()));
    children.set(schema, context);
    return context;
  }

  /**
   * Resolve an official or caller-declared metaschema alias without changing unknown declarations.
   * @param uri Candidate declaration, possibly absent.
   * @param fallback Enclosing resource dialect.
   * @returns Recognized declaration or the fallback.
   */
  private dialect(uri: unknown, fallback: Dialect): Dialect {
    if (typeof uri !== 'string') return fallback;
    const flag = detectDialect(uri);
    if (flag !== undefined) return DIALECT_NAMES[flag];
    return this.dialectAliases.get(normalizeSchemaUri(uri)) ?? fallback;
  }

  /**
   * Index one document using the same reference/inert rules as public scans.
   * @param schema Original registered document.
   * @param retrieval Absolute retrieval URI or empty for the root.
   * @param fallback Default dialect for this document.
   * @returns Its already-entered root context.
   */
  private index(
    schema: SchemaValue,
    retrieval: string,
    fallback: Dialect,
  ): ResolverContext {
    const document: DocumentRecord = {
      uri: retrieval,
      paths: new Map(),
    };
    const dialect = this.dialect(
      typeof schema === 'object' ? schema.$schema : undefined,
      fallback,
    );
    let uri = retrieval;
    if (
      typeof schema === 'object' &&
      !(dialect.startsWith('draft-') && typeof schema.$ref === 'string')
    ) {
      const id = dialect === Dialect.Draft04 ? schema.id : schema.$id;
      if (typeof id === 'string')
        uri = resolveURI(id, retrieval)?.split('#')[0] ?? retrieval;
    }
    const initial: ResolverContext = {
      resource: {
        uri,
        document,
        path: '#',
        schema,
        dialect,
        dynamic: false,
      },
    };
    const stack: Array<{ depth: number; context: ResolverContext }> = [];
    const indexProvider =
      this.options.dialects === undefined
        ? undefined
        : {
            root: () => initial,
            child: (
              parent: ResolverContext,
              _keyword: string,
              child: SchemaValue,
            ) => this.child(parent, child),
            dialect: (context: ResolverContext) => context.resource.dialect,
            resolve: (): ReferenceStep => ({
              status: 'skipped',
              reason: ReferenceSkipReason.Unresolved,
            }),
          };
    new JSONSchemaScanner({
      options: {
        resolveReference: indexProvider,
        defaultDialect: initial.resource.dialect,
        keywords: this.options.keywords,
        additionalKeywords: this.options.additionalKeywords,
      },
      visitor: {
        enter: (entry) => {
          const parent = stack[stack.length - 1]?.context ?? initial;
          const context =
            entry.depth === 0
              ? initial
              : entry.inert
                ? parent
                : this.child(parent, entry.schema);
          if (
            entry.depth === 0 ||
            (context !== parent && !context.resource.owner)
          ) {
            if (context.resource.path && context.resource.path !== entry.path)
              this.duplicate(
                context.resource.uri,
                context.resource.document.uri + context.resource.path,
                retrieval + entry.path,
              );
            if (!context.resource.path) context.resource.path = entry.path;
            this.registerResource(context.resource);
          }
          const location: Location = {
            schema: entry.schema,
            path: entry.path,
            context,
            uri: '',
            inert: !!entry.inert,
          };
          document.paths.set(entry.path, location);
          if (!entry.inert && typeof entry.schema === 'object')
            this.registerAnchors(location);
          stack.push({ depth: entry.depth, context });
        },
        exit: () => {
          stack.pop();
        },
      },
    }).scan(schema);
    const prior = this.resources.get(retrieval);
    if (prior && (prior.document !== document || prior.path !== '#'))
      this.duplicate(
        retrieval,
        prior.document.uri + prior.path,
        retrieval + '#',
      );
    this.resources.set(retrieval, initial.resource);
    return initial;
  }

  /**
   * Register an identifier only if it denotes the same original location or is new.
   * @param resource Newly entered resource with its source pointer established.
   * @returns Nothing; conflicting declarations fail before any target is used.
   */
  private registerResource(resource: Resource): void {
    const previous = this.resources.get(resource.uri);
    if (
      previous &&
      (previous.document !== resource.document ||
        previous.path !== resource.path)
    )
      this.duplicate(
        resource.uri,
        previous.document.uri + previous.path,
        resource.document.uri + resource.path,
      );
    else this.resources.set(resource.uri, resource);
  }

  /**
   * Fail with both source addresses for an ambiguous identifier.
   * @param uri Conflicting address; the empty address of an anonymous document is shown as `#`.
   * @param first Earlier declaration.
   * @param second Later declaration.
   * @returns Never.
   */
  private duplicate(uri: string, first: string, second: string): never {
    throw new JSONSchemaScanError(
      JSONSchemaScanErrorCode.DuplicateIdentifier,
      (uri || '#') + ' declared at ' + first + ' and ' + second,
    );
  }

  /**
   * Register dialect-valid named aliases without interpreting inert identifiers.
   * @param location Original active schema occurrence.
   * @returns Nothing; static and dynamic aliases share collision checks.
   */
  private registerAnchors(location: Location): void {
    const schema = location.schema;
    if (typeof schema === 'boolean') return;
    const resource = location.context.resource,
      dialect = resource.dialect;
    if (schema.$recursiveAnchor === true && dialect === Dialect.Draft201909)
      resource.dynamic = true;
    const declarations: Array<[string, boolean]> = [];
    if (
      (dialect === Dialect.Draft201909 || dialect === Dialect.Draft202012) &&
      typeof schema.$anchor === 'string'
    )
      declarations.push([schema.$anchor, false]);
    if (
      dialect === Dialect.Draft202012 &&
      typeof schema.$dynamicAnchor === 'string'
    ) {
      declarations.push([schema.$dynamicAnchor, true]);
      resource.dynamic = true;
    }
    if (dialect.startsWith('draft-') && typeof schema.$ref !== 'string') {
      const id = dialect === Dialect.Draft04 ? schema.id : schema.$id;
      if (typeof id === 'string') {
        const absolute = resolveURI(id, resource.uri);
        if (absolute?.includes('#')) {
          try {
            const name = decodeURIComponent(
              absolute.slice(absolute.indexOf('#') + 1),
            );
            if (name && !name.startsWith('/')) declarations.push([name, false]);
          } catch {
            /* Invalid fragments remain unresolved. */
          }
        }
      }
    }
    if (declarations.length === 0) return;
    let names = this.anchors.get(resource.uri);
    if (!names) this.anchors.set(resource.uri, (names = new Map()));
    for (const [name, dynamic] of declarations) {
      const previous = names.get(name)?.location;
      if (
        previous &&
        (previous.context.resource.document !== resource.document ||
          previous.path !== location.path)
      )
        this.duplicate(
          resource.uri + '#' + name,
          previous.context.resource.document.uri + previous.path,
          resource.document.uri + location.path,
        );
      names.set(name, { location, dynamic });
    }
  }

  /**
   * Supply a registered external document lazily; no I/O occurs here.
   * @param uri Document address; only an absolute one is looked up among registrations.
   * @returns Whether the resource is known after checking registrations.
   */
  public ensure(uri: string): boolean {
    if (this.resources.has(uri)) return true;
    const source = this.options.resources;
    if (absoluteURI.test(uri) && source && hasOwnProperty(source, uri)) {
      this.index(
        source[uri],
        uri,
        this.options.defaultDialect ?? DEFAULT_DIALECT,
      );
      return this.resources.has(uri);
    }
    return false;
  }

  /**
   * Accept one explicitly loaded document and index it through the shared scanner.
   * @param uri Absolute retrieval URI.
   * @param schema Caller-supplied loaded schema.
   * @returns Nothing; collisions remain errors.
   */
  public add(uri: string, schema: SchemaValue): void {
    if (!this.resources.has(uri))
      this.index(schema, uri, this.options.defaultDialect ?? DEFAULT_DIALECT);
  }

  /**
   * Extract the absolute document address needed by an asynchronous loader.
   * @param reference Written reference.
   * @param context Current lexical host context.
   * @returns Absolute document URI, or undefined for an invalid reference, for a target that
   *   stays relative under an unknown base, and for a name that a fragment identifier already
   *   registered, which resolves without its document.
   */
  public documentURI(
    reference: string,
    context: ResolverContext,
  ): string | undefined {
    const target = resolveURI(reference, context.resource.uri);
    if (target === undefined || !absoluteURI.test(target)) return;
    const hash = target.indexOf('#');
    if (hash < 0) return target;
    const uri = target.slice(0, hash);
    let name: string;
    try {
      name = decodeURIComponent(target.slice(hash + 1));
    } catch {
      return uri;
    }
    return this.anchors.get(uri)?.has(name) ? undefined : uri;
  }

  /**
   * Resolve a pointer or named fragment to a canonical original occurrence.
   * @param absolute Fully resolved URI.
   * @returns Location and whether its named fragment is dynamic, or undefined.
   */
  private locate(absolute: string): Anchor | undefined {
    const hash = absolute.indexOf('#'),
      uri = hash < 0 ? absolute : absolute.slice(0, hash);
    const known = this.ensure(uri);
    let fragment: string;
    try {
      fragment = decodeURIComponent(hash < 0 ? '' : absolute.slice(hash + 1));
    } catch {
      return;
    }
    if (fragment && !fragment.startsWith('/'))
      return (
        this.anchors.get(uri)?.get(fragment) ??
        this.anchors.get(this.resources.get(uri)?.uri ?? uri)?.get(fragment)
      );
    if (!known) return;
    const resource = this.resources.get(uri)!;
    const path = resource.path + fragment;
    const existing = resource.document.paths.get(path);
    if (existing) return { location: existing, dynamic: false };
    let value: unknown = resource.schema,
      context: ResolverContext = { resource },
      pointer = resource.path;
    for (const raw of fragment ? fragment.slice(1).split('/') : []) {
      if (value === null || typeof value !== 'object') return;
      const key = unescapeSegment(raw);
      if (!hasOwnProperty(value, key)) return;
      value = (value as Record<string, unknown>)[key];
      pointer += '/' + escapeSegment(key);
      context = resource.document.paths.get(pointer)?.context ?? context;
    }
    if (
      !(
        typeof value === 'boolean' ||
        (value !== null && typeof value === 'object' && !Array.isArray(value))
      )
    )
      return;
    const location: Location = {
      schema: value as SchemaValue,
      path,
      context,
      uri: '',
      inert: true,
    };
    resource.document.paths.set(path, location);
    return { location, dynamic: false };
  }

  /**
   * Produce a tagged target or preservation decision for this host resource.
   * @param reference Written reference.
   * @param keyword Dialect-valid reference applicator.
   * @param host Already-entered host context.
   * @returns Canonical URI and a cached host-valid target, or an explicit reason.
   */
  public resolve(
    reference: string,
    keyword: ReferenceKeyword,
    host: ResolverContext,
  ): ReferenceStep {
    let requests = this.requests.get(host.resource);
    const prepared = requests?.[keyword]?.get(reference);
    if (prepared) return prepared;
    const absolute = resolveURI(reference, host.resource.uri);
    if (absolute === undefined)
      return { status: 'skipped', reason: ReferenceSkipReason.Unresolved };
    if (keyword === '$recursiveRef' && reference !== '#')
      return {
        status: 'skipped',
        reason: ReferenceSkipReason.Invalid,
        uri: absolute,
      };
    const found = this.locate(absolute);
    if (!found)
      return {
        status: 'skipped',
        reason: ReferenceSkipReason.Unresolved,
        uri: absolute,
      };
    const location = found.location;
    if (!location.uri) {
      const owner =
        location.context.resource.owner ?? location.context.resource;
      location.uri =
        owner.uri +
        '#' +
        encodeURI(location.path.slice(owner.path.length)).replace(/#/g, '%23');
    }
    if (
      (keyword === '$dynamicRef' && found.dynamic) ||
      (keyword === '$recursiveRef' &&
        typeof location.schema === 'object' &&
        location.schema.$recursiveAnchor === true)
    )
      return {
        status: 'skipped',
        reason: ReferenceSkipReason.Dynamic,
        uri: location.uri,
      };
    let hosts = this.templates.get(location);
    const cached = hosts?.get(host.resource);
    const result = cached ?? this.template(location, host.resource);
    if (!hosts) this.templates.set(location, (hosts = new Map()));
    hosts.set(host.resource, result);
    if (!requests) this.requests.set(host.resource, (requests = {}));
    (requests[keyword] ??= new Map()).set(reference, result);
    return result;
  }

  /**
   * Inspect and rewrite a complete target independently of public visitation limits.
   * @param location Original target and lexical provenance.
   * @param host Resource receiving the prepared copy.
   * @returns Immutable-by-contract template or relocation decision.
   */
  private template(location: Location, host: Resource): ReferenceStep {
    const relocation: ReferenceStep = {
      status: 'skipped',
      reason: ReferenceSkipReason.Relocation,
      uri: location.uri,
    };
    if (location.inert) return relocation;
    const relevant: Array<{
      source: Record<string, unknown>;
      copy: Record<string, unknown>;
      path: string;
      keys: readonly string[];
    }> = [];
    let hasIdentifiers = false;
    const target = cloneSchema(location.schema, (source, copy, path, keys) => {
      if (
        keys.some(
          (key) =>
            identifiers.includes(key) ||
            key === '$ref' ||
            key === '$dynamicRef' ||
            key === '$recursiveRef',
        )
      ) {
        if (keys.some((key) => identifiers.includes(key)))
          hasIdentifiers = true;
        relevant.push({
          source: source as Record<string, unknown>,
          copy: copy as Record<string, unknown>,
          path,
          keys,
        });
      }
    });
    const source = location.context.resource;
    if (source === host && !hasIdentifiers)
      return { status: 'resolved', uri: location.uri, target };
    if (
      source.dialect !== host.dialect ||
      (source !== host && (source.dynamic || !absoluteURI.test(source.uri)))
    )
      return relocation;
    if (relevant.length === 0)
      return { status: 'resolved', uri: location.uri, target };
    const positions = new Map<string, ResolverContext>(),
      data: string[] = [],
      containers = new Set<string>();
    const vocabulary = buildKeywordMap(
      (this.options.keywords ?? DEFAULT_KEYWORDS).concat(
        this.options.additionalKeywords ?? [],
      ),
    );
    let safe = true;
    const provider = {
      root: () => location.context,
      child: (parent: ResolverContext, _keyword: string, schema: SchemaValue) =>
        this.child(parent, schema),
      dialect: (context: ResolverContext) => context.resource.dialect,
      resolve: (): ReferenceStep => ({
        status: 'skipped',
        reason: ReferenceSkipReason.Unresolved,
      }),
    };
    new JSONSchemaScanner({
      options: {
        resolveReference: provider,
        keywords: this.options.keywords,
        additionalKeywords: this.options.additionalKeywords,
      },
      visitor: {
        enter: (entry) => {
          if (typeof entry.schema === 'object')
            for (const key of Object.keys(entry.schema)) {
              const descriptor = vocabulary.get(key),
                value = entry.schema[key];
              if (
                descriptor &&
                (descriptor.kind === 'schemaMap' ||
                  descriptor.kind === 'objectMap') &&
                value !== null &&
                typeof value === 'object' &&
                !Array.isArray(value)
              )
                containers.add(entry.path + '/' + escapeSegment(key));
            }
          if (entry.inert) return;
          const originalPath = location.path + entry.path.slice(1);
          const context =
            source.document.paths.get(originalPath)?.context ??
            location.context;
          positions.set(entry.path, context);
          if (
            context.resource !== source &&
            (context.resource.dialect !== host.dialect ||
              context.resource.dynamic)
          )
            safe = false;
          if (typeof entry.schema === 'object')
            for (const key of dataKeywords)
              if (hasOwnProperty(entry.schema, key))
                data.push(entry.path + '/' + key);
        },
      },
    }).scan(location.schema);
    hasIdentifiers = relevant.some(
      (item) =>
        !containers.has(item.path) &&
        !data.some(
          (prefix) =>
            item.path === prefix || item.path.startsWith(prefix + '/'),
        ) &&
        item.keys.some((key) => identifiers.includes(key)),
    );
    if (source === host && !hasIdentifiers)
      return { status: 'resolved', uri: location.uri, target };
    if (!safe) return relocation;
    for (const item of relevant) {
      if (containers.has(item.path)) continue;
      if (
        data.some(
          (prefix) =>
            item.path === prefix || item.path.startsWith(prefix + '/'),
        )
      )
        continue;
      const context = positions.get(item.path);
      if (!context) return relocation;
      if (item.keys.includes('$recursiveRef')) return relocation;
      for (const key of identifiers) delete item.copy[key];
      for (const key of ['$ref', '$dynamicRef']) {
        if (
          typeof item.source[key] !== 'string' ||
          (key === '$dynamicRef' &&
            context.resource.dialect !== Dialect.Draft202012)
        )
          continue;
        const uri = resolveURI(
          item.source[key] as string,
          context.resource.uri,
        );
        if (
          uri === undefined ||
          (!absoluteURI.test(uri) && host !== context.resource)
        )
          return relocation;
        item.copy[key] = shortestReference(uri, host.uri);
      }
    }
    return { status: 'resolved', uri: location.uri, target };
  }
}
