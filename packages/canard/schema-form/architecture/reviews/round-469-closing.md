# 469라운드 닫기 — 병합 라우팅과 구독 snapshot

2026-11-02. 기준55055f65b의 B 조사와 quiet oracle 측정에 따른 구현 기록입니다. 원문과 기존 보충·실패 증거는 보존합니다.

## 편집자 결정

- **469C-01 (한 검증 실행의 병합 대상 라우팅)**
  - 【추론】 소유자 원문65·79(`reviews/round-469-owner-answers.md:7-8`)에 따라 W4는 병합 target들을 한 번 라우팅한다. active 선언 Set과 각 issue 경로 해석은 실행마다 최대 한 번이며 기존 표시 맵·issue 순서·재사용 배열 참조·changed 합집합·combined 무효화·전역 오류와 stamp 정책을 유지한다. 범위는 target 객체 동일성 또는 / 경계의 엄격히 짧은 조상 target 경로이며 같은 경로의 다른 stale 키는 제외하고 더는 살지 않는 target도 기록한 경로를 따른다. 단일 대상 반환은 기존 changed이고 복수 대상은 순차 호출의 합집합이다. DR-13·DR-13-R2의 병합 요청 수명은 유지하며 결과 배정만 한 pass로 합친다. merged1000의 중앙값10%·1ms·control차이2배 초과 절감과 single-target 회귀 max(0.05ms,5%) 이하를 별도 측정해야 수용한다.
- **469C-02 (부모와 자식의 오류 구독 snapshot)**
  - 【추론】 W1은 부모와 현재 children 각각에 같은 mask의 구독을 두고 구독 시 전체 revision 문자열을 base로 한 번 계산한다. 비구독 getSnapshot은 기존 전체 문자열이고 구독 중은 version0이면 base, 이후 base와 # 및 증가 version이다. render와 subscribe 사이 변경은 최초 check로 잡으며 해제는 모든 리스너와 구독 상태를 정리한다. node·children·disabled 변경과 StrictMode·React18, raw 오류·표시·formatting의 기존 관측은 유지한다. C1000 전체 wave의 중앙값10%·1ms·control차이2배 초과 절감과200 single-child wave 및 비구독 읽기의 회귀 max(0.05ms,5%) 이하를 별도 측정해야 수용한다.

## 근거와 남은 것

- W4 oracle 상한은 merged1000의482.9ms 중123.5ms(25.6%), W1 snapshot 상한은 C1000 wave의24.99ms 중23.80ms입니다. 구현 절감 수치가 아니며 뒤의 전체 수락 측정과 구분합니다.
- W5는6.5%로10% 미달, W2는 절감 없음, W3는 가정한 제품 render 경로 부재, C2는1ms 미달로 기록합니다. A의 C1도 별도 측정으로 기록 종결되었습니다.
- 구현·mutation·전체 관문은 verification/lazy-memo에 보존하고 push·게시·병합·버전 변경은 하지 않습니다.

## 구현 검증 결과

- 제품 소스 a9dccbea9에서 기준 characterization18개·focused21개와 M1–M4의 지정 실패·복원을 확인했습니다. lint 경고0·typecheck·정식 build·전체7프로젝트·importModel이 통과했습니다. 정확한 개수와 최초 실패·수정·환경 복구는 `verification/lazy-memo/results.md` 및 raw 증거에 있습니다.
- #519의 a962c942d로 리베이스 후 원장 새 불일치0·미인용0 유지, FCA 새 finding/diagnostic0입니다. 기존 경고와 절대 FAIL/indeterminate는 보존합니다. 기계 경로0·23개 버전 불변입니다.
- 5셀15프로세스 파일럿 뒤 전체12 warmup·60 runs의5셀15프로세스가 exit0·97.282099초에 완료되었습니다. 모든 control이 첫 시도에서 유효했고 재시도·VOID·overlap 관측은0입니다. 사전 규칙에 따라 W4 ACCEPT·W1 ACCEPT이며 정확한5셀 수치·quiet check·run receipt는 `verification/lazy-memo/results.md`와 그 raw 증거에 보존합니다.

## 전체 수락과 독립 검토

- **469C-03 (제곱 비용 개선의 검증과 수락)**
  - 【추론】 소유자 원문87(`reviews/round-469-owner-answers.md:9`)의 오류 검증과 O(n^2) 우려에 따라 특성화·mutation·독립 gate·사전 등록 전체 측정을 수행했다. 기준55055f65b·후보c9634e1c3의5셀은12 warmup·60 runs,15프로세스 exit0,97.282099초이며 control은 전부 첫 시도에서 유효하고 재시도·VOID·overlap 관측은0이다. control 허용폭 max(0.3ms,3%), 주 셀1ms·10% 이상 및 control차이2배 초과 절감, 보조 셀 max(0.05ms,5%) 회귀 한계를 적용해 W4 ACCEPT·W1 ACCEPT로 수락한다. 정확한 수치·규칙·quiet check·run receipt는 verification/lazy-memo/results.md와 raw/accept-full-*에 보존한다. 제품 코드·버전은 더 바꾸지 않는다.
- 독립 gate는 agy Flash의 PASS WITH CONDITIONS이며 P1은 없었습니다. P2의 수락 결과 미기록은 이번 기록 갱신으로 해결합니다.
- P3의 subscribed flag 참조 계수 제안은 채택하지 않습니다. React는 같은 훅 인스턴스의 기존 구독을 정리한 뒤 다시 구독하며, 비구독 fallback은 기존 전체 revision 읽기이므로 현재 계약을 유지합니다.
- P3의 scope root short-circuit 제안도 채택하지 않습니다. merged 주 셀에서 이미99.6% 절감했으므로 추가 코드 변경을 하지 않습니다. 정확한 savingFraction은0.99648740449054입니다. 원문87 기록 제안은 위와 owner registry에 반영했습니다.
- 기록 마무리의 원장26검사는 a962c942d 대비 새 불일치0·owner778개 전부 인용·미인용0입니다. 기계 경로0·23개 버전 불변이며 c9634e1c3 대비 src diff가 비어 있습니다. 세부 영수증은 verification/lazy-memo/raw/records-final-*에 보존합니다.
