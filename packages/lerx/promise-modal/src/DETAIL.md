# @lerx/promise-modal Specification

## Requirements

- React 컴포넌트 내외부에서 사용 가능한 promise 기반 모달 API 제공
- ModalProvider 마운트 전 호출은 prerender 큐에 적재되고, 마운트 시 동일한 Promise가 유효하게 연결되어야 함 (마운트 전 호출도 정상적으로 resolve 가능)
- alert (알림), confirm (확인), prompt (입력) 세 가지 모달 타입 지원
- ModalProvider를 통한 React 트리 초기화; 언마운트 시 initialize의 역연산으로 완전 정리
- 커스텀 컴포넌트 주입을 통한 UI 교체 가능
- 구독 기반 상태 관리로 모달 생명주기 제어

## API Contracts

- alert는 닫힐 때 void로 resolve하고, confirm은 확인 시 true·취소 시 false로 resolve합니다.
- prompt는 확인 시 입력값, 취소 시 null로 resolve합니다. returnOnCancel이 true면 취소 시점의 현재 입력값으로 resolve합니다. 내부 openHandler 오류는 reject로 전달합니다.
- 공개 ModalProvider는 BootstrapProvider 구현을 연결하며, 설정·배경·래퍼를 props로 받고 ref로 초기화 handle을 제공합니다.
- Provider 마운트 전에 만든 모달 요청도 동일한 Promise 연결을 유지해야 합니다. 구독과 지연 파괴·애니메이션 관련 훅은 모달 상태 및 생명주기를 소비하는 표면입니다.

## Acceptance Criteria

### modal-results — 모달별 완료 결과

- alert를 닫으면 Promise가 void로 완료되고, confirm은 확인과 취소를 각각 true와 false로 구분합니다.
- prompt는 확인 입력값과 취소 결과를 구분하며, returnOnCancel 설정에 따라 현재 입력값을 보존합니다.
- 내부 openHandler가 실패하면 호출자에게 거부된 Promise로 전달합니다.

### initialization-lifecycle — 초기화와 요청 연결

- Provider 마운트 전에 생성한 요청은 prerender 큐를 거쳐 마운트 후에도 원래 Promise로 완료됩니다.
- Provider 언마운트는 초기화의 역순으로 연결과 상태를 정리합니다.

### presentation-customization — 사용자 UI와 상태 구독

- 사용자 지정 컴포넌트로 표시 UI를 교체해도 모달 종류별 완료 결과 계약은 유지됩니다.
- 상태 변경은 구독을 통해 소비자에게 전달되며, 모달 표시와 완료의 수명주기를 연결합니다.

## Last Updated

2026-07-05
