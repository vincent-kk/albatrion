import { useState } from 'react';

import { Form, type JsonSchema } from '../src';
import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/39. injectTo',
};

/**
 * 기본 형제 필드 인젝션 (../)
 * - source 필드 값 변경 시 target 필드로 값이 자동 주입됨
 */
export const BasicSiblingInjection = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      source: {
        type: 'string',
        title: 'Source (입력하면 Target에 주입)',
        injectTo: (value: string) => ({
          '../target': `injected: ${value}`,
        }),
      },
      target: {
        type: 'string',
        title: 'Target (자동 주입됨)',
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

/**
 * 절대 경로 인젝션 (/)
 * - 깊이 중첩된 필드에서 루트 레벨 필드로 값 주입
 */
export const AbsolutePathInjection = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      rootTarget: {
        type: 'string',
        title: 'Root Target (자동 주입됨)',
      },
      nested: {
        type: 'object',
        title: 'Nested Container',
        properties: {
          deep: {
            type: 'object',
            title: 'Deep Container',
            properties: {
              source: {
                type: 'string',
                title: 'Deep Source (입력하면 루트로 주입)',
                injectTo: (value: string) => ({
                  '/rootTarget': `from-deep: ${value}`,
                }),
              },
            },
          },
        },
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

/**
 * 다중 타겟 인젝션
 * - 하나의 소스에서 여러 타겟으로 동시에 값 주입
 */
export const MultipleTargetInjection = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      source: {
        type: 'string',
        title: 'Source (여러 타겟에 주입)',
        injectTo: (value: string) => ({
          '../target1': `${value}-1`,
          '../target2': `${value}-2`,
          '../target3': `${value}-3`,
        }),
      },
      target1: { type: 'string', title: 'Target 1' },
      target2: { type: 'string', title: 'Target 2' },
      target3: { type: 'string', title: 'Target 3' },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

/**
 * 직접 순환 참조 방지 (A ↔ B)
 * - fieldA와 fieldB가 서로를 참조하지만 무한 루프 방지됨
 * - injectedNodeFlags를 통해 동일 매크로 태스크 내 순환 참조 차단
 */
export const CircularReferencePreventionDirect = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      fieldA: {
        type: 'string',
        title: 'Field A (→ B로 주입)',
        injectTo: (value: string) => ({
          '../fieldB': `fromA: ${value}`,
        }),
      },
      fieldB: {
        type: 'string',
        title: 'Field B (→ A로 주입 시도, 순환 방지됨)',
        injectTo: (value: string) => ({
          '../fieldA': `fromB: ${value}`,
        }),
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <p style={{ color: 'blue', marginBottom: 10 }}>
        💡 Field A 입력 시: A → B로 주입 → B가 A로 주입 시도하지만 순환 참조
        방지됨
      </p>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

/**
 * 삼각 순환 참조 방지 (A → B → C → A)
 * - 3개 필드가 순환 참조하지만 무한 루프 방지됨
 */
export const CircularReferencePreventionTriangular = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      fieldA: {
        type: 'string',
        title: 'Field A (→ B)',
        injectTo: (value: string) => ({
          '../fieldB': `A→B: ${value}`,
        }),
      },
      fieldB: {
        type: 'string',
        title: 'Field B (→ C)',
        injectTo: (value: string) => ({
          '../fieldC': `B→C: ${value}`,
        }),
      },
      fieldC: {
        type: 'string',
        title: 'Field C (→ A, 순환 방지됨)',
        injectTo: (value: string) => ({
          '../fieldA': `C→A: ${value}`,
        }),
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <p style={{ color: 'blue', marginBottom: 10 }}>
        💡 Field A 입력 시: A → B → C까지 체인 실행, C → A는 순환 방지
      </p>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

/**
 * 체인 인젝션 (A → B → C, 비순환)
 * - A 변경 → B 자동 업데이트 → C 자동 업데이트
 */
export const ChainInjection = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      a: {
        type: 'string',
        title: 'A (체인 시작점)',
        injectTo: (value: string) => ({
          '../b': `A→${value}`,
        }),
      },
      b: {
        type: 'string',
        title: 'B (A로부터 받고 C로 전달)',
        injectTo: (value: string) => ({
          '../c': `B→${value}`,
        }),
      },
      c: {
        type: 'string',
        title: 'C (체인 종점)',
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <p style={{ color: 'blue', marginBottom: 10 }}>
        💡 A에 "start" 입력 시: A="start" → B="A→start" → C="B→A→start"
      </p>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

/**
 * 부모 경로로 인젝션 (../../)
 * - 중첩된 구조에서 상위 레벨 형제 노드로 값 주입
 */
export const ParentPathInjection = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      parent: {
        type: 'object',
        title: 'Parent',
        properties: {
          child: {
            type: 'object',
            title: 'Child',
            properties: {
              source: {
                type: 'string',
                title: 'Source (../../uncle로 주입)',
                injectTo: (value: string) => ({
                  '../../uncle': `from-grandchild: ${value}`,
                }),
              },
            },
          },
          uncle: {
            type: 'string',
            title: 'Uncle (형제의 자식으로부터 주입받음)',
          },
        },
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

/**
 * 배열 아이템에서 외부 필드로 인젝션
 * - 배열 내 아이템 값 변경 시 외부 summary 필드 업데이트
 */
export const ArrayItemInjection = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        title: 'Items',
        items: {
          type: 'object',
          properties: {
            value: {
              type: 'string',
              title: 'Item Value (summary로 주입)',
              injectTo: (value: string) => ({
                '/summary': `item-value: ${value}`,
              }),
            },
          },
        },
        default: [{ value: '' }],
      },
      summary: {
        type: 'string',
        title: 'Summary (배열 아이템에서 주입받음)',
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

/**
 * 조건부 인젝션 (null 반환 시 스킵)
 * - 특정 조건에서만 인젝션 수행
 */
export const ConditionalInjection = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      source: {
        type: 'string',
        title: 'Source (3자 이상일 때만 주입)',
        injectTo: (value: string) => {
          if (value.length < 3) return null;
          return { '../target': `valid: ${value}` };
        },
      },
      target: {
        type: 'string',
        title: 'Target (3자 이상일 때만 업데이트됨)',
        default: 'waiting...',
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <p style={{ color: 'blue', marginBottom: 10 }}>
        💡 Source에 3자 미만 입력: Target 유지 / 3자 이상 입력: Target 업데이트
      </p>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

/**
 * oneOf 내부 필드에서 외부 필드로 인젝션
 * - 조건부 스키마의 필드에서 외부 필드로 값 주입
 */
export const OneOfInternalToExternal = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        enum: ['game', 'movie'],
        default: 'game',
        title: 'Category',
      },
      summary: {
        type: 'string',
        title: 'Summary (oneOf 필드에서 주입받음)',
      },
    },
    oneOf: [
      {
        '&if': "./category === 'game'",
        properties: {
          platform: {
            type: 'string',
            title: 'Platform (game)',
            injectTo: (value: string) => ({
              '/summary': `Game platform: ${value}`,
            }),
          },
        },
      },
      {
        '&if': "./category === 'movie'",
        properties: {
          director: {
            type: 'string',
            title: 'Director (movie)',
            injectTo: (value: string) => ({
              '/summary': `Directed by: ${value}`,
            }),
          },
        },
      },
    ],
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <p style={{ color: 'blue', marginBottom: 10 }}>
        💡 Category 변경 시 다른 조건부 필드가 표시되고, 해당 필드에서 Summary로
        주입
      </p>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

/**
 * 인젝션으로 oneOf 조건 변경
 * - trigger 필드 값에 따라 category가 자동 변경되어 oneOf 분기 전환
 */
export const OneOfConditionChangeViaInjection = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      trigger: {
        type: 'string',
        title: 'Trigger ("switch" 입력 시 category가 B로 변경)',
        injectTo: (value: string) => ({
          '/category': value === 'switch' ? 'B' : 'A',
        }),
      },
      category: {
        type: 'string',
        enum: ['A', 'B'],
        default: 'A',
        title: 'Category (trigger에 의해 변경됨)',
      },
    },
    oneOf: [
      {
        '&if': "./category === 'A'",
        properties: {
          fieldA: {
            type: 'string',
            title: 'Field A (category=A일 때 표시)',
            default: 'A-default',
          },
        },
      },
      {
        '&if': "./category === 'B'",
        properties: {
          fieldB: {
            type: 'string',
            title: 'Field B (category=B일 때 표시)',
            default: 'B-default',
          },
        },
      },
    ],
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <p style={{ color: 'blue', marginBottom: 10 }}>
        💡 Trigger에 "switch" 입력 → Category가 B로 변경 → Field B 표시
      </p>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

/**
 * 여러 소스에서 동일 타겟으로 인젝션 (Last Write Wins)
 * - 마지막으로 변경된 소스의 값이 타겟에 반영됨
 */
export const MultipleSourceToSameTarget = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      source1: {
        type: 'string',
        title: 'Source 1 (→ target)',
        injectTo: (value: string) => ({
          '../target': `from-source1: ${value}`,
        }),
      },
      source2: {
        type: 'string',
        title: 'Source 2 (→ target)',
        injectTo: (value: string) => ({
          '../target': `from-source2: ${value}`,
        }),
      },
      target: {
        type: 'string',
        title: 'Target (마지막 소스 값 반영)',
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <p style={{ color: 'blue', marginBottom: 10 }}>
        💡 Source1 또는 Source2 입력 시 Target이 해당 소스 값으로 업데이트됨
      </p>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};
