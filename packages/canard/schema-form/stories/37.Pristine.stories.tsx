import { useCallback, useRef, useState } from 'react';

import type { NodeStateFlags } from '@/schema-form/core/nodes';

import { Form, type FormHandle, type JSONSchema, NodeState } from '../src';
import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/37. Pristine',
};

/**
 * NodeStateFlags의 bitMask 키를 사람이 읽기 쉬운 형태로 변환
 */
const formatNodeState = (state: NodeStateFlags): Record<string, boolean> => {
  const result: Record<string, boolean> = {};
  if (state[NodeState.Dirty]) result['dirty'] = true;
  if (state[NodeState.Touched]) result['touched'] = true;
  if (state[NodeState.ShowError]) result['showError'] = true;
  // 기타 커스텀 상태도 포함
  for (const key of Object.keys(state)) {
    if (
      key !== String(NodeState.Dirty) &&
      key !== String(NodeState.Touched) &&
      key !== String(NodeState.ShowError)
    ) {
      result[key] = state[key];
    }
  }
  return result;
};

/**
 * 노드 상태를 표시하는 컴포넌트
 */
const NodeStateDisplay = ({
  label,
  state,
  value,
}: {
  label: string;
  state: NodeStateFlags | null;
  value?: unknown;
}) => {
  if (!state) return null;
  const formattedState = formatNodeState(state);
  const isEmpty = Object.keys(formattedState).length === 0;

  return (
    <div
      style={{
        padding: '8px 12px',
        background: '#f8f9fa',
        borderRadius: '4px',
        marginTop: '8px',
        fontFamily: 'monospace',
        fontSize: '13px',
      }}
    >
      <strong>{label}</strong>
      {value !== undefined && (
        <div style={{ marginTop: '4px', color: '#495057' }}>
          값: <code>{JSON.stringify(value)}</code>
        </div>
      )}
      <div style={{ marginTop: '4px', color: isEmpty ? '#868e96' : '#212529' }}>
        상태:{' '}
        {isEmpty ? (
          <span style={{ fontStyle: 'italic' }}>pristine (초기 상태)</span>
        ) : (
          <code>{JSON.stringify(formattedState)}</code>
        )}
      </div>
    </div>
  );
};

/**
 * 기본적인 pristine 사용 예시
 * - 버튼을 클릭하면 name 필드의 상태(dirty, touched)가 초기화됨
 */
export const BasicPristine = () => {
  const [nameState, setNameState] = useState<NodeStateFlags | null>(null);

  const jsonSchema = {
    type: 'object',
    properties: {
      resetTrigger: {
        type: 'number',
        default: 0,
        computed: {
          visible: 'false',
        },
      },
      name: {
        type: 'string',
        title: '이름',
        computed: {
          // 홀수일 때 pristine 발동 (버튼 클릭 시 0→1→2→3... 증가)
          pristine: '../resetTrigger % 2 === 1',
        },
      },
    },
  } satisfies JSONSchema;

  const [value, setValue] = useState<Record<string, unknown>>();
  const formRef = useRef<FormHandle>(null);

  const handleReset = useCallback(() => {
    const node = formRef.current?.findNode('/resetTrigger');
    if (node) node.value = (node.value as number) + 1;
  }, []);

  const updateNameState = useCallback(() => {
    const node = formRef.current?.findNode('/name');
    if (node) setNameState({ ...node.state });
  }, []);

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div
        style={{ padding: '10px', background: '#e7f3ff', marginBottom: '10px' }}
      >
        <strong>💡 사용법:</strong>
        <br />
        1. 이름 필드에 값을 입력하세요 (dirty 상태가 됨)
        <br />
        2. &quot;상태 초기화&quot; 버튼을 클릭하면 이름 필드의 상태가
        초기화됩니다
        <br />
        <br />
        <code>{'computed: { pristine: "../resetTrigger % 2 === 1" }'}</code>
      </div>
      <Form
        ref={formRef}
        jsonSchema={jsonSchema}
        onChange={(v) => {
          setValue(v);
          updateNameState();
        }}
      />
      <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
        <button onClick={handleReset}>상태 초기화</button>
        <button onClick={updateNameState}>상태 새로고침</button>
      </div>
      <NodeStateDisplay label="name 필드" state={nameState} />
    </StoryLayout>
  );
};

/**
 * &pristine 별칭 문법 사용
 * - computed.pristine과 동일하게 동작
 */
