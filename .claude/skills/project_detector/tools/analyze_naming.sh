#!/bin/bash
# 네이밍 컨벤션 분석 스크립트
# 프로젝트의 파일명과 디렉토리명 패턴을 통계적으로 분석하여 명명 규칙 감지

set -e

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 프로젝트 네이밍 컨벤션 분석 시작..."

# 1. 컴포넌트 파일 네이밍 분석 (React/Vue 등)
analyze_component_naming() {
  echo -e "\n${GREEN}[1] 컴포넌트 파일 네이밍 분석${NC}"

  # .tsx, .jsx 파일 찾기 (node_modules 제외)
  local component_files=$(find . -type f \( -name "*.tsx" -o -name "*.jsx" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/dist/*" \
    | head -100)

  if [ -z "$component_files" ]; then
    echo "  → 컴포넌트 파일 없음"
    return
  fi

  # 파일명만 추출 (경로 제거)
  local filenames=$(echo "$component_files" | xargs -n1 basename)

  # 패턴별 개수 세기
  local pascal_count=$(echo "$filenames" | grep -c '^[A-Z][a-zA-Z]*\.' || true)
  local camel_count=$(echo "$filenames" | grep -c '^[a-z][a-zA-Z]*\.' || true)
  local kebab_count=$(echo "$filenames" | grep -c '^[a-z][a-z0-9-]*\.' || true)

  echo "  PascalCase: $pascal_count"
  echo "  camelCase: $camel_count"
  echo "  kebab-case: $kebab_count"

  # 가장 많은 패턴 출력
  if [ "$pascal_count" -gt "$camel_count" ] && [ "$pascal_count" -gt "$kebab_count" ]; then
    echo "  ✅ 감지된 컨벤션: PascalCase"
    echo "COMPONENT_NAMING=PascalCase" >> .naming-result.env
  elif [ "$kebab_count" -gt "$camel_count" ]; then
    echo "  ✅ 감지된 컨벤션: kebab-case"
    echo "COMPONENT_NAMING=kebab-case" >> .naming-result.env
  else
    echo "  ✅ 감지된 컨벤션: camelCase"
    echo "COMPONENT_NAMING=camelCase" >> .naming-result.env
  fi
}

# 2. 일반 파일 네이밍 분석
analyze_file_naming() {
  echo -e "\n${GREEN}[2] 일반 파일 네이밍 분석${NC}"

  # TypeScript/JavaScript 파일 (컴포넌트 제외)
  local source_files=$(find . -type f \( -name "*.ts" -o -name "*.js" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/dist/*" \
    -not -name "*.test.*" \
    -not -name "*.spec.*" \
    | head -100)

  if [ -z "$source_files" ]; then
    echo "  → 소스 파일 없음"
    return
  fi

  local filenames=$(echo "$source_files" | xargs -n1 basename)

  local pascal_count=$(echo "$filenames" | grep -c '^[A-Z][a-zA-Z]*\.' || true)
  local camel_count=$(echo "$filenames" | grep -c '^[a-z][a-zA-Z]*\.' || true)
  local kebab_count=$(echo "$filenames" | grep -c '^[a-z][a-z0-9-]*\.' || true)
  local snake_count=$(echo "$filenames" | grep -c '^[a-z][a-z0-9_]*\.' || true)

  echo "  PascalCase: $pascal_count"
  echo "  camelCase: $camel_count"
  echo "  kebab-case: $kebab_count"
  echo "  snake_case: $snake_count"

  # 가장 많은 패턴 출력
  local max_count=$pascal_count
  local convention="PascalCase"

  if [ "$kebab_count" -gt "$max_count" ]; then
    max_count=$kebab_count
    convention="kebab-case"
  fi
  if [ "$snake_count" -gt "$max_count" ]; then
    max_count=$snake_count
    convention="snake_case"
  fi
  if [ "$camel_count" -gt "$max_count" ]; then
    convention="camelCase"
  fi

  echo "  ✅ 감지된 컨벤션: $convention"
  echo "FILE_NAMING=$convention" >> .naming-result.env
}

# 3. 디렉토리 네이밍 분석
analyze_directory_naming() {
  echo -e "\n${GREEN}[3] 디렉토리 네이밍 분석${NC}"

  # 첫 번째 레벨 디렉토리 (src, packages 등 시스템 디렉토리 제외)
  local dirs=$(find . -maxdepth 2 -type d \
    -not -path "." \
    -not -path "./node_modules*" \
    -not -path "./.git*" \
    -not -path "./.next*" \
    -not -path "./dist*" \
    | sed 's|^\./||')

  if [ -z "$dirs" ]; then
    echo "  → 디렉토리 없음"
    return
  fi

  local pascal_count=$(echo "$dirs" | grep -c '^[A-Z][a-zA-Z]*$' || true)
  local camel_count=$(echo "$dirs" | grep -c '^[a-z][a-zA-Z]*$' || true)
  local kebab_count=$(echo "$dirs" | grep -c '^[a-z][a-z0-9-]*$' || true)
  local snake_count=$(echo "$dirs" | grep -c '^[a-z][a-z0-9_]*$' || true)

  echo "  PascalCase: $pascal_count"
  echo "  camelCase: $camel_count"
  echo "  kebab-case: $kebab_count"
  echo "  snake_case: $snake_count"

  # 가장 많은 패턴 출력
  local max_count=$kebab_count
  local convention="kebab-case"

  if [ "$pascal_count" -gt "$max_count" ]; then
    max_count=$pascal_count
    convention="PascalCase"
  fi
  if [ "$camel_count" -gt "$max_count" ]; then
    max_count=$camel_count
    convention="camelCase"
  fi
  if [ "$snake_count" -gt "$max_count" ]; then
    convention="snake_case"
  fi

  echo "  ✅ 감지된 컨벤션: $convention"
  echo "DIRECTORY_NAMING=$convention" >> .naming-result.env
}

# 4. 테스트 파일 패턴 분석
analyze_test_pattern() {
  echo -e "\n${GREEN}[4] 테스트 파일 패턴 분석${NC}"

  local test_files=$(find . -type f \( -name "*.test.*" -o -name "*.spec.*" \) \
    -not -path "*/node_modules/*" | head -50)

  if [ -z "$test_files" ]; then
    echo "  → 테스트 파일 없음"
    echo "TEST_PATTERN=none" >> .naming-result.env
    return
  fi

  local spec_count=$(echo "$test_files" | grep -c '\.spec\.' || true)
  local test_count=$(echo "$test_files" | grep -c '\.test\.' || true)

  echo "  .spec.*: $spec_count"
  echo "  .test.*: $test_count"

  if [ "$spec_count" -gt "$test_count" ]; then
    echo "  ✅ 감지된 패턴: *.spec.*"
    echo "TEST_PATTERN=spec" >> .naming-result.env
  else
    echo "  ✅ 감지된 패턴: *.test.*"
    echo "TEST_PATTERN=test" >> .naming-result.env
  fi
}

# 메인 실행
main() {
  # 이전 결과 파일 제거
  rm -f .naming-result.env

  analyze_component_naming
  analyze_file_naming
  analyze_directory_naming
  analyze_test_pattern

  echo -e "\n${YELLOW}📊 분석 완료! 결과는 .naming-result.env에 저장되었습니다.${NC}"

  # 결과 출력
  if [ -f ".naming-result.env" ]; then
    echo -e "\n=== 최종 결과 ==="
    cat .naming-result.env
  fi
}

main "$@"
