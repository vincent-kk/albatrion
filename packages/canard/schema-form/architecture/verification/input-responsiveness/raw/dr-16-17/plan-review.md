# DR-16 / DR-17 독립 계획 검토

판정: **rework-required**. 구현 방향과 요구된 회귀·mutation 범위는 타당하지만, 실행 전에 아래 증거 게이트와 기록 경로를 구체화하셔야 합니다.

검토 기준은 dispatch brief, 외부 `defect-round.md` Amendments 13/15, 저장소·패키지 CLAUDE.md와 `.claude/rules/`입니다. `git rev-parse HEAD`는 지정 BASE `960bcd79a09c2d54a1f0e0585f3ba3544a287e34`와 일치했고 `git status --short`는 비어 있었습니다. 테스트·빌드·FCA 검사는 실행하지 않았으며 저장소 파일은 수정하지 않았습니다.

## 보완하실 사항

1. **R1 · P2 — 모든 CHECK가 아직 정의되지 않은 검사기에 의존합니다.** `gates.md:8,12,16,23,27,34`는 모두 외부 `check-evidence.py`를 호출하지만, 해당 디렉터리의 `ls -la` 결과에는 `plan.md`, `gates.md`, `adr.md`만 있습니다. `plan.md`에도 검사기 작성 단계나 입력·assertion 계약이 없습니다. 현재 상태로는 G1–G6의 EXPECT가 실제 조건을 만족할 때만 출력되는지 검토할 수 없습니다. 검사기를 만드는 선행 단계와 증거 파일 스키마를 확정하고, red/guard의 정확한 test ID·실패 이유, mutation별 named test 및 복원 hash, 공식 명령의 종료 상태·프로젝트별 실측 수, BASE 비교를 실제로 assert하도록 명시해 주십시오. 단순 JSON 존재나 요약의 성공 문자열로 통과시키면 안 됩니다. 근거: `seiri:review-plan` §3 및 `execute/references/gates-format.md` Authoring rules 2·3·7·8. 공식 명령은 패키지 `package.json`의 `build`, `test:verify`, `test:production`과 `vite.config.ts`의 프로젝트 설정에서 확인했습니다. 제안 파일의 부재 자체가 아니라, CHECK를 성립시키는 생성·판정 계약이 빠진 점이 문제입니다.

2. **R2 · P2 — sup-insert에 필요한 영구 결정 문서가 변경면에서 빠졌습니다.** `plan.md:56–57`은 draft를 삽입한다고만 정합니다. 실제 `architecture/ledger/checks/sup-insert.mjs:10–18,29`는 closing 문서의 `- 【추론】 ...` 행을 읽고, 전달받은 문서 경로와 행 번호를 보충에 그대로 기록합니다. 외부 brief의 blockquote를 직접 입력할 수 없고, 절대 scratch 경로를 전달하면 machine-path 감사 조건에도 어긋납니다. `architecture/ledger/checks/README.md:46–47`의 관례에 따라 영구 closing 문서의 저장소 상대 경로·결정 행·owner quote 75의 보존 위치를 확정하고, 외부 JSON insertion plan 및 실행 cwd를 계획에 넣어 주십시오. 이 문서는 영구 기록이고 실행 scratch와 구분됩니다. 기존 fetcher나 sup-insert 구현을 바꿀 이유는 없습니다.

3. **R3 · P2 — 외부 소비자가 생기는 organ의 유지 사유 선언이 명시되지 않았습니다.** `plan.md:17–20`과 `adr.md:9`의 배치는 Amendment 15가 직접 지정하므로 승인된 방향입니다. 다만 `forEachFailureLeaf.ts`는 write의 organ에 남고 provider가 core 진입점 경유로 소비합니다. `.claude/rules/filid_fractal-boundaries.md` §5와 `filid_module-documents.md` §7은 이런 배치의 유지 사유를 소유 DETAIL의 `Boundary Exemptions`에 요구합니다. 현재 `core/engine/write/DETAIL.md:136` 아래에는 `types/` 선언만 있습니다. 일반적인 DETAIL 갱신 약속(`plan.md:43,58`)에 그치지 말고, 해당 파일을 대상으로 `Consumers: entry-point`, `Direct import: not allowed`, Amendment 15에 따른 write 소유·binding-only 재수출의 이유를 기록하는 단계를 추가해 주십시오. helper를 옮기거나 provider의 직접 내부 import를 허용할 필요는 없습니다.

