# 103라운드 동결・IC 진단

기준 HEAD는 `ee97495c93349edb42b726cccae8b1fb020542ef`입니다. **동결 여부가 섞여서 주요 소비 함수가 다형화됐다는 설명은 이번 nested・flat 자료에서 지지되지 않습니다.** 새 완료 함수의 gate 배열 `length`에는 실제 혼합이 있었으나, 그 혼합을 제거한 변형도 더 느렸습니다. 완료 순회・약한 색인 조회・동적 키 읽기 비용이 회귀와 더 잘 맞습니다. 이는 관측을 종합한 추론이며 각 원인의 독립적인 시간 기여를 확정한 결과는 아닙니다.

권장 측정 정책은 **owned-inline**입니다. 운영에서 내부 membership을 record별 소유 복사본으로 두고, 공개 schema와 생산자가 만든 공개 값・schemaType 및 공유 gate metadata를 생성 지점에서 보호합니다. nested와 flat에서 동결 전체 제거 절감량의 각각 **60.6%・88.7%**를 회수했습니다. 제품에는 적용하지 않았습니다.

## 측정 조건

production 번들 6개 정책과 동일 HEAD 대조를 사용했습니다. 모든 판정 실행은 새 Node 프로세스, 엔진별 warmup 20회, 101쌍, 3회입니다. 각 표본의 H/V 순서는 교대하며 회차의 시작 순서도 바뀝니다. 입력 복사와 강제 GC는 시계 밖이고, 시계는 operation부터 64 Promise checkpoint 뒤 setImmediate sentinel 내부까지입니다. 앞뒤 각 101회 empty drain을 합친 중앙값을 양쪽에서 뺐습니다. 강제 major GC의 시계 안 시작은 0개입니다.

IC・map・deopt와 CPU 계측은 판정 타이머와 별도 프로세스에서 수행했습니다. IC는 각 번들・각 fixture의 20+101 mount, CPU도 별도의 20+101 mount이며 sample interval은 100 µs입니다. profiler의 시간은 상한 집계에 쓰지 않았습니다.

## 판정 열의 상한

아래 Δ는 각 페어 안의 **HEAD 중앙값 − 변형 중앙값**을 계산한 뒤 3회 중앙값을 취한 값입니다. 양수가 빠릅니다. [최소, 최대]는 세 회차의 범위이며 신뢰구간이 아닙니다. 서로 다른 프로세스의 absolute ms를 직접 빼지 않습니다. paired median과 95% 구간, 회차별 HEAD/V absolute ms는 뒤 표와 JSON에 별도로 기록했습니다.

| 작업 | candidate | unfrozen | uniform-gates | uniform-arrays | owned-inline |
| --- | ---: | ---: | ---: | ---: | ---: |
| nested-d5-f4 mount | -0.4635 [-0.5846, -0.4278] | 1.7227 [1.5394, 1.7652] | -1.4908 [-1.4910, -1.4010] | -4.6475 [-4.7686, -4.5795] | 1.0432 [0.8864, 1.2337] |
| flat-500 mount | -0.0730 [-0.0770, -0.0501] | 0.3098 [0.2827, 0.3120] | -0.3367 [-0.3415, -0.3167] | -1.2475 [-1.2537, -1.2063] | 0.2748 [0.2483, 0.2776] |
| oneOf-20 mount | 0.0207 [0.0098, 0.0280] | 0.0767 [0.0540, 0.0856] | -0.0197 [-0.0280, -0.0023] | -0.1599 [-0.1645, -0.1559] | 0.0618 [0.0582, 0.0621] |
| sample-0 mount | -0.0026 [-0.0033, -0.0018] | 0.0031 [0.0022, 0.0031] | -0.0052 [-0.0056, -0.0035] | -0.0118 [-0.0127, -0.0085] | 0.0020 [0.0005, 0.0033] |
| sample-0 later | -0.0002 [-0.0017, 0.0008] | 0.0003 [0.0001, 0.0018] | 0.0007 [-0.0021, 0.0010] | 0.0007 [0.0003, 0.0011] | -0.0006 [-0.0007, 0.0029] |
| oneOf-40 later | 0.0240 [0.0230, 0.0297] | 0.0215 [0.0082, 0.0413] | 0.0341 [0.0256, 0.0538] | 0.0054 [-0.0068, 0.0098] | 0.0180 [0.0085, 0.0249] |

동일 HEAD control의 Δ 기준점은 0입니다. 측정된 대조의 차이는 잡음 바닥으로만 사용합니다. 각 절감량의 채택 판정은 기존 95C-01 규칙을 그대로 적용했습니다. 95% paired bootstrap 구간이 0을 넘는 것과, 이 더 보수적인 잡음 판정을 통과하는 것은 서로 다른 조건입니다.

| 작업 | 정책 | H ms | V ms | Δ ms | paired median ms | pooled paired 95% CI | 최대 잡음 ms | 판정 |
| --- | --- | ---: | ---: | ---: | ---: | --- | ---: | --- |
| nested-d5-f4 mount | control | 8.3196 | 8.3611 | -0.0415 | -0.1378 | [-0.2794, 0.2978] | 0.6775 | 잡음 기준 미통과 |
| nested-d5-f4 mount | candidate | 8.6923 | 9.2312 | -0.4635 | -0.6516 | [-0.7692, -0.5413] | 0.5941 | 잡음 기준 미통과 |
| nested-d5-f4 mount | unfrozen | 8.8330 | 7.1356 | 1.7227 | 1.7504 | [1.5545, 1.7662] | 0.5004 | 3/3 개선 |
| nested-d5-f4 mount | uniform-gates | 8.7333 | 10.2241 | -1.4908 | -1.4370 | [-1.6225, -1.3043] | 0.6187 | 3/3 회귀 |
| nested-d5-f4 mount | uniform-arrays | 8.8772 | 13.5246 | -4.6475 | -4.6522 | [-4.7957, -4.5402] | 0.5343 | 3/3 회귀 |
| nested-d5-f4 mount | owned-inline | 8.9442 | 7.9192 | 1.0432 | 0.7960 | [0.8784, 1.1706] | 0.5004 | 3/3 개선 |
| flat-500 mount | control | 3.0561 | 3.0701 | -0.0140 | -0.0060 | [-0.0673, -0.0060] | 0.1278 | 잡음 기준 미통과 |
| flat-500 mount | candidate | 3.0821 | 3.1444 | -0.0730 | -0.0709 | [-0.0813, -0.0570] | 0.1278 | 잡음 기준 미통과 |
| flat-500 mount | unfrozen | 3.0525 | 2.7406 | 0.3098 | 0.3208 | [0.2909, 0.3267] | 0.1278 | 3/3 개선 |
| flat-500 mount | uniform-gates | 3.0769 | 3.4001 | -0.3367 | -0.3316 | [-0.3556, -0.3136] | 0.1278 | 3/3 회귀 |
| flat-500 mount | uniform-arrays | 3.0843 | 4.3206 | -1.2475 | -1.2344 | [-1.2673, -1.2122] | 0.1723 | 3/3 회귀 |
| flat-500 mount | owned-inline | 3.0490 | 2.8007 | 0.2748 | 0.2690 | [0.2510, 0.2795] | 0.1278 | 3/3 개선 |
| oneOf-20 mount | control | 2.0680 | 2.0702 | -0.0022 | -0.0064 | [-0.0244, -0.0026] | 0.0722 | 잡음 기준 미통과 |
| oneOf-20 mount | candidate | 2.0596 | 2.0483 | 0.0207 | 0.0172 | [0.0069, 0.0256] | 0.0655 | 잡음 기준 미통과 |
| oneOf-20 mount | unfrozen | 2.0560 | 1.9907 | 0.0767 | 0.0778 | [0.0636, 0.0834] | 0.0648 | 잡음 기준 미통과 |
| oneOf-20 mount | uniform-gates | 2.0617 | 2.0772 | -0.0197 | -0.0151 | [-0.0268, -0.0090] | 0.0656 | 잡음 기준 미통과 |
| oneOf-20 mount | uniform-arrays | 2.0641 | 2.2271 | -0.1599 | -0.1573 | [-0.1702, -0.1482] | 0.0905 | 3/3 회귀 |
| oneOf-20 mount | owned-inline | 2.0523 | 1.9902 | 0.0618 | 0.0670 | [0.0551, 0.0768] | 0.0783 | 잡음 기준 미통과 |
| sample-0 mount | control | 0.1362 | 0.1360 | 0.0004 | 0.0013 | [-0.0009, 0.0026] | 0.0230 | 잡음 기준 미통과 |
| sample-0 mount | candidate | 0.1386 | 0.1406 | -0.0026 | -0.0025 | [-0.0042, -0.0010] | 0.0207 | 잡음 기준 미통과 |
| sample-0 mount | unfrozen | 0.1361 | 0.1330 | 0.0031 | 0.0029 | [0.0018, 0.0041] | 0.0212 | 잡음 기준 미통과 |
| sample-0 mount | uniform-gates | 0.1382 | 0.1419 | -0.0052 | -0.0045 | [-0.0055, -0.0033] | 0.0206 | 잡음 기준 미통과 |
| sample-0 mount | uniform-arrays | 0.1345 | 0.1463 | -0.0118 | -0.0109 | [-0.0123, -0.0092] | 0.0184 | 잡음 기준 미통과 |
| sample-0 mount | owned-inline | 0.1360 | 0.1331 | 0.0020 | 0.0014 | [0.0011, 0.0038] | 0.0238 | 잡음 기준 미통과 |
| sample-0 later | control | 0.0886 | 0.0888 | 0.0001 | 0.0009 | [-0.0005, 0.0016] | 0.0162 | 잡음 기준 미통과 |
| sample-0 later | candidate | 0.0893 | 0.0899 | -0.0002 | -0.0001 | [-0.0008, 0.0010] | 0.0172 | 잡음 기준 미통과 |
| sample-0 later | unfrozen | 0.0901 | 0.0885 | 0.0003 | 0.0005 | [-0.0001, 0.0017] | 0.0210 | 잡음 기준 미통과 |
| sample-0 later | uniform-gates | 0.0886 | 0.0891 | 0.0007 | 0.0011 | [-0.0003, 0.0012] | 0.0175 | 잡음 기준 미통과 |
| sample-0 later | uniform-arrays | 0.0906 | 0.0895 | 0.0007 | 0.0008 | [-0.0007, 0.0013] | 0.0176 | 잡음 기준 미통과 |
| sample-0 later | owned-inline | 0.0915 | 0.0898 | -0.0006 | -0.0004 | [-0.0008, 0.0011] | 0.0176 | 잡음 기준 미통과 |
| oneOf-40 later | control | 0.9613 | 0.9560 | 0.0053 | 0.0057 | [-0.0006, 0.0058] | 0.0357 | 잡음 기준 미통과 |
| oneOf-40 later | candidate | 1.0297 | 1.0068 | 0.0240 | 0.0272 | [0.0215, 0.0325] | 0.0353 | 잡음 기준 미통과 |
| oneOf-40 later | unfrozen | 0.9877 | 0.9464 | 0.0215 | 0.0198 | [0.0191, 0.0295] | 0.0381 | 잡음 기준 미통과 |
| oneOf-40 later | uniform-gates | 0.9681 | 0.9327 | 0.0341 | 0.0402 | [0.0338, 0.0438] | 0.0338 | 잡음 기준 미통과 |
| oneOf-40 later | uniform-arrays | 0.9627 | 0.9696 | 0.0054 | 0.0045 | [-0.0049, 0.0066] | 0.0462 | 잡음 기준 미통과 |
| oneOf-40 later | owned-inline | 1.0284 | 1.0105 | 0.0180 | 0.0196 | [0.0157, 0.0270] | 0.0561 | 잡음 기준 미통과 |

candidate의 nested와 flat Δ는 세 회차 모두 음수였지만, 이번 no-op 대조 변동까지 포함한 엄격한 판정은 위 표를 따릅니다. 작은 sample mount와 두 후속 update는 안정적인 개선 근거가 없습니다. oneOf-40에서는 신호의 방향이 양수인 정책도 있으나 세 회차 모두 잡음 밖이라는 조건을 충족하지 못합니다.

## IC와 deopt

자체 parser는 code-creation의 PC 범위로 bundle 소유를 판별하고 source map과 원본 AST로 실제 접근 함수를 찾습니다. 최적화 코드에 inline된 접근은 caller가 아니라 원본 helper로 귀속했습니다. 동일한 동적 접근의 키들은 한 사이트로 합쳤습니다. map-details의 요소 종류・동결 특성・descriptor를 사용했으며 map 주소 자체는 같은 프로세스 안에서만 의미가 있습니다.

M/P/N은 V8의 mono/poly/mega 상태입니다. N 이후 map 수는 관측 하한입니다. 동적 키만 바뀌어도 N이 될 수 있어 N을 ‘receiver map이 다섯 개 이상’으로 해석하지 않습니다. IC는 전환 로그이며 호출 횟수나 완전한 load census가 아닙니다. map 필드 미제공과 로그 없음은 0개 shape 또는 통과로 해석하지 않았습니다.

| fixture | 정책 | 함수 | mono/poly/mega 사이트 | 동결 혼합 사이트 | warmup/sample product deopt | sample wrong map |
| --- | --- | --- | --- | ---: | --- | ---: |
| nested-d5-f4 | head | buildNodes | 67/8/0 | 0 | 3/0 | 0 |
| nested-d5-f4 | head | populateNodeChildren | 91/0/0 | 0 | 0/0 | 0 |
| nested-d5-f4 | head | collectDeclarations | 46/19/1 | 0 | 0/0 | 0 |
| nested-d5-f4 | head | assembleObject | 40/0/0 | 0 | 0/0 | 0 |
| nested-d5-f4 | head | commitStaticFirstNode | 17/0/0 | 0 | 0/0 | 0 |
| nested-d5-f4 | head | loadStaticFirstTree | 53/2/1 | 0 | 1/0 | 0 |
| nested-d5-f4 | candidate | buildNodes | 71/3/0 | 0 | 5/0 | 0 |
| nested-d5-f4 | candidate | populateNodeChildren | 89/0/0 | 0 | 0/1 | 1 |
| nested-d5-f4 | candidate | collectDeclarations | 60/6/1 | 0 | 0/0 | 0 |
| nested-d5-f4 | candidate | assembleObject | 40/0/0 | 0 | 0/0 | 0 |
| nested-d5-f4 | candidate | commitStaticFirstNode | 17/0/0 | 0 | 0/0 | 0 |
| nested-d5-f4 | candidate | loadStaticFirstTree | 66/2/1 | 0 | 1/0 | 0 |
| nested-d5-f4 | candidate | freezeBlueprintDeclarations | 1/3/0 | 1 | 0/2 | 2 |
| nested-d5-f4 | candidate | freezeEffectiveSchema | 4/1/2 | 0 | 0/0 | 0 |
| nested-d5-f4 | unfrozen | buildNodes | 67/7/0 | 0 | 3/0 | 0 |
| nested-d5-f4 | unfrozen | populateNodeChildren | 89/0/0 | 0 | 0/0 | 0 |
| nested-d5-f4 | unfrozen | collectDeclarations | 46/18/1 | 0 | 1/0 | 0 |
| nested-d5-f4 | unfrozen | assembleObject | 40/0/0 | 0 | 0/0 | 0 |
| nested-d5-f4 | unfrozen | commitStaticFirstNode | 17/0/0 | 0 | 0/0 | 0 |
| nested-d5-f4 | unfrozen | loadStaticFirstTree | 66/2/1 | 0 | 1/0 | 0 |
| nested-d5-f4 | uniform-gates | buildNodes | 66/8/0 | 0 | 2/0 | 0 |
| nested-d5-f4 | uniform-gates | populateNodeChildren | 89/0/0 | 0 | 0/1 | 1 |
| nested-d5-f4 | uniform-gates | collectDeclarations | 46/20/1 | 0 | 0/0 | 0 |
| nested-d5-f4 | uniform-gates | assembleObject | 40/0/0 | 0 | 0/0 | 0 |
| nested-d5-f4 | uniform-gates | commitStaticFirstNode | 17/0/0 | 0 | 0/0 | 0 |
| nested-d5-f4 | uniform-gates | loadStaticFirstTree | 66/2/1 | 0 | 1/0 | 0 |
| nested-d5-f4 | uniform-gates | freezeBlueprintDeclarations | 2/2/0 | 0 | 0/1 | 1 |
| nested-d5-f4 | uniform-gates | freezeEffectiveSchema | 4/1/2 | 0 | 0/0 | 0 |
| nested-d5-f4 | uniform-arrays | buildNodes | 66/8/0 | 0 | 2/0 | 0 |
| nested-d5-f4 | uniform-arrays | populateNodeChildren | 89/0/0 | 0 | 0/1 | 1 |
| nested-d5-f4 | uniform-arrays | collectDeclarations | 46/20/1 | 0 | 0/0 | 0 |
| nested-d5-f4 | uniform-arrays | assembleObject | 40/0/0 | 0 | 0/0 | 0 |
| nested-d5-f4 | uniform-arrays | commitStaticFirstNode | 17/0/0 | 0 | 0/0 | 0 |
| nested-d5-f4 | uniform-arrays | loadStaticFirstTree | 66/2/1 | 0 | 1/0 | 0 |
| nested-d5-f4 | uniform-arrays | freezeBlueprintDeclarations | 2/2/0 | 0 | 0/1 | 1 |
| nested-d5-f4 | uniform-arrays | freezeEffectiveSchema | 4/1/2 | 0 | 0/0 | 0 |
| nested-d5-f4 | owned-inline | buildNodes | 67/7/0 | 0 | 2/0 | 0 |
| nested-d5-f4 | owned-inline | populateNodeChildren | 91/0/0 | 0 | 0/0 | 0 |
| nested-d5-f4 | owned-inline | collectDeclarations | 47/19/1 | 0 | 0/0 | 0 |
| nested-d5-f4 | owned-inline | assembleObject | 40/0/0 | 0 | 0/0 | 0 |
| nested-d5-f4 | owned-inline | commitStaticFirstNode | 17/0/0 | 0 | 0/0 | 0 |
| nested-d5-f4 | owned-inline | loadStaticFirstTree | 66/2/1 | 0 | 1/0 | 0 |
| nested-d5-f4 | owned-inline | freezeEffectiveSchema | 3/7/0 | 0 | 0/0 | 0 |
| flat-500 | head | buildNodes | 67/8/0 | 0 | 0/0 | 0 |
| flat-500 | head | populateNodeChildren | 91/0/0 | 0 | 0/0 | 0 |
| flat-500 | head | collectDeclarations | 46/19/1 | 0 | 0/0 | 0 |
| flat-500 | head | assembleObject | 40/0/0 | 0 | 0/0 | 0 |
| flat-500 | head | commitStaticFirstNode | 17/0/0 | 0 | 1/0 | 0 |
| flat-500 | head | loadStaticFirstTree | 66/2/1 | 0 | 1/0 | 0 |
| flat-500 | candidate | buildNodes | 67/7/0 | 0 | 0/0 | 0 |
| flat-500 | candidate | populateNodeChildren | 88/1/0 | 0 | 0/0 | 0 |
| flat-500 | candidate | collectDeclarations | 47/19/1 | 0 | 0/0 | 0 |
| flat-500 | candidate | assembleObject | 40/0/0 | 0 | 0/0 | 0 |
| flat-500 | candidate | commitStaticFirstNode | 17/0/0 | 0 | 1/0 | 0 |
| flat-500 | candidate | loadStaticFirstTree | 66/2/1 | 0 | 1/0 | 0 |
| flat-500 | candidate | freezeBlueprintDeclarations | 1/3/0 | 1 | 1/1 | 1 |
| flat-500 | candidate | freezeEffectiveSchema | 4/1/2 | 0 | 1/0 | 0 |
| flat-500 | unfrozen | buildNodes | 67/7/0 | 0 | 0/0 | 0 |
| flat-500 | unfrozen | populateNodeChildren | 88/1/0 | 0 | 0/0 | 0 |
| flat-500 | unfrozen | collectDeclarations | 46/18/1 | 0 | 0/0 | 0 |
| flat-500 | unfrozen | assembleObject | 40/0/0 | 0 | 0/0 | 0 |
| flat-500 | unfrozen | commitStaticFirstNode | 17/0/0 | 0 | 1/0 | 0 |
| flat-500 | unfrozen | loadStaticFirstTree | 66/2/1 | 0 | 1/0 | 0 |
| flat-500 | uniform-gates | buildNodes | 66/8/0 | 0 | 0/0 | 0 |
| flat-500 | uniform-gates | populateNodeChildren | 88/1/0 | 0 | 0/0 | 0 |
| flat-500 | uniform-gates | collectDeclarations | 46/20/1 | 0 | 0/0 | 0 |
| flat-500 | uniform-gates | assembleObject | 40/0/0 | 0 | 0/0 | 0 |
| flat-500 | uniform-gates | commitStaticFirstNode | 17/0/0 | 0 | 1/0 | 0 |
| flat-500 | uniform-gates | loadStaticFirstTree | 66/2/1 | 0 | 1/0 | 0 |
| flat-500 | uniform-gates | freezeBlueprintDeclarations | 2/2/0 | 0 | 0/2 | 2 |
| flat-500 | uniform-gates | freezeEffectiveSchema | 4/1/2 | 0 | 1/0 | 0 |
| flat-500 | uniform-arrays | buildNodes | 66/8/0 | 0 | 0/0 | 0 |
| flat-500 | uniform-arrays | populateNodeChildren | 89/0/0 | 0 | 0/0 | 0 |
| flat-500 | uniform-arrays | collectDeclarations | 46/20/1 | 0 | 0/0 | 0 |
| flat-500 | uniform-arrays | assembleObject | 40/0/0 | 0 | 0/0 | 0 |
| flat-500 | uniform-arrays | commitStaticFirstNode | 17/0/0 | 0 | 1/0 | 0 |
| flat-500 | uniform-arrays | loadStaticFirstTree | 66/2/1 | 0 | 1/0 | 0 |
| flat-500 | uniform-arrays | freezeBlueprintDeclarations | 2/2/0 | 0 | 0/2 | 2 |
| flat-500 | uniform-arrays | freezeEffectiveSchema | 4/1/2 | 0 | 1/0 | 0 |
| flat-500 | owned-inline | buildNodes | 67/7/0 | 0 | 0/0 | 0 |
| flat-500 | owned-inline | populateNodeChildren | 90/1/0 | 0 | 0/0 | 0 |
| flat-500 | owned-inline | collectDeclarations | 47/19/1 | 0 | 0/0 | 0 |
| flat-500 | owned-inline | assembleObject | 40/0/0 | 0 | 0/0 | 0 |
| flat-500 | owned-inline | commitStaticFirstNode | 17/0/0 | 0 | 1/0 | 0 |
| flat-500 | owned-inline | loadStaticFirstTree | 66/2/1 | 0 | 1/0 | 0 |
| flat-500 | owned-inline | freezeEffectiveSchema | 3/7/0 | 0 | 0/0 | 0 |

