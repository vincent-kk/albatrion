# engine — 노드 실행 규칙 경계

## Purpose

청사진·레코드·동작 행·검증·탐색·정착·쓰기의 실행 규칙을 소유합니다. 노드 겉면이 쓰는 계약을 이름으로 내보내고 클래스와 렌더 바인딩의 구현은 소유하지 않습니다.

## Conventions

- 원본·계산값·방출값의 채널과 동기 정착·사건 배달 순서를 유지합니다.
- 자식 모듈은 형제의 진입점을 소비하며 내부 파일은 소유 모듈 안에서 직접 가져옵니다.
- 공통 레코드 형과 경로 색인 보조는 이 엔진의 내부 구획에 둡니다.
- Source-representation modes are internal construction inputs: surface reads them through this boundary, and package entry points never expose their controls.

## Boundaries

### Always do

- 겉면과 외부 소비자가 필요한 이름을 진입점에서 명명해 재수출합니다.
- 청사진부터 쓰기까지의 의존 순서와 검증 콜백의 단방향 계약을 지킵니다.
- 기존 값·형상·리비전·검증·통지 계약을 유지합니다.

### Ask first

- 정착 순서·예산·사건 배달 시점을 바꿀 때
- 외부에 제공하는 실행 통로나 옵션 비트를 늘릴 때

### Never do

- surface의 런타임 클래스나 React 렌더 계층을 가져오지 않습니다.
- 레거시 엔진이나 app/plugin 등록소를 가져오지 않습니다.
- 호출자 소유 스키마를 바꾸거나 자식 모듈의 규칙을 이 진입점에 구현하지 않습니다.
