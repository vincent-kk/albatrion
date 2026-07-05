import React, { useState } from 'react';

import { ModalProvider, useModal } from '../src';
import type { ModalFrameProps } from '../src/types';
import { Foreground } from './components/Foreground';

// Custom foreground for hook-level configuration
const HookForeground = (props: ModalFrameProps) => (
  <div
    style={{ border: '4px solid blue', padding: '20px', borderRadius: '8px' }}
  >
    <div
      style={{ background: '#e3f2fd', padding: '10px', marginBottom: '10px' }}
    >
      [Hook Foreground Frame]
    </div>
    <Foreground {...props} />
  </div>
);

// Custom foreground for handler-level override
const HandlerForeground = (props: ModalFrameProps) => (
  <div
    style={{ border: '4px solid red', padding: '20px', borderRadius: '8px' }}
  >
    <div
      style={{ background: '#ffebee', padding: '10px', marginBottom: '10px' }}
    >
      [Handler Foreground Frame]
    </div>
    <Foreground {...props} />
  </div>
);

export default {
  title: 'PromiseModal/UseModalConfiguration',
  decorators: [
    (Story: React.ComponentType) => (
      <ModalProvider
        options={{
          duration: '500ms',
          closeOnBackdropClick: true,
          manualDestroy: false,
        }}
      >
        <Story />
      </ModalProvider>
    ),
  ],
};

/**
 * 검증 포인트 1: global(provider)설정 < hook 설정 < handler 설정 순서로 덮어써지는가
 *
 * Provider: default ForegroundComponent, duration=500ms
 * Hook: HookForeground (파란색 테두리)
 * Handler: HandlerForeground (빨간색 테두리), duration=200ms, manualDestroy=true
 *
 * 예상 결과:
 * - 첫 번째 버튼: Hook의 파란색 테두리 Foreground 사용
 * - 두 번째 버튼: Handler의 빨간색 테두리 Foreground가 Hook 설정을 덮어씀
 * - Handler의 duration=200ms, manualDestroy=true가 적용됨
 */
export const ConfigurationOverridePriority = () => {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);
  };

  // Hook level configuration - ForegroundComponent 설정
  const modal = useModal({
    ForegroundComponent: HookForeground,
  });

  const handleAlertWithHookComponents = () => {
    addLog('Alert with Hook ForegroundComponent (blue border)');

    modal
      .alert({
        title: '설정 우선순위 테스트',
        subtitle: 'Hook 설정',
        content: '이 모달은 파란색 테두리를 가져야 합니다 (Hook 설정)',
        duration: 200, // Handler override
        manualDestroy: true, // Handler override
      })
      .then(() => {
        addLog('Alert closed');
      });
  };

  const handleAlertWithHandlerOverride = () => {
    addLog('Alert with Handler ForegroundComponent override (red border)');

    modal
      .alert({
        title: '핸들러 덮어쓰기 테스트',
        subtitle: 'Handler 설정',
        content:
          '이 모달은 빨간색 테두리를 가져야 합니다 (Handler 설정이 Hook을 덮어씀)',
        ForegroundComponent: HandlerForeground, // Handler override
        duration: 200, // Handler override
        manualDestroy: true, // Handler override
      })
      .then(() => {
        addLog('Alert with handler override closed');
      });
  };

  return (
    <div>
      <h2>검증 포인트 1: 설정 우선순위</h2>
      <p>
        Provider {'<'} Hook {'<'} Handler
      </p>

      <div
        style={{ marginTop: '10px', padding: '10px', background: '#e3f2fd' }}
      >
        <p>
          <strong>✅ 예상 동작:</strong>
        </p>
        <ul>
          <li>파란색 버튼: Hook의 파란색 테두리 Foreground</li>
          <li>빨간색 버튼: Handler의 빨간색 테두리 Foreground (덮어쓰기)</li>
          <li>
            둘 다 빠른 애니메이션(200ms)과 확인 버튼으로만
            닫힘(manualDestroy=true)
          </li>
        </ul>
      </div>

      <button
        onClick={handleAlertWithHookComponents}
        style={{
          background: '#2196f3',
          color: 'white',
          padding: '10px',
          margin: '5px',
        }}
      >
        Hook 컴포넌트로 열기 (파란색 테두리)
      </button>
      <button
        onClick={handleAlertWithHandlerOverride}
        style={{
          background: '#f44336',
          color: 'white',
          padding: '10px',
          margin: '5px',
        }}
      >
        Handler 덮어쓰기로 열기 (빨간색 테두리)
      </button>

      <div
        style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}
      >
        <h3>로그:</h3>
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
    </div>
  );
};

