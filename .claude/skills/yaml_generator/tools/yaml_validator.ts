/**
 * YAML 검증 도구
 * 생성된 YAML 파일이 올바른 형식인지, 스키마를 준수하는지 검증
 */

import * as yaml from 'js-yaml';
import Ajv from 'ajv';
import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * YAML 파일 검증 (문법 + 스키마)
 */
export function validateYAMLFile(yamlFilePath: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: []
  };

  // 1. 파일 읽기
  let yamlContent: string;
  try {
    yamlContent = fs.readFileSync(yamlFilePath, 'utf-8');
  } catch (error) {
    result.valid = false;
    result.errors.push(`파일 읽기 실패: ${error.message}`);
    return result;
  }

  // 2. YAML 파싱 검증
  let parsedYaml: any;
  try {
    parsedYaml = yaml.load(yamlContent);
  } catch (error) {
    result.valid = false;
    result.errors.push(`YAML 파싱 오류: ${error.message}`);
    return result;
  }

  // 3. JSON 스키마 검증
  const schemaPath = path.join(__dirname, '../knowledge/yaml_schema.json');
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));

  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schema);
  const schemaValid = validate(parsedYaml);

  if (!schemaValid) {
    result.valid = false;
    result.errors.push('스키마 검증 실패:');
    validate.errors?.forEach(error => {
      result.errors.push(`  - ${error.instancePath}: ${error.message}`);
    });
  }

  // 4. 추가 검증 (비즈니스 로직)
  validateBusinessRules(parsedYaml, result);

  return result;
}

/**
 * YAML 문자열 검증 (in-memory)
 */
export function validateYAMLString(yamlContent: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: []
  };

  // 1. YAML 파싱 검증
  let parsedYaml: any;
  try {
    parsedYaml = yaml.load(yamlContent);
  } catch (error) {
    result.valid = false;
    result.errors.push(`YAML 파싱 오류: ${error.message}`);
    return result;
  }

  // 2. JSON 스키마 검증
  const schemaPath = path.join(__dirname, '../knowledge/yaml_schema.json');
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));

  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schema);
  const schemaValid = validate(parsedYaml);

  if (!schemaValid) {
    result.valid = false;
    result.errors.push('스키마 검증 실패:');
    validate.errors?.forEach(error => {
      result.errors.push(`  - ${error.instancePath}: ${error.message}`);
    });
  }

  // 3. 추가 검증
  validateBusinessRules(parsedYaml, result);

  return result;
}

/**
 * 비즈니스 로직 검증
 */
function validateBusinessRules(data: any, result: ValidationResult): void {
  // Rule 1: Monorepo인 경우 packages_dir 필수
  if (data.project?.type === 'monorepo') {
    if (!data.structure?.packages_dir) {
      result.warnings.push(
        'Monorepo 프로젝트이지만 packages_dir이 설정되지 않았습니다'
      );
    }

    if (!data.package_manager?.workspace_command) {
      result.warnings.push(
        'Monorepo 프로젝트이지만 workspace_command가 설정되지 않았습니다'
      );
    }
  }

  // Rule 2: 프론트엔드 프레임워크가 있으면 언어 필수
  if (data.tech_stack?.frontend?.framework) {
    if (!data.tech_stack.frontend.language) {
      result.warnings.push(
        '프론트엔드 프레임워크가 설정되었지만 언어(language)가 지정되지 않았습니다'
      );
    }
  }

  // Rule 3: 백엔드 프레임워크가 있으면 API 스타일 필수
  if (data.tech_stack?.backend?.framework) {
    if (!data.tech_stack.backend.api_style) {
      result.warnings.push(
        '백엔드 프레임워크가 설정되었지만 API 스타일(api_style)이 지정되지 않았습니다'
      );
    }
  }

  // Rule 4: 포트 번호 중복 체크
  const ports = data.development?.ports;
  if (ports) {
    const portValues = Object.values(ports).filter(p => typeof p === 'number');
    const uniquePorts = new Set(portValues);
    if (portValues.length !== uniquePorts.size) {
      result.warnings.push('개발 서버 포트가 중복되었습니다');
    }
  }

  // Rule 5: 명령어가 비어있는지 체크
  const commands = data.commands;
  if (commands) {
    const categories = ['dev', 'test', 'lint', 'build'];
    categories.forEach(cat => {
      if (commands[cat] && Object.keys(commands[cat]).length === 0) {
        result.warnings.push(`${cat} 명령어가 설정되지 않았습니다`);
      }
    });
  }

  // Rule 6: UTF-8 인코딩 체크 (한글 주석 지원)
  // Note: 이미 파싱이 성공했다면 인코딩은 문제없음
}

/**
 * 검증 결과 출력 (CLI용)
 */
export function printValidationResult(result: ValidationResult): void {
  if (result.valid) {
    console.log('✅ YAML 검증 성공');

    if (result.warnings.length > 0) {
      console.log('\n⚠️  경고:');
      result.warnings.forEach(warning => {
        console.log(`  - ${warning}`);
      });
    }
  } else {
    console.log('❌ YAML 검증 실패');
    console.log('\n오류 목록:');
    result.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });

    if (result.warnings.length > 0) {
      console.log('\n⚠️  경고:');
      result.warnings.forEach(warning => {
        console.log(`  - ${warning}`);
      });
    }
  }
}

// CLI 실행 예시
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('사용법: ts-node yaml_validator.ts <yaml-file-path>');
    process.exit(1);
  }

  const yamlFile = args[0];
  const result = validateYAMLFile(yamlFile);
  printValidationResult(result);

  process.exit(result.valid ? 0 : 1);
}