export const AliasSyntax = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      resetTrigger: {
        type: 'boolean',
        title: '상태 초기화',
        default: false,
      },
      name: {
        type: 'string',
        title: '이름',
        '&pristine': '../resetTrigger === true',
      },
    },
  } satisfies JSONSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div
        style={{ padding: '10px', background: '#e7f3ff', marginBottom: '10px' }}
      >
        <strong>💡 별칭 문법:</strong>
        <br />
        <code>{'&pristine'}</code>는 <code>{'computed.pristine'}</code>의 단축
        문법입니다.
        <br />
        <br />
        <code>{"'&pristine': '../resetTrigger === true'"}</code>
      </div>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

/**
 * 여러 조건을 결합한 pristine
 * - 버튼 클릭 + 코드 입력 시 초기화
 */
export const ComplexCondition = () => {
  const [dataState, setDataState] = useState<NodeStateFlags | null>(null);

  const jsonSchema = {
    type: 'object',
    properties: {
      resetTrigger: {
        type: 'number',
        default: 0,
        computed: { visible: 'false' },
      },
      resetCode: {
        type: 'string',
        title: '초기화 코드 (RESET 입력)',
        default: '',
      },
      importantData: {
        type: 'string',
        title: '중요 데이터',
        computed: {
          // 홀수이고 RESET 코드가 입력되었을 때 pristine 발동
          pristine: '../resetTrigger % 2 === 1 && ../resetCode === "RESET"',
        },
      },
    },
  } satisfies JSONSchema;

  const [value, setValue] = useState<Record<string, unknown>>();
  const formRef = useRef<FormHandle>(null);

  const handleReset = useCallback(() => {
    const node = formRef.current?.findNode('/resetTrigger');
    if (node) node.value = (node.value as number) + 1;
  }, []);

  const updateDataState = useCallback(() => {
    const node = formRef.current?.findNode('/importantData');
    if (node) setDataState({ ...node.state });
  }, []);

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div
        style={{ padding: '10px', background: '#fff3cd', marginBottom: '10px' }}
      >
        <strong>⚠️ 복합 조건:</strong>
        <br />
        중요 데이터 필드의 상태를 초기화하려면:
        <br />
        1. 초기화 코드에 &quot;RESET&quot;을 입력하고
        <br />
        2. &quot;상태 초기화&quot; 버튼을 클릭해야 합니다
        <br />
        <br />
        <code>
          {
            'computed: { pristine: \'../resetTrigger % 2 === 1 && ../resetCode === "RESET"\' }'
          }
        </code>
      </div>
      <Form
        ref={formRef}
        jsonSchema={jsonSchema}
        onChange={(v) => {
          setValue(v);
          updateDataState();
        }}
      />
      <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
        <button onClick={handleReset}>상태 초기화</button>
        <button onClick={updateDataState}>상태 새로고침</button>
      </div>
      <NodeStateDisplay label="importantData 필드" state={dataState} />
    </StoryLayout>
  );
};

/**
 * 여러 필드를 동시에 초기화
 * - 하나의 트리거로 여러 필드의 상태를 동시에 초기화
 */
export const MultipleFieldsReset = () => {
  const [fieldStates, setFieldStates] = useState<
    Record<string, NodeStateFlags>
  >({});

  const jsonSchema = {
    type: 'object',
    properties: {
      resetTrigger: {
        type: 'number',
        default: 0,
        computed: { visible: 'false' },
      },
      firstName: {
        type: 'string',
        title: '이름',
        computed: {
          pristine: '../resetTrigger % 2 === 1',
        },
      },
      lastName: {
        type: 'string',
        title: '성',
        computed: {
          pristine: '../resetTrigger % 2 === 1',
        },
      },
      email: {
        type: 'string',
        title: '이메일',
        computed: {
          pristine: '../resetTrigger % 2 === 1',
        },
      },
      age: {
        type: 'number',
        title: '나이',
        computed: {
          pristine: '../resetTrigger % 2 === 1',
        },
      },
    },
  } satisfies JSONSchema;

  const [value, setValue] = useState<Record<string, unknown>>();
  const formRef = useRef<FormHandle>(null);

  const handleReset = useCallback(() => {
    const node = formRef.current?.findNode('/resetTrigger');
    if (node) node.value = (node.value as number) + 1;
  }, []);

  const updateFieldStates = useCallback(() => {
    const paths = ['/firstName', '/lastName', '/email', '/age'];
    const states: Record<string, NodeStateFlags> = {};
    for (const path of paths) {
      const node = formRef.current?.findNode(path);
      if (node) states[path] = { ...node.state };
    }
    setFieldStates(states);
  }, []);

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div
        style={{ padding: '10px', background: '#d4edda', marginBottom: '10px' }}
      >
        <strong>✅ 다중 필드 초기화:</strong>
        <br />
        모든 필드가 동일한 트리거를 참조합니다.
        <br />
        버튼을 클릭하면 모든 필드의 상태가 동시에 초기화됩니다.
      </div>
      <Form
        ref={formRef}
        jsonSchema={jsonSchema}
        onChange={(v) => {
          setValue(v);
          updateFieldStates();
        }}
      />
      <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
        <button onClick={handleReset}>모든 필드 상태 초기화</button>
        <button onClick={updateFieldStates}>상태 새로고침</button>
      </div>
      {Object.entries(fieldStates).map(([path, state]) => (
        <NodeStateDisplay key={path} label={path} state={state} />
      ))}
    </StoryLayout>
  );
};

