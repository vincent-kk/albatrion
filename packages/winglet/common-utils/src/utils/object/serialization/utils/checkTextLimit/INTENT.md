# checkTextLimit

## Purpose

serialization 내부의 UTF-8 텍스트 자원 제한을 소유합니다.

## Conventions

byte buffer를 추가 할당하지 않고 문자열을 순회합니다. package API가 아닙니다.

## Boundaries

### Always do

- surrogate pair와 lone surrogate의 UTF-8 비용을 구분합니다.
- 한도 초과를 TypeError로 거부합니다.

### Ask first

- 16 MiB 한도 또는 byte 계산 의미론을 변경합니다.

### Never do

- 문자열 내용을 변경하거나 truncation합니다.
