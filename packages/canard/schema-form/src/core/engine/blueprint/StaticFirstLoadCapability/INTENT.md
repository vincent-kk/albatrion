# StaticFirstLoadCapability

## Purpose

청사진 생성 때 고정한 정적 첫 로드 자격을 재분석 없이 조회합니다.

## Conventions

- 내부 Blueprint의 생성 사실을 읽으며 별도 등록 저장소를 두지 않습니다.
- 공개 패키지 표면과 라이브 노드 칸을 늘리지 않습니다.

## Boundaries

### Always do

- 생성 사실의 수명을 엔진 모드 초기화와 분리합니다.
- 자격 사실이 없으면 false로 보수적으로 판단합니다.

### Ask first

- 조회 의미·보관 수명·부모의 증명과의 경계를 바꿀 때

### Never do

- 조회 중 선언 그래프를 다시 스캔하지 않습니다.
- 라이브 폼 상태나 다른 capability로 자격을 대신 판단하지 않습니다.