/**
 * pristine과 다른 computed 속성 조합
 * - visible, readOnly, disabled와 함께 사용
 */
export const CombinedWithOtherComputed = () => {
  const [fieldStates, setFieldStates] = useState<
    Record<string, NodeStateFlags>
  >({});

  const jsonSchema = {
    type: 'object',
    properties: {
      resetTrigger: {
        type: 'number',
        default: 0,
        computed: { visible: 'false' },
      },
      showAdvanced: {
        type: 'boolean',
        title: '고급 옵션 표시',
        default: false,
      },
      isLocked: {
        type: 'boolean',
        title: '잠금 상태',
        default: false,
      },
      advancedSetting: {
        type: 'string',
        title: '고급 설정 (고급 옵션 표시 시만 보임)',
        computed: {
          visible: '../showAdvanced',
          pristine: '../resetTrigger % 2 === 1',
        },
      },
      lockedField: {
        type: 'string',
        title: '잠긴 필드 (잠금 시 읽기 전용)',
        computed: {
          readOnly: '../isLocked',
          pristine: '../resetTrigger % 2 === 1',
        },
      },
    },
  } satisfies JSONSchema;

  const [value, setValue] = useState<Record<string, unknown>>();
  const formRef = useRef<FormHandle>(null);

  const handleReset = useCallback(() => {
    const node = formRef.current?.findNode('/resetTrigger');
    if (node) node.value = (node.value as number) + 1;
  }, []);

  const updateFieldStates = useCallback(() => {
    const paths = ['/advancedSetting', '/lockedField'];
    const states: Record<string, NodeStateFlags> = {};
    for (const path of paths) {
      const node = formRef.current?.findNode(path);
      if (node) states[path] = { ...node.state };
    }
    setFieldStates(states);
  }, []);

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div
        style={{ padding: '10px', background: '#e7f3ff', marginBottom: '10px' }}
      >
        <strong>💡 다른 computed 속성과 조합:</strong>
        <br />- <code>visible</code>: 필드 표시 여부
        <br />- <code>readOnly</code>: 읽기 전용 상태
        <br />- <code>pristine</code>: 상태 초기화
        <br />
        <br />각 속성은 독립적으로 동작합니다.
      </div>
      <Form
        ref={formRef}
        jsonSchema={jsonSchema}
        onChange={(v) => {
          setValue(v);
          updateFieldStates();
        }}
      />
      <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
        <button onClick={handleReset}>상태 초기화</button>
        <button onClick={updateFieldStates}>상태 새로고침</button>
      </div>
      {Object.entries(fieldStates).map(([path, state]) => (
        <NodeStateDisplay key={path} label={path} state={state} />
      ))}
    </StoryLayout>
  );
};

/**
 * pristine과 derived 조합
 * - derived로 자동 계산되는 필드의 상태도 pristine으로 초기화 가능
 */
