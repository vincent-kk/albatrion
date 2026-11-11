# FallbackComponents

## Requirements

사용자 렌더러 없이도 최소 HTML로 입력·오류를 표시합니다. 플러그인 선택이나 자체 폼 상태를 추가하지 않아 마지막 렌더 폴백이 다시 플러그인에 의존하는 순환을 막습니다.

## API Contracts

입력 동작과 오류 문구는 전달받은 props에 맡깁니다. 제목 연결은 [FormLabel](../Form/components/FormLabel/DETAIL.md)의 path·label: 규약을 따르며 branch의 legend도 같은 제목 id를 제공합니다. 입력 종류를 추측하여 별도 id 체계를 만들지 않습니다.

## Acceptance Criteria

### fallback-components-contract — 최소 표시 경계

루트는 Input만 렌더하여 불필요한 그룹을 중첩하지 않습니다. 아래 필드는 노드 strategy에 맞는 구조를 사용하고 배열 항목의 개별 label은 생략합니다. 잔여 키 전용 UI를 추가하지 않는 이유는 [FormError의 REACT-031](../Form/components/FormErrorMessage/DETAIL.md)에 둡니다. 커스텀 렌더러 없이도 같은 오류 배정·표시 의미를 유지합니다.

## Last Updated

기본 HTML의 접근성·그룹 구조 또는 상태 없는 폴백 경계가 바뀌면 갱신합니다.
