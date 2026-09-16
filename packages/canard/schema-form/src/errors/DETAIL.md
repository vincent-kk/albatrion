# errors

## Requirements

도메인 오류는 공통 오류 구조와 타입 판별 가능성을 제공합니다.

## API Contracts

- 오류 코드·메시지·상세 맥락을 보관하고 클래스에 맞는 이름을 설정합니다.
- 타입 가드는 대응하는 도메인 오류를 식별하며 오류 객체는 비즈니스 동작을 실행하지 않습니다.

## Acceptance Criteria

### errors-contract — 관찰 가능한 동작

- 소비자는 코드와 타입 가드를 통해 오류 종류를 구분할 수 있습니다.
- 상세 정보는 생성자가 받은 진단 맥락을 별도 마스킹 없이 보관합니다. ValidationError에는 원본 form value와 jsonSchema가 포함될 수 있으므로 호출자는 이를 사용자 응답이나 로그에 노출할 때 별도로 다뤄야 합니다.

## Last Updated

2026-09-16 — 오류 details의 raw form value 보관과 호출자 노출 책임을 명시.
