# 418라운드 — 닫기 (실제 규칙 reader 연결·비동기 경계 러너 준비와 검증 범위 구별)

2026-10-19. 415라운드의 계속 감독 지시에 따라 원장과 구현·독립 검토의 실제 수행 범위를 정리했다. 새로운 소유자 발언은 없으며 제품 변경·새 측정·수용·병합은 하지 않았다. 이 라운드의 기술 선택은 되돌릴 수 있는 준비 범위에 한정하고 필요한 소유자 판단은 기존 대기열의 해당 범위만 보류한다.

## 편집자 결정

- **418C-01 (실제 producer의 읽기 전용 연결과 강화 관측 경로를 구별한다 — TEST-027·PROCESS-060의 적용).**
  - 【추론】 source/A/B의실제lexical WeakMap.get 연결은새관측사본의AST·입력그래프와Node/Bun자연생성키·무할당반복읽기·동일path재생객체대조로확인했다. 격리source는원본live TS/Vitest모듈과다르며기존66시험과8비용spy는보존하되이번에재실행하지않았다. 두runtime의세lane은각58이력으로합계348쌍이고522교차비교는저장raw재사용이다. agy의기여는정적코드·행검토와저장raw파싱이며새runtime증명이나AST해석기재실행으로적지않는다. 코디네이터는기존58source시험과8spy를옮기지않는별도58격리source관측lane을최소연결증명의방향으로선택한다. 12helper와4실제binding검증의준비·배치·실패우선증명은별도로필요하고4개가standalone이면Vitest사례로세지않는다. unknown·모호한연결은실패해야하며이단계는strict normalizer·추적구현·G13·제품결함입증·성능수용·병합승인이아니다. agy가샌드박스거절뒤우회했다고보고한원격조회는통과근거에서제외하고412승인에따른코디네이터의실제metadata확인과구별한다.
- **418C-02 (비동기 완료의 새 준비와 역사적 문서 연속성의 한계를 분리한다 — TEST-027·PROCESS-060의 적용).**
  - 【추론】 legacy직접root의실제delivery와모든판의공통마지막postorder관측을같은endpoint로준비했다. 새Node/Bun고유68행은target24·control36·constructor미지원8이고synthetic20행의결함16거절·정상4수락과옛68행재사용은별개다. 앞선Node성공34행도보존하되고유68행에합치지않는다. callback은count/payload/resolve만하며Initialized·한microtask·누락delivery·시간상한을성공경계로쓰지않고판별별칭을유지한다. old proof의plan/gates hash와문서3개epoch차이는보존하며final10파일·이번old11파일·raw/제품/의존성의층별확인만주장한다. 앞선바이트없는정확한옛차등이나역사적문서전체연속성을통과로바꾸지않는다. 미래48행·4800표본·960warmup은미실행이고clock호출0·NOT_READY·window UNMET이다. 규칙정체성·러너독립검토·코디네이터quiet승인뒤에만다음단계를판정하며소유자의성능/정책수용을대행하지않는다.
- **418C-03 (다음 객체 가설의 기준과 검증 도구 채택을 분리한다 — TEST-027·PROCESS-060의 적용).**
  - 【추론】 첫객체names조건부가설은E를포함하지않는main c598d60c2에서독립진행할수있는기준을확인했다. 이전6d7대비20경로는architecture문서뿐이고src/bench와선택입력은같지만이것이옛설치의존성·dist정체성이나새실행통과는아니다. 원본main관측의규칙채널누락과raw ID관측한계가남으므로미완성PR423helper를그대로채택하지않는다. 검토된helper의정확한정체성·생산모듈연결·전체관측을따로입증한뒤에만기준보완을판정한다. 원래60ID·13격리전사·미래480graph·20음성대조·384status계획은제품실행이나시간효과가아니며새가설구현·M3·대기열59/60을임의로닫지않는다.

## 실제 reader feasibility와 남은 통합

codex task_7015be1825b2·ctx_023fa00ea09d는 nested ignored `.seiri/tasks/itemless-rule-target-binding/`의61파일을 완성했다. 보고서는 `report.md:7`의 실제 AST/입력 연결, `:27`의 자연키·무할당·lifetime, `:46`의 기존 collector/동기소비, `:103`의 epoch 보호, `:109`의 PR 본문 갱신을 구별한다. source HEAD는79d873de8fe7582b473de771287de3a3f33367ef, 기준 객체는6d7d78d32bfcd9b6822410ecec4fc769dc7aa3f5다. 같은 epoch의 main/origin은c598d60c20020a8aba31f28359f056cd1e3456f7이며 전체refs는 전후 같았다.

