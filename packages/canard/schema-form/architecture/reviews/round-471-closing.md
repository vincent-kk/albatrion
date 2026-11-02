# 471라운드 닫기 — 가드 읽기와 전체 컴파일 분리

2026-11-02. 기준1c44a823b, G의 설계 및 Amendment 1 계약을 선행 기록합니다. 구현 검증과 수용 측정은 구분하며 전체 수용 판정은 아직 없습니다.

## 편집자 결정

- **471C-01 (전체 컴파일의 첫 수요)**
  - 【추론】 소유자 원문65·67·79(`reviews/round-471-owner-answers.md:7-9`)에 따라 if 가드 읽기와 개발 가드 준비는 사본·가드 항목만 만들고 전체 검증을 컴파일하지 않는다. None은 전체 컴파일을 하지 않으며 OnRequest·OnChange는 다음 프레임 뒤 로드 슬롯 또는 먼저 온 명시적 validate·submit에서 같은 사본을 최초 한 번 컴파일한다. 가드는 정착 중 위치당 한 번 동기로 컴파일하고 전체 컴파일 실패는 기존 슬롯 sink·onError, validate 거부, submit onFailure로 보고한다.
- **471C-02 (선행 가드와 미컴파일 해제 계약)**
  - 【추론】 소유자 원문65·67·79(`reviews/round-471-owner-answers.md:7-9`)에 따라 Validator와 ValidatorPlugin의 compileGuard·release는 compile 실행 여부와 무관하게 엔진 소유 사본 루트를 받는다. compile·모든 compileGuard·release에는 동일 객체를 주며 플러그인은 필요한 루트 등록을 독립 수행하고 미등록 release는 무해하게 끝낸다. 배포 AJV6·7·8은 이 순서를 이미 지원하므로 구현을 바꾸지 않고 계약 시험과 문서를 보강한다.
- **471C-03 (지연 사이의 같은 id 해제와 오류 경계)**
  - 【추론】 소유자 원문67·79·89(`reviews/round-471-owner-answers.md:8-10`)의 기술 책임과 오류 검증 조건을 적용해 항목 생성과 최초 전체 컴파일 직전에 같은 $id의 참조 수0 루트를 퇴출한다. 사이에 경쟁 루트가 해제되어도 지연 컴파일이 성공하며 retained 충돌만 duplicateSchemaId로 분류한다. 기존 한 번 재시도·거부 정체성·중복 가드 실패 정리와 게이트별 GUARD_FAILED를 유지한다. 원문89의 병합 허가는 #520에만 속하며 이 변경은 별도 수용 측정과 소유자 판단을 기다린다.

## 검증과 남은 작업

- red 네 개, 수명·오류·재생성 특성화, M1–M4, 전체 관문을 verification/guard-compile에 기록합니다.
- 사전 oracle은 None 첫 paint109.0→72.3ms, OnChange108.9→73.5ms이며 구현 수용 수치가 아닙니다.
- 수용 측정은 네 셀20회, 동일 control, time to first verdict와 guard-free 회귀 한계를 사전 고정하고 별도 작업자가 실행합니다.
- push·게시·병합·버전 변경은 하지 않습니다.