export const CombinedWithDerived = () => {
  const [totalState, setTotalState] = useState<{
    state: NodeStateFlags | null;
    value: unknown;
  }>({ state: null, value: undefined });

  const jsonSchema = {
    type: 'object',
    properties: {
      resetTrigger: {
        type: 'number',
        default: 0,
        computed: { visible: 'false' },
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
      totalPrice: {
        type: 'number',
        title: '총 가격 (자동 계산)',
        computed: {
          derived: '../price * ../quantity',
          pristine: '../resetTrigger % 2 === 1',
        },
      },
    },
  } satisfies JSONSchema;

  const [value, setValue] = useState<Record<string, unknown>>();
  const formRef = useRef<FormHandle>(null);

  const handleReset = useCallback(() => {
    const node = formRef.current?.findNode('/resetTrigger');
    if (node) node.value = (node.value as number) + 1;
  }, []);

  const updateTotalState = useCallback(() => {
    const node = formRef.current?.findNode('/totalPrice');
    if (node) setTotalState({ state: { ...node.state }, value: node.value });
  }, []);

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div
        style={{ padding: '10px', background: '#e7f3ff', marginBottom: '10px' }}
      >
        <strong>💡 derived + pristine 조합:</strong>
        <br />- <code>derived</code>: 값이 자동으로 계산됨
        <br />- <code>pristine</code>: 상태(dirty, touched)만 초기화됨
        <br />
        <br />
        값은 유지되고 상태만 초기화됩니다.
      </div>
      <Form
        ref={formRef}
        jsonSchema={jsonSchema}
        onChange={(v) => {
          setValue(v);
          updateTotalState();
        }}
      />
      <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
        <button onClick={handleReset}>상태 초기화</button>
        <button onClick={updateTotalState}>상태 새로고침</button>
      </div>
      <NodeStateDisplay
        label="totalPrice 필드"
        state={totalState.state}
        value={totalState.value}
      />
    </StoryLayout>
  );
};

/**
 * 중첩된 객체에서의 pristine
 * - 절대 경로와 상대 경로 모두 사용 가능
 */
export const NestedObject = () => {
  const [fieldStates, setFieldStates] = useState<
    Record<string, NodeStateFlags>
  >({});

  const jsonSchema = {
    type: 'object',
    properties: {
      resetTrigger: {
        type: 'number',
        default: 0,
        computed: { visible: 'false' },
      },
      personal: {
        type: 'object',
        title: '개인 정보',
        properties: {
          localReset: {
            type: 'number',
            default: 0,
            computed: { visible: 'false' },
          },
          name: {
            type: 'string',
            title: '이름 (전체 리셋 참조 - 절대 경로)',
            computed: {
              // 절대 경로로 루트의 resetTrigger 참조
              pristine: '/resetTrigger % 2 === 1',
            },
          },
          email: {
            type: 'string',
            title: '이메일 (로컬 리셋 참조 - 상대 경로)',
            computed: {
              // 상대 경로로 같은 객체 내의 localReset 참조
              pristine: '../localReset % 2 === 1',
            },
          },
        },
      },
    },
  } satisfies JSONSchema;

  const [value, setValue] = useState<Record<string, unknown>>();
  const formRef = useRef<FormHandle>(null);

  const handleGlobalReset = useCallback(() => {
    const node = formRef.current?.findNode('/resetTrigger');
    if (node) node.value = (node.value as number) + 1;
  }, []);

  const handleLocalReset = useCallback(() => {
    const node = formRef.current?.findNode('/personal/localReset');
    if (node) node.value = (node.value as number) + 1;
  }, []);

  const updateFieldStates = useCallback(() => {
    const paths = ['/personal/name', '/personal/email'];
    const states: Record<string, NodeStateFlags> = {};
    for (const path of paths) {
      const node = formRef.current?.findNode(path);
      if (node) states[path] = { ...node.state };
    }
    setFieldStates(states);
  }, []);

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div
        style={{ padding: '10px', background: '#e7f3ff', marginBottom: '10px' }}
      >
        <strong>💡 경로 참조 방식:</strong>
        <br />- <strong>절대 경로</strong> (<code>/resetTrigger</code>):
        루트에서 시작
        <br />- <strong>상대 경로</strong> (<code>../localReset</code>): 현재
        위치에서 상대적으로 참조
        <br />
        <br />
        &quot;전체 초기화&quot; 버튼은 이름 필드에만, &quot;로컬 초기화&quot;
        버튼은 이메일 필드에만 영향을 줍니다.
      </div>
      <Form
        ref={formRef}
        jsonSchema={jsonSchema}
        onChange={(v) => {
          setValue(v);
          updateFieldStates();
        }}
      />
      <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
        <button onClick={handleGlobalReset}>전체 초기화 (이름)</button>
        <button onClick={handleLocalReset}>로컬 초기화 (이메일)</button>
        <button onClick={updateFieldStates}>상태 새로고침</button>
      </div>
      {Object.entries(fieldStates).map(([path, state]) => (
        <NodeStateDisplay key={path} label={path} state={state} />
      ))}
    </StoryLayout>
  );
};

