#!/bin/bash

# generate-tests.sh
# @canard/schema-form 플러그인용 테스트 자동 생성 스크립트
#
# 사용법:
#   ./generate-tests.sh <source-file> [test-type]
#
# 예시:
#   ./generate-tests.sh src/formTypes/StringInput.tsx
#   ./generate-tests.sh src/formTypes/StringInput.tsx unit
#   ./generate-tests.sh src/formTypes/StringInput.tsx integration

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 기본 설정
DEFAULT_TEST_TYPE="unit"
TEST_FRAMEWORK="vitest"

# 도움말 표시
show_help() {
  cat << EOF
${BLUE}테스트 자동 생성 스크립트${NC}

${GREEN}사용법:${NC}
  $0 <source-file> [test-type]

${GREEN}인자:${NC}
  source-file    테스트를 생성할 소스 파일 경로
  test-type      테스트 타입 (unit|integration|e2e) [기본값: unit]

${GREEN}예시:${NC}
  # FormTypeInput 컴포넌트의 단위 테스트 생성
  $0 src/formTypes/StringInput.tsx

  # 통합 테스트 생성
  $0 src/formTypes/StringInput.tsx integration

  # E2E 테스트 생성
  $0 src/formTypes/ComplexForm.tsx e2e

${GREEN}생성되는 테스트 파일:${NC}
  - Unit 테스트: src/formTypes/__tests__/StringInput.test.tsx
  - Integration: tests/integration/StringInput.integration.test.tsx
  - E2E: tests/e2e/StringInput.e2e.test.tsx

${GREEN}옵션:${NC}
  -h, --help     도움말 표시
  -v, --verbose  상세 출력
  -d, --dry-run  실제로 생성하지 않고 미리보기만

EOF
}

# 옵션 파싱
VERBOSE=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_help
      exit 0
      ;;
    -v|--verbose)
      VERBOSE=true
      shift
      ;;
    -d|--dry-run)
      DRY_RUN=true
      shift
      ;;
    *)
      if [ -z "$SOURCE_FILE" ]; then
        SOURCE_FILE="$1"
      elif [ -z "$TEST_TYPE" ]; then
        TEST_TYPE="$1"
      else
        echo -e "${RED}오류: 알 수 없는 인자 '$1'${NC}"
        show_help
        exit 1
      fi
      shift
      ;;
  esac
done

# 필수 인자 확인
if [ -z "$SOURCE_FILE" ]; then
  echo -e "${RED}오류: 소스 파일을 지정해주세요${NC}"
  show_help
  exit 1
fi

# 기본값 설정
TEST_TYPE="${TEST_TYPE:-$DEFAULT_TEST_TYPE}"

# 소스 파일 존재 확인
if [ ! -f "$SOURCE_FILE" ]; then
  echo -e "${RED}오류: 소스 파일을 찾을 수 없습니다: $SOURCE_FILE${NC}"
  exit 1
fi

# 파일 정보 추출
SOURCE_DIR=$(dirname "$SOURCE_FILE")
SOURCE_FILENAME=$(basename "$SOURCE_FILE")
SOURCE_NAME="${SOURCE_FILENAME%.*}"
SOURCE_EXT="${SOURCE_FILENAME##*.}"

if [ "$VERBOSE" = true ]; then
  echo -e "${BLUE}소스 파일 정보:${NC}"
  echo "  디렉토리: $SOURCE_DIR"
  echo "  파일명: $SOURCE_FILENAME"
  echo "  이름: $SOURCE_NAME"
  echo "  확장자: $SOURCE_EXT"
  echo ""
fi

# 테스트 파일 경로 결정
case $TEST_TYPE in
  unit)
    TEST_DIR="${SOURCE_DIR}/__tests__"
    TEST_FILE="${TEST_DIR}/${SOURCE_NAME}.test.${SOURCE_EXT}"
    ;;
  integration)
    TEST_DIR="tests/integration"
    TEST_FILE="${TEST_DIR}/${SOURCE_NAME}.integration.test.${SOURCE_EXT}"
    ;;
  e2e)
    TEST_DIR="tests/e2e"
    TEST_FILE="${TEST_DIR}/${SOURCE_NAME}.e2e.test.${SOURCE_EXT}"
    ;;
  *)
    echo -e "${RED}오류: 지원하지 않는 테스트 타입: $TEST_TYPE${NC}"
    echo "지원하는 타입: unit, integration, e2e"
    exit 1
    ;;
