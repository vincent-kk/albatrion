# booleanBehavior 계약

## Requirements

- 의존 방향은 `blueprint·record·behaviors/utils < booleanBehavior < behaviors 뿌리 < SchemaNode`입니다. 이 종류 fractal은 정착·겉면·레거시를 가져오지 않으며 경계 예외가 없습니다(NODE-009·016, LANDING-159).

## API Contracts

- 진입점은 `booleanBehavior: Behavior`를 이름으로 내보냅니다. 여덟 칸은 공통 순서(`arrange`는 공유 거부 칸, 36C-01)이며 `type: 'boolean'`, `strategy: 'terminal'`, 자식 선언은 공유 빈 결과입니다(NODE-002·006·047).
- `interpret`는 boolean을 그대로 두고 정확한 `"true"`·`"false"`, 수 `1`·`0`·`-0`만 공통 parse로 바꿉니다. 공백 있는 문자열·`"1"`·다른 수·`null`은 변환하지 않습니다. 순수·무예외·멱등이며 변환 불가 시 입력 참조를 유지합니다(WRITE-075·084·093).
- `assemble`은 터미널 원본을 `local`로, `project`는 메모된 방출 정책의 결과를 `emit`으로 내고 원본을 바꾸지 않습니다(NODE-006, VALUE-002).

## Acceptance Criteria

### boolean-row — 제한 변환

- 허용 표의 다섯 입력 표현만 변환되고 나머지는 원본 그대로 남습니다(WRITE-075·093).

## Last Updated

2026-09-29