nested에서 buildNodes는 HEAD 67/8/0 → candidate 71/3/0, populateNodeChildren는 91/0/0 → 89/0/0, assembleObject는 양쪽 40/0/0입니다. 원래 주요 소비 사이트가 후보에서 일괄적으로 frozen/non-frozen 혼합이나 megamorphic 상태로 바뀌는 패턴은 없습니다. flat에서도 assembleObject・commitStaticFirstNode의 모든 기록 사이트는 mono이고 동결 혼합이 없습니다.

candidate의 실제 혼합은 새 `freezeBlueprintDeclarations.ts:17`의 `gates.length`입니다. 같은 사이트에서 PACKED_FROZEN_ELEMENTS, PACKED_SMI_ELEMENTS, HOLEY_SMI_ELEMENTS의 **3개 map**과 0→1→P를 관측했습니다. fragment/raw declaration이 공유하는 gates는 `collectDeclarations.ts:46,68`에서 생성되고 완료 때 동결되며, 바인딩 declaration의 gates는 `populateNodeChildren.ts:173`의 map 결과로 생성되어 운영에서는 동결되지 않습니다. 공유 배열과 소유 배열의 구분은 맞지만, 이 길이 읽기는 새 완료 단계 안에 있습니다.

uniform-gates에서는 위 길이 읽기가 동결된 배열 1개 map의 mono로 바뀌었고 동결 혼합 사이트는 0개가 됐습니다. 그러나 gate 동결 호출을 추가한 순 비용으로 nested Δ -1.4908 ms, flat Δ -0.3367 ms였습니다. 따라서 혼합 제거만으로 채택할 수 없습니다. 추가 동결 비용이 포함되므로 혼합 효과의 정확한 0 증명도 아닙니다.

candidate의 `freezeEffectiveSchema.ts:21`은 `schema[OWNED_KEYS[index]]`라는 한 동적 접근입니다. 7개 이름과 두 가지 object schema map이 섞여 N이 됩니다. frozen/non-frozen receiver 혼합은 아니며, clause 접근을 포함해 두 mega 사이트가 새로 생겼습니다. owned-inline은 이를 고정 필드 읽기로 바꾸며 완료 순회 자체를 없앴습니다.

candidate의 sample phase에서 nested product wrong-map deopt는 10개, HEAD는 0개입니다. 그러나 unfrozen에도 2개가 있습니다. `visitShape`의 some/filter 사이트에서 PACKED_ELEMENTS와 HOLEY_ELEMENTS를 확인했으며, 동결을 전부 제거한 번들에도 같은 전환이 있습니다. wrong map을 곧바로 frozen map 원인으로 읽어서는 안 됩니다. unknown lazy deopt에는 이유를 만들어 붙이지 않았습니다.

selectChildren, computeNode, markWrite, readProjectedValue는 이 두 mount의 IC 로그에 없었습니다. 무게이트 fixture의 StaticFirstLoad 경로에서는 주로 loadStaticFirstTree → commitStaticFirstNode가 실행됩니다. oneOf의 전체 commit・gate 경로에 대한 IC 증거로 일반화하지 않습니다. 요청하신 모든 함수와 각 property/element 사이트의 map 수・주소・state・요소 종류는 이 보고서 마지막 표와 `ic-*.json`에 있습니다.

### 생성 위치의 실제 객체 확인

별도의 동일 20+101 mount 뒤 %DebugPrint를 실행했습니다. 이 probe는 타이머나 IC 근거 번들의 명령을 바꾸지 않았으며 마지막 관측 단계에서만 객체를 읽었습니다. 위치는 HEAD 생성 site를 기준으로 한 안정적인 참조이고 후보의 추가 import/줄 이동은 source snapshot에 남겼습니다.

| 종류 | 생성 위치 (blueprint/utils 아래) | candidate 동결 | 실제 elements kind |
| --- | --- | --- | --- |
| fragment.gates | analyze/collectDeclarations.ts:46 | 동결 | PACKED_FROZEN_ELEMENTS |
| raw.gates | analyze/collectDeclarations.ts:46 | 동결 | PACKED_FROZEN_ELEMENTS |
| bound.gates | analyze/populateNodeChildren.ts:173 | 비동결 | PACKED_SMI_ELEMENTS |
| raw.order | analyze/collectDeclarations.ts:67 | 동결 | PACKED_FROZEN_ELEMENTS |
| bound.order | analyze/collectDeclarations.ts:67 | 동결 | PACKED_FROZEN_ELEMENTS |
| raw.declaration | analyze/collectDeclarations.ts:76 | 비동결 | HOLEY_ELEMENTS |
| bound.declaration | analyze/populateNodeChildren.ts:164 | 비동결 | HOLEY_ELEMENTS |
| node.declarations | analyze/buildNodes.ts:70 | 비동결 | HOLEY_ELEMENTS |
| entry.declarations | analyze/populateNodeChildren.ts:163 | 비동결 | PACKED_ELEMENTS |
| public.schema | effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:39 | 동결 | HOLEY_FROZEN_ELEMENTS |

raw/bound declaration 객체는 둘 다 비동결입니다. 공개 유효 schema는 동결입니다. 따라서 서로 다른 record 종류의 상태가 다르다는 사실과 **같은 access site**가 여러 상태의 receiver를 읽는다는 사실을 구분해야 합니다. ready-time node.declarations의 HOLEY와 entry.declarations의 PACKED 차이도 동결과 별개입니다.

### 별도 CPU 표본

| 번들 | 함수 | self ms/mount | inclusive ms/mount |
| --- | --- | ---: | ---: |
| head | blueprint | 0.3215 | 6.5872 |
| candidate | freezeBlueprintValue | 1.2712 | 1.2712 |
| candidate | freezeBlueprintValues | 0.1063 | 1.4644 |
| candidate | blueprint | 0.0810 | 7.9017 |
| candidate | freezeEffectiveSchema | 0.0622 | 0.1271 |
| candidate | freezeBlueprintDeclarations | 0.0261 | 0.0261 |
| owned-inline | freezeEffectiveSchema | 0.0723 | 0.0723 |
| owned-inline | blueprint | 0.0239 | 5.8432 |

candidate freezeBlueprintValues의 inclusive 값은 약 1.46 ms/mount이며 하위 freezeBlueprintValue 자체 self가 약 1.27 ms/mount입니다. 이 함수의 WeakSet.has/add와 native freeze 비용은 CPU 표본에서 서로 분리되지 않습니다. 별도 표본은 비용 위치를 설명하는 증거이고 판정 열의 절감량이나 두 비용의 합산 상한이 아닙니다.

## 종류별 정책과 보호

| 종류 | uniform-gates | uniform-arrays | 권장 owned-inline |
| --- | --- | --- | --- |
| fragment/raw/bound gates | 생성 시 모두 동결 | 생성 시 모두 동결 | record마다 새 배열을 소유하고 운영에서 비동결 |
| order | 공유 동결 유지 | 공유 동결 유지 | fragment/raw/bound/lazy 별 소유 복사; 운영 비동결 |
| declarations/childEntries 등 보유 membership | 후보의 소유・공유 구분 유지 | 해당 배열 종류 모두 동결 | 각 소유자의 새 배열; virtual edge의 공유 목록과 entry도 복사 |
| 일반 node/fragment/declaration/entry 기록 | 개발에서 동결 | 개발에서 동결 | 운영 비동결・개발 동결; 공유 metadata와 private graph 연결을 구분 |
| gate/evaluationReads/discriminator/appliesWhen | 후보의 공유 보호 유지 | 공유 보호 유지 | 공유 가능한 gate를 생성 시 보호; appliesWhen은 별도 소유 복사 후 동결 |
| EffectiveSchema 봉투 | 후보의 false 공유 상수는 동결 | 동일 | false도 새 소유 봉투; 운영의 일반 봉투와 일관되게 비동결 |
| 공개 schema/schemaType/생산자가 만든 공개 배열・봉투 | 완료 때 보호 | 완료 때 보호 | 생성 완료 시 보호; 고정 필드 읽기・owned index만 사용 |
| 완료 순회/FrozenBlueprintValues | 유지 | 유지・보호 대상 증가 | 운영에서 수행하지 않음; 개발에서만 완료 보호 |

소유 복사를 택할 때 virtual node가 빌리던 child entry와 declaration 목록, validation-only 복사, lazy item binding의 order/gates까지 함께 소유하게 했습니다. 원래 gate 객체의 재사용과 authored 조건・default・hint의 빌린 하위 값은 보존합니다. cache hit의 참조 재사용과 공개 node/value 동작도 유지합니다. 내부 alias의 개수는 바뀌므로 원래 내부 identity를 제품 계약으로 넓게 약속했다면 별도 계약 검토가 필요합니다.

59개 스키마 × collect off/on의 118 capture에서 정규화 schema・필드 순서・선언/fragment/entry 데이터・오류와 진단을 HEAD와 비교했습니다. 유효 capture 70개에서는 공개 schema와 새 공개 container, shared membership, gate를 얕게 보호하는지 검사했고 입력이 변경되지 않았는지도 검사했습니다. owned-inline은 운영・개발 양쪽에서 통과했습니다. all-unfrozen은 출력 비교만 통과했으며 보호 검사를 의도적으로 적용하지 않은 측정용 상한입니다.

lazy slot 0/1에서 cache 재조회 시 같은 entry와 같은 template 참조를 확인했습니다. 권장 변형의 order/gates는 slot마다 다른 배열이고, HEAD/candidate의 공유 order/gates는 동결돼 있습니다. 성공 mount와 후속 update의 최종 public value hash는 모든 판정 페어에서 같았습니다. 이는 제품 배포 승인이나 전체 React 회귀 시험의 대체가 아닙니다.

## 모드별 동결 수

모듈 로드 때의 상수는 제외했고 blueprint 밖의 기존 동결은 포함했습니다. calls와 distinct 수를 별도로 세었으며 아래 최종 자료의 alias 추가 호출과 primitive 호출은 0개입니다. 배열 복사 수・메모리 byte는 동결 수와 같지 않으며 측정하지 않았습니다.

| 폼 | 정책 | 운영 distinct / node | 개발 distinct / node | 운영 distinct | 개발 distinct |
| --- | --- | ---: | ---: | ---: | ---: |
| nested-d5-f4 | head | 18.2498 | 19.2498 | 24911 | 26276 |
| nested-d5-f4 | candidate | 4.2498 | 19.2498 | 5801 | 26276 |
| nested-d5-f4 | unfrozen | 1.2498 | 2.2498 | 1706 | 3071 |
| nested-d5-f4 | uniform-gates | 5.2491 | 19.2498 | 7165 | 26276 |
| nested-d5-f4 | uniform-arrays | 12.2498 | 19.2498 | 16721 | 26276 |
| nested-d5-f4 | owned-inline | 2.2498 | 22.2505 | 3071 | 30372 |
| flat-500 | head | 18.0020 | 19.0020 | 9019 | 9520 |
| flat-500 | candidate | 4.0020 | 19.0020 | 2005 | 9520 |
| flat-500 | unfrozen | 1.0020 | 2.0020 | 502 | 1003 |
| flat-500 | uniform-gates | 5.0000 | 19.0020 | 2505 | 9520 |
| flat-500 | uniform-arrays | 12.0020 | 19.0020 | 6013 | 9520 |
| flat-500 | owned-inline | 2.0020 | 22.0040 | 1003 | 11024 |
| oneOf-20 | head | 21.1905 | 21.2857 | 1335 | 1341 |
| oneOf-20 | candidate | 3.5079 | 19.3492 | 221 | 1219 |
| oneOf-20 | unfrozen | 0.0794 | 0.1746 | 5 | 11 |
| oneOf-20 | uniform-gates | 4.4921 | 19.3492 | 283 | 1219 |
| oneOf-20 | uniform-arrays | 13.1429 | 19.3492 | 828 | 1219 |
| oneOf-20 | owned-inline | 1.8413 | 24.9048 | 116 | 1569 |
| sample-0 | head | 18.3333 | 19.3333 | 55 | 58 |
| sample-0 | candidate | 4.6667 | 19.6667 | 14 | 59 |
| sample-0 | unfrozen | 1.3333 | 2.3333 | 4 | 7 |
| sample-0 | uniform-gates | 5.3333 | 19.6667 | 16 | 59 |
| sample-0 | uniform-arrays | 12.6667 | 19.6667 | 38 | 59 |
| sample-0 | owned-inline | 2.6667 | 23.0000 | 8 | 69 |

권장 정책의 운영 수는 nested 3071/1365, flat 1003/501, oneOf 116/63, sample 8/3입니다. nested・flat은 공개 schema N개와 blueprint 밖의 기존 동결이 대부분입니다. 개발 수는 소유 복사본을 보호하므로 nested 30372/1365, flat 11024/501입니다. 개발 비용 증가를 숨기고 ‘운영 수 감소’만으로 추천하지 않습니다.

oneOf의 권장 생성 지점 보호는 버려질 정적 schema도 보호하여 static schema 63개를 처리합니다. 후보의 완료 방식에서는 61개 정적 schema를 보유하지 않아 제외합니다. 이 수명 차이가 있으므로 schema freeze 수만으로 완료 정책이 더 낫다고 판단하지 않습니다. 앞선 2.1253 ms 상한은 다른 HEAD와 전체 source freeze 제거였고, 이번 unfrozen은 blueprint 안만 제거했으므로 숫자가 같아야 할 이유가 없습니다.

## 실행・산출물 확인

최종 타이머 프로세스 108개, paired sample 10908쌍의 행/개수/값 해시와 순차 실행을 확인했습니다. 측정/빌드 driver ledger에 기록된 프로세스의 최대 시간은 13.511초이며 signal은 0개입니다. build service는 stdin EOF로 정상 종료했습니다. 초기 unfrozen 빌드의 wrapper/경로 설정 실패는 수정됐고 실패 시간은 집계하지 않았습니다. 권장 정책 정리 뒤에는 해당 정책의 18개 타이머와 IC・CPU・계수를 새 번들로 재실행했습니다.

자연 종료 조건 위반 1회: 측정 전 초기 파일 목록 수집의 rg는 execFileSync 출력 maxBuffer 초과(ENOBUFS, errno -55)로 SIGTERM 종료됐습니다. 이 수집 오류는 측정 자료에 사용하지 않았습니다. 위 signal 0개는 측정/빌드 driver ledger 범위이며, 이번 작업의 모든 프로세스가 자연 종료했다는 뜻은 아닙니다.

HEAD는 그대로이고 `packages/canard/schema-form/src`의 tracked diff는 없습니다. git write・설치・제품 소스 수정・monorepo 검사・병렬 측정은 수행하지 않았습니다. 모든 bundle/map과 원시 V8 로그는 지정된 저장소 밖 bundles 경로에만 있습니다. D 아래 실행별 파일은 profile-103-freeze에만 만들었고 5 MB cap을 검사했습니다. 이 두 보고서는 D의 요청된 경로에 있습니다.

- [전체 요약 JSON](profile-103-freeze-summary.json)
- [측정 및 메모리 변형](profile-103-freeze/measure.mjs)
- [IC parser](profile-103-freeze/parse-ic.mjs)
- [통계와 보고서 생성](profile-103-freeze/summarize.mjs)
- 원시 타이머: `profile-103-freeze/time-{variant}-{fixture}-{mode}-r{1,2,3}.json`
- 상세 IC/map: `profile-103-freeze/ic-{variant}-{fixture}.json`
- 원시 V8/deopt/CPU: `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles/profile103`

## 주요 함수의 각 접근 사이트

각 행은 원본 source map의 file:line:column과 IC 종류/키를 주소로 삼습니다. 열은 관측 map 수/최종 상태이며 동적 키 집합과 map 주소・descriptor는 상세 IC JSON에 있습니다. 행을 묶어 합치면서 누락하지 않도록 모든 요청 함수와 추가 완료/검증/commit 함수의 기록 사이트를 정책별로 보존했습니다. `미제공`은 map 필드가 없다는 뜻이고 `N≥`는 관측 하한입니다. 상태 other는 일반 IC의 1/P/N 전환을 기록하지 않은 사이트입니다.

### nested-d5-f4 / head

| 함수 | file:line:column (src/core/ 생략) | 접근 | map 수 / state | 요소 종류 |
| --- | --- | --- | --- | --- |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:24 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:82:6 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:28 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:84:6 | StoreIC kind | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:85:6 | StoreIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:86:6 | StoreIC nullable | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:87:16 | StoreIC strategy | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:88:27 | StoreIC declarations | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:34 | StoreIC isAtomic | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:98:33 | StoreIC collect | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:36:37 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:37:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:37:32 | LoadIC gates | 53 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:39:36 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:40:14 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:42:24 | LoadIC stringify | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:42:35 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:12 | LoadIC templates | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:22 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:47 | LoadIC constructing | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:60 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:45:27 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:49:51 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:40 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:69 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:74 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:54:37 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:55:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:58:36 | LoadIC allowed | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:58:44 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:59:28 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:61:19 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:64:14 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:64:53 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:65:36 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:72:36 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:72:49 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:73:32 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:74:32 | LoadIC scope | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:77:24 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:78:16 | LoadIC context | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:78:56 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:18 | LoadIC nodes | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:24 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:28 | LoadIC schemaPath | 53 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:88:27 | LoadIC freeze | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:91:18 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:26 | LoadIC options | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:34 | LoadIC isAtomic | 115 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:98:33 | LoadIC collect | 115 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:101:26 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:101:42 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_FROZEN_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:101:63 | LoadIC gates | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:101:69 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:101:91 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:22 | LoadIC isAtomic | 115 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:64 | LoadIC collect | 115 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:103:26 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_FROZEN_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:104:33 | LoadIC schema | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:105:22 | LoadIC context | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:106:20 | LoadIC role | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:106:58 | LoadIC scope | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:107:21 | LoadIC validationOnly | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:108:17 | LoadIC nullable | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:108:50 | LoadIC pattern | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:109:26 | LoadIC type | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:110:26 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:112:10 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:114:20 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:115:23 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:116:36 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:117:17 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:118:13 | LoadIC strategy | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:121:23 | LoadIC delete | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:61:27 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:62:25 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:63:29 | StoreIC inherited | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:64:21 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:24 | StoreIC fragment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:76:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:77:62 | StoreIC schemaPath | 49 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:43 | StoreIC order | 49 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:14 | StoreIC gates | 52 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:48 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:48 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:50 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:50 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:56 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:77:37 | LoadIC schemaPath | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:77:62 | LoadIC escapeSegment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:33 | LoadIC order | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:33 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:33 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:81:11 | LoadIC filter | 1 / mono | HOLEY_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:84:10 | LoadIC map | 1 / mono | HOLEY_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:32 | LoadIC gates | 52 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:32 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:42 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:42 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:42 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:36 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:89:24 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:89:35 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:90:47 | LoadIC findIndex | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:166:10 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:167:10 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:168:25 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:172:28 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:173:24 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:184:10 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:185:16 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:186:25 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:187:31 | StoreIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:164:15 | LoadIC freeze | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:168:25 | LoadIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:170:24 | LoadIC schemaPath | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:170:45 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:171:16 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:171:26 | LoadIC schemaPath | 52 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:174:24 | LoadIC gates | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:174:30 | LoadIC map | 1 / mono | PACKED_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:15 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:14 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:14 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:20 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:25 | LoadIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:33 | LoadIC escapeSegment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:31:32 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:31:45 | LoadIC flatMap | 1 / mono | PACKED_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:33 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:33 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:52:48 | LoadIC schema | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:54:13 | LoadIC type | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:55:7 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:61:27 | LoadIC context | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:62:25 | LoadIC gates | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:63:29 | LoadIC inherited | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:24 | LoadIC fragments | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:46 | LoadIC fragmentId | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:24 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:69:11 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:70:13 | LoadIC properties | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:13 | LoadIC entries | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:38 | LoadIC forEach | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:159:23 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:31 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:31 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:24 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:24 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:15 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:33 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:46 | LoadIC map | 1 / mono | PACKED_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:182:14 | LoadIC push | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:183:15 | LoadIC freeze | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:192:17 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:194:13 | LoadIC size | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:28 | LoadIC schema | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:34 | LoadIC controls | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:62 | LoadIC map | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:62:26 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:63:14 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:64:22 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:65:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:66:19 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:67:18 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:68:18 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:77:16 | StoreIC declarationId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:77:16 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:15 | LoadIC slice | 3 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:26 | LoadIC lastIndexOf | 3 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:15 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:79:4 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:80:22 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:81:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:82:25 | StoreIC fragmentId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:83:16 | StoreIC role | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:84:17 | StoreIC scope | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:86:19 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:87:20 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:88:20 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:89:21 | StoreIC inherited | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:90:20 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:130:62 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:34:15 | LoadIC includes | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:34:30 | LoadIC schemaPath | 53 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:35:40 | LoadIC schema | 53 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:40:10 | LoadIC isFragment | 53 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:42:59 | LoadIC options | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:44:12 | LoadIC gates | 53 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:44:18 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:44:34 | LoadIC context | 53 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:48:11 | LoadIC controls | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:62:16 | LoadIC fragments | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:62:26 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:67:18 | LoadIC freeze | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:67:35 | LoadIC order | 53 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:74:20 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:8 | LoadIC fragment | 53 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:8 | LoadIC children | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:18 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:41 | LoadIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:77:8 | LoadIC declarationId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:83:16 | LoadIC role | 53 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:87:20 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:88:20 | LoadIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:89:21 | LoadIC inherited | 53 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:90:20 | LoadIC hostPath | 53 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:92:2 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:92:67 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:93:16 | LoadIC id | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:96:18 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:98:15 | LoadIC capabilities | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:98:28 | LoadIC branchless | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:110:20 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:110:36 | StoreInArrayLiteralIC <dynamic> | 미제공 / poly |  |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:111:20 | LoadIC $ref | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:131:28 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:131:28 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:131:28 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:131:11 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:131:11 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:131:20 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:137:10 | KeyedLoadIC <dynamic> | ≥2 / mega | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:138:9 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:61 | LoadIC if | 2 / poly | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:28 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:51 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:72 | StoreIC extras | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:149:4 | StoreIC names | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:19:24 | LoadIC local | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:20:31 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:22 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:22 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:6 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:38 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:59 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:89:18 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:89:40 | LoadIC emit | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:90:21 | LoadIC extras | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:96:42 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:96:48 | LoadIC propertyKeys | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:21 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:21 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:27 | LoadIC blueprintNode | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC childEntries | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:110:23 | LoadIC name | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:111:20 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:111:45 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:112:12 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:113:12 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:114:11 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:21 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:21 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:16 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:150:18 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:150:36 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:18:30 | StoreIC previous | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:18:41 | StoreIC current | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:20:27 | StoreIC type | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:21:89 | StoreIC payload | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:22:60 | StoreIC source | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:22:60 | StoreIC options | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:20:7 | StoreIC pendingDelivery | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:23:7 | StoreIC deliveryInitialized | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:24:7 | StoreIC revisionLedger | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:25:7 | StoreIC pendingRevision | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:18 | StoreIC local | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:36 | StoreIC emit | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:16:23 | LoadIC behavior | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:16:32 | LoadIC strategy | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:18 | LoadIC local | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:36 | LoadIC emit | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:24:58 | LoadIC revisionLedger | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:50:29 | StoreIC deliveries | 미제공 / other |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:51:40 | StoreIC node | 미제공 / other |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:51:53 | StoreIC input | 미제공 / other |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:39 | StoreIC entries | 미제공 / other |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:56 | StoreIC required | 미제공 / other |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:83 | StoreIC children | 미제공 / other |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:60:12 | StoreIC entered | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:61:12 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:74:12 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:76:13 | StoreIC structure | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:77:30 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:77:13 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:86:15 | StoreIC raw | 미제공 / other |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:87:15 | StoreIC extras | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:89:16 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:16 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:101:40 | StoreIC index | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:12 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:25 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:32 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:56 | StoreIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:43 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:60 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:87 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:71:14 | StoreIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:92:18 | StoreIC raw | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:56:15 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:57:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:58:23 | LoadIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:59:15 | LoadIC entered | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:62:17 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:63:26 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:63:33 | LoadIC schema | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:65:35 | LoadIC hasOwnProperty | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:65:82 | LoadIC default | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:66:24 | LoadIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:68:15 | LoadIC behavior | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:68:24 | LoadIC type | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:69:34 | LoadIC blueprintNode | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:34 | LoadIC interpret | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:67 | LoadIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:84 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:75:24 | LoadIC strategy | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:93:25 | LoadIC interactionState | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:14 | LoadIC index | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:28 | LoadIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:36 | LoadIC length | 2 / poly | PACKED_FROZEN_ELEMENTS, HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:113:38 | LoadIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:116:10 | LoadIC pop | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:101:26 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:11 | LoadIC structure | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:28 | LoadIC name | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:32 | KeyedStoreIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:104:12 | LoadIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:104:22 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:29 | LoadIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:38 | LoadIC includes | 1 / mono | PACKED_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:12 | LoadIC push | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:76:32 | LoadIC create | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:78:26 | LoadIC type | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:27 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:35 | LoadIC required | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:118:10 | StoreIC commitNumber | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:22 | LoadIC role | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:61 | LoadIC gates | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:67 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:36:11 | LoadIC declarations | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:36:24 | LoadIC some | 1 / mono | PACKED_FROZEN_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:41:31 | LoadIC node | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:21:9 | LoadIC strategy | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:22:9 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:23:13 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:26:13 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:33:9 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:42:9 | LoadIC delete | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:43:11 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:15 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_FROZEN_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:15 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:15:52 | LoadIC schema | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:15:58 | LoadIC controls | 2 / poly | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC nodes | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:15:7 | LoadIC stringify | 1 / mono | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:16:11 | LoadIC map | 1 / mono | PACKED_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:17:44 | LoadIC schema | 53 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:19:22 | LoadIC $ref | 2 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:21:18 | LoadIC schemaPath | 53 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:22:26 | LoadIC gates | 53 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:22:32 | LoadIC map | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:32:8 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:33:14 | LoadIC context | 53 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:34:14 | LoadIC filter | 2 / poly | PACKED_SMI_ELEMENTS, HOLEY_SMI_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:61:9 | StoreIC type | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:62:40 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:22:14 | LoadIC mode | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:22:43 | LoadIC isAtomic | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:23:12 | LoadIC collect | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:23:42 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:23:59 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:24:9 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:24:22 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:24:51 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:26:22 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:27:29 | LoadIC schema | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:28:27 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_FROZEN_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:28:58 | LoadIC gates | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:28:64 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:29:16 | LoadIC context | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:29:57 | LoadIC role | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:30:16 | LoadIC scope | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:30:48 | LoadIC validationOnly | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:31:49 | LoadIC type | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:32:25 | LoadIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:32:39 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:32:63 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:33:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:33:27 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:33:47 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:34:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:34:30 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:34:53 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:36 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:29 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:54 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:28 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:57 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:40:22 | LoadIC keys | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:41:35 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:42:16 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:43:18 | KeyedLoadIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:59:19 | KeyedStoreIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:62:16 | LoadIC freeze | 1 / mono | HOLEY_ELEMENTS |
### nested-d5-f4 / candidate

