import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import {
  contextNodeFactory,
  nodeFromJsonSchema,
} from '@/schema-form/core/nodeFromJsonSchema';
import type { JsonSchema } from '@/schema-form/types';

import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';

describe('ContextNode', () => {
  describe('Context Node 기본 동작', () => {
    it('contextNodeFactory로 context node를 생성할 수 있어야 함', () => {
      const contextNode = contextNodeFactory({ mode: 'view' });

      expect(contextNode).toBeDefined();
      expect(contextNode.type).toBe('object');
      expect(contextNode.value).toEqual({ mode: 'view' });
    });

    it('context node는 terminal ObjectNode여야 함', () => {
      const contextNode = contextNodeFactory({ userRole: 'admin' });

      // terminal node는 자식 노드를 갖지 않음 (null)
      expect(contextNode.children).toBeNull();
    });

    it('node.context로 context에 접근할 수 있어야 함', async () => {
      const contextNode = contextNodeFactory({ mode: 'edit' });

      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        } satisfies JsonSchema,
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      expect(node.context).toBe(contextNode);
      expect(node.context?.value).toEqual({ mode: 'edit' });
    });

    it('node.find("@")로 context를 찾을 수 있어야 함', async () => {
      const contextNode = contextNodeFactory({ mode: 'view' });

      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        } satisfies JsonSchema,
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      const foundContext = node.find('@');
      expect(foundContext).toBe(contextNode);
    });

    it('child node에서도 동일한 context에 접근할 수 있어야 함', async () => {
      const contextNode = contextNodeFactory({ mode: 'edit' });

      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            nested: {
              type: 'object',
              properties: {
                value: { type: 'string' },
              },
            },
          },
        } satisfies JsonSchema,
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      const nameNode = node.find('./name');
      const nestedNode = node.find('./nested');
      const valueNode = node.find('./nested/value');

      // 모든 노드에서 동일한 context 접근
      expect(nameNode?.context).toBe(contextNode);
      expect(nestedNode?.context).toBe(contextNode);
      expect(valueNode?.context).toBe(contextNode);
    });
  });

  describe('Mode 기반 시나리오 (@.mode)', () => {
    const createModeSchema = () =>
      ({
        type: 'object',
        properties: {
          name: {
            type: 'string',
            computed: {
              readOnly: '@.mode === "view"',
              disabled: '@.mode === "view"',
            },
          },
          email: {
            type: 'string',
            computed: {
              readOnly: '@.mode !== "edit"',
            },
          },
        },
      }) satisfies JsonSchema;

    it('mode="view"일 때 readOnly/disabled 상태가 true여야 함', async () => {
      const contextNode = contextNodeFactory({ mode: 'view' });

      const node = nodeFromJsonSchema({
        jsonSchema: createModeSchema(),
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      const nameNode = node.find('./name');
      const emailNode = node.find('./email');

      expect(nameNode?.readOnly).toBe(true);
      expect(nameNode?.disabled).toBe(true);
      expect(emailNode?.readOnly).toBe(true);
    });

    it('mode="edit"일 때 readOnly/disabled 상태가 false여야 함', async () => {
      const contextNode = contextNodeFactory({ mode: 'edit' });

      const node = nodeFromJsonSchema({
        jsonSchema: createModeSchema(),
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      const nameNode = node.find('./name');
      const emailNode = node.find('./email');

      expect(nameNode?.readOnly).toBe(false);
      expect(nameNode?.disabled).toBe(false);
      expect(emailNode?.readOnly).toBe(false);
    });

    it('context 값 변경 시 computed 속성이 업데이트되어야 함', async () => {
      const contextNode = contextNodeFactory({ mode: 'view' });

      const node = nodeFromJsonSchema({
        jsonSchema: createModeSchema(),
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      const nameNode = node.find('./name');

      // 초기 상태: view 모드
      expect(nameNode?.readOnly).toBe(true);

      // context 값 변경
      contextNode.setValue({ mode: 'edit' });
      await delay();

      // 변경 후 상태: edit 모드
      expect(nameNode?.readOnly).toBe(false);
    });
  });

  describe('UserRole 기반 시나리오 (@.userRole)', () => {
    const createUserRoleSchema = () =>
      ({
        type: 'object',
        properties: {
          adminField: {
            type: 'string',
            computed: {
              visible: '@.userRole === "admin"',
            },
          },
          userField: {
            type: 'string',
            computed: {
              disabled: '@.userRole !== "admin"',
            },
          },
          guestField: {
            type: 'string',
            computed: {
              visible: '@.userRole !== "guest"',
            },
          },
        },
      }) satisfies JsonSchema;

    it('userRole="admin"일 때 adminField가 visible이어야 함', async () => {
      const contextNode = contextNodeFactory({ userRole: 'admin' });

      const node = nodeFromJsonSchema({
        jsonSchema: createUserRoleSchema(),
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      const adminFieldNode = node.find('./adminField');
      const userFieldNode = node.find('./userField');

      expect(adminFieldNode?.visible).toBe(true);
      expect(userFieldNode?.disabled).toBe(false);
    });

    it('userRole="user"일 때 adminField가 hidden이어야 함', async () => {
      const contextNode = contextNodeFactory({ userRole: 'user' });

      const node = nodeFromJsonSchema({
        jsonSchema: createUserRoleSchema(),
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      const adminFieldNode = node.find('./adminField');
      const userFieldNode = node.find('./userField');
      const guestFieldNode = node.find('./guestField');

      expect(adminFieldNode?.visible).toBe(false);
      expect(userFieldNode?.disabled).toBe(true);
      expect(guestFieldNode?.visible).toBe(true);
    });

    it('userRole="guest"일 때 guestField가 hidden이어야 함', async () => {
      const contextNode = contextNodeFactory({ userRole: 'guest' });

      const node = nodeFromJsonSchema({
        jsonSchema: createUserRoleSchema(),
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      const adminFieldNode = node.find('./adminField');
      const guestFieldNode = node.find('./guestField');

      expect(adminFieldNode?.visible).toBe(false);
      expect(guestFieldNode?.visible).toBe(false);
    });
  });

  describe('Permissions 객체 시나리오 (@.permissions)', () => {
    const createPermissionsSchema = () =>
      ({
        type: 'object',
        properties: {
          editableField: {
            type: 'string',
            computed: {
              // !@ 형태는 지원되지 않으므로 (@).property !== true 형태 사용
              readOnly: '(@).permissions?.canEdit !== true',
            },
          },
          deletableField: {
            type: 'string',
            computed: {
              visible: '@.permissions?.canDelete === true',
            },
          },
          viewOnlyField: {
            type: 'string',
            computed: {
              disabled: '@.permissions?.viewOnly === true',
            },
          },
        },
      }) satisfies JsonSchema;

    it('permissions.canEdit=true일 때 readOnly가 false여야 함', async () => {
      const contextNode = contextNodeFactory({
        permissions: { canEdit: true, canDelete: false, viewOnly: false },
      });

      const node = nodeFromJsonSchema({
        jsonSchema: createPermissionsSchema(),
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      const editableFieldNode = node.find('./editableField');
      expect(editableFieldNode?.readOnly).toBe(false);
    });

    it('permissions.canEdit=false일 때 readOnly가 true여야 함', async () => {
      const contextNode = contextNodeFactory({
        permissions: { canEdit: false, canDelete: false, viewOnly: false },
      });

      const node = nodeFromJsonSchema({
        jsonSchema: createPermissionsSchema(),
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      const editableFieldNode = node.find('./editableField');
      expect(editableFieldNode?.readOnly).toBe(true);
    });

    it('permissions.canDelete=true일 때 deletableField가 visible이어야 함', async () => {
      const contextNode = contextNodeFactory({
        permissions: { canEdit: true, canDelete: true, viewOnly: false },
      });

      const node = nodeFromJsonSchema({
        jsonSchema: createPermissionsSchema(),
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      const deletableFieldNode = node.find('./deletableField');
      expect(deletableFieldNode?.visible).toBe(true);
    });

    it('permissions.canDelete=false일 때 deletableField가 hidden이어야 함', async () => {
      const contextNode = contextNodeFactory({
        permissions: { canEdit: true, canDelete: false, viewOnly: false },
      });

      const node = nodeFromJsonSchema({
        jsonSchema: createPermissionsSchema(),
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      const deletableFieldNode = node.find('./deletableField');
      expect(deletableFieldNode?.visible).toBe(false);
    });

    it('optional chaining이 정상 동작해야 함 (permissions가 undefined인 경우)', async () => {
      const contextNode = contextNodeFactory({});

      const node = nodeFromJsonSchema({
        jsonSchema: createPermissionsSchema(),
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      const editableFieldNode = node.find('./editableField');
      const deletableFieldNode = node.find('./deletableField');

      // @.permissions가 undefined이면 canEdit도 undefined -> !undefined = true
      expect(editableFieldNode?.readOnly).toBe(true);
      // @.permissions?.canDelete가 undefined이면 visible = false
      expect(deletableFieldNode?.visible).toBe(false);
    });
  });

  describe('복합 조건 시나리오 (Context + Form Field)', () => {
    const createCombinedSchema = () =>
      ({
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['draft', 'published', 'archived'],
            default: 'draft',
          },
          content: {
            type: 'string',
            computed: {
              readOnly: '@.mode === "view" || ../status === "published"',
            },
          },
          editSection: {
            type: 'string',
            computed: {
              // !@ 형태는 지원되지 않으므로 (@).property !== true 형태 사용
              disabled:
                '(@).permissions?.canEdit !== true && ../status !== "draft"',
            },
          },
          deleteButton: {
            type: 'string',
            computed: {
              visible:
                '@.permissions?.canDelete === true && ../status === "draft"',
            },
          },
        },
      }) satisfies JsonSchema;

    it('context 조건과 form field 조건 OR 조합이 동작해야 함', async () => {
      const contextNode = contextNodeFactory({
        mode: 'view',
        permissions: { canEdit: true, canDelete: true },
      });

      const node = nodeFromJsonSchema({
        jsonSchema: createCombinedSchema(),
        onChange: () => {},
        context: contextNode,
      }) as ObjectNode;

      await delay();

      const contentNode = node.find('./content');

      // mode="view" (true) OR status="draft" (false) -> readOnly = true
      expect(contentNode?.readOnly).toBe(true);

      // status를 published로 변경
      contextNode.setValue({ mode: 'edit', permissions: { canEdit: true } });
      await delay();

      // mode="edit" (false) OR status="draft" (false) -> readOnly = false
      expect(contentNode?.readOnly).toBe(false);

      // status를 published로 변경
      (node.find('./status') as StringNode)?.setValue('published');
      await delay();

      // mode="edit" (false) OR status="published" (true) -> readOnly = true
      expect(contentNode?.readOnly).toBe(true);
    });

    it('context 조건과 form field 조건 AND 조합이 동작해야 함', async () => {
      const contextNode = contextNodeFactory({
        mode: 'edit',
        permissions: { canEdit: false, canDelete: true },
      });

      const node = nodeFromJsonSchema({
        jsonSchema: createCombinedSchema(),
        onChange: () => {},
        context: contextNode,
      }) as ObjectNode;

      await delay();

      const editSectionNode = node.find('./editSection');
      const deleteButtonNode = node.find('./deleteButton');

      // !canEdit (true) AND status !== "draft" (false, status="draft") -> disabled = false
      expect(editSectionNode?.disabled).toBe(false);

      // canDelete (true) AND status === "draft" (true) -> visible = true
      expect(deleteButtonNode?.visible).toBe(true);

      // status를 published로 변경
      (node.find('./status') as StringNode)?.setValue('published');
      await delay();

      // !canEdit (true) AND status !== "draft" (true) -> disabled = true
      expect(editSectionNode?.disabled).toBe(true);

      // canDelete (true) AND status === "draft" (false) -> visible = false
      expect(deleteButtonNode?.visible).toBe(false);
    });

    it('양쪽 조건 모두 변경 시 올바르게 업데이트되어야 함', async () => {
      const contextNode = contextNodeFactory({
        mode: 'edit',
        permissions: { canEdit: true, canDelete: false },
      });

      const node = nodeFromJsonSchema({
        jsonSchema: createCombinedSchema(),
        onChange: () => {},
        context: contextNode,
      }) as ObjectNode;

      await delay();

      const contentNode = node.find('./content');
      const deleteButtonNode = node.find('./deleteButton');

      // 초기 상태
      expect(contentNode?.readOnly).toBe(false); // mode="edit", status="draft"
      expect(deleteButtonNode?.visible).toBe(false); // canDelete=false

      // context와 form field 모두 변경
      contextNode.setValue({
        mode: 'view',
        permissions: { canEdit: true, canDelete: true },
      });
      (node.find('./status') as StringNode)?.setValue('published');
      await delay();

      expect(contentNode?.readOnly).toBe(true); // mode="view" OR status="published"
      expect(deleteButtonNode?.visible).toBe(false); // canDelete=true AND status="draft" (false)
    });
  });

  describe('Context 값 동적 변경', () => {
    it('contextNode.setValue() 호출 시 dependent 노드가 업데이트되어야 함', async () => {
      const contextNode = contextNodeFactory({ mode: 'view', count: 0 });

      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            field1: {
              type: 'string',
              computed: {
                readOnly: '@.mode === "view"',
              },
            },
            field2: {
              type: 'string',
              computed: {
                visible: '@.count > 0',
              },
            },
          },
        } satisfies JsonSchema,
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      const field1Node = node.find('./field1');
      const field2Node = node.find('./field2');

      // 초기 상태
      expect(field1Node?.readOnly).toBe(true);
      expect(field2Node?.visible).toBe(false);

      // context 변경 1: mode만 변경
      contextNode.setValue({ mode: 'edit', count: 0 });
      await delay();

      expect(field1Node?.readOnly).toBe(false);
      expect(field2Node?.visible).toBe(false);

      // context 변경 2: count만 변경
      contextNode.setValue({ mode: 'edit', count: 5 });
      await delay();

      expect(field1Node?.readOnly).toBe(false);
      expect(field2Node?.visible).toBe(true);
    });

    it('여러 필드가 동일한 context 속성을 참조할 때 모두 업데이트되어야 함', async () => {
      const contextNode = contextNodeFactory({ theme: 'light' });

      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            field1: {
              type: 'string',
              computed: {
                active: '@.theme === "dark"',
              },
            },
            field2: {
              type: 'string',
              computed: {
                active: '@.theme === "dark"',
              },
            },
            field3: {
              type: 'string',
              computed: {
                active: '@.theme === "dark"',
              },
            },
          },
        } satisfies JsonSchema,
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      const field1Node = node.find('./field1');
      const field2Node = node.find('./field2');
      const field3Node = node.find('./field3');

      // 초기 상태: light 테마
      expect(field1Node?.active).toBe(false);
      expect(field2Node?.active).toBe(false);
      expect(field3Node?.active).toBe(false);

      // context 변경: dark 테마
      contextNode.setValue({ theme: 'dark' });
      await delay();

      // 모든 필드가 업데이트됨
      expect(field1Node?.active).toBe(true);
      expect(field2Node?.active).toBe(true);
      expect(field3Node?.active).toBe(true);
    });
  });

  describe('Context 변경 시 Node Tree 안정성', () => {
    it('context 값 변경 시 node tree가 재생성되지 않아야 함 (주소값 유지)', async () => {
      const contextNode = contextNodeFactory({ mode: 'view', userRole: 'admin' });

      const rootNode = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              computed: {
                readOnly: '@.mode === "view"',
              },
            },
            nested: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                  computed: {
                    visible: '@.userRole === "admin"',
                  },
                },
              },
            },
          },
        } satisfies JsonSchema,
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      // 노드 참조 저장
      const nameNodeBefore = rootNode.find('./name');
      const nestedNodeBefore = rootNode.find('./nested');
      const fieldNodeBefore = rootNode.find('./nested/field');

      // 초기 상태 확인
      expect(nameNodeBefore?.readOnly).toBe(true);
      expect(fieldNodeBefore?.visible).toBe(true);

      // context 값 변경
      contextNode.setValue({ mode: 'edit', userRole: 'user' });
      await delay();

      // 노드 참조 다시 가져오기
      const nameNodeAfter = rootNode.find('./name');
      const nestedNodeAfter = rootNode.find('./nested');
      const fieldNodeAfter = rootNode.find('./nested/field');

      // 노드 주소값이 동일해야 함 (재생성되지 않음)
      expect(nameNodeAfter).toBe(nameNodeBefore);
      expect(nestedNodeAfter).toBe(nestedNodeBefore);
      expect(fieldNodeAfter).toBe(fieldNodeBefore);

      // 값만 업데이트되어야 함
      expect(nameNodeAfter?.readOnly).toBe(false);
      expect(fieldNodeAfter?.visible).toBe(false);
    });

    it('context를 여러 번 변경해도 node tree가 재생성되지 않아야 함', async () => {
      const contextNode = contextNodeFactory({ count: 0 });

      const rootNode = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            field: {
              type: 'string',
              computed: {
                visible: '@.count > 0',
              },
            },
          },
        } satisfies JsonSchema,
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      const fieldNode = rootNode.find('./field');
      const originalFieldNode = fieldNode;

      // 여러 번 context 변경
      for (let i = 1; i <= 10; i++) {
        contextNode.setValue({ count: i });
        await delay();

        // 매번 같은 노드 인스턴스여야 함
        expect(rootNode.find('./field')).toBe(originalFieldNode);
        expect(fieldNode?.visible).toBe(true);
      }

      // 다시 0으로 변경
      contextNode.setValue({ count: 0 });
      await delay();

      expect(rootNode.find('./field')).toBe(originalFieldNode);
      expect(fieldNode?.visible).toBe(false);
    });

    it('context 변경 시 rootNode 자체도 재생성되지 않아야 함', async () => {
      const contextNode = contextNodeFactory({ theme: 'light' });

      const rootNode = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            field: {
              type: 'string',
              computed: {
                active: '@.theme === "dark"',
              },
            },
          },
        } satisfies JsonSchema,
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      const rootNodeBefore = rootNode;
      const contextBefore = rootNode.context;

      contextNode.setValue({ theme: 'dark' });
      await delay();

      // rootNode와 context 참조가 동일해야 함
      expect(rootNode).toBe(rootNodeBefore);
      expect(rootNode.context).toBe(contextBefore);
      expect(rootNode.context).toBe(contextNode);
    });

    it('중첩된 객체 구조에서도 context 변경 시 node tree가 유지되어야 함', async () => {
      const contextNode = contextNodeFactory({ permissions: { canEdit: false } });

      const rootNode = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            level1: {
              type: 'object',
              properties: {
                level2: {
                  type: 'object',
                  properties: {
                    level3: {
                      type: 'string',
                      computed: {
                        readOnly: '(@).permissions?.canEdit !== true',
                      },
                    },
                  },
                },
              },
            },
          },
        } satisfies JsonSchema,
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      // 깊은 중첩 노드들의 참조 저장
      const level1Before = rootNode.find('./level1');
      const level2Before = rootNode.find('./level1/level2');
      const level3Before = rootNode.find('./level1/level2/level3');

      expect(level3Before?.readOnly).toBe(true);

      // context 변경
      contextNode.setValue({ permissions: { canEdit: true } });
      await delay();

      // 모든 레벨의 노드가 동일 인스턴스여야 함
      expect(rootNode.find('./level1')).toBe(level1Before);
      expect(rootNode.find('./level1/level2')).toBe(level2Before);
      expect(rootNode.find('./level1/level2/level3')).toBe(level3Before);

      // 값만 변경됨
      expect(level3Before?.readOnly).toBe(false);
    });

    it('context와 form value 동시 변경 시에도 node tree가 유지되어야 함', async () => {
      const contextNode = contextNodeFactory({ mode: 'view' });

      const rootNode = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['draft', 'published'],
              default: 'draft',
            },
            content: {
              type: 'string',
              computed: {
                readOnly: '@.mode === "view" || ../status === "published"',
              },
            },
          },
        } satisfies JsonSchema,
        onChange: () => {},
        context: contextNode,
      }) as ObjectNode;

      await delay();

      const statusNodeBefore = rootNode.find('./status');
      const contentNodeBefore = rootNode.find('./content');

      // context와 form value 동시 변경
      contextNode.setValue({ mode: 'edit' });
      (rootNode.find('./status') as StringNode)?.setValue('published');
      await delay();

      // 노드 인스턴스 유지
      expect(rootNode.find('./status')).toBe(statusNodeBefore);
      expect(rootNode.find('./content')).toBe(contentNodeBefore);

      // computed 속성은 올바르게 업데이트됨
      expect(contentNodeBefore?.readOnly).toBe(true); // status="published"
    });
  });

  describe('종합 시나리오', () => {
    it('mode, userRole, permissions를 모두 사용하는 복잡한 폼', async () => {
      const contextNode = contextNodeFactory({
        mode: 'edit',
        userRole: 'admin',
        permissions: {
          canEdit: true,
          canDelete: true,
          canPublish: false,
        },
      });

      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['draft', 'published'],
              default: 'draft',
            },
            title: {
              type: 'string',
              computed: {
                readOnly: '@.mode === "view"',
              },
            },
            adminNotes: {
              type: 'string',
              computed: {
                visible: '@.userRole === "admin"',
              },
            },
            publishButton: {
              type: 'string',
              computed: {
                visible:
                  '@.permissions?.canPublish === true && ../status === "draft"',
              },
            },
            deleteButton: {
              type: 'string',
              computed: {
                visible:
                  '@.permissions?.canDelete === true && @.userRole === "admin"',
              },
            },
          },
        } satisfies JsonSchema,
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      const titleNode = node.find('./title');
      const adminNotesNode = node.find('./adminNotes');
      const publishButtonNode = node.find('./publishButton');
      const deleteButtonNode = node.find('./deleteButton');

      // 초기 상태 검증
      expect(titleNode?.readOnly).toBe(false); // mode="edit"
      expect(adminNotesNode?.visible).toBe(true); // userRole="admin"
      expect(publishButtonNode?.visible).toBe(false); // canPublish=false
      expect(deleteButtonNode?.visible).toBe(true); // canDelete=true && userRole="admin"

      // context 변경: 일반 사용자로 전환
      contextNode.setValue({
        mode: 'view',
        userRole: 'user',
        permissions: {
          canEdit: false,
          canDelete: false,
          canPublish: false,
        },
      });
      await delay();

      expect(titleNode?.readOnly).toBe(true); // mode="view"
      expect(adminNotesNode?.visible).toBe(false); // userRole="user"
      expect(deleteButtonNode?.visible).toBe(false); // canDelete=false
    });
  });
});
