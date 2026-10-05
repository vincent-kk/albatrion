import type { PropertyDeclaration, SchemaTypeName } from '../../type';
import type { AnalysisContext } from '../analyze/type';
import { BlueprintErrorCode } from '../diagnostics/constant';
import { throwBlueprintError } from '../diagnostics/throwBlueprintError';
import { foldAllowedTypes } from './foldAllowedTypes';
import { inferAllowedTypes } from './inferAllowedTypes';
import { intersectAllowedTypes } from './intersectAllowedTypes';
import { readAllowedTypes } from './readAllowedTypes';
import { unionAllowedTypes } from './unionAllowedTypes';

/**
 * Resolve the static restriction and dynamic-only kind groups for one property.
 * @param context - Root-local references and diagnostic collector
 * @param declarations - Contributions ordered independently of JSON key order
 * @returns One static group, or same-fold groups for dynamically declared variants
 */
export const resolveNodeTypes = (
  context: AnalysisContext,
  declarations: readonly PropertyDeclaration[],
): {
  allowed: readonly SchemaTypeName[];
  declarations: readonly PropertyDeclaration[];
}[] => {
  const fixed = context.capabilities.branchless ? declarations : declarations.filter(
    (declaration) =>
      declaration.context === 'conjunction' && !declaration.gates.length,
  );
  const staticOwner = fixed.some(
    (declaration) => declaration.role === 'declaration',
  );
  if (staticOwner) {
    let allowed: readonly SchemaTypeName[] | undefined;
    for (const declaration of fixed) {
      allowed = intersectAllowedTypes(
        allowed,
        readAllowedTypes(
          declaration.schema,
          declaration.schemaPath,
          context.options,
        ),
      );
      if (allowed?.length === 0)
        return throwBlueprintError(
          BlueprintErrorCode.AllOfTypeRedefinition,
          declaration.schemaPath,
          { declarations: fixed.map((item) => item.schemaPath) },
          context.options,
        );
    }
    if (!allowed)
      allowed = inferAllowedTypes(
        context,
        fixed[0].schema,
        fixed[0].schemaPath,
      );
    if (context.capabilities.branchless) return [{ allowed: allowed!, declarations }];
    const mask = foldAllowedTypes(allowed!);
    for (const declaration of declarations) {
      if (
        declaration.context !== 'declaration' ||
        declaration.gates.length ||
        declaration.role !== 'declaration'
      )
        continue;
      const types = inferAllowedTypes(
        context,
        declaration.schema,
        declaration.schemaPath,
        true,
      );
      if (types && (foldAllowedTypes(types) & mask) !== foldAllowedTypes(types))
        throwBlueprintError(
          BlueprintErrorCode.SharedNodeKindConflict,
          declaration.schemaPath,
          { staticTypes: allowed, branchTypes: types },
          context.options,
        );
    }
    return [{ allowed: allowed!, declarations }];
  }
  const groups = new Map<
    number,
    { allowed: readonly SchemaTypeName[]; declarations: PropertyDeclaration[] }
  >();
  let ungatedMask: number | undefined;
  for (const declaration of declarations.filter(
    (item) => item.role === 'declaration',
  )) {
    const allowed = inferAllowedTypes(
      context,
      declaration.schema,
      declaration.schemaPath,
    )!;
    const mask = foldAllowedTypes(allowed);
    if (!declaration.gates.length) {
      if (ungatedMask !== undefined && ungatedMask !== mask)
        throwBlueprintError(
          BlueprintErrorCode.SharedNodeKindConflict,
          declaration.schemaPath,
          { types: allowed },
          context.options,
        );
      ungatedMask = mask;
    }
    const group = groups.get(mask);
    if (group) {
      group.allowed = unionAllowedTypes([group.allowed, allowed]);
      group.declarations.push(declaration);
    } else groups.set(mask, { allowed, declarations: [declaration] });
  }
  return [...groups.values()].map((group) => ({
    ...group,
    declarations: declarations.filter(
      (declaration) =>
        group.declarations.includes(declaration) ||
        (declaration.role === 'overlay' &&
          group.declarations.some(
            (owner) =>
              context.declarationOwners?.get(declaration.id) === owner.id,
          )),
    ),
  }));
};