## 확인된 정합성

- DR-16의 nested instance 전용 판정, nonempty/dense/own-index, seen·handlerFailures 우선, 재방문 unknown, optional chaining, 별도 iterative traversal은 Amendment 13과 일치합니다. 공개 render/react18 probe의 A·B 기록 및 outer bundle identity, submit 회귀, unknown·malformed·cycle·plain·missing-details guard와 요구 mutation이 계획에 있습니다. **50,000-deep known nesting만 승인된 red로 취급하며 최종 onError 0회는 유지합니다.** 다른 guard 재분류는 발견하지 못했습니다.
- DR-17의 named re-export 경로, provider의 core 경계 소비, engine→React 의존 금지, 두 raw sink 채널 보존, capture 판정과 leaf 전달의 분리는 승인된 설계입니다. `rg`로 확인한 FormRoot·flush·reset·slot·capture catch 및 engine의 네 sink 호출이 모두 계획에 포함되어 있습니다. 새 helper들은 제안 파일이며, BASE에 없다는 점은 결함이 아닙니다.
- native validator·compile·degraded submit, load derived, reset, validate wave, caller-owned submit·slot·OnChange guard와 leaf 순서·cycle·malformed·prototype·deep 사례, Amendment 15의 mutation 목록이 모두 대응됩니다. 구현 시 실제 검출과 identity 정밀도는 G1–G3 증거로 확인해야 합니다.
- 코디네이터의 `msg_72ad224caa6f` 보완을 반영한 `plan.md:36`의 DR-17 공개 host-path 시험은 `src/__tests__/e2e/hostFailureLeaves.render.test.tsx`에서 패키지 진입점을 소비합니다. DR-16 probe는 Amendment 13 지정대로 FormErrorContext 내부에, leaf 단위 시험은 report organ 내부에, reset 시험은 RootNodeContext 내부에 두므로 배치 방향이 타당합니다. DR-16 probe의 import는 기존 reference처럼 각 모듈 진입점을 사용하셔야 합니다.
- owner quote 75, superseding supplement 대상, 현행 계약 수정, handler-first 순서·render boundary 예외·malformed slot 동작, 순차 전체 검사, 버전 유지·no push·산출물 분리 조건이 반영되어 있습니다. 외부 `gates.md`는 사용자의 저장소 scratch 금지에 따른 승인된 대체이므로 `.seiri/tasks` 부재는 finding이 아닙니다. 승인 범위를 벗어난 새 제품 동작 결정은 발견하지 못했습니다.

위 항목만 보완한 뒤 변경된 주장에 한정해 재검토하시면 됩니다. 이 판정은 독립적인 정적 계획 검토 결과이며, 구현의 green이나 성능을 인증하지 않습니다.

검토 종료 전 추가된 `plan.md:76–79`의 Review checkpoint도 확인했습니다. 테스트 준비와 공유 경계 구현의 시작 시점을 구분한 추가이며 위 finding을 해소하거나 변경하지 않습니다.

검토본 SHA-256: `plan.md=565f152d4e69dd4367bb0f8aab09141b1ee88f7f3104a518537afeb94c21c4a6`, `gates.md=8696d6baec02da2b4f65944544fedbafdacf7836b9fa0c578ca2e4d07912c361`, `adr.md=db07400ef9cc1b2374bf9e03fed09af20a02bbb78b47f2f1d2211d86b7433172`.
