import { JSDOM } from 'jsdom';
import { createRoot } from 'react-dom/client';

import type { Form as SchemaForm } from '@canard/schema-form';

import { sampleSchemas } from '../../fixtures/schemas';

// JSDOM 환경 설정
const dom = new JSDOM('<!DOCTYPE html><div id="root"></div>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable'
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

// Node.js 메모리 사용량 측정 헬퍼
function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    rss: usage.rss / 1024 / 1024, // MB
    heapUsed: usage.heapUsed / 1024 / 1024, // MB
    heapTotal: usage.heapTotal / 1024 / 1024, // MB
    external: usage.external / 1024 / 1024 // MB
  };
}

export async function runMemoryBenchmark(SchemaFormModule: {
  Form: typeof SchemaForm;
}) {
  const { Form } = SchemaFormModule;

  // 가비지 컬렉션 강제 실행 (가능한 경우)
  if (global.gc) {
    global.gc();
  }

  const initialMemory = getMemoryUsage();
  const containers: HTMLElement[] = [];
  const roots: any[] = [];
  let peakMemory = initialMemory;

  try {
    // 여러 폼 인스턴스 생성하여 메모리 사용량 측정
    for (let i = 0; i < 10; i++) {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);
      
      containers.push(container);
      roots.push(root);

      root.render(
        <Form 
          jsonSchema={sampleSchemas[2]} // 복잡한 스키마 사용
          onValidate={() => {}} 
          onChange={() => {}} 
        />
      );

      // 렌더링 완료 대기
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    peakMemory = getMemoryUsage();

  } finally {
    // 정리
    for (let i = 0; i < roots.length; i++) {
      roots[i].unmount();
      containers[i].remove();
    }

    // 정리 후 메모리 측정을 위한 대기
    if (global.gc) {
      global.gc();
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const finalMemory = getMemoryUsage();

  // 메모리 사용량 차이 계산
  const memoryDiff = {
    rss: peakMemory.rss - initialMemory.rss,
    heapUsed: peakMemory.heapUsed - initialMemory.heapUsed,
    heapTotal: peakMemory.heapTotal - initialMemory.heapTotal,
    external: peakMemory.external - initialMemory.external
  };

  return {
    initialMemory,
    peakMemory,
    finalMemory,
    memoryDiff,
    instanceCount: 10,
    memoryPerInstance: {
      rss: memoryDiff.rss / 10,
      heapUsed: memoryDiff.heapUsed / 10,
      heapTotal: memoryDiff.heapTotal / 10,
      external: memoryDiff.external / 10
    },
    memoryLeakCheck: {
      potentialLeak: finalMemory.heapUsed > (initialMemory.heapUsed + 5), // 5MB 이상 차이
      difference: finalMemory.heapUsed - initialMemory.heapUsed
    }
  };
}