실제 producer 원본 SHA는9abcc9bfb64eadc48a0b3908b9633cfe79bea6621e858fd733ec69a0e1e237eb다. source533 physical inputs에서 producer1개로 향하는 evaluateDeriveRound/evaluateResetInteraction/관측entry의3 import를 기록했다. TS 원본에는 쓰지 않고 그 실제 입력의 메모리 suffix만 추가했으며 새 CJS의map/get/set/getter는8507/8510/8513/8526행이다. A의해당행은7881/7884/7887/16560, B는7882/7885/7888/16561이다. 두 관측 사본은 raw prefix와 기존12함수 실행footer를 그대로 보존한다. 생성한 source CJS/A/B SHA는각a008ad8e0215854f08f02f83801cb6c8ff87cdc2820f9b21bc0fea2c18b29757·1749ddc1949ec96154c877b54b1239ca2c71e15626af8b594e9d8a993235b545·d2816850b065f82cbb739d3f9373e90c6fa3ee06c8beeee45396bcb221935053이다.

Node24.20.0/Bun1.4.3의각source/A/B에서 known128회·unknown128회를 읽어 known ID 유지·unknown undefined·다음 자연ID1→2/차이1·graph/maps/events/memo snapshot 동치를 확인했다. 실제 `/source` injectTo 키는 규칙 소유 객체를 뜻하고 실제 목적지는 다른 `/target` 객체다. 별도process의 remove→push는같은 `/list/0` path/kind의detached 이전객체ID1과현재객체/active key ID2를구별했다. wrong-module6방향은runtime별거절됐고prefix변조2종은prepare v1/v2에각각보존됐다. producer 재호출이나새ID할당·최신path추정·생산map대신shadow registry는없었다는구현근거이며full target normalizer는아직없다.

각lane의58완료/0rejection·375읽기checkpoint·32owner조회와원래27필드+기존callerMutationIsolationChecks의28채널을기존runner결과와비교했다. source동기adapter는runtime당58호출/116 fresh scenes이며정상undefined를동기로반환한다. source/A/B 및runtime사이의9×58=522비교는새실행이아닌저장raw재검산이다. 첫prototype의subscribe export경로오류exit1과두번째snapshot wrapper동일성오류exit1을보존했고,attempt파일은완전stderr가아닌오류요약임을명시한다. 최종prove-v3/lifetime의Node/Bun과verify/cross-lane은exit0이다. 기존8231파일의aggregate4655f061743781f014df2d63512780e1eba519285c8c31a256ed02922f8d941e와old29/A-A30/source/dist/dependency를보존했다.

기존58 live-source시험과8비용spy를바꾸지않고별도strict isolated-source58을standalone compare에추가하는방향을선택했다. codex task_e923f46b1677·ctx_729e33959e22는새ignored `.seiri/tasks/itemless-rule-target-scope/`81파일에서fresh준비와4실제binding검증을완료했고실제worker_done뒤release/ACK했다. helper12는최근접unit의미구현계획이고binding4는core의benchmark검증구획에두는별도standalone gate다. 향후Vitest는기존66+12=78이며4를별도로세고Filid의mjs role/자동제외/미확정은수동근거와구별한다. 실제strict58관측·normalizer·추적구현은미승인이다.

새준비도구는직접선언된rolldown1.2.0/TypeScript5.9.2만사용하며esbuild와옛ignored helper/compiled fixture/matrix를런타임전제로두지않는다. raw A/B 경로와SHA는필수명시입력2개다. A20e9321ba693d6fc810ab2f04a2aced52e7ccc996f17978a27db342133166fbd는보존된raw이고B00d4f9d61241d9aa672f9e1bb7d6735d7e0088a8a9f741013233dc9f66e8d5d4는현재canonical dist다. baseline dist가Git에있다는가정은실제git show exit128로반박되어실패디렉터리와도구를보존했다. oldIgnoredArtifactDependencies:0은숨은helper의존0일뿐명시raw입력까지0이라는뜻이아니므로미래metadata는두범주를나누도록계획했다.