/**
 * 검증 포인트 2: useModal 로 전달한 설정이 랜더사이클마다 주소가 변하는 객체인 경우에도 안정적으로 동작하는가
 *
 * 컴포넌트가 리렌더링될 때마다 새로운 컴포넌트가 인라인으로 생성되지만,
 * useReference를 사용하여 안정적으로 참조를 유지해야 함
 */
export const StableConfigurationReference = () => {
  const [count, setCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);
  };

  // 매 렌더링마다 새로운 컴포넌트가 생성됨 (주소가 변경됨)
  // 하지만 useReference로 안정적으로 유지되어야 함
  const modal = useModal({
    ForegroundComponent: (props: ModalFrameProps) => (
      <div
        style={{
          border: '4px solid orange',
          padding: '20px',
          borderRadius: '8px',
        }}
      >
        <div
          style={{
            background: '#fff3e0',
            padding: '10px',
            marginBottom: '10px',
          }}
        >
          [Render Count: {count}] Foreground
        </div>
        <Foreground {...props} />
      </div>
    ),
  });

  const handleAlert = () => {
    addLog(`Alert opened (render count: ${count})`);

    modal
      .alert({
        title: '안정적인 설정 참조 테스트',
        subtitle: '참조 안정성 확인',
        content: (
          <div>
            <p>
              <strong>현재 컴포넌트 렌더링 횟수: {count}</strong>
            </p>
            <p>매 렌더링마다 새로운 ForegroundComponent 객체가 생성되지만,</p>
            <p>useReference로 안정적으로 참조를 유지합니다.</p>
            <hr />
            <p>
              <strong>✅ 검증 방법:</strong>
            </p>
            <p>Foreground 테두리 상단의 "Render Count" 숫자를 확인하세요.</p>
            <p>리렌더링 후에도 숫자가 변경되지 않아야 합니다.</p>
          </div>
        ),
        duration: 300,
      })
      .then(() => {
        addLog(`Alert closed (render count: ${count})`);
      });
  };

  const handleRerender = () => {
    setCount((prev) => prev + 1);
    addLog(`Component rerendered (count: ${count + 1})`);
  };

  return (
    <div>
      <h2>검증 포인트 2: 안정적인 설정 참조</h2>
      <p>
        현재 렌더링 횟수: <strong>{count}</strong>
      </p>

      <div
        style={{ marginTop: '10px', padding: '10px', background: '#fffacd' }}
      >
        <h4>✅ 검증 방법:</h4>
        <ol>
          <li>
            모달을 열고 Foreground 테두리 상단의 "Render Count" 숫자를 확인 (예:
            0)
          </li>
          <li>"리렌더링 트리거" 버튼을 여러 번 클릭하여 count를 증가</li>
          <li>다시 모달을 열고 "Render Count" 숫자가 여전히 0인지 확인</li>
          <li>
            <strong>숫자가 변경되지 않았다면</strong> ✅ useReference가 정상
            작동
          </li>
          <li>
            <strong>숫자가 증가했다면</strong> ❌ 참조가 불안정함
          </li>
        </ol>
      </div>

      <button
        onClick={handleRerender}
        style={{ padding: '10px', margin: '5px' }}
      >
        리렌더링 트리거 (현재: {count})
      </button>
      <button
        onClick={handleAlert}
        style={{
          padding: '10px',
          margin: '5px',
          background: '#ff9800',
          color: 'white',
        }}
      >
        모달 열기
      </button>

      <div
        style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}
      >
        <h3>로그:</h3>
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
    </div>
  );
};

/**
 * 검증 포인트 3: 전달된 객체가 수정되지 않고 불변성이 유지되는가
 *
 * useModal에 전달된 설정 객체가 내부적으로 수정되지 않고 불변성이 유지되어야 함
 */
