# 373라운드 — Vincent의 결정 (allOf 조각이 배열의 items에 적은 controls가 그 아이템에 걸리지 않는 것은 결함이며 수정한다)

2026-10-15. P-08 조사 중 fixy08이 getControlLayers의 소유 판정이 /items/ 끝 슬래시를 요구해 한 스키마 items·additionalItems 아이템의 조각 층이 비는 것을 발견했고, fairy08의 원장 대조(CONTROLS-077·35C-08을 합치면 포함, 빼라는 문장 없음, 튜플만 포함하는 비대칭)를 원장 관리자가 예시와 함께 소유자에게 설명하자 소유자가 결함으로 확정했다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| 배열 조각의 controls가 한 스키마 items 아이템에 걸리지 않는 것은 결함이며 수정한다 | 배열 조각의 controls를 아이템 층에 포함할지(대기열 59) | "아. 그렇네 완전 결함이군. \n너희 판단이 맞아. 수정이 필요하다" (2026-10-15, 원장 세션) | 결정 대기열 59는 닫힌다. CONTROLS-077은 배열 아이템을 포함하는 것으로 보충한다(다음 마감의 편집자 결정): 조각이 items·additionalItems·prefixItems로 선언한 아이템도 "그 조각이 직접 선언한 호스트의 직계 자식"이다. 수정은 별도 fix PR로 한다: 소유 판정 도우미 하나를 getControlLayers와 buildFeatureNodeIndex가 함께 쓰고(P-08 가설의 도우미와 같은 것), 회귀 시험(items·additionalItems 조각의 default·unsetValue·unsetOnInactive·상태 키가 아이템마다 걸림, 튜플과 대칭, 중첩 배열, 조각 꺼짐의 나감 정책), 바뀐 기대는 하나하나 CONTROLS-077로 정당화해 PR 본문에, 전체 게이트·agy. 결함 둘(나감 정리, items 조각 층)은 최적화 PR보다 앞선다. |

다음 라운드 번호는 374이다.
