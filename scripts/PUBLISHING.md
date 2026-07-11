# 배포 런북 (Publishing Runbook)

Albatrion 모노레포의 npm 배포 절차입니다. npm의 **2FA-bypass 토큰 폐지**(2027년 1월경)에
대응해, 배포를 **하이브리드 모델**로 운영합니다.

## 배포 모델

|                 | 기본: CI + OIDC                       | 폴백: 로컬 대화형 2FA         |
| --------------- | ------------------------------------- | ----------------------------- |
| 실행 위치       | GitHub Actions 러너                   | 내 로컬 머신                  |
| 트리거          | Actions 탭 "Run workflow" (내가 누름) | 터미널에서 직접               |
| 저장 토큰       | **없음** (OIDC 토큰리스)              | 없음 (`npm login` 세션)       |
| 매 배포 인증    | 자동                                  | 2FA OTP 입력                  |
| provenance 서명 | ✅ 자동                               | ❌                            |
| 진입점          | `.github/workflows/release.yml`       | `scripts/publish-packages.sh` |

두 경로 모두 동일한 **버전 차이 가드**를 씁니다 → 버전이 올라간 패키지만 배포되고,
이미 배포된 버전은 건너뜁니다(충돌 403 없음).

---

## 1회 설정 — npmjs Trusted Publisher 등록 (필수, 최초 1회)

CI 배포가 동작하려면 각 public 패키지(16개)에 "이 저장소의 `release.yml`을 신뢰"를
등록해야 합니다. `scripts/setup-trusted-publishers.sh`가 `npm trust`로 일괄 등록합니다.

```bash
npm login                          # 2FA 로그인 (bypass NPM_TOKEN은 npm trust에서 불가)
DRY_RUN=true yarn npm:setup-trust  # 계획 미리보기 (등록 없음)
yarn npm:setup-trust               # 16개 패키지 일괄 등록
```

- 첫 호출에서 2FA를 한 번 물어보고 "5분간 건너뛰기"를 고르면 나머지가 이어서 처리됩니다.
- staged 옵션까지 열려면: `ALLOW_STAGE=true yarn npm:setup-trust`
- 요구사항: npm ≥ 11.15.0, 계정 2FA 활성, 각 패키지 write 권한.
- 확인: `npm trust list <패키지명>`
- 패키지 목록은 `yarn workspaces list --no-private`로 자동 열거하므로, 신규 패키지가
  생겨도 스크립트를 다시 돌리면 그대로 포함됩니다.

**수동(웹 UI) 대안** — 패키지마다 반복이 필요:

1. `https://www.npmjs.com/package/<패키지명>/access` 접속
2. **Trusted Publisher** → **GitHub Actions** 선택
3. Organization/user `vincent-kk`, Repository `albatrion`, Workflow `release.yml`, Environment 비움 → 저장

> **신규 패키지의 최초 배포 주의:** Trusted Publisher는 npm에 이미 존재하는 패키지에만
> 설정할 수 있습니다. 완전히 새 패키지 이름을 처음 올릴 때는 (a) 로컬 대화형 2FA로 첫
> 버전을 한 번 배포한 뒤 등록하거나, (b) npm의 org 레벨 TP 정책을 사용합니다.
> 위 16개는 이미 배포 이력이 있으므로 지금 바로 등록 가능합니다.

---

## 평상시 릴리스 절차 (기본 경로)

1. 로컬에서 배포할 패키지의 버전을 올리고 커밋·푸시합니다.
   (예: `yarn workspace @winglet/json version:patch`, 또는 `yarn patch:all`)
2. GitHub → **Actions** 탭 → **release** 워크플로 → **Run workflow**.
   - 먼저 확인만 하려면 `dry_run: true`로 한 번 돌립니다 (팩+레지스트리 대조만, 실제 배포 없음).
3. 로그의 `=== summary ===`에서 `published` / `skipped`를 확인합니다.

버전을 올리지 않은 패키지는 자동으로 `skipped` 처리되므로, 일부만 버전업해도 안전합니다.

---

## 로컬 폴백 (대화형 2FA)

CI를 쓸 수 없거나 급히 로컬에서 배포해야 할 때:

```bash
# 최초 1회: npm 로그인 (2FA 활성 계정 → 세션 생성)
npm login

# 빌드 후 배포 (버전 올라간 것만, OTP는 npm이 물어봄)
yarn build:all
yarn publish:changed

# OTP를 비대화형으로 넘기려면:
NPM_OTP=123456 yarn publish:changed

# 실제 배포 없이 확인만:
DRY_RUN=true yarn publish:changed
```

로컬 실행 시에는 provenance 서명이 없고, 2FA OTP를 직접 입력해야 합니다.

---

## 버전 차이 가드 동작 방식

`scripts/publish-packages.sh`는 각 패키지에 대해:

1. `package.json`의 `version`을 읽고
2. `npm view <name>@<version> version`으로 레지스트리를 조회해
3. 그 버전이 **이미 있으면 skip**, 없으면 **팩 후 배포**합니다.

`yarn pack`이 `workspace:^` 내부 의존성을 실제 버전(`^0.13.0`)으로 치환하므로,
`npm publish`로 올려도 의존성 범위가 깨지지 않습니다.

---

## 폐지 일정 (npm 공지, 2026-07-08)

| 시점          | 변경                                                                  |
| ------------- | --------------------------------------------------------------------- |
| 2026년 8월 초 | 2FA-bypass 토큰: 계정/패키지 관리(토큰·2FA·access·org) 불가           |
| 2027년 1월경  | 2FA-bypass 토큰: **게시 능력 제거** → 기존 `NPM_TOKEN` 로컬 배포 중단 |

출처: <https://github.blog/changelog/2026-07-08-npm-install-time-security-and-gat-bypass2fa-deprecation/>

---

## 마이그레이션 체크리스트

- [x] `scripts/publish-packages.sh` — 버전 가드 + OIDC/2FA 배포 스크립트
- [x] `.github/workflows/release.yml` — CI OIDC 릴리스 워크플로
- [x] `scripts/setup-npm-token.sh` — 폐지 예정 배너 추가
- [x] `scripts/setup-trusted-publishers.sh` — TP 일괄 등록 스크립트
- [ ] **`npm login` 후 `./scripts/setup-trusted-publishers.sh` 실행** (16개 TP 등록)
- [ ] `release.yml` `dry_run: true`로 첫 실행 검증
- [ ] 실배포 1회로 CI 경로 확정
- [ ] 확정 후 `~/.zshrc`의 `NPM_TOKEN` 제거, `setup-npm-token.sh` 사용 중단
