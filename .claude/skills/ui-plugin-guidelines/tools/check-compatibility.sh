#!/bin/bash

# check-compatibility.sh
# @canard/schema-form 플러그인 UI 라이브러리 호환성 검사 스크립트
#
# 사용법:
#   ./check-compatibility.sh [ui-library] [version]
#
# 예시:
#   ./check-compatibility.sh mui 5.14.0
#   ./check-compatibility.sh antd latest
#   ./check-compatibility.sh chakra ">=2.0.0"

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# 지원하는 UI 라이브러리
declare -A SUPPORTED_LIBRARIES=(
  ["mui"]="@mui/material"
  ["antd"]="antd"
  ["chakra"]="@chakra-ui/react"
  ["headless"]="@headlessui/react"
  ["mantine"]="@mantine/core"
)

# 최소 버전 요구사항
declare -A MIN_VERSIONS=(
  ["@mui/material"]="5.0.0"
  ["antd"]="5.0.0"
  ["@chakra-ui/react"]="2.0.0"
  ["@headlessui/react"]="1.7.0"
  ["@mantine/core"]="6.0.0"
)

# 도움말 표시
show_help() {
  cat << EOF
${BLUE}UI 라이브러리 호환성 검사 스크립트${NC}

${GREEN}사용법:${NC}
  $0 [ui-library] [version]

${GREEN}지원하는 UI 라이브러리:${NC}
  mui          Material-UI (@mui/material)
  antd         Ant Design (antd)
  chakra       Chakra UI (@chakra-ui/react)
  headless     Headless UI (@headlessui/react)
  mantine      Mantine (@mantine/core)

${GREEN}인자:${NC}
  ui-library   검사할 UI 라이브러리 (위 목록 참고)
  version      검사할 버전 (선택 사항, 기본값: package.json에서 감지)

${GREEN}예시:${NC}
  # package.json의 MUI 버전 검사
  $0 mui

  # 특정 버전 호환성 검사
  $0 mui 5.14.0

  # 최신 버전과 호환성 검사
  $0 antd latest

  # 버전 범위 검사
  $0 chakra ">=2.0.0 <3.0.0"

${GREEN}검사 항목:${NC}
  ✓ 버전 호환성 (최소 버전 요구사항)
  ✓ peerDependencies 충돌
  ✓ 필수 패키지 설치 여부
  ✓ TypeScript 타입 정의
  ✓ 알려진 호환성 이슈
  ✓ Breaking Changes

${GREEN}옵션:${NC}
  -h, --help      도움말 표시
  -v, --verbose   상세 출력
  -j, --json      JSON 형식으로 출력
  --fix           자동으로 호환되는 버전 설치 시도

EOF
}

# 옵션 파싱
VERBOSE=false
JSON_OUTPUT=false
AUTO_FIX=false

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
    -j|--json)
      JSON_OUTPUT=true
      shift
      ;;
    --fix)
      AUTO_FIX=true
      shift
      ;;
    *)
      if [ -z "$UI_LIBRARY" ]; then
        UI_LIBRARY="$1"
      elif [ -z "$VERSION" ]; then
        VERSION="$1"
      else
        echo -e "${RED}오류: 알 수 없는 인자 '$1'${NC}"
        show_help
        exit 1
      fi
      shift
      ;;
  esac
done

# UI 라이브러리 확인
if [ -z "$UI_LIBRARY" ]; then
  echo -e "${RED}오류: UI 라이브러리를 지정해주세요${NC}"
  show_help
  exit 1
fi

# 지원 라이브러리 확인
PACKAGE_NAME="${SUPPORTED_LIBRARIES[$UI_LIBRARY]}"
if [ -z "$PACKAGE_NAME" ]; then
  echo -e "${RED}오류: 지원하지 않는 UI 라이브러리: $UI_LIBRARY${NC}"
  echo ""
  echo "지원하는 라이브러리:"
  for lib in "${!SUPPORTED_LIBRARIES[@]}"; do
    echo "  - $lib (${SUPPORTED_LIBRARIES[$lib]})"
  done
  exit 1