/**
 * 숫자 임계값 기반 pristine
 * - 특정 값에 도달하면 자동으로 상태 초기화
 */
export const ThresholdBasedReset = () => {
  const [passwordState, setPasswordState] = useState<NodeStateFlags | null>(
    null,
  );

  const jsonSchema = {
    type: 'object',
    properties: {
      attempts: {
        type: 'number',
        title: '시도 횟수 (3회 이상이면 초기화)',
        default: 0,
        minimum: 0,
      },
      password: {
        type: 'string',
        title: '비밀번호',
        computed: {
          pristine: '../attempts >= 3',
        },
      },
    },
  } satisfies JSONSchema;

  const [value, setValue] = useState<Record<string, unknown>>();
  const formRef = useRef<FormHandle>(null);

  const updatePasswordState = useCallback(() => {
    const node = formRef.current?.findNode('/password');
    if (node) setPasswordState({ ...node.state });
  }, []);

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div
        style={{ padding: '10px', background: '#fff3cd', marginBottom: '10px' }}
      >
        <strong>⚠️ 임계값 기반 초기화:</strong>
        <br />
        시도 횟수가 3회 이상이 되면 비밀번호 필드의 상태가 자동으로
        초기화됩니다.
        <br />
        <br />
        <code>{'computed: { pristine: "../attempts >= 3" }'}</code>
      </div>
      <Form
        ref={formRef}
        jsonSchema={jsonSchema}
        onChange={(v) => {
          setValue(v);
          updatePasswordState();
        }}
      />
      <div style={{ marginTop: '10px' }}>
        <button onClick={updatePasswordState}>상태 새로고침</button>
      </div>
      <NodeStateDisplay label="password 필드" state={passwordState} />
    </StoryLayout>
  );
};

/**
 * 폼 리셋 시나리오
 * - 실제 사용 사례: 폼 제출 후 상태 초기화
 */
export const FormResetScenario = () => {
  const [fieldStates, setFieldStates] = useState<
    Record<string, NodeStateFlags>
  >({});

  const jsonSchema = {
    type: 'object',
    properties: {
      submitTrigger: {
        type: 'number',
        default: 0,
        computed: { visible: 'false' },
      },
      username: {
        type: 'string',
        title: '사용자 이름',
        computed: {
          pristine: '../submitTrigger % 2 === 1',
        },
      },
      email: {
        type: 'string',
        title: '이메일',
        computed: {
          pristine: '../submitTrigger % 2 === 1',
        },
      },
      message: {
        type: 'string',
        title: '메시지',
        computed: {
          pristine: '../submitTrigger % 2 === 1',
        },
      },
    },
  } satisfies JSONSchema;

  const [value, setValue] = useState<Record<string, unknown>>();
  const formRef = useRef<FormHandle>(null);

  const handleSubmit = useCallback(() => {
    const node = formRef.current?.findNode('/submitTrigger');
    if (node) node.value = (node.value as number) + 1;
  }, []);

  const updateFieldStates = useCallback(() => {
    const paths = ['/username', '/email', '/message'];
    const states: Record<string, NodeStateFlags> = {};
    for (const path of paths) {
      const node = formRef.current?.findNode(path);
      if (node) states[path] = { ...node.state };
    }
    setFieldStates(states);
  }, []);

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div
        style={{ padding: '10px', background: '#d4edda', marginBottom: '10px' }}
      >
        <strong>✅ 폼 제출 시나리오:</strong>
        <br />
        폼을 작성한 후 &quot;제출&quot; 버튼을 클릭하면 모든 필드의 상태가
        초기화됩니다.
        <br />
        이는 폼 제출 후 새로운 입력을 받기 위해 상태를 초기화하는
        시나리오입니다.
        <br />
        <br />
        <strong>참고:</strong> pristine은 값을 변경하지 않고 상태(dirty,
        touched)만 초기화합니다.
      </div>
      <Form
        ref={formRef}
        jsonSchema={jsonSchema}
        onChange={(v) => {
          setValue(v);
          updateFieldStates();
        }}
      />
      <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
        <button onClick={handleSubmit} style={{ fontWeight: 'bold' }}>
          제출
        </button>
        <button onClick={updateFieldStates}>상태 새로고침</button>
      </div>
      {Object.entries(fieldStates).map(([path, state]) => (
        <NodeStateDisplay key={path} label={path} state={state} />
      ))}
    </StoryLayout>
  );
};

