# Text budget contract

## Requirements

encode와 decode가 동일한 UTF-8 16 MiB 예산을 적용합니다.

## API Contracts

checkTextLimit(text)는 한도 이내이면 반환하고, 문자열이 아니거나 UTF-8 byte가 한도를 넘으면 TypeError를 던집니다. 입력은 변경하지 않습니다. decoder에서는 JSON.parse 이전에 호출합니다.

## Acceptance Criteria

### text-budget — UTF-8 제한

- graph decoder의 oversized UTF-8 계약 검사와 모든 encoder roundtrip에서 검증합니다.

## Last Updated

직렬화 문자열의 크기 한도·측정 단위 또는 초과 처리 계약이 바뀔 때 갱신합니다.
