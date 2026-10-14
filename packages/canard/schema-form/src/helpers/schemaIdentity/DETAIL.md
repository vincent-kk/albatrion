# Authored schema identity

## Requirements

WRITE-043은 JSON 값에는 순서를 따지는 구조적 동등성을, 원자 값에는 참조 동일성을 요구한다.

## API Contracts

비교 함수는 참조가 같으면 바로 같다고 판정한다. 그렇지 않으면 배열과 일반 객체의 own key를 순서대로 순회한다. React 엘리먼트와 ref 형태의 객체는 더 쪼개지 않는 원자 값으로 본다.

- 판정 함수 셋(`isRenderAtomic`·`isRenderTerminal`·`isSameSchema`)은 `utils/`에 있다. 뿌리에는 문서·진입점·형 동반 파일(`type.ts`)만 둔다(filid zero-peer-file).

## Acceptance Criteria

### ordered-equality — Ordered structural equality

- 객체 프로퍼티 순서가 다르면 서로 다른 스키마로 본다. 같은 컴포넌트 참조는 계속 같은 것으로 본다.

## Last Updated

계약 근거: WRITE-043, execution ADR D7.