/**
 * 조건부 필드 활성화와 pristine 결합
 * - active 상태와 pristine의 조합
 */
export const WithActiveCondition = () => {
  const [configState, setConfigState] = useState<NodeStateFlags | null>(null);

  const jsonSchema = {
    type: 'object',
    properties: {
      resetTrigger: {
        type: 'number',
        default: 0,
        computed: { visible: 'false' },
      },
      enableAdvanced: {
        type: 'boolean',
        title: '고급 모드 활성화',
        default: false,
      },
      advancedConfig: {
        type: 'string',
        title: '고급 설정 (고급 모드에서만 활성화)',
        computed: {
          active: '../enableAdvanced',
          pristine: '../resetTrigger % 2 === 1',
        },
      },
    },
  } satisfies JSONSchema;

  const [value, setValue] = useState<Record<string, unknown>>();
  const formRef = useRef<FormHandle>(null);

  const handleReset = useCallback(() => {
    const node = formRef.current?.findNode('/resetTrigger');
    if (node) node.value = (node.value as number) + 1;
  }, []);

  const updateConfigState = useCallback(() => {
    const node = formRef.current?.findNode('/advancedConfig');
    if (node) setConfigState({ ...node.state });
  }, []);

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div
        style={{ padding: '10px', background: '#e7f3ff', marginBottom: '10px' }}
      >
        <strong>💡 active + pristine 조합:</strong>
        <br />- <code>active</code>가 false이면 필드가 비활성화되고 값이
        제외됩니다
        <br />- <code>pristine</code>은 활성화 상태와 관계없이 상태를
        초기화합니다
        <br />
        <br />두 속성은 독립적으로 동작합니다.
      </div>
      <Form
        ref={formRef}
        jsonSchema={jsonSchema}
        onChange={(v) => {
          setValue(v);
          updateConfigState();
        }}
      />
      <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
        <button onClick={handleReset}>상태 초기화</button>
        <button onClick={updateConfigState}>상태 새로고침</button>
      </div>
      <NodeStateDisplay label="advancedConfig 필드" state={configState} />
    </StoryLayout>
  );
};

/**
 * oneOf와 pristine 조합
 * - 분기 전환 시 특정 조건에서 상태 초기화
 */
