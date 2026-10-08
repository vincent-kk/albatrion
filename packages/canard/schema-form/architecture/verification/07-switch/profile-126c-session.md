# 측정 세션126c의 결과입니다.

HEAD는`4e8490a72d5006befd16ffb02c2b74d9db8cb642`이며 채택한change2를포함합니다. F-A′는REJECT입니다. 완료한16개fixture의64개판정조합중37개개선과6개회귀가확인됐고, 6개회귀모두124C-01의5 µs 상한을초과했습니다. 다른fixture가추가개선을보여도이개별상한위반을상쇄할수없습니다. 전체19개fixture의완료를주장하지않습니다.

## 수행 범위입니다.

1단계는performance.md의React fixture19개전체에서9회씩ABBA를완료했습니다. 2단계의F-A′ 비교는151/171회이며16개fixture는9회전체를완료했고nested-d5-f4는7회완료했습니다. 렌더카운트와인스턴스단언및회귀행의GC 없는기록은완료했습니다. 3단계는미측정입니다.
남은2단계는nested-d5-f4의8–9회와array-500 및array-1000의각1–9회입니다. 3단계전체와122 대비상태변경확인이남아있습니다. 진행중인각프로세스를자연종료시킨뒤보고서시간을확보했습니다.

## 입력과 측정방법입니다.

Node는`/opt/homebrew/bin/node`의v26.10.0이며React는19.2.6입니다. harness-126.md, 95C-01,105C-01,94C-02와118–126라운드, profile-122-session.md의React부분및fa-regression-diagnosis-125.md를읽었습니다. 리뷰는지정한origin/1.0.0-beta의git show로확인했으며입력해시는[session-inputs.json](profile-126c-session/session-inputs.json)에있습니다.
fa-prime.patch의현재HEAD에대한git apply --check는종료코드0입니다. 제품소스파일을수정하지않고runtime 소스를메모리에서patch해prepare-react-bundles.mjs로production profiling bundle을만들었습니다. r126-base는HEAD이고r126-basex는base에주석한줄만추가했으며r126-fap는HEAD에F-A′를적용했습니다. 0.16.0은기존harness의외부번들경로와해시를확인했지만비교프로세스를실행하지못했습니다.
한프로세스에는한번들만로드했습니다. 1회는ABBA 2블록의4개새worker이고warmup20과samples101을사용했습니다. 9회완료행의버전별표본은1818개입니다. mount는harness의handle-ready/drainTicks 종료점이고update wall는flushSync부터setImmediate4회뒤까지이며active는같은구간의event-loop active 시간입니다. old-wait 2-turn 열은3단계기록용으로예약했으나미측정입니다.
각write의calibrated commit 수와프로세스간digest 일치를단언했습니다. 9회완료한fixture는회차간digest도일치했습니다. bootstrap은기존report-verdict-121.mjs와같은seed101,1999회,99% CI와nearest-rank median을사용했고실제2개열에서원본통계함수와정확한일치를검증했습니다. 105C-01 개선은CI 하한>0과A/A 절대median 초과이며회귀는CI 상한<0과max(A/A 절대median,baseline median의0.5%) 초과입니다.

## React A/A 결과입니다.

19개fixture의76개판정조합에서A/A 절대paired median의중앙값은5.041 µs, 최대값은2356.916 µs, 최소값은0.082 µs입니다. 27/76개의CI가0을제외했으므로같은행의실제A/A 바닥을사용했습니다. 684개worker와1,598,652개write 단언에서실패가없습니다. [전체A/A 표](profile-126c-session/react-AA.csv)를보존했습니다.

## F-A′ 판정입니다.

