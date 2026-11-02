# 472라운드 닫기 — 코어 벤치와 원자료 정리

2026-11-03. 자료 정리 전 머리91f71e74c2c01684cdd6db207468698427936e0f와 삭제72a4816c06b60a9029cafa8542766202eb45d107을 구분합니다. 제품 엔진·버전·기존 측정 판정은 바꾸지 않았고, 새 원자료 없이 실행 장치와 보관 경로를 정리했습니다.

## 편집자 결정

- **472C-01 (핵심 벤치와 렌더 계수의 현재 실행 경로)**
  - 【추론】 소유자 원문92·93(`reviews/round-472-owner-answers.md:7-8`)에 따라 열 코어 사례의 생성 규칙·하네스·bench:form CLI와 권고용 browser-benchmark workflow를 남긴다. 기준판은 독립 설치·빌드하며 동일 바이트 대조군과 새 페이지를 교차 실행하고, 무효 그룹은 한 번 재시도한 뒤 void로 남긴다. 단계 전용 레인·C0–C7·stateVocabulary와 수동 render-trace·heap-snapshot 진단은 제거했으며 Node 벤치와 guard 입력 baseline.json은 유지한다. 제거된 CustomFieldRenderer 때문에 0이었던 렌더 계수는 현재 FieldRenderer로 복원했고 일반·가상화 각50·100·500필드의 입력·setValue 계수1.0과 기존 assert가 통과했다. 과거 수용 관문·FAIL을 이 권고 판정으로 대체하지 않는다.
- **472C-02 (삭제된 도구의 역사와 패키지 내부 정본)**
  - 【추론】 제거한 verification/design-optimization/tools의 단계 측정 도구는 자료 정리 전 커밋91f71e74c2c01684cdd6db207468698427936e0f에서, schema-form bench/scripts의 round-87-measure.mjs 등 패키지의 미사용 스크립트와 단계 장치는 패키지 정리 전 커밋2774c1ba08aa89a2bbe756a6f8520bcd40e0a7c4에서 읽는다. 과거 결과·원장 인용의 수치와 판정은 그대로이며 삭제된 경로의 현재 실행 가능성을 요구하지 않는다. runtimeCounts의 번들·렌더 계수 도구, 엔진 시험의 생성기 코퍼스, 브라우저 CPU 샘플러는 각 패키지 내부 정본을 사용한다. architecture 원본 코퍼스는 spike 기록과 함께 남고 코드의 유일한 의존 예외는 오류 코드 시험이 읽는 ledger/error.md다. README의 역사 결과 링크는 소유자의 문서 증류 때 다룬다.
- **472C-03 (문서와 인용 자료를 남긴 원자료 삭제)**
  - 【추론】 소유자 원문92·93(`reviews/round-472-owner-answers.md:7-8`)에 따라 architecture의 삭제 후보5349파일·360101086바이트를 삭제72a4816c06b60a9029cafa8542766202eb45d107로 반영했다. 모든 Markdown과 raw 밖 TXT·원장 검사 입력·인용된 결정 파일43개를 남겼으며 면적별 수치는 아래 표를 따른다. 정리 전 전체 이력은91f71e74c2c01684cdd6db207468698427936e0f에 있고 새 round raw는 만들지 않는다. 파일 삭제는 기존 결과의 취소나 재측정이 아니며 master 반영 전 스쿼시로 정리하면 이 단계의 최종 스냅샷에 약360MB를 싣지 않는다. 기존 master 이력을 다시 쓰지는 않는다.
- **472C-04 (검증 범위와 관찰한 한계)**
  - 【추론】 코어 양 CLI 모드의 두 사례 각3회와 나머지 여덟 사례, Node20 CI 경로·대조군 재시도·깨끗한 기준판 및 후보 부트스트랩이 통과했다. 일곱 schema-form 시험 프로젝트와 benchmark-form73·AJV6 133·AJV7 138·AJV8 343·시나리오45 및 정적 관문이 통과했다. 전체 Node sweep은 로컬11분44초와 첫 sweep7셀에서 중단을 승인받았고 두 셀 smoke와 compare assert로 경로를 확인했다. 동시 부하 중 Storybook IME timeout 한 건은 소스·시간 제한 변경 없이 단독 전체254통과로 재검증했다. GitHub workflow 원격 실행·새 속도 수용·push·게시·병합은 하지 않았다.