export const WithOneOf = () => {
  const [fieldStates, setFieldStates] = useState<
    Record<string, NodeStateFlags>
  >({});

  const jsonSchema: JSONSchema = {
    type: 'object',
    properties: {
      resetTrigger: {
        type: 'number',
        default: 0,
        computed: { visible: 'false' },
      },
      mode: {
        type: 'string',
        title: '모드 선택',
        enum: ['basic', 'advanced'],
        default: 'basic',
      },
      config: {
        type: 'object',
        title: '설정',
        oneOf: [
          {
            type: 'object',
            title: '기본 모드',
            computed: {
              if: '/mode === "basic"',
            },
            properties: {
              basicSetting: {
                type: 'string',
                title: '기본 설정',
                computed: {
                  pristine: '/resetTrigger % 2 === 1',
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
              advancedSetting: {
                type: 'string',
                title: '고급 설정',
                computed: {
                  pristine: '/resetTrigger % 2 === 1',
                },
              },
              extraSetting: {
                type: 'number',
                title: '추가 설정',
                computed: {
                  pristine: '/resetTrigger % 2 === 1',
                },
              },
            },
          },
        ],
      },
    },
  };

  const [value, setValue] = useState<Record<string, unknown>>();
  const formRef = useRef<FormHandle>(null);

  const handleReset = useCallback(() => {
    const node = formRef.current?.findNode('/resetTrigger');
    if (node) node.value = (node.value as number) + 1;
  }, []);

  const updateFieldStates = useCallback(() => {
    const paths = [
      '/config/basicSetting',
      '/config/advancedSetting',
      '/config/extraSetting',
    ];
    const states: Record<string, NodeStateFlags> = {};
    for (const path of paths) {
      const node = formRef.current?.findNode(path);
      if (node) states[path] = { ...node.state };
    }
    setFieldStates(states);
  }, []);

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div
        style={{ padding: '10px', background: '#e7f3ff', marginBottom: '10px' }}
      >
        <strong>💡 oneOf + pristine 조합:</strong>
        <br />
        모드를 전환하고 &quot;상태 초기화&quot; 버튼을 클릭하면
        <br />
        현재 활성화된 분기의 모든 필드 상태가 초기화됩니다.
      </div>
      <Form
        ref={formRef}
        jsonSchema={jsonSchema}
        onChange={(v) => {
          setValue(v);
          updateFieldStates();
        }}
      />
      <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
        <button onClick={handleReset}>상태 초기화</button>
        <button onClick={updateFieldStates}>상태 새로고침</button>
      </div>
      {Object.entries(fieldStates).map(([path, state]) => (
        <NodeStateDisplay key={path} label={path} state={state} />
      ))}
    </StoryLayout>
  );
};

/**
 * pristine 가이드라인
 */
export const PristineGuide = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h2>🔄 pristine 속성 가이드</h2>

      <h3>개요</h3>
      <p>
        <code>computed.pristine</code>은 노드의 상태(dirty, touched 등)를
        초기화하는 표현식입니다. 표현식이 <code>true</code>로 평가되면 해당
        노드의 상태가 초기화됩니다.
      </p>

      <h3>문법</h3>
      <pre
        style={{
          background: '#f5f5f5',
          padding: '10px',
          borderRadius: '4px',
          overflow: 'auto',
        }}
      >
        {`// computed 객체 사용
{
  type: 'string',
  computed: {
    pristine: '../resetTrigger === true'
  }
}

// 별칭 문법 사용
{
  type: 'string',
  '&pristine': '../resetTrigger === true'
}`}
      </pre>

      <h3>동작 원리</h3>
      <ul>
        <li>
          <code>UpdateComputedProperties</code> 이벤트가 발생할 때마다 표현식이
          평가됩니다
        </li>
        <li>
          표현식이 <code>true</code>를 반환하면 <code>setState()</code>가
          호출되어 상태가 초기화됩니다
        </li>
        <li>
          상태에는 <code>dirty</code>, <code>touched</code>,{' '}
          <code>showError</code> 등이 포함됩니다
        </li>
        <li>
          <strong>값(value)은 변경되지 않습니다</strong> - 오직 상태만
          초기화됩니다
        </li>
      </ul>

      <h3>사용 사례</h3>
      <ul>
        <li>
          <strong>폼 제출 후 상태 초기화:</strong> 제출 완료 후 dirty/touched
          상태를 초기화하여 새로운 입력 준비
        </li>
        <li>
          <strong>특정 조건에서 상태 리셋:</strong> 사용자 액션에 따라 필드
          상태를 초기화
        </li>
        <li>
          <strong>다중 필드 동시 초기화:</strong> 하나의 트리거로 여러 필드의
          상태를 동시에 초기화
        </li>
      </ul>

      <h3>다른 computed 속성과의 관계</h3>
      <table
        style={{
          borderCollapse: 'collapse',
          width: '100%',
          marginTop: '10px',
        }}
      >
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>속성</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>영향</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>
              pristine과의 관계
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
              <code>visible</code>
            </td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
              UI 표시 여부
            </td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
              독립적으로 동작
            </td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
              <code>active</code>
            </td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
              값 포함 여부
            </td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
              독립적으로 동작
            </td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
              <code>readOnly</code>
            </td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
              읽기 전용 상태
            </td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
              독립적으로 동작
            </td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
              <code>derived</code>
            </td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
              자동 값 계산
            </td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
              값은 유지, 상태만 초기화
            </td>
          </tr>
        </tbody>
      </table>

      <h3>주의사항</h3>
      <ul>
        <li>
          pristine 표현식이 <code>true</code>인 동안 계속해서 상태가
          초기화됩니다.
          <br />
          필요한 경우 토글 방식(true → false)을 사용하세요.
        </li>
        <li>
          <code>dirty</code> 상태로 만들기 위해{' '}
          <code>
            node.setState({'{'}dirty: true{'}'})
          </code>
          를 사용할 수 있습니다.
        </li>
        <li>
          pristine은 폼 값을 변경하지 않습니다. 값도 함께 초기화하려면{' '}
          <code>formRef.current.reset()</code>을 사용하세요.
        </li>
      </ul>
    </div>
  );
};
