# C1 이탈 기본값 실험 — 제품 미채택, 기록으로 마감

사전등록 판정은 **CLOSE_C1_AS_RECORD**입니다. bulk 여섯 셀 중 errors의 setValue([])·clear() 두 셀만 필요한10%·1ms 및 control 차이 두 배 초과 조건을 함께 충족했습니다. 필요한 넷에 못 미쳤으므로 제품 변경을 채택하지 않습니다.0.5ms 초과 퇴보는 없으며 guard의 실제 변화는+0.0030625000000270575ms입니다. 판정 기준은 측정 뒤 바꾸지 않았습니다.

기준55055f65b52f952cd934eeec641314171e1ff253와 후보0c95807f49ab2065844f86bcf327c20e9084c00c를 비교했습니다. 이 기록 가지는 captureDetachedFieldNodeReads와 세 DETAIL 행을 기준 바이트로 복원하고 캐시 삽입0 시험을 제거합니다. 특성화14개와 fixture는 수정 없이 기준 제품에서 통과하여 유지합니다. 제거한 특성화는 없습니다. NODE-044·WRITE-085에는 현행 동작을 바꾸지 않는 마감 보충만 남습니다.

## 시도한 설계와 안전성 검증

v1은 이탈 기본값 읽기를 직접 파싱해 runtime 캐시를 우회했습니다. 공급된 undefined·이미 떼어진 fallback·즉시 원본 순회와 얕은 참조는 유지했습니다. agy Flash 설계 검토는 PASS WITH CONDITIONS였고 P1 계약 선행·P2 detached fallback 유지 조건을 적용했습니다. 첫 전체 unit에서 기존 oneOf-80 decoder0 계약과 충돌해 실패한 결과도 raw/unit-v1-failed.json.gz에 보존합니다.

Amendment 2는 분기 있는 청사진의 준비된 정적 문법을 runtime 인수 없이 재사용하고 분기 없는 경우만 직접 파싱했습니다. 기존 pointer-path-work 시험은 수정하지 않았습니다. 후보의 특성화14개와 focused20개가 통과했고, 기준/M1에서1500회 삽입으로 실패한 캐시 시험 및 M2 detached fallback 두 실패·M3 supplied undefined를 포함한 세 실패를 확인했습니다. 오류 getter가 이탈 중 원본 조상을 바꿔도 오류 읽기 뒤 기본값을 읽는 순서와 scalar/object 및 오류 배열 identity를 유지했습니다. watch·misfit·플래그·동결·WeakMap·다섯 호출 지점과 살아 있는 게터는 후보에서도 바꾸지 않았습니다.

후보0c95807f4에서 lint 경고0·typecheck·정식 build와 unit4244/render1018/react18 1016/storybook254/production21/verify-unit4288/verify-render1018 및 importModel2개가 통과했습니다. skip은 render7/react18 9/verify-render7, todo는 unit1/verify-unit1이며 실패0입니다. 원장 불일치0·doc-coverage66 유지, FCA 새 finding0·diagnostic0(기존 확인된 구조 실패26과 indeterminate 축 유지), 전체23manifest 버전 유지와 변경53파일의 경로0도 확인했습니다. 이 수치는 되돌리기 전 후보 관문이며 기존 raw 자료를 그대로 보존합니다.

## 실제 수용 측정과 사전등록 규칙

baseline·candidate·동일 코드 control은 각각 독립 VM에서 한 build·한 셀만 실행했고 N1000·12예열·60회였습니다. oneOf-80은 여섯 전환 각각을 표본으로 삼은 보호 셀입니다. control 차이는 max(0.3ms, baseline 중앙값의3%) 이하, 무효 시 그룹 전체 한 번 재시도, 두 번째 무효면 void입니다. bulk 여섯 중 넷 이상에서 중앙값10%와1ms 이상 절감하고 절감이 control 차이의 두 배보다 커야 하며 모든 셀의 중앙값 퇴보가0.5ms를 넘으면 안 됩니다.

총36프로세스가 종료0이고 전후·진행 중 경쟁 검사 목록은 모두 비었습니다. plain remove(0)와 errors clear()의 첫 control 무효 그룹만 전체 세 프로세스를 한 번 재시도했으며 이전 시도도 버리지 않았습니다. 최종 열 셀은 모두 유효합니다. quiet 검사 두 번째 표본은 CPU94.82% idle이었습니다. raw/acceptance-summary.json.gz, raw/acceptance-run-status.json.gz, raw/acceptance-attempts.json.gz, raw/acceptance-quiet-check.json.gz에 원본을 정규화해 보존하고 raw/acceptance-design-and-gate.json.gz에 설계 검토와 고정 관문을 둡니다.

아래 열 셀의 모든 값은 summary.json에서 반올림 없이 전사했습니다. savingFraction은 비율이며 시간은ms, guard의 단위는 전환 하나입니다.

