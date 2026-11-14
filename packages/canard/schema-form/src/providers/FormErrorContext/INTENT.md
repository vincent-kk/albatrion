# Form error reporting

## Purpose

폼 인스턴스의 오류 보고 수명을 렌더 경계의 fallback 수명과 분리합니다. 경계 콜백과 최신 소비자를 연결하여 오류를 가둔 뒤에도 보고를 잃지 않게 합니다. 루트 경계의 배치는 FormCore가 소유합니다.

## Boundaries

### Always do

- capture에는 명시적인 작업 origin을 요구하고 경고 중복 제거 범위는 origin과 독립적으로 유지합니다.

- 커밋된 기록을 최신 콜백에 전달하고 오류 identity를 유지한다.
- 부른 쪽이 없는 실패는 core 경계를 통해 잎 순서로 호스트에 전달하며, caller 거부와 렌더 경계의 원래 값은 유지한다.
- 경계 래퍼는 해당 컴포넌트가 소유하는 지점에 둔다.
- 보고기는 렌더 중에 읽고 현재 필드 path는 훅 인자로 받습니다. 경로 문맥은 지연 Placeholder만 사용하여 필드별 Provider를 늘리지 않습니다.

### Ask first

- 공개 오류 기록의 필드나 sink의 의미를 바꾸는 경우
- 보고기의 수명을 경계 안으로 옮기거나 명시적 path·Placeholder 전용 문맥의 책임을 바꾸는 경우

### Never do

- form, 플러그인 레지스트리, 코어 구현을 import하지 않는다.
- 경계 콜백에서 잡은 렌더 오류를 다시 던지지 않는다.
