#!/usr/bin/env tsx

/**
 * Test Generator Tool
 *
 * 타겟 파일을 분석하여 자동으로 테스트 코드를 생성합니다.
 *
 * Usage:
 *   tsx test_generator.ts <source-file> [test-type]
 *
 * Examples:
 *   tsx test_generator.ts src/utils/pricing.ts unit
 *   tsx test_generator.ts src/components/Button.tsx component
 *   tsx test_generator.ts src/hooks/useUser.ts integration
 */

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

interface FunctionSignature {
  name: string;
  parameters: Array<{ name: string; type: string }>;
  returnType: string;
  isAsync: boolean;
}

interface ComponentProps {
  name: string;
  props: Array<{ name: string; type: string; optional: boolean }>;
}

type TestType = 'unit' | 'component' | 'integration' | 'e2e';

/**
 * TypeScript 소스 파일을 파싱하여 함수 시그니처 추출
 */
function extractFunctions(sourceFile: ts.SourceFile): FunctionSignature[] {
  const functions: FunctionSignature[] = [];

  function visit(node: ts.Node) {
    if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node)) {
      const name = node.name?.getText(sourceFile) || 'anonymous';
      const parameters = node.parameters.map((param) => ({
        name: param.name.getText(sourceFile),
        type: param.type?.getText(sourceFile) || 'any',
      }));
      const returnType = node.type?.getText(sourceFile) || 'any';
      const isAsync = node.modifiers?.some(
        (mod) => mod.kind === ts.SyntaxKind.AsyncKeyword
      ) ?? false;

      functions.push({ name, parameters, returnType, isAsync });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return functions;
}

/**
 * React 컴포넌트 Props 추출
 */