[105C-01 전체완료행](profile-126c-session/fa-verdict.csv)과[124C-01의6개회귀표](profile-126c-session/fa-124C-01.md)에baseline,delta,CI,A/A 및floor를기록했습니다. nested-d3-f4는mount wall/active에서각80.333/76.125 µs 손실이고oneOf-20은mount wall/active 및update wall/active에서각43.000/43.708/34.958/35.126 µs 손실입니다. 비율은모두2% 이하지만절대손실이5 µs를넘습니다. GC 없는9회기록에서도nested-d3-f4의mount 두열과oneOf-20의mount active가0을제외했습니다. 따라서예외를허용하지않고REJECT로판정합니다.
방향축의구조이득은필드별fibers 감소입니다. 시간합계로계상한행은sample-1, array-replace-200, array-push-remove-100, computed-visible-derived의mount Profiler actualDuration이며합계25.049 µs입니다. React 렌더기록만한번씩계상했고wall/active를중복계상하지않았습니다. 해당Profiler 기록은폼하위트리의React 렌더시간이며필드 exclusive 시간으로분리한측정은없습니다. 방향축의그엄격한해석은미입증으로남겨두며이를근거로예외를주장하지않습니다. [mount React 기록](profile-126c-session/fa-mount-react.csv)에값을보존했습니다.

## Fibers와렌더및지연결과입니다.

평면leaf의fibers는24→20, 배열leaf는21→17이며필드컴포넌트수는13→10입니다. own input write의필드렌더는10→10이고다른leaf는0입니다. sibling과parent write가다른필드를렌더하지않는다는단언을통과했습니다. 전역context 변경은렌더된각필드컴포넌트1회, leaf input1회, remount0이라는단언을통과했습니다. memo로건너뛴컴포넌트의0회는전체컴포넌트수분모에포함되므로유형평균을각인스턴스의실행횟수로오해하지않아야합니다.
remount와new mount의write별값및정규화설명은[필드카운트표](profile-126c-session/fa-counts.md), 컴포넌트별write/분모는[컴포넌트CSV](profile-126c-session/fa-components.csv)에있습니다. 자체input write는remount0이고외부target setValue, refresh와reset의기록은표에구별했습니다.
refresh latency의F-A′/base median 비율은flat ctl1.011084, flat unctl0.939367, array ctl0.943499, array unctl1.028180입니다. 시나리오별72개표본이며[median과p99 기록](profile-126c-session/fa-latency.csv)을보존했습니다. latency는보조기록으로사용했습니다.

## HEAD와0.16.0 표의남은작업입니다.

wall와active 열별목표미달행수및122 이후상태변경은미측정입니다. 3회fresh one-bundle 교대실행을수집하지못했으므로목표충족을주장하지않습니다. mount≤1.2, update≤1.0을94C-02의회차별판정으로적용하고old-wait 기록열을함께수집하는3단계전체가남았습니다. [미측정상태표](profile-126c-session/react-table.md)에19개fixture를명시했습니다.

## 실행과보존검증입니다.

측정시작은2026-10-08 06:23:39 UTC이고마감은11:23:39 UTC입니다. 기록작성시점은2026-10-08T11:24:34.700Z이며경과시간은5.0155시간입니다. 모든작업은순차적으로실행했으며실행기록의최장명령은440.946초로8분미만입니다. 자연종료코드와signal의이상은0개입니다. 첫A/A 부모의별도기록은없지만도구종료코드0과4개worker 기록이있습니다. 설치와package-manager 명령은실행하지않았으며git 쓰기및제품코드변경도없습니다.
raw는`/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/profile-126c-raw`에있습니다. 3493개raw 파일의SHA-256을[raw-sha256.txt](profile-126c-session/raw-sha256.txt)에보존합니다. 번들은지정한S/bundles에유지하며해시는입력기록에있습니다. 저장소산출물은각각5 MB 이하이고HEAD 및추적파일의변경여부는[실행검증기록](profile-126c-session/session-verification.json)에있습니다.

최종 검증 시각은 2026-10-08 11:26:18 UTC이며, 측정 시작 이후 5시간 2분 39초가 지났습니다. 측정은 마감 전에 종료했으나 보고서 작성과 검증 중 5시간 상한을 넘겼습니다. 세션 시간 조건을 지키지 못했습니다. 추가 측정은 실행하지 않았습니다.

raw 파일 3,493개와 해시 목록 3,493행을 전부 대조했으며 불일치는 0개입니다. 산출물은 모두 5 MB 이하이며 최대 파일은 429,672 bytes입니다. JSON 산출물의 파싱을 확인했습니다. git status에는 이 보고서와 산출물 디렉터리만 새 파일로 나타나고, 추적 파일의 HEAD 대비 diff는 비어 있습니다. [최종 검증 기록](profile-126c-session/final-verification.json)에 이 결과를 보존했습니다.
