import { Form as GenieForm } from '@react-genie-form/next';
import { JSDOM } from 'jsdom';
import { createRoot } from 'react-dom/client';

import { sampleSchemas } from '../../fixtures/schemas';

// JSDOM 환경 설정
const dom = new JSDOM('<!DOCTYPE html><div id="root"></div>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable',
});
(global as any).document = dom.window.document;
(global as any).window = dom.window;
(global as any).navigator = dom.window.navigator;
(global as any).Element = dom.window.Element;
(global as any).HTMLElement = dom.window.HTMLElement;
(global as any).HTMLInputElement = dom.window.HTMLInputElement;
(global as any).HTMLFormElement = dom.window.HTMLFormElement;
(global as any).Event = dom.window.Event;
(global as any).MouseEvent = dom.window.MouseEvent;
(global as any).KeyboardEvent = dom.window.KeyboardEvent;

export async function runGenieInteractionBenchmark() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  try {
    let changeCount = 0;
    const schema = sampleSchemas[1]; // 중간 복잡도 스키마

    // 폼 렌더링
    root.render(
      <GenieForm
        schema={schema}
        onValidate={() => {}}
        onChange={() => {
          changeCount++;
        }}
      />,
    );

    // 렌더링 완료 대기
    await new Promise((resolve) => setTimeout(resolve, 100));

    // 사용자 입력 시뮬레이션
    const inputs = container.querySelectorAll('input');
    const startTime = performance.now();

    // 순차적으로 모든 입력 필드에 값 변경
    for (let i = 0; i < Math.min(inputs.length, 10); i++) {
      const input = inputs[i] as HTMLInputElement;
      input.value = `test-value-${i}`;
      input.dispatchEvent(new dom.window.Event('change', { bubbles: true }));

      // microtask가 처리될 시간 대기
      await new Promise((resolve) => setTimeout(resolve));
    }

    const endTime = performance.now();
    const avgInteractionTime =
      (endTime - startTime) / Math.min(inputs.length, 10);

    return {
      totalTime: endTime - startTime,
      avgInteractionTime,
      changeCount,
      inputCount: Math.min(inputs.length, 10),
    };
  } finally {
    root.unmount();
    container.remove();
  }
}
