# 421라운드 — 닫기 (P1 준비 검토와 재개 실행의 보존 실패)

2026-10-19. 소유자의 중단 지점 물음과 계속 진행 지시 두 원문을 보존하고, P1 계획·도구·제어부 검토와 새 M2 뒤 실제 두 실행 및 보존 실패를 기록합니다. 필수 문서26검사와 기준·원문·source 대조를 마쳤으며 최종 staging 입력 대조와 게시가 남았습니다. 성능·동작 정책·PR423 병합과 대기열59/60을 대행 수용하지 않습니다.

## 편집자 결정

- **421C-01 (실제 도구와 제어부의 M1은 고정 소스의 한정 근거로만 수용한다 — TEST-027·PROCESS-060의 적용).**
  - 【추론】 같은A의원래raw한입력과서로다른두실행module을유지하고focal상대순서만바꾸는P1계획을독립검토했다. 실제wrapper/helper/verifier/contract/epoch와controller의독립해시·정적검토및생산자의합성음성·메모리포트시나리오는도구준비근거로수용하되검토자자체실행과저장생산자증거를구별한다. 이M1은외부자동journal을포함한전역무변경이나새runtime·성능수용증명이아니며고정13040물리입력·출력부재·실제새질문별M2가실행에선행한다. helper새URL/callsite의VM상태동등성·GC/JIT인과·sourceE/trueB동치는주장하지않는다.
- **421C-02 (새 승인 뒤 실제 실행과 보존 실패를 함께 남긴다 — TEST-027·PROCESS-060의 적용).**
  - 【추론】 새witness0de6bfe6와실제rootM2답에묶인controller1회·AB다음BA는모두exit0으로자동quiet를닫았고physical13040/source/runtime/refs/두index는동일했다. 그러나protected325중옛gates한파일이기대cb92e157에서실제fd662687로달라졌으므로전체protocol은failed이며G9/G11–13추가검사를중단한다. 옛원문복구·기대해시교체·재측정으로실패를가리지않는다. 새증거봉인자체의48entry불일치0과기존보존324/325는다른판정이다. 현재raw의독립중앙값·비율관찰은실패한창의산술보완으로만남기고G14/G15완료·성능수용·E인과·PR423병합으로바꾸지않는다.

- **421C-03 (자동 기록 경로의 진단은 새 작업으로 한정한다 — TEST-027·PROCESS-060의 적용).**
  - 【추론】 중단전옛작업연결과실제G10/G3자동응답·두checkbox상태projection을원인후보로조사하되옛전체bytepreimage가없는상태에서완전diff나hook결함을확정하지않는다. pause요청accepted·참여ACK·실제taskbinding적용은구별하고측정당시상태로소급하지않는다. 새읽기전용진단과실패창원시산술만허용하며hooks/config/세션직접편집·추가engine/gate·자동H2/H3/H4확장은하지않는다. 소유자의두새말은원문대로기록하고새정책승인으로넓히지않으며관측동작·기대값·충돌·느린결과수용의필수판단만기존대기열에남긴다.

## 준비·검토와 실제 실행의 근거

계획·도구·제어부의 한정 검토는 round-421-p1-plan-review.md, round-421-p1-tool-review.md, round-421-p1-control-review.md에 있습니다. 뒤 두 고정 M1 출처는 각각 SHA c95137593cc7e9abfc47ece5225fd4e3879beda30847cd3dfdbaf03bf802aada 및292b6097bef4471418f142f58b9a16bb1e94416204c4b63afadf8763312b3b49이며 실제 증서 복사본과 일치합니다. 준비18·tool34·control20의 고정 입력은 같으며 옛 execution 한 파일의 보존 실패는 별도 기록으로 남깁니다.

실행과 보존 실패의 정확한 시각·raw 해시·중단 범위·root 오류는 round-421-p1-execution-record.md에 있습니다. controller 창은2026-10-19T01:37:20.248Z–01:38:03.475Z이고 AB PID57718/BA PID58079는 모두exit0입니다. 생산자의 자체 raw 관찰은38행·3800samples·760warmups·preflight84이며 sourceE/trueB 새 실행은0입니다. 새 최종보고b53ad63c와seal-final88a539c3의48entry+selfseal49파일을 root가 실제 해시 대조했습니다. 전체325 보존 실패 한 건을 그 검사와 섞지 않습니다.

## 소유자의 말과 중단 복원

