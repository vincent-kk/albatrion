# 병합 routing과 구독 snapshot의 내부 경계

## 맥락

동일 검증 결과를 대상별로 되풀이 라우팅하고 React snapshot마다 모든 자식 revision을 합치는 비용이 측정되었습니다.

## 결정

validation의 기존 관문 함수는 대상 모음을 받아 실행 한 번의 scope를 소유합니다. hook의 store는 hooks fractal의 사설 organ 함수로 남으며 core나 공개 index에 추가하지 않습니다.

## 이유와 대안

runtime 전역 active-id 메모는 commit 외의 갱신 수명을 추가하므로 선택하지 않습니다. path 동일성만의 scope는 stale 키를 잘못 포함하므로 target identity와 엄격한 조상을 분리합니다. revision 합계를 매번 만드는 구현은 통지당 선형 비용이므로 구독 수명 base/version으로 한정합니다.

## 결과

패키지 공개 표면·노드·runtime 고정 필드는 늘지 않습니다. 내부 호출자는 모음을 넘기고 store는 unsubscribe 때 수명을 끝냅니다.
