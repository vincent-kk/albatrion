# C 이월 항목 결과 — U 완료, F·R 기록 종결, G 별도 설계

2026-11-02. 제품 기준1c44a823bdd9214ff79e2d60549c8a9c8339fb80, U 시험38986964247a3e3526e898881ec827da34001017, R의 B 기준5d1348ed16054efa1ec431945eb00472f4eef7f1입니다. 소유자 원문은 [470라운드 답변](../../reviews/round-470-owner-answers.md), 결정470C-01–04는 [닫기](../../reviews/round-470-closing.md)에 있습니다. 제품 구현·공개 API·버전은 바꾸지 않습니다.

## U — TEST-077 완료

union.write-paths.test.ts의 todo를 실제 writeFieldNodeInput/finishFieldNodeInput 시험으로 바꿨습니다. string-number union의 공백 포함 `' 42 '`는 입력 중 유지되고 마침 뒤 문자열 `'42'`가 되며 수 `42`는 수로 유지됩니다. 정상 대상 파일11통과, finishStringInput.ts:8의 node.source.trim()을 node.source로 바꾸면 TEST-077만 실패해10통과/1실패입니다. 원본 바이트와 SHA를 복원했습니다. 두 project의 기존 todo 각1개가0이 되어 총2개 감소했습니다. raw/union-*에 정상·변이·복원·환경 내역을 보존합니다.

## 전체 측정의 범위

기존 closing browser 하네스의 첫 입력 삽입 후 첫 rAF는 paint 기회의 대리 지표입니다. G·F는 각 build당3예열·20표본, R은3예열·30표본으로 각 Node/브라우저 실행을 순차 수행했습니다. 전체7프로세스는 exit0이며 실행 시간 합계는336.4809763431549초입니다(30초 quiet start 별도). 시작·중간 경쟁 관측은0, G 재시도·VOID는0입니다. CPU profile은 별도5회/build의 로컬 진단으로만 보존하고 이 저장소에는 넣지 않습니다. 파일럿 수치는 최종 판정에 합산하지 않습니다.

아래 표는 raw/full-summary.json.gz에서 반올림 없이 전사한 값이며 단위는ms, savingFraction은 비율입니다. p95는 nearest-rank입니다. long task의0은50ms 이상 API 관측이 없다는 뜻이고 CPU 시간이0이라는 뜻이 아닙니다.

## G — design-eligible, 구현은 별도 PR

| mode | build | n | firstPaint.median | firstPaint.p95 | longestTask.median | longestTask.p95 | wholeCompile.median | wholeCompile.p95 | compileGuard.median | compileGuard.p95 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| None | baseline | 20 | 109.0 | 112.59999990463257 | 108.0 | 112 | 34.14999997615814 | 36.39999997615814 | 6.299999952316284 | 6.600000023841858 |
| None | oracle | 20 | 72.30000001192093 | 76.60000002384186 | 71.0 | 76 | 0.0 | 0 | 16.55000001192093 | 17.700000047683716 |
| None | control | 20 | 109.35000002384186 | 113.59999990463257 | 107.5 | 112 | 34.050000071525574 | 36.199999928474426 | 6.199999988079071 | 6.700000047683716 |
| OnChange | baseline | 20 | 108.90000003576279 | 114.10000002384186 | 108.0 | 113 | 34.19999998807907 | 36.0 | 6.199999988079071 | 6.600000023841858 |
| OnChange | oracle | 20 | 73.5 | 77.10000002384186 | 72.0 | 76 | 0.0 | 0 | 17.05000001192093 | 18.200000047683716 |
| OnChange | control | 20 | 108.39999997615814 | 118.60000002384186 | 107.0 | 118 | 34.200000047683716 | 36.0 | 6.299999952316284 | 6.600000023841858 |

| mode | attempt | controlGap | controlBand | valid | savingMs | savingFraction | aboveTwiceControlGap | meetsAbsoluteAndRelativeGate | firstPaintRegression | longestTaskRegression | void |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| None | 1 | 0.3500000238418579 | 3.27 | true | 36.69999998807907 | 0.3366972475970557 | true | true | -36.69999998807907 | -37.0 | false |
| OnChange | 1 | 0.5000000596046448 | 3.2670000010728835 | true | 35.40000003576279 | 0.3250688707450635 | true | true | -35.40000003576279 | -36.0 | false |