## 삭제량과 남긴 자료

| architecture 면적 | 삭제 파일 | 삭제 바이트 |
| --- | ---: | ---: |
| _archive | 174 | 1838112 |
| verification | 5175 | 358262974 |
| 합계 | 5349 | 360101086 |

- 그 밖의 면적은 삭제0입니다. 삭제 단계의 architecture 디스크 점유는396856→31044KB이며 파일 바이트 합과 디스크 할당량을 혼동하지 않습니다. benchmark-form에서는 별도로 역사 결과107파일·11250951바이트와 단계 장치를 제거했습니다.
- 보존한 문서·자료는1181파일·29327826바이트이며, 그 안에 삭제 후보에서 제외한 인용 결정43파일·877250바이트가 포함됩니다. 보호한 파일과 역사 링크의 원래 문장은 유지합니다.
- Git 이력 보관: https://github.com/vincent-kk/albatrion/tree/91f71e74c2c01684cdd6db207468698427936e0f/packages/canard/schema-form/architecture

## 원장 경로 검색과 보충 범위

- 구체적인 제거 대상은 LANDING-210의 round-87-measure.mjs, TEST-026의 render-trace.tsx입니다. SETTLE-017·TEST-027·TEST-029·TEST-073·TEST-080·TEST-092·TEST-094는 제거된 verification/design-optimization/tools 측정 장치를 이름으로 가리킵니다. 이 현행 아홉 행에만 472C-01·02를 보충합니다.
- 넓은 디렉터리 검색의 나머지 열세 행(LANDING-060·067·198·206·212, PROCESS-003·081, SETTLE-043, TEST-005·053·071·082·091)은 남아 있는 문서 디렉터리나 일반 README 언급입니다. 삭제된 구체 파일로 단정하지 않고 보충하지 않습니다. stageClosing·stateVocabulary의 명시 이름을 가진 별도 현행 행은 없었습니다.

## 마감 확인과 남은 것

- 원문92·93은 요청서 원문과 소유자 표·TSV를 대조합니다. 원장 검사는 삭제 시작 머리와 비교하여 새 불일치·해석 실패0, owner 전부 인용·문서 미인용66·기존 plan 문제1·token 잔여397을 유지하는지 확인합니다. 정확한 결과는 아래 기록 마감 결과에 적었습니다.
- 독립 관문은 코디네이터 전달 기준 P1·P2 없이 조건부 통과입니다. 남은 선언 예외·README 역사 링크를 밝히고 benchmark input의 남은 형 단언은 instanceof 검사로 교체하여 compare assert·lint·typecheck를 재검증했습니다.
- 패키지 버전·의존성·yarn.lock은 그대로입니다. 새 미사용 의존성은 확인되지 않았고, 구버전 alias는 Node 버전 비교가 동적으로 사용합니다. 원장 증류와 제거·최종 PR 검토·병합·릴리스는 Vincent가 맡습니다. 다음 라운드는473입니다.

## 기록 마감 결과

- 삭제 시작 머리91f71e74c2c01684cdd6db207468698427936e0f와 비교한 원장26검사는 모두 종료0이며, sup3756→3765는 이 라운드의 아홉 보충, owner786→788은 원문92·93 두 행, plan100→101은 요청서 추가 때문입니다. 다른 검사 출력은 모두 같습니다. 새 인용 불일치·해석 실패0·owner 미인용0·문서 미인용66·plan 기존 문제1·token2394/잔여397과 문장 열일곱 영역의 missing0·분류 오류0을 유지했습니다.
- 입력의 instanceof 검사 수정29d0b87b2에서 compare-frameworks --assert와 benchmark-form lint 경고0·전체 typecheck 종료0을 확인했습니다. 새 기계 경로·버전·의존성·lockfile 변경은 없고, 472라운드 새 raw 파일도 없습니다.
