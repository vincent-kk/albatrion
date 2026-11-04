# Amendment 16 독립 계획 검토

판정: **rework-required**. 구현 방향은 Amendment 16과 정합적입니다. 아래 두 검증 계약을 구체화하신 뒤, 변경된 주장만 재검토하시면 됩니다. 구현은 주 작업자 소관입니다.

## 검토 범위와 근거

- 검토본: 같은 디렉터리의 `plan.md`, `gates.md`; 외부 `460-briefs/defect-round.md:871–912`의 Amendment 16 및 필요한 Amendment 15 문맥.
- 현재 HEAD는 `d68072d1ac7c2d01854bc22b82fecae8598a5db4`이며, 검토 중 확인한 `git status --short`는 비어 있었습니다.
- 저장소 `AGENTS.md`, 루트·패키지 `CLAUDE.md`, 패키지 `AGENTS.md`, 관련 `.claude/rules`, 소유 INTENT/DETAIL, 실제 순회·capture·라우팅 소스와 기존 검증 파일을 읽었습니다. 계획 검토에는 `seiri:review-plan`의 정적 grounding·증거 게이트 기준과 기본 계획 방법을 적용했습니다.
- 테스트·빌드·mutation·검사기·FCA 실행, 설치·fetch·커밋은 하지 않았습니다. 이 외부 보고서만 작성했으며 저장소 소스는 수정하지 않았습니다.
- 검토본 SHA-256: `plan.md=ebf50312146cfb3cb67b97c6b48f052a1cf14f11ddc1a625a76fcfdcbfd34d82`, `gates.md=77d3df503e3cce8209c891c0d45eb7b9d45f1b0673f0dbfee3ca4083342dfb72`.

## 보완 사항

### R1 · P2 — 새 게이트 검사기의 생성 단계와 입력·실패 계약이 빠져 있습니다

`gates.md:7,11,15,19,23,27`은 모두 새 `am16/check.py`를 호출합니다. 실제 디렉터리에는 검토 시점에 `plan.md`, `gates.md`만 있었으며, `plan.md:41–49`에는 검사할 결과를 나열했지만 검사기 작성 단계, 입력 파일 스키마, 누락·알 수 없는 상태에서 marker를 내지 않는 계약은 없습니다. 제안 파일이 아직 없다는 사실 자체가 결함은 아닙니다. CHECK가 실질적인 결과를 판정하도록 만드는 선행 작업이 정의되지 않은 점이 문제입니다.

부모 `dr-16-17/plan.md`의 「선행 증거 계약」에는 기존 `check-evidence.py`와 `criteria.json`, 실제 프로젝트별 JSON·명령 종료 상태·변이 해시 등의 입력을 구체화한 전례가 있습니다. 이번 계획은 게이트 번호와 구현 파일을 바꾸므로, 해당 계약을 명시적으로 계승·대응시키거나 새 계약을 적어 주십시오. 특히 다음 조건을 실제 원시 증거로 판정해야 합니다.

- G1/G2: 정확한 file/title/project별 필수 사례, red/guard 구분, BASE의 의미 있는 실패와 최종 passed 상태; 수집 실패·누락·예기치 않은 skip은 성공이 아닙니다.
- G3: 기존 12개와 신규 변이의 고정 ID 집합, 각 변이가 바꾼 실제 소스 해시와 지정 assertion의 실패, 원복 전후 전체 대상 해시 동일성 및 최종 green.
- G4/G5/G6: 26개 ledger 비교와 FCA 차분, 공식 순차 명령 결과·프로젝트별 실측 수, 새 HEAD·버전·산출물·경로·인용 검사의 원시 입력. 단순 요약의 성공 문자열이나 JSON 존재만으로 통과시키지 않아야 합니다.

해결 조건은 검사기 소스를 지금 모두 구현하는 것이 아니라, 이를 먼저 작성할 단계와 입력·assertion·실패 시 marker 금지 계약을 계획에 확정하는 것입니다. 근거는 `seiri:review-plan` §3과 `gates-format.md`의 CHECK/EXPECT 실질 판정 원칙입니다.

### R2 · P2 — 실패한 스냅샷이 공유 예산을 소비한다는 조항을 검증할 사례·변이가 명시되지 않았습니다

`plan.md:15`의 「including failed attempts」는 올바릅니다. 그러나 `:24`의 「over-budget wide and shared nested-budget cases」와 일반적인 budget mutations만으로는, 성공한 스냅샷만 차감하거나 실패 시 예약을 환불하는 구현도 통과할 수 있습니다. 현재 host reader는 `readFailureBundle.ts:24–31`에서 일부 원소를 읽은 뒤 실패하면 snapshot을 버리고 undefined를 반환하며, `forEachFailureLeaf.ts:26–32`는 해당 bundle을 한 잎으로 방문한 뒤 다음 형제로 계속 진행합니다. 따라서 실패를 끼운 형제 사례가 실제 예산 계약의 구별점입니다.

명시적인 예를 추가해 주십시오. 루트가 `[A, bad, good, H]`이고 `bad`는 길이 600,000으로 예약된 뒤 마지막 index 읽기 또는 최종 안정성 읽기에서 실패하며, `good`은 길이 400,000인 정상 bundle이라고 하겠습니다. 루트 예약 4까지 포함하면 남은 예산은 399,996이므로 `good`은 펼치지 않아야 합니다. host 결과는 정확히 `[A, bad, good, H]`의 identity·순서이며, `good`의 원소 getter는 한 번도 읽지 않아야 합니다. 실패한 `bad`의 앞 원소가 부분 전달되지 않는 것도 함께 확인할 수 있습니다.