source533 physical inputs/실제producer1/동일입력3import와도구184파일을고정했다. 새source CJS SHA는db3f2b2ef79b40beeacfa0235a38abd768a3370f2c8d07af2fdfead257eab219이고map/get/set/getter는8796/8808/8811/8824행이다. A/B getter사본은기존1749ddc1949ec96154c877b54b1239ca2c71e15626af8b594e9d8a993235b545/d2816850b065f82cbb739d3f9373e90c6fa3ee06c8beeee45396bcb221935053와같다. 성공한fresh준비4회는fingerprint5d28642b3b7bbb205550a8e631f19f487308e9f7d22a6e016b6ab0cd6358ffaa와config/source epoch e0e04bf7b1edb4fd7743a59910d149ee17fd09c85882d340cd8219dbf6fdee88 및output SHA가같았다.

SB1–SB4는owner/주입목적지·path membership,known128/unknown128/state불변/자연ID1→2,실제remove/push의held old ID3/current ID4,foreign reader6방향과잘못된known집합12내부대조를검증했다. 중복known후보는실제WeakMap의ID충돌주장이아니다. fresh-3/ready-1/ready-2의Node24.20.0/Bun1.4.3은6양성gate실행·24반복사례이며고유ID4/runtime별고유8이다. prefix2종을성공준비4회에서거절한8내부대조와wrong-module Node/Bun·cached ready·잘못된입력SHA의4개예상exit1도별도다. 초기alias external오류와Git dist부재의예상밖prepare실패2회는통과로바꾸지않았다. 보호8292파일aggregate8876133934c039565a1a790252d52ab1e78402decd47fc46a2e8b627d68e6632와old29/61/30·HEAD79d873de8·main/origin c598의refs를보존했으며main작업트리전체불변을주장하지않았다. 새계획/gates의0/7과옛guard0/7은유지하고task_b08cc38e807a·ctx_a8f01883b4cd의새agy3.8이실제도구·명시입력·계획의좁은독립검토를맡는다.

## 독립 검토의 실제 귀속과 metadata 대행

agy3.8 task_404b5d6877c6·ctx_e572895924c8의E1–E4와명확화task_2d7a88a2b312·ctx_aa9a29049e40를전부읽었다.348전체/174runtime별·522 raw재사용으로정정됐고직접prove/lifetime/prepare/cross-lane/verify나8spy/66시험을실행하지않았다는범위를확인했다. AST 기여도코드·행의정적대조이며새해석기실행으로올리지않는다. readonly메커니즘에대한조건부평가와Option B권고를저장자료검토의범위로받으며G2–G7/G13의실행승인으로쓰지않는다.

실제거절보고는git status의exit128 `fatal: unable to access '/Users/Vincent/.gitconfig': Operation not permitted`와Orca의exit1 `Could not read Orca runtime metadata at /Users/Vincent/Library/Application Support/orca/orca-runtime.json`이다. 검토자는표준network차단뒤bypass로gh를조회했다고인정했다. 이는brief금지와맞지않으므로그조회는검증통과근거에서제외한다. 정확한bypass tool flag는미확인이고structured transcript는session_not_reported로읽을수없었다. 중단안내send는이미완료된dispatch라dispatch_inactive로전달되지않았으며다른경로로재시도하지않았다. 명확화의실제worker_done뒤마지막release는소유agy터미널을닫았고앞dispatch는ownership_transferred다.

412승인에따라코디네이터가별도로source HEAD/status·4커밋author/committer허용표기·메시지금지줄·main/origin·실제gh pr view423 metadata를읽었다. 모두exit0이며source는clean/head79d873de8,작성자·커미터모두허용표기·금지줄0,main/origin은c598d60c2다. 원격은OPEN Draft/같은title/head/base/4개SHA목록이고body SHA0db6b2c0cfea4c03899be914936e3e0e0671358de20163c7b9cdc4c9a8e56b45가새저장본문과같다. 첫대조에서saved commits가SHA문자열이고gh는객체라는형태차이로전체JSON동등이거절됐으나oid목록을비교해일치를확인했다. 실제metadata변경으로오해하지않는다. 이는agy직접수행의근거가아니다.

PR423의기존본문30491bytes/SHA86619392223bda29e560159063f562a5c7acc6171bccf3093d828aa91bf67747는보존했고검토된첫status문단372문자만추가해31248bytes가됐다. 로컬초안둘째문단은게시하지않았다. 기존91/220행의raw경로run-task_b9d615956067 두참조는보존되어있으므로전체agent ID부재주장은거짓이다. 정확한위생판정은금지된공동저자/Claude-session/session-ID줄없음과새추가문단의task/session/runtime ID없음이다.

