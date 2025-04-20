// import GenieFormCore from '@react-genie-form/core';
import { Form } from '@react-genie-form/next';
import { JSDOM } from 'jsdom';
import { createRoot } from 'react-dom/client';

import { sampleSchemas } from '../fixtures/schemas';

// JSDOM 환경 설정
const dom = new JSDOM('<!DOCTYPE html><div id="root"></div>');
(global as any).document = dom.window.document;
(global as any).window = dom.window;
(global as any).navigator = dom.window.navigator;
(global as any).Element = dom.window.Element;
(global as any).HTMLElement = dom.window.HTMLElement;

export async function runGenieFormRenderingBenchmark() {
  // 테스트용 DOM 요소 생성
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  try {
    // 다양한 크기의 스키마로 테스트
    for (const schema of sampleSchemas) {
      // JSX 문법으로 Form 컴포넌트 렌더링
      root.render(
        <Form schema={schema} onChange={() => {}} onValidate={() => {}} />,
      );
      // 렌더링이 완료될 때까지 대기
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  } finally {
    // 정리
    root.unmount();
    container.remove();
  }
}