esac

# 컴포넌트 타입 감지
detect_component_type() {
  local file="$1"

  if grep -q "FormTypeInput" "$file"; then
    echo "FormTypeInput"
  elif grep -q "SchemaFormPlugin" "$file"; then
    echo "Plugin"
  elif grep -q "export function" "$file"; then
    echo "Function"
  elif grep -q "export class" "$file"; then
    echo "Class"
  else
    echo "Unknown"
  fi
}

COMPONENT_TYPE=$(detect_component_type "$SOURCE_FILE")

if [ "$VERBOSE" = true ]; then
  echo -e "${BLUE}감지된 컴포넌트 타입:${NC} $COMPONENT_TYPE"
  echo ""
fi

# 테스트 템플릿 생성
generate_unit_test_template() {
  local source_name="$1"
  local component_type="$2"
  local source_ext="$3"

  cat << EOF
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ${source_name} } from '../${source_name}';

describe('${source_name}', () => {
  describe('기본 렌더링', () => {
    it('올바르게 렌더링되어야 함', () => {
      // Arrange
      const props = {
        value: '',
        onChange: vi.fn(),
        schema: { type: 'string' }
      };

      // Act
      render(<${source_name} {...props} />);

      // Assert
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('값 변경', () => {
    it('사용자 입력 시 onChange가 호출되어야 함', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      const props = {
        value: '',
        onChange: mockOnChange,
        schema: { type: 'string' }
      };

      // Act
      render(<${source_name} {...props} />);
      const input = screen.getByRole('textbox');
      await user.type(input, 'test value');

      // Assert
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('검증', () => {
    it('필수 필드 검증이 작동해야 함', () => {
      // Arrange
      const props = {
        value: '',
        onChange: vi.fn(),
        schema: {
          type: 'string',
          minLength: 3
        }
      };

      // Act
      render(<${source_name} {...props} />);

      // Assert
      // TODO: 검증 로직 추가
    });
  });

  describe('접근성', () => {
    it('올바른 ARIA 속성을 가져야 함', () => {
      // Arrange
      const props = {
        value: '',
        onChange: vi.fn(),
        schema: {
          type: 'string',
          title: 'Test Input'
        }
      };

      // Act
      render(<${source_name} {...props} />);
      const input = screen.getByRole('textbox');

      // Assert
      expect(input).toHaveAccessibleName('Test Input');
    });
  });

  describe('에러 처리', () => {
    it('에러 메시지를 표시해야 함', () => {
      // Arrange
      const props = {
        value: '',
        onChange: vi.fn(),
        schema: { type: 'string' },
        error: 'This field is required'
      };

      // Act
      render(<${source_name} {...props} />);

      // Assert
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
  });
});
EOF
}

generate_integration_test_template() {
  local source_name="$1"

  cat << EOF
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SchemaForm } from '@canard/schema-form';
import { ${source_name} } from '../../src/formTypes/${source_name}';

describe('${source_name} 통합 테스트', () => {
  describe('SchemaForm 통합', () => {
    it('SchemaForm과 함께 작동해야 함', async () => {
      // Arrange
      const schema = {
        type: 'object',
        properties: {
          testField: {
            type: 'string',
            title: 'Test Field'
          }
        }
      };

      const plugin = {
        formTypes: {
          string: ${source_name}
        }
      };

      // Act
      render(
        <SchemaForm
          schema={schema}
          plugins={[plugin]}
          onSubmit={(data) => console.log(data)}
        />
      );

      // Assert
      expect(screen.getByLabelText('Test Field')).toBeInTheDocument();
    });
  });

  describe('데이터 흐름', () => {
    it('폼 제출 시 올바른 데이터를 전달해야 함', async () => {
      // Arrange
      const user = userEvent.setup();
      let submittedData: any = null;

      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' }
        }
      };

      const plugin = {
        formTypes: {
          string: ${source_name}
        }
      };

      // Act
      render(
        <SchemaForm
          schema={schema}
          plugins={[plugin]}
          onSubmit={(data) => { submittedData = data; }}
        />
      );

      await user.type(screen.getByRole('textbox'), 'John Doe');
      await user.click(screen.getByRole('button', { name: /submit/i }));

      // Assert
      expect(submittedData).toEqual({ name: 'John Doe' });
    });
  });

  describe('다른 플러그인과의 호환성', () => {
    it('다른 FormType과 함께 사용 가능해야 함', () => {
      // TODO: 다른 FormType과의 통합 테스트
    });
  });
});
EOF
}

generate_e2e_test_template() {
  local source_name="$1"

  cat << EOF
import { test, expect } from '@playwright/test';

test.describe('${source_name} E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 테스트 페이지로 이동
    await page.goto('http://localhost:5173/test-page');
  });

  test('사용자 입력 시나리오', async ({ page }) => {
    // Given: 폼이 로드됨
    await expect(page.locator('input[type="text"]')).toBeVisible();

    // When: 사용자가 값을 입력
    await page.fill('input[type="text"]', 'test value');

    // Then: 입력된 값이 표시됨
    await expect(page.locator('input[type="text"]')).toHaveValue('test value');
  });

  test('폼 제출 시나리오', async ({ page }) => {
    // Given: 폼에 데이터 입력
    await page.fill('input[type="text"]', 'John Doe');

    // When: 제출 버튼 클릭
    await page.click('button[type="submit"]');

    // Then: 성공 메시지 표시
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('검증 에러 시나리오', async ({ page }) => {
    // Given: 빈 입력
    await page.fill('input[type="text"]', '');

    // When: 제출 시도
    await page.click('button[type="submit"]');

    // Then: 에러 메시지 표시
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('접근성 테스트', async ({ page }) => {
    // Given: 페이지 로드

    // When: Tab 키로 포커스 이동
    await page.keyboard.press('Tab');

    // Then: 입력 필드에 포커스
    await expect(page.locator('input[type="text"]')).toBeFocused();
  });
});
EOF
}

# 테스트 파일 생성
echo -e "${BLUE}테스트 파일 생성 중...${NC}"
echo "  타입: $TEST_TYPE"
echo "  위치: $TEST_FILE"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}[DRY RUN] 실제로 파일을 생성하지 않습니다${NC}"
  echo ""
fi

# 디렉토리 생성
if [ "$DRY_RUN" = false ]; then
  mkdir -p "$TEST_DIR"
fi

# 테스트 템플릿 생성
case $TEST_TYPE in
  unit)
    TEST_CONTENT=$(generate_unit_test_template "$SOURCE_NAME" "$COMPONENT_TYPE" "$SOURCE_EXT")
    ;;
  integration)
    TEST_CONTENT=$(generate_integration_test_template "$SOURCE_NAME")
    ;;
  e2e)
    TEST_CONTENT=$(generate_e2e_test_template "$SOURCE_NAME")
    ;;
esac

# 파일이 이미 존재하는지 확인
if [ -f "$TEST_FILE" ]; then
  echo -e "${YELLOW}경고: 테스트 파일이 이미 존재합니다: $TEST_FILE${NC}"
  echo -n "덮어쓰시겠습니까? (y/N): "
  read -r answer
  if [ "$answer" != "y" ] && [ "$answer" != "Y" ]; then
    echo -e "${BLUE}취소되었습니다${NC}"
    exit 0
  fi
fi

# 파일 생성
if [ "$DRY_RUN" = false ]; then
  echo "$TEST_CONTENT" > "$TEST_FILE"
  echo -e "${GREEN}✓ 테스트 파일 생성 완료: $TEST_FILE${NC}"
else
  echo -e "${YELLOW}[DRY RUN] 생성될 내용:${NC}"
  echo "$TEST_CONTENT"
fi

# 실행 가능한 명령어 제안
echo ""
echo -e "${BLUE}다음 단계:${NC}"
echo ""
echo "  # 테스트 실행"
echo "  yarn test $TEST_FILE"
echo ""
echo "  # 커버리지와 함께 테스트 실행"
echo "  yarn test --coverage $TEST_FILE"
echo ""
echo "  # Watch 모드로 테스트 실행"
echo "  yarn test --watch $TEST_FILE"
echo ""

# 추가 테스트 제안
if [ "$TEST_TYPE" = "unit" ]; then
  echo -e "${BLUE}추가 테스트 생성:${NC}"
  echo ""
  echo "  # 통합 테스트 생성"
  echo "  $0 $SOURCE_FILE integration"
  echo ""
  echo "  # E2E 테스트 생성"
  echo "  $0 $SOURCE_FILE e2e"
  echo ""
fi

exit 0