None의 first paint 중앙값10% 및16.7ms 이상, control차이2배 엄격 초과 절감과 모든 셀 중앙값0.5ms 초과 퇴보 없음, control폭 max(0.3ms,3%)를 모두 충족했습니다. 무효 group은 한 번 재시도하고 다시 무효면 VOID라는 기준은 측정 뒤 바꾸지 않았으며 이번에는 재시도 없이 전부 유효합니다. summary의 GDecision은 **design-eligible**입니다.

두 mode·초기 kind(a/b)·세 build의12페이지에서 실제 guard 결과와 b→a 전환, 유효 minLength, root 값/오류, 첫 rAF 및 최종501개 필드 ID가 정확히 같았습니다. oracle None의 전체 compile은0회, OnChange는 paint 뒤1회와 validate가 유지됩니다. 기준 None의 paint 전 전체 compile 중앙값34.14999997615814ms와 guard6.299999952316284ms, oracle guard16.55000001192093ms를 분리해 기록합니다. guard 초기화와 scheduling도 달라지므로 전체 compile 시간만을 첫 paint 절감으로 단순 합산하지 않습니다. 공개 plugin 계약을 다루는 실제 구현은 별도 설계·별도 PR이며 현재 VALIDATE-044는 그대로입니다.

## F — 첫 프레임 분해, 기록으로 닫음

| phase | on.n | on.median | on.p95 | off.n | off.median | off.p95 |
| --- | --- | --- | --- | --- | --- | --- |
| preReact | 20 | 3.200000047683716 | 3.5 | 20 | 3.200000047683716 | 3.399999976158142 |
| engineTreeAndInitialMount | 20 | 11.0 | 12.399999976158142 | 20 | 11.600000023841858 | 12.600000023841858 |
| reactAndCommitExclusive | 20 | 26.950000047683716 | 29.700000047683716 | 20 | 132.04999989271164 | 142.5 |
| commitToFirstPaint | 20 | 0.5 | 1 | 20 | 1.1999999284744263 | 1.5 |
| sum | 20 | 41.84999996423721 | 46 | 20 | 147.55000001192093 | 159.60000002384186 |
| firstPaintedMs | 20 | 41.84999996423721 | 46 | 20 | 147.55000001192093 | 159.60000002384186 |

createRootLoad는 엔진 생성과 초기 mount를 포함하고 React/commit은 provider 시작부터 마지막 layout effect까지에서 엔진 구간을 뺀 wall-clock envelope입니다. 매 실행 네 구간 합은 harness 첫 rAF와0.01ms 안에서 같았습니다. 구간별 중앙값이나 p95끼리는 합하지 않습니다. 전체 reveal 뒤 모든 실행은3000 inputs·deferred0입니다.

1ms이면서 전체의10% 이상인 **제거 가능한** 비용을 입증하지 못했으므로 F는 기록으로 닫습니다. 큰 필수 구간의 시간 자체가 제거 가능하다는 근거는 아니며 이후 변경에는 별도 사전 oracle이 필요합니다.

## R — C5 비용 귀속, 기록으로 닫음

