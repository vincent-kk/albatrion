# StaticFirstLoadCapability contract

## Requirements

정적 첫 로드 자격은 청사진 생성 중 고정하여 모드 변경 뒤에도 유지한다.

## API Contracts

- `has`는 Blueprint.staticFirstLoadEligible 고정 사실만 읽으며 기록이 없으면 false다. 생성자는 freeze 전에 자격을 정하고 조회는 선언 그래프를 다시 걷지 않는다.

## Acceptance Criteria

### static-first-load — 첫 로드 자격의 보관

- 내부 청사진마다 boolean 하나를 생성 사실로 보관하고, 패키지 공개 타입과 노드 칸은 넓히지 않는다. 자격이 없는 청사진과 기록이 없는 청사진은 같게 읽힌다(89C-02·04).
- settle의 `static-first-load-differential.test.ts`가 자격 있는 스키마와 없는 스키마의 첫 로드 결과를 범용 경로와 비교해 이 절을 검증한다.

## Last Updated

정돈-3 blueprint 재구성(2026-10-15)