| 함수 | file:line:column (src/core/ 생략) | 접근 | map 수 / state | 요소 종류 |
| --- | --- | --- | --- | --- |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:24 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:82:6 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:28 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:84:6 | StoreIC kind | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:85:6 | StoreIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:86:6 | StoreIC nullable | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:87:16 | StoreIC strategy | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:88:20 | StoreIC declarations | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:34 | StoreIC isAtomic | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:98:33 | StoreIC collect | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:36:37 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:37:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:37:32 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:39:36 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:40:14 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:42:24 | LoadIC stringify | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:42:35 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:12 | LoadIC templates | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:22 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:47 | LoadIC constructing | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:60 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:45:27 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:49:51 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:40 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:69 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:74 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:54:37 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:55:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:58:36 | LoadIC allowed | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:58:44 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:59:28 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:61:19 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:64:14 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:64:38 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:65:36 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:72:36 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:72:49 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:73:32 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:74:32 | LoadIC scope | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:77:24 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:78:16 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:78:56 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:18 | LoadIC nodes | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:24 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:28 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:91:18 | LoadIC push | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:26 | LoadIC options | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:34 | LoadIC isAtomic | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:98:33 | LoadIC collect | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:26 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:42 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:63 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:69 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:91 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:103:22 | LoadIC isAtomic | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:103:64 | LoadIC collect | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:104:26 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:105:33 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:106:22 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:107:20 | LoadIC role | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:107:58 | LoadIC scope | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:108:21 | LoadIC validationOnly | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:109:17 | LoadIC nullable | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:109:50 | LoadIC pattern | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:110:26 | LoadIC type | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:111:26 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:113:10 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:115:20 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:116:23 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:117:36 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:118:17 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:119:13 | LoadIC strategy | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:122:23 | LoadIC delete | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:61:27 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:62:25 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:63:29 | StoreIC inherited | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:64:21 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:24 | StoreIC fragment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:76:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:77:62 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:43 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:14 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:48 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:48 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:50 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:50 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:56 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:77:37 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:77:62 | LoadIC escapeSegment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:33 | LoadIC order | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:33 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:33 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:81:11 | LoadIC filter | 1 / mono | HOLEY_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:84:10 | LoadIC map | 1 / mono | HOLEY_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:32 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:32 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:42 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:42 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:42 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:36 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:89:24 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:89:35 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:90:47 | LoadIC findIndex | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:166:10 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:167:10 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:168:25 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:172:28 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:173:35 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:182:10 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:183:16 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:184:25 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:185:10 | StoreIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:168:25 | LoadIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:170:24 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:170:45 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:171:16 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:171:26 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:173:29 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:173:35 | LoadIC map | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:15 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:14 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:14 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:20 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:25 | LoadIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:33 | LoadIC escapeSegment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:31:32 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:31:45 | LoadIC flatMap | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:33 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:33 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:52:48 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:54:13 | LoadIC type | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:55:7 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:61:27 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:62:25 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:63:29 | LoadIC inherited | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:24 | LoadIC fragments | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:46 | LoadIC fragmentId | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:24 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:69:11 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:70:13 | LoadIC properties | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:13 | LoadIC entries | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:38 | LoadIC forEach | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:159:23 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:31 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:31 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:24 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:24 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:15 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:33 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:46 | LoadIC map | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:180:14 | LoadIC push | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:190:17 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:192:13 | LoadIC size | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:28 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:34 | LoadIC controls | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:62 | LoadIC map | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:62:26 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:63:14 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:64:22 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:65:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:66:19 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:67:21 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:68:4 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:77:16 | StoreIC declarationId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:77:16 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:15 | LoadIC slice | 3 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:26 | LoadIC lastIndexOf | 3 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:15 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:79:4 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:80:22 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:81:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:82:25 | StoreIC fragmentId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:83:16 | StoreIC role | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:84:17 | StoreIC scope | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:86:19 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:87:20 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:88:20 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:89:21 | StoreIC inherited | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:90:20 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:131:62 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:34:15 | LoadIC includes | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:34:30 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:35:40 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:40:10 | LoadIC isFragment | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:42:59 | LoadIC options | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:44:12 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:44:18 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:44:34 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:48:11 | LoadIC controls | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:62:16 | LoadIC fragments | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:62:26 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:67:21 | LoadIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:74:20 | LoadIC push | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:8 | LoadIC fragment | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:8 | LoadIC children | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:18 | LoadIC push | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:41 | LoadIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:77:8 | LoadIC declarationId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:83:16 | LoadIC role | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:87:20 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:88:20 | LoadIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:89:21 | LoadIC inherited | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:90:20 | LoadIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:92:10 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:92:23 | LoadIC push | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:93:2 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:93:67 | LoadIC push | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:94:16 | LoadIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:97:18 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:99:15 | LoadIC capabilities | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:99:28 | LoadIC branchless | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:111:20 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:111:36 | StoreInArrayLiteralIC <dynamic> | 미제공 / poly |  |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:112:20 | LoadIC $ref | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:28 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:28 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:28 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:11 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:11 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:20 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:138:10 | KeyedLoadIC <dynamic> | ≥2 / mega | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:139:9 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:133:61 | LoadIC if | 2 / poly | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:28 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:51 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:72 | StoreIC extras | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:149:4 | StoreIC names | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:19:24 | LoadIC local | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:20:31 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:22 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:22 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:6 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:38 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:59 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:89:18 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:89:40 | LoadIC emit | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:90:21 | LoadIC extras | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:96:42 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:96:48 | LoadIC propertyKeys | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:21 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:21 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:27 | LoadIC blueprintNode | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:110:23 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:111:20 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:111:45 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:112:12 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:113:12 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:114:11 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:21 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:21 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:16 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:150:18 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:150:36 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:18:30 | StoreIC previous | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:18:41 | StoreIC current | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:20:27 | StoreIC type | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:21:89 | StoreIC payload | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:22:60 | StoreIC source | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:22:60 | StoreIC options | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:20:7 | StoreIC pendingDelivery | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:23:7 | StoreIC deliveryInitialized | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:24:7 | StoreIC revisionLedger | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:25:7 | StoreIC pendingRevision | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:18 | StoreIC local | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:36 | StoreIC emit | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:16:23 | LoadIC behavior | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:16:32 | LoadIC strategy | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:18 | LoadIC local | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:36 | LoadIC emit | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:24:58 | LoadIC revisionLedger | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:50:29 | StoreIC deliveries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:51:40 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:51:53 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:39 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:56 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:83 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:60:12 | StoreIC entered | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:61:12 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:74:12 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:76:13 | StoreIC structure | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:77:30 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:77:13 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:86:15 | StoreIC raw | 미제공 / other |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:87:15 | StoreIC extras | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:89:16 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:16 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:101:40 | StoreIC index | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:12 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:25 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:32 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:56 | StoreIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:43 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:60 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:87 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:71:14 | StoreIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:92:18 | StoreIC raw | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:56:15 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:57:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:58:23 | LoadIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:59:15 | LoadIC entered | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:62:17 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:63:26 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:63:33 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:65:35 | LoadIC hasOwnProperty | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:65:82 | LoadIC default | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:66:24 | LoadIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:68:15 | LoadIC behavior | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:68:24 | LoadIC type | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:69:34 | LoadIC blueprintNode | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:34 | LoadIC interpret | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:67 | LoadIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:84 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:75:24 | LoadIC strategy | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:93:25 | LoadIC interactionState | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:14 | LoadIC index | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:28 | LoadIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:36 | LoadIC length | 2 / poly | PACKED_FROZEN_ELEMENTS, HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:113:38 | LoadIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:116:10 | LoadIC pop | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:101:26 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:11 | LoadIC structure | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:28 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:32 | KeyedStoreIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:104:12 | LoadIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:104:22 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:29 | LoadIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:38 | LoadIC includes | 1 / mono | PACKED_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:12 | LoadIC push | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:76:32 | LoadIC create | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:78:26 | LoadIC type | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:27 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:35 | LoadIC required | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:118:10 | StoreIC commitNumber | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:45:23 | LoadIC runtime | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:46:26 | LoadIC commitNumber | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:47:43 | LoadIC DisableAutomaticWrites | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:48:42 | LoadIC EnableAutomaticWrites | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:49:49 | LoadIC disableAutomaticWrites | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:50:21 | LoadIC deliveries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:83 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:22 | LoadIC role | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:61 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:67 | LoadIC length | 2 / poly | PACKED_SMI_ELEMENTS, HOLEY_SMI_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:36:11 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:36:24 | LoadIC some | 2 / poly | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:41:31 | LoadIC node | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:21:9 | LoadIC strategy | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:22:9 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:23:13 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:26:13 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:33:9 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:42:9 | LoadIC delete | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:43:11 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:15 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 2 / mono | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:15 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:15:52 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:15:58 | LoadIC controls | 2 / poly | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC nodes | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:15:7 | LoadIC stringify | 1 / mono | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:16:11 | LoadIC map | 1 / mono | PACKED_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:17:44 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:19:22 | LoadIC $ref | 2 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:21:18 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:22:26 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:22:32 | LoadIC map | 1 / mono | PACKED_SMI_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:32:8 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:33:14 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:34:14 | LoadIC filter | 1 / mono | PACKED_SMI_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:71:9 | StoreIC type | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:72:19 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:25:14 | LoadIC mode | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:25:43 | LoadIC isAtomic | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:26:12 | LoadIC collect | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:26:42 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:26:59 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:27:9 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:27:22 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:27:51 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:29:22 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:30:29 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:31:27 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:31:58 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:31:64 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:32:16 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:32:57 | LoadIC role | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:33:16 | LoadIC scope | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:33:48 | LoadIC validationOnly | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:34:49 | LoadIC type | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:25 | LoadIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:39 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:63 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:27 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:47 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:30 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:53 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:38:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:38:36 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:39:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:39:29 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:39:54 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:40:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:40:28 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:40:57 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:43:22 | LoadIC keys | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:44:35 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:45:16 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:46:18 | KeyedLoadIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:69:19 | KeyedStoreIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:21:38 | LoadIC fragments | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:21:48 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:22:29 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:23:34 | LoadIC order | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:24:34 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:25:45 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:35:38 | LoadIC nodes | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:35:44 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:36:25 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:37:8 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:37:21 | LoadIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:38:40 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:40:37 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:41:13 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:42:25 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:43:40 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:44:20 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:45:40 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintDeclarations | blueprint/utils/freezeBlueprintValues/utils/freezeBlueprintDeclarations.ts:14:43 | LoadIC length | 2 / poly | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| freezeBlueprintDeclarations | blueprint/utils/freezeBlueprintValues/utils/freezeBlueprintDeclarations.ts:15:24 | KeyedLoadIC <dynamic> | 2 / poly | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| freezeBlueprintDeclarations | blueprint/utils/freezeBlueprintValues/utils/freezeBlueprintDeclarations.ts:16:30 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintDeclarations | blueprint/utils/freezeBlueprintValues/utils/freezeBlueprintDeclarations.ts:17:36 | LoadIC length | 3 / poly (동결 혼합) | PACKED_FROZEN_ELEMENTS, PACKED_SMI_ELEMENTS, HOLEY_SMI_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:20:43 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:21:27 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:21:20 | KeyedLoadIC <dynamic> | ≥2 / mega | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:25:27 | LoadIC allOf | 2 / poly | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:26:8 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:18:24 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:20:4 | KeyedLoadIC <dynamic> | ≥2 / mega | HOLEY_ELEMENTS |
### nested-d5-f4 / unfrozen

| 함수 | file:line:column (src/core/ 생략) | 접근 | map 수 / state | 요소 종류 |
| --- | --- | --- | --- | --- |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:24 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:82:6 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:28 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:84:6 | StoreIC kind | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:85:6 | StoreIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:86:6 | StoreIC nullable | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:87:16 | StoreIC strategy | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:88:34 | StoreIC declarations | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:34 | StoreIC isAtomic | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:98:33 | StoreIC collect | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:36:37 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:37:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:37:32 | LoadIC gates | 34 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:39:36 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:40:14 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:42:24 | LoadIC stringify | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:42:35 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:12 | LoadIC templates | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:22 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:47 | LoadIC constructing | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:60 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:45:27 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:49:51 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:40 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:69 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:74 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:54:37 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:55:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:58:36 | LoadIC allowed | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:58:44 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:59:28 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:61:19 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:64:14 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:64:53 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:65:36 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:72:36 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:72:49 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:73:32 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:74:32 | LoadIC scope | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:77:24 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:78:16 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:78:56 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:18 | LoadIC nodes | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:24 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:28 | LoadIC schemaPath | 34 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:91:18 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:26 | LoadIC options | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:34 | LoadIC isAtomic | 111 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:98:33 | LoadIC collect | 111 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:101:26 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:101:42 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:101:63 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:101:69 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:101:91 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:22 | LoadIC isAtomic | 111 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:64 | LoadIC collect | 111 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:103:26 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:104:33 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:105:22 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:106:20 | LoadIC role | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:106:58 | LoadIC scope | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:107:21 | LoadIC validationOnly | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:108:17 | LoadIC nullable | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:108:50 | LoadIC pattern | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:109:26 | LoadIC type | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:110:26 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:112:10 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:114:20 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:115:23 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:116:36 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:117:17 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:118:13 | LoadIC strategy | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:121:23 | LoadIC delete | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:61:27 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:62:25 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:63:29 | StoreIC inherited | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:64:21 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:24 | StoreIC fragment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:76:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:77:62 | StoreIC schemaPath | 29 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:43 | StoreIC order | 29 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:14 | StoreIC gates | 33 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:48 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:48 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:50 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:50 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:56 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:77:37 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:77:62 | LoadIC escapeSegment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:33 | LoadIC order | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:33 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:33 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:81:11 | LoadIC filter | 1 / mono | HOLEY_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:84:10 | LoadIC map | 1 / mono | HOLEY_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:32 | LoadIC gates | 33 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:32 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:42 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:42 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:42 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:36 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:89:24 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:89:35 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:90:47 | LoadIC findIndex | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:166:10 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:167:10 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:168:25 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:172:28 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:174:30 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:184:10 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:185:16 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:186:25 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:187:10 | StoreIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:168:25 | LoadIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:170:24 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:170:45 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:171:16 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:171:26 | LoadIC schemaPath | 33 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:174:24 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:174:30 | LoadIC map | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:15 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:14 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:14 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:20 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:25 | LoadIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:33 | LoadIC escapeSegment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:31:32 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:31:45 | LoadIC flatMap | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:33 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:33 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:52:48 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:54:13 | LoadIC type | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:55:7 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:61:27 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:62:25 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:63:29 | LoadIC inherited | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:24 | LoadIC fragments | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:46 | LoadIC fragmentId | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:24 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:69:11 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:70:13 | LoadIC properties | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:13 | LoadIC entries | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:38 | LoadIC forEach | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:159:23 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:31 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:31 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:24 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:24 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:15 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:33 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:46 | LoadIC map | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:182:14 | LoadIC push | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:192:17 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:194:13 | LoadIC size | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:28 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:34 | LoadIC controls | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:62 | LoadIC map | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:62:26 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:63:14 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:64:22 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:65:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:66:19 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:67:35 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:68:4 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:77:16 | StoreIC declarationId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:77:16 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:15 | LoadIC slice | 3 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:26 | LoadIC lastIndexOf | 3 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:15 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:79:4 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:80:22 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:81:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:82:25 | StoreIC fragmentId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:83:16 | StoreIC role | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:84:17 | StoreIC scope | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:86:19 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:87:20 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:88:20 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:89:21 | StoreIC inherited | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:90:20 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:130:62 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:34:15 | LoadIC includes | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:34:30 | LoadIC schemaPath | 34 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:35:40 | LoadIC schema | 34 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:40:10 | LoadIC isFragment | 34 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:42:59 | LoadIC options | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:44:12 | LoadIC gates | 34 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:44:18 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:44:34 | LoadIC context | 34 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:48:11 | LoadIC controls | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:62:16 | LoadIC fragments | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:62:26 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:67:35 | LoadIC order | 34 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:74:20 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:8 | LoadIC fragment | 34 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:8 | LoadIC children | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:18 | LoadIC push | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:41 | LoadIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:77:8 | LoadIC declarationId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:83:16 | LoadIC role | 34 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:87:20 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:88:20 | LoadIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:89:21 | LoadIC inherited | 34 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:90:20 | LoadIC hostPath | 34 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:92:2 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:92:67 | LoadIC push | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:93:16 | LoadIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:96:18 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:98:15 | LoadIC capabilities | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:98:28 | LoadIC branchless | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:110:20 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:110:36 | StoreInArrayLiteralIC <dynamic> | 미제공 / poly |  |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:111:20 | LoadIC $ref | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:131:28 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:131:28 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:131:28 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:131:11 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:131:11 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:131:20 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:137:10 | KeyedLoadIC <dynamic> | ≥2 / mega | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:138:9 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:61 | LoadIC if | 2 / poly | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:28 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:51 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:72 | StoreIC extras | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:149:4 | StoreIC names | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:19:24 | LoadIC local | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:20:31 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:22 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:22 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:6 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:38 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:59 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:89:18 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:89:40 | LoadIC emit | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:90:21 | LoadIC extras | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:96:42 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:96:48 | LoadIC propertyKeys | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:21 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:21 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:27 | LoadIC blueprintNode | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:110:23 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:111:20 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:111:45 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:112:12 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:113:12 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:114:11 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:21 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:21 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:16 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:150:18 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:150:36 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:18:30 | StoreIC previous | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:18:41 | StoreIC current | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:20:27 | StoreIC type | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:21:89 | StoreIC payload | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:22:60 | StoreIC source | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:22:60 | StoreIC options | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:20:7 | StoreIC pendingDelivery | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:23:7 | StoreIC deliveryInitialized | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:24:7 | StoreIC revisionLedger | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:25:7 | StoreIC pendingRevision | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:18 | StoreIC local | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:36 | StoreIC emit | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:16:23 | LoadIC behavior | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:16:32 | LoadIC strategy | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:18 | LoadIC local | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:36 | LoadIC emit | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:24:58 | LoadIC revisionLedger | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:50:29 | StoreIC deliveries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:51:40 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:51:53 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:39 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:56 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:83 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:60:12 | StoreIC entered | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:61:12 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:74:12 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:76:13 | StoreIC structure | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:77:30 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:77:13 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:86:15 | StoreIC raw | 미제공 / other |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:87:15 | StoreIC extras | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:89:16 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:16 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:101:40 | StoreIC index | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:12 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:25 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:32 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:56 | StoreIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:43 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:60 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:87 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:71:14 | StoreIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:92:18 | StoreIC raw | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:56:15 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:57:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:58:23 | LoadIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:59:15 | LoadIC entered | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:62:17 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:63:26 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:63:33 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:65:35 | LoadIC hasOwnProperty | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:65:82 | LoadIC default | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:66:24 | LoadIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:68:15 | LoadIC behavior | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:68:24 | LoadIC type | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:69:34 | LoadIC blueprintNode | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:34 | LoadIC interpret | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:67 | LoadIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:84 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:75:24 | LoadIC strategy | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:93:25 | LoadIC interactionState | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:14 | LoadIC index | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:28 | LoadIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:36 | LoadIC length | 2 / poly | PACKED_FROZEN_ELEMENTS, HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:113:38 | LoadIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:116:10 | LoadIC pop | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:101:26 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:11 | LoadIC structure | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:28 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:32 | KeyedStoreIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:104:12 | LoadIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:104:22 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:29 | LoadIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:38 | LoadIC includes | 1 / mono | PACKED_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:12 | LoadIC push | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:76:32 | LoadIC create | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:78:26 | LoadIC type | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:27 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:35 | LoadIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:118:10 | StoreIC commitNumber | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:45:23 | LoadIC runtime | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:46:26 | LoadIC commitNumber | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:47:43 | LoadIC DisableAutomaticWrites | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:48:42 | LoadIC EnableAutomaticWrites | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:49:49 | LoadIC disableAutomaticWrites | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:50:21 | LoadIC deliveries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:83 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:22 | LoadIC role | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:61 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:67 | LoadIC length | 2 / poly | PACKED_SMI_ELEMENTS, HOLEY_SMI_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:36:11 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:36:24 | LoadIC some | 2 / poly | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:41:31 | LoadIC node | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:21:9 | LoadIC strategy | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:22:9 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:23:13 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:26:13 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:33:9 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:42:9 | LoadIC delete | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:43:11 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:15 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:15 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:15:52 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:15:58 | LoadIC controls | 2 / poly | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC nodes | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:15:7 | LoadIC stringify | 1 / mono | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:16:11 | LoadIC map | 1 / mono | PACKED_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:17:44 | LoadIC schema | 34 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:19:22 | LoadIC $ref | 2 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:21:18 | LoadIC schemaPath | 34 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:22:26 | LoadIC gates | 34 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:22:32 | LoadIC map | 1 / mono | PACKED_SMI_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:32:8 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:33:14 | LoadIC context | 34 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:34:14 | LoadIC filter | 2 / poly | PACKED_SMI_ELEMENTS, HOLEY_SMI_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:61:9 | StoreIC type | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:62:25 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:22:14 | LoadIC mode | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:22:43 | LoadIC isAtomic | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:23:12 | LoadIC collect | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:23:42 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:23:59 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:24:9 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:24:22 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:24:51 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:26:22 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:27:29 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:28:27 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:28:58 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:28:64 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:29:16 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:29:57 | LoadIC role | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:30:16 | LoadIC scope | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:30:48 | LoadIC validationOnly | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:31:49 | LoadIC type | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:32:25 | LoadIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:32:39 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:32:63 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:33:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:33:27 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:33:47 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:34:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:34:30 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:34:53 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:36 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:29 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:54 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:28 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:57 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:40:22 | LoadIC keys | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:41:35 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:42:16 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:43:18 | KeyedLoadIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:59:19 | KeyedStoreIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
### nested-d5-f4 / uniform-gates

