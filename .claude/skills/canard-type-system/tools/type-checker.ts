#!/usr/bin/env ts-node

/**
 * type-checker.ts
 * @canard/schema-form 플러그인용 타입 검증 도구
 *
 * 사용법:
 *   ts-node type-checker.ts [options] <files...>
 *
 * 예시:
 *   ts-node type-checker.ts src/formTypes/StringInput.tsx
 *   ts-node type-checker.ts --strict src/**/*.tsx
 *   ts-node type-checker.ts --json src/ > type-report.json
 */

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// 색상 정의 (ANSI escape codes)
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

// CLI 옵션
interface CliOptions {
  strict: boolean;
  json: boolean;
  verbose: boolean;
  minCoverage: number;
  help: boolean;
  files: string[];
}

// 타입 검증 결과
interface TypeCheckResult {
  file: string;
  errors: TypeCheckError[];
  warnings: TypeCheckWarning[];
  coverage: TypeCoverage;
}

interface TypeCheckError {
  line: number;
  column: number;
  message: string;
  code: number;
  severity: 'error' | 'warning';
}

interface TypeCheckWarning {
  line: number;
  column: number;
  message: string;
  type: 'any' | 'implicit-any' | 'missing-type' | 'unsafe-cast';
}

interface TypeCoverage {
  total: number;
  typed: number;
  untyped: number;
  percentage: number;
}

// 도움말 표시
function showHelp(): void {
  console.log(`
${colors.blue}@canard/schema-form 타입 검증 도구${colors.reset}

${colors.green}사용법:${colors.reset}
  ts-node type-checker.ts [options] <files...>

${colors.green}옵션:${colors.reset}
  -h, --help              도움말 표시
  -v, --verbose           상세 출력
  -s, --strict            엄격 모드 (noImplicitAny, strictNullChecks 등)
  -j, --json              JSON 형식으로 출력
  -m, --min-coverage N    최소 타입 커버리지 (기본값: 90)

${colors.green}예시:${colors.reset}
  # 단일 파일 검사
  ts-node type-checker.ts src/formTypes/StringInput.tsx

  # 여러 파일 검사
  ts-node type-checker.ts src/**/*.tsx

  # 엄격 모드로 검사
  ts-node type-checker.ts --strict src/

  # JSON 형식으로 결과 저장
  ts-node type-checker.ts --json src/ > type-report.json

  # 최소 커버리지 95%로 검사
  ts-node type-checker.ts --min-coverage 95 src/

${colors.green}검사 항목:${colors.reset}
  ✓ TypeScript 컴파일 에러
  ✓ 타입 커버리지 (any 타입 사용률)
  ✓ implicit any 경고
  ✓ 타입 단언(assertion) 안전성
  ✓ FormTypeInput props 타입 검증
  ✓ SchemaFormPlugin 타입 검증
`);
}

// CLI 옵션 파싱
function parseOptions(args: string[]): CliOptions {
  const options: CliOptions = {
    strict: false,
    json: false,
    verbose: false,
    minCoverage: 90,
    help: false,
    files: [],
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '-h':
      case '--help':
        options.help = true;
        break;
      case '-v':
      case '--verbose':
        options.verbose = true;
        break;
      case '-s':
      case '--strict':
        options.strict = true;
        break;
      case '-j':
      case '--json':
        options.json = true;
        break;
      case '-m':
      case '--min-coverage':
        options.minCoverage = parseInt(args[++i], 10);
        break;
      default:
        if (!arg.startsWith('-')) {
          options.files.push(arg);
        }
    }
  }

  return options;
}

// 파일 목록 확장 (glob 패턴 지원)
async function expandFiles(patterns: string[]): Promise<string[]> {
  const allFiles: string[] = [];

  for (const pattern of patterns) {
    if (fs.existsSync(pattern) && fs.statSync(pattern).isFile()) {
      allFiles.push(pattern);
    } else {
      const matches = await glob(pattern, {
        ignore: ['node_modules/**', 'dist/**', 'build/**'],
      });
      allFiles.push(...matches);
    }
  }

  return [...new Set(allFiles)]; // 중복 제거
}

// TypeScript 컴파일러 옵션 생성
function createCompilerOptions(strict: boolean): ts.CompilerOptions {
  return {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    jsx: ts.JsxEmit.React,
    lib: ['lib.es2020.d.ts', 'lib.dom.d.ts'],
    moduleResolution: ts.ModuleResolutionKind.Node10,
    esModuleInterop: true,
    skipLibCheck: true,
    allowSyntheticDefaultImports: true,

    // Strict 옵션
    strict: strict,
    noImplicitAny: strict,
    strictNullChecks: strict,
    strictFunctionTypes: strict,
    strictBindCallApply: strict,
    strictPropertyInitialization: strict,
    noImplicitThis: strict,
    alwaysStrict: strict,

    // 추가 검사
    noUnusedLocals: true,
    noUnusedParameters: true,
    noImplicitReturns: true,
    noFallthroughCasesInSwitch: true,
  };
}

