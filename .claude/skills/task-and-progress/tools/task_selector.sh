#!/bin/bash
# task_selector.sh - ToT 기반 작업 선택 스크립트

# 사용법: task_selector.sh <plan_file> [explicit_task_id]
# 예시: task_selector.sh .tasks/feature_20250117/03_plan.md
# 예시: task_selector.sh .tasks/feature_20250117/03_plan.md 2.4

set -euo pipefail

PLAN_FILE="${1:-}"
EXPLICIT_TASK="${2:-}"

if [[ -z "$PLAN_FILE" ]]; then
  echo "Error: Plan file required"
  echo "Usage: $0 <plan_file> [explicit_task_id]"
  exit 1
fi

if [[ ! -f "$PLAN_FILE" ]]; then
  echo "Error: Plan file not found: $PLAN_FILE"
  exit 1
fi

# =============================================================================
# Step 1: 후보 생성 (Candidate Generation)
# =============================================================================

generate_candidates() {
  local plan_file="$1"
  local explicit_task="$2"

  # 명시적 요청이 있으면 해당 작업만 반환
  if [[ -n "$explicit_task" ]]; then
    echo "$explicit_task"
    return
  fi

  # 03_plan.md에서 미완료 required 작업 추출
  # 형식: - [ ] 작업 X.Y: 제목
  # 제외: - [ ]* 작업 X.Y: 제목 (optional)

  grep -E '^- \[ \] 작업 [0-9]+\.[0-9]+:' "$plan_file" | \
    awk '{print $3}' | \
    sed 's/:$//' | \
    head -5  # 최대 5개 후보
}

# =============================================================================
# Step 2: 평가 (Evaluation)
# =============================================================================

evaluate_task() {
  local task_id="$1"
  local plan_file="$2"

  # 의존성 충족 (30점)
  local dep_score=30  # TODO: 실제 의존성 체크 로직

  # 우선순위/영향도 (25점)
  local priority_score=18  # TODO: Priority 태그 파싱

  # 복잡도 vs 시간 (20점)
  local complexity_score=15  # TODO: 예상 시간 파싱

  # Phase 정렬 (15점)
  local phase_score=15  # TODO: 현재 Phase와 비교

  # 리스크 수준 (10점)
  local risk_score=10  # TODO: Risk 레벨 파싱

  # 총점 계산
  local total=$((dep_score + priority_score + complexity_score + phase_score + risk_score))

  echo "$total"
}

# =============================================================================
# Step 3: 선택 (Selection)
# =============================================================================

select_best_task() {
  local plan_file="$1"
  shift
  local candidates=("$@")

  local best_task=""
  local best_score=0

  for task_id in "${candidates[@]}"; do
    local score
    score=$(evaluate_task "$task_id" "$plan_file")

    if [[ $score -gt $best_score ]]; then
      best_score=$score
      best_task=$task_id
    fi
  done

  echo "$best_task"
}

# =============================================================================
# Step 4: 작업 상세 추출
# =============================================================================

extract_task_details() {
  local task_id="$1"
  local plan_file="$2"

  # 작업 섹션 추출 (작업 ID부터 다음 작업 또는 Phase까지)
  awk -v task="$task_id" '
    /^- \[ \] 작업/ {
      if ($3 == task":") {
        in_section=1
      } else if (in_section) {
        exit
      }
    }
    in_section && /^##/ { exit }
    in_section { print }
  ' "$plan_file"
}

# =============================================================================
# Main Execution
# =============================================================================

main() {
  local plan_file="$1"
  local explicit_task="${2:-}"

  echo "=== ToT Task Selector ===" >&2
  echo "Plan file: $plan_file" >&2

  # Step 1: 후보 생성
  mapfile -t candidates < <(generate_candidates "$plan_file" "$explicit_task")

  if [[ ${#candidates[@]} -eq 0 ]]; then
    echo "No available tasks found." >&2
    echo "All tasks completed or blocked by dependencies." >&2
    exit 0
  fi

  echo "Candidates: ${candidates[*]}" >&2

  # Step 2 & 3: 평가 및 선택
  local selected_task
  selected_task=$(select_best_task "$plan_file" "${candidates[@]}")

  echo "Selected task: $selected_task" >&2
  echo "" >&2

  # Step 4: 작업 상세 출력
  extract_task_details "$selected_task" "$plan_file"
}

# 스크립트 실행
main "$PLAN_FILE" "$EXPLICIT_TASK"

# =============================================================================
# TODO: 향후 개선사항
# =============================================================================
#
# 1. 실제 의존성 파싱 및 검증
#    - "Dependencies: X.Y, Z.W" 태그 파싱
#    - 선행 작업 완료 여부 확인
#
# 2. 5-Field 파싱
#    - 파일, 내용, 방법, 완료, Requirements 추출
#    - JSON 형식으로 출력
#
# 3. 복잡도 추정
#    - "방법" 필드 길이 기반 추정
#    - 파일 개수 기반 추정
#
# 4. Phase 감지
#    - 현재 진행 중인 Phase 식별
#    - Phase 간 의존성 검증
#
# 5. Optional 작업 필터링
#    - [ ]* 패턴 감지 및 자동 스킵
#    - 명시적 요청 시 실행
#
