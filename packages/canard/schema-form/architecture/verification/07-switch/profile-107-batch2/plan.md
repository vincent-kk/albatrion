# 107라운드 batch2 실행 계획

Planning method: 사용자가 지정한 Step A → Step B → 105C-01 아홉 회차 판정 → 종단 검증.

기준은 깨끗한 stage-07 HEAD e27f4b3b7입니다. git 쓰기·설치·동시 실행은 하지 않습니다. 명령은 자연 종료하고 8분 이내로 나누며 진행 상태를 출력합니다. 번들·소스맵·계수용 복사본·캐시는 지정한 외부 bundles 디렉터리에 둡니다. 이 디렉터리의 파일은 각각 5 MB 이하입니다.

Step A는 blueprint·record·settle·behaviors의 객체 리터럴, spread, assign, rest 및 가변 키 생산을 TypeScript AST로 열거하고 외부 instrumented copy에서 nested-d5-f4·flat-500·sample-0의 mount 실행 수를 셉니다. 선택은 최대 셋, 실행 수 내림차순입니다. 실제 선택은 appendChildEntries의 binding spread 한 곳(1364/500/2)입니다. 기존 선언의 동일한 14개 키와 순서로 리터럴을 만듭니다. gates/order의 개별 소유와 개발 동결을 유지합니다.

각 변경은 다음 순서를 지킵니다.

1. 현재 기반의 소스·DETAIL·독립 시험을 외부 snapshot으로 보존하고 기반 생산 번들을 만듭니다.
2. DETAIL에 기존 계약의 구현 조건 및 속도·메모리 비용을 적습니다. source를 바꾸기 전에 key-order characterization 또는 work-count 시험을 실행합니다.
3. 변경 하나만 구현하고 59-schema 차등(collect 꺼짐/켜짐), 소유·동결, path-key 및 해당 변경의 관측 시험을 개발/운영 모드에서 실행합니다.
4. 변경 후보 번들을 만들고 동일 기반과 10개 행 × 9개 fresh-process 회차를 순차 비교합니다. 강제 GC는 clock 밖, warmup 20, 101 H/W 쌍, 표본별 실행 순서 교대, 기존 104 종단 clock을 유지합니다.
5. 909개 pooled paired H−W median의 canonical seed 101 / 1999 trials 99% 구간으로 105C-01 및 최소 크기 부록을 적용합니다. 개선 행 하나 이상과 회귀 행 없음이면 채택하며, 아니면 소스·DETAIL·시험 전부 복원합니다. 채택마다 측정 기반 대비 별도 patch와 파일/DETAIL 줄 manifest를 저장합니다.

첫 비교는 HEAD/HEAD A/A 아홉 회차이며 변경 전에 모든 10개 행을 완료합니다. 행은 nested·flat·oneOf-20·sample mount, sample·nested·oneOf-40 first/later입니다. 후속 변경은 채택 누적 기반에 다음 순서로 적용합니다.

- 1-binding-literal: appendChildEntries의 선언 복제에서 키 순서가 같은 고정 리터럴. 객체 수·필드 수·소속 배열 수는 같고 동적 키 복사를 제거합니다.
- 2-declaration-slice: collectDeclarations의 fragment와 declaration gates/order 네 복사를 packed-array slice로 대체. 별도 배열 소유·DFS·ID·진단·capability 순서는 같습니다. 원소 순회 비용을 native copy로 줄이고 배열 수는 같습니다.
- 3-object-assembly: local/extras/propertyKeys 없음, childEntries와 children 순서/길이/이름 동치일 때만 classic loop로 실제 결과·names·stable-shape·key count를 생성. Map/Set과 중간 membership 작업을 제거합니다. 부적합/중복/숫자 키/undefined emit은 기존 의미를 보존하고 fallback을 씁니다.
- 4-default-choices: options가 없는 경우 동일 frozen 기본 choices에 연결하되 effective별 WeakMap 등록과 options/propertyKeys 처리를 유지. effective당 기본 객체 및 freeze를 줄이고 모듈 상수 하나를 유지합니다. schema 결과의 폼 간 공유 및 S01은 변경하지 않습니다.

마지막으로 PKG에서 요청한 unit/render/react18, NODE_ENV=production production, tsc, eslint, legacy-isolation을 순차 실행합니다. runner/cache=false를 사용해 config 산출물을 저장하지 않고 기존 외부 optimizer symlink를 유지합니다. 허용 실패는 React 프로젝트마다 EVENT-070 두 건입니다. 보고서 remeasure-86c02.md에 Step A, A/A, 모든 변경의 10행 통계·판정·소유/속도/메모리·시험·patch 근거를 기록합니다.

## 계획 검토

grounded-only: 사용자 순서와 경계가 구현 방향을 결정합니다. 기존 104 clock, 107-batch adapter/summary/check와 패키지 시험 설정을 확인했습니다. 독립 위임 없이 현재 증거로 검토했습니다. 새 계약이나 소유 경계 변경은 없습니다. Step A에서 S01에 해당하는 가변 schema 결과는 제외합니다.
