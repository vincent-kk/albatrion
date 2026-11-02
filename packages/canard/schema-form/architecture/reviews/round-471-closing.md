# 471라운드 닫기 — 가드 읽기와 전체 컴파일 분리

2026-11-02. 기준1202dd53b, G의 설계 및 Amendment 1 계약을 선행 기록합니다. 구현 검증과 수용 측정은 구분하며 전체 수용 측정은 사전등록9관문을 모두 통과해 ACCEPT입니다.

## 편집자 결정

- **471C-01 (전체 컴파일의 첫 수요)**
  - 【추론】 소유자 원문65·67·79(`reviews/round-471-owner-answers.md:7-9`)에 따라 if 가드 읽기와 개발 가드 준비는 사본·가드 항목만 만들고 전체 검증을 컴파일하지 않는다. None은 전체 컴파일을 하지 않으며 OnRequest·OnChange는 다음 프레임 뒤 로드 슬롯 또는 먼저 온 명시적 validate·submit에서 같은 사본을 최초 한 번 컴파일한다. 가드는 정착 중 위치당 한 번 동기로 컴파일하고 전체 컴파일 실패는 기존 슬롯 sink·onError, validate 거부, submit onFailure로 보고한다.
- **471C-02 (선행 가드와 미컴파일 해제 계약)**
  - 【추론】 소유자 원문65·67·79(`reviews/round-471-owner-answers.md:7-9`)에 따라 Validator와 ValidatorPlugin의 compileGuard·release는 compile 실행 여부와 무관하게 엔진 소유 사본 루트를 받는다. compile·모든 compileGuard·release에는 동일 객체를 주며 플러그인은 필요한 루트 등록을 독립 수행하고 미등록 release는 무해하게 끝낸다. 배포 AJV6·7·8은 이 순서를 이미 지원하므로 구현을 바꾸지 않고 계약 시험과 문서를 보강한다.
- **471C-03 (지연 사이의 같은 id 해제와 오류 경계)**
  - 【추론】 소유자 원문67·79·89(`reviews/round-471-owner-answers.md:8-10`)의 기술 책임과 오류 검증 조건을 적용해 항목 생성과 최초 전체 컴파일 직전에 같은 $id의 참조 수0 루트를 퇴출한다. 사이에 경쟁 루트가 해제되어도 지연 컴파일이 성공하며 retained 충돌만 duplicateSchemaId로 분류한다. 기존 한 번 재시도·거부 정체성·중복 가드 실패 정리와 게이트별 GUARD_FAILED를 유지한다. 원문89의 병합 허가는 #520에만 속하며 이 변경은 별도 사전등록 수용 측정에서 ACCEPT를 얻었고 병합은 소유자 판단에 따른다.

## 검증과 남은 작업

- red 네 개, 수명·오류·재생성 특성화, M1–M4, 전체 관문을 verification/guard-compile에 기록합니다.
- 사전 oracle은 None 첫 paint109.0→72.3ms, OnChange108.9→73.5ms이며 구현 수용 수치가 아닙니다.
- 수용 측정은 네 셀20회와 동일 control, 사전 고정한 time to first verdict·guard-free 회귀 한계를 적용하여 완료했고 ACCEPT입니다.
- push·게시·병합·버전 변경은 하지 않습니다.


## 구현 마감 관문

- 계약8a8bbb03a→구현f750262ea→시험 보강5b8e74804 순서입니다. 기준 red4/4, 특성화28/28, M1–M4 지정 실패와 바이트 복원, 일곱 Vitest 프로젝트·세 plugin·소비자45개·importModel2개 및 정적 관문이 통과했습니다. 개수·최초 실패와 환경 복구는 verification/guard-compile/results.md와 raw 증거를 따릅니다.
- 원장26검사 새 불일치0·인용 오류0·소유자786/786·기존 문서 미인용66 유지, FCA 새 finding/diagnostic0입니다. 기존 절대 FAIL·indeterminate와 경고는 그대로 보존합니다. 버전은 불변이고 기계 경로0을 확인합니다.
- 네 셀 pilot만 완료했고 guard-free OnChange control은 invalid로 남겼습니다. 전체20회 수용 측정은 네 그룹 모두 첫 시도 유효·9관문 true로 완료하여 G를 ACCEPT로 수용했습니다. 첫 verdict는 mount 시작부터 Form 첫 onValidate callback까지입니다.

