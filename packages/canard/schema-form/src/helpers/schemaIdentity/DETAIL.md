# Authored schema identity

## Requirements

WRITE-043 requires ordered structural equality for JSON and reference identity for atoms.

## API Contracts

The comparator short-circuits identical references. Otherwise it traverses ordered own keys of arrays and plain objects. React elements and ref-shaped objects are atomic.

- 판정 함수 셋(`isRenderAtomic`·`isRenderTerminal`·`isSameSchema`)은 `utils/`에 있습니다. 뿌리에는 문서·진입점·형 동반 파일(`type.ts`)만 둡니다(filid zero-peer-file).

## Acceptance Criteria

### ordered-equality — Ordered structural equality

- Reordered object properties differ; identical component references remain equal.

## Last Updated

Contract basis: WRITE-043, execution ADR D7.
