import childProcess from 'node:child_process';
import { once } from 'node:events';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

import { isArray } from '@winglet/common-utils/filter';

import type { SettlementContext } from '../../../type';
import type { ChildSelectionRuntimeNode } from './ChildSelectionRuntimeNode';
import { normalizeSelectionObservation } from './normalizeSelectionObservation';
import { renameControlsFields } from './renameControlsFields';
import { renameFieldNodeNames } from './renameFieldNodeNames';
import { rewordControlsMessages } from './rewordControlsMessages';
import type { ChildSelectionHistory } from './runChildSelectionHistory';

/** Runtime entry observed by the same authored history in both source revisions. */
interface ChildSelectionRuntime {
  /** Execute public writes and return values, publication points and actual events. */
  run(fixture: ChildSelectionHistory): {
    results: unknown[];
    points: unknown[];
  };
}

/** Pinned-layout rewrites; the constants entry follows the separate constants move. */
const PINNED_PATH_REWRITES = [
  [/\/core\/dispatch\//g, '/core/engine/write/'],
  [
    /\/core\/(record|blueprint|behaviors|validation|navigation|settle|types|utils)\//g,
    '/core/engine/$1/',
  ],
  [/\/core\/FieldNode\//g, '/core/surface/'],
  [
    /\/core\/(?:surface\/)?nodeFromJSONSchema\.ts$/g,
    '/__tests__/fixtures/nodeFromJSONSchema.ts',
  ],
  [/\/app\/constants\//g, '/constants/'],
] as const;

/** Map a repository-relative pinned path into the current layout without I/O. */
const mapPinnedPath = (path: string): string =>
  PINNED_PATH_REWRITES.reduce(
    (current, [pattern, replacement]) => current.replace(pattern, replacement),
    path,
  );

/**
 * Bundle a pinned local revision with runtime observers; never assert product source text.
 * @param revision - Read-only git revision, or undefined for current source
 * @param overrides - Scratch source copies substituted at their original resolve directory
 * @returns A self-contained differential runtime after every build service exits naturally
 */
export const buildChildSelectionRuntime = async (
  revision?: string,
  overrides: Readonly<Record<string, string>> = {},
): Promise<ChildSelectionRuntime> => {
  const packageRoot = resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../../../../../../..',
  );
  const worktree = resolve(packageRoot, '../../..');
  const require = createRequire(resolve(packageRoot, 'package.json'));
  delete require.cache[require.resolve('esbuild')];
  const { build } = require('esbuild') as typeof import('esbuild');
  const points: unknown[] = [];
  const observer = (
    label: string,
    node: ChildSelectionRuntimeNode,
    context: SettlementContext<ChildSelectionRuntimeNode>,
    before: readonly unknown[],
  ): void => {
    if (
      label === 'updateOutput' &&
      before[0] === node.local &&
      before[1] === node.emit
    )
      return;
    points.push(
      normalizeSelectionObservation({
        label,
        path: node.path,
        value: node.local,
        emit: node.emit,
        children: node.children,
        schema: node.schema,
        changedNodes: [...context.changedNodes],
        pendingOutputs: [...(context.pendingOutputs ?? [])],
        gateThrowVersion: context.gateThrowVersion,
        deliveries: [...(context.root.runtime.deliveries ?? [])].map(
          (candidate) => ({
            node: candidate,
            event: candidate.pendingDelivery,
            revisions: candidate.revisionLedger,
          }),
        ),
      }),
    );
  };
  const services: childProcess.ChildProcess[] = [];
  const serviceFailures: string[] = [];
  const spawn = childProcess.spawn;
  childProcess.spawn = ((...args: Parameters<typeof childProcess.spawn>) => {
    const child = Reflect.apply(spawn, childProcess, args);
    if (
      String(args[0]).includes('esbuild') &&
      isArray(args[1]) &&
      args[1].some((arg) => String(arg).startsWith('--service='))
    )
      services.push(child);
    return child;
  }) as typeof childProcess.spawn;
  /** Source files of the pinned revision under today's names, mapped to their path in that revision; relative imports resolve against this map, not the working tree. */
  const pinnedPaths = revision
    ? new Map(
        childProcess
          .execFileSync(
            'git',
            [
              'ls-tree',
              '-r',
              '--name-only',
              revision,
              '--',
              relative(worktree, resolve(packageRoot, 'src')),
            ],
            { cwd: worktree, encoding: 'utf8', timeout: 10000 },
          )
          .split('\n')
          .map(
            (path) =>
              [mapPinnedPath(renameFieldNodeNames(path)), path] as const,
          ),
      )
    : null;
  let output: string;
  try {
    const result = await build({
      stdin: {
        contents:
          "export { runChildSelectionHistory } from './src/core/engine/settle/__tests__/fixtures/childSelection/runChildSelectionHistory';",
        loader: 'ts',
        resolveDir: packageRoot,
      },
      write: false,
      bundle: true,
      packages: 'external',
      platform: 'node',
      format: 'cjs',
      define: { 'process.env.NODE_ENV': '"development"' },
      plugins: [
        {
          name: 'local-child-selection-observers',
          setup(builder) {
            builder.onResolve(
              { filter: /^(?:\.\.?\/|@\/schema-form\/)/ },
              (args) => {
                if (!pinnedPaths || args.kind === 'entry-point') return;
                const importer = relative(worktree, args.importer);
                const pinnedImporter = !importer.includes('/__tests__/')
                  ? pinnedPaths.get(importer)
                  : undefined;
                const base = args.path.startsWith('@/schema-form/')
                  ? resolve(
                      packageRoot,
                      'src',
                      args.path.slice('@/schema-form/'.length),
                    )
                  : resolve(
                      pinnedImporter
                        ? dirname(resolve(worktree, pinnedImporter))
                        : dirname(args.importer),
                      args.path,
                    );
                for (const suffix of [
                  '',
                  '.ts',
                  '.tsx',
                  '/index.ts',
                  '/index.tsx',
                ]) {
                  const candidate = resolve(
                    worktree,
                    mapPinnedPath(
                      renameFieldNodeNames(
                        relative(worktree, `${base}${suffix}`),
                      ),
                    ),
                  );
                  if (pinnedPaths.has(relative(worktree, candidate)))
                    return { path: candidate };
                }
                return;
              },
            );
            builder.onLoad({ filter: /\.(ts|tsx)$/ }, (args) => {
              const path = relative(worktree, args.path);
              if (
                !path.startsWith('packages/') ||
                path.includes('node_modules')
              )
                return;
              let contents = overrides[path]
                ? readFileSync(overrides[path], 'utf8')
                : revision && !path.includes('/__tests__/')
                  ? renameControlsFields(
                      rewordControlsMessages(
                        renameFieldNodeNames(
                          childProcess.execFileSync(
                            'git',
                            [
                              'show',
                              `${revision}:${pinnedPaths?.get(path) ?? path}`,
                            ],
                            { cwd: worktree, encoding: 'utf8', timeout: 10000 },
                          ),
                        ),
                      ),
                      path,
                    )
                  : readFileSync(args.path, 'utf8');
              if (
                path.endsWith('/selectChildren.ts') ||
                path.endsWith('/updateOutput.ts') ||
                path.endsWith('/markCommitDeliveries.ts')
              ) {
                const source = ts.createSourceFile(
                  args.path,
                  contents,
                  ts.ScriptTarget.Latest,
                  true,
                );
                const transformed = ts.transform(source, [
                  (context) => (root) => {
                    const visit = (node: ts.Node): ts.VisitResult<ts.Node> => {
                      if (
                        ts.isVariableDeclaration(node) &&
                        ts.isIdentifier(node.name) &&
                        [
                          'selectChildren',
                          'updateOutput',
                          'markCommitDeliveries',
                        ].includes(node.name.text) &&
                        node.initializer &&
                        ts.isArrowFunction(node.initializer) &&
                        ts.isBlock(node.initializer.body)
                      ) {
                        const label = node.name.text;
                        const owner =
                          label === 'markCommitDeliveries'
                            ? ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier('context'),
                                'root',
                              )
                            : ts.factory.createIdentifier('node');
                        const prefix = ts.factory.createVariableStatement(
                          undefined,
                          ts.factory.createVariableDeclarationList(
                            [
                              ts.factory.createVariableDeclaration(
                                '__before',
                                undefined,
                                undefined,
                                ts.factory.createArrayLiteralExpression([
                                  ts.factory.createPropertyAccessExpression(
                                    owner,
                                    'local',
                                  ),
                                  ts.factory.createPropertyAccessExpression(
                                    owner,
                                    'emit',
                                  ),
                                ]),
                              ),
                            ],
                            ts.NodeFlags.Const,
                          ),
                        );
                        const suffix = ts.factory.createExpressionStatement(
                          ts.factory.createCallExpression(
                            ts.factory.createIdentifier('__selectionObserver'),
                            undefined,
                            [
                              ts.factory.createStringLiteral(label),
                              owner,
                              ts.factory.createIdentifier('context'),
                              ts.factory.createIdentifier('__before'),
                            ],
                          ),
                        );
                        return ts.factory.updateVariableDeclaration(
                          node,
                          node.name,
                          node.exclamationToken,
                          node.type,
                          ts.factory.updateArrowFunction(
                            node.initializer,
                            node.initializer.modifiers,
                            node.initializer.typeParameters,
                            node.initializer.parameters,
                            node.initializer.type,
                            node.initializer.equalsGreaterThanToken,
                            ts.factory.createBlock(
                              [
                                prefix,
                                ts.factory.createTryStatement(
                                  node.initializer.body,
                                  undefined,
                                  ts.factory.createBlock([suffix], true),
                                ),
                              ],
                              true,
                            ),
                          ),
                        );
                      }
                      return ts.visitEachChild(node, visit, context);
                    };
                    return ts.visitNode(root, visit) as ts.SourceFile;
                  },
                ]);
                contents = ts
                  .createPrinter()
                  .printFile(transformed.transformed[0]);
                transformed.dispose();
              }
              return {
                contents,
                loader: args.path.endsWith('.tsx') ? 'tsx' : 'ts',
                // A file that exists only in the pinned revision has no directory on disk; bare and
                // alias specifiers then resolve from the package root (relative ones use the importer).
                resolveDir: existsSync(dirname(args.path))
                  ? dirname(args.path)
                  : packageRoot,
              };
            });
          },
        },
      ],
    });
    output = result.outputFiles[0].text;
  } finally {
    childProcess.spawn = spawn;
    for (const service of services) {
      service.ref();
      const ended =
        service.exitCode === null
          ? once(service, 'exit')
          : Promise.resolve([service.exitCode]);
      service.stdin!.end();
      const [code, signal] = await ended;
      if (code !== 0) serviceFailures.push(`${code}/${signal}`);
    }
  }
  if (serviceFailures.length)
    throw new Error(
      `esbuild did not exit naturally: ${serviceFailures.join(', ')}`,
    );
  const module = {
    exports: {} as {
      runChildSelectionHistory(fixture: ChildSelectionHistory): unknown[];
    },
  };
  new Function('require', 'module', 'exports', '__selectionObserver', output)(
    require,
    module,
    module.exports,
    observer,
  );
  return {
    run(fixture) {
      points.length = 0;
      const results = module.exports.runChildSelectionHistory(fixture);
      return { results, points: [...points] };
    },
  };
};