function extractComponentProps(sourceFile: ts.SourceFile): ComponentProps | null {
  let componentName: string | null = null;
  let propsInterface: ComponentProps | null = null;

  function visit(node: ts.Node) {
    // 컴포넌트 이름 추출 (함수형 컴포넌트)
    if (ts.isFunctionDeclaration(node) || ts.isVariableDeclaration(node)) {
      const name = node.name?.getText(sourceFile);
      if (name && /^[A-Z]/.test(name)) {
        componentName = name;
      }
    }

    // Props 인터페이스 추출
    if (ts.isInterfaceDeclaration(node)) {
      const interfaceName = node.name.getText(sourceFile);
      if (interfaceName.endsWith('Props')) {
        const props = node.members.map((member) => {
          if (ts.isPropertySignature(member)) {
            const name = member.name?.getText(sourceFile) || 'unknown';
            const type = member.type?.getText(sourceFile) || 'any';
            const optional = member.questionToken !== undefined;
            return { name, type, optional };
          }
          return { name: 'unknown', type: 'any', optional: false };
        });

        propsInterface = {
          name: componentName || interfaceName.replace(/Props$/, ''),
          props,
        };
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return propsInterface;
}

/**
 * Unit Test 코드 생성
 */
function generateUnitTests(functions: FunctionSignature[], sourceFilePath: string): string {
  const moduleName = path.basename(sourceFilePath, path.extname(sourceFilePath));
  const importPath = sourceFilePath.replace(/\.tsx?$/, '');

  const testCases = functions.map((func) => {
    const testName = `describe('${func.name}', () => {`;
    const normalCase = `  it('should ${func.name} correctly', ${func.isAsync ? 'async ' : ''}() => {
    // Arrange
    ${func.parameters.map((p) => `const ${p.name} = /* TODO: 테스트 데이터 입력 */;`).join('\n    ')}

    // Act
    const result = ${func.isAsync ? 'await ' : ''}${func.name}(${func.parameters.map((p) => p.name).join(', ')});

    // Assert
    expect(result).toBe(/* TODO: 예상 결과 입력 */);
  });`;

    const edgeCase = `  it('should handle edge case: empty input', ${func.isAsync ? 'async ' : ''}() => {
    // Arrange
    const emptyInput = /* TODO: 빈 값 또는 특수 케이스 */;

    // Act & Assert
    expect(() => ${func.isAsync ? 'await ' : ''}${func.name}(emptyInput)).toThrow();
  });`;

    return `${testName}\n${normalCase}\n\n${edgeCase}\n});`;
  }).join('\n\n');

  return `import { describe, it, expect } from 'vitest';
import { ${functions.map((f) => f.name).join(', ')} } from '${importPath}';

${testCases}
`;
}

/**
 * Component Test 코드 생성
 */
function generateComponentTests(component: ComponentProps, sourceFilePath: string): string {
  const importPath = sourceFilePath.replace(/\.tsx?$/, '');

  const renderTest = `  it('should render correctly', () => {
    render(<${component.name} />);
    expect(screen.getByRole('${component.name.toLowerCase()}')).toBeInTheDocument();
  });`;

  const propsTests = component.props
    .filter((p) => !p.optional)
    .map((prop) => {
      return `  it('should render with ${prop.name} prop', () => {
    const ${prop.name} = /* TODO: 테스트 데이터 입력 */;
    render(<${component.name} ${prop.name}={${prop.name}} />);
    expect(/* TODO: 검증 로직 추가 */);
  });`;
    })
    .join('\n\n');

  const eventTest = `  it('should handle user interaction', () => {
    const handleClick = vi.fn();
    render(<${component.name} onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });`;

  return `import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ${component.name} } from '${importPath}';

describe('${component.name}', () => {
${renderTest}

${propsTests}

${eventTest}
});
`;
}

/**
 * Integration Test 코드 생성
 */
function generateIntegrationTests(functions: FunctionSignature[], sourceFilePath: string): string {
  const moduleName = path.basename(sourceFilePath, path.extname(sourceFilePath));
  const importPath = sourceFilePath.replace(/\.tsx?$/, '');

  return `import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ${functions.map((f) => f.name).join(', ')} } from '${importPath}';

describe('${moduleName} integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
  });

  it('should integrate with external services', async () => {
    // TODO: 통합 테스트 로직 구현
    // 1. Mock API 설정
    // 2. Provider 래핑
    // 3. 비동기 작업 대기
    // 4. 결과 검증
  });
});
`;
}

/**
 * 메인 실행 함수
 */
async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: tsx test_generator.ts <source-file> [test-type]');
    process.exit(1);
  }

  const sourceFilePath = args[0];
  const testType = (args[1] || 'unit') as TestType;

  if (!fs.existsSync(sourceFilePath)) {
    console.error(`Error: File not found: ${sourceFilePath}`);
    process.exit(1);
  }

  const sourceCode = fs.readFileSync(sourceFilePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    sourceFilePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  let testCode = '';

  switch (testType) {
    case 'unit': {
      const functions = extractFunctions(sourceFile);
      if (functions.length === 0) {
        console.error('No functions found in source file');
        process.exit(1);
      }
      testCode = generateUnitTests(functions, sourceFilePath);
      break;
    }

    case 'component': {
      const component = extractComponentProps(sourceFile);
      if (!component) {
        console.error('No React component found in source file');
        process.exit(1);
      }
      testCode = generateComponentTests(component, sourceFilePath);
      break;
    }

    case 'integration': {
      const functions = extractFunctions(sourceFile);
      testCode = generateIntegrationTests(functions, sourceFilePath);
      break;
    }

    default:
      console.error(`Unsupported test type: ${testType}`);
      process.exit(1);
  }

  // 테스트 파일 경로 생성
  const dir = path.dirname(sourceFilePath);
  const baseName = path.basename(sourceFilePath, path.extname(sourceFilePath));
  const testDir = path.join(dir, '__tests__');
  const testFilePath = path.join(testDir, `${baseName}.test.ts${sourceFilePath.endsWith('.tsx') ? 'x' : ''}`);

  // __tests__ 디렉토리 생성
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  // 테스트 파일 저장
  fs.writeFileSync(testFilePath, testCode, 'utf-8');

  console.log(`✅ Generated ${testType} test: ${testFilePath}`);
  console.log(`\n📝 Test code preview:\n`);
  console.log(testCode);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