fi

MIN_VERSION="${MIN_VERSIONS[$PACKAGE_NAME]}"

# package.json 존재 확인
if [ ! -f "package.json" ]; then
  echo -e "${RED}오류: package.json을 찾을 수 없습니다${NC}"
  exit 1
fi

# 현재 설치된 버전 감지
detect_installed_version() {
  local package="$1"

  # package.json에서 버전 확인
  local pkg_version=$(jq -r ".dependencies[\"$package\"] // .devDependencies[\"$package\"] // .peerDependencies[\"$package\"] // \"\"" package.json 2>/dev/null)

  if [ -n "$pkg_version" ] && [ "$pkg_version" != "null" ]; then
    # 버전 범위 기호 제거 (^, ~, >=, etc.)
    pkg_version=$(echo "$pkg_version" | sed 's/[\^~>=<]//g' | awk '{print $1}')
    echo "$pkg_version"
  else
    # node_modules에서 확인
    if [ -d "node_modules/$package" ]; then
      local nm_version=$(jq -r '.version' "node_modules/$package/package.json" 2>/dev/null || echo "")
      echo "$nm_version"
    else
      echo ""
    fi
  fi
}

# 버전이 지정되지 않은 경우 감지
if [ -z "$VERSION" ]; then
  VERSION=$(detect_installed_version "$PACKAGE_NAME")
  if [ -z "$VERSION" ]; then
    echo -e "${YELLOW}경고: 설치된 버전을 찾을 수 없습니다${NC}"
    echo "최신 버전과 호환성을 검사합니다..."
    VERSION="latest"
  fi
fi

if [ "$VERBOSE" = true ]; then
  echo -e "${BLUE}호환성 검사 정보:${NC}"
  echo "  UI 라이브러리: $UI_LIBRARY ($PACKAGE_NAME)"
  echo "  검사 버전: $VERSION"
  echo "  최소 요구 버전: $MIN_VERSION"
  echo ""
fi