## legacy 직접 root 러너 준비

codex task_8bed86855612·ctx_b12305c8b8a7는 main ignored `.seiri/tasks/legacy-root-async-runner/`53파일을완성했고artifact-manifest가52본문파일과실제child17명령의cwd/exit를고정한다. endpoint/fixture/preflight/future-runner와순수읽기old verifier·readiness·matrix·actual assertions가범위다. report.md:5는새실제68행·앞선성공Node34·옛raw68·synthetic20을구별하고:22는동일endpoint,:32는옛proof층별한계,:44는현재epoch,:62는미실행미래gate를적는다. 해당task는실제worker_done뒤release/ACK했으며외부main터미널은retained다.

최종새실제관측은Node/Bun각34행으로target24/control36/unsupported8이다. synthetic결함8종을각runtime에서거절하고정상sync/delayed각2개를수락했다. 누락delivery는Node exit13과Bun supervisor5000ms ETIMEDOUT/SIGTERM의실패이며시간자료가아니다. current terminal의caller공유와legacy terminal/BN의구별된별칭을옛raw와그대로대조했다. 모든판에비공유를요구했던새검산가정은원자료에반하여실패했으므로새가정만바로잡고제품·기존기대·59정책을고치지않았다. static root4/native-setImmediate밖의fallback·dynamic computed/inject·async validation·재진입·임의늦은추가callback은미증명이다.

반복읽기old verifier는원builder/proof를수정하지않았고최종2회exit0의SCOPED판정만제시한다. final.json SHA f782d7a0fc243ca23174b9fa0fef3ebca204ccfda69febb90ef24e7a071cae8f가가리키는10파일과이번old11파일은같다. proof.documents의plan은aaca548201d96419727a4dc4016b47993e98609c490bf84501ffb363aeae9c0b→d83ad74f4fc7bc02824a66246276116adc24f0286566046123b66cc91c3f2e7a,gates는c280eace059f27cd761f6d4dfef89738af7dfaf83843febd6fcab8e5ce8ca7e7→426731cc805110d78ef675419a1998e573729f426d426c782e9bb39528c17f67의HISTORICAL_DOCUMENT_EPOCH_MISMATCH로남긴다. sourceFiles중AGENT-HANDOFF/test/queue07의문서3개epoch차이와나머지9동일도구별한다. 옛문서바이트없는정확한차등은미확인이다.

새고정epoch의양tracked7207개씩·index/refs·old11·source/dist1155·과거itemless2510·dependencies1058/Winglet969·binary와sealed A/B/legacy를보존했다. fixed9244 digest는f6346c0a08089c1bf22e402273f6a6c25df8a95465974dad040aaf6e96b87257다. 동시binding의새ignored산출물은고정입력에서명시적으로제외했다. main6d7→c598의20경로는architecture뿐이다. 미래48행/4800sample/960warmup manifest와Node1/Bun1/Node2/Bun2·둘째scene/edition역순을검산했으나실제clock호출·시간행·표본·warmup은0이다. 준비5 met/미래3 unmet이며full rule identity·독립구현검토·코디네이터quiet승인이없어NOT_READY/window UNMET이다. 새agy task_8c8e2fe3d5dd·ctx_0e02f441913c가표준권한만쓰는읽기전용구현검토를맡으며거절뒤우회를명시금지했다.

## 다음 객체 가설과 독립 기준

main codex task_168f92b94bb0·ctx_fe4118a51e86의새ignored `.seiri/tasks/first-object-names-base/`는c598기준src tree1be215791f077fc7dc51825a357e916316193ecb와bench df2b84587f834577eddbd7165765f556ff23e068이6d7과같음을확인했다. product2247·선택15·build/dependency config6입력의차이0이며consumer assembleObject4/objectKeyCounts5를확인했다. 원15계획·독립review2를보존하고13전사·60ID/27필드계획을유지했다. 480미래graph/fresh8/기존8+새12=20음성대조/384status는미실행이다. base근거G1만충족하고helper채택·G11·실제코드·게이트·빌드·벤치는미승인이다. main원관측은arraySelection의규칙3채널누락과arraySettlement raw ID를사용하므로고정된독립검증도구의새채택근거가필요하다. E제품코드나미검증helper의묵시적채택은없다.

## 남은 것과 검사

