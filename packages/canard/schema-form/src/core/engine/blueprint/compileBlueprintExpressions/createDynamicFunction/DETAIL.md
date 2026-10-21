# Expression compiler contract

## Requirements

표현식 컴파일러는 청사진이 소유하며, 문법과 실행 의미를 정의한다.

## API Contracts

- 경로 치환은 컴파일과 비실행 인식기가 같은 문자열과 의존 순서를 보도록 공용 함수로 분리합니다. 진입점이 명명 export하는 `substituteDependencyPaths`의 외부 소비자는 형제 인식기이며, 컴파일 함수 시그니처는 유지합니다.

- 이 fractal은 진단 문자열 포맷터 `formatCreateDynamicFunctionError`를 `utils/`에 소유하고, 상자 원소는 `helpers/error` 진입점에서 가져온다.
- 문자열이 아니거나 치환 후 비어 있는 식은 undefined를 반환한다. 경로는 주입된 PathManager에 최초 등장 순서대로 등록하고, 의존성 배열의 인덱스로 치환한다.
- 기존의 후행 세미콜론 처리와 boolean 강제 변환 규칙을 유지한다. 식을 컴파일하되 실행하지는 않는다.
- 실패하면 CREATE_DYNAMIC_FUNCTION 코드를 쓰고, 원문, 생성된 본문, 원인을 보존한다. 청사진 호출부가 작성된 스키마의 위치를 덧붙일 수 있어야 한다.
- DynamicFunction 타입의 정본은 이 컴파일러가 소유하며 index는 이를 내보내지 않는다. 진입점은 컴파일 함수와 경로 치환 함수만 이름으로 제공한다. core는 React나 옛 노드 구현에 의존하지 않는다.

## Acceptance Criteria

### create-dynamic-function-contract — 컴파일 의미의 보존

- 컴파일러, 본문 생성, return 변환 시험은 문법과 실행 의미를 검증한다.
- 같은 경로가 반복되면 같은 인덱스를 사용하고, 유효한 값 식과 boolean 식은 기존과 같은 결과를 낸다.
- 문법 오류를 숨기지 않으며, 청사진이 사용할 때는 schemaPath를 보존한다.

## Last Updated

2026-10-14 — 정돈-1; 정돈-2(2026-10-14).
