# StaticFirstLoadCapability contract

## Requirements

청사진 identity에 연결된 정적 첫 로드 자격을 약한 sidecar로 보관한다.

## API Contracts

- `set`은 청사진과 boolean 자격을 연결한다. `has`는 등록된 값만 조회하며, 미등록 청사진은 false다.

## Acceptance Criteria

### static-first-load — 첫 로드 자격의 보관

- 청사진마다 boolean 하나를 약한 sidecar에 보관하고, 공개 Blueprint 형을 넓히지 않는다. 자격이 없는 청사진과 기록이 없는 청사진은 같게 읽힌다(89C-02·04).
- settle의 `static-first-load-differential.test.ts`가 자격 있는 스키마와 없는 스키마의 첫 로드 결과를 범용 경로와 비교해 이 절을 검증한다.

## Last Updated

정돈-3 blueprint 재구성(2026-10-15)
