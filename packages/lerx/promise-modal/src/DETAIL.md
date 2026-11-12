# @lerx/promise-modal

## Requirements

Promise는 최초 확인·취소 또는 렌더 오류로 한 번만 확정됩니다. 렌더 오류는 거부로 전달되며 일반 취소는 종류별 취소 값으로 완료됩니다.

## API Contracts

- closeOnEscape는 모달 Esc, 모달 배경 클릭, Provider Esc, Provider 배경 클릭 순으로 상속합니다. Esc는 보이는 미확정 최상위만 취소합니다.
- dimmed 모달은 포커스 이동·복원과 기본 Tab 가두기·스크롤 잠금 및 조상 경로 형제 inert를 제공합니다. trapFocus와 lockScroll은 기본 true이고 dimmed false에는 적용하지 않습니다. 사용자 프레임은 접근 가능한 이름·설명·역할을 제공합니다.

- useDestroyAfter는 지속시간과 Provider 폴백이 바뀔 때만 정규화하여 동일 입력의 부모 리렌더가 경고를 반복하지 않습니다.
- 설정 병합은 기본값, Provider, useModal 설정, 호출 인자 순이며 undefined는 상속하고 0과 false는 보존합니다.
- duration은 밀리초 숫자 또는 ms·s 문자열을 받으며 공개 설정 훅은 정규화된 ms 문자열을 제공합니다. 설정 훅과 파괴 훅은 모달 트리 안에서만 사용하며 밖에서는 사용 위치를 설명하는 오류를 냅니다.
- prompt 확인은 현재 값 그대로이며 입력이 없으면 undefined입니다. 일반 취소만 null이고 returnOnCancel 취소는 현재 값입니다.
- 공개 Props 타입은 애플리케이션 래퍼의 선언에 사용합니다. 프레임은 group·subtype·settled를 받고 alert 내용도 context를 받습니다.
- alive는 저장소에 남는 생명주기, visible은 경로에 따른 표시, settled는 결과 확정을 나타냅니다. 경로 숨김은 결과를 확정하지 않습니다.
- Provider 해제는 열린 노드를 마이크로태스크 뒤 취소하며 같은 커밋의 재마운트는 입력값과 Promise를 유지합니다. DOM 없는 가져오기와 서버 렌더는 가능합니다. 서버에서는 모달 열기 함수를 호출하지 않습니다.
- 개수와 상태 구독은 Provider 밖에서도 저장소를 읽습니다. 개수 판별 함수는 읽기 전용 ModalNodeView를 받으며 refreshKey를 사용하지 않습니다.

## Acceptance Criteria

### modal-results — 모달별 완료 결과

- alert·confirm·prompt의 확인·취소 결과가 유지되고 렌더 오류는 거부됩니다.

### initialization-lifecycle — 초기화와 요청 연결

- 마운트 전 요청과 같은 커밋 재마운트는 원래 Promise와 입력값을 유지합니다.

### presentation-customization — 사용자 UI와 상태 구독

- 사용자 프레임과 Provider 밖 구독은 현재 노드 상태를 반영합니다.

## Last Updated

공개 결과·설정·초기화 또는 표시 계약이 바뀔 때 갱신합니다.
