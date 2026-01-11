import { useState } from 'react';

import { Form, type JsonSchema } from '../src';
import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/36. DerivedValue',
};

/**
 * 기본적인 derivedValue 사용 예시
 * - totalPrice는 price * quantity로 계산됨
 */
export const BasicDerivedValue = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      price: {
        type: 'number',
        title: '가격',
        default: 1000,
      },
      quantity: {
        type: 'number',
        title: '수량',
        default: 1,
      },
      totalPrice: {
        type: 'number',
        title: '총 가격 (자동 계산)',
        computed: {
          derived: '../price * ../quantity',
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
 * 문자열 연결 derivedValue 예시
 * - fullName은 firstName + lastName으로 계산됨
 */
export const StringConcatenation = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      firstName: {
        type: 'string',
        title: '이름',
        default: '길동',
      },
      lastName: {
        type: 'string',
        title: '성',
        default: '홍',
      },
      fullName: {
        type: 'string',
        title: '전체 이름 (자동 계산)',
        computed: {
          derived: '../lastName + ../firstName',
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
 * 삼항 연산자를 사용한 조건부 값 계산
 */
export const ConditionalDerivedValue = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      age: {
        type: 'number',
        title: '나이',
        default: 20,
      },
      ageGroup: {
        type: 'string',
        title: '연령대 (자동 계산)',
        computed: {
          derived: '../age >= 18 ? "성인" : "미성년자"',
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
 * 복잡한 수식을 사용한 derivedValue
 * - 세금 포함 가격 계산
 */
export const ComplexCalculation = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      price: {
        type: 'number',
        title: '가격',
        default: 10000,
      },
      quantity: {
        type: 'number',
        title: '수량',
        default: 2,
      },
      taxRate: {
        type: 'number',
        title: '세율 (%)',
        default: 10,
      },
      discountRate: {
        type: 'number',
        title: '할인율 (%)',
        default: 5,
      },
      finalPrice: {
        type: 'number',
        title: '최종 가격 (자동 계산)',
        computed: {
          derived:
            '../price * ../quantity * (1 + ../taxRate / 100) * (1 - ../discountRate / 100)',
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
 * Null 병합 연산자를 사용한 기본값 처리
 */
export const NullCoalescing = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      nickname: {
        type: 'string',
        title: '별명 (선택)',
      },
      name: {
        type: 'string',
        title: '이름',
        default: '익명',
      },
      displayName: {
        type: 'string',
        title: '표시 이름 (자동 계산)',
        computed: {
          derived: '../nickname || ../name || "알 수 없음"',
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
 * 부모 경로 참조를 사용한 derivedValue
 * - 중첩된 구조에서 상위 노드의 값 참조
 */
export const ParentPathReference = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      basePrice: {
        type: 'number',
        title: '기본 가격',
        default: 50000,
      },
      options: {
        type: 'object',
        title: '옵션',
        properties: {
          discountPercent: {
            type: 'number',
            title: '할인율 (%)',
            default: 10,
          },
          discountedPrice: {
            type: 'number',
            title: '할인된 가격 (자동 계산)',
            computed: {
              derived: '../../basePrice * (1 - ../discountPercent / 100)',
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
 * 절대 경로 참조를 사용한 derivedValue
 */
export const AbsolutePathReference = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      config: {
        type: 'object',
        title: '설정',
        properties: {
          taxRate: {
            type: 'number',
            title: '세율 (%)',
            default: 10,
          },
        },
      },
      product: {
        type: 'object',
        title: '상품',
        properties: {
          price: {
            type: 'number',
            title: '가격',
            default: 10000,
          },
          priceWithTax: {
            type: 'number',
            title: '세금 포함 가격 (자동 계산)',
            computed: {
              derived: '../price * (1 + /config/taxRate / 100)',
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
 * &value 별칭 문법 사용
 */
export const AliasValueSyntax = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      a: {
        type: 'number',
        title: 'A',
        default: 10,
      },
      b: {
        type: 'number',
        title: 'B',
        default: 20,
      },
      sum: {
        type: 'number',
        title: '합계 (자동 계산)',
        '&derived': '../a + ../b',
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
 * ⚠️ 무한 루프 위험 케이스 1: 자기 참조
 *
 * 이 스토리는 자기 자신을 참조하는 derivedValue의 위험성을 보여줍니다.
 * 현재 구현에서는 equals 체크로 일부 방지되지만, 완전하지 않을 수 있습니다.
 *
 * 주의: 이 패턴은 피해야 합니다!
 */
export const DangerSelfReference = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      trigger: {
        type: 'number',
        title: '트리거 값',
        default: 1,
      },
      selfReferencing: {
        type: 'number',
        title: '⚠️ 자기 참조 (위험)',
        default: 0,
        computed: {
          // 이 표현식은 자기 자신의 값에 의존하지 않고 다른 값에만 의존
          // 자기 참조는 무한 루프를 발생시킬 수 있으므로 피해야 함
          derived: '../trigger * 10',
        },
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div
        style={{ padding: '10px', background: '#fff3cd', marginBottom: '10px' }}
      >
        <strong>⚠️ 주의:</strong> derivedValue에서 자기 자신을 참조하면 무한
        루프가 발생할 수 있습니다. 이 예시는 안전한 패턴을 보여줍니다.
      </div>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

/**
 * ⚠️ 무한 루프 위험 케이스 2: 순환 참조
 *
 * A → B → A 형태의 순환 참조는 무한 루프를 발생시킬 수 있습니다.
 * 현재 구현에서는 equals 체크로 값이 같으면 업데이트를 중단하지만,
 * 값이 계속 변경되는 경우에는 무한 루프가 발생할 수 있습니다.
 *
 * 주의: 이 패턴은 피해야 합니다!
 */
export const DangerCircularReference = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      input: {
        type: 'number',
        title: '입력값',
        default: 100,
      },
      // 순환 참조를 피하기 위해 일방향 의존성만 사용
      calculated1: {
        type: 'number',
        title: '계산값 1 (input 기반)',
        computed: {
          derived: '../input * 1.1',
        },
      },
      calculated2: {
        type: 'number',
        title: '계산값 2 (calculated1 기반)',
        computed: {
          derived: '../calculated1 + 50',
        },
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div
        style={{ padding: '10px', background: '#fff3cd', marginBottom: '10px' }}
      >
        <strong>⚠️ 주의:</strong> 순환 참조 (A → B → A)는 무한 루프를 발생시킬
        수 있습니다. 이 예시는 안전한 일방향 의존성 패턴을 보여줍니다.
      </div>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

/**
 * 🔴 실제 양방향 순환 참조 (위험!)
 *
 * A → B → A 형태의 순환 참조입니다.
 * 이 케이스에서는 값이 수렴하므로 무한 루프가 발생하지 않습니다.
 * (a = b * 0.5, b = a + 10 → a = 10, b = 20으로 수렴)
 *
 * ⚠️ 주의: 값이 발산하는 수식을 사용하면 무한 루프가 발생합니다!
 */
export const RealCircularReferenceConverging = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      seed: {
        type: 'number',
        title: '시드값 (수동 입력)',
        default: 100,
      },
      a: {
        type: 'number',
        title: 'A (B의 절반)',
        computed: {
          // B가 변경되면 A도 변경됨
          derived: '../b * 0.5',
        },
      },
      b: {
        type: 'number',
        title: 'B (A + 10)',
        computed: {
          // A가 변경되면 B도 변경됨 → 순환!
          // 하지만 이 수식은 수렴함: a=10, b=20
          derived: '../a + 10',
        },
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div
        style={{ padding: '10px', background: '#d4edda', marginBottom: '10px' }}
      >
        <strong>✅ 수렴하는 순환 참조:</strong> A = B × 0.5, B = A + 10
        <br />
        이 수식은 A=10, B=20으로 수렴하므로 무한 루프가 발생하지 않습니다.
        <br />
        <code>equals</code> 체크로 값이 더 이상 변경되지 않으면 업데이트가
        중단됩니다.
      </div>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

/**
 * 🔴 실제 양방향 순환 참조 - 발산 케이스 (매우 위험!)
 *
 * 이 케이스는 값이 계속 증가하므로 무한 루프가 발생할 수 있습니다.
 * 현재 구현에서는 equals 체크로 방지되지만, 실제로는 값이 계속 변경됩니다.
 *
 * ⚠️ 경고: 이 스키마는 주석 처리되어 있습니다.
 * 실제 사용 시 브라우저가 멈출 수 있습니다!
 */
export const RealCircularReferenceDiverging = () => {
  // ⚠️ 위험! 이 스키마는 무한 루프를 발생시킬 수 있습니다.
  // 실제로 테스트하려면 주석을 해제하세요.
  const jsonSchema = {
    type: 'object',
    properties: {
      warning: {
        type: 'string',
        title: '⚠️ 경고',
        default: '이 스토리는 위험한 패턴을 보여줍니다.',
        FormTypeInputProps: {
          disabled: true,
        },
      },
      // 아래 스키마를 활성화하면 무한 루프 발생!
      // a: {
      //   type: 'number',
      //   title: 'A (B + 1)',
      //   computed: {
      //     derived: '../b + 1',  // 발산!
      //   },
      // },
      // b: {
      //   type: 'number',
      //   title: 'B (A + 1)',
      //   computed: {
      //     derived: '../a + 1',  // 발산!
      //   },
      // },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div
        style={{ padding: '10px', background: '#f8d7da', marginBottom: '10px' }}
      >
        <strong>🔴 발산하는 순환 참조 (비활성화됨):</strong>
        <br />
        <code>A = B + 1, B = A + 1</code>
        <br />
        이 수식은 값이 계속 증가하므로 무한 루프가 발생합니다!
        <br />
        <br />
        <strong>발산하는 수식 예시:</strong>
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          <li>
            <code>A = B + 1, B = A + 1</code> → 무한 증가
          </li>
          <li>
            <code>A = B * 2, B = A * 2</code> → 무한 증가
          </li>
          <li>
            <code>self = self + 1</code> → 자기 참조로 무한 증가
          </li>
        </ul>
      </div>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

/**
 * 🔴 자기 자신 참조 - 동일 값 (안전)
 *
 * 자기 자신을 참조하지만 값이 변경되지 않는 케이스입니다.
 * equals 체크로 무한 루프가 방지됩니다.
 */
export const SelfReferenceIdentity = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      input: {
        type: 'number',
        title: '입력값',
        default: 42,
      },
      // 자기 자신을 참조하지만 값을 그대로 반환
      // 이 경우 equals 체크로 무한 루프 방지
      identity: {
        type: 'number',
        title: '동일 값 반환 (안전)',
        default: 0,
        computed: {
          // 형제 노드를 참조하므로 안전
          derived: '../input',
        },
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div
        style={{ padding: '10px', background: '#d4edda', marginBottom: '10px' }}
      >
        <strong>✅ 동일 값 반환:</strong> 자기 자신이 아닌 형제 노드를 참조하면
        안전합니다.
      </div>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

/**
 * 배열 값의 길이를 계산하는 derivedValue
 */
export const ArrayLengthCalculation = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        title: '항목 목록',
        items: {
          type: 'string',
        },
        default: ['항목 1', '항목 2', '항목 3'],
      },
      itemCount: {
        type: 'number',
        title: '항목 개수 (자동 계산)',
        computed: {
          derived: '(../items)?.length ?? 0',
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
 * 옵셔널 체이닝을 사용한 안전한 값 접근
 */
export const OptionalChaining = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      user: {
        type: 'object',
        title: '사용자 정보',
        properties: {
          profile: {
            type: 'object',
            title: '프로필',
            properties: {
              name: {
                type: 'string',
                title: '이름',
              },
            },
          },
        },
      },
      displayName: {
        type: 'string',
        title: '표시 이름 (자동 계산)',
        computed: {
          derived: '(../user)?.profile?.name ?? "익명"',
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
 * 자기 자신(./)을 반환하여 조건부 업데이트 건너뛰기
 *
 * derived 표현식에서 자기 자신(./)을 반환하면,
 * equals 체크에 의해 값이 동일하므로 업데이트가 발생하지 않습니다.
 * 이를 활용하여 조건부로 업데이트를 건너뛸 수 있습니다.
 */
export const ConditionalUpdateWithSelf = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      enableAutoCalc: {
        type: 'boolean',
        title: '자동 계산 활성화',
        default: true,
      },
      price: {
        type: 'number',
        title: '가격',
        default: 1000,
      },
      quantity: {
        type: 'number',
        title: '수량',
        default: 2,
      },
      total: {
        type: 'number',
        title: '총액 (조건부 자동 계산)',
        default: 0,
        computed: {
          // enableAutoCalc가 true이면 계산, false이면 자기 자신(./) 반환하여 업데이트 안함
          derived: `{
            if(../enableAutoCalc) {
              return (../price * ../quantity);
            } else {
              return (./);
            }
          }`,
        },
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div
        style={{ padding: '10px', background: '#e7f3ff', marginBottom: '10px' }}
      >
        <strong>💡 조건부 업데이트:</strong>
        <br />
        <code>{'../enableAutoCalc ? ../price * ../quantity : ./'}</code>
        <br />
        <br />
        자동 계산이 비활성화되면 <code>./</code> (자기 자신)을 반환하여
        <br />
        현재 값을 유지합니다. 이때 <code>equals</code> 체크로 업데이트가
        발생하지 않습니다.
      </div>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

/**
 * oneOf와 derivedValue 함께 사용
 *
 * oneOf 분기에 따라 다른 계산식을 적용할 수 있습니다.
 * 분기가 변경되어도 derivedValue가 안정적으로 동작해야 합니다.
 */
export const DerivedValueWithOneOf = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      calcType: {
        type: 'string',
        title: '계산 방식',
        enum: ['multiply', 'add', 'subtract'],
        default: 'multiply',
      },
      a: {
        type: 'number',
        title: 'A 값',
        default: 10,
      },
      b: {
        type: 'number',
        title: 'B 값',
        default: 5,
      },
      result: {
        type: 'object',
        title: '결과',
        oneOf: [
          {
            type: 'object',
            title: '곱셈 결과',
            computed: {
              if: '/calcType === "multiply"',
            },
            properties: {
              value: {
                type: 'number',
                title: 'A × B',
                computed: {
                  derived: '/a * /b',
                },
              },
            },
          },
          {
            type: 'object',
            title: '덧셈 결과',
            computed: {
              if: '/calcType === "add"',
            },
            properties: {
              value: {
                type: 'number',
                title: 'A + B',
                computed: {
                  derived: '/a + /b',
                },
              },
            },
          },
          {
            type: 'object',
            title: '뺄셈 결과',
            computed: {
              if: '/calcType === "subtract"',
            },
            properties: {
              value: {
                type: 'number',
                title: 'A - B',
                computed: {
                  derived: '/a - /b',
                },
              },
            },
          },
        ],
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div
        style={{ padding: '10px', background: '#e7f3ff', marginBottom: '10px' }}
      >
        <strong>🔀 oneOf + derivedValue:</strong>
        <br />
        계산 방식을 변경하면 해당 분기의 derivedValue가 활성화됩니다.
        <br />
        분기 전환 시에도 안정적으로 값이 계산되어야 합니다.
      </div>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

/**
 * anyOf와 derivedValue 함께 사용
 *
 * 여러 anyOf 분기가 동시에 활성화될 수 있으며,
 * 각 분기에서 derivedValue가 독립적으로 계산됩니다.
 */
export const DerivedValueWithAnyOf = () => {
  const jsonSchema: JsonSchema = {
    type: 'object',
    properties: {
      baseValue: {
        type: 'number',
        title: '기본값',
        default: 100,
      },
      showDouble: {
        type: 'boolean',
        title: '2배 표시',
        default: true,
      },
      showTriple: {
        type: 'boolean',
        title: '3배 표시',
        default: false,
      },
      calculations: {
        type: 'object',
        title: '계산 결과',
        anyOf: [
          {
            type: 'object',
            title: '2배 계산',
            computed: {
              if: '/showDouble',
            },
            properties: {
              double: {
                type: 'number',
                title: '× 2',
                computed: {
                  derived: '/baseValue * 2',
                },
              },
            },
          },
          {
            type: 'object',
            title: '3배 계산',
            computed: {
              if: '/showTriple',
            },
            properties: {
              triple: {
                type: 'number',
                title: '× 3',
                computed: {
                  derived: '/baseValue * 3',
                },
              },
            },
          },
        ],
      },
    },
  };

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div
        style={{ padding: '10px', background: '#e7f3ff', marginBottom: '10px' }}
      >
        <strong>🔀 anyOf + derivedValue:</strong>
        <br />
        여러 분기가 동시에 활성화될 수 있습니다.
        <br />각 분기의 derivedValue가 독립적으로 계산됩니다.
      </div>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

/**
 * active 속성과 derivedValue 조합
 *
 * active가 false인 노드에서는 derivedValue도 계산되지 않아야 합니다.
 */
export const DerivedValueWithActive = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      isAdvancedMode: {
        type: 'boolean',
        title: '고급 모드',
        default: false,
      },
      price: {
        type: 'number',
        title: '가격',
        default: 1000,
      },
      advancedCalc: {
        type: 'number',
        title: '고급 계산 (고급 모드에서만)',
        computed: {
          active: '../isAdvancedMode',
          derived: '../price * 1.5',
        },
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div
        style={{ padding: '10px', background: '#e7f3ff', marginBottom: '10px' }}
      >
        <strong>🎛️ active + derivedValue:</strong>
        <br />
        고급 모드가 비활성화되면 노드 자체가 비활성화됩니다.
        <br />
        비활성 노드에서는 derivedValue도 계산되지 않습니다.
      </div>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};
