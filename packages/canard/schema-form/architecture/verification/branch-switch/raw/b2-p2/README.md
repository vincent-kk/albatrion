# B2-P2 측정 요약

측정한 B는 `e8c122986`, A는 `422b1b195`입니다. 원 고정 성능선의 `fail`과 코디네이터의 편집자 채택(소유자 재검증 대상)을 구분하며, 측정을 다시 실행하지 않았습니다.

| 파일 | 보존한 근거 |
| --- | --- |
| [judgement.json](judgement.json) | 장치의 원 판정·관문별 결과·오류·미달 사유. 미커밋 시험 로그 포인터 하나만 아래 검증 요약 경로로 바꿨습니다. |
| [results.json](results.json) | 22행의 A앞5·A′뒤5·A전체10·B전체10 중앙값과 프로세스 최소값, 폭, legacy 레인, 판정, 번들 SHA, 440개 독립 프로세스 확인. 단위는 ms/행입니다. |
| [quality.json](quality.json) | 호환18행의 동일0.16.1 레인 비율과 전체 중앙 0.995998052, N/A 4행. |
| [quiet-window.json](quiet-window.json), [window-end.json](window-end.json) | 시작·끝 5초 CPU 구간, 임계값, 양의 CPU 변화가 있는 모든 프로세스, `heavy=[]`. 0변화 행과 전체 ps 텍스트는 생략했습니다. |
| [stages.json](stages.json), [stage-goals.json](stage-goals.json) | 두 행×A/B×3프로세스의 집계 장부, self/inclusive µs/쓰기, 호출·표본 할당·계측 범위와 원 목표 미달. 단계 시간은 표본 중앙→프로세스 중앙이며 총합은 프로세스 최소→중앙입니다. |
| [test073.json](test073.json) | 전체·앞반·뒷반 인접쌍의 정본 Welch 통계. 각 역할 1000/500/500표본을 처리량으로 변환한 요약이며 표본 배열은 포함하지 않습니다. |
| [heaps.json](heaps.json) | Node/Bun 각 A/B7표본, 중앙·최대와 Node 관문·Bun 보고 수치. |
| [siblings.json](siblings.json) | 서로 다른 두 fixture의 형제 증분·비율과 각 행 폭. |
| [verification.json](verification.json) | 기능 게이트, 기존 timing 시험 실패와 단독 재실행 통과, 복원 후 표적79시험·Node/Bun 각72장면 배달 차이0. 전체 시험 로그를 대신하는 요약입니다. |
| [restored-product-identity.json](restored-product-identity.json) | 최종 제품 소스·재빌드 SHA와 측정 B의 동일성. |
| [coordinator-decision.json](coordinator-decision.json) | 원 기준 실패를 유지한 편집자 결정과 최종 묶음 범위·소유자 재검증 책임. |
| [provenance.json](provenance.json) | 원 장치 파일별 SHA-256, 요약·이식 변환 내역. |

전체 표본별 원자료·원본 장치 파일·빌드 사본·전체 로그는 측정 머신에 보존하며 이 디렉터리에는 판정에 필요한 요약만 커밋했습니다.
