# 469라운드 닫기 — 병합 라우팅과 구독 snapshot

2026-11-02. 기준55055f65b의 B 조사와 quiet oracle 측정에 따른 구현 기록입니다. 원문과 기존 보충·실패 증거는 보존합니다.

## 편집자 결정

- **469C-01 (한 검증 실행의 병합 대상 라우팅)**
  - 【추론】 소유자 원문65·79(`reviews/round-469-owner-answers.md:7-8`)에 따라 W4는 병합 target들을 한 번 라우팅한다. active 선언 Set과 각 issue 경로 해석은 실행마다 최대 한 번이며 기존 표시 맵·issue 순서·재사용 배열 참조·changed 합집합·combined 무효화·전역 오류와 stamp 정책을 유지한다. 범위는 target 객체 동일성 또는 / 경계의 엄격히 짧은 조상 target 경로이며 같은 경로의 다른 stale 키는 제외하고 더는 살지 않는 target도 기록한 경로를 따른다. 단일 대상 반환은 기존 changed이고 복수 대상은 순차 호출의 합집합이다. DR-13·DR-13-R2의 병합 요청 수명은 유지하며 결과 배정만 한 pass로 합친다. merged1000의 중앙값10%·1ms·control차이2배 초과 절감과 single-target 회귀 max(0.05ms,5%) 이하를 별도 측정해야 수용한다.
- **469C-02 (부모와 자식의 오류 구독 snapshot)**
  - 【추론】 W1은 부모와 현재 children 각각에 같은 mask의 구독을 두고 구독 시 전체 revision 문자열을 base로 한 번 계산한다. 비구독 getSnapshot은 기존 전체 문자열이고 구독 중은 version0이면 base, 이후 base와 # 및 증가 version이다. render와 subscribe 사이 변경은 최초 check로 잡으며 해제는 모든 리스너와 구독 상태를 정리한다. node·children·disabled 변경과 StrictMode·React18, raw 오류·표시·formatting의 기존 관측은 유지한다. C1000 전체 wave의 중앙값10%·1ms·control차이2배 초과 절감과200 single-child wave 및 비구독 읽기의 회귀 max(0.05ms,5%) 이하를 별도 측정해야 수용한다.

## 근거와 남은 것

- W4 oracle 상한은 merged1000의482.9ms 중123.5ms(25.6%), W1 snapshot 상한은 C1000 wave의24.99ms 중23.80ms입니다. 구현 절감 수치가 아니며 두 후보별로 수용 측정합니다.
- W5는6.5%로10% 미달, W2는 절감 없음, W3는 가정한 제품 render 경로 부재, C2는1ms 미달로 기록합니다. A의 C1도 별도 측정으로 기록 종결되었습니다.
- 구현·mutation·전체 관문은 verification/lazy-memo에 보존하고 push·게시·병합·버전 변경은 하지 않습니다.
