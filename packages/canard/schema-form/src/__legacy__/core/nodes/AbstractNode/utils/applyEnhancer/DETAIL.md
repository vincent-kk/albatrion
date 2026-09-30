# applyEnhancer

## Requirements

검증 대상 값은 폼 값에 검증 전용 항목을 더한 것이며, 폼 값이 들고 있지 않은 노드를 새로 갖지 않습니다.

## API Contracts

- `applyEnhancer(value, enhancer)`는 입력을 변경하지 않고, 항목이 쓰인 경로를 따라 복사한 값을 반환합니다. enhancer가 객체·배열이 아니거나 값이 객체·배열이 아니면 값을 그대로 반환합니다.
- enhancer의 잎 항목은 값의 같은 위치에 있는 객체에 쓰입니다. enhancer의 객체·배열 항목은 값이 그 키(배열은 인덱스)를 들고 있을 때만 재귀적으로 적용됩니다.

## Acceptance Criteria

### apply-enhancer-contract — 관찰 가능한 동작

- 값이 들고 있는 객체에는 enhancer의 잎 항목이 더해지고, 값의 다른 키는 그대로 남습니다.
- 값에 없는 키 아래의 enhancer 항목은 결과에 나타나지 않습니다: 생략된 객체도, 길이를 넘는 배열 인덱스의 항목도 생기지 않습니다.
- 값이 그 키에 `null`이나 원시값을 들고 있으면 그 값이 그대로 남습니다.
- 입력 값과 enhancer는 변경되지 않습니다.

## Last Updated

2026-09-20
