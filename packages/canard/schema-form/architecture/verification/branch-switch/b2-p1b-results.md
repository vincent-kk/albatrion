# B2-P1b — 비활성 값 지연 materialization 실험

**판정: 미채택 — 유효 창에서 메모 ≤3µs/쓰기 및 목표 두 행의 폭 밖 개선을 충족하지 못해 제품·DETAIL을 최신 B1 기준으로 복원하고 공개 계약8개를 남겼습니다.**

| 목표 총합 (µs) | A | B | A′ | 폭 | 판정 |
| --- | ---: | ---: | ---: | ---: | --- |
| switch-oneOf-80 | 502.666 | 466.917 | 422.500 | 190.417 | 개선 입증 없음 |
| switch-payload-12 | 810.750 | 883.812 | 877.792 | 331.083 | 개선 입증 없음 |

| 메모 단계 | inclusive 평균 A→B (µs/쓰기) | sampled 할당 A→B (KiB/쓰기) | B 쓰기 압축 |
| --- | ---: | ---: | ---: | ---: |
| switch-oneOf-80 | 22.828→26.136 | 22.255→24.666 | 6/300 |
| switch-payload-12 | 44.162→64.483 | 87.533→106.061 | 27/300 |

| 힙 (B/node, 5,001 노드·7표본) | A 중앙 | A 최대 | B 중앙 |
| --- | ---: | ---: | ---: | ---: |
| node | 1439.10 | 1890.78 | 1443.22 |
| bun | 2234.26 | 2234.75 | 2232.35 |

| 조건·검증 | 결과·범위 |
| --- | --- |
| 기준/후보 | 2026-10-27 UTC; A는 B1 병합 `422b1b195`의 런타임 `38e405d6b`, B는 `1ff87c4b3` |
| 시간 | 22행×A0 B0 … A9 B9; 프로세스당20예열·100표본; A앞5/A′뒤5/B전체10 최소값 중앙. 폭=max(\|A−A′\|,rangeA,rangeA′), 개선=B<A−폭 및 B<A′. 440 PID·순서·표본·SHA 재검증 |
| 품질/CPU | legacy0.16.1 호환18행 B10/A10 최소값 중앙비의 중앙 **1.00074968**, 허용0.95~1.05로 유효. 최초 CPU는 mediaanalysisd80.30%로 보류(정식표본0); 2분 뒤 재확인 및 실제 사전·종료5초 CPU는 초과0, 측정 재시도 없음 |
| 단계 | A/B 각 행3프로세스×100쓰기, 압축 포함 inclusive **산술평균**. 할당은 별도 sampling pass의 프로세스별 bytes/쓰기 중앙이며 압축 할당은 별도 분리하지 않음. 계측은 scratch AST 번들에만 적용 |
| TEST-073 주판정 | 인접10쌍 전체 A/B 각1,000표본의 1000/ms에 양측 Welch, 평균 처리량 감소>15% 및 p<.05: **회귀0/22행** |
| 보조 앞5·뒤5 | 각500표본 Welch. 뒤5 single-flat-1000 −32.61%(p=5.67e−52), 앞5 single-nested-d6-f4 −25.54%(1.80e−33), 뒤5 oneOf-80 −15.38%(1.37e−18), 앞5 leaf-gate-1000 −15.32%(2.08e−6): 회귀4건 |
| 비용·보유 한계 | 후보 첫 읽기 O(K log K)+미소비 Δ; cap 압축 O(L·depth+D), Δ가 일정할 때만 쓰기당 상각O(1). 외부 detached 토큰은 고유 옛 전체 기준 ΣL_b, metadata 대기 키는 O(M)을 보유할 수 있음. flat 힙은 잠복값·과거 토큰 보유를 직접 검증하지 않음 |
| 후보 검토·보정 | a04 1부 독립 검토 PASS; 이후 반복 읽기 journal 방문8→0 및 metadata 삭제 대기 키 회수(clear/pop) red/green. 최신 B1 위 표적15·build/typecheck 통과 후 측정. 두 보정도 최종 복원에서 제거. 소유자 지시로2부 독립 검토 생략 |
| 최종 복원 검사 | build/typecheck·lint 통과; unit515파일/3669+todo1, render/react18각128/760, production9/20, verify648/4473+todo1, Storybook100/251(10shard) 통과. delivery72/323+6/12 차이0, 네 번들B1바이트동일. 최초 unit4GB OOM 원본 보존 후 해당 unit만8GB직렬 재개; verify도8GB직렬 |
| Filid seam | 기존245지적(24error/221warning) 및 의존성 indeterminate로 전체FAIL·분석미완료. 새 test-record는4+4 exact, 변경 경로 지적0. 기존 경로는 미수정; 원본·진단 nextAction은 final-validation/filid/ |

| 원자료 | 경로·SHA |
| --- | --- |
| 판정·통계·단계·힙·CPU | `{scratch}/b2-p1b-20261027/post-review/judgement.json`, `measurement-paths.json`, `welch.json`, `heap-{node,bun}-{before,head}.log`, `quiet-window-attempt-{0,1}.json`, `quiet-end.json` |
| 시간 raw | `{scratch}/perf-runs/20261027T1415-1ff87c4-b2p1b-alternating` |
| 검증 분리 | 초기a04: `{scratch}/b2-p1b-20261027/functional-summary.json`; 최종복원: `{scratch}/b2-p1b-20261027/final-validation/` |
| A/B Node SHA | `92a8c340b5f78f311e7b852b4555119903d4829431804b85f3af4fd66bb305cf` / `9feab64a42df363f184341f53a10a33fb40bfc88c1f00a0bf4ff62fdf6400128` |
| 공개 d.ts SHA | 양쪽 `740dc55ca2f4f0503da3a7d6f968797a37cce7305e6d0d6b4d57c34e2b9158d6` 동일 |
