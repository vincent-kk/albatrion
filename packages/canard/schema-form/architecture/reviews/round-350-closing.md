# 350라운드 — 닫기 (묶음 3 settle PR #395 병합 90527e29b, 묶음 3 완료; 편집자 결정 셋; 후속 셋)

2026-10-15. 344라운드의 자율 진행 지시에 따라 원장 관리자가 묶음 3의 마지막 PR(settle 재구조화) #395를 검토하고 `feat/schema-form-08-review-and-perf`에 squash 병합했다(90527e29b). 내용: settle의 칸 11개(commit, compute, context, derivation, detached, gates, latent, load, settlement, transition, write)가 이루던 순환 하나를 파일 58개 이동으로 풀어 층이 진 organ으로(새 칸 input, scratch, dependencies, latentStore, output, loadValues, reset), `loadFieldNodeAtMount`·`arrangeFieldNodeItems`를 자식 fractal로, `settle/utils/pathIndex` → `pathStores`와 `settle/utils/paths` → `templatePaths`, settle·write·validation과 Form 조각 셋(FormCore·FormError·FormLabel)의 뿌리 type.ts → types/ 칸, 저장소 키 mismatches·mismatchMemo → misfits·misfitsMemo(시험 관측 키와 지역 변수까지), 같은 문장을 검사하던 시험 네 쌍 병합, record·write·validation과 Form 조각 여섯의 형 칸 유지 이유(H2 보고, 333·336라운드, 345~349라운드 결정). 검증은 agy 한 번, fairy08의 INTENT·DETAIL 대조(중간 다섯, 낮음 여덟), 원장 관리자 verifier(선언 486개 가운데 480개 동치·6개는 misfits 이름 변경만, 공개 94개와 engine 진입점 다섯 동일, 칸 순환 0, 합친 시험의 사례·단언 수 보존, unit 2422·production 20·render 725)였고, 보완 열한 가지는 b39241e86으로 같은 PR에 들어갔다. 이로써 묶음 3(blueprint #393, derive #394, settle #395)이 끝났다.

## 편집자 결정

- **350C-01 (PR #395 병합 기록과 settle 칸의 층 순서).**
  - 【추론】 묶음 3 settle PR #395를 90527e29b로 squash 병합했다. settle의 organ은 층이 진 순서(아래에서 위로 type, declarations, latentStore, input, paths, errors, output, gates, latent, controls, loadValues, compute, scratch, dependencies, detached, dispose, pathIndex, derivation, commit, transition, settlement, write, structure, 자식 arrangeFieldNodeItems, 자식 loadFieldNodeAtMount, reset, context, index)를 지키며 역방향 간선은 없다. latentStore는 저장 기본 단위를 제공하고 분배와 복원은 latent가 한다. settle/utils/pathIndex는 pathStores(런타임 경로 키 저장소 접근자), settle/utils/paths는 templatePaths(배열 템플릿 경로)로 이름을 바꾸고 engine/utils의 pathIndex(색인 자료 구조)·paths(식 의존 경로)는 그대로 둔다.
- **350C-02 (자식 fractal의 DETAIL은 자기 구현의 계약만 적는다).**
  - 【추론】 fractal을 자식으로 올릴 때 부모 DETAIL의 글머리를 통째로 옮기지 않는다. 자식 DETAIL은 자식 안에 구현이 있는 계약(내보냄과 자기 동작)만 적고, 부모에 구현이 남는 계약(arrangeFieldNodeItems의 경우 배치 안 동사·배치 끝 루트 한 번 정착·통째 교체 범위·UpdatePath 전달)은 부모 DETAIL에 남긴다. 계약 id의 표지는 시험이 있는 fractal의 DETAIL 절로 풀려야 하므로, 다른 fractal의 시험이 검사하는 절은 그 fractal의 DETAIL로 옮긴다(settle-disposal·settle-form-reset-errors는 write로).
- **350C-03 (묶음 3 뒤의 후속 셋).**
  - 【추론】 기록만 하는 후속 셋: 패키지 전체에서 여러 시험 파일이 함께 쓰는 계약 id 여덟(array-slots, dispatch-observers, dispatch-report, factory-single-path 24파일, surface-members, validation-lifetime, validation-route 등)에 349C-02를 적용하는 일은 정돈 트랙의 다음 문서 PR로 미룬다; settle/utils/gates/type.ts는 organ 안 주제 칸의 형 파일이라 336라운드 7번(fractal 뿌리의 type.ts)의 대상이 아니지만 같은 모양으로 맞출지는 그때 함께 본다; `global-errors.timing.test.ts`의 40ms 임계는 부하 아래서 가끔 실패하므로(verifier 관찰 40.34ms) 속도 루프에서 측정 창과 임계를 다시 본다. 속도 계획과 bench 스크립트의 옛 경로 셋(compute/selectChildren.ts, latent/getLatentOrder.ts, write/registerRecalculation.ts)은 fairy08의 최종 경로 PR이 고친다.

## 남은 것

fairy08: 속도 계획·bench 스크립트의 최종 경로 PR(묶음 3 셋의 이동 반영). 그 병합으로 밤의 구조 정리 토막이 끝나고, 소유자가 돌아와 `feat/schema-form-08-review-and-perf`를 리뷰한 뒤 속도 루프를 시작한다. 결정 대기열 54–57은 열려 있다(57은 CLAUDE.md 94행 경로 한 줄).

다음 라운드 번호는 351이다.
