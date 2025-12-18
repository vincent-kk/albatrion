import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import {
  contextNodeFactory,
  nodeFromJsonSchema,
} from '@/schema-form/core/nodeFromJsonSchema';
import { NodeEventType } from '@/schema-form/core/nodes/type';
import type { JsonSchema } from '@/schema-form/types';

import type { ArrayNode } from '../nodes/ArrayNode';
import type { NumberNode } from '../nodes/NumberNode';
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
      const contextNode = contextNodeFactory({
        mode: 'view',
        userRole: 'admin',
      });

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
      const contextNode = contextNodeFactory({
        permissions: { canEdit: false },
      });

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

  describe('Context가 없는 경우 처리', () => {
    it('context 없이 nodeFromJsonSchema 호출 시 node.context는 null이어야 함', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        } satisfies JsonSchema,
        onChange: () => {},
        // context 미전달
      });

      await delay();

      expect(node.context).toBeNull();
    });

    it('context 없을 때 node.find("@")는 null을 반환해야 함', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        } satisfies JsonSchema,
        onChange: () => {},
      });

      await delay();

      expect(node.find('@')).toBeNull();
    });

    it('child node에서도 context가 null이어야 함', async () => {
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
      });

      await delay();

      const nameNode = node.find('./name');
      const nestedNode = node.find('./nested');
      const valueNode = node.find('./nested/value');

      expect(nameNode?.context).toBeNull();
      expect(nestedNode?.context).toBeNull();
      expect(valueNode?.context).toBeNull();
    });

    it('context 없을 때 @.property 표현식 사용 시 TypeError 발생해야 함 (오설정 인지 목적)', async () => {
      // context 없이 @.property 표현식을 사용하면 TypeError가 발생해야 함
      // 에러 메시지: "Cannot read properties of undefined (reading 'mode')"
      // 이를 통해 사용자가 잘못된 설정(context 미제공)을 인지할 수 있음
      expect(() => {
        nodeFromJsonSchema({
          jsonSchema: {
            type: 'object',
            properties: {
              field: {
                type: 'string',
                computed: {
                  visible: '@.mode === "edit"',
                },
              },
            },
          } satisfies JsonSchema,
          onChange: () => {},
          // context 없음 - @.mode 접근 시 TypeError 발생
        });
      }).toThrow(TypeError);
    });

    it('context 없을 때 (@).property 표현식 사용 시 TypeError 발생해야 함', async () => {
      // context 없이 (@).property 표현식을 사용하면 TypeError가 발생해야 함
      // 에러 메시지: "Cannot read properties of undefined (reading 'permissions')"
      expect(() => {
        nodeFromJsonSchema({
          jsonSchema: {
            type: 'object',
            properties: {
              field: {
                type: 'string',
                computed: {
                  readOnly: '(@).permissions?.canEdit !== true',
                },
              },
            },
          } satisfies JsonSchema,
          onChange: () => {},
        });
      }).toThrow(TypeError);
    });

    it('context 없는 상태에서 @.property 사용 시 TypeError 발생 - 오설정 감지', async () => {
      // 여러 computed 속성에서 @.property 사용 시 TypeError 발생
      // 에러 메시지: "Cannot read properties of undefined (reading 'show')"
      expect(() => {
        nodeFromJsonSchema({
          jsonSchema: {
            type: 'object',
            properties: {
              field1: {
                type: 'string',
                computed: {
                  visible: '@.show === true',
                  readOnly: '@.mode === "view"',
                  disabled: '(@).disabled === true',
                  active: '@.active !== false',
                },
              },
            },
          } satisfies JsonSchema,
          onChange: () => {},
        });
      }).toThrow(TypeError);
    });
  });

  describe('배열 내 Context 접근', () => {
    it('ArrayNode 아이템에서 context에 접근할 수 있어야 함', async () => {
      const contextNode = contextNodeFactory({ mode: 'edit' });

      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    computed: {
                      readOnly: '@.mode === "view"',
                    },
                  },
                },
              },
              default: [{ name: 'item1' }],
            },
          },
        } satisfies JsonSchema,
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      const itemNameNode = node.find('./items/0/name');
      expect(itemNameNode?.context).toBe(contextNode);
      expect(itemNameNode?.readOnly).toBe(false); // mode="edit"
    });

    it('동적으로 추가된 배열 아이템에서도 context에 접근할 수 있어야 함', async () => {
      const contextNode = contextNodeFactory({ mode: 'view' });

      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    computed: {
                      readOnly: '@.mode === "view"',
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

      // 동적으로 아이템 추가
      const arrayNode = node.find('./items') as ArrayNode;
      arrayNode.push({ name: 'new item' });
      await delay();

      const newItemNameNode = node.find('./items/0/name');
      expect(newItemNameNode?.context).toBe(contextNode);
      expect(newItemNameNode?.readOnly).toBe(true); // mode="view"
    });

    it('배열 아이템 삭제 후 남은 아이템에서도 context 접근이 유지되어야 함', async () => {
      const contextNode = contextNodeFactory({ mode: 'edit' });

      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    computed: {
                      visible: '@.mode === "edit"',
                    },
                  },
                },
              },
              default: [
                { name: 'item1' },
                { name: 'item2' },
                { name: 'item3' },
              ],
            },
          },
        } satisfies JsonSchema,
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      const arrayNode = node.find('./items') as ArrayNode;
      expect(arrayNode.length).toBe(3);

      // 중간 아이템 삭제
      arrayNode.remove(1);
      await delay();

      expect(arrayNode.length).toBe(2);

      // 남은 아이템들의 context 확인
      const item0Name = node.find('./items/0/name');
      const item1Name = node.find('./items/1/name');

      expect(item0Name?.context).toBe(contextNode);
      expect(item1Name?.context).toBe(contextNode);
      expect(item0Name?.visible).toBe(true);
      expect(item1Name?.visible).toBe(true);
    });

    it('context 변경 시 모든 배열 아이템의 computed 속성이 업데이트되어야 함', async () => {
      const contextNode = contextNodeFactory({ mode: 'edit' });

      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    computed: {
                      readOnly: '@.mode === "view"',
                    },
                  },
                },
              },
              default: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
            },
          },
        } satisfies JsonSchema,
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      // 초기 상태: 모두 readOnly=false
      expect(node.find('./items/0/field')?.readOnly).toBe(false);
      expect(node.find('./items/1/field')?.readOnly).toBe(false);
      expect(node.find('./items/2/field')?.readOnly).toBe(false);

      // context 변경
      contextNode.setValue({ mode: 'view' });
      await delay();

      // 변경 후: 모두 readOnly=true
      expect(node.find('./items/0/field')?.readOnly).toBe(true);
      expect(node.find('./items/1/field')?.readOnly).toBe(true);
      expect(node.find('./items/2/field')?.readOnly).toBe(true);
    });

    it('중첩된 배열에서도 context에 접근할 수 있어야 함', async () => {
      const contextNode = contextNodeFactory({ level: 'deep' });

      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            outer: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  inner: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        value: {
                          type: 'string',
                          computed: {
                            active: '@.level === "deep"',
                          },
                        },
                      },
                    },
                    default: [{ value: 'nested' }],
                  },
                },
              },
              default: [{ inner: [{ value: 'nested' }] }],
            },
          },
        } satisfies JsonSchema,
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      const deepNode = node.find('./outer/0/inner/0/value');
      expect(deepNode?.context).toBe(contextNode);
      expect(deepNode?.active).toBe(true);
    });
  });

  describe('이벤트 발행 검증', () => {
    it('contextNode.setValue() 시 UpdateValue 이벤트가 발행되어야 함', async () => {
      const contextNode = contextNodeFactory({ mode: 'view' });
      const events: number[] = [];

      contextNode.subscribe(({ type }) => {
        events.push(type);
      });

      await delay();
      events.length = 0; // 초기화 이벤트 제거

      contextNode.setValue({ mode: 'edit' });
      await delay();

      expect(events).toContain(NodeEventType.UpdateValue);
    });

    it('context 변경 시 의존 노드가 업데이트되어야 함', async () => {
      const contextNode = contextNodeFactory({ mode: 'view' });

      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            field: {
              type: 'string',
              computed: {
                readOnly: '@.mode === "view"',
              },
            },
          },
        } satisfies JsonSchema,
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      const fieldNode = node.find('./field');
      expect(fieldNode?.readOnly).toBe(true);

      // context 변경
      contextNode.setValue({ mode: 'edit' });
      await delay();

      // 의존 노드가 업데이트됨
      expect(fieldNode?.readOnly).toBe(false);
    });

    it('contextNode subscribe 후 unsubscribe하면 이벤트를 받지 않아야 함', async () => {
      const contextNode = contextNodeFactory({ count: 0 });
      const events: number[] = [];

      const unsubscribe = contextNode.subscribe(({ type }) => {
        events.push(type);
      });

      await delay();
      events.length = 0;

      // 첫 번째 변경 - 이벤트 수신
      contextNode.setValue({ count: 1 });
      await delay();
      expect(events.length).toBeGreaterThan(0);

      // unsubscribe
      unsubscribe();
      events.length = 0;

      // 두 번째 변경 - 이벤트 수신 안 함
      contextNode.setValue({ count: 2 });
      await delay();
      expect(events.length).toBe(0);
    });

    it('여러 구독자가 있을 때 모두 이벤트를 받아야 함', async () => {
      const contextNode = contextNodeFactory({ value: 'initial' });
      const events1: number[] = [];
      const events2: number[] = [];
      const events3: number[] = [];

      contextNode.subscribe(({ type }) => events1.push(type));
      contextNode.subscribe(({ type }) => events2.push(type));
      contextNode.subscribe(({ type }) => events3.push(type));

      await delay();
      events1.length = 0;
      events2.length = 0;
      events3.length = 0;

      contextNode.setValue({ value: 'changed' });
      await delay();

      expect(events1).toContain(NodeEventType.UpdateValue);
      expect(events2).toContain(NodeEventType.UpdateValue);
      expect(events3).toContain(NodeEventType.UpdateValue);
    });
  });

  describe('computed.watch와 Context 조합', () => {
    it('computed.watch에 @ 경로가 포함된 경우 context 변경 시 업데이트되어야 함', async () => {
      const contextNode = contextNodeFactory({ threshold: 10 });

      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            value: { type: 'number', default: 5 },
            status: {
              type: 'string',
              computed: {
                visible: '../value > (@).threshold',
                watch: ['../value', '@'],
              },
            },
          },
        } satisfies JsonSchema,
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      const statusNode = node.find('./status');
      expect(statusNode?.visible).toBe(false); // 5 > 10 = false

      // context 변경
      contextNode.setValue({ threshold: 3 });
      await delay();

      expect(statusNode?.visible).toBe(true); // 5 > 3 = true
    });

    it('watch 없이도 @.property 의존성이 자동 감지되어야 함', async () => {
      const contextNode = contextNodeFactory({ enabled: false });

      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            field: {
              type: 'string',
              computed: {
                active: '@.enabled === true',
                // watch 없음 - 자동 감지
              },
            },
          },
        } satisfies JsonSchema,
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      const fieldNode = node.find('./field');
      expect(fieldNode?.active).toBe(false);

      contextNode.setValue({ enabled: true });
      await delay();

      expect(fieldNode?.active).toBe(true);
    });

    it('watch에 여러 context 속성과 form 필드가 혼합된 경우', async () => {
      const contextNode = contextNodeFactory({ min: 0, max: 100 });

      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            value: { type: 'number', default: 50 },
            isValid: {
              type: 'string',
              computed: {
                visible: '../value >= (@).min && ../value <= (@).max',
                watch: ['../value', '@'],
              },
            },
          },
        } satisfies JsonSchema,
        onChange: () => {},
        context: contextNode,
      }) as ObjectNode;

      await delay();

      const isValidNode = node.find('./isValid');
      expect(isValidNode?.visible).toBe(true); // 50 >= 0 && 50 <= 100

      // min 변경
      contextNode.setValue({ min: 60, max: 100 });
      await delay();

      expect(isValidNode?.visible).toBe(false); // 50 >= 60 = false

      // value 변경
      (node.find('./value') as NumberNode)?.setValue(70);
      await delay();

      expect(isValidNode?.visible).toBe(true); // 70 >= 60 && 70 <= 100
    });
  });

  describe('에러 복원력', () => {
    it('context 속성이 undefined인 깊은 경로 접근 시 에러 없이 처리되어야 함', async () => {
      const contextNode = contextNodeFactory({}); // permissions 없음

      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            field: {
              type: 'string',
              computed: {
                visible: '@.permissions?.canEdit?.level === "admin"',
              },
            },
          },
        } satisfies JsonSchema,
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      // 에러 없이 false 반환
      expect(node.find('./field')?.visible).toBe(false);
    });

    it('context가 빈 객체일 때도 정상 동작해야 함', async () => {
      const contextNode = contextNodeFactory({});

      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            field1: {
              type: 'string',
              computed: { visible: '@.mode === "edit"' },
            },
            field2: {
              type: 'string',
              computed: { readOnly: '(@).readonly === true' },
            },
          },
        } satisfies JsonSchema,
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      expect(node.find('./field1')?.visible).toBe(false);
      expect(node.find('./field2')?.readOnly).toBe(false);
    });

    it('context에 null 값이 포함되어도 정상 동작해야 함', async () => {
      const contextNode = contextNodeFactory({
        mode: null,
        settings: null,
      });

      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            field: {
              type: 'string',
              computed: {
                visible: '@.mode === "edit"',
                readOnly: '@.settings?.readOnly === true',
              },
            },
          },
        } satisfies JsonSchema,
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      expect(node.find('./field')?.visible).toBe(false);
      expect(node.find('./field')?.readOnly).toBe(false);
    });

    it('context에 복잡한 중첩 객체가 있을 때 optional chaining이 동작해야 함', async () => {
      const contextNode = contextNodeFactory({
        user: {
          profile: {
            settings: {
              preferences: {
                darkMode: true,
              },
            },
          },
        },
      });

      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            themeField: {
              type: 'string',
              computed: {
                active:
                  '@.user?.profile?.settings?.preferences?.darkMode === true',
              },
            },
            missingField: {
              type: 'string',
              computed: {
                visible: '@.user?.profile?.nonExistent?.deep?.value === "test"',
              },
            },
          },
        } satisfies JsonSchema,
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      expect(node.find('./themeField')?.active).toBe(true);
      expect(node.find('./missingField')?.visible).toBe(false);
    });

    it('context 값을 여러 번 빠르게 변경해도 최종 상태가 올바르게 반영되어야 함', async () => {
      const contextNode = contextNodeFactory({ count: 0 });

      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            field: {
              type: 'string',
              computed: {
                visible: '@.count > 5',
              },
            },
          },
        } satisfies JsonSchema,
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      // 빠르게 여러 번 변경
      contextNode.setValue({ count: 1 });
      contextNode.setValue({ count: 2 });
      contextNode.setValue({ count: 3 });
      contextNode.setValue({ count: 10 });
      contextNode.setValue({ count: 4 });
      contextNode.setValue({ count: 8 }); // 최종값

      await delay();

      // 최종 상태 반영
      expect(contextNode.value).toEqual({ count: 8 });
      expect(node.find('./field')?.visible).toBe(true); // 8 > 5
    });
  });

  describe('성능 테스트', () => {
    it('많은 노드가 동일 context 속성을 참조할 때 변경이 적절한 시간 내에 완료되어야 함', async () => {
      const contextNode = contextNodeFactory({ theme: 'light' });

      // 50개의 필드 생성
      const properties: Record<string, JsonSchema> = {};
      for (let i = 0; i < 50; i++) {
        properties[`field${i}`] = {
          type: 'string',
          computed: {
            active: '@.theme === "dark"',
          },
        };
      }

      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties,
        } satisfies JsonSchema,
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      // 초기 상태 확인
      for (let i = 0; i < 50; i++) {
        expect(node.find(`./field${i}`)?.active).toBe(false);
      }

      // 성능 측정
      const startTime = performance.now();
      contextNode.setValue({ theme: 'dark' });
      await delay();
      const endTime = performance.now();

      // 모든 노드가 업데이트되었는지 확인
      for (let i = 0; i < 50; i++) {
        expect(node.find(`./field${i}`)?.active).toBe(true);
      }

      // 100ms 이내에 완료되어야 함
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('깊은 중첩 구조에서도 context 변경이 적절한 시간 내에 완료되어야 함', async () => {
      const contextNode = contextNodeFactory({ enabled: false });

      // 5레벨 중첩 구조 생성
      const createNestedSchema = (depth: number): JsonSchema => {
        if (depth === 0) {
          return {
            type: 'string',
            computed: {
              visible: '@.enabled === true',
            },
          };
        }
        return {
          type: 'object',
          properties: {
            child: createNestedSchema(depth - 1),
          },
        };
      };

      const node = nodeFromJsonSchema({
        jsonSchema: createNestedSchema(5),
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      const deepestNode = node.find('./child/child/child/child/child');
      expect(deepestNode?.visible).toBe(false);

      const startTime = performance.now();
      contextNode.setValue({ enabled: true });
      await delay();
      const endTime = performance.now();

      expect(deepestNode?.visible).toBe(true);
      expect(endTime - startTime).toBeLessThan(50);
    });

    it('배열 아이템이 많을 때 context 변경이 적절한 시간 내에 완료되어야 함', async () => {
      const contextNode = contextNodeFactory({ readOnly: false });

      // 30개 아이템의 기본값 생성
      const defaultItems = Array.from({ length: 30 }, (_, i) => ({
        name: `item${i}`,
      }));

      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    computed: {
                      readOnly: '@.readOnly === true',
                    },
                  },
                },
              },
              default: defaultItems,
            },
          },
        } satisfies JsonSchema,
        onChange: () => {},
        context: contextNode,
      });

      await delay();

      // 초기 상태 확인 (샘플링)
      expect(node.find('./items/0/name')?.readOnly).toBe(false);
      expect(node.find('./items/15/name')?.readOnly).toBe(false);
      expect(node.find('./items/29/name')?.readOnly).toBe(false);

      const startTime = performance.now();
      contextNode.setValue({ readOnly: true });
      await delay();
      const endTime = performance.now();

      // 모든 아이템이 업데이트됨
      expect(node.find('./items/0/name')?.readOnly).toBe(true);
      expect(node.find('./items/15/name')?.readOnly).toBe(true);
      expect(node.find('./items/29/name')?.readOnly).toBe(true);

      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});