| 함수 | file:line:column (src/core/ 생략) | 접근 | map 수 / state | 요소 종류 |
| --- | --- | --- | --- | --- |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:24 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:82:6 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:28 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:84:6 | StoreIC kind | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:85:6 | StoreIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:86:6 | StoreIC nullable | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:87:16 | StoreIC strategy | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:88:20 | StoreIC declarations | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:34 | StoreIC isAtomic | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:98:33 | StoreIC collect | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:36:37 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:37:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:37:32 | LoadIC gates | 49 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:39:36 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:40:14 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:42:24 | LoadIC stringify | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:42:35 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:12 | LoadIC templates | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:22 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:47 | LoadIC constructing | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:60 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:45:27 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:49:51 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:40 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:69 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:74 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:54:37 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:55:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:58:36 | LoadIC allowed | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:58:44 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:59:28 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:61:19 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:64:14 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:64:38 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:65:36 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:72:36 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:72:49 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:73:32 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:74:32 | LoadIC scope | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:77:24 | LoadIC push | 3 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS, HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:78:16 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:78:56 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:18 | LoadIC nodes | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:24 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:28 | LoadIC schemaPath | 49 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:91:18 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:26 | LoadIC options | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:34 | LoadIC isAtomic | 107 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:98:33 | LoadIC collect | 107 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:26 | LoadIC length | 2 / mono | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:42 | KeyedLoadIC <dynamic> | 2 / mono | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:63 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:69 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:91 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:103:22 | LoadIC isAtomic | 107 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:103:64 | LoadIC collect | 107 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:104:26 | KeyedLoadIC <dynamic> | 2 / mono | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:105:33 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:106:22 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:107:20 | LoadIC role | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:107:58 | LoadIC scope | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:108:21 | LoadIC validationOnly | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:109:17 | LoadIC nullable | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:109:50 | LoadIC pattern | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:110:26 | LoadIC type | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:111:26 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:113:10 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:115:20 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:116:23 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:117:36 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:118:17 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:119:13 | LoadIC strategy | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:122:23 | LoadIC delete | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:62:27 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:63:25 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:64:29 | StoreIC inherited | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:21 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:66:24 | StoreIC fragment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:77:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:62 | StoreIC schemaPath | 43 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:79:43 | StoreIC order | 43 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:14 | StoreIC gates | 48 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:74:48 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:74:48 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:74:50 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:74:50 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:74:56 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:37 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:62 | LoadIC escapeSegment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:79:33 | LoadIC order | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:79:33 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:79:33 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:82:11 | LoadIC filter | 1 / mono | HOLEY_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:85:10 | LoadIC map | 1 / mono | HOLEY_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:32 | LoadIC gates | 48 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:32 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:42 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:42 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:42 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:88:36 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:90:24 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:90:35 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:91:47 | LoadIC findIndex | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:167:10 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:168:10 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:169:25 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:173:28 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:174:17 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:183:10 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:184:16 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:185:25 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:186:10 | StoreIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:169:25 | LoadIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:171:24 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:171:45 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:172:16 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:172:26 | LoadIC schemaPath | 48 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:174:50 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:174:56 | LoadIC map | 1 / mono | PACKED_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:15 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:26 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:26 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:26 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:26 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:14 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:14 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:20 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:25 | LoadIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:33 | LoadIC escapeSegment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:32 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:45 | LoadIC flatMap | 2 / mono | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:52:33 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 2 / mono | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:52:33 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:52:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:52:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:53:48 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:55:13 | LoadIC type | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:56:7 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:62:27 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:63:25 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:64:29 | LoadIC inherited | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:66:24 | LoadIC fragments | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:66:46 | LoadIC fragmentId | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:66:24 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:70:11 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:71:13 | LoadIC properties | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:74:13 | LoadIC entries | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:74:38 | LoadIC forEach | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:23 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:31 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:31 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:24 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:24 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:15 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:164:33 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:164:46 | LoadIC map | 2 / mono | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:181:14 | LoadIC push | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:191:17 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:193:13 | LoadIC size | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:33:28 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:33:34 | LoadIC controls | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:33:62 | LoadIC map | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:63:26 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:64:14 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:65:22 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:66:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:67:19 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:68:11 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:69:11 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:16 | StoreIC declarationId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:16 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:79:15 | LoadIC slice | 3 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:79:26 | LoadIC lastIndexOf | 3 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:79:15 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:80:4 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:81:22 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:82:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:83:25 | StoreIC fragmentId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:84:16 | StoreIC role | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:85:17 | StoreIC scope | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:87:19 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:88:20 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:89:20 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:90:21 | StoreIC inherited | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:91:20 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:62 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:35:15 | LoadIC includes | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:35:30 | LoadIC schemaPath | 49 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:36:40 | LoadIC schema | 49 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:41:10 | LoadIC isFragment | 49 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:43:59 | LoadIC options | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:45:12 | LoadIC gates | 49 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:45:18 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:45:34 | LoadIC context | 49 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:49:11 | LoadIC controls | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:63:16 | LoadIC fragments | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:63:26 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:68:42 | LoadIC order | 49 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:20 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:76:8 | LoadIC fragment | 49 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:76:8 | LoadIC children | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:76:18 | LoadIC push | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:76:41 | LoadIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:8 | LoadIC declarationId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:84:16 | LoadIC role | 49 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:88:20 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:89:20 | LoadIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:90:21 | LoadIC inherited | 49 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:91:20 | LoadIC hostPath | 49 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:93:10 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:93:23 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:94:2 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:94:67 | LoadIC push | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:95:16 | LoadIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:98:18 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:100:15 | LoadIC capabilities | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:100:28 | LoadIC branchless | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:112:20 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:112:36 | StoreInArrayLiteralIC <dynamic> | 미제공 / poly |  |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:113:20 | LoadIC $ref | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:133:28 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:133:28 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:133:28 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:133:11 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:133:11 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:133:20 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:139:10 | KeyedLoadIC <dynamic> | ≥2 / mega | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:140:9 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:134:61 | LoadIC if | 2 / poly | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:28 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:51 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:72 | StoreIC extras | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:149:4 | StoreIC names | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:19:24 | LoadIC local | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:20:31 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:22 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:22 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:6 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:38 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:59 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:89:18 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:89:40 | LoadIC emit | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:90:21 | LoadIC extras | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:96:42 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:96:48 | LoadIC propertyKeys | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:21 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:21 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:27 | LoadIC blueprintNode | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:110:23 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:111:20 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:111:45 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:112:12 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:113:12 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:114:11 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:21 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:21 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:16 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:150:18 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:150:36 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:18:30 | StoreIC previous | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:18:41 | StoreIC current | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:20:27 | StoreIC type | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:21:89 | StoreIC payload | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:22:60 | StoreIC source | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:22:60 | StoreIC options | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:20:7 | StoreIC pendingDelivery | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:23:7 | StoreIC deliveryInitialized | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:24:7 | StoreIC revisionLedger | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:25:7 | StoreIC pendingRevision | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:18 | StoreIC local | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:36 | StoreIC emit | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:16:23 | LoadIC behavior | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:16:32 | LoadIC strategy | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:18 | LoadIC local | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:36 | LoadIC emit | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:24:58 | LoadIC revisionLedger | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:50:29 | StoreIC deliveries | 1 / mono |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:51:40 | StoreIC node | 1 / mono |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:51:53 | StoreIC input | 1 / mono |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:39 | StoreIC entries | 1 / mono |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:56 | StoreIC required | 1 / mono |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:83 | StoreIC children | 1 / mono |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:60:12 | StoreIC entered | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:61:12 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:74:12 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:76:13 | StoreIC structure | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:77:30 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:77:13 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:86:15 | StoreIC raw | 미제공 / other |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:87:15 | StoreIC extras | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:89:16 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:16 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:101:40 | StoreIC index | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:12 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:25 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:32 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:56 | StoreIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:43 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:60 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:87 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:71:14 | StoreIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:92:18 | StoreIC raw | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:56:15 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:57:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:58:23 | LoadIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:59:15 | LoadIC entered | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:62:17 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:63:26 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:63:33 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:65:35 | LoadIC hasOwnProperty | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:65:82 | LoadIC default | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:66:24 | LoadIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:68:15 | LoadIC behavior | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:68:24 | LoadIC type | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:69:34 | LoadIC blueprintNode | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:34 | LoadIC interpret | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:67 | LoadIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:84 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:75:24 | LoadIC strategy | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:93:25 | LoadIC interactionState | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:14 | LoadIC index | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:28 | LoadIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:36 | LoadIC length | 2 / poly | PACKED_FROZEN_ELEMENTS, HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:113:38 | LoadIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:116:10 | LoadIC pop | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:101:26 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:11 | LoadIC structure | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:28 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:32 | KeyedStoreIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:104:12 | LoadIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:104:22 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:29 | LoadIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:38 | LoadIC includes | 1 / mono | PACKED_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:12 | LoadIC push | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:76:32 | LoadIC create | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:78:26 | LoadIC type | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:27 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:35 | LoadIC required | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:118:10 | StoreIC commitNumber | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:45:23 | LoadIC runtime | 1 / mono |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:46:26 | LoadIC commitNumber | 1 / mono |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:47:43 | LoadIC DisableAutomaticWrites | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:48:42 | LoadIC EnableAutomaticWrites | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:49:49 | LoadIC disableAutomaticWrites | 1 / mono |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:50:21 | LoadIC deliveries | 1 / mono |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:83 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:22 | LoadIC role | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:61 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:67 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:36:11 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:36:24 | LoadIC some | 2 / poly | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:41:31 | LoadIC node | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:21:9 | LoadIC strategy | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:22:9 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:23:13 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:26:13 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:33:9 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:42:9 | LoadIC delete | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:43:11 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:15 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 2 / mono | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:15 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:15:52 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:15:58 | LoadIC controls | 2 / poly | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC nodes | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:15:7 | LoadIC stringify | 1 / mono | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:16:11 | LoadIC map | 1 / mono | PACKED_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:17:44 | LoadIC schema | 49 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:19:22 | LoadIC $ref | 2 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:21:18 | LoadIC schemaPath | 49 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:22:26 | LoadIC gates | 49 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:22:32 | LoadIC map | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:32:8 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:33:14 | LoadIC context | 49 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:34:14 | LoadIC filter | 2 / poly | PACKED_SMI_ELEMENTS, HOLEY_SMI_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:71:9 | StoreIC type | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:72:19 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:25:14 | LoadIC mode | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:25:43 | LoadIC isAtomic | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:26:12 | LoadIC collect | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:26:42 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:26:59 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:27:9 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:27:22 | LoadIC length | 2 / mono | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:27:51 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:29:22 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:30:29 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:31:27 | KeyedLoadIC <dynamic> | 2 / mono | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:31:58 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:31:64 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:32:16 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:32:57 | LoadIC role | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:33:16 | LoadIC scope | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:33:48 | LoadIC validationOnly | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:34:49 | LoadIC type | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:25 | LoadIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:39 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:63 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:27 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:47 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:30 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:53 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:38:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:38:36 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:39:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:39:29 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:39:54 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:40:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:40:28 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:40:57 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:43:22 | LoadIC keys | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:44:35 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:45:16 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:46:18 | KeyedLoadIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:69:19 | KeyedStoreIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:21:38 | LoadIC fragments | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:21:48 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:22:29 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:23:34 | LoadIC order | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:24:34 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:25:45 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:35:38 | LoadIC nodes | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:35:44 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:36:25 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:37:8 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:37:21 | LoadIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:38:40 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:40:37 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:41:13 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:42:25 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:43:40 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:44:20 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:45:40 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintDeclarations | blueprint/utils/freezeBlueprintValues/utils/freezeBlueprintDeclarations.ts:14:43 | LoadIC length | 2 / poly | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| freezeBlueprintDeclarations | blueprint/utils/freezeBlueprintValues/utils/freezeBlueprintDeclarations.ts:15:24 | KeyedLoadIC <dynamic> | 2 / poly | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| freezeBlueprintDeclarations | blueprint/utils/freezeBlueprintValues/utils/freezeBlueprintDeclarations.ts:16:30 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintDeclarations | blueprint/utils/freezeBlueprintValues/utils/freezeBlueprintDeclarations.ts:17:36 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:20:43 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:21:27 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:21:20 | KeyedLoadIC <dynamic> | ≥2 / mega | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:25:27 | LoadIC allOf | 2 / poly | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:26:8 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:18:24 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:20:4 | KeyedLoadIC <dynamic> | ≥2 / mega | HOLEY_ELEMENTS |
### nested-d5-f4 / uniform-arrays

