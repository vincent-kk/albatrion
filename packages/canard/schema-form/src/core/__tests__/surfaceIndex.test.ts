import { describe, expect, it } from 'vitest';

import * as surface from '@/schema-form/core/surface';

describe('FieldNode PR-2 surface', () => {
  it('TEST-069 FieldNode index names the binding-only context channel', () => {
    expect(Object.keys(surface).sort()).toEqual([
      'FieldNodeEventType',
      'FieldNodeRequestType',
      'SetValueOption',
      'adoptFieldNodeTree',
      'buildFieldNodeTree',
      'fieldNodeFactory',
      'finishFieldNodeInput',
      'hasFieldNodeValidationRequest',
      'interpretFieldNodeDraft',
      'isArrayNode',
      'isBooleanNode',
      'isBranchNode',
      'isFieldNode',
      'isNumberNode',
      'isObjectNode',
      'isStringNode',
      'isTerminalNode',
      'isUnionNode',
      'isVirtualNode',
      'mountFieldNode',
      'observeFieldNodeReports',
      'readFieldNodeInteractionReset',
      'reloadFieldNodeForm',
      'setContext',
      'writeFieldNodeInput',
    ]);
    expect(Object.keys(surface.SetValueOption)).toEqual([
      'Overwrite',
      'Merge',
      'DisableAutomaticWrites',
      'EnableAutomaticWrites',
    ]);
  });
});