| phase | B.n | B.median | B.p95 | F.n | F.median | F.p95 |
| --- | --- | --- | --- | --- | --- | --- |
| blueprintInvalidation | 30 | 0.0 | 0.10000002384185791 | 30 | 0.0 | 0.10000002384185791 |
| createRootLoad | 30 | 2.600000023841858 | 4.5 | 30 | 2.699999988079071 | 3.100000023841858 |
| adopt | 30 | 0.5 | 0.8999999761581421 | 30 | 0.6000000238418579 | 0.7000000476837158 |
| mount | 30 | 1.8000000715255737 | 2.799999952316284 | 30 | 1.899999976158142 | 2.200000047683716 |
| retirementAndReports | 30 | 0.0 | 0 | 30 | 0.0 | 0 |
| scheduleLoadValidation | 30 | 0.0 | 0 | 30 | 0.0 | 0.10000002384185791 |
| attributedSync | 30 | 4.900000095367432 | 8.299999952316284 | 30 | 5.200000047683716 | 6.0000001192092896 |
| unattributedSync | 30 | 0.5 | 0.7000000476837158 | 30 | 0.5 | 0.7000000476837158 |
| callDuration | 30 | 5.449999988079071 | 8.899999976158142 | 30 | 5.799999952316284 | 6.5 |
| reactAndCommitEnvelope | 30 | 18.600000023841858 | 23.899999976158142 | 30 | 18.900000035762787 | 20.200000047683716 |
| callToReactCommit | 30 | 24.25 | 33.300000071525574 | 30 | 24.749999940395355 | 26.299999952316284 |
| nextPainted | 30 | 39.55000001192093 | 50.40000009536743 | 30 | 40.5 | 42.59999990463257 |

B에는 scheduleLoadValidation이 없으므로 그0은 부재를 뜻합니다. 다른0 관측은 시계 해상도 근처이며 비용0으로 해석하지 않습니다. B의 retirementAndReports는 이전 buffered-report loop이고 F의 은퇴 수명과 동일한 코드가 아닙니다. 후속 React commit은 동기 callDuration에 더하지 않습니다.

fresh page당 rebuild1회를 기존1초 slot·double-rAF·node 교체 검사로 측정하며 B/F·F/B를 교대했습니다. B/F callDuration 중앙값은5.449999988079071/5.799999952316284ms, p95는8.899999976158142/6.5ms입니다. 제거 가능한 비용이 확인되지 않아 R은 기록으로 닫습니다. 기존 C5의 bootstrap 상한1.118279575>1.10인 FAIL과 B11.625/F11.025ms 및 소유자 원문71의 "응 수용"은 보존합니다. 이번 귀속 표는 이전 창·규칙·판정을 재실행하거나 대체하지 않습니다.

## 보존과 마감 관문

raw의 summary·run-status·quiet-start·동등성 및 전체 cell JSON과 U 시험 JSON은 기계 경로만 가린 결정적 gzip입니다. artifacts.json이 원본/정규화/압축 SHA를 연결하며 숫자 표본은 바꾸지 않았습니다. measurement-tools와 instrumentation은 비식별화 증거로 보존하며 CPU profile payload는 커밋하지 않습니다. 마감의 lint·typecheck·unit·verify-unit·원장·경로·버전 검사 결과는 아래에 추가합니다.


## 기록 가지 마감 관문

| 관문 | 결과 |
| --- | --- |
| lint --max-warnings 0 | exit0·오류0·경고0 |
| typecheck | exit0 |
| unit | 647파일·4250통과·실패0·pending0·todo0 |
| verify-unit | 652파일·4294통과·실패0·pending0·todo0 |
| 원장26검사 | 기준1c44a823b 대비 새 불일치0·해석실패0 |
| 소유자 인용 | 778→782 전부 인용·미인용0 유지 |
| 기존 원장 경고 | tokens2394/누락397·plan 문제1·doc 미인용66 유지 |
| 기계 경로·버전 | gzip 해제·중첩 slash escape 감사0건·23개 manifest 버전 불변 |
| src·공개 API | 기준 대비 U 시험 한 파일·src/index.ts 불변 |

unit 종료를 확인하고 verify-unit을 단독 실행했습니다. U의 원래 todo를 제외한 skip 추가·삭제는 없습니다. 별도 build는 이번 기록을 위해 반복하지 않았으며 U의 정상/mutation·기존 정식 build·환경 복구 증거는 union 접두 raw에 남아 있습니다. 마감 실행 원본은 raw/gate-*.json.gz, 원장 전체 출력·비교는 raw/ledger-*.json.gz와 raw/ledger-comparison.json.gz, 경로·버전·source 범위는 raw/*audit.json.gz에 있습니다. CPU profile payload는 보존 대상에서 제외했습니다.