| 함수 | file:line:column (src/core/ 생략) | 접근 | map 수 / state | 요소 종류 |
| --- | --- | --- | --- | --- |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:24 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:82:6 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:28 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:84:6 | StoreIC kind | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:85:6 | StoreIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:86:6 | StoreIC nullable | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:87:16 | StoreIC strategy | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:88:20 | StoreIC declarations | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:34 | StoreIC isAtomic | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:98:33 | StoreIC collect | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:36:37 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:37:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:37:32 | LoadIC gates | 8 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:39:36 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:40:14 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:42:24 | LoadIC stringify | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:42:35 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:12 | LoadIC templates | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:22 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:47 | LoadIC constructing | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:60 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:45:27 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:49:51 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:40 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:69 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:74 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:54:37 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:55:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:58:36 | LoadIC allowed | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:58:44 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:59:28 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:61:19 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:64:14 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:64:38 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:65:36 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:72:36 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:72:49 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:73:32 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:74:32 | LoadIC scope | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:77:24 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:78:16 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:78:56 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:18 | LoadIC nodes | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:24 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:28 | LoadIC schemaPath | 8 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:91:18 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:26 | LoadIC options | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:34 | LoadIC isAtomic | 18 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:98:33 | LoadIC collect | 18 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:26 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:42 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:63 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:69 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:91 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:103:22 | LoadIC isAtomic | 18 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:103:64 | LoadIC collect | 18 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:104:26 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:105:33 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:106:22 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:107:20 | LoadIC role | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:107:58 | LoadIC scope | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:108:21 | LoadIC validationOnly | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:109:17 | LoadIC nullable | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:109:50 | LoadIC pattern | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:110:26 | LoadIC type | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:111:26 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:113:10 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:115:20 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:116:23 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:117:36 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:118:17 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:119:13 | LoadIC strategy | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:122:23 | LoadIC delete | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:62:27 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:63:25 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:64:29 | StoreIC inherited | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:21 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:66:24 | StoreIC fragment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:77:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:62 | StoreIC schemaPath | 43 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:79:43 | StoreIC order | 43 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:14 | StoreIC gates | 47 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:74:48 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:74:48 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:74:50 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:74:50 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:74:56 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:37 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:62 | LoadIC escapeSegment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:79:33 | LoadIC order | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:79:33 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:79:33 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:82:11 | LoadIC filter | 1 / mono | HOLEY_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:85:10 | LoadIC map | 1 / mono | HOLEY_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:32 | LoadIC gates | 47 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:32 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:42 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:42 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:42 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:88:36 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:90:24 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:90:35 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:91:47 | LoadIC findIndex | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:167:10 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:168:10 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:169:25 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:173:28 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:174:17 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:183:10 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:184:16 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:185:25 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:186:10 | StoreIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:169:25 | LoadIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:171:24 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:171:45 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:172:16 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:172:26 | LoadIC schemaPath | 47 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:174:50 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:174:56 | LoadIC map | 1 / mono | PACKED_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:15 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:26 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:26 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:26 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:26 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:14 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:14 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:20 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:25 | LoadIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:33 | LoadIC escapeSegment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:32 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:45 | LoadIC flatMap | 2 / mono | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:52:33 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 2 / mono | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:52:33 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:52:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:52:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:53:48 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:55:13 | LoadIC type | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:56:7 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:62:27 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:63:25 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:64:29 | LoadIC inherited | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:66:24 | LoadIC fragments | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:66:46 | LoadIC fragmentId | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:66:24 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:70:11 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:71:13 | LoadIC properties | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:74:13 | LoadIC entries | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:74:38 | LoadIC forEach | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:23 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:31 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:31 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:24 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:24 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:15 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:164:33 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:164:46 | LoadIC map | 2 / mono | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:181:14 | LoadIC push | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:191:17 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:193:13 | LoadIC size | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:33:28 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:33:34 | LoadIC controls | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:33:62 | LoadIC map | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:63:26 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:64:14 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:65:22 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:66:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:67:19 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:68:11 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:69:11 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:16 | StoreIC declarationId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:16 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:79:15 | LoadIC slice | 3 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:79:26 | LoadIC lastIndexOf | 3 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:79:15 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:80:4 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:81:22 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:82:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:83:25 | StoreIC fragmentId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:84:16 | StoreIC role | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:85:17 | StoreIC scope | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:87:19 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:88:20 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:89:20 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:90:21 | StoreIC inherited | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:91:20 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:62 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:35:15 | LoadIC includes | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:35:30 | LoadIC schemaPath | 48 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:36:40 | LoadIC schema | 48 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:41:10 | LoadIC isFragment | 48 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:43:59 | LoadIC options | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:45:12 | LoadIC gates | 48 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:45:18 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:45:34 | LoadIC context | 48 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:49:11 | LoadIC controls | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:63:16 | LoadIC fragments | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:63:26 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:68:42 | LoadIC order | 48 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:20 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:76:8 | LoadIC fragment | 48 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:76:8 | LoadIC children | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:76:18 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:76:41 | LoadIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:8 | LoadIC declarationId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:84:16 | LoadIC role | 48 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:88:20 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:89:20 | LoadIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:90:21 | LoadIC inherited | 48 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:91:20 | LoadIC hostPath | 48 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:93:10 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:93:23 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:94:2 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:94:67 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:95:16 | LoadIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:98:18 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:100:15 | LoadIC capabilities | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:100:28 | LoadIC branchless | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:112:20 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:112:36 | StoreInArrayLiteralIC <dynamic> | 미제공 / poly |  |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:113:20 | LoadIC $ref | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:133:28 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:133:28 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:133:28 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:133:11 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:133:11 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:133:20 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:139:10 | KeyedLoadIC <dynamic> | ≥2 / mega | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:140:9 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:134:61 | LoadIC if | 2 / poly | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:28 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:51 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:72 | StoreIC extras | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:149:4 | StoreIC names | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:19:24 | LoadIC local | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:20:31 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:22 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:22 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:6 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:38 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:59 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:89:18 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:89:40 | LoadIC emit | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:90:21 | LoadIC extras | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:96:42 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:96:48 | LoadIC propertyKeys | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:21 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:21 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:27 | LoadIC blueprintNode | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:110:23 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:111:20 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:111:45 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:112:12 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:113:12 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:114:11 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:21 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:21 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:16 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:150:18 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:150:36 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:18:30 | StoreIC previous | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:18:41 | StoreIC current | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:20:27 | StoreIC type | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:21:89 | StoreIC payload | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:22:60 | StoreIC source | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:22:60 | StoreIC options | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:20:7 | StoreIC pendingDelivery | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:23:7 | StoreIC deliveryInitialized | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:24:7 | StoreIC revisionLedger | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:25:7 | StoreIC pendingRevision | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:18 | StoreIC local | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:36 | StoreIC emit | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:16:23 | LoadIC behavior | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:16:32 | LoadIC strategy | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:18 | LoadIC local | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:36 | LoadIC emit | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:24:58 | LoadIC revisionLedger | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:50:29 | StoreIC deliveries | 1 / mono |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:51:40 | StoreIC node | 1 / mono |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:51:53 | StoreIC input | 1 / mono |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:39 | StoreIC entries | 1 / mono |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:56 | StoreIC required | 1 / mono |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:83 | StoreIC children | 1 / mono |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:60:12 | StoreIC entered | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:61:12 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:74:12 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:76:13 | StoreIC structure | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:77:30 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:77:13 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:86:15 | StoreIC raw | 미제공 / other |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:87:15 | StoreIC extras | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:89:16 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:16 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:101:40 | StoreIC index | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:12 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:25 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:32 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:56 | StoreIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:43 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:60 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:87 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:71:14 | StoreIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:92:18 | StoreIC raw | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:56:15 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:57:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:58:23 | LoadIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:59:15 | LoadIC entered | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:62:17 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:63:26 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:63:33 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:65:35 | LoadIC hasOwnProperty | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:65:82 | LoadIC default | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:66:24 | LoadIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:68:15 | LoadIC behavior | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:68:24 | LoadIC type | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:69:34 | LoadIC blueprintNode | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:34 | LoadIC interpret | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:67 | LoadIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:84 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:75:24 | LoadIC strategy | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:93:25 | LoadIC interactionState | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:14 | LoadIC index | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:28 | LoadIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:36 | LoadIC length | 2 / poly | PACKED_FROZEN_ELEMENTS, HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:113:38 | LoadIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:116:10 | LoadIC pop | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:101:26 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:11 | LoadIC structure | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:28 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:32 | KeyedStoreIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:104:12 | LoadIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:104:22 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:29 | LoadIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:38 | LoadIC includes | 1 / mono | PACKED_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:12 | LoadIC push | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:76:32 | LoadIC create | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:78:26 | LoadIC type | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:27 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:35 | LoadIC required | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:118:10 | StoreIC commitNumber | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:45:23 | LoadIC runtime | 1 / mono |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:46:26 | LoadIC commitNumber | 1 / mono |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:47:43 | LoadIC DisableAutomaticWrites | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:48:42 | LoadIC EnableAutomaticWrites | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:49:49 | LoadIC disableAutomaticWrites | 1 / mono |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:50:21 | LoadIC deliveries | 1 / mono |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:83 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:22 | LoadIC role | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:61 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:67 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:36:11 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:36:24 | LoadIC some | 2 / poly | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:41:31 | LoadIC node | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:21:9 | LoadIC strategy | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:22:9 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:23:13 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:26:13 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:33:9 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:42:9 | LoadIC delete | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:43:11 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:15 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 2 / mono | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:15 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:15:52 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:15:58 | LoadIC controls | 2 / poly | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC nodes | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:15:7 | LoadIC stringify | 1 / mono | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:16:11 | LoadIC map | 1 / mono | PACKED_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:17:44 | LoadIC schema | 48 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:19:22 | LoadIC $ref | 2 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:21:18 | LoadIC schemaPath | 48 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:22:26 | LoadIC gates | 48 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:22:32 | LoadIC map | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:32:8 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:33:14 | LoadIC context | 48 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:34:14 | LoadIC filter | 2 / poly | PACKED_SMI_ELEMENTS, HOLEY_SMI_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:71:9 | StoreIC type | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:72:19 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:25:14 | LoadIC mode | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:25:43 | LoadIC isAtomic | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:26:12 | LoadIC collect | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:26:42 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:26:59 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:27:9 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:27:22 | LoadIC length | 2 / mono | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:27:51 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:29:22 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:30:29 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:31:27 | KeyedLoadIC <dynamic> | 2 / mono | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:31:58 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:31:64 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:32:16 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:32:57 | LoadIC role | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:33:16 | LoadIC scope | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:33:48 | LoadIC validationOnly | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:34:49 | LoadIC type | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:25 | LoadIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:39 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:63 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:27 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:47 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:30 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:53 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:38:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:38:36 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:39:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:39:29 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:39:54 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:40:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:40:28 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:40:57 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:43:22 | LoadIC keys | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:44:35 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:45:16 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:46:18 | KeyedLoadIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:69:19 | KeyedStoreIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:21:38 | LoadIC fragments | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:21:48 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:22:29 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:23:34 | LoadIC order | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:24:34 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:25:45 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:27:34 | LoadIC declares | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:28:34 | LoadIC overlays | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:29:34 | LoadIC inheritedOverlays | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:30:34 | LoadIC children | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:33:38 | LoadIC nodes | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:33:44 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:34:25 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:35:8 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:35:21 | LoadIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:36:40 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:38:37 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:39:13 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:40:25 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:41:40 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:42:20 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:43:40 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:46:13 | LoadIC fields | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:47:13 | LoadIC prefixItems | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:52:32 | LoadIC expressions | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:52:44 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:57:19 | LoadIC values | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:57:33 | LoadIC dependencies | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:58:28 | LoadIC length | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintDeclarations | blueprint/utils/freezeBlueprintValues/utils/freezeBlueprintDeclarations.ts:14:43 | LoadIC length | 2 / poly | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| freezeBlueprintDeclarations | blueprint/utils/freezeBlueprintValues/utils/freezeBlueprintDeclarations.ts:15:24 | KeyedLoadIC <dynamic> | 2 / poly | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| freezeBlueprintDeclarations | blueprint/utils/freezeBlueprintValues/utils/freezeBlueprintDeclarations.ts:16:30 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintDeclarations | blueprint/utils/freezeBlueprintValues/utils/freezeBlueprintDeclarations.ts:17:36 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:20:43 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:21:27 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:21:20 | KeyedLoadIC <dynamic> | ≥2 / mega | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:25:27 | LoadIC allOf | 2 / poly | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:26:8 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:18:24 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:20:4 | KeyedLoadIC <dynamic> | ≥2 / mega | HOLEY_ELEMENTS |
### nested-d5-f4 / owned-inline

| 함수 | file:line:column (src/core/ 생략) | 접근 | map 수 / state | 요소 종류 |
| --- | --- | --- | --- | --- |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:24 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:82:6 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:28 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:84:6 | StoreIC kind | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:85:6 | StoreIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:86:6 | StoreIC nullable | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:87:16 | StoreIC strategy | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:88:20 | StoreIC declarations | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:34 | StoreIC isAtomic | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:98:33 | StoreIC collect | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:36:37 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:37:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:37:32 | LoadIC gates | 16 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:39:36 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:40:14 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:42:24 | LoadIC stringify | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:42:35 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:12 | LoadIC templates | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:22 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:47 | LoadIC constructing | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:60 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:45:27 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:49:51 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:40 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:69 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:74 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:54:37 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:55:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:58:36 | LoadIC allowed | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:58:44 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:59:28 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:61:19 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:64:14 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:64:53 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:65:36 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:72:36 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:72:49 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:73:32 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:74:32 | LoadIC scope | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:77:24 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:78:16 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:78:56 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:18 | LoadIC nodes | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:24 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:28 | LoadIC schemaPath | 16 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:91:18 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:26 | LoadIC options | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:34 | LoadIC isAtomic | 50 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:98:33 | LoadIC collect | 50 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:26 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:42 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:63 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:69 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:91 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:103:22 | LoadIC isAtomic | 50 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:103:64 | LoadIC collect | 50 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:104:26 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:105:33 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:106:22 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:107:20 | LoadIC role | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:107:58 | LoadIC scope | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:108:21 | LoadIC validationOnly | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:109:17 | LoadIC nullable | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:109:50 | LoadIC pattern | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:110:26 | LoadIC type | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:111:26 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:113:10 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:115:20 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:116:23 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:117:36 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:118:17 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:119:13 | LoadIC strategy | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:122:23 | LoadIC delete | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:61:27 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:62:25 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:63:29 | StoreIC inherited | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:64:21 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:24 | StoreIC fragment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:76:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:77:62 | StoreIC schemaPath | 26 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:43 | StoreIC order | 26 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:14 | StoreIC gates | 33 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:48 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:48 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:50 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:50 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:56 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:77:37 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:77:62 | LoadIC escapeSegment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:33 | LoadIC order | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:33 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:33 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:81:11 | LoadIC filter | 1 / mono | HOLEY_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:84:10 | LoadIC map | 1 / mono | HOLEY_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:32 | LoadIC gates | 33 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:32 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:42 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:42 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:42 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:36 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:89:24 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:89:35 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:90:47 | LoadIC findIndex | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:166:33 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:167:10 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:168:10 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:169:25 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:173:28 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:174:35 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:183:10 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:184:16 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:185:25 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:186:10 | StoreIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:166:33 | LoadIC order | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:169:25 | LoadIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:171:24 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:171:45 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:172:16 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:172:26 | LoadIC schemaPath | 33 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:174:29 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:174:35 | LoadIC map | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:15 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:14 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:14 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:20 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:25 | LoadIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:33 | LoadIC escapeSegment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:31:32 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:31:45 | LoadIC flatMap | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:33 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:33 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:52:48 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:54:13 | LoadIC type | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:55:7 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:61:27 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:62:25 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:63:29 | LoadIC inherited | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:24 | LoadIC fragments | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:46 | LoadIC fragmentId | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:24 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:69:11 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:70:13 | LoadIC properties | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:13 | LoadIC entries | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:38 | LoadIC forEach | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:159:23 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:31 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:31 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:24 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:24 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:15 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:33 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:46 | LoadIC map | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:181:14 | LoadIC push | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:191:17 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:193:13 | LoadIC size | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:28 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:34 | LoadIC controls | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:62 | LoadIC map | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:62:26 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:63:14 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:64:22 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:65:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:66:19 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:67:21 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:68:4 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:77:16 | StoreIC declarationId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:77:16 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:15 | LoadIC slice | 3 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:26 | LoadIC lastIndexOf | 3 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:15 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:79:4 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:80:22 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:81:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:82:25 | StoreIC fragmentId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:83:16 | StoreIC role | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:84:17 | StoreIC scope | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:86:19 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:87:24 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:88:24 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:89:21 | StoreIC inherited | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:90:20 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:131:62 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:34:15 | LoadIC includes | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:34:30 | LoadIC schemaPath | 34 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:35:40 | LoadIC schema | 34 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:40:10 | LoadIC isFragment | 34 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:42:59 | LoadIC options | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:44:12 | LoadIC gates | 34 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:44:18 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:44:34 | LoadIC context | 34 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:48:11 | LoadIC controls | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:62:16 | LoadIC fragments | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:62:26 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:67:21 | LoadIC order | 34 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:74:20 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:8 | LoadIC fragment | 34 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:8 | LoadIC children | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:18 | LoadIC push | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:41 | LoadIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:77:8 | LoadIC declarationId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:83:16 | LoadIC role | 34 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:87:24 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:88:24 | LoadIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:89:21 | LoadIC inherited | 34 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:90:20 | LoadIC hostPath | 34 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:92:10 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:92:23 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:93:2 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:93:67 | LoadIC push | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:94:16 | LoadIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:97:18 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:99:15 | LoadIC capabilities | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:99:28 | LoadIC branchless | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:111:20 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:111:36 | StoreInArrayLiteralIC <dynamic> | 미제공 / poly |  |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:112:20 | LoadIC $ref | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:28 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:28 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:28 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:11 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:11 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:20 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:138:10 | KeyedLoadIC <dynamic> | ≥2 / mega | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:139:9 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:133:61 | LoadIC if | 2 / poly | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:28 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:51 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:72 | StoreIC extras | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:149:4 | StoreIC names | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:19:24 | LoadIC local | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:20:31 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:22 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:22 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:6 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:38 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:59 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:89:18 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:89:40 | LoadIC emit | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:90:21 | LoadIC extras | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:96:42 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:96:48 | LoadIC propertyKeys | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:21 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:21 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:27 | LoadIC blueprintNode | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:110:23 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:111:20 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:111:45 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:112:12 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:113:12 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:114:11 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:21 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:21 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:16 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:150:18 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:150:36 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:18:30 | StoreIC previous | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:18:41 | StoreIC current | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:20:27 | StoreIC type | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:21:89 | StoreIC payload | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:22:60 | StoreIC source | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:22:60 | StoreIC options | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:20:7 | StoreIC pendingDelivery | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:23:7 | StoreIC deliveryInitialized | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:24:7 | StoreIC revisionLedger | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:25:7 | StoreIC pendingRevision | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:18 | StoreIC local | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:36 | StoreIC emit | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:16:23 | LoadIC behavior | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:16:32 | LoadIC strategy | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:18 | LoadIC local | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:36 | LoadIC emit | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:24:58 | LoadIC revisionLedger | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:50:29 | StoreIC deliveries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:51:40 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:51:53 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:39 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:56 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:83 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:60:12 | StoreIC entered | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:61:12 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:74:12 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:76:13 | StoreIC structure | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:77:30 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:77:13 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:86:15 | StoreIC raw | 미제공 / other |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:87:15 | StoreIC extras | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:89:16 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:16 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:101:40 | StoreIC index | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:12 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:25 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:32 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:56 | StoreIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:43 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:60 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:87 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:71:14 | StoreIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:92:18 | StoreIC raw | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:56:15 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:57:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:58:23 | LoadIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:59:15 | LoadIC entered | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:62:17 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:63:26 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:63:33 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:65:35 | LoadIC hasOwnProperty | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:65:82 | LoadIC default | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:66:24 | LoadIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:68:15 | LoadIC behavior | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:68:24 | LoadIC type | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:69:34 | LoadIC blueprintNode | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:34 | LoadIC interpret | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:67 | LoadIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:84 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:75:24 | LoadIC strategy | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:93:25 | LoadIC interactionState | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:14 | LoadIC index | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:28 | LoadIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:36 | LoadIC length | 2 / poly | PACKED_FROZEN_ELEMENTS, HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:113:38 | LoadIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:116:10 | LoadIC pop | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:101:26 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:11 | LoadIC structure | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:28 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:32 | KeyedStoreIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:104:12 | LoadIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:104:22 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:29 | LoadIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:38 | LoadIC includes | 1 / mono | PACKED_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:12 | LoadIC push | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:76:32 | LoadIC create | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:78:26 | LoadIC type | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:27 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:35 | LoadIC required | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:118:10 | StoreIC commitNumber | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:45:23 | LoadIC runtime | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:46:26 | LoadIC commitNumber | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:47:43 | LoadIC DisableAutomaticWrites | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:48:42 | LoadIC EnableAutomaticWrites | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:49:49 | LoadIC disableAutomaticWrites | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:50:21 | LoadIC deliveries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:83 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:22 | LoadIC role | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:61 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:67 | LoadIC length | 2 / poly | PACKED_SMI_ELEMENTS, HOLEY_SMI_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:36:11 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:36:24 | LoadIC some | 2 / poly | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:41:31 | LoadIC node | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:21:9 | LoadIC strategy | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:22:9 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:23:13 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:26:13 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:33:9 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:42:9 | LoadIC delete | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:43:11 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:15 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:15 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:15:52 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:15:58 | LoadIC controls | 2 / poly | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC nodes | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:15:7 | LoadIC stringify | 1 / mono | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:16:11 | LoadIC map | 1 / mono | PACKED_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:17:44 | LoadIC schema | 34 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:19:22 | LoadIC $ref | 2 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:21:18 | LoadIC schemaPath | 34 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:22:26 | LoadIC gates | 34 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:22:32 | LoadIC map | 1 / mono | PACKED_SMI_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:32:8 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:33:14 | LoadIC context | 34 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:34:14 | LoadIC filter | 2 / poly | PACKED_SMI_ELEMENTS, HOLEY_SMI_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:71:9 | StoreIC type | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:72:19 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:25:14 | LoadIC mode | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:25:43 | LoadIC isAtomic | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:26:12 | LoadIC collect | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:26:42 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:26:59 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:27:9 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:27:22 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:27:51 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:29:22 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:30:29 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:31:27 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:31:58 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:31:64 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:32:16 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:32:57 | LoadIC role | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:33:16 | LoadIC scope | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:33:48 | LoadIC validationOnly | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:34:49 | LoadIC type | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:25 | LoadIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:39 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:63 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:27 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:47 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:30 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:53 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:38:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:38:36 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:39:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:39:29 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:39:54 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:40:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:40:28 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:40:57 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:43:22 | LoadIC keys | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:44:35 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:45:16 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:46:18 | KeyedLoadIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:69:19 | KeyedStoreIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:5:22 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:7:26 | LoadIC required | 2 / poly | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:7:49 | LoadIC allOf | 2 / poly | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:7:75 | LoadIC enum | 2 / poly | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:7:97 | LoadIC controls | 2 / poly | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:8:25 | LoadIC options | 2 / poly | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:8:53 | LoadIC presentation | 2 / poly | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:8:78 | LoadIC type | 2 / poly | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:16:13 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:20:11 | LoadIC freeze | 1 / mono | HOLEY_ELEMENTS |
### flat-500 / head