# 버전 비교 함수
version_compare() {
  local version1="$1"
  local version2="$2"

  # 'latest'는 항상 최신으로 간주
  if [ "$version1" = "latest" ]; then
    echo "0"
    return
  fi

  # Semantic versioning 비교
  local IFS=.
  local i ver1=($version1) ver2=($version2)

  for ((i=0; i<${#ver1[@]} || i<${#ver2[@]}; i++)); do
    local num1=${ver1[i]:-0}
    local num2=${ver2[i]:-0}

    if ((10#$num1 > 10#$num2)); then
      echo "1"
      return
    elif ((10#$num1 < 10#$num2)); then
      echo "-1"
      return
    fi
  done

  echo "0"
}

# 1. 버전 호환성 검사
check_version_compatibility() {
  echo -e "${CYAN}[1/6] 버전 호환성 검사${NC}"

  local result=$(version_compare "$VERSION" "$MIN_VERSION")

  if [ "$result" = "-1" ]; then
    echo -e "${RED}  ✗ 버전이 최소 요구사항보다 낮습니다${NC}"
    echo "    현재: $VERSION"
    echo "    최소: $MIN_VERSION"
    return 1
  else
    echo -e "${GREEN}  ✓ 버전 호환성 확인${NC}"
    echo "    현재: $VERSION (최소: $MIN_VERSION)"
    return 0
  fi
}

# 2. peerDependencies 검사
check_peer_dependencies() {
  echo -e "${CYAN}[2/6] peerDependencies 검사${NC}"

  # @canard/schema-form의 peerDependencies 확인
  local canard_peer_deps=$(jq -r '.peerDependencies | keys[]' package.json 2>/dev/null || echo "")

  local conflicts=0
  while IFS= read -r dep; do
    if [ -n "$dep" ]; then
      local required_version=$(jq -r ".peerDependencies[\"$dep\"]" package.json)
      local installed_version=$(detect_installed_version "$dep")

      if [ -n "$installed_version" ]; then
        if [ "$VERBOSE" = true ]; then
          echo "    $dep: $installed_version (요구: $required_version)"
        fi
      else
        echo -e "${YELLOW}    ⚠ $dep이 설치되지 않았습니다 (요구: $required_version)${NC}"
        ((conflicts++))
      fi
    fi
  done <<< "$canard_peer_deps"

  if [ "$conflicts" -eq 0 ]; then
    echo -e "${GREEN}  ✓ peerDependencies 충돌 없음${NC}"
    return 0
  else
    echo -e "${YELLOW}  ⚠ $conflicts개의 peerDependencies 경고${NC}"
    return 1
  fi
}

# 3. 필수 패키지 설치 확인
check_required_packages() {
  echo -e "${CYAN}[3/6] 필수 패키지 설치 확인${NC}"

  local required_packages=()

  case $UI_LIBRARY in
    mui)
      required_packages=("@mui/material" "@emotion/react" "@emotion/styled")
      ;;
    antd)
      required_packages=("antd")
      ;;
    chakra)
      required_packages=("@chakra-ui/react" "@emotion/react" "@emotion/styled" "framer-motion")
      ;;
    headless)
      required_packages=("@headlessui/react")
      ;;
    mantine)
      required_packages=("@mantine/core" "@mantine/hooks" "@emotion/react")
      ;;
  esac

  local missing=0
  for pkg in "${required_packages[@]}"; do
    if [ -d "node_modules/$pkg" ] || grep -q "\"$pkg\"" package.json; then
      if [ "$VERBOSE" = true ]; then
        echo -e "${GREEN}    ✓ $pkg${NC}"
      fi
    else
      echo -e "${RED}    ✗ $pkg (미설치)${NC}"
      ((missing++))
    fi
  done

  if [ "$missing" -eq 0 ]; then
    echo -e "${GREEN}  ✓ 모든 필수 패키지 설치됨${NC}"
    return 0
  else
    echo -e "${RED}  ✗ $missing개의 필수 패키지 미설치${NC}"
    return 1
  fi
}

# 4. TypeScript 타입 정의 확인
check_typescript_types() {
  echo -e "${CYAN}[4/6] TypeScript 타입 정의 확인${NC}"

  local types_packages=()

  case $UI_LIBRARY in
    mui|chakra|mantine)
      # 자체 타입 정의 포함
      echo -e "${GREEN}  ✓ 자체 타입 정의 포함${NC}"
      return 0
      ;;
    antd|headless)
      types_packages=("@types/react" "@types/react-dom")
      ;;
  esac

  local missing_types=0
  for pkg in "${types_packages[@]}"; do
    if [ -d "node_modules/$pkg" ] || grep -q "\"$pkg\"" package.json; then
      if [ "$VERBOSE" = true ]; then
        echo -e "${GREEN}    ✓ $pkg${NC}"
      fi
    else
      echo -e "${YELLOW}    ⚠ $pkg (미설치)${NC}"
      ((missing_types++))
    fi
  done

  if [ "$missing_types" -eq 0 ]; then
    echo -e "${GREEN}  ✓ TypeScript 타입 정의 확인${NC}"
    return 0
  else
    echo -e "${YELLOW}  ⚠ $missing_types개의 타입 정의 패키지 미설치${NC}"
    return 1
  fi
}

# 5. 알려진 호환성 이슈 검사
check_known_issues() {
  echo -e "${CYAN}[5/6] 알려진 호환성 이슈 검사${NC}"

  local has_issues=false

  case $UI_LIBRARY in
    mui)
      if [ "$VERSION" = "5.0.0" ] || [ "$VERSION" = "5.0.1" ]; then
        echo -e "${YELLOW}    ⚠ MUI 5.0.0-5.0.1: Emotion 11 호환성 이슈${NC}"
        echo "      권장: MUI >= 5.0.2 사용"
        has_issues=true
      fi
      ;;
    antd)
      if [[ "$VERSION" == 5.0.* ]]; then
        echo -e "${YELLOW}    ⚠ Ant Design 5.0.x: 일부 컴포넌트 API 변경${NC}"
        echo "      권장: 마이그레이션 가이드 참고"
        has_issues=true
      fi
      ;;
    chakra)
      local result=$(version_compare "$VERSION" "2.0.0")
      if [ "$result" = "-1" ]; then
        echo -e "${YELLOW}    ⚠ Chakra UI < 2.0.0: @canard/schema-form과 호환성 제한${NC}"
        echo "      권장: Chakra UI >= 2.0.0 사용"
        has_issues=true
      fi
      ;;
  esac

  if [ "$has_issues" = false ]; then
    echo -e "${GREEN}  ✓ 알려진 호환성 이슈 없음${NC}"
    return 0
  else
    return 1
  fi
}

