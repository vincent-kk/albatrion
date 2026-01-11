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

// ============================================================================
// 🚨 oneOf/anyOf와 derivedValue의 무한 루프 위험 케이스
// ============================================================================

/**
 * 🔴 위험 케이스 1: oneOf 조건문(if)이 derived 값에 의존하는 경우
 *
 * oneOf의 if 조건이 다른 필드의 derived 값을 참조하고,
 * 해당 derived 필드가 다시 oneOf 분기 내부의 값을 참조하면 무한 루프가 발생할 수 있습니다.
 *
 * 이 예시는 안전한 패턴을 보여줍니다:
 * - oneOf의 if 조건은 사용자 입력값(mode)을 직접 참조
 * - derived는 외부 필드만 참조 (oneOf 분기 내부로의 역참조 없음)
 */
export const SafeOneOfWithDerivedCondition = () => {
  const jsonSchema: JsonSchema = {
    type: 'object',
    properties: {
      mode: {
        type: 'string',
        title: '모드 선택',
        enum: ['simple', 'advanced'],
        default: 'simple',
      },
      baseValue: {
        type: 'number',
        title: '기본값',
        default: 100,
      },
      result: {
        type: 'object',
        title: '결과',
        oneOf: [
          {
            type: 'object',
            title: '간단 모드',
            computed: {
              // ✅ 안전: 사용자 입력값을 직접 참조
              if: '/mode === "simple"',
            },
            properties: {
              calculation: {
                type: 'number',
                title: '계산 결과',
                computed: {
                  // ✅ 안전: 외부 필드만 참조, 순환 없음
                  derived: '/baseValue * 2',
                },
              },
            },
          },
          {
            type: 'object',
            title: '고급 모드',
            computed: {
              if: '/mode === "advanced"',
            },
            properties: {
              calculation: {
                type: 'number',
                title: '계산 결과',
                computed: {
                  derived: '/baseValue * 3 + 50',
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
        style={{ padding: '10px', background: '#d4edda', marginBottom: '10px' }}
      >
        <strong>✅ 안전한 패턴: oneOf + derived</strong>
        <br />
        <code>if</code> 조건은 사용자 입력값을 직접 참조하고,
        <br />
        <code>derived</code>는 외부 필드만 참조하여 순환을 방지합니다.
      </div>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

/**
 * 🔴 위험 케이스 2: oneOf의 if 조건이 derived 값에 의존하고, derived가 분기를 결정
 *
 * 이 패턴은 매우 위험합니다:
 * 1. derived 값이 계산됨
 * 2. if 조건이 derived 값을 검사하여 분기 결정
 * 3. 새 분기가 활성화되면 새로운 derived 값이 계산됨
 * 4. 새로운 derived 값이 if 조건에 영향 → 무한 루프!
 *
 * 아래는 회피 방법을 보여줍니다:
 * - derived 값과 if 조건을 분리하여 직접적인 순환을 피함
 */
export const DangerOneOfIfDependsOnDerived = () => {
  const jsonSchema: JsonSchema = {
    type: 'object',
    properties: {
      price: {
        type: 'number',
        title: '가격',
        default: 100,
      },
      quantity: {
        type: 'number',
        title: '수량',
        default: 1,
      },
      // ⚠️ 이 derived 값이 oneOf 조건을 결정하게 하면 위험!
      totalPrice: {
        type: 'number',
        title: '총 가격 (자동 계산)',
        computed: {
          derived: '../price * ../quantity',
        },
      },
      // 안전한 방식: if 조건에서 derived 대신 원본 값들을 직접 계산
      discount: {
        type: 'object',
        title: '할인 정보',
        oneOf: [
          {
            type: 'object',
            title: '할인 없음',
            computed: {
              // ✅ 안전: derived(totalPrice)를 참조하지 않고 원본 값으로 직접 계산
              if: '/price * /quantity < 1000',
            },
            properties: {
              message: {
                type: 'string',
                title: '메시지',
                default: '1,000원 이상 구매 시 할인!',
              },
            },
          },
          {
            type: 'object',
            title: '10% 할인',
            computed: {
              if: '/price * /quantity >= 1000 && /price * /quantity < 5000',
            },
            properties: {
              rate: {
                type: 'number',
                title: '할인율',
                default: 10,
              },
              discountedPrice: {
                type: 'number',
                title: '할인된 가격',
                computed: {
                  derived: '/totalPrice * 0.9',
                },
              },
            },
          },
          {
            type: 'object',
            title: '20% 할인',
            computed: {
              if: '/price * /quantity >= 5000',
            },
            properties: {
              rate: {
                type: 'number',
                title: '할인율',
                default: 20,
              },
              discountedPrice: {
                type: 'number',
                title: '할인된 가격',
                computed: {
                  derived: '/totalPrice * 0.8',
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
        style={{ padding: '10px', background: '#fff3cd', marginBottom: '10px' }}
      >
        <strong>⚠️ 주의 패턴: oneOf if가 derived와 같은 계산을 사용</strong>
        <br />
        <code>if</code> 조건에서 <code>derived</code>된 값을 직접 참조하면
        위험합니다.
        <br />
        대신 <code>if</code> 조건에서 원본 값으로 동일한 계산을 수행합니다.
        <br />
        <br />
        <strong>❌ 위험:</strong>{' '}
        <code>{'computed: { if: "/totalPrice >= 1000" }'}</code>
        <br />
        <strong>✅ 안전:</strong>{' '}
        <code>{'computed: { if: "/price * /quantity >= 1000" }'}</code>
      </div>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

/**
 * 🔴 위험 케이스 3: anyOf 분기 간 derived 상호 참조
 *
 * anyOf는 여러 분기가 동시에 활성화될 수 있어서,
 * 분기 간 상호 참조가 발생하면 무한 루프 위험이 높습니다.
 *
 * 이 예시는 안전한 패턴을 보여줍니다:
 * - 각 분기의 derived는 독립적인 외부 값만 참조
 * - 분기 간 상호 참조 없음
 */
export const SafeAnyOfIndependentDerived = () => {
  const jsonSchema: JsonSchema = {
    type: 'object',
    properties: {
      baseValue: {
        type: 'number',
        title: '기본값',
        default: 100,
      },
      showPercentages: {
        type: 'boolean',
        title: '퍼센트 계산 표시',
        default: true,
      },
      showMultiples: {
        type: 'boolean',
        title: '배수 계산 표시',
        default: true,
      },
      calculations: {
        type: 'object',
        title: '계산 결과',
        anyOf: [
          {
            type: 'object',
            title: '퍼센트 계산',
            computed: {
              if: '/showPercentages',
            },
            properties: {
              // ✅ 안전: 독립적인 외부 값만 참조
              tenPercent: {
                type: 'number',
                title: '10%',
                computed: {
                  derived: '/baseValue * 0.1',
                },
              },
              twentyPercent: {
                type: 'number',
                title: '20%',
                computed: {
                  derived: '/baseValue * 0.2',
                },
              },
            },
          },
          {
            type: 'object',
            title: '배수 계산',
            computed: {
              if: '/showMultiples',
            },
            properties: {
              // ✅ 안전: 독립적인 외부 값만 참조
              double: {
                type: 'number',
                title: '2배',
                computed: {
                  derived: '/baseValue * 2',
                },
              },
              triple: {
                type: 'number',
                title: '3배',
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
        style={{ padding: '10px', background: '#d4edda', marginBottom: '10px' }}
      >
        <strong>✅ 안전한 패턴: anyOf 독립적 derived</strong>
        <br />각 anyOf 분기의 derived 값이 독립적인 외부 값만 참조합니다.
        <br />
        분기 간 상호 참조가 없어 무한 루프 위험이 없습니다.
      </div>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

/**
 * 🔴 위험 케이스 4: active 조건이 derived에 의존하고, derived가 active에 영향
 *
 * active 조건이 어떤 필드의 derived 값에 의존하고,
 * 그 필드가 다시 해당 노드의 active 상태에 따라 변경되면 무한 루프!
 *
 * 이 예시는 회피 방법을 보여줍니다:
 * - active 조건은 사용자 입력값만 참조
 * - derived는 active와 무관한 값만 참조
 */
export const SafeActiveWithDerived = () => {
  const jsonSchema: JsonSchema = {
    type: 'object',
    properties: {
      enableFeature: {
        type: 'boolean',
        title: '기능 활성화',
        default: false,
      },
      inputValue: {
        type: 'number',
        title: '입력값',
        default: 100,
      },
      // ✅ 안전: active는 사용자 입력을 참조, derived는 다른 사용자 입력을 참조
      calculatedValue: {
        type: 'number',
        title: '계산된 값 (기능 활성화 시)',
        computed: {
          active: '../enableFeature', // 사용자 입력 참조
          derived: '../inputValue * 2', // 다른 사용자 입력 참조
        },
      },
    },
  };

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div
        style={{ padding: '10px', background: '#d4edda', marginBottom: '10px' }}
      >
        <strong>✅ 안전한 패턴: active + derived 분리</strong>
        <br />
        <code>active</code> 조건은 사용자 입력값을 참조하고,
        <br />
        <code>derived</code>는 다른 사용자 입력값을 참조하여 순환을 방지합니다.
      </div>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

/**
 * 🔴 위험 케이스 5: oneOf 분기 전환이 외부 derived를 변경하고, 그 derived가 분기 조건에 사용
 *
 * 이 패턴은 다음과 같은 순환을 만듭니다:
 * 1. oneOf 분기 A가 활성화됨
 * 2. 분기 A의 값이 외부 derived 필드에 영향
 * 3. 외부 derived 값이 oneOf의 if 조건 변경
 * 4. 새로운 분기 B가 활성화됨
 * 5. 분기 B의 값이 외부 derived 필드에 영향 → 무한 루프!
 *
 * 아래는 회피 방법을 보여줍니다.
 */
export const DangerOneOfBranchAffectsDerived = () => {
  const jsonSchema: JsonSchema = {
    type: 'object',
    properties: {
      userChoice: {
        type: 'string',
        title: '사용자 선택',
        enum: ['option1', 'option2'],
        default: 'option1',
      },
      options: {
        type: 'object',
        title: '옵션',
        oneOf: [
          {
            type: 'object',
            title: '옵션 1',
            computed: {
              // ✅ 안전: 사용자 입력만 참조
              if: '/userChoice === "option1"',
            },
            properties: {
              multiplier: {
                type: 'number',
                title: '배수',
                default: 2,
              },
            },
          },
          {
            type: 'object',
            title: '옵션 2',
            computed: {
              if: '/userChoice === "option2"',
            },
            properties: {
              multiplier: {
                type: 'number',
                title: '배수',
                default: 3,
              },
            },
          },
        ],
      },
      baseValue: {
        type: 'number',
        title: '기본값',
        default: 100,
      },
      // ✅ 안전: oneOf 내부 값을 참조하지만, 이 derived가 다시 oneOf 조건에 영향을 주지 않음
      result: {
        type: 'number',
        title: '결과 (기본값 × 배수)',
        computed: {
          // oneOf 분기의 값을 참조
          derived: '/baseValue * (/options/multiplier ?? 1)',
        },
      },
    },
  };

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div
        style={{ padding: '10px', background: '#d4edda', marginBottom: '10px' }}
      >
        <strong>✅ 안전한 패턴: oneOf 분기 값을 derived에서 참조</strong>
        <br />
        oneOf 분기 내부의 값을 derived에서 참조하되,
        <br />
        해당 derived가 다시 oneOf 조건에 영향을 주지 않으면 안전합니다.
        <br />
        <br />
        <strong>핵심:</strong> derived 결과가 <code>if</code> 조건에 사용되지
        않아야 합니다.
      </div>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

/**
 * 🔴 위험 케이스 6: derived 체인이 oneOf 조건에 영향
 *
 * A → B → C 형태의 derived 체인에서,
 * 마지막 C가 oneOf 조건에 사용되고, oneOf 분기가 A에 영향을 주면 무한 루프!
 *
 * 이 예시는 안전한 derived 체인을 보여줍니다.
 */
export const SafeDerivedChainWithOneOf = () => {
  const jsonSchema: JsonSchema = {
    type: 'object',
    properties: {
      input: {
        type: 'number',
        title: '입력값',
        default: 100,
      },
      // derived 체인: input → step1 → step2 → final
      step1: {
        type: 'number',
        title: '단계 1 (입력값 + 10)',
        computed: {
          derived: '../input + 10',
        },
      },
      step2: {
        type: 'number',
        title: '단계 2 (단계1 × 2)',
        computed: {
          derived: '../step1 * 2',
        },
      },
      final: {
        type: 'number',
        title: '최종 (단계2 + 100)',
        computed: {
          derived: '../step2 + 100',
        },
      },
      // ✅ 안전: oneOf 조건이 derived 체인과 무관
      displayMode: {
        type: 'string',
        title: '표시 모드',
        enum: ['compact', 'detailed'],
        default: 'compact',
      },
      display: {
        type: 'object',
        title: '표시 영역',
        oneOf: [
          {
            type: 'object',
            title: '간략 표시',
            computed: {
              // ✅ 안전: 사용자 입력만 참조, derived 체인과 무관
              if: '/displayMode === "compact"',
            },
            properties: {
              summary: {
                type: 'string',
                title: '요약',
                computed: {
                  derived: '"결과: " + /final',
                },
              },
            },
          },
          {
            type: 'object',
            title: '상세 표시',
            computed: {
              if: '/displayMode === "detailed"',
            },
            properties: {
              detail: {
                type: 'string',
                title: '상세',
                computed: {
                  derived:
                    '"입력: " + /input + " → 단계1: " + /step1 + " → 단계2: " + /step2 + " → 최종: " + /final',
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
        style={{ padding: '10px', background: '#d4edda', marginBottom: '10px' }}
      >
        <strong>✅ 안전한 패턴: derived 체인 + oneOf 분리</strong>
        <br />
        derived 체인 (input → step1 → step2 → final)과
        <br />
        oneOf 조건 (displayMode)이 완전히 분리되어 있습니다.
        <br />
        <br />
        <strong>핵심:</strong> oneOf 조건은 사용자 입력만 참조, derived 결과를
        참조하지 않음
      </div>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

/**
 * 🔴 실제 무한 루프 시뮬레이션 (비활성화됨)
 *
 * 이 케이스는 실제로 무한 루프를 발생시키는 패턴을 보여줍니다.
 * ⚠️ 경고: 주석 해제 시 브라우저가 멈출 수 있습니다!
 */
export const DangerInfiniteLoopSimulation = () => {
  // ⚠️ 이 스키마는 무한 루프를 발생시킵니다. 활성화하지 마세요!
  const jsonSchema: JsonSchema = {
    type: 'object',
    properties: {
      warning: {
        type: 'string',
        title: '⚠️ 경고',
        default: '아래 주석 처리된 스키마는 무한 루프를 발생시킵니다.',
        FormTypeInputProps: {
          disabled: true,
        },
      },
      // ❌ 위험한 패턴 1: oneOf if가 derived를 직접 참조
      // derived가 변경 → if 조건 재평가 → 분기 전환 → 새 derived 계산 → 무한 루프
      //
      // threshold: {
      //   type: 'number',
      //   computed: {
      //     derived: '/value * 2',  // value가 변경되면 threshold도 변경
      //   },
      // },
      // conditional: {
      //   type: 'object',
      //   oneOf: [
      //     {
      //       type: 'object',
      //       computed: {
      //         if: '/threshold < 100',  // ❌ derived인 threshold를 참조!
      //       },
      //       properties: {
      //         value: { type: 'number', default: 10 },  // 이 값이 threshold에 영향
      //       },
      //     },
      //     {
      //       type: 'object',
      //       computed: {
      //         if: '/threshold >= 100',
      //       },
      //       properties: {
      //         value: { type: 'number', default: 100 },  // 분기 전환 시 이 값이 threshold에 영향
      //       },
      //     },
      //   ],
      // },
    },
  };

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div
        style={{ padding: '10px', background: '#f8d7da', marginBottom: '10px' }}
      >
        <strong>🔴 무한 루프 패턴 (비활성화됨)</strong>
        <br />
        <br />
        <strong>위험한 패턴:</strong>
        <pre
          style={{
            background: '#fff',
            padding: '10px',
            fontSize: '12px',
            overflow: 'auto',
          }}
        >
          {`// threshold는 derived (value * 2)
threshold: {
  computed: { derived: '/value * 2' }
}

// oneOf의 if가 threshold(derived)를 참조
conditional: {
  oneOf: [
    {
      computed: { if: '/threshold < 100' },  // ❌ derived 참조!
      properties: {
        value: { default: 10 }  // threshold = 20
      }
    },
    {
      computed: { if: '/threshold >= 100' },
      properties: {
        value: { default: 100 }  // threshold = 200
      }
    }
  ]
}`}
        </pre>
        <br />
        <strong>순환:</strong>
        <ol style={{ margin: '5px 0', paddingLeft: '20px' }}>
          <li>초기 value=10 → threshold=20 → 첫 번째 분기 활성화</li>
          <li>value를 100으로 수동 변경 → threshold=200</li>
          <li>threshold≥100 → 두 번째 분기로 전환</li>
          <li>두 번째 분기의 value=100 → threshold=200 (유지)</li>
          <li>
            만약 분기마다 value가 다르고 threshold 조건이 분기 전환을 일으키면
            무한 루프!
          </li>
        </ol>
      </div>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

/**
 * 📋 무한 루프 방지 가이드라인 요약
 */
export const InfiniteLoopPreventionGuide = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h2>🛡️ oneOf/anyOf와 derivedValue 무한 루프 방지 가이드</h2>

      <h3>❌ 피해야 할 패턴</h3>
      <ul>
        <li>
          <strong>oneOf/anyOf의 if 조건에서 derived 값 직접 참조</strong>
          <br />
          <code>{'computed: { if: "/derivedField > 100" }'}</code>
        </li>
        <li>
          <strong>derived가 분기 내부 값을 참조하고, 그 값이 분기 조건에 영향</strong>
          <br />
          분기 전환 → derived 변경 → 분기 전환 → 무한 루프
        </li>
        <li>
          <strong>anyOf 분기 간 derived 상호 참조</strong>
          <br />
          분기 A의 derived가 분기 B를 참조하고, 분기 B의 derived가 분기 A를 참조
        </li>
        <li>
          <strong>active 조건이 해당 노드의 derived 결과에 의존</strong>
          <br />
          active=true → derived 계산 → active=false → derived 미계산 →
          active=true
        </li>
      </ul>

      <h3>✅ 안전한 패턴</h3>
      <ul>
        <li>
          <strong>oneOf/anyOf의 if 조건은 사용자 입력값만 참조</strong>
          <br />
          <code>{'computed: { if: "/userInput === \\"option1\\"" }'}</code>
        </li>
        <li>
          <strong>derived는 외부 독립 필드만 참조</strong>
          <br />
          분기 조건에 영향을 주지 않는 필드들만 참조
        </li>
        <li>
          <strong>if 조건에서 동일한 계산이 필요하면 원본 값으로 직접 계산</strong>
          <br />
          <code>{'computed: { if: "/price * /quantity > 1000" }'}</code> (O)
          <br />
          <code>{'computed: { if: "/totalPrice > 1000" }'}</code> (X, totalPrice가
          derived인 경우)
        </li>
        <li>
          <strong>derived 체인과 oneOf 조건을 완전히 분리</strong>
          <br />
          derived 체인의 결과가 oneOf 조건에 사용되지 않도록 설계
        </li>
      </ul>

      <h3>🔍 순환 감지 체크리스트</h3>
      <ol>
        <li>oneOf/anyOf의 if 조건이 참조하는 필드 목록 작성</li>
        <li>해당 필드 중 computed.derived가 있는 필드 확인</li>
        <li>derived 표현식이 oneOf/anyOf 분기 내부 값을 참조하는지 확인</li>
        <li>분기 내부 값 변경이 derived에 영향 → derived가 if 조건에 영향이면 위험!</li>
      </ol>

      <h3>💡 팁</h3>
      <ul>
        <li>
          <code>./</code> (자기 자신 참조)를 사용한 조건부 업데이트로 일부 순환
          방지 가능
        </li>
        <li>equals 체크로 수렴하는 순환은 자동으로 중단됨</li>
        <li>발산하는 순환 (값이 계속 증가/변경)은 무한 루프 발생!</li>
      </ul>
    </div>
  );
};