| 함수 | file:line:column (src/core/ 생략) | 접근 | map 수 / state | 요소 종류 |
| --- | --- | --- | --- | --- |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:24 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:82:6 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:28 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:84:6 | StoreIC kind | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:85:6 | StoreIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:86:6 | StoreIC nullable | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:87:16 | StoreIC strategy | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:88:27 | StoreIC declarations | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:34 | StoreIC isAtomic | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:98:33 | StoreIC collect | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:116:36 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:121:10 | LoadIC constructing | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:121:23 | LoadIC delete | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:36:37 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:37:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:37:32 | LoadIC gates | 72 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:39:36 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:40:14 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:42:24 | LoadIC stringify | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:42:35 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:12 | LoadIC templates | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:22 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:60 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:45:27 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:49:51 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:40 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:69 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:74 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:54:37 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:55:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:58:36 | LoadIC allowed | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:58:44 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:59:28 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:61:19 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:64:14 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:64:53 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:65:36 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:72:36 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:72:49 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:73:32 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:74:32 | LoadIC scope | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:77:24 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:78:16 | LoadIC context | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:78:56 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:18 | LoadIC nodes | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:24 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:28 | LoadIC schemaPath | 72 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:88:27 | LoadIC freeze | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:91:18 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:26 | LoadIC options | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:34 | LoadIC isAtomic | 105 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:98:33 | LoadIC collect | 105 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:101:26 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:101:42 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_FROZEN_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:101:63 | LoadIC gates | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:101:69 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:101:91 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:22 | LoadIC isAtomic | 105 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:64 | LoadIC collect | 105 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:103:26 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_FROZEN_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:104:33 | LoadIC schema | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:105:22 | LoadIC context | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:106:20 | LoadIC role | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:106:58 | LoadIC scope | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:107:21 | LoadIC validationOnly | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:108:17 | LoadIC nullable | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:108:50 | LoadIC pattern | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:109:26 | LoadIC type | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:110:26 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:112:10 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:114:20 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:115:23 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:117:17 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:118:13 | LoadIC strategy | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:61:27 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:62:25 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:63:29 | StoreIC inherited | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:64:21 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:24 | StoreIC fragment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:76:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:77:62 | StoreIC schemaPath | 70 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:43 | StoreIC order | 70 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:14 | StoreIC gates | 71 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:48 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:48 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:50 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:50 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:56 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:77:37 | LoadIC schemaPath | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:77:62 | LoadIC escapeSegment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:33 | LoadIC order | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:33 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:33 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:81:11 | LoadIC filter | 1 / mono | HOLEY_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:84:10 | LoadIC map | 1 / mono | HOLEY_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:32 | LoadIC gates | 71 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:32 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:42 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:42 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:42 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:36 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:89:24 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:89:35 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:90:47 | LoadIC findIndex | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:166:10 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:167:10 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:168:25 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:172:28 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:173:24 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:184:10 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:185:16 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:186:25 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:187:31 | StoreIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:164:15 | LoadIC freeze | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:168:25 | LoadIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:170:24 | LoadIC schemaPath | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:170:45 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:171:16 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:171:26 | LoadIC schemaPath | 71 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:174:24 | LoadIC gates | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:174:30 | LoadIC map | 1 / mono | PACKED_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:14 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:14 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:20 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:25 | LoadIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:33 | LoadIC escapeSegment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:24 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:24 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:15 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:15 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:33 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:46 | LoadIC map | 1 / mono | PACKED_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:182:14 | LoadIC push | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:183:15 | LoadIC freeze | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:192:17 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:194:13 | LoadIC size | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:203:11 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:31:32 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:31:45 | LoadIC flatMap | 1 / mono | PACKED_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:33 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:33 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:52:48 | LoadIC schema | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:54:13 | LoadIC type | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:55:7 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:61:27 | LoadIC context | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:62:25 | LoadIC gates | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:63:29 | LoadIC inherited | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:24 | LoadIC fragments | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:46 | LoadIC fragmentId | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:24 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:70:13 | LoadIC properties | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:13 | LoadIC entries | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:38 | LoadIC forEach | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:159:23 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:31 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:31 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:28 | LoadIC schema | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:34 | LoadIC controls | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:62 | LoadIC map | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:62:26 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:63:14 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:64:22 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:65:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:66:19 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:67:18 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:68:18 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:77:16 | StoreIC declarationId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:77:16 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:15 | LoadIC slice | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:26 | LoadIC lastIndexOf | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:15 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:79:4 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:80:22 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:81:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:82:25 | StoreIC fragmentId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:83:16 | StoreIC role | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:84:17 | StoreIC scope | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:86:19 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:87:20 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:88:20 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:89:21 | StoreIC inherited | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:90:20 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:130:62 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:34:15 | LoadIC includes | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:34:30 | LoadIC schemaPath | 72 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:35:40 | LoadIC schema | 72 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:40:10 | LoadIC isFragment | 72 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:42:59 | LoadIC options | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:44:12 | LoadIC gates | 72 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:44:18 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:44:34 | LoadIC context | 72 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:48:11 | LoadIC controls | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:62:16 | LoadIC fragments | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:62:26 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:67:18 | LoadIC freeze | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:67:35 | LoadIC order | 72 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:74:20 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:8 | LoadIC fragment | 72 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:8 | LoadIC children | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:18 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:41 | LoadIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:77:8 | LoadIC declarationId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:83:16 | LoadIC role | 72 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:87:20 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:88:20 | LoadIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:89:21 | LoadIC inherited | 72 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:90:20 | LoadIC hostPath | 72 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:92:2 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:92:67 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:93:16 | LoadIC id | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:96:18 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:98:15 | LoadIC capabilities | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:98:28 | LoadIC branchless | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:110:20 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:110:36 | StoreInArrayLiteralIC <dynamic> | 미제공 / poly |  |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:111:20 | LoadIC $ref | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:131:28 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:131:28 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:131:28 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:131:11 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:131:11 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:131:20 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:137:10 | KeyedLoadIC <dynamic> | ≥2 / mega | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:138:9 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:61 | LoadIC if | 2 / poly | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:6 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:38 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:59 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:89:18 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:89:40 | LoadIC emit | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:90:21 | LoadIC extras | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:96:42 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:96:48 | LoadIC propertyKeys | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:21 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:21 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:27 | LoadIC blueprintNode | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC childEntries | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:110:23 | LoadIC name | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:111:20 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:111:45 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:112:12 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:113:12 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:114:11 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:21 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:21 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:16 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:28 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:51 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:72 | StoreIC extras | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:149:4 | StoreIC names | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:150:18 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:150:36 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:19:24 | LoadIC local | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:20:31 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:22 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:22 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:18:30 | StoreIC previous | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:18:41 | StoreIC current | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:20:27 | StoreIC type | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:21:89 | StoreIC payload | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:22:60 | StoreIC source | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:22:60 | StoreIC options | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:20:7 | StoreIC pendingDelivery | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:23:7 | StoreIC deliveryInitialized | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:24:7 | StoreIC revisionLedger | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:25:7 | StoreIC pendingRevision | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:16:23 | LoadIC behavior | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:16:32 | LoadIC strategy | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:50 | LoadIC local | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:24:58 | LoadIC revisionLedger | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:18 | StoreIC local | 2 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:36 | LoadIC emit | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:36 | StoreIC emit | 2 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:50:29 | StoreIC deliveries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:51:40 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:51:53 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:39 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:56 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:83 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:60:12 | StoreIC entered | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:61:12 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:74:12 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:76:13 | StoreIC structure | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:77:30 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:77:13 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:86:15 | StoreIC raw | 미제공 / other |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:87:15 | StoreIC extras | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:89:16 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:16 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:101:40 | StoreIC index | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:12 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:25 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:32 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:56 | StoreIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:43 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:60 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:87 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:71:14 | StoreIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:92:18 | StoreIC raw | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:56:15 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:57:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:58:23 | LoadIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:59:15 | LoadIC entered | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:62:17 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:63:26 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:63:33 | LoadIC schema | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:65:35 | LoadIC hasOwnProperty | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:65:82 | LoadIC default | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:66:24 | LoadIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:68:15 | LoadIC behavior | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:68:24 | LoadIC type | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:69:34 | LoadIC blueprintNode | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:34 | LoadIC interpret | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:67 | LoadIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:84 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:75:24 | LoadIC strategy | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:93:25 | LoadIC interactionState | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:14 | LoadIC index | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:28 | LoadIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:36 | LoadIC length | 2 / poly | PACKED_FROZEN_ELEMENTS, HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:113:38 | LoadIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:116:10 | LoadIC pop | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:101:26 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:11 | LoadIC structure | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:28 | LoadIC name | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:32 | KeyedStoreIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:104:12 | LoadIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:104:22 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:29 | LoadIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:38 | LoadIC includes | 1 / mono | PACKED_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:12 | LoadIC push | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:118:10 | StoreIC commitNumber | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:45:23 | LoadIC runtime | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:46:26 | LoadIC commitNumber | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:47:43 | LoadIC DisableAutomaticWrites | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:48:42 | LoadIC EnableAutomaticWrites | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:49:49 | LoadIC disableAutomaticWrites | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:50:21 | LoadIC deliveries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:83 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:76:32 | LoadIC create | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:78:26 | LoadIC type | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:27 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:35 | LoadIC required | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:22 | LoadIC role | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:61 | LoadIC gates | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:67 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:21:9 | LoadIC strategy | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:36:11 | LoadIC declarations | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:36:24 | LoadIC some | 1 / mono | PACKED_FROZEN_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:41:31 | LoadIC node | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:42:9 | LoadIC delete | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:43:11 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:22:9 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:23:13 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:26:13 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:33:9 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:15 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_FROZEN_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:15 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:15:52 | LoadIC schema | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:15:58 | LoadIC controls | 2 / poly | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC nodes | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:15:7 | LoadIC stringify | 1 / mono | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:16:11 | LoadIC map | 1 / mono | PACKED_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:17:44 | LoadIC schema | 72 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:19:22 | LoadIC $ref | 2 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:21:18 | LoadIC schemaPath | 72 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:22:26 | LoadIC gates | 72 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:22:32 | LoadIC map | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:32:8 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:33:14 | LoadIC context | 72 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:34:14 | LoadIC filter | 2 / poly | PACKED_SMI_ELEMENTS, HOLEY_SMI_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:61:9 | StoreIC type | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:62:40 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:22:14 | LoadIC mode | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:22:43 | LoadIC isAtomic | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:23:12 | LoadIC collect | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:23:42 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:23:59 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:24:9 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:24:22 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:24:51 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:26:22 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:27:29 | LoadIC schema | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:28:27 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_FROZEN_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:28:58 | LoadIC gates | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:28:64 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:29:16 | LoadIC context | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:29:57 | LoadIC role | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:30:16 | LoadIC scope | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:30:48 | LoadIC validationOnly | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:31:49 | LoadIC type | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:32:25 | LoadIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:32:39 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:32:63 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:33:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:33:27 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:33:47 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:34:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:34:30 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:34:53 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:36 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:29 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:54 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:28 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:57 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:40:22 | LoadIC keys | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:41:35 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:42:16 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:43:18 | KeyedLoadIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:59:19 | KeyedStoreIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:62:16 | LoadIC freeze | 1 / mono | HOLEY_ELEMENTS |
### flat-500 / candidate

| 함수 | file:line:column (src/core/ 생략) | 접근 | map 수 / state | 요소 종류 |
| --- | --- | --- | --- | --- |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:24 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:82:6 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:28 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:84:6 | StoreIC kind | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:85:6 | StoreIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:86:6 | StoreIC nullable | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:87:16 | StoreIC strategy | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:88:20 | StoreIC declarations | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:34 | StoreIC isAtomic | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:98:33 | StoreIC collect | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:117:36 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:122:10 | LoadIC constructing | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:122:23 | LoadIC delete | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:36:37 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:37:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:37:32 | LoadIC gates | 65 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:39:36 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:40:14 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:42:24 | LoadIC stringify | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:42:35 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:12 | LoadIC templates | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:22 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:60 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:45:27 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:49:51 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:40 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:69 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:74 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:54:37 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:55:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:58:36 | LoadIC allowed | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:58:44 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:59:28 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:61:19 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:64:14 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:64:38 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:65:36 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:72:36 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:72:49 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:73:32 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:74:32 | LoadIC scope | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:77:24 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:78:16 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:78:56 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:18 | LoadIC nodes | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:24 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:28 | LoadIC schemaPath | 65 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:91:18 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:26 | LoadIC options | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:34 | LoadIC isAtomic | 102 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:98:33 | LoadIC collect | 102 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:26 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:42 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:63 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:69 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:91 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:103:22 | LoadIC isAtomic | 102 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:103:64 | LoadIC collect | 102 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:104:26 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:105:33 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:106:22 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:107:20 | LoadIC role | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:107:58 | LoadIC scope | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:108:21 | LoadIC validationOnly | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:109:17 | LoadIC nullable | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:109:50 | LoadIC pattern | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:110:26 | LoadIC type | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:111:26 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:113:10 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:115:20 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:116:23 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:118:17 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:119:13 | LoadIC strategy | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:61:27 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:62:25 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:63:29 | StoreIC inherited | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:64:21 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:24 | StoreIC fragment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:76:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:77:62 | StoreIC schemaPath | 61 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:43 | StoreIC order | 61 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:14 | StoreIC gates | 64 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:48 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:48 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:50 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:50 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:56 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:77:37 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:77:62 | LoadIC escapeSegment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:33 | LoadIC order | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:33 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:33 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:81:11 | LoadIC filter | 1 / mono | HOLEY_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:84:10 | LoadIC map | 1 / mono | HOLEY_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:32 | LoadIC gates | 64 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:32 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:42 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:42 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:42 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:36 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:89:24 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:89:35 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:90:47 | LoadIC findIndex | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:166:10 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:167:10 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:168:25 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:172:28 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:173:35 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:182:10 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:183:16 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:184:25 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:185:10 | StoreIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:168:25 | LoadIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:170:24 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:170:45 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:171:16 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:171:26 | LoadIC schemaPath | 64 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:173:29 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:173:35 | LoadIC map | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:14 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:14 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:20 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:25 | LoadIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:33 | LoadIC escapeSegment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:24 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:24 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:15 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:15 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:33 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:46 | LoadIC map | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:180:14 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:190:17 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:192:13 | LoadIC size | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:200:11 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:31:32 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:31:45 | LoadIC flatMap | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:33 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:33 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:52:48 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:54:13 | LoadIC type | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:55:7 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:61:27 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:62:25 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:63:29 | LoadIC inherited | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:24 | LoadIC fragments | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:46 | LoadIC fragmentId | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:24 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:70:13 | LoadIC properties | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:13 | LoadIC entries | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:38 | LoadIC forEach | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:159:23 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:31 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:31 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:28 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:34 | LoadIC controls | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:62 | LoadIC map | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:62:26 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:63:14 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:64:22 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:65:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:66:19 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:67:21 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:68:4 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:77:16 | StoreIC declarationId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:77:16 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:15 | LoadIC slice | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:26 | LoadIC lastIndexOf | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:15 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:79:4 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:80:22 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:81:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:82:25 | StoreIC fragmentId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:83:16 | StoreIC role | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:84:17 | StoreIC scope | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:86:19 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:87:20 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:88:20 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:89:21 | StoreIC inherited | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:90:20 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:131:62 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:34:15 | LoadIC includes | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:34:30 | LoadIC schemaPath | 65 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:35:40 | LoadIC schema | 65 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:40:10 | LoadIC isFragment | 65 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:42:59 | LoadIC options | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:44:12 | LoadIC gates | 65 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:44:18 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:44:34 | LoadIC context | 65 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:48:11 | LoadIC controls | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:62:16 | LoadIC fragments | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:62:26 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:67:21 | LoadIC order | 65 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:74:20 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:8 | LoadIC fragment | 65 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:8 | LoadIC children | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:18 | LoadIC push | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:41 | LoadIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:77:8 | LoadIC declarationId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:83:16 | LoadIC role | 65 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:87:20 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:88:20 | LoadIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:89:21 | LoadIC inherited | 65 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:90:20 | LoadIC hostPath | 65 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:92:10 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:92:23 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:93:2 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:93:67 | LoadIC push | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:94:16 | LoadIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:97:18 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:99:15 | LoadIC capabilities | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:99:28 | LoadIC branchless | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:111:20 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:111:36 | StoreInArrayLiteralIC <dynamic> | 미제공 / poly |  |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:112:20 | LoadIC $ref | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:28 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:28 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:28 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:11 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:11 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:20 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:138:10 | KeyedLoadIC <dynamic> | ≥2 / mega | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:139:9 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:133:61 | LoadIC if | 2 / poly | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:6 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:38 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:59 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:89:18 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:89:40 | LoadIC emit | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:90:21 | LoadIC extras | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:96:42 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:96:48 | LoadIC propertyKeys | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:21 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:21 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:27 | LoadIC blueprintNode | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:110:23 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:111:20 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:111:45 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:112:12 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:113:12 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:114:11 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:21 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:21 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:16 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:28 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:51 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:72 | StoreIC extras | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:149:4 | StoreIC names | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:150:18 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:150:36 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:19:24 | LoadIC local | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:20:31 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:22 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:22 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:18:30 | StoreIC previous | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:18:41 | StoreIC current | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:20:27 | StoreIC type | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:21:89 | StoreIC payload | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:22:60 | StoreIC source | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:22:60 | StoreIC options | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:20:7 | StoreIC pendingDelivery | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:23:7 | StoreIC deliveryInitialized | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:24:7 | StoreIC revisionLedger | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:25:7 | StoreIC pendingRevision | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:16:23 | LoadIC behavior | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:16:32 | LoadIC strategy | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:50 | LoadIC local | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:24:58 | LoadIC revisionLedger | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:18 | StoreIC local | 2 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:36 | LoadIC emit | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:36 | StoreIC emit | 2 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:50:29 | StoreIC deliveries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:51:40 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:51:53 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:39 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:56 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:83 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:60:12 | StoreIC entered | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:61:12 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:74:12 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:76:13 | StoreIC structure | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:77:30 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:77:13 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:86:15 | StoreIC raw | 미제공 / other |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:87:15 | StoreIC extras | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:89:16 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:16 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:101:40 | StoreIC index | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:12 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:25 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:32 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:56 | StoreIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:43 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:60 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:87 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:71:14 | StoreIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:92:18 | StoreIC raw | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:56:15 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:57:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:58:23 | LoadIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:59:15 | LoadIC entered | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:62:17 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:63:26 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:63:33 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:65:35 | LoadIC hasOwnProperty | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:65:82 | LoadIC default | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:66:24 | LoadIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:68:15 | LoadIC behavior | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:68:24 | LoadIC type | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:69:34 | LoadIC blueprintNode | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:34 | LoadIC interpret | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:67 | LoadIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:84 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:75:24 | LoadIC strategy | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:93:25 | LoadIC interactionState | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:14 | LoadIC index | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:28 | LoadIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:36 | LoadIC length | 2 / poly | PACKED_FROZEN_ELEMENTS, HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:113:38 | LoadIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:116:10 | LoadIC pop | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:101:26 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:11 | LoadIC structure | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:28 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:32 | KeyedStoreIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:104:12 | LoadIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:104:22 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:29 | LoadIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:38 | LoadIC includes | 1 / mono | PACKED_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:12 | LoadIC push | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:118:10 | StoreIC commitNumber | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:45:23 | LoadIC runtime | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:46:26 | LoadIC commitNumber | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:47:43 | LoadIC DisableAutomaticWrites | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:48:42 | LoadIC EnableAutomaticWrites | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:49:49 | LoadIC disableAutomaticWrites | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:50:21 | LoadIC deliveries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:83 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:76:32 | LoadIC create | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:78:26 | LoadIC type | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:27 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:35 | LoadIC required | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:22 | LoadIC role | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:61 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:67 | LoadIC length | 2 / mono | PACKED_SMI_ELEMENTS, HOLEY_SMI_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:21:9 | LoadIC strategy | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:36:11 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:36:24 | LoadIC some | 2 / mono | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:41:31 | LoadIC node | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:42:9 | LoadIC delete | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:43:11 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:22:9 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:23:13 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:26:13 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:33:9 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:15 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:15 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:15:52 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:15:58 | LoadIC controls | 2 / poly | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC nodes | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:15:7 | LoadIC stringify | 1 / mono | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:16:11 | LoadIC map | 1 / mono | PACKED_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:17:44 | LoadIC schema | 65 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:19:22 | LoadIC $ref | 2 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:21:18 | LoadIC schemaPath | 65 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:22:26 | LoadIC gates | 65 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:22:32 | LoadIC map | 1 / mono | PACKED_SMI_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:32:8 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:33:14 | LoadIC context | 65 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:34:14 | LoadIC filter | 2 / poly | PACKED_SMI_ELEMENTS, HOLEY_SMI_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:71:9 | StoreIC type | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:72:19 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:25:14 | LoadIC mode | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:25:43 | LoadIC isAtomic | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:26:12 | LoadIC collect | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:26:42 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:26:59 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:27:9 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:27:22 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:27:51 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:29:22 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:30:29 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:31:27 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:31:58 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:31:64 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:32:16 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:32:57 | LoadIC role | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:33:16 | LoadIC scope | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:33:48 | LoadIC validationOnly | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:34:49 | LoadIC type | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:25 | LoadIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:39 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:63 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:27 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:47 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:30 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:53 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:38:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:38:36 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:39:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:39:29 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:39:54 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:40:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:40:28 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:40:57 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:43:22 | LoadIC keys | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:44:35 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:45:16 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:46:18 | KeyedLoadIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:69:19 | KeyedStoreIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:21:38 | LoadIC fragments | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:21:48 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:22:29 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:23:34 | LoadIC order | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:24:34 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:25:45 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:35:38 | LoadIC nodes | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:35:44 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:36:25 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:37:8 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:37:21 | LoadIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:38:40 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:40:37 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:41:13 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:42:25 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:43:40 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:44:20 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:45:40 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintDeclarations | blueprint/utils/freezeBlueprintValues/utils/freezeBlueprintDeclarations.ts:14:43 | LoadIC length | 2 / poly | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| freezeBlueprintDeclarations | blueprint/utils/freezeBlueprintValues/utils/freezeBlueprintDeclarations.ts:15:24 | KeyedLoadIC <dynamic> | 2 / poly | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| freezeBlueprintDeclarations | blueprint/utils/freezeBlueprintValues/utils/freezeBlueprintDeclarations.ts:16:30 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintDeclarations | blueprint/utils/freezeBlueprintValues/utils/freezeBlueprintDeclarations.ts:17:36 | LoadIC length | 3 / poly (동결 혼합) | PACKED_SMI_ELEMENTS, PACKED_FROZEN_ELEMENTS, HOLEY_SMI_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:20:43 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:21:27 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:21:20 | KeyedLoadIC <dynamic> | ≥2 / mega | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:25:27 | LoadIC allOf | 2 / poly | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:26:8 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:18:24 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:20:4 | KeyedLoadIC <dynamic> | ≥2 / mega | HOLEY_ELEMENTS |
### flat-500 / unfrozen

