# 일회성 스냅숏 증명 도구

state-vocabulary의 키 이름 변경만 있었음을 확인하는 일회성 증거 도구입니다. 패키지 빌드·런타임·일상 검증 흐름의 의존성이 아닙니다.

```sh
node packages/canard/schema-form/architecture/verification/state-vocabulary/tools/verifyStateVocabularySnapshots.mjs <base> <capture-directory>
```

보존된 외부 capture에서 노드 키만 역변환하고 원래 snapshot 및 section hash와 비교합니다. 현재 hash와 작업 횟수도 함께 확인합니다. capture를 얻기 위한 일회성 시험 hook은 제품 시험에서 제거했습니다. `--rewrite`는 최초 마이그레이션 때 기준 full snapshot의 노드 키를 바꾼 기록용 모드입니다.