두 새 원문은 round-421-owner-answers.md:7·8과 owner TSV·landing에 있습니다. 질문에는 먼저 상태와 복원 가능성만 답했고 이후 명시된 진행 지시로 새 작업을 시작했습니다. 기존539원문과 두 새 원문, 합541쌍은 원장 검증 대상입니다.

옛 실행은 새M2 미응답600000ms timeout3건 뒤실제failed·엔진0으로 끝났습니다. 완료5메시지를 처리하고 release했으며 늦은HOLD 정리답은dispatch_inactive로 이미 닫혔음을 확인했습니다. 새 질문의timeout5건은 같은 질문을 자연 재개한 기록이며 그 뒤 실제M2와 두 실행이 있습니다. 이력·원래실패·기대해시는 그대로입니다.

## 원장 검사와 게시 전 경계

새 codex gpt-6.1-sol/high는 필수 문서26개를 각각 실제1회 실행해 모두exit0/stderr0을 확인했습니다. 17문장영역6389문장은missing0, 원장항목1351/조각327, 소유자541인용, 문서coverage의알려진LANDING209/210둘뿐입니다. 보충2976은기존2968+추론복사6+소유자인용2이며삭제0입니다. 보고서는ignored .seiri/tasks/ledger421/report.md, SHA25e57dcb8dcf9dcd09afd1b0c98802da5e1eff75d014973afaa3c20fd3f66480이고seal SHA248975b7f8943229744d2394e3443b9821971257f296e3e77787e449bdb208f0입니다.

token2921/missing464는기준809의2917/464와대조했습니다. 새G9/G11/G14/G15와closing출처code5개는새요약·인용의문자열충족이며gate의미해소가아닙니다. 기준HANDOFF7행의283bullet을그대로PLAN-LOG700행으로옮겨inventory입력밖으로나간label-template1개를구별합니다. 기존키상태변화0·missing464보존·기존86키위치변화와128회원문이동/9회이탈/9회추가원인을개별대조했습니다. 기준checker를새실행한것이아니라동일TOKEN_PATTERNS·판정을809blob에적용한산출입니다.

기존539TSV원문·순서와새2를확인했고기존원천212파일은809와같으며HANDOFF의옛7포인터는선언된ba398정본으로대조했습니다. 기존비어있지않은원장인용7429개도남아있습니다. source/config5154 aggregate0242d4927b010a6476a318e59ccf3878a782731f7ddcf3cdc904ed5eeb7ba0bf·Gitblob·source1be와nested282청결, 제품/runtime/build변경0을확인했습니다. 추론8/10/13과각각두복사본은불변입니다.

현재검사1–5의원래stdout을회수하고입력동일을증명해이어갔으며broad재실행은0입니다. 새collector ENOENT·null historicalScope TypeError·옛root blob의git128은원인과정본아카이브해석으로구분했고검사실패나권한거부로꾸미지않았습니다. 고정옛기준에없던424경로조회실패와transport JSON파싱오류도별도보존했습니다. root관찰capacity는동일모델의실제재개를확인했으며소유자발언이아닙니다. root의추가Enter+wait-submit조합은인자거절로키입력전중단됐고중복wait는waiter_exists로거절돼기존wait를완료한뒤이어갔습니다. 최종staging뒤에는실제입력변화에해당하는검사만추가확인합니다.

## 남은 것

독립 수치검토는 round-421-p1-numeric-review.md에 실제38중앙값 불일치0·18비율·유한32해시와 보완된 두 예비 관찰 오류를 남겼습니다. base가AB17/BA18에서더낮은초점중앙값을보인것은실패창의한정산술이며G14/G15통과가아닙니다. 현재journal경로는생산자소스36의근거와독립agy의내부자료·명령대조를구별합니다. agy가외부소스EPERM뒤view_file대체읽기를하여그범위의독립설치소스주장은수용하지않고원장검사만이어갑니다(round-421-p1-journal-review.md). G9/G11–13·G14/G15는 이번 실패 기록으로 통과하지 않으며 미래 실행이 필요하면 새 작업연결과 유한 입력·보존 경계를 먼저 증명해야 합니다. 원인 미해결 상태에서 GC/JIT profiler나 재측정을 자동으로 시작하지 않습니다.

owner59의 격리·외부변경 정책과 owner60의 느린 결과·성능 수용·PR423 병합은 보류합니다. T14/F는 기존 계획뿐이며 새 제품 구현·시험 기대 변경은 없습니다. M3와 전체 정상동작 검증 및 잔여 결함 작업도 앞선 조건을 대신 닫지 않습니다.

다음 라운드 번호는 422이다.
