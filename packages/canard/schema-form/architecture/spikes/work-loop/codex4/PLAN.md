# 작업 루프 3.1 적대적 검토 계획

Planning method: `seiri:write-plan` 기본 방법. 제품 변경이 아닌 독립 실행 모델을 통한 명세 검토입니다.

## 범위와 증거

- 기준: `reviews/round-4-spec.md` A·B, `reviews/round-3.md` §6·§8.
- 비교: `codex3/run.mjs`의 18개 ID 및 저장된 관측. 기존 모델은 계산 중 default 쓰기, 금지 투영, null 보존이라는 이전 해석을 포함합니다.
- 산출물: 이 디렉터리의 실행 모델·실험과 `reviews/raw-codex4-spec.md`.
- 제품 소스와 진행 중인 다른 아키텍처 변경은 수정하지 않습니다.

## 실행 순서

1. 기존 18개 입력을 유지하고 3.1의 원본 슬롯, 순수 계산, 전이 쓰기, 두 상한에 맞춰 관측 단언을 작성합니다.
2. 계층 조각과 상속 overlay를 모델링하고 A2·A4–A8의 경계 입력을 추가합니다. Ajv 8 `ajv/dist/2020`은 기존 ajv8 플러그인의 workspace 해석 위치에서 불러옵니다. Ajv의 값 변경 옵션은 끕니다.
3. 독립 루트 디스패처로 B3 여섯 규칙과 B4 커밋 payload 연속성을 실행합니다. 미정의 정책은 선택한 해석을 명시하고 반례와 구분합니다.
4. 지정한 nullable 테스트 31·42·148행의 입력과 기대값을 모델에서 단언합니다. DOM 검증과 모델 검증은 구분합니다.
5. `yarn node packages/canard/schema-form/architecture/spikes/work-loop/codex4/run.mjs`로 모든 ID와 관측을 재현하고, 한국어 보고서에 입력·출력·파일 위치·명세 인용을 연결합니다.

## 검토와 적용 판단

`seiri:review-plan`: grounded-only. 기준 파일, 기존 18개 ID, nullable 세 시나리오 및 workspace 명령을 실제 확인했습니다. 새 제품 모듈이나 공개 계약을 도입하는 계획이 아니므로 별도 위임 없이 진행합니다.

`seiri:execute`·`seiri:implement`의 제품 구현 절차는 이 조사에 맞게 축소합니다. 명세 결함 자체를 고치지 않으며, 관측 단언이 성립하는 실행 모델과 Ajv 대조가 검증 수단입니다. 별도의 작업 원장이나 제품 전체 빌드는 만들지 않습니다. 미지원 영역은 통과로 기록하지 않습니다.