「실패한 readFailureBundle 예약만 환불」 또는 「성공한 snapshot에만 차감」 변이를 별도 ID로 고정하고 이 사례가 실패하도록 해 주십시오. 이 사례를 G1/G2/G3의 필수 목록에 연결해야 합니다. capture 판정은 첫 실패에서 false로 끝나므로, 이 환불 변이의 핵심 검증 대상은 계속 진행하는 host 순회입니다. capture 쪽 공유 예산은 모두 읽을 수 있는 알려진 중첩 배열들의 합으로 별도 검증하시면 됩니다.

## 확인된 정합성과 구현 시 확인점

- **최초 길이와 마지막 안정성 읽기:** `plan.md:9,14–16`은 배열마다 최초 length를 고정하고, 정수·범위·예산 검증 후 예약하며, own index만 읽고, 마지막 length와 최초 값을 비교하도록 명확히 정합니다. 마지막 한 번의 안정성 읽기는 루프 경계의 재읽기와 구별되므로 Amendment 16의 두 문장을 정합적으로 해석했습니다. root와 nested 모두 같은 reader에 예산 객체를 전달하는 방향도 맞습니다.
- **읽기 fuse의 의미:** 기존 `isReportedFailureBundle.ts:21–22`는 length를 반복해서 읽고 `:38–39`에서 입력 예외를 false로 바꿉니다. Infinity 전환·계속 append 사례에서 fuse가 던진 결과만 보고 false를 기대하면, 고장 난 구현도 통과할 수 있습니다. 계획의 read-count 검증을 실제 assertion으로 연결하고 fuse 미도달·원본 입력 읽기 상한을 확인해 주십시오. fixed-bound 제거와 final-stability 제거는 각각 지정 assertion을 깨뜨려야 합니다. 기존 부모 계획 마지막의 cycle-fuse 정밀화 취지와 같습니다.
- **capture fallback과 콜백 분리:** `createFormErrorService.ts:78–80`의 code/details 읽기는 현재 report catch 밖이고, `:90`의 String(error)는 report와 같은 catch에 있어 inspection 오류가 handler 오류로 오인될 수 있습니다. `plan.md:13,23`의 전용 inspection catch와 별도 service.report catch는 두 문제를 정확히 겨냥합니다. fallback에는 원래 error·origin·path·componentStack을 유지하고 부분 details를 버리는 계약이 있습니다. fallback 레코드를 받는 onError가 `[X,Y]`를 던지는 guard도 추가하면, fallback 경로에서도 정확히 한 레코드 후 host `[X,Y]`이며 콜백을 재호출하지 않는다는 분리를 직접 증명할 수 있습니다.
- **라우팅 여섯 자리:** capture, flushRootLoad catch, resetRootLoad buffered-record catch, deliverChainRecords handler catch, reportValidationFailure handler catch 및 마지막 original sink가 계획의 여섯 변이 대상과 대응됩니다. 마지막 original sink는 handler exception catch가 아니며, `plan.md:25`가 별도 original-bundle 시험으로 구별한 점이 맞습니다. 이들은 BASE에서 이미 leaf helper를 쓰므로 characterization guard로 분류하는 것도 타당합니다. 기존 sink 예외 전파 guard는 `report/__tests__/unreadableFailure.test.ts`에 root bundle/비bundle 두 경우로 존재합니다.
- **malformed slot:** details.errors가 배열이 아닌 bundle을 같은 identity로 한 번 전달하고 drop 변이를 검출한다는 `plan.md:26–27`은 Amendment 16 §6과 일치합니다.
- **정식 결정 원본과 supplement:** `plan.md:34,36`은 attribution만 바꾸어 기존 82/85행을 유지하고, 과거 결정·인용을 보존한 채 Amendment 16 결정을 추가하여 ERROR-028에 sup-insert하도록 합니다. 현재 원장 DR16C-01은 `reviews/defect-round.md:82` 원문을 인용하며, `sup-insert.mjs:16–18,29`는 실제 `- 【추론】` 행과 전달한 source 경로를 그대로 사용합니다. 따라서 기존 결정을 직접 고쳐 인용을 깨뜨리지 않는 이 방향은 맞습니다. 실행 시에는 부모 계획처럼 architecture cwd의 상대 경로 `reviews/defect-round.md`, 새 결정 코드·실제 행 번호·ERROR-028 target을 담은 외부 insertion JSON을 사용하고, widened never-throw가 입력 검사에 관한 것이며 sink/callback 예외 의미를 바꾸지 않는다는 문장을 새 정식 결정에 넣어야 합니다.
- **복원·보존:** `61457653a`의 core/errors DETAIL Last Updated에 실제 계약 기준 문장이 있고 현 HEAD에는 날짜만 남은 것을 확인했습니다. 두 원문을 날짜와 빈 줄 아래 복원하는 단계, 26개 ledger의 동일 BASE 비교, 전체 순차 게이트 재실행, 최종 HEAD에 고정한 PR 본문, malformed/revisited/unreadable bundle이 최종 sink의 합법적 잎이라는 문구는 요구에 맞습니다. 외부 ledger 위치는 승인된 scratch 제약이므로 finding이 아닙니다.

이 판정은 계획·증거 설계의 정적 독립 검토입니다. 최종 구현의 통과나 실행 시간·메모리 상한을 실행으로 인증한 결과는 아닙니다.
