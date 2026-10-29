import {
  filter as filterArray,
  map as mapArray,
} from '@winglet/common-utils/array';

import type { Optional } from '@aileron/declare';

import { FormErrorCode } from '../../../../../../errors';
import { foldAllowedTypes } from '../../../../utils/nodeIdentity/foldAllowedTypes';
import type { AnalysisContext } from '../../../types/analysis';
import type { PropertyDeclaration } from '../../../types/node';
import type { SchemaTypeName } from '../../../types/schema';
import { intersectAllowedTypes } from '../../../utils/allowedTypes/intersectAllowedTypes';
import { readAllowedTypes } from '../../../utils/allowedTypes/readAllowedTypes';
import { unionAllowedTypes } from '../../../utils/allowedTypes/unionAllowedTypes';
import { throwBlueprintError } from '../../../utils/diagnostics/throwBlueprintError';
import { inferAllowedTypes } from './inferAllowedTypes';

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
  const fixed = context.capabilities.branchless
    ? declarations
    : filterArray(
        declarations,
        (declaration) =>
          declaration.context === 'conjunction' && !declaration.gates.length,
      );
  const staticOwner = (() => {
    const items = fixed;
    for (let index = 0, count = items.length; index < count; index++) {
      if (!(index in items)) continue;
      const declaration = items[index];
      if (declaration.role === 'declaration') return true;
    }
    return false;
  })();
  if (staticOwner) {
    let allowed: Optional<readonly SchemaTypeName[]>;
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
          FormErrorCode.AllOfTypeRedefinition,
          declaration.schemaPath,
          { declarations: mapArray(fixed, (item) => item.schemaPath) },
          context.options,
        );
    }
    if (!allowed)
      allowed = inferAllowedTypes(
        context,
        fixed[0].schema,
        fixed[0].schemaPath,
      );
    if (context.capabilities.branchless)
      return [{ allowed: allowed!, declarations }];
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
          FormErrorCode.SharedNodeKindConflict,
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
  let ungatedMask: Optional<number>;
  for (const declaration of filterArray(
    declarations,
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
          FormErrorCode.SharedNodeKindConflict,
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
  return mapArray([...groups.values()], (group) => ({
    ...group,
    declarations: filterArray(
      declarations,
      (declaration) =>
        group.declarations.includes(declaration) ||
        (declaration.role === 'overlay' &&
          (() => {
            const items = group.declarations;
            for (let index = 0, count = items.length; index < count; index++) {
              if (!(index in items)) continue;
              const owner = items[index];
              if (context.declarationOwners?.get(declaration.id) === owner.id)
                return true;
            }
            return false;
          })()),
    ),
  }));
};