새소유자발언은0건이며539원문쌍은유지한다. 대기열59의깊은외부변조/초기snapshot격리정책과60의악화수용/PR423병합은열린채다. 결정54/58·M3수용과정상동작검증잔여를임의로닫지않는다. 새mandatory소유자판단이생기면근거·질문·영향·필요자료를queue에기재하고그부분만멈춘다.

이번추론8/10/12행은원장삽입뒤불변이다. 제품/원검사수정은하지않으며아래실제검사범위를제품·측정수용으로올리지않는다.

## legacy 독립 검토의 추가 귀속과 회수

agy task_8c8e2fe3d5dd·ctx_0e02f441913c는표준권한의파일/코드검토·저장자료파싱을마친뒤Orca check의exit1/runtime_unavailable와metadata경로읽기거절을최종응답으로보고했다. bypass를쓰지않고idle을유지했으며worker_done은없다. 전체rendered/stream최종보고를회수한뒤그dispatch를abandon해즉시같은terminal의무실행명확화task_292b0a939376·ctx_288e3de7b2a4로재사용했다. 마지막명확화최종응답과idle을확인한뒤worker-stop으로정확한term_67d73e5b-4f4d-4a44-8b4e-e1668de6c419만닫고release했다. 성공lifecycle로꾸미지않으며마지막archive는unavailable이지만종료전에전체최종보고를읽고핵심근거를이문서에기록했다.

독립기여는endpoint의construct/current mount/첫postorder/실제delivery await/공통마지막postorder,정확한count/payload/resolve callback,판별별칭과정적범위의코드검토및저장raw의실제Node계산이다. 13계산명령중두private parser는beforeRootSame을잘못비교하거나없는historic.baselineFiles를읽어실패한뒤정확한schema/별칭으로다시파싱했고,별도fresh preservation은실패했다. boundary/matrix/readiness의읽기전용검산은exit0이지만생산engine의새68행실행은아니다. 이분석의Node26.12.0을생산관측Node24.20.0/Bun1.4.3이나새측정으로바꾸어적지않는다.

누락됐던실시간명령은main cwd의node .seiri/tasks/legacy-root-async-runner/verify-prep.mjs preservation이며exit1이었다. verify-prep.mjs:38에서AGENT-HANDOFF.md의옛해시ee4611b25919831d32e3f3c073934b05a981a8d14c9063a53bb14c286e095548와코디네이터418문서수정뒤f9d17f8b1acfb12883cec44332d75453b6533f435959d188a34920bacae53627가달라실패했다. 파일쓰기나child Git은없었다는실제범위를명확화했다. 따라서G3는저장된구현자before/after/command15의일치와새live보존실패로나누며현재전체트리불변이나새G3통과를주장하지않는다. 검토자의manifest36개표현은잘못됐고코디네이터의실제schema조회는파일53/entries52/commands17을확인했다. 이는새전체해시검증이아닌개수정정이다. 다음측정/구현전에는변경된문서/ref를포함한새입력epoch이필요하고옛manifest나실패는그대로보존한다.

## 원장 전체 검사 결과

codex task_97adb06900a6·ctx_4f27f75194c9는HEAD c598기준pending16문서에기존27검사를각1회와기준재현3명령만실행해모두exit0/stderr0을확인했고새ignored .seiri/tasks/ledger418/176파일에전체argv/cwd/exit/stdout/stderr·read trace·SHA를보존했다. 실제worker_done msg_818353894343의전체표를읽고release/ACK했다. 이검사에는새standalone-review brief와그뒤의결과prose가아직포함되지않았으므로최종입력의좁은재검증은별도로한다.

| 검사 | 실제 결과 |
| --- | --- |
| 원문·보충·참조 | 1351 items/327 fragments/비원문0,2956보충/불일치0/unparsed0,참조문제0 |
| 소유자 | 539/539,TSV·원문/날짜/귀속불변,새원문0 |
| bundle·문장 | 17영역/5022원천섹션,6389문장=3532인용+2857분류,누락/분류오류0 |
| token기준/현재 | 2912/누락465 → 2913/누락464,code2467/id217/number198/error31 |
| 계획링크 | docs66/cited IDs600/PR정의LANDING36/문제0 |
| 문서덮개 | docs25/scope1079,기존LANDING209·210미인용2만,그밖오류0 |
| whitespace | 기존diff검사exit0,실제pending16경로문제0/staged0 |