# 6. Breaking Changes 검사
check_breaking_changes() {
  echo -e "${CYAN}[6/6] Breaking Changes 검사${NC}"

  # 주요 버전 변경 감지
  local major_version="${VERSION%%.*}"
  local has_breaking_changes=false

  case $UI_LIBRARY in
    mui)
      if [ "$major_version" -ge 6 ]; then
        echo -e "${YELLOW}    ⚠ MUI v6: 아직 @canard/schema-form에서 테스트되지 않음${NC}"
        has_breaking_changes=true
      fi
      ;;
    antd)
      if [ "$major_version" -ge 6 ]; then
        echo -e "${YELLOW}    ⚠ Ant Design v6: 베타 버전, 프로덕션 사용 주의${NC}"
        has_breaking_changes=true
      fi
      ;;
  esac

  if [ "$has_breaking_changes" = false ]; then
    echo -e "${GREEN}  ✓ Breaking Changes 없음${NC}"
    return 0
  else
    return 1
  fi
}

# 모든 검사 실행
echo -e "${MAGENTA}=== UI 라이브러리 호환성 검사 ===${NC}"
echo ""

passed_checks=0
total_checks=6

check_version_compatibility && ((passed_checks++))
echo ""

check_peer_dependencies && ((passed_checks++))
echo ""

check_required_packages && ((passed_checks++))
echo ""

check_typescript_types && ((passed_checks++))
echo ""

check_known_issues && ((passed_checks++))
echo ""

check_breaking_changes && ((passed_checks++))
echo ""

# 결과 요약
echo -e "${MAGENTA}=== 검사 결과 ===${NC}"
echo ""
echo -e "  통과: ${GREEN}$passed_checks${NC}/$total_checks"
echo ""

if [ "$passed_checks" -eq "$total_checks" ]; then
  echo -e "${GREEN}✓ 모든 호환성 검사 통과${NC}"
  echo -e "${GREEN}✓ $UI_LIBRARY $VERSION은 @canard/schema-form과 호환됩니다${NC}"
  exit_code=0
elif [ "$passed_checks" -ge 4 ]; then
  echo -e "${YELLOW}⚠ 일부 경고가 있지만 사용 가능${NC}"
  echo "  일부 기능이 제한되거나 추가 설정이 필요할 수 있습니다"
  exit_code=0
else
  echo -e "${RED}✗ 호환성 검사 실패${NC}"
  echo -e "${RED}✗ $UI_LIBRARY $VERSION은 @canard/schema-form과 호환되지 않을 수 있습니다${NC}"
  exit_code=1
fi

# 자동 수정 제안
if [ "$AUTO_FIX" = true ] && [ "$exit_code" -ne 0 ]; then
  echo ""
  echo -e "${BLUE}자동 수정 시도 중...${NC}"
  echo ""

  # 권장 버전 설치
  recommended_version="latest"
  case $UI_LIBRARY in
    mui)
      recommended_version="^5.14.0"
      ;;
    antd)
      recommended_version="^5.12.0"
      ;;
    chakra)
      recommended_version="^2.8.0"
      ;;
  esac

  echo "  yarn add $PACKAGE_NAME@$recommended_version"
  yarn add "$PACKAGE_NAME@$recommended_version"

  echo ""
  echo -e "${GREEN}✓ 권장 버전 설치 완료${NC}"
  echo "  다시 호환성 검사를 실행해주세요"
fi

echo ""
exit $exit_code