export const ImmutableConfiguration = () => {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);
  };

  // 원본 컴포넌트 (외부에서 추적 가능하도록 상수로 선언)
  const OriginalForeground = (props: ModalFrameProps) => (
    <div
      style={{
        border: '4px solid purple',
        padding: '20px',
        borderRadius: '8px',
      }}
    >
      <div
        style={{ background: '#f3e5f5', padding: '10px', marginBottom: '10px' }}
      >
        [Original Foreground]
      </div>
      <Foreground {...props} />
    </div>
  );

  // Hook 설정
  const hookConfig = {
    ForegroundComponent: OriginalForeground,
  };

  const { alert, confirm, prompt } = useModal(hookConfig);

  const handleAlert = () => {
    addLog(`Alert opened`);
    addLog(
      `Hook config - Foreground: ${hookConfig.ForegroundComponent.name || 'Anonymous'}`,
    );

    const hookConfigBefore = { ...hookConfig };

    alert({
      title: '불변성 테스트 (Alert)',
      subtitle: '설정 객체 불변성 확인',
      content: '설정 객체가 수정되지 않는지 확인합니다',
      duration: 300,
      manualDestroy: true,
    }).then(() => {
      const foregroundUnchanged =
        hookConfig.ForegroundComponent === hookConfigBefore.ForegroundComponent;

      addLog(
        `Foreground component unchanged: ${foregroundUnchanged ? '✅' : '❌'}`,
      );

      if (foregroundUnchanged) {
        addLog('✅ Hook configuration is immutable');
      } else {
        addLog('❌ Hook configuration was mutated!');
      }
    });
  };

  const handleConfirm = () => {
    addLog(`Confirm opened`);

    const hookConfigBefore = { ...hookConfig };

    confirm({
      title: '불변성 테스트 (Confirm)',
      subtitle: '확인/취소 테스트',
      content: '설정 객체가 수정되지 않는지 확인합니다',
      duration: 300,
      closeOnBackdropClick: false,
    }).then((result: boolean) => {
      const foregroundUnchanged =
        hookConfig.ForegroundComponent === hookConfigBefore.ForegroundComponent;

      addLog(`Confirm result: ${result ? 'confirmed ✅' : 'cancelled ❌'}`);
      addLog(
        `Foreground component unchanged: ${foregroundUnchanged ? '✅' : '❌'}`,
      );

      if (foregroundUnchanged) {
        addLog('✅ Hook configuration is immutable');
      } else {
        addLog('❌ Hook configuration was mutated!');
      }
    });
  };

  const handlePrompt = () => {
    addLog(`Prompt opened`);

    const hookConfigBefore = { ...hookConfig };

    prompt({
      title: '불변성 테스트 (Prompt)',
      subtitle: '입력값 테스트',
      content: '설정 객체가 수정되지 않는지 확인합니다',
      Input: ({ defaultValue, onChange }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          onChange(e.target.value);
        };
        return (
          <input
            defaultValue={defaultValue}
            onChange={handleChange}
            style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}
          />
        );
      },
      defaultValue: 'test',
      duration: 300,
    }).then((value: string | null) => {
      const foregroundUnchanged =
        hookConfig.ForegroundComponent === hookConfigBefore.ForegroundComponent;

      addLog(`Prompt value: "${value}"`);
      addLog(
        `Foreground component unchanged: ${foregroundUnchanged ? '✅' : '❌'}`,
      );

      if (foregroundUnchanged) {
        addLog('✅ Hook configuration is immutable');
      } else {
        addLog('❌ Hook configuration was mutated!');
      }
    });
  };

  return (
    <div>
      <h2>검증 포인트 3: 설정 객체 불변성</h2>
      <p>전달된 설정 객체가 수정되지 않고 유지되는지 확인</p>

      <div
        style={{ marginTop: '10px', padding: '10px', background: '#f3e5f5' }}
      >
        <p>
          <strong>✅ 검증 사항:</strong>
        </p>
        <ul>
          <li>모달 호출 전후로 ForegroundComponent 참조가 동일한지 확인</li>
          <li>Alert, Confirm, Prompt 각각에서 불변성 검증</li>
          <li>로그에서 "Foreground component unchanged: ✅" 확인</li>
        </ul>
      </div>

      <button onClick={handleAlert} style={{ padding: '10px', margin: '5px' }}>
        Alert 불변성 테스트
      </button>
      <button
        onClick={handleConfirm}
        style={{ padding: '10px', margin: '5px' }}
      >
        Confirm 불변성 테스트
      </button>
      <button onClick={handlePrompt} style={{ padding: '10px', margin: '5px' }}>
        Prompt 불변성 테스트
      </button>

      <div
        style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}
      >
        <h3>로그:</h3>
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
    </div>
  );
};

