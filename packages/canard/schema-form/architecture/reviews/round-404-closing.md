# 404라운드 — 닫기 (L3 가설 (b) items 없는 배열의 끝 덧붙임 지름길 PR #417 병합 8e35b01fc; 편집자 결정 하나)

2026-10-18. 403라운드에 이어 L3 구현 묶음의 둘째 가설 L3-b(items 없는 배열의 push·insert(N) 지름길)를 같은 Orca 조정 루프로 구현·검증·병합했다. codex 워커가 같은 작업 폴더에서 a55071005 기준 가지를 만들어 DETAIL 세 곳을 먼저 고치고(settle, arrangeFieldNodeItems, arrayBehavior) 런타임 여섯 파일(+61/−23줄)과 새 시험 열여섯 개로 PR #417을 열었다. 작업 중 워커가 물은 범위 확장(출력 합성 assembleArray의 append 힌트도 템플릿과 노드를 요구해 접두 전체를 다시 걷는다; 분기 약 10줄과 그 DETAIL 문장)은 같은 비효율 하나를 지우는 범위 안이라 허용했다. agy 워커(gemini-4-argon-medium)가 읽기 전용으로 여섯 축을 검증해 수정 사항 없이 통과 판정을 냈다. 전체 시험의 첫 실행에서 Storybook IME 장면 둘이 클릭 시간 초과로 실패했으나 소스·시험 변경 없이 단독과 전체 재실행에서 모두 통과해 환경 경합으로 본다. 측정 원본 표는 작업 폴더의 verification/perf-optimization/l3b-array-append-results.md에 미커밋으로 있고 요지는 PR #417 본문에 있다.

## 편집자 결정

- **404C-01 (L3-b 병합: items와 prefixItems가 모두 없는 정적 branch 배열의 단독 push·insert(N)은 덧붙인 칸 하나만 보고 접두를 다시 증명하지 않으며, 관측은 일반 길과 같다 — GOAL-011·VALUE-002·WRITE-013·SETTLE-042·NODE-051·NODE-052의 적용).**
  - 【추론】 PR #417을 8e35b01fc로 squash 병합했다(커밋 a8a71b65f DETAIL 셋, 67964cc21 코드·시험). 비효율 하나: items 템플릿이 없는 배열은 값이 모두 선언 밖 값이라 끝 덧붙임 한 번마다 정적 꼬리 자격(admitsStaticArrayTail)이 extras 존재·템플릿 없음·children 길이 불일치로 거절되어 일반 길로 갔고, 일반 길과 출력 합성이 모든 칸을 걸어 접두를 다시 증명했다(getItemEntries 8천에서 24,003회 ≈ 3N). 바뀐 자격 한 문장: items와 prefixItems가 모두 없고 children이 비어 있으며 선언 밖 값의 길이가 아이템 수와 같은 정적 branch 배열의 단독 push 또는 insert(N) 한 번은 지름길 자격을 얻어 덧붙인 칸 하나만 다루고, 출력 합성은 이전 배열에 값 하나를 이은 새 배열을 만든다; 템플릿이 있는 배열의 기존 경로, prefixItems 튜플 꼬리, 게이트·통째 raw·배치·로드·자동 쓰기, 가운데 insert·remove·pop의 배제는 그대로다. 유지한 관측(측정 문서 A3 절 목록 전부): 호스트·루트 값의 새 참조와 local 얕은 사본, 새 로드 스냅숏 배열·끝 값·defaultValue, 선언 밖 값의 새 배열과 이전 배열 불변(VALUE-002), 빈→빈 children의 새 배열 참조와 UpdateChildren·revision 증가(400C-01의 미결 기록 범위 유지), 호스트·조상 UpdateValue 차례·비트·payload와 루트 onChange 한 번·검증 요청 한 번, itemCount·길이 상태·omitTrailing 제외, 호출자 입력 불변(WRITE-013). compareArrayAppend 픽스처가 지름길 트리와 일반 길을 강제한 트리의 전체 배달 기록을 대조해 차이 0이다. 효과(Node v26.12.0·Bun 1.4.3, 두 바퀴 중앙값): 8천 push Node 0.653→0.063 ms(−90.4%)·Bun 1.816→0.080 ms(−95.6%), insert(N) Node 0.663→0.072 ms(−89.2%)·Bun 1.774→0.081 ms(−95.5%); getItemEntries는 1천 3,003→2회, 8천 24,003→2회로 수용 사본을 제외한 작업이 상수다(시험은 상한 4회로 단언). 남은 시간(8천 기준 Node 약 0.06~0.07 ms, 1천의 약 2~3배)은 SETTLE-042·VALUE-002·WRITE-085가 요구하는 세 배열(local, 로드 스냅숏, 선언 밖 값)의 O(N) 얕은 사본이며 수용 후보 목록에 둔다. 캐시·전역 상태는 없고 ArrayAppendProof 형의 선택 속성 추가는 공개 표면으로 재수출되지 않는다. 기존 시험 기대값 변경 0건. 388라운드 허용 범위의 실험이며 소유자가 되돌릴 수 있다. remove(0)의 extras 인식 splice는 여전히 범위 밖이다.

## 남은 것

다음은 400C-04 순서의 (a) 선언 밖 키의 defineProperty 복사를 writeObjectKey 일반 대입으로. 선행 조건은 측정 문서 마감 후보 표의 L3-a 행(__proto__ 보호·선언 키 거름·Merge·키 순서·호출자 입력 불변 유지)과 400C-03(__proto__ 보호를 시험으로 고정하고 VALUE-002 보충으로 적음). 그다음 (c) 두 번 비교 제거, (d) staticSpec 넘김. 소유자 물음 없음.

다음 라운드 번호는 405이다.
