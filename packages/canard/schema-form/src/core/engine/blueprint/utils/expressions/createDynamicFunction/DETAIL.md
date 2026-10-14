# Expression compiler contract

## Requirements

표현식 컴파일러는 청사진이 소유하며 문법과 실행 의미를 정의합니다.

## API Contracts

- 이 fractal은 진단 문자열 포맷터 `formatCreateDynamicFunctionError`를 `utils/`에 소유하며 상자 원소는 `helpers/error` 진입점에서 가져옵니다.
- 문자열이 아니거나 치환 후 비어 있는 식은 undefined를 반환합니다. 경로는 주입된 PathManager에 최초 순서대로 등록하여 의존성 배열 인덱스로 치환합니다.
- 기존 후행 세미콜론 처리와 boolean 강제 변환 규칙을 유지합니다. 식을 컴파일하지만 실행하지는 않습니다.
- 실패는 CREATE_DYNAMIC_FUNCTION 코드와 원문·생성 본문·원인을 보존합니다. 청사진 호출부가 작성 스키마 위치를 덧붙일 수 있어야 합니다.
- DynamicFunction 타입의 정본은 이 컴파일러가 소유하며 index가 내보내지 않습니다. 진입점은 컴파일 함수만 이름으로 제공합니다. core는 React나 옛 노드 구현에 의존하지 않습니다.

## Acceptance Criteria

### create-dynamic-function-contract — 컴파일 의미의 보존

- 컴파일러·본문 생성·return 변환 시험은 문법과 실행 의미를 검증합니다.
- 같은 경로가 반복되면 같은 인덱스를 사용하며, 유효한 값 식과 boolean 식은 기존 결과를 냅니다.
- 문법 오류를 숨기지 않으며 청사진 사용 시 schemaPath를 보존합니다.

## Last Updated

2026-10-14 — 정돈-1; 정돈-2(2026-10-14).
