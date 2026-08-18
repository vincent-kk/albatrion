# hash — 비암호화 해시 유틸리티

## Purpose

문자열·바이너리(`ArrayBuffer`, `Uint8Array`) 입력에 대한 비암호화 해시 알고리즘 두 종 — 증분 해싱을 지원하는 32비트 `Murmur3` 클래스와 Java의 `String.hashCode()`를 본뜬 `polynomialHash` 고정 길이 식별자 함수 — 를 함수/클래스당 1파일로 소유한다.

## Conventions

- 두 알고리즘 모두 비암호화 해시다 — 캐시 키, 짧은 식별자 등 빠른 조회 용도로만 쓴다.
- `Murmur3`는 시드와 부분 데이터를 여러 번의 `hash()` 호출로 누적하는 증분(streaming) API이고, `polynomialHash`는 호출마다 독립적인 순수 함수다.

## Boundaries

### Always do

- `Murmur3`의 믹싱·파이널라이제이션을 변경하면 자체 결과를 기대값으로 삼는 회귀 스위트만이 아니라 공개 레퍼런스 벡터로 값을 고정한 스위트도 함께 통과시킨다
- 정렬 최적화(`DataView`) 경로를 추가·수정하면 비정렬 경로와 동일한 해시 값을 내는지 확인한다

### Ask first

- `Murmur3`/`polynomialHash`의 출력 형식(비트 폭, 인코딩, base) 변경 — 기존에 저장된 해시 값과의 호환성에 영향을 준다
- `polynomialHash`의 기본 길이(7) 변경

### Never do

- 두 해시를 암호화·보안 목적(비밀번호, 서명, 토큰 검증)으로 사용하는 경로 추가
- 시드·길이 인자의 기본값을 조용히 바꿔 기존 소비자의 해시 결과를 변경
