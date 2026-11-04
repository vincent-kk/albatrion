# 470라운드 닫기 — 이월 측정과 union trim 시험

2026-11-02. 기준1c44a823bdd9214ff79e2d60549c8a9c8339fb80, U 시험38986964247a3e3526e898881ec827da34001017입니다. 사전 등록 전체 측정과 코디네이터의 판정에 따라 U는 완료, F·R은 기록 종결, G는 별도 설계·PR 진행 가능으로 기록합니다. 제품 파일·버전은 바꾸지 않습니다.

## 편집자 결정

- **470C-01 (union 문자열 입력 마침의 시험 완료)**
  - 【추론】 소유자 원문84(`reviews/round-470-owner-answers.md:10`)에 따라 TEST-077의 stage 07 trim todo를 실제 입력·마침 통로 시험으로 교체했다. string-number union의 공백 포함 문자열은 입력 중 그대로이고 마침 뒤에도 문자열인 채 trim되며 수 값은 유지된다. 시험 커밋38986964247a3e3526e898881ec827da34001017에서 정상11통과·todo0, finishStringInput.ts:8의 trim 제거는 새 TEST-077 한 건만 실패했고 원본 바이트를 복원했다. unit과 verify-unit에서 각각todo1이 없어져 합계2개 감소했다. 이 보충은 기존 WRITE-083·TEST-077의 검증 완료이며 제품 동작·공개 API 변경이 아니다.
- **470C-02 (대형 배열 첫 프레임의 분해 기록 종결)**
  - 【추론】 소유자 원문65·79(`reviews/round-470-owner-answers.md:7,9`)의 실측 이익 조건으로 F를 기록으로 닫는다. array-1000 on/off 각20회에서 첫 paint 중앙값은41.85/147.55ms이며 on의 pre-React3.2·엔진 생성과 초기 mount11.0·React render/commit26.95·commit부터 첫 paint0.5ms를 관측했다. 각 구간의 중앙값은 서로 더하지 않고 실행별 합을 harness 첫 paint와 대조했다.1ms이면서 전체의10% 이상인 제거 가능한 비용을 입증하지 못했으므로 제품 변경을 하지 않으며 이후 변경은 별도 사전 등록 oracle을 거친다. 정확한 수치와 p95는 verification/carried-items/results.md 및 raw/full-summary.json.gz에 보존한다.
- **470C-03 (C5 rebuild 비용의 귀속 기록 종결)**
  - 【추론】 소유자 원문71·79(`reviews/round-470-owner-answers.md:8-9`)에 따라 R을 기록으로 닫으며 기존 C5 FAIL과 그 수용은 유지한다. 기준B5d1348ed16054efa1ec431945eb00472f4eef7f1과 F1c44a823bdd9214ff79e2d60549c8a9c8339fb80를 교대해 각각30회 rebuild한 callDuration 중앙값/p95는B5.45/8.9ms·F5.8/6.5ms다. 생성2.6/2.7·채택0.5/0.6·mount1.8/1.9ms이고 무효화·은퇴·검증 예약은 시계 해상도 근처다. 제거 가능한 비용을 확인하지 못했으며 이 측정은 단계별 비용 귀속일 뿐 기존 C5 bootstrap 창을 재실행하거나 판정을 대체한 것이 아니다. 원문71의 수용은 그대로이고 별도5회씩의 CPU profile은 로컬 진단으로만 보존한다.
- **470C-04 (if guard 전체 컴파일의 별도 설계 자격)**
  - 【추론】 소유자 원문65·79(`reviews/round-470-owner-answers.md:7,9`)에 따라 G는 사전 등록 규칙을 통과해 별도 설계와 PR로 진행 가능하다. 각 build20회에서 None 첫 paint109.0→72.3ms로36.7ms·33.7% 절감했고 control차이는0.35ms다. OnChange108.9→73.5ms로35.4ms·32.5% 절감했으며 guard·유효 스키마·렌더 필드의12페이지 동등성도 통과했다. None의10% 및16.7ms 이상·control차이2배 초과 절감과 모든 측정 셀의 중앙값0.5ms 초과 퇴보 없음, control폭 max(0.3ms,3%)를 충족했고 재시도·VOID는0이다. 기준의 paint 전 전체 compile34.15ms·guard compile6.3ms와 oracle guard약16.6ms를 기록한다. oracle의 compile/compileGuard 순서는 공개 검증기 플러그인 계약에 영향을 주므로 이 라운드는 측정과 판정만 기록하고 VALIDATE-044의 제품 계약은 유지한다.

## 근거와 남은 것

- 네 항목의 요청·측정 설계·검증은 plan/carried-items, 정확한 전체 수치와 비식별화 gzip 증거는 verification/carried-items에 있습니다. 파일럿은 준비 단계 자료이고 최종 판단은 전체 실행에 근거합니다.
- G의 실제 구현과 계약 검토는 별도 단계·별도 PR이며 이번 가지의 제품 diff는 U 시험 하나뿐입니다. F·R의 큰 필수 구간 자체를 제거 가능한 비용으로 해석하지 않습니다.
- 버전·릴리스·상위 PR 처리는 원문79대로 Vincent가 맡습니다. 이 워커는 push·PR 게시·병합을 하지 않습니다.
- 다음 라운드 번호는471이다.

## 기록 가지 마감 관문

- lint 오류·경고0·typecheck exit0, unit647파일4250통과·verify-unit652파일4294통과·실패/pending/todo0입니다.
- 원장26검사는1c44a823b 대비 새 불일치0·해석실패0이며 owner778→782 전부 인용, 미인용0과 doc 미인용66을 유지합니다. 기존 tokens397·plan 문제1은 보존합니다.
- gzip 해제·중첩 escape 경로 감사0,23개 manifest 버전 불변, src diff는 기존 U 시험 한 파일뿐입니다. 제품·공개 API는 그대로이며 정확한 원본은 verification/carried-items/raw에 있습니다.