| variant | operation | attempt | unit | baseline.median | baseline.p95 | candidate.median | candidate.p95 | control.median | control.p95 | controlGap | controlBand | controlVerdict | savingMs | savingFraction | aboveTwiceControlGap | bulk | bulkSavingVerdict | regressionMs | regressionLimitMs | regressionVerdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| plain | setValue([]) | 1 | one public operation | 6.220396000000051 | 8.367457999999942 | 5.446729000000005 | 8.865750000000048 | 6.461082999999917 | 8.467333000000053 | 0.2406869999998662 | 0.3 | VALID | 0.7736670000000458 | 0.12437584359581601 | true | true | FAIL | -0.7736670000000458 | 0.5 | PASS |
| plain | clear() | 1 | one public operation | 5.599978999999962 | 7.910250000000019 | 4.688791999999978 | 6.757541000000003 | 5.462270999999987 | 7.822499999999991 | 0.13770799999997507 | 0.3 | VALID | 0.911186999999984 | 0.16271257445786674 | true | true | FAIL | -0.911186999999984 | 0.5 | PASS |
| plain | remove(0) | 2 | one public operation | 5.160208500000067 | 7.2549999999999955 | 5.096771000000047 | 6.9375 | 5.381437500000061 | 7.470957999999882 | 0.2212289999999939 | 0.3 | VALID | 0.06343750000002046 | 0.012293592400388402 | false | false | NOT_BULK | -0.06343750000002046 | 0.5 | PASS |
| watch | setValue([]) | 1 | one public operation | 10.941874499999983 | 14.383166999999958 | 9.998166500000082 | 13.340165999999954 | 10.84660400000007 | 14.650667000000112 | 0.09527049999991277 | 0.3282562349999995 | VALID | 0.9437079999999014 | 0.08624737927673205 | true | true | FAIL | -0.9437079999999014 | 0.5 | PASS |
| watch | clear() | 1 | one public operation | 10.674854500000038 | 13.289416999999958 | 9.919833500000095 | 12.571332999999868 | 10.691958499999942 | 13.238875000000007 | 0.017103999999903863 | 0.32024563500000114 | VALID | 0.7550209999999424 | 0.070728926562881 | true | true | FAIL | -0.7550209999999424 | 0.5 | PASS |
| watch | remove(0) | 1 | one public operation | 25.82566650000001 | 32.452125000000024 | 25.635041500000057 | 31.757457999999588 | 25.685666999999853 | 32.252792 | 0.13999950000015815 | 0.7747699950000003 | VALID | 0.19062499999995453 | 0.00738122286214586 | false | false | NOT_BULK | -0.19062499999995453 | 0.5 | PASS |
| errors | setValue([]) | 1 | one public operation | 8.844624999999837 | 9.879709000000048 | 7.462020999999936 | 8.275499999999965 | 8.68060399999996 | 9.85370899999998 | 0.1640209999998774 | 0.3 | VALID | 1.3826039999999011 | 0.15632138163007778 | true | true | PASS | -1.3826039999999011 | 0.5 | PASS |
| errors | clear() | 2 | one public operation | 8.322938000000022 | 9.032124999999724 | 6.840853999999922 | 7.723583999999846 | 8.043645499999968 | 9.008249999999862 | 0.2792925000000537 | 0.3 | VALID | 1.4820840000000999 | 0.17807221440314658 | true | true | PASS | -1.4820840000000999 | 0.5 | PASS |
| errors | remove(0) | 1 | one public operation | 5.908999499999936 | 8.226667000000134 | 5.679583500000035 | 7.703666999999996 | 5.863333499999953 | 8.310666999999967 | 0.04566599999998289 | 0.3 | VALID | 0.22941599999990103 | 0.038824846744343694 | true | false | NOT_BULK | -0.22941599999990103 | 0.5 | PASS |
| guard | six-switches | 1 | one branch switch | 0.1250414999999805 | 0.5400000000000205 | 0.12810400000000755 | 0.5454169999999294 | 0.12529200000000174 | 0.5339579999999842 | 0.0002505000000212476 | 0.3 | VALID | -0.0030625000000270575 | -0.024491868699811944 | false | false | NOT_BULK | 0.0030625000000270575 | 0.5 | PASS |

plain/watch bulk는0.7550209999999424–0.9437079999999014ms 절감으로1ms 하한에 못 미쳤습니다. errors setValue([])는1.3826039999999011ms·0.15632138163007778, errors clear()는1.4820840000000999ms·0.17807221440314658로 통과했습니다. guard는+0.0030625000000270575ms로 퇴보 한도 안입니다. bulkPassingCells=2, verdict=CLOSE_C1_AS_RECORD를 그대로 적용합니다.

## 기록 가지의 최종 관문

제품 복원 뒤 특성화14개는 수정 없이 모두 통과했습니다. 최종 lint·typecheck·unit·verify-unit, 원장 기준 비교와 경로·버전 감사의 원본은 close- 접두 raw 자료에 추가합니다. 기존 구현 원본은 바꾸지 않습니다. src의 기준 대비 차이는 특성화와 fixture 두 파일뿐이어야 합니다. 최종 기록 가지 관문 수치는 검증 완료 후 아래에 덧붙입니다.

### 최종 기록 가지 검사 결과

lint 경고0·typecheck가 통과했습니다. unit4242통과·실패0·skip0·todo1, verify-unit4286통과·실패0·skip0·todo1이며 특성화14개는 수정 없이 통과했습니다(`raw/close-gate-summary.json.gz`, `raw/close-static-gates.json.gz`). 원장26검사는 종료0, 인용·보충·ref 불일치0, owner775/775 인용이고 doc-coverage 미인용66은 기준 로그와 동일합니다. 기존 token 누락397과 plan 비현행 참조1도 그대로입니다(`raw/close-ledger-comparison.json.gz`, `raw/close-ledger.json.gz`).

기준 대비 src diff는 특성화325줄과 fixture23줄의 두 파일뿐이며 제품 함수·세 DETAIL 행은 기준 바이트입니다. 기존 raw36파일의 SHA-256은 모두 유지했습니다(`raw/close-scope-proof.json.gz`). 전체23개 package.json의 버전은 변경0, schema-form0.16.0이며 압축 원본을 푼 변경64파일 경로 감사는0건입니다(`raw/close-version-audit.json.gz`, `raw/close-machine-path-audit.json.gz`). 이 마감에서는 성능·정식 빌드·다른 Vitest 프로젝트를 다시 실행하지 않았고 후보 단계의 관문과 구분했습니다. 새 커밋을 위에 더하며 push하지 않습니다.
