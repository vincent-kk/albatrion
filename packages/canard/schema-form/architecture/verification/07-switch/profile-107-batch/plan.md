# 107라운드 청사진 손질 실행 계획

Planning method: 사용자 변경 명세와 105C-01 최소 크기 부록, seiri 기본 방법.

- 기준은 HEAD `9d1ea600a1916e66b0389318d81e1c3ee23ad0d3`이며 git 쓰기·설치·병렬 측정은 금지합니다. 제품 수정은 `core/blueprint`의 기존 구현과 검증으로 제한합니다. 정착 설계·공개 계약·폼 간 결과 공유가 필요해지면 해당 항목을 STOP으로 보고합니다.
- 먼저 동일 HEAD 두 번들을 각각 생성하고 10행 각각 아홉 fresh process에서 A/A를 측정합니다. 정본은 `profile-104-owned/measure.mjs`의 production 판정 열이며 예열 20, 표본 101, 표본별 H/W 순서 교대, 시계 밖 강제 GC와 같은 큐의 종단 sentinel을 유지합니다. 번들·map·기존 optimizer cache는 지정된 저장소 밖 bundles 경로에만 둡니다. 생성 증거는 이 디렉터리에 파일당 5 MB 이하로 저장합니다.
- 변경 순서는 build-own, child-input-literal, path-strings, template-key입니다. 각 변경 전 현재 파일과 기반 번들을 보존하고 DETAIL의 현재 요구·비용을 먼저 갱신합니다. 단일 conjunction group에서 validationOnly 복제가 없는 경우 두 번의 native slice로 각각 소유 배열을 만들고, 나머지 membership 경로는 그대로 유지합니다. 자식 입력 literal은 무게이트 경로의 기존 필드 순서를 지킵니다. 경로는 이름의 escaped segment를 재사용합니다. template key는 encodeLeaf의 quote/backslash scan만 native 문자열 처리로 바꿉니다.
- 각 변경에 독립된 제거 작업 계수 시험을 먼저 추가하고 변경 전 실패를 확인합니다. 기존 59-schema differential(collect 끔/켬), owned-inline 소유·동결, path-key 시험을 development/production에서 실행합니다. 기존 주장·fixture·assertion은 수정하지 않습니다.
- 후보마다 10행 아홉 회차를 순차 실행하고 909개 H−W 짝 차이의 pooled 중앙값을 seed 101, 1999회 정본 bootstrap으로 집계합니다. 일부 행의 99% 하한이 0보다 크고 중앙값이 동일 행 A/A 중앙값보다 클 때 개선입니다. 회귀는 99% 상한이 0 아래이고 |중앙값|이 max(|A/A 중앙값|, 기반 중앙값×0.005)를 넘는 경우입니다. 개선 행이 있고 회귀 행이 없으면 채택합니다.
- 채택은 누적하고 측정 기반 대비 제품 소스·독립 계수 시험·DETAIL 변경만 개별 patch로 보존합니다. 기각은 해당 소스·시험·DETAIL을 모두 기반으로 복원합니다. 결과와 모든 행의 통계는 `remeasure-86c02.md`의 `## 107라운드 청사진 손질`에 기록합니다.
- 최종 검증은 패키지 디렉터리에서 지정된 unit/render/react18, production(NODE_ENV=production), tsc, eslint, legacy-isolation 명령입니다. 설치 방지와 순차 worker·cache 비활성·config runner 옵션만 추가합니다. EVENT-070의 React 프로젝트별 두 실패만 허용합니다. 모든 process는 스스로 종료하고 명령을 8분 미만으로 나눕니다.

## 계획 검토

grounded-only: 기존 buildNodes/populateNodeChildren/getTemplateKey, DETAIL·소유 경계, 104 정본 worker, 106 nine-run 집계 및 패키지 vite.config.ts를 직접 확인했습니다. 공개 경계 변경이나 새 구조 결정은 없고 독립 에이전트 위임 없이 실행합니다. 기존 `.vite` 링크는 지정 bundles 아래를 가리키며 configLoader runner가 저장소의 임시 config 번들을 방지합니다.