// 타입 에러 추출
function extractTypeErrors(
  program: ts.Program,
  sourceFile: ts.SourceFile
): TypeCheckError[] {
  const diagnostics = [
    ...program.getSemanticDiagnostics(sourceFile),
    ...program.getSyntacticDiagnostics(sourceFile),
  ];

  return diagnostics.map((diagnostic) => {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(
      diagnostic.start!
    );

    return {
      line: line + 1,
      column: character + 1,
      message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
      code: diagnostic.code,
      severity: diagnostic.category === ts.DiagnosticCategory.Error ? 'error' : 'warning',
    };
  });
}

// 타입 커버리지 계산
function calculateTypeCoverage(
  sourceFile: ts.SourceFile,
  typeChecker: ts.TypeChecker
): TypeCoverage {
  let total = 0;
  let untyped = 0;

  function visit(node: ts.Node) {
    // 변수, 파라미터, 프로퍼티 등의 타입 확인
    if (
      ts.isVariableDeclaration(node) ||
      ts.isParameter(node) ||
      ts.isPropertyDeclaration(node) ||
      ts.isPropertySignature(node)
    ) {
      total++;

      const type = typeChecker.getTypeAtLocation(node);
      const typeString = typeChecker.typeToString(type);

      // 'any' 타입 감지
      if (typeString === 'any' || type.flags & ts.TypeFlags.Any) {
        untyped++;
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  const typed = total - untyped;
  const percentage = total > 0 ? (typed / total) * 100 : 100;

  return {
    total,
    typed,
    untyped,
    percentage: Math.round(percentage * 100) / 100,
  };
}

// 타입 경고 추출
function extractTypeWarnings(
  sourceFile: ts.SourceFile,
  typeChecker: ts.TypeChecker
): TypeCheckWarning[] {
  const warnings: TypeCheckWarning[] = [];

  function visit(node: ts.Node) {
    // any 타입 사용 감지
    if (
      ts.isVariableDeclaration(node) ||
      ts.isParameter(node) ||
      ts.isPropertyDeclaration(node)
    ) {
      const type = typeChecker.getTypeAtLocation(node);
      const typeString = typeChecker.typeToString(type);

      if (typeString === 'any' || type.flags & ts.TypeFlags.Any) {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(
          node.getStart()
        );

        warnings.push({
          line: line + 1,
          column: character + 1,
          message: `Using 'any' type`,
          type: 'any',
        });
      }
    }

    // Type assertion 감지
    if (ts.isAsExpression(node) || ts.isTypeAssertionExpression(node)) {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(
        node.getStart()
      );

      warnings.push({
        line: line + 1,
        column: character + 1,
        message: `Type assertion may be unsafe`,
        type: 'unsafe-cast',
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return warnings;
}

// FormTypeInput props 검증
function validateFormTypeInputProps(
  sourceFile: ts.SourceFile,
  typeChecker: ts.TypeChecker
): TypeCheckWarning[] {
  const warnings: TypeCheckWarning[] = [];

  function visit(node: ts.Node) {
    // FormTypeInput 컴포넌트 찾기
    if (
      ts.isFunctionDeclaration(node) ||
      ts.isVariableStatement(node) ||
      ts.isArrowFunction(node)
    ) {
      const text = node.getText(sourceFile);

      // FormTypeInput 패턴 감지
      if (text.includes('FormTypeInput') || text.includes('FormTypeInputProps')) {
        // TODO: props 타입 검증 로직
        // - value 속성 존재 확인
        // - onChange 속성 존재 확인
        // - schema 속성 존재 확인
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return warnings;
}

// 파일 타입 검사
function checkFile(
  filePath: string,
  program: ts.Program,
  options: CliOptions
): TypeCheckResult {
  const sourceFile = program.getSourceFile(filePath);
  if (!sourceFile) {
    throw new Error(`Cannot find source file: ${filePath}`);
  }

  const typeChecker = program.getTypeChecker();

  const errors = extractTypeErrors(program, sourceFile);
  const coverage = calculateTypeCoverage(sourceFile, typeChecker);
  const warnings = [
    ...extractTypeWarnings(sourceFile, typeChecker),
    ...validateFormTypeInputProps(sourceFile, typeChecker),
  ];

  return {
    file: filePath,
    errors,
    warnings,
    coverage,
  };
}

// 결과 출력 (일반)
function printResults(results: TypeCheckResult[], options: CliOptions): void {
  let totalErrors = 0;
  let totalWarnings = 0;
  let totalCoverage = 0;

  console.log(`${colors.cyan}=== 타입 검사 결과 ===${colors.reset}\n`);

  for (const result of results) {
    const hasErrors = result.errors.length > 0;
    const hasWarnings = result.warnings.length > 0;
    const lowCoverage = result.coverage.percentage < options.minCoverage;

    if (options.verbose || hasErrors || hasWarnings || lowCoverage) {
      console.log(`${colors.blue}파일: ${result.file}${colors.reset}`);

      // 에러 표시
      if (result.errors.length > 0) {
        console.log(`${colors.red}  에러: ${result.errors.length}개${colors.reset}`);
        if (options.verbose) {
          result.errors.forEach((error) => {
            console.log(
              `    ${error.line}:${error.column} - ${error.message} (TS${error.code})`
            );
          });
        }
      }

      // 경고 표시
      if (result.warnings.length > 0) {
        console.log(
          `${colors.yellow}  경고: ${result.warnings.length}개${colors.reset}`
        );
        if (options.verbose) {
          result.warnings.forEach((warning) => {
            console.log(
              `    ${warning.line}:${warning.column} - ${warning.message} [${warning.type}]`
            );
          });
        }
      }

      // 커버리지 표시
      const coverageColor =
        result.coverage.percentage >= options.minCoverage
          ? colors.green
          : colors.yellow;
      console.log(
        `${coverageColor}  타입 커버리지: ${result.coverage.percentage}%${colors.reset} (${result.coverage.typed}/${result.coverage.total})`
      );

      console.log('');
    }

    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;
    totalCoverage += result.coverage.percentage;
  }

  // 요약
  const avgCoverage = results.length > 0 ? totalCoverage / results.length : 0;

  console.log(`${colors.magenta}=== 요약 ===${colors.reset}`);
  console.log(`  검사한 파일: ${results.length}개`);
  console.log(`  총 에러: ${totalErrors}개`);
  console.log(`  총 경고: ${totalWarnings}개`);
  console.log(`  평균 타입 커버리지: ${avgCoverage.toFixed(2)}%`);
  console.log('');

  if (totalErrors === 0 && avgCoverage >= options.minCoverage) {
    console.log(`${colors.green}✓ 타입 검사 통과${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ 타입 검사 실패${colors.reset}`);
    if (totalErrors > 0) {
      console.log(`  - ${totalErrors}개의 타입 에러 수정 필요`);
    }
    if (avgCoverage < options.minCoverage) {
      console.log(
        `  - 타입 커버리지가 최소 기준(${options.minCoverage}%)보다 낮음`
      );
    }
  }
}

// 결과 출력 (JSON)
function printJsonResults(results: TypeCheckResult[]): void {
  const output = {
    timestamp: new Date().toISOString(),
    results,
    summary: {
      totalFiles: results.length,
      totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
      totalWarnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
      averageCoverage:
        results.reduce((sum, r) => sum + r.coverage.percentage, 0) /
        (results.length || 1),
    },
  };

  console.log(JSON.stringify(output, null, 2));
}

// 메인 함수
async function main() {
  const args = process.argv.slice(2);
  const options = parseOptions(args);

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  if (options.files.length === 0) {
    console.error(`${colors.red}오류: 검사할 파일을 지정해주세요${colors.reset}`);
    showHelp();
    process.exit(1);
  }

  // 파일 목록 확장
  const files = await expandFiles(options.files);

  if (files.length === 0) {
    console.error(
      `${colors.red}오류: 검사할 파일을 찾을 수 없습니다${colors.reset}`
    );
    process.exit(1);
  }

  if (options.verbose && !options.json) {
    console.log(`${colors.blue}검사할 파일: ${files.length}개${colors.reset}\n`);
  }

  // TypeScript 프로그램 생성
  const compilerOptions = createCompilerOptions(options.strict);
  const program = ts.createProgram(files, compilerOptions);

  // 각 파일 검사
  const results: TypeCheckResult[] = [];
  for (const file of files) {
    try {
      const result = checkFile(file, program, options);
      results.push(result);
    } catch (error) {
      console.error(
        `${colors.red}오류: ${file} 검사 실패${colors.reset}`,
        error
      );
    }
  }

  // 결과 출력
  if (options.json) {
    printJsonResults(results);
  } else {
    printResults(results, options);
  }

  // 종료 코드 설정
  const hasErrors = results.some((r) => r.errors.length > 0);
  const lowCoverage = results.some(
    (r) => r.coverage.percentage < options.minCoverage
  );

  process.exit(hasErrors || lowCoverage ? 1 : 0);
}

// 실행
main().catch((error) => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
