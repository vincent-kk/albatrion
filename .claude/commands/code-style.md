---
description: 코드 작성 가이드라인 적용 및 품질 검토
tags: [code-quality, review, skills]
---

# Code Style & Quality (Skills 기반)

이 커맨드는 **code_quality_reviewer Skill**을 활용하여 코드 품질을 검토합니다.

## 📋 실행되는 Skill

### code_quality_reviewer
코드 품질 가이드라인 검증:
- ✅ **가독성**: 함수 길이, 변수명, 순차적 흐름
- ✅ **성능**: 시간 복잡도, 반복 최소화
- ✅ **명시적 I/O**: 타입 선언, 주석 품질
- ✅ **유지보수성**: 구조 설계, 테스트 커버리지
- ✅ **에러 처리**: 예외 처리, 로깅
- ✅ **협업**: 코드 리뷰 준비도, 커밋 메시지

## 🔧 검증 도구

1. **complexity_checker.ts** - 순환 복잡도 자동 분석
2. **quality_rules.yaml** - 구조화된 품질 규칙
3. **ESLint/Prettier** - 스타일 일관성

## 📊 출력

- 코드 품질 보고서 (마크다운)
- 우선순위 액션 아이템
- 복잡도 분석 결과

---

**실행 지시:**

다음 순서로 코드 품질을 검토해주세요:

1. **code_quality_reviewer 스킬 활성화**
   - `.claude/skills/code_quality_reviewer/knowledge/quality_rules.yaml` 로드
   - 현재 파일 또는 지정된 파일 분석
   - `.claude/skills/code_quality_reviewer/tools/complexity_checker.ts` 실행

2. **검토 수행**
   - 가독성 검증 (함수 길이 ≤15줄, 중첩 깊이 ≤3)
   - 성능 검토 (O(n) 복잡도 권장)
   - 네이밍 검증 (camelCase, PascalCase 일관성)
   - 타입 커버리지 확인 (TypeScript)
   - 에러 처리 검토

3. **보고서 생성**
   - 전체 평가 점수 (A-F)
   - 통과/개선 필요/즉시 수정 항목
   - 우선순위 액션 아이템 (P0-P3)
   - 코드 예시 (Good/Bad)

**참고:**
- Skills 구조: `.claude/skills/code_quality_reviewer/`
- 품질 규칙: `.claude/skills/code_quality_reviewer/knowledge/quality_rules.yaml`
- 기존 가이드라인: `.cursor/rules/code-writing-guidelines.mdc` (참고용)
