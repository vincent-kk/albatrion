---
description: 종합 코드 리뷰 수행 (Skills 기반)
tags: [review, quality, security, skills]
---

# Comprehensive Code Review (Skills 기반)

이 커맨드는 **code_quality_reviewer Skill**을 활용한 종합 코드 리뷰를 수행합니다.

## 📋 실행되는 Skill

### code_quality_reviewer
종합 코드 품질 검토:
- 🔍 **코드 품질**: 가독성, 유지보수성, 구조 설계
- ⚡ **성능**: 복잡도 분석, 최적화 기회
- 🛡️ **보안**: SQL 인젝션, XSS, 인증/인가
- 🧪 **테스트**: 커버리지, 엣지 케이스
- 📝 **문서화**: 주석, API 문서, README

## 🎯 검토 우선순위

**P0 (긴급):** 보안 취약점, 데이터 손실 위험
**P1 (높음):** 기능 버그, 성능 저하
**P2 (중간):** 코드 스타일, 주석 누락
**P3 (낮음):** 변수명 개선, 포맷팅

## 📊 출력

- 📋 종합 코드 리뷰 보고서 (마크다운)
- 🎯 우선순위별 액션 아이템
- 📈 품질 점수 및 개선 추이
- 💡 구체적 개선 제안 (코드 예시 포함)

---

**실행 지시:**

다음 순서로 종합 코드 리뷰를 수행해주세요:

1. **code_quality_reviewer 스킬 활성화**
   - `.claude/skills/code_quality_reviewer/knowledge/quality_rules.yaml` 로드
   - 리뷰 대상 파일 분석 (현재 파일 또는 지정된 파일/디렉토리)

2. **자동 검증 실행**
   - `.claude/skills/code_quality_reviewer/tools/complexity_checker.ts` 실행
   - 함수 길이, 중첩 깊이, 순환 복잡도 계산
   - 네이밍 컨벤션 검증
   - 타입 커버리지 확인 (TypeScript)

3. **수동 검토 수행**
   - **보안**: SQL 인젝션, XSS, 민감 정보 노출
   - **논리**: 알고리즘 정확성, 엣지 케이스 처리
   - **비즈니스**: 도메인 규칙 준수
   - **UX**: 에러 메시지 명확성

4. **보고서 생성**
   ```markdown
   # 코드 리뷰 보고서

   ## 📊 전체 평가: B+ (85/100)

   ### ✅ 통과 항목
   - 가독성, 타입 안전성

   ### ⚠️ 개선 필요
   1. [P1] 함수 길이 35줄 → 15줄 이하로 분리
   2. [P2] 테스트 커버리지 55% → 80% 목표

   ### 🔴 즉시 수정
   - [P0] SQL 인젝션 취약점 발견 (auth.ts:15)

   ## 🎯 우선순위 액션 아이템
   ...
   ```

5. **긍정적 피드백**
   - 잘 작성된 부분 강조
   - 개선된 부분 인정

**참고:**
- Skills: `.claude/skills/code_quality_reviewer/`
- 품질 규칙: `.claude/skills/code_quality_reviewer/knowledge/quality_rules.yaml`
- 기존 가이드: `.cursor/rules/code-review.mdc` (참고용)
