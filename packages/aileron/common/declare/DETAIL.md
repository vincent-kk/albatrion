# 공유 선언 계약

## Requirements

프로젝트의 기존 TypeScript 경로 별칭으로 공유하는 수기 선언을 소유합니다. 함수 호출·데이터 형상·nullable 여부·표현 단위의 타입이며 JavaScript를 실행하거나 전역 상태를 만들지 않습니다.

## API Contracts

index.d.ts는 실제 선언 전용 진입점입니다. 이름을 명시한 type re-export로 표면을 열거하고 각 심볼은 기존 카테고리의 같은 선언을 가리킵니다. 명시적인 선언 파일 주소는 이 디렉터리가 런타임 모듈을 로드하는 곳이라는 오해를 막습니다.

adapter의 선언 entry override와 카테고리별 d.ts peer 허용은 이 평면 타입 라이브러리의 실제 구조를 나타냅니다. 구현 코드용 root 규칙을 피하려고 새 runtime facade를 만들지 않습니다.

## Acceptance Criteria

### declaration-surface — 타입의 정체성을 유지합니다

- 진입점의 exported name과 최종 원본 선언 심볼은 이전과 같습니다.
- 모든 재수출은 type-only이며 런타임 산출물을 만들지 않습니다.

### dependency-direction — 공통 선언은 소비자에 의존하지 않습니다

- 카테고리는 이 모듈의 공통 타입만 조합하며 제품 패키지 구현을 읽지 않습니다.

## Last Updated

공개 타입 이름·제네릭·선언 진입점 또는 소유 경계가 바뀔 때 갱신합니다.