| 함수 | file:line:column (src/core/ 생략) | 접근 | map 수 / state | 요소 종류 |
| --- | --- | --- | --- | --- |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:24 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:82:6 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:28 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:84:6 | StoreIC kind | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:85:6 | StoreIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:86:6 | StoreIC nullable | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:87:16 | StoreIC strategy | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:88:34 | StoreIC declarations | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:34 | StoreIC isAtomic | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:98:33 | StoreIC collect | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:116:36 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:121:10 | LoadIC constructing | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:121:23 | LoadIC delete | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:36:37 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:37:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:37:32 | LoadIC gates | 75 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:39:36 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:40:14 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:42:24 | LoadIC stringify | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:42:35 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:12 | LoadIC templates | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:22 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:60 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:45:27 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:49:51 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:40 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:69 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:74 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:54:37 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:55:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:58:36 | LoadIC allowed | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:58:44 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:59:28 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:61:19 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:64:14 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:64:53 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:65:36 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:72:36 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:72:49 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:73:32 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:74:32 | LoadIC scope | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:77:24 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:78:16 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:78:56 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:18 | LoadIC nodes | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:24 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:28 | LoadIC schemaPath | 75 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:91:18 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:26 | LoadIC options | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:34 | LoadIC isAtomic | 116 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:98:33 | LoadIC collect | 116 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:101:26 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:101:42 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:101:63 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:101:69 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:101:91 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:22 | LoadIC isAtomic | 116 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:64 | LoadIC collect | 116 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:103:26 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:104:33 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:105:22 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:106:20 | LoadIC role | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:106:58 | LoadIC scope | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:107:21 | LoadIC validationOnly | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:108:17 | LoadIC nullable | 2 / poly |  |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:108:50 | LoadIC pattern | 2 / poly |  |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:109:26 | LoadIC type | 2 / poly |  |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:110:26 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:112:10 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:114:20 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:115:23 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:117:17 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:118:13 | LoadIC strategy | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:61:27 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:62:25 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:63:29 | StoreIC inherited | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:64:21 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:24 | StoreIC fragment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:76:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:77:62 | StoreIC schemaPath | 71 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:43 | StoreIC order | 71 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:14 | StoreIC gates | 74 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:48 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:48 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:50 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:50 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:56 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:77:37 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:77:62 | LoadIC escapeSegment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:33 | LoadIC order | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:33 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:33 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:81:11 | LoadIC filter | 1 / mono | HOLEY_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:84:10 | LoadIC map | 1 / mono | HOLEY_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:32 | LoadIC gates | 74 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:32 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:42 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:42 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:42 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:36 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:89:24 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:89:35 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:90:47 | LoadIC findIndex | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:166:10 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:167:10 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:168:25 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:172:28 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:174:30 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:184:10 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:185:16 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:186:25 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:187:10 | StoreIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:168:25 | LoadIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:170:24 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:170:45 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:171:16 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:171:26 | LoadIC schemaPath | 74 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:174:24 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:174:30 | LoadIC map | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:14 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:14 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:20 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:25 | LoadIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:33 | LoadIC escapeSegment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:24 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:24 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:15 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:15 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:33 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:46 | LoadIC map | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:182:14 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:192:17 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:194:13 | LoadIC size | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:203:11 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:31:32 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:31:45 | LoadIC flatMap | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:33 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:33 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:52:48 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:54:13 | LoadIC type | 1 / mono |  |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:55:7 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:61:27 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:62:25 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:63:29 | LoadIC inherited | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:24 | LoadIC fragments | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:46 | LoadIC fragmentId | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:24 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:70:13 | LoadIC properties | 1 / mono |  |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:13 | LoadIC entries | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:38 | LoadIC forEach | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:159:23 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:31 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:31 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:28 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:34 | LoadIC controls | 1 / mono |  |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:62 | LoadIC map | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:62:26 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:63:14 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:64:22 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:65:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:66:19 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:67:35 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:68:4 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:77:16 | StoreIC declarationId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:77:16 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:15 | LoadIC slice | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:26 | LoadIC lastIndexOf | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:15 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:79:4 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:80:22 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:81:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:82:25 | StoreIC fragmentId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:83:16 | StoreIC role | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:84:17 | StoreIC scope | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:86:19 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:87:20 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:88:20 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:89:21 | StoreIC inherited | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:90:20 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:130:62 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:34:15 | LoadIC includes | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:34:30 | LoadIC schemaPath | 75 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:35:40 | LoadIC schema | 75 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:40:10 | LoadIC isFragment | 75 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:42:59 | LoadIC options | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:44:12 | LoadIC gates | 75 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:44:18 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:44:34 | LoadIC context | 75 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:48:11 | LoadIC controls | 2 / poly |  |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:62:16 | LoadIC fragments | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:62:26 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:67:35 | LoadIC order | 75 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:74:20 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:8 | LoadIC fragment | 75 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:8 | LoadIC children | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:18 | LoadIC push | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:41 | LoadIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:77:8 | LoadIC declarationId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:83:16 | LoadIC role | 75 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:87:20 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:88:20 | LoadIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:89:21 | LoadIC inherited | 75 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:90:20 | LoadIC hostPath | 75 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:92:2 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:92:67 | LoadIC push | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:93:16 | LoadIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:96:18 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:98:15 | LoadIC capabilities | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:98:28 | LoadIC branchless | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:110:20 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:110:36 | StoreInArrayLiteralIC <dynamic> | 미제공 / poly |  |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:111:20 | LoadIC $ref | 2 / poly |  |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:131:28 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:131:28 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:131:28 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:131:11 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:131:11 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:131:20 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:137:10 | KeyedLoadIC <dynamic> | ≥2 / mega |  |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:138:9 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:61 | LoadIC if | 2 / poly |  |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:6 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:38 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:59 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:89:18 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:89:40 | LoadIC emit | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:90:21 | LoadIC extras | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:96:42 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:96:48 | LoadIC propertyKeys | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:21 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:21 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:27 | LoadIC blueprintNode | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:110:23 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:111:20 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:111:45 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:112:12 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:113:12 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:114:11 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:21 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:21 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:16 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:28 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:51 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:72 | StoreIC extras | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:149:4 | StoreIC names | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:150:18 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:150:36 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:19:24 | LoadIC local | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:20:31 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:22 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:22 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:18:30 | StoreIC previous | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:18:41 | StoreIC current | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:20:27 | StoreIC type | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:21:89 | StoreIC payload | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:22:60 | StoreIC source | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:22:60 | StoreIC options | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:20:7 | StoreIC pendingDelivery | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:23:7 | StoreIC deliveryInitialized | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:24:7 | StoreIC revisionLedger | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:25:7 | StoreIC pendingRevision | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:16:23 | LoadIC behavior | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:16:32 | LoadIC strategy | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:50 | LoadIC local | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:24:58 | LoadIC revisionLedger | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:18 | StoreIC local | 2 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:36 | LoadIC emit | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:36 | StoreIC emit | 2 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:50:29 | StoreIC deliveries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:51:40 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:51:53 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:39 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:56 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:83 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:60:12 | StoreIC entered | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:61:12 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:74:12 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:76:13 | StoreIC structure | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:77:30 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:77:13 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:86:15 | StoreIC raw | 미제공 / other |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:87:15 | StoreIC extras | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:89:16 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:16 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:101:40 | StoreIC index | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:12 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:25 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:32 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:56 | StoreIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:43 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:60 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:87 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:71:14 | StoreIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:92:18 | StoreIC raw | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:56:15 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:57:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:58:23 | LoadIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:59:15 | LoadIC entered | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:62:17 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:63:26 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:63:33 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:65:35 | LoadIC hasOwnProperty | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:65:82 | LoadIC default | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:66:24 | LoadIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:68:15 | LoadIC behavior | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:68:24 | LoadIC type | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:69:34 | LoadIC blueprintNode | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:34 | LoadIC interpret | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:67 | LoadIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:84 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:75:24 | LoadIC strategy | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:93:25 | LoadIC interactionState | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:14 | LoadIC index | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:28 | LoadIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:36 | LoadIC length | 2 / poly | PACKED_FROZEN_ELEMENTS, HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:113:38 | LoadIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:116:10 | LoadIC pop | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:101:26 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:11 | LoadIC structure | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:28 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:32 | KeyedStoreIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:104:12 | LoadIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:104:22 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:29 | LoadIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:38 | LoadIC includes | 1 / mono | PACKED_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:12 | LoadIC push | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:118:10 | StoreIC commitNumber | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:45:23 | LoadIC runtime | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:46:26 | LoadIC commitNumber | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:47:43 | LoadIC DisableAutomaticWrites | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:48:42 | LoadIC EnableAutomaticWrites | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:49:49 | LoadIC disableAutomaticWrites | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:50:21 | LoadIC deliveries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:83 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:76:32 | LoadIC create | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:78:26 | LoadIC type | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:27 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:35 | LoadIC required | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:22 | LoadIC role | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:61 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:67 | LoadIC length | 2 / mono | PACKED_SMI_ELEMENTS, HOLEY_SMI_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:21:9 | LoadIC strategy | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:36:11 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:36:24 | LoadIC some | 2 / mono | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:41:31 | LoadIC node | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:42:9 | LoadIC delete | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:43:11 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:22:9 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:23:13 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:26:13 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:33:9 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:15 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:15 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:15:52 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:15:58 | LoadIC controls | 2 / poly |  |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC nodes | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:15:7 | LoadIC stringify | 1 / mono | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:16:11 | LoadIC map | 1 / mono | PACKED_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:17:44 | LoadIC schema | 75 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:19:22 | LoadIC $ref | 2 / poly |  |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:21:18 | LoadIC schemaPath | 75 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:22:26 | LoadIC gates | 75 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:22:32 | LoadIC map | 1 / mono | PACKED_SMI_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:32:8 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:33:14 | LoadIC context | 75 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:34:14 | LoadIC filter | 2 / poly | PACKED_SMI_ELEMENTS, HOLEY_SMI_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:61:9 | StoreIC type | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:62:25 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:22:14 | LoadIC mode | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:22:43 | LoadIC isAtomic | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:23:12 | LoadIC collect | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:23:42 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:23:59 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:24:9 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:24:22 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:24:51 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:26:22 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:27:29 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:28:27 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:28:58 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:28:64 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:29:16 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:29:57 | LoadIC role | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:30:16 | LoadIC scope | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:30:48 | LoadIC validationOnly | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:31:49 | LoadIC type | 2 / poly |  |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:32:25 | LoadIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:32:39 | KeyedLoadIC <dynamic> | 2 / poly |  |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:32:63 | KeyedLoadIC <dynamic> | 2 / poly |  |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:33:4 | KeyedLoadIC <dynamic> | 2 / poly |  |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:33:27 | KeyedLoadIC <dynamic> | 2 / poly |  |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:33:47 | KeyedLoadIC <dynamic> | 2 / poly |  |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:34:4 | KeyedLoadIC <dynamic> | 2 / poly |  |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:34:30 | KeyedLoadIC <dynamic> | 2 / poly |  |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:34:53 | KeyedLoadIC <dynamic> | 2 / poly |  |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:4 | KeyedLoadIC <dynamic> | 2 / poly |  |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:36 | KeyedLoadIC <dynamic> | 2 / poly |  |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:4 | KeyedLoadIC <dynamic> | 2 / poly |  |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:29 | KeyedLoadIC <dynamic> | 2 / poly |  |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:54 | KeyedLoadIC <dynamic> | 2 / poly |  |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:4 | KeyedLoadIC <dynamic> | 2 / poly |  |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:28 | KeyedLoadIC <dynamic> | 2 / poly |  |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:57 | KeyedLoadIC <dynamic> | 2 / poly |  |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:40:22 | LoadIC keys | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:41:35 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:42:16 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:43:18 | KeyedLoadIC <dynamic> | ≥1 / mega |  |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:59:19 | KeyedStoreIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
### flat-500 / uniform-gates

| 함수 | file:line:column (src/core/ 생략) | 접근 | map 수 / state | 요소 종류 |
| --- | --- | --- | --- | --- |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:24 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:82:6 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:28 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:84:6 | StoreIC kind | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:85:6 | StoreIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:86:6 | StoreIC nullable | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:87:16 | StoreIC strategy | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:88:20 | StoreIC declarations | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:34 | StoreIC isAtomic | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:98:33 | StoreIC collect | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:117:36 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:122:10 | LoadIC constructing | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:122:23 | LoadIC delete | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:36:37 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:37:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:37:32 | LoadIC gates | 71 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:39:36 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:40:14 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:42:24 | LoadIC stringify | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:42:35 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:12 | LoadIC templates | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:22 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:60 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:45:27 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:49:51 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:40 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:69 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:74 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:54:37 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:55:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:58:36 | LoadIC allowed | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:58:44 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:59:28 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:61:19 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:64:14 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:64:38 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:65:36 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:72:36 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:72:49 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:73:32 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:74:32 | LoadIC scope | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:77:24 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:78:16 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:78:56 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:18 | LoadIC nodes | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:24 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:28 | LoadIC schemaPath | 71 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:91:18 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:26 | LoadIC options | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:34 | LoadIC isAtomic | 104 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:98:33 | LoadIC collect | 104 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:26 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:42 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:63 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:69 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:91 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:103:22 | LoadIC isAtomic | 104 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:103:64 | LoadIC collect | 104 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:104:26 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:105:33 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:106:22 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:107:20 | LoadIC role | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:107:58 | LoadIC scope | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:108:21 | LoadIC validationOnly | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:109:17 | LoadIC nullable | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:109:50 | LoadIC pattern | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:110:26 | LoadIC type | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:111:26 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:113:10 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:115:20 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:116:23 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:118:17 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:119:13 | LoadIC strategy | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:62:27 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:63:25 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:64:29 | StoreIC inherited | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:21 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:66:24 | StoreIC fragment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:77:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:62 | StoreIC schemaPath | 67 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:79:43 | StoreIC order | 67 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:14 | StoreIC gates | 70 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:74:48 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:74:48 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:74:50 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:74:50 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:74:56 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:37 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:62 | LoadIC escapeSegment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:79:33 | LoadIC order | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:79:33 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:79:33 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:82:11 | LoadIC filter | 1 / mono | HOLEY_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:85:10 | LoadIC map | 1 / mono | HOLEY_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:32 | LoadIC gates | 70 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:32 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:42 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:42 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:42 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:88:36 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:90:24 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:90:35 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:91:47 | LoadIC findIndex | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:167:10 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:168:10 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:169:25 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:173:28 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:174:17 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:183:10 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:184:16 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:185:25 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:186:10 | StoreIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:169:25 | LoadIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:171:24 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:171:45 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:172:16 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:172:26 | LoadIC schemaPath | 70 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:174:50 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:174:56 | LoadIC map | 1 / mono | PACKED_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:26 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:26 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:26 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:26 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:14 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:14 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:20 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:25 | LoadIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:33 | LoadIC escapeSegment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:24 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:24 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:15 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:15 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:164:33 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:164:46 | LoadIC map | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:181:14 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:191:17 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:193:13 | LoadIC size | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:201:11 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:32 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:45 | LoadIC flatMap | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:52:33 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:52:33 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:52:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:52:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:53:48 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:55:13 | LoadIC type | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:56:7 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:62:27 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:63:25 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:64:29 | LoadIC inherited | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:66:24 | LoadIC fragments | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:66:46 | LoadIC fragmentId | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:66:24 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:71:13 | LoadIC properties | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:74:13 | LoadIC entries | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:74:38 | LoadIC forEach | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:23 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:31 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:31 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:33:28 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:33:34 | LoadIC controls | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:33:62 | LoadIC map | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:63:26 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:64:14 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:65:22 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:66:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:67:19 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:68:11 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:69:11 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:16 | StoreIC declarationId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:16 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:79:15 | LoadIC slice | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:79:26 | LoadIC lastIndexOf | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:79:15 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:80:4 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:81:22 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:82:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:83:25 | StoreIC fragmentId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:84:16 | StoreIC role | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:85:17 | StoreIC scope | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:87:19 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:88:20 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:89:20 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:90:21 | StoreIC inherited | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:91:20 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:62 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:35:15 | LoadIC includes | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:35:30 | LoadIC schemaPath | 71 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:36:40 | LoadIC schema | 71 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:41:10 | LoadIC isFragment | 71 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:43:59 | LoadIC options | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:45:12 | LoadIC gates | 71 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:45:18 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:45:34 | LoadIC context | 71 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:49:11 | LoadIC controls | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:63:16 | LoadIC fragments | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:63:26 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:68:42 | LoadIC order | 71 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:20 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:76:8 | LoadIC fragment | 71 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:76:8 | LoadIC children | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:76:18 | LoadIC push | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:76:41 | LoadIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:8 | LoadIC declarationId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:84:16 | LoadIC role | 71 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:88:20 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:89:20 | LoadIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:90:21 | LoadIC inherited | 71 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:91:20 | LoadIC hostPath | 71 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:93:10 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:93:23 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:94:2 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:94:67 | LoadIC push | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:95:16 | LoadIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:98:18 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:100:15 | LoadIC capabilities | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:100:28 | LoadIC branchless | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:112:20 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:112:36 | StoreInArrayLiteralIC <dynamic> | 미제공 / poly |  |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:113:20 | LoadIC $ref | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:133:28 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:133:28 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:133:28 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:133:11 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:133:11 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:133:20 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:139:10 | KeyedLoadIC <dynamic> | ≥2 / mega | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:140:9 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:134:61 | LoadIC if | 2 / poly | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:6 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:38 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:59 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:89:18 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:89:40 | LoadIC emit | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:90:21 | LoadIC extras | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:96:42 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:96:48 | LoadIC propertyKeys | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:21 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:21 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:27 | LoadIC blueprintNode | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:110:23 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:111:20 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:111:45 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:112:12 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:113:12 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:114:11 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:21 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:21 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:16 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:28 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:51 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:72 | StoreIC extras | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:149:4 | StoreIC names | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:150:18 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:150:36 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:19:24 | LoadIC local | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:20:31 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:22 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:22 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:18:30 | StoreIC previous | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:18:41 | StoreIC current | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:20:27 | StoreIC type | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:21:89 | StoreIC payload | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:22:60 | StoreIC source | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:22:60 | StoreIC options | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:20:7 | StoreIC pendingDelivery | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:23:7 | StoreIC deliveryInitialized | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:24:7 | StoreIC revisionLedger | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:25:7 | StoreIC pendingRevision | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:16:23 | LoadIC behavior | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:16:32 | LoadIC strategy | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:50 | LoadIC local | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:24:58 | LoadIC revisionLedger | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:18 | StoreIC local | 2 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:36 | LoadIC emit | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:36 | StoreIC emit | 2 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:50:29 | StoreIC deliveries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:51:40 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:51:53 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:39 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:56 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:83 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:60:12 | StoreIC entered | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:61:12 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:74:12 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:76:13 | StoreIC structure | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:77:30 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:77:13 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:86:15 | StoreIC raw | 미제공 / other |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:87:15 | StoreIC extras | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:89:16 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:16 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:101:40 | StoreIC index | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:12 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:25 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:32 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:56 | StoreIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:43 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:60 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:87 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:71:14 | StoreIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:92:18 | StoreIC raw | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:56:15 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:57:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:58:23 | LoadIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:59:15 | LoadIC entered | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:62:17 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:63:26 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:63:33 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:65:35 | LoadIC hasOwnProperty | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:65:82 | LoadIC default | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:66:24 | LoadIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:68:15 | LoadIC behavior | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:68:24 | LoadIC type | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:69:34 | LoadIC blueprintNode | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:34 | LoadIC interpret | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:67 | LoadIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:84 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:75:24 | LoadIC strategy | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:93:25 | LoadIC interactionState | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:14 | LoadIC index | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:28 | LoadIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:36 | LoadIC length | 2 / poly | PACKED_FROZEN_ELEMENTS, HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:113:38 | LoadIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:116:10 | LoadIC pop | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:101:26 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:11 | LoadIC structure | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:28 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:32 | KeyedStoreIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:104:12 | LoadIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:104:22 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:29 | LoadIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:38 | LoadIC includes | 1 / mono | PACKED_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:12 | LoadIC push | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:118:10 | StoreIC commitNumber | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:45:23 | LoadIC runtime | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:46:26 | LoadIC commitNumber | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:47:43 | LoadIC DisableAutomaticWrites | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:48:42 | LoadIC EnableAutomaticWrites | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:49:49 | LoadIC disableAutomaticWrites | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:50:21 | LoadIC deliveries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:83 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:76:32 | LoadIC create | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:78:26 | LoadIC type | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:27 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:35 | LoadIC required | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:22 | LoadIC role | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:61 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:67 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:21:9 | LoadIC strategy | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:36:11 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:36:24 | LoadIC some | 2 / mono | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:41:31 | LoadIC node | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:42:9 | LoadIC delete | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:43:11 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:22:9 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:23:13 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:26:13 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:33:9 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:15 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:15 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:15:52 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:15:58 | LoadIC controls | 2 / poly | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC nodes | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:15:7 | LoadIC stringify | 1 / mono | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:16:11 | LoadIC map | 1 / mono | PACKED_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:17:44 | LoadIC schema | 71 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:19:22 | LoadIC $ref | 2 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:21:18 | LoadIC schemaPath | 71 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:22:26 | LoadIC gates | 71 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:22:32 | LoadIC map | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:32:8 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:33:14 | LoadIC context | 71 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:34:14 | LoadIC filter | 2 / poly | PACKED_SMI_ELEMENTS, HOLEY_SMI_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:71:9 | StoreIC type | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:72:19 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:25:14 | LoadIC mode | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:25:43 | LoadIC isAtomic | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:26:12 | LoadIC collect | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:26:42 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:26:59 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:27:9 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:27:22 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:27:51 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:29:22 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:30:29 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:31:27 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:31:58 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:31:64 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:32:16 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:32:57 | LoadIC role | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:33:16 | LoadIC scope | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:33:48 | LoadIC validationOnly | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:34:49 | LoadIC type | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:25 | LoadIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:39 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:63 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:27 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:47 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:30 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:53 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:38:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:38:36 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:39:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:39:29 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:39:54 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:40:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:40:28 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:40:57 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:43:22 | LoadIC keys | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:44:35 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:45:16 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:46:18 | KeyedLoadIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:69:19 | KeyedStoreIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:21:38 | LoadIC fragments | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:21:48 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:22:29 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:23:34 | LoadIC order | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:24:34 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:25:45 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:35:38 | LoadIC nodes | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:35:44 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:36:25 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:37:8 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:37:21 | LoadIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:38:40 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:40:37 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:41:13 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:42:25 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:43:40 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:44:20 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:45:40 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintDeclarations | blueprint/utils/freezeBlueprintValues/utils/freezeBlueprintDeclarations.ts:14:43 | LoadIC length | 2 / poly | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| freezeBlueprintDeclarations | blueprint/utils/freezeBlueprintValues/utils/freezeBlueprintDeclarations.ts:15:24 | KeyedLoadIC <dynamic> | 2 / poly | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| freezeBlueprintDeclarations | blueprint/utils/freezeBlueprintValues/utils/freezeBlueprintDeclarations.ts:16:30 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintDeclarations | blueprint/utils/freezeBlueprintValues/utils/freezeBlueprintDeclarations.ts:17:36 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:20:43 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:21:27 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:21:20 | KeyedLoadIC <dynamic> | ≥2 / mega | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:25:27 | LoadIC allOf | 2 / poly | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:26:8 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:18:24 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:20:4 | KeyedLoadIC <dynamic> | ≥2 / mega | HOLEY_ELEMENTS |
### flat-500 / uniform-arrays

