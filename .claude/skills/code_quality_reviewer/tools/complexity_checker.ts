/**
 * 순환 복잡도 (Cyclomatic Complexity) 계산 도구
 * 함수의 복잡도를 측정하여 리팩터링 필요 여부 판단
 */

import * as ts from 'typescript';
import * as fs from 'fs';

interface ComplexityResult {
  functionName: string;
  complexity: number;
  line: number;
  severity: 'low' | 'medium' | 'high' | 'very_high';
  recommendation: string;
}

interface FileComplexity {
  filePath: string;
  functions: ComplexityResult[];
  averageComplexity: number;
  maxComplexity: number;
}

/**
 * TypeScript 파일의 순환 복잡도 분석
 */
export function analyzeComplexity(filePath: string): FileComplexity {
  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  const functions: ComplexityResult[] = [];

  // AST 순회하며 함수 찾기
  function visit(node: ts.Node) {
    if (
      ts.isFunctionDeclaration(node) ||
      ts.isMethodDeclaration(node) ||
      ts.isArrowFunction(node) ||
      ts.isFunctionExpression(node)
    ) {
      const complexity = calculateComplexity(node);
      const functionName = getFunctionName(node);
      const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;

      functions.push({
        functionName,
        complexity,
        line,
        severity: getSeverity(complexity),
        recommendation: getRecommendation(complexity),
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  // 통계 계산
  const complexities = functions.map(f => f.complexity);
  const averageComplexity =
    complexities.length > 0
      ? complexities.reduce((a, b) => a + b, 0) / complexities.length
      : 0;
  const maxComplexity = complexities.length > 0 ? Math.max(...complexities) : 0;

  return {
    filePath,
    functions,
    averageComplexity: Math.round(averageComplexity * 10) / 10,
    maxComplexity,
  };
}

/**
 * 순환 복잡도 계산
 * 기준: 1 (기본) + 조건문/반복문 개수
 */
function calculateComplexity(node: ts.Node): number {
  let complexity = 1; // 기본 복잡도

  function visit(n: ts.Node) {
    // 조건문
    if (ts.isIfStatement(n)) {
      complexity++;
    }
    // 반복문
    else if (
      ts.isForStatement(n) ||
      ts.isForInStatement(n) ||
      ts.isForOfStatement(n) ||
      ts.isWhileStatement(n) ||
      ts.isDoStatement(n)
    ) {
      complexity++;
    }
    // Switch case
    else if (ts.isCaseClause(n)) {
      complexity++;
    }
    // 논리 연산자
    else if (ts.isBinaryExpression(n)) {
      if (
        n.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken || // &&
        n.operatorToken.kind === ts.SyntaxKind.BarBarToken // ||
      ) {
        complexity++;
      }
    }
    // 삼항 연산자
    else if (ts.isConditionalExpression(n)) {
      complexity++;
    }
    // Catch 블록
    else if (ts.isCatchClause(n)) {
      complexity++;
    }

    ts.forEachChild(n, visit);
  }

  visit(node);
  return complexity;
}

/**
 * 함수 이름 추출
 */
function getFunctionName(node: ts.Node): string {
  if (ts.isFunctionDeclaration(node) && node.name) {
    return node.name.getText();
  }
  if (ts.isMethodDeclaration(node) && node.name) {
    return node.name.getText();
  }
  if (ts.isArrowFunction(node)) {
    // 변수 할당된 화살표 함수인 경우
    const parent = node.parent;
    if (ts.isVariableDeclaration(parent) && parent.name) {
      return parent.name.getText();
    }
    return '<anonymous>';
  }
  return '<anonymous>';
}

/**
 * 복잡도에 따른 심각도 판정
 */
function getSeverity(complexity: number): 'low' | 'medium' | 'high' | 'very_high' {
  if (complexity <= 5) return 'low';
  if (complexity <= 10) return 'medium';
  if (complexity <= 20) return 'high';
  return 'very_high';
}

/**
 * 복잡도에 따른 권장사항
 */
function getRecommendation(complexity: number): string {
  if (complexity <= 5) {
    return '✅ 양호: 복잡도가 낮고 이해하기 쉽습니다';
  }
  if (complexity <= 10) {
    return '⚠️  주의: 복잡도가 다소 높습니다. 리팩터링을 고려하세요';
  }
  if (complexity <= 20) {
    return '🔴 경고: 복잡도가 높습니다. 함수 분리가 필요합니다';
  }
  return '❌ 위험: 복잡도가 매우 높습니다. 즉시 리팩터링하세요';
}

/**
 * 복잡도 보고서 출력
 */
export function printComplexityReport(result: FileComplexity): void {
  console.log(`\n📊 복잡도 분석: ${result.filePath}`);
  console.log(`평균 복잡도: ${result.averageComplexity}`);
  console.log(`최대 복잡도: ${result.maxComplexity}\n`);

  // 복잡도 높은 순으로 정렬
  const sorted = [...result.functions].sort((a, b) => b.complexity - a.complexity);

  console.log('함수별 복잡도:');
  sorted.forEach(func => {
    const icon = {
      low: '✅',
      medium: '⚠️ ',
      high: '🔴',
      very_high: '❌',
    }[func.severity];

    console.log(
      `${icon} ${func.functionName} (${func.line}줄): ${func.complexity} - ${func.recommendation}`
    );
  });

  // 액션 아이템
  const needsRefactoring = sorted.filter(f => f.complexity > 10);
  if (needsRefactoring.length > 0) {
    console.log('\n🎯 리팩터링 우선순위:');
    needsRefactoring.forEach((func, index) => {
      console.log(`  ${index + 1}. ${func.functionName} (복잡도: ${func.complexity})`);
    });
  }
}

// CLI 실행
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('사용법: ts-node complexity_checker.ts <file.ts>');
    process.exit(1);
  }

  const filePath = args[0];
  const result = analyzeComplexity(filePath);
  printComplexityReport(result);

  // Exit code: 복잡도 20 초과 함수가 있으면 1
  const hasCritical = result.functions.some(f => f.complexity > 20);
  process.exit(hasCritical ? 1 : 0);
}
