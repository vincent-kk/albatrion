# 에이전트 정책 — 역할·분담·사용량

이 문서는 `@canard/schema-form` 1.0.0 작업에 쓰는 에이전트의 역할, 장기 작업과 워커의 구분, 사용량 풀과 소비 순서를 한곳에 모은 정본이다. 소유자 Vincent의 지시가 바뀌면 이 문서를 고치고, 바뀐 원문은 라운드 문서(`reviews/round-NN-owner-answers.md`)에 그대로 남긴다. `AGENT-HANDOFF.md` 1절의 워커 배정 줄은 이 문서를 가리키기만 한다. 마지막 갱신은 429라운드(2026-10-20)다.

## 1. 우선순위

1. 소유자의 가장 최근 원문이 이 문서보다 우선한다. 충돌이 보이면 이 문서를 고치고 라운드를 닫는다.
2. 이 문서는 402라운드의 "Claude 사용량 극도 억제, 보조 Claude 세션 없음", 414라운드의 agy 모델 지정, 427라운드의 워커 배정 줄을 대체한다. 이전 완료 검증의 모델 이력은 그대로 보존한다.
3. 원장 규칙(가설 하나에 PR 하나, DETAIL 먼저, 네 게이트·관측 동치·독립 검토 뒤 병합, 병합은 Vincent가 직접, 보류 항목 유지, 커밋 작성자 Vincent Kelvin, 공동 저자·세션 ID 금지)은 이 문서와 무관하게 그대로다.

## 2. 에이전트와 역할

| 에이전트 | 모델 | 장기 작업 | 워커 | 비고 |
| --- | --- | --- | --- | --- |
| Claude(오케스트레이터 oracle) | Fable | 설계·판단·원장 마감만 | — | 코드를 고치지 않는다. 결론만 받아 컨텍스트를 아낀다 |
| Claude 상주 세션 fairy08·fixy08 | Opus | 가능 | 가능 | Orca 밖의 세션이며 SendMessage로 부른다. Fable은 쓰지 않는다 |
| Claude 하위 에이전트(scout·worker·debugger·verifier) | Sonnet·Opus | — | 가능 | 오케스트레이터 통제 아래 단발 |
| codex | gpt-6.1-sol high | 가능 | 가능 | astra는 소진이 빨라 금지 |
| agy(antigravity) | gemini-4 argon | 가능 | — | 어렵고 복합적인 내용에만 |
| agy(antigravity) | gemini-3.8-flash-high | — | 가능 | 평소 독립 검토의 기본 모델 |
| cursor-agent | grok-4.7-high-fast | — | 가능 | 기본 모델. 다른 모델(프론티어 풀)은 선택적으로 |

- 장기 작업을 맡을 수 있는 것은 codex gpt-6.1-sol, Claude Opus, agy argon 셋뿐이다. 나머지는 오케스트레이터나 장기 작업 에이전트의 통제 아래 워커로만 쓴다.
- 워커는 짧거나 단발적인 일(원장 라운드 마감, 문서 압축, 검사 실행, 작은 편집)에 쓴다. 큰 구현과 측정은 장기 작업 에이전트가 맡는다.

## 3. 분담

| 일 | 맡는 쪽 |
| --- | --- |
| 구현·게이트·측정·PR | codex gpt-6.1-sol high, 또는 Claude Opus 상주 세션(fairy08·fixy08) |
| 독립 검토 | agy gemini-3.8-flash-high. 종합 판단(예: M3 종합 재측정)은 agy argon |
| 원장 마감과 단발 문서 작업 | cursor grok-4.7-high-fast(Orca worker-start), 필요하면 오케스트레이터 직접 |
| 파일 읽기·요약·검증 보조 | Claude 하위 에이전트(scout·verifier) |
| 설계·판단·원장 마감 결정·커밋·push | 오케스트레이터 |

## 4. 사용량 풀과 초기화 (2026-10-20 기준)

| 풀 | 공유 범위 | 초기화 | 상태 |
| --- | --- | --- | --- |
| Claude | Fable을 제외한 모든 모델이 공유 | 매주 화요일 오전 11시 | 429라운드에 초기화됨, 평시 운행 |
| codex | 모든 모델이 공유 | 약 5일 뒤(유동적) | astra 금지 |
| agy gemini-4 argon | 단독 | 약 5일 뒤 | 별도 책정 |
| agy 그 밖의 gemini(3.8 등) | 단독 | 약 5일 뒤 | 별도 책정 |
| agy 외부 모델(opus 등) | 단독 | 약 2일 11시간 뒤 | 소진 상태, 쓰지 않는다 |
| cursor Grok·Composer | 월간, 이달 말까지 | 다음 달 | 한도에 닿으면 다음 달까지 재시도 없음 |
| cursor 프론티어(gemini-4, gpt-5.x 등) | 월간, 이달 말까지 | 다음 달 | Grok·Composer와 별도 책정 |

## 5. 소비 순서와 중지 규칙

1. 토큰 소비는 cursor > codex = agy > claude 순서로 배분한다.
2. cursor는 할 수 있는 일이 제한적이므로 맡길 수 있는 일은 먼저 cursor에 보내 한도를 소진한다.
3. 어떤 워커든 공급자가 한도를 알리면 즉시 멈추고, 작업 트리를 그대로 두며, 도달한 단계를 적어 `worker_done --outcome failed`로 보고한다. 오케스트레이터는 같은 풀로 다시 시도하지 않고 다음 순서의 풀로 넘긴다.
4. cursor 한도에 닿으면 다음 달까지 cursor를 쓰지 않는다.
5. 풀마다 남은 양과 초기화 시점은 소유자가 알려 준 값을 이 문서 4절에 적고, 바뀌면 라운드와 함께 고친다.

## 6. Orca 호출 모양

- codex: `orca orchestration worker-start --spec "<brief 경로와 요약>" --worktree <current 또는 id:...> --agent codex --model gpt-6.1-sol --effort high --json`
- agy: `--agent antigravity --model gemini-3.8-flash-high` (종합 판단은 `gemini-4-argon-high`)
- cursor: `--agent cursor --model grok-4.7-high-fast`
- 모든 brief에 "run-use 와 코디네이터 명령 금지, check 는 --terminal 로"와 한도 중지 규칙을 적는다.
- 끝난 dispatch는 `worker-release`로 정리하고 다시 쓰지 않는다.

## 7. 변경 이력

| 라운드 | 날짜 | 바뀐 것 |
| --- | --- | --- |
| 429 | 2026-10-20 | 문서 신설. Claude 한도 초기화로 평시 운행, 장기 작업 셋(codex sol·Claude Opus·agy argon), 워커 구분, 풀별 한도와 초기화, 소비 순서 cursor > codex = agy > claude |