| 함수 | file:line:column (src/core/ 생략) | 접근 | map 수 / state | 요소 종류 |
| --- | --- | --- | --- | --- |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:24 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:82:6 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:28 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:84:6 | StoreIC kind | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:85:6 | StoreIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:86:6 | StoreIC nullable | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:87:16 | StoreIC strategy | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:88:20 | StoreIC declarations | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:34 | StoreIC isAtomic | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:98:33 | StoreIC collect | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:117:36 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:122:10 | LoadIC constructing | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:122:23 | LoadIC delete | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:36:37 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:37:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:37:32 | LoadIC gates | 53 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:39:36 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:40:14 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:42:24 | LoadIC stringify | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:42:35 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:12 | LoadIC templates | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:22 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:60 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:45:27 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:49:51 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:40 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:69 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:74 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:54:37 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:55:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:58:36 | LoadIC allowed | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:58:44 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:59:28 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:61:19 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:64:14 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:64:38 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:65:36 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:72:36 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:72:49 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:73:32 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:74:32 | LoadIC scope | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:77:24 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:78:16 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:78:56 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:18 | LoadIC nodes | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:24 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:28 | LoadIC schemaPath | 53 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:91:18 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:26 | LoadIC options | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:34 | LoadIC isAtomic | 70 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:98:33 | LoadIC collect | 70 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:26 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:42 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:63 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:69 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:91 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:103:22 | LoadIC isAtomic | 70 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:103:64 | LoadIC collect | 70 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:104:26 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:105:33 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:106:22 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:107:20 | LoadIC role | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:107:58 | LoadIC scope | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:108:21 | LoadIC validationOnly | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:109:17 | LoadIC nullable | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:109:50 | LoadIC pattern | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:110:26 | LoadIC type | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:111:26 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:113:10 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:115:20 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:116:23 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:118:17 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:119:13 | LoadIC strategy | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:62:27 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:63:25 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:64:29 | StoreIC inherited | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:21 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:66:24 | StoreIC fragment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:77:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:62 | StoreIC schemaPath | 49 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:79:43 | StoreIC order | 49 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:14 | StoreIC gates | 52 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:74:48 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:74:48 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:74:50 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:74:50 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:74:56 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:37 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:62 | LoadIC escapeSegment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:79:33 | LoadIC order | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:79:33 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:79:33 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:82:11 | LoadIC filter | 1 / mono | HOLEY_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:85:10 | LoadIC map | 1 / mono | HOLEY_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:32 | LoadIC gates | 52 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:32 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:42 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:42 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:42 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:88:36 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:90:24 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:90:35 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:91:47 | LoadIC findIndex | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:167:10 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:168:10 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:169:25 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:173:28 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:174:17 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:183:10 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:184:16 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:185:25 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:186:10 | StoreIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:169:25 | LoadIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:171:24 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:171:45 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:172:16 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:172:26 | LoadIC schemaPath | 52 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:174:50 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:174:56 | LoadIC map | 1 / mono | PACKED_FROZEN_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:26 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:26 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:26 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:26 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:14 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:14 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:20 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:25 | LoadIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:33 | LoadIC escapeSegment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:24 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:24 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:15 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:15 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:164:33 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:164:46 | LoadIC map | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:181:14 | LoadIC push | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:191:17 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:193:13 | LoadIC size | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:201:11 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:32 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:45 | LoadIC flatMap | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:52:33 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:52:33 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:52:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:52:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:53:48 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:55:13 | LoadIC type | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:56:7 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:62:27 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:63:25 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:64:29 | LoadIC inherited | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:66:24 | LoadIC fragments | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:66:46 | LoadIC fragmentId | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:66:24 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:71:13 | LoadIC properties | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:74:13 | LoadIC entries | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:74:38 | LoadIC forEach | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:23 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:31 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:31 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:33:28 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:33:34 | LoadIC controls | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:33:62 | LoadIC map | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:63:26 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:64:14 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:65:22 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:66:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:67:19 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:68:11 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:69:11 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:16 | StoreIC declarationId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:16 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:79:15 | LoadIC slice | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:79:26 | LoadIC lastIndexOf | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:79:15 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:80:4 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:81:22 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:82:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:83:25 | StoreIC fragmentId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:84:16 | StoreIC role | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:85:17 | StoreIC scope | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:87:19 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:88:20 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:89:20 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:90:21 | StoreIC inherited | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:91:20 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:62 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:35:15 | LoadIC includes | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:35:30 | LoadIC schemaPath | 53 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:36:40 | LoadIC schema | 53 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:41:10 | LoadIC isFragment | 53 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:43:59 | LoadIC options | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:45:12 | LoadIC gates | 53 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:45:18 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:45:34 | LoadIC context | 53 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:49:11 | LoadIC controls | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:63:16 | LoadIC fragments | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:63:26 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:68:42 | LoadIC order | 53 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:20 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:76:8 | LoadIC fragment | 53 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:76:8 | LoadIC children | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:76:18 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:76:41 | LoadIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:8 | LoadIC declarationId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:84:16 | LoadIC role | 53 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:88:20 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:89:20 | LoadIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:90:21 | LoadIC inherited | 53 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:91:20 | LoadIC hostPath | 53 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:93:10 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:93:23 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:94:2 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:94:67 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:95:16 | LoadIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:98:18 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:100:15 | LoadIC capabilities | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:100:28 | LoadIC branchless | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:112:20 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:112:36 | StoreInArrayLiteralIC <dynamic> | 미제공 / poly |  |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:113:20 | LoadIC $ref | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:133:28 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:133:28 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:133:28 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:133:11 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:133:11 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:133:20 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:139:10 | KeyedLoadIC <dynamic> | ≥2 / mega | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:140:9 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:134:61 | LoadIC if | 2 / poly | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:6 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:38 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:59 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:89:18 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:89:40 | LoadIC emit | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:90:21 | LoadIC extras | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:96:42 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:96:48 | LoadIC propertyKeys | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:21 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:21 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:27 | LoadIC blueprintNode | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:110:23 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:111:20 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:111:45 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:112:12 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:113:12 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:114:11 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:21 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:21 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:16 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:28 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:51 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:72 | StoreIC extras | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:149:4 | StoreIC names | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:150:18 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:150:36 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:19:24 | LoadIC local | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:20:31 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:22 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:22 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:18:30 | StoreIC previous | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:18:41 | StoreIC current | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:20:27 | StoreIC type | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:21:89 | StoreIC payload | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:22:60 | StoreIC source | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:22:60 | StoreIC options | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:20:7 | StoreIC pendingDelivery | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:23:7 | StoreIC deliveryInitialized | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:24:7 | StoreIC revisionLedger | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:25:7 | StoreIC pendingRevision | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:16:23 | LoadIC behavior | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:16:32 | LoadIC strategy | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:50 | LoadIC local | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:24:58 | LoadIC revisionLedger | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:18 | StoreIC local | 2 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:36 | LoadIC emit | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:36 | StoreIC emit | 2 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:50:29 | StoreIC deliveries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:51:40 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:51:53 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:39 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:56 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:83 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:60:12 | StoreIC entered | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:61:12 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:74:12 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:76:13 | StoreIC structure | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:77:30 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:77:13 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:86:15 | StoreIC raw | 미제공 / other |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:87:15 | StoreIC extras | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:89:16 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:16 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:101:40 | StoreIC index | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:12 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:25 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:32 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:56 | StoreIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:43 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:60 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:87 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:71:14 | StoreIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:92:18 | StoreIC raw | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:56:15 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:57:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:58:23 | LoadIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:59:15 | LoadIC entered | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:62:17 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:63:26 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:63:33 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:65:35 | LoadIC hasOwnProperty | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:65:82 | LoadIC default | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:66:24 | LoadIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:68:15 | LoadIC behavior | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:68:24 | LoadIC type | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:69:34 | LoadIC blueprintNode | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:34 | LoadIC interpret | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:67 | LoadIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:84 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:75:24 | LoadIC strategy | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:93:25 | LoadIC interactionState | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:14 | LoadIC index | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:28 | LoadIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:36 | LoadIC length | 2 / poly | PACKED_FROZEN_ELEMENTS, HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:113:38 | LoadIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:116:10 | LoadIC pop | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:101:26 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:11 | LoadIC structure | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:28 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:32 | KeyedStoreIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:104:12 | LoadIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:104:22 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:29 | LoadIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:38 | LoadIC includes | 1 / mono | PACKED_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:12 | LoadIC push | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:118:10 | StoreIC commitNumber | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:45:23 | LoadIC runtime | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:46:26 | LoadIC commitNumber | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:47:43 | LoadIC DisableAutomaticWrites | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:48:42 | LoadIC EnableAutomaticWrites | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:49:49 | LoadIC disableAutomaticWrites | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:50:21 | LoadIC deliveries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:83 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:76:32 | LoadIC create | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:78:26 | LoadIC type | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:27 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:35 | LoadIC required | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:22 | LoadIC role | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:61 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:67 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:21:9 | LoadIC strategy | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:36:11 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:36:24 | LoadIC some | 2 / mono | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:41:31 | LoadIC node | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:42:9 | LoadIC delete | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:43:11 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:22:9 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:23:13 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:26:13 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:33:9 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:15 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:15 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:15:52 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:15:58 | LoadIC controls | 2 / poly | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC nodes | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:15:7 | LoadIC stringify | 1 / mono | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:16:11 | LoadIC map | 1 / mono | PACKED_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:17:44 | LoadIC schema | 53 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:19:22 | LoadIC $ref | 2 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:21:18 | LoadIC schemaPath | 53 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:22:26 | LoadIC gates | 53 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:22:32 | LoadIC map | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:32:8 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:33:14 | LoadIC context | 53 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:34:14 | LoadIC filter | 2 / poly | PACKED_SMI_ELEMENTS, HOLEY_SMI_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:71:9 | StoreIC type | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:72:19 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:25:14 | LoadIC mode | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:25:43 | LoadIC isAtomic | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:26:12 | LoadIC collect | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:26:42 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:26:59 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:27:9 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:27:22 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:27:51 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:29:22 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:30:29 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:31:27 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:31:58 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:31:64 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:32:16 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:32:57 | LoadIC role | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:33:16 | LoadIC scope | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:33:48 | LoadIC validationOnly | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:34:49 | LoadIC type | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:25 | LoadIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:39 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:63 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:27 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:47 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:30 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:53 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:38:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:38:36 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:39:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:39:29 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:39:54 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:40:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:40:28 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:40:57 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:43:22 | LoadIC keys | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:44:35 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:45:16 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:46:18 | KeyedLoadIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:69:19 | KeyedStoreIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:21:38 | LoadIC fragments | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:21:48 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:22:29 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:23:34 | LoadIC order | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:24:34 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:25:45 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:27:34 | LoadIC declares | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:28:34 | LoadIC overlays | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:29:34 | LoadIC inheritedOverlays | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:30:34 | LoadIC children | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:33:38 | LoadIC nodes | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:33:44 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:34:25 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:35:8 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:35:21 | LoadIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:36:40 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:38:37 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:39:13 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:40:25 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:41:40 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:42:20 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:43:40 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:46:13 | LoadIC fields | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:47:13 | LoadIC prefixItems | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:52:32 | LoadIC expressions | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:52:44 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:57:19 | LoadIC values | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:57:33 | LoadIC dependencies | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintValues | blueprint/utils/freezeBlueprintValues/freezeBlueprintValues.ts:58:28 | LoadIC length | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintDeclarations | blueprint/utils/freezeBlueprintValues/utils/freezeBlueprintDeclarations.ts:14:43 | LoadIC length | 2 / poly | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| freezeBlueprintDeclarations | blueprint/utils/freezeBlueprintValues/utils/freezeBlueprintDeclarations.ts:15:24 | KeyedLoadIC <dynamic> | 2 / poly | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| freezeBlueprintDeclarations | blueprint/utils/freezeBlueprintValues/utils/freezeBlueprintDeclarations.ts:16:30 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| freezeBlueprintDeclarations | blueprint/utils/freezeBlueprintValues/utils/freezeBlueprintDeclarations.ts:17:36 | LoadIC length | 1 / mono | PACKED_FROZEN_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:20:43 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:21:27 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:21:20 | KeyedLoadIC <dynamic> | ≥2 / mega | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:25:27 | LoadIC allOf | 2 / poly | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:26:8 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:18:24 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:20:4 | KeyedLoadIC <dynamic> | ≥2 / mega | HOLEY_ELEMENTS |
### flat-500 / owned-inline

| 함수 | file:line:column (src/core/ 생략) | 접근 | map 수 / state | 요소 종류 |
| --- | --- | --- | --- | --- |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:24 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:82:6 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:28 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:84:6 | StoreIC kind | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:85:6 | StoreIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:86:6 | StoreIC nullable | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:87:16 | StoreIC strategy | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:88:20 | StoreIC declarations | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:34 | StoreIC isAtomic | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:98:33 | StoreIC collect | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:117:36 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:122:10 | LoadIC constructing | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:122:23 | LoadIC delete | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:36:37 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:37:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:37:32 | LoadIC gates | 68 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:39:36 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:40:14 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:42:24 | LoadIC stringify | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:42:35 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:12 | LoadIC templates | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:22 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:44:60 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:45:27 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:49:51 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:40 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:69 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:50:74 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:54:37 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:55:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:58:36 | LoadIC allowed | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:58:44 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:59:28 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:61:19 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:64:14 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:64:53 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:65:36 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:72:36 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:72:49 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:73:32 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:74:32 | LoadIC scope | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:77:24 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:78:16 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:78:56 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:18 | LoadIC nodes | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:81:24 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:83:28 | LoadIC schemaPath | 68 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:91:18 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:26 | LoadIC options | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:97:34 | LoadIC isAtomic | 102 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:98:33 | LoadIC collect | 102 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:26 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:42 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:63 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:69 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:102:91 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:103:22 | LoadIC isAtomic | 102 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:103:64 | LoadIC collect | 102 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:104:26 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:105:33 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:106:22 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:107:20 | LoadIC role | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:107:58 | LoadIC scope | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:108:21 | LoadIC validationOnly | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:109:17 | LoadIC nullable | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:109:50 | LoadIC pattern | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:110:26 | LoadIC type | 2 / poly | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:111:26 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:113:10 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:115:20 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:116:23 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:118:17 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| buildNodes | blueprint/utils/analyze/buildNodes.ts:119:13 | LoadIC strategy | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:61:27 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:62:25 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:63:29 | StoreIC inherited | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:64:21 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:24 | StoreIC fragment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:76:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:77:62 | StoreIC schemaPath | 64 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:43 | StoreIC order | 64 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:14 | StoreIC gates | 67 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:48 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:48 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:50 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:50 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:56 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:77:37 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:77:62 | LoadIC escapeSegment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:33 | LoadIC order | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:33 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:78:33 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:81:11 | LoadIC filter | 1 / mono | HOLEY_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:84:10 | LoadIC map | 1 / mono | HOLEY_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:32 | LoadIC gates | 67 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:32 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:42 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:42 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:86:42 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:87:36 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:89:24 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:89:35 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:90:47 | LoadIC findIndex | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:166:33 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:167:10 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:168:10 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:169:25 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:173:28 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:174:35 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:183:10 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:184:16 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:185:25 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:186:10 | StoreIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:166:33 | LoadIC order | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:169:25 | LoadIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:171:24 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:171:45 | LoadIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:172:16 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:172:26 | LoadIC schemaPath | 67 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:174:29 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:174:35 | LoadIC map | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:26 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:14 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:14 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:20 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:25 | LoadIC path | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:161:33 | LoadIC escapeSegment | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:24 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:24 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:15 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:162:15 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:33 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:163:46 | LoadIC map | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:181:14 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:191:17 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:193:13 | LoadIC size | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:201:11 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:31:32 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:31:45 | LoadIC flatMap | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:33 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:33 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:51:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:52:48 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:54:13 | LoadIC type | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:55:7 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:61:27 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:62:25 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:63:29 | LoadIC inherited | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:24 | LoadIC fragments | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:46 | LoadIC fragmentId | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:65:24 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:70:13 | LoadIC properties | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:13 | LoadIC entries | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:73:38 | LoadIC forEach | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:159:23 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:31 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:160:31 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:28 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:34 | LoadIC controls | 1 / mono | HOLEY_ELEMENTS |
| populateNodeChildren | blueprint/utils/analyze/populateNodeChildren.ts:32:62 | LoadIC map | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:62:26 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:63:14 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:64:22 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:65:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:66:19 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:67:21 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:68:4 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:77:16 | StoreIC declarationId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:77:16 | StoreIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:15 | LoadIC slice | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:26 | LoadIC lastIndexOf | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:78:15 | StoreIC name | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:79:4 | StoreIC path | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:80:22 | StoreIC schemaPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:81:18 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:82:25 | StoreIC fragmentId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:83:16 | StoreIC role | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:84:17 | StoreIC scope | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:86:19 | StoreIC context | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:87:24 | StoreIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:88:24 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:89:21 | StoreIC inherited | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:90:20 | StoreIC hostPath | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:131:62 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:34:15 | LoadIC includes | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:34:30 | LoadIC schemaPath | 68 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:35:40 | LoadIC schema | 68 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:40:10 | LoadIC isFragment | 68 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:42:59 | LoadIC options | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:44:12 | LoadIC gates | 68 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:44:18 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:44:34 | LoadIC context | 68 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:48:11 | LoadIC controls | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:62:16 | LoadIC fragments | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:62:26 | LoadIC length | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:67:21 | LoadIC order | 68 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:74:20 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:8 | LoadIC fragment | 68 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:8 | LoadIC children | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:18 | LoadIC push | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:75:41 | LoadIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:77:8 | LoadIC declarationId | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:83:16 | LoadIC role | 68 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:87:24 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:88:24 | LoadIC order | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:89:21 | LoadIC inherited | 68 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:90:20 | LoadIC hostPath | 68 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:92:10 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:92:23 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:93:2 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:93:67 | LoadIC push | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:94:16 | LoadIC id | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:97:18 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:99:15 | LoadIC capabilities | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:99:28 | LoadIC branchless | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:111:20 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:111:36 | StoreInArrayLiteralIC <dynamic> | 미제공 / poly |  |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:112:20 | LoadIC $ref | 2 / poly | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:28 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:28 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:28 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:11 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:11 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:132:20 | LoadIC return | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:138:10 | KeyedLoadIC <dynamic> | ≥2 / mega | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:139:9 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| collectDeclarations | blueprint/utils/analyze/collectDeclarations.ts:133:61 | LoadIC if | 2 / poly | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:6 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:38 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:88:59 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:89:18 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:89:40 | LoadIC emit | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:90:21 | LoadIC extras | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:96:42 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:96:48 | LoadIC propertyKeys | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:21 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_FROZEN_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:21 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:98:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:27 | LoadIC blueprintNode | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:41 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:109:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:110:23 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:111:20 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:111:45 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:112:12 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:113:12 | LoadIC push | 2 / mono | PACKED_SMI_ELEMENTS, PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:114:11 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:21 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:21 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:144:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:16 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:28 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:51 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:148:72 | StoreIC extras | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:149:4 | StoreIC names | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:150:18 | LoadIC set | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:150:36 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:19:24 | LoadIC local | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:20:31 | LoadIC get | 1 / mono | HOLEY_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:22 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| assembleObject | behaviors/objectBehavior/branch/utils/assembleObject.ts:86:22 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:18:30 | StoreIC previous | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:18:41 | StoreIC current | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:20:27 | StoreIC type | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:21:89 | StoreIC payload | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:22:60 | StoreIC source | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:22:60 | StoreIC options | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:20:7 | StoreIC pendingDelivery | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:23:7 | StoreIC deliveryInitialized | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:24:7 | StoreIC revisionLedger | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:25:7 | StoreIC pendingRevision | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:16:23 | LoadIC behavior | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:16:32 | LoadIC strategy | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:50 | LoadIC local | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:24:58 | LoadIC revisionLedger | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:18 | StoreIC local | 2 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:36 | LoadIC emit | 1 / mono | HOLEY_ELEMENTS |
| commitStaticFirstNode | settle/utils/load/commitStaticFirstNode.ts:17:36 | StoreIC emit | 2 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:50:29 | StoreIC deliveries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:51:40 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:51:53 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:39 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:56 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:83 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:60:12 | StoreIC entered | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:61:12 | StoreIC order | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:74:12 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:76:13 | StoreIC structure | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:77:30 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:77:13 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:86:15 | StoreIC raw | 미제공 / other |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:87:15 | StoreIC extras | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:89:16 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:16 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:101:40 | StoreIC index | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:12 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:25 | StoreIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:32 | StoreIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:56 | StoreIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:43 | StoreIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:60 | StoreIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:109:87 | StoreIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:71:14 | StoreIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:92:18 | StoreIC raw | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:56:15 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:57:18 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:58:23 | LoadIC node | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:59:15 | LoadIC entered | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:62:17 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:63:26 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:63:33 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:65:35 | LoadIC hasOwnProperty | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:65:82 | LoadIC default | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:66:24 | LoadIC input | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:68:15 | LoadIC behavior | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:68:24 | LoadIC type | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:69:34 | LoadIC blueprintNode | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:34 | LoadIC interpret | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:67 | LoadIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:73:84 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:75:24 | LoadIC strategy | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:93:25 | LoadIC interactionState | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:14 | LoadIC index | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:28 | LoadIC entries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:100:36 | LoadIC length | 2 / poly | PACKED_FROZEN_ELEMENTS, HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:113:38 | LoadIC automatic | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:116:10 | LoadIC pop | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:101:26 | KeyedLoadIC <dynamic> | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:11 | LoadIC structure | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:28 | LoadIC name | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:103:32 | KeyedStoreIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:104:12 | LoadIC children | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:104:22 | LoadIC push | 2 / poly | PACKED_ELEMENTS, PACKED_SMI_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:29 | LoadIC required | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:105:38 | LoadIC includes | 1 / mono | PACKED_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:108:12 | LoadIC push | 1 / mono | PACKED_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:118:10 | StoreIC commitNumber | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:45:23 | LoadIC runtime | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:46:26 | LoadIC commitNumber | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:47:43 | LoadIC DisableAutomaticWrites | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:48:42 | LoadIC EnableAutomaticWrites | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:49:49 | LoadIC disableAutomaticWrites | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:50:21 | LoadIC deliveries | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:52:83 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:76:32 | LoadIC create | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:78:26 | LoadIC type | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:27 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| loadStaticFirstTree | settle/utils/load/loadStaticFirstTree.ts:90:35 | LoadIC required | 1 / mono | HOLEY_FROZEN_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:22 | LoadIC role | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:61 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:38:67 | LoadIC length | 2 / mono | PACKED_SMI_ELEMENTS, HOLEY_SMI_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:21:9 | LoadIC strategy | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:36:11 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:36:24 | LoadIC some | 2 / mono | PACKED_ELEMENTS, HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:41:31 | LoadIC node | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:42:9 | LoadIC delete | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:43:11 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:22:9 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:23:13 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:26:13 | LoadIC has | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:33:9 | LoadIC add | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC childEntries | 1 / mono | HOLEY_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| visitShape | blueprint/utils/analyze/validateShape/utils/visitShape.ts:34:26 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:15 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:13 | LoadIC done | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:13 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:35 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:14:15 | LoadIC value | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:15:52 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:15:58 | LoadIC controls | 2 / poly | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC nodes | 1 / mono | HOLEY_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC symbol("Symbol.iterator" hash 19d909b0) | 1 / mono | PACKED_ELEMENTS |
| validateChildTargets | blueprint/utils/diagnostics/validateChildTargets.ts:12:29 | LoadIC next | 1 / mono | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:15:7 | LoadIC stringify | 1 / mono | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:16:11 | LoadIC map | 1 / mono | PACKED_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:17:44 | LoadIC schema | 68 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:19:22 | LoadIC $ref | 2 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:21:18 | LoadIC schemaPath | 68 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:22:26 | LoadIC gates | 68 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:22:32 | LoadIC map | 1 / mono | PACKED_SMI_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:32:8 | StoreInArrayLiteralIC <dynamic> | 미제공 / mono |  |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:33:14 | LoadIC context | 68 / poly | HOLEY_ELEMENTS |
| getTemplateKey | blueprint/utils/analyze/getTemplateKey.ts:34:14 | LoadIC filter | 2 / poly | PACKED_SMI_ELEMENTS, HOLEY_SMI_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:71:9 | StoreIC type | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:72:19 | StoreIC schema | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:25:14 | LoadIC mode | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:25:43 | LoadIC isAtomic | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:26:12 | LoadIC collect | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:26:42 | LoadIC nullable | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:26:59 | LoadIC kind | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:27:9 | LoadIC declarations | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:27:22 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:27:51 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:29:22 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:30:29 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:31:27 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:31:58 | LoadIC gates | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:31:64 | LoadIC length | 1 / mono | PACKED_SMI_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:32:16 | LoadIC context | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:32:57 | LoadIC role | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:33:16 | LoadIC scope | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:33:48 | LoadIC validationOnly | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:34:49 | LoadIC type | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:25 | LoadIC schemaType | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:39 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:35:63 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:27 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:36:47 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:30 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:37:53 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:38:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:38:36 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:39:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:39:29 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:39:54 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:40:4 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:40:28 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:40:57 | KeyedLoadIC <dynamic> | 2 / poly | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:43:22 | LoadIC keys | 1 / mono | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:44:35 | LoadIC length | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:45:16 | KeyedLoadIC <dynamic> | 1 / mono | PACKED_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:46:18 | KeyedLoadIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| mergeSingleStaticContribution | blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:69:19 | KeyedStoreIC <dynamic> | ≥1 / mega | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:5:22 | LoadIC schema | 1 / mono | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:7:26 | LoadIC required | 2 / poly | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:7:49 | LoadIC allOf | 2 / poly | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:7:75 | LoadIC enum | 2 / poly | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:7:97 | LoadIC controls | 2 / poly | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:8:25 | LoadIC options | 2 / poly | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:8:53 | LoadIC presentation | 2 / poly | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:8:78 | LoadIC type | 2 / poly | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:16:13 | LoadIC isArray | 1 / mono | HOLEY_ELEMENTS |
| freezeEffectiveSchema | blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:20:11 | LoadIC freeze | 1 / mono | HOLEY_ELEMENTS |