## 전체 수용 결정

- **471C-04 (G 사전등록 전체 측정 수용)**
  - 【추론】 소유자 원문65·67·79(`reviews/round-471-owner-answers.md:7-9`)의 실측 이익 조건에 따라 기준1202dd53b·후보19798fed1의 사전등록 전체 측정을 ACCEPT로 수용한다. 네 그룹 모두 첫 시도 유효·9관문 true·재시도와 VOID 및 overlap0이며 if None의 first paint 절감은35.75ms·savingFraction0.33870203691105977, if OnChange는35.1499999165535ms·savingFraction0.3334914605728861이다. 첫 verdict 변화는-10.899999976158142ms, guard-free None과 OnChange의 변화는-0.6500000357627869ms와-0.2999999523162842ms로 각각 사전등록 한계 안이다. 원본 정밀도의 전체 표와 실행 결과는 verification/guard-compile/results.md에 보존하며 제품 코드와 버전은 더 바꾸지 않는다.

## 중복 가드 실패 복구 계약

- **471C-05 (Amendment 2·2a: 성공한 전체 컴파일의 가드 실패 정리)**
  - 【추론】 전체 스키마의 최초 컴파일과 한 번 재시도는 성공 직후 동일한 정리 함수를 호출하여 DUPLICATE_SCHEMA_ID_MESSAGE에 맞는 캐시된 가드 실패만 지운다. 다른 가드 실패와 성공한 가드 참조는 유지하며 전체 컴파일 실패는 아무 가드도 지우지 않는다. 같은 id 등록에서 던지는 사용자 정의 검증기의 교체 복구를 보장하고, 배포 AJV6·7·8은 충돌 시 같은 설정의 별도 인스턴스를 써 이 충돌을 피한다. None 및 OnRequest에서 첫 전체 검증 수요 전 중복 가드 실패가 남는 기존 한계는 이 단계에서 바꾸지 않는다.

## 등록 경쟁의 설명 가능한 동작 차이

- **471C-06 (등록에 실패한 retained 루트와 첫 전체 컴파일)**
  - 【추론】 등록 충돌을 던지는 검증기에서 실제 등록에 실패한 live 루트 C도 hasRetainedValidationRootId의 참조 수에 포함되므로 기준은 B의 재시도를 막는다. 후보의 최초 전체 컴파일은 해제된 A를 퇴출하고 빈 등록 자리에 B를 등록할 수 있다. 동시에 살아 있는 같은 id 루트 중 실제 등록을 얻는 쪽만 달라지고 양쪽 모두 등록 보유 루트는 최대 하나이므로 IR-8의 동시 mounted 충돌 유지 규칙에 어긋나지 않는 설명 가능한 차이로 수용한다. 배포 AJV6·7·8은 별도 인스턴스로 격리하며 이 차이는 충돌을 던지는 사용자 정의 검증기에 한정한다.

## Amendment 2·2a 구현 및 재검증 마감

- 최초전체compile 성공에서도중복id가드실패만정리하는공유helper를적용했습니다. 계약7ed29468c→수정d6f3e2d66→실제슬롯회귀0b0784869이며 일반가드실패·실패한전체compile·기존None및OnRequest첫수요전한계는유지합니다. AJV6·7·8은충돌시별도인스턴스로피하며,등록을거부하는검증기의최소회귀를기준green·수정전red·수정후green과M5로확인했습니다.
- 원래15·10시드재실행과네환경각2000쌍을완료했습니다.21개관측차이는모두471C-06의등록경쟁차이로분류했고미분류0이며,이전transient주입원본과실제결함의원인·최소재현·수정결과는구분해보존했습니다.
- M1–M6 지정실패와바이트복원,일곱Vitest프로젝트·importModel·세AJV플러그인·소비자시험및정적·빌드관문이통과했습니다. 원장26검사새불일치0·FCA새finding/diagnostic0·버전23불변이며기존FCA FAIL/indeterminate는유지합니다. 정밀개수와증거는verification/guard-compile/results.md를따릅니다.
- 최종8셀측정은pilot96페이지만완료했고조건부typing control한그룹은invalid로보존했습니다. 최종HEAD의20회재수용·입력회귀전체측정은후속작업자가수행하며기존471C-04 ACCEPT를최종제품의새판정으로대체하지않습니다. push·게시·병합·릴리스는하지않습니다.