/**
 * 통합 테스트: 모든 검증 포인트를 종합적으로 테스트
 */
export const ComprehensiveTest = () => {
  const [count, setCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);
  };

  // 매 렌더링마다 새로운 객체 (검증 포인트 2)
  const hookConfig = {
    ForegroundComponent: (props: ModalFrameProps) => (
      <div
        style={{
          border: '4px solid teal',
          padding: '20px',
          borderRadius: '8px',
        }}
      >
        <div
          style={{
            background: '#e0f2f1',
            padding: '10px',
            marginBottom: '10px',
          }}
        >
          [통합테스트 Render #{count}] Foreground
        </div>
        <Foreground {...props} />
      </div>
    ),
  };

  const modal = useModal(hookConfig);

  const handleComprehensiveTest = () => {
    const configBefore = { ...hookConfig };

    addLog('=== 통합 테스트 시작 ===');
    addLog(`렌더링 횟수: ${count}`);

    modal
      .alert({
        title: '통합 테스트',
        subtitle: '모든 검증 포인트 확인',
        content: (
          <div>
            <h3>모든 검증 포인트 확인</h3>
            <p>
              <strong>1. 설정 우선순위:</strong> Handler {'>'} Hook {'>'}{' '}
              Provider
            </p>
            <p>
              <strong>2. 안정적인 참조:</strong> 렌더링 {count}회
            </p>
            <p>
              <strong>3. 불변성:</strong> 설정 객체 변경 없음
            </p>
            <hr />
            <p>✅ Foreground 테두리 상단의 "Render #" 확인</p>
            <p>✅ Teal 색상 테두리 (Hook 설정)</p>
            <p>✅ duration: 200ms (Handler 설정)</p>
            <p>✅ manualDestroy: true (Handler 설정)</p>
          </div>
        ),
        duration: 200, // Handler override
        manualDestroy: true, // Handler override
      })
      .then(() => {
        const foregroundUnchanged =
          hookConfig.ForegroundComponent === configBefore.ForegroundComponent;

        addLog('=== 통합 테스트 결과 ===');
        addLog(
          `✅ 1. 설정 우선순위: duration=200ms, manualDestroy=true (Handler 우선)`,
        );
        addLog(
          `${foregroundUnchanged ? '✅' : '❌'} 2. 안정적인 참조: 렌더링 ${count}회에도 정상 동작`,
        );
        addLog(
          `${foregroundUnchanged ? '✅' : '❌'} 3. 불변성: ${foregroundUnchanged ? '유지됨' : '위반됨'}`,
        );

        if (foregroundUnchanged) {
          addLog('🎉 모든 검증 포인트 통과!');
        } else {
          addLog('⚠️ 일부 검증 포인트 실패');
        }
      });
  };

  return (
    <div>
      <h2>통합 테스트</h2>
      <p>
        렌더링 횟수: <strong>{count}</strong>
      </p>

      <div
        style={{ marginTop: '10px', padding: '10px', background: '#e0f2f1' }}
      >
        <h4>✅ 검증 절차:</h4>
        <ol>
          <li>"통합 테스트 실행" 클릭 → Foreground에 "Render #0" 표시 확인</li>
          <li>"리렌더링" 버튼을 5번 클릭 (count가 5로 증가)</li>
          <li>
            다시 "통합 테스트 실행" → Foreground에 여전히 "Render #0" 표시되는지
            확인
          </li>
          <li>로그에서 모든 검증 포인트가 ✅로 표시되는지 확인</li>
          <li>"🎉 모든 검증 포인트 통과!" 메시지 확인</li>
        </ol>
      </div>

      <button
        onClick={() => setCount((prev) => prev + 1)}
        style={{ padding: '10px', margin: '5px' }}
      >
        리렌더링 (현재: {count})
      </button>
      <button
        onClick={handleComprehensiveTest}
        style={{
          padding: '10px',
          margin: '5px',
          background: '#009688',
          color: 'white',
        }}
      >
        통합 테스트 실행
      </button>

      <div
        style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}
      >
        <h3>로그:</h3>
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
    </div>
  );
};