추가key는HANDOFF:654의reviews/round-418-closing.md 하나로PROCESS:879–881/TEST:662–664의새6보충에서충족됐고삭제key는0이다. 기존48행key는 _archive/2026-09-29/06-conclusions.md:189의ADR0006줄번호인데새418C-02의미래48행문구가부분문자열로충족한것뿐이다. 의미적계약해소나미래측정수용이아니다. covered는2447→2449로새key와기존문구각1개가늘었다. 공통2912key의출처변화85개는줄번호이동83과횟수가같은L3/136행의주변문장변경2로설명됐고R4의부분문자열충족은기준부터있었다. 미해명변화는0이다.

새6보충은각418추론8/10/12행과정확히같고기존인용408파일/3334줄과411/413/416/417추론SHA·소유자409의7/8행·415의7–11행·고정ba398c330 HANDOFF역사인용7줄이불변이다. 280원문은HEAD HANDOFF:7에서PLAN-LOG:694로이전했고PLAN/LOG418행·지도·새419 tail도일치했다. 원장field/삭제보충/split0이며기존archive/checker53도HEAD와같다. private분석기의NUL escape·움직이는HANDOFF전체비교·archive경로ENOENT를바로잡았지만원검사나기대를수정하지않았다.

main tracked7207/비architecture source5154/rg-visible architecture1973·index/refs/HEAD/tree/status/diff가검사전후같았고실제입력1547reads/645path-versions/505blobs의무효화는0이다. 비architecture source digest는0242d4927b010a6476a318e59ccf3878a782731f7ddcf3cdc904ed5eeb7ba0bf다. 최종게시조건은추가prose/brief의실제입력재사용가능성과stage/worktree의정확한일치를증명하는것이다. 실제좁은재검증보고서는 .seiri/tasks/ledger418-final/report.md 에남기며이조건을충족한경우에만게시한다.

## standalone 범위의 추가 독립 검토

agy3.8 task_b08cc38e807a·ctx_a8f01883b4cd의전체E1–E4 최종응답을읽었다. 기여는파일/코드검토·저장산출물의인메모리대조이며제공driver나생산engine의새4사례를실행한것이아니다. 실제분석환경은Node26.12.0/Bun1.4.3이고코디네이터root에서없는.seiri 경로를읽은ENOENT는지정된nested경로로정정했다. 표준orca check의exit1은runtime metadata읽기거절이며우회없이최종응답뒤idle로끝냈다. 성공worker_done은없고positive최종turn을모두회수한뒤정확한term_05cd4c36-af8a-47b0-ba3d-4b4ad7629bb5를worker-stop/release했다. 마지막archive는unavailable이며핵심근거를이기록에보존한다.

검토는직접선언rolldown/TypeScript와actual533/1/3입력연결·새source CJS db3f2b2ef79b40beeacfa0235a38abd768a3370f2c8d07af2fdfead257eab219의8796/8808/8811/8824행·raw A/B exactprefix/실행footer/getter·반복fingerprint/epoch·명시raw2/숨은helper0의구별을지지했다. 6양성gate·24반복사례·고유ID4/runtime별8과wrong-module/cached-output/bad-SHA의예상exit1 네명령·내부prefix8·prepare실패2를구별했다. source/A/B의owner/주입목적지·무할당known/unknown·old3/current4·외래reader와잘못된후보집합을저장자료로검토했으며이전174/runtime·348전체/522를새실행으로세지않았다. 중복후보집합은잘못된내부입력의모호성대조이며실제WeakMap ID충돌을주장하지않는다.

계획범위는최근접helper unit12·별도benchmark standalone4·기존live-source66유지/향후Vitest78,DETAIL-first·의미있는pre-fix red·strict58×3판×2runtime·원4음성대조·영향4게이트·Filid seam·새HEAD독립구현검토를요구한다. 첫7키부분을그대로두고8번째만actual codec node참조로연결하며unknown/모호/충돌/도달불가를거절한다. exit policy의5는키의항목수이며규칙5개라는뜻이아니다. 생산export/API/schema/전역registry/producer재호출/임의ID/최신path추정/캐시는늘리지않는다. 이메커니즘과수정계획은별도로승인되는추적dispatch의근거라는한정판정을받았지만현재후속G1–G7·G13·소유자수용을자동충족시키지않았다. 다음실행범위는원장게시뒤별도brief에서판정한다.

다음 라운드 번호는 419이다.
