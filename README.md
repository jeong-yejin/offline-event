# event-perpdex

ReboundX 행사 3개의 랜딩 페이지와 예측마켓 프론트엔드. React 18 + TypeScript + Vite.

**서버가 없다.** 이 저장소에는 API도, DB도, 세션도 없다. 화면에 보이는 모든 숫자는 브라우저가 만든다. 로그인, 팀 초대 코드, 주문 체결, 리더보드, 정산이 전부 프론트엔드 시뮬레이션이다. 풀스택 개발자가 붙을 지점은 [해야 할 작업](#해야-할-작업)에 정리했다.

---

## 빠른 시작

```bash
npm install
npm run dev        # vite dev server
npm run build      # vite build
npm run typecheck  # tsc --noEmit
npm test           # vitest run
```

`.env`는 선택이다. 없어도 전체 화면이 동작한다. `.env.example`을 복사해서 쓴다.

```
VITE_GOOGLE_CLIENT_ID=          # 비우면 로그인 모달이 껍데기 버튼으로 떨어진다
VITE_GOOGLE_AUTH_ENDPOINT=      # 비우면 구글 로그인은 되지만 검증을 건너뛴다
```

`VITE_` 변수는 번들에 그대로 박힌다. client secret을 넣으면 안 된다.

### 현재 테스트 상태

```
Test Files  1 failed | 11 passed (12)
     Tests  6 failed | 116 passed (122)
```

실패 6건은 전부 `src/ui.test.tsx`다. `HubPage`를 회전 쇼케이스로 다시 만들면서 테스트가 따라오지 못했다. 테스트는 여전히 허브에 `<a>` 링크 3개와 `.reboundx-hero`가 있다고 기대하는데, 지금 허브 레일은 `<button aria-pressed>`이고 `/`에는 `.reboundx-hero`가 없다. 제품 버그가 아니다. 테스트를 새 DOM에 맞춰 고쳐야 한다.

---

## 라우트

`src/router/useAppRoute.ts`가 `history.pushState` 기반으로 직접 처리한다. 라우터 라이브러리는 없다.

| 경로 | 화면 | 로그인 필요 | 언어 |
| --- | --- | --- | --- |
| `/` | 허브 (행사 3개 회전 쇼케이스) | 아니오 | ko / en |
| `/perp-dex-day` | PERP-DEX DAY 랜딩 | 아니오 | ko / en |
| `/perp-dex-day/market` | PERP-DEX DAY 예측마켓 | **예** | ko / en |
| `/reboundx-in-wonderland` | WONDERLAND 랜딩 (배포 번들) | 아니오 | ko / en |
| `/reboundx-in-wonderland/leaderboard` | WONDERLAND 실시간 순위 | 아니오 | ko / en |
| `/perps-day` | PERPS DAY 랜딩 | 아니오 | **en 고정** |
| `/perps-day/market` | PERPS DAY 서바이벌 마켓 | **예** | **en 고정** |
| `/perps-day/teams` | 팀 참가 신청 | 아니오 | **en 고정** |
| `/perps-day/kalshi` | Kalshi 주소 등록 | 아니오 | **en 고정** |
| `/token2049-side-event/market` | 레거시. `replaceState`로 `/perps-day/market`으로 다시 쓴다 | 예 | en |

모르는 slug는 허브로 떨어진다. 404 화면이 따로 없다.

### `?preview=` 로 상태 화면 열기

`src/router/preview.ts`가 시계를 되감아서 마켓의 특정 국면을 바로 보여준다. 프리뷰는 저장소에 아무것도 쓰지 않고, 저장된 런도 무시한다. 시드는 `20490911`로 고정이라 같은 케이스는 항상 같은 그림이 나온다.

| 라우트 | 사용 가능한 케이스 |
| --- | --- |
| `/perp-dex-day/market?preview=` | `ready` `live` `settling` `ended` |
| `/perps-day/market?preview=` | `ready` `session-a` `break` `session-c` `settling` `ended` |
| `/?preview=` | `kalshi` `teams` (해당 화면으로 직행) |

모르는 케이스 이름은 `console.warn` 찍고 무시한다. 프리뷰 값은 모듈 로드 시점에 한 번만 읽는다. 값을 바꾸면 새로고침해야 한다.

시계만 되감으면 잔고가 전부 개시가에 멈춰 있다. 그래서 프리뷰는 리듀서를 되감은 초 수만큼 다시 돌린다 (`runForward`). 이 때문에 프리뷰 첫 렌더가 수천 번의 리듀서 호출을 한다. `?preview=ended`는 4220초 분량이다.

---

## 해야 할 작업

풀스택 개발자가 붙어야 하는 지점 7개. 항목마다 **지금 동작 / 없는 것 / 필요한 계약 / 파일 / 검증**으로 정리했다.

### 1. 구글 로그인

**지금 동작.** `src/auth/GoogleLoginModal.tsx`가 설정 수준에 따라 3가지로 갈린다.

| `VITE_GOOGLE_CLIENT_ID` | `VITE_GOOGLE_AUTH_ENDPOINT` | 동작 |
| --- | --- | --- |
| 없음 | 무관 | 껍데기. 버튼 하나가 게이트를 그냥 열어준다. 구글에 접속하지 않는다 |
| 있음 | 없음 | 진짜 구글 로그인. ID 토큰을 받지만 아무도 검증하지 않는다 |
| 있음 | 있음 | 구글 로그인 + 서버 검증 |

**의도된 껍데기다.** 사용자가 요청한 상태다. 버그로 신고하거나 되돌리지 말 것. 문제는 껍데기 버튼 문구가 "Continue with Google"이라서 진짜 로그인처럼 보인다는 점이다.

**없는 것.** 세션이 React state에만 있다. `App.tsx`의 `authenticated` boolean 하나다. 새로고침하면 사라지고 다시 로그인해야 한다. `localStorage`에 아무것도 쓰지 않는다. 서버가 있어도 세션 복구 경로가 없다.

**필요한 계약.**

```
POST <VITE_GOOGLE_AUTH_ENDPOINT>
Content-Type: application/json
credentials: include
{ "credential": "<Google ID token (JWT)>" }

200 { "authenticated": true }
```

서버는 서명, `aud`, `iss`, `exp`를 검증하고 HttpOnly 세션 쿠키를 심어야 한다. 검증에 성공한 뒤에만 `authenticated: true`를 돌려준다. 프론트는 `response.ok && result.authenticated === true`만 확인한다.

**프론트 게이트는 인증이 아니다.** 세 설정 수준 전부 그렇다. 마켓 API를 만들 때 세션을 독립적으로 다시 검증해야 한다. `authenticated`를 `true`로 만드는 건 devtools에서 한 줄이다.

**파일.** `src/auth/GoogleLoginModal.tsx`, `src/App.tsx` (게이트 로직), `GOOGLE_AUTH_SETUP.md` (설정 문서), `.env.example`.

**검증.** `src/auth/GoogleLoginModal.test.tsx`, `src/auth/marketGate.test.tsx`.

### 2. 팀 초대 코드 발급과 검증

**지금 동작.** `/perps-day/teams`에서 코드 형식만 본다.

```ts
const INVITATION_CODE = /^TIER-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
```

입력하는 동안 자동으로 대문자 + 4자리씩 하이픈을 넣는다 (`formatInvitationCode`). 형식이 맞으면 통과. 트레이더 2명 이름이 다 채워졌는지 본다. 그러고 완료 화면을 그린다. **아무 곳에도 보내지 않는다.**

**없는 것.** 발급, 저장, 소진 체크, 중복 신청 차단, 마감일. 진짜 코드는 번들에 없다. 의도적이다. 코드를 번들에 넣으면 페이지를 여는 모든 사람이 팀 슬롯을 얻는다.

실제 운영은 이렇다. 좌석은 행사 전에 티어별로 팔렸다. 페이지에서 신규 신청을 받는 구조가 아니다. 코드는 폼 제출 뒤에 티어 담당자가 따로 확인한다.

**좌석 구조.** 총 8석. 4팀 × 2석. 티어는 `founding`, `founding`, `partner`, `partner`. 팀 상태는 `confirmed`, `tbd`, `tbd`, `open`이라 화면에는 열린 슬롯 1개로 나온다.

**필요한 계약.**

```
POST /api/teams/apply
{ "code": "TIER-XXXX-XXXX", "traders": ["name", "name"] }

200 { "team": "founding-2", "seats": 2, "status": "confirmed" }
409 { "error": "CODE_ALREADY_USED" }
404 { "error": "CODE_NOT_FOUND" }
410 { "error": "DEADLINE_PASSED" }
```

코드는 서버에서만 만든다. 형식 정규식은 오타 걸러내는 용도로 프론트에 남겨두면 된다. 진짜 검증은 서버가 한다.

**파일.** `src/pages/Token2049TeamsPage.tsx` (143줄), `src/data/token2049Content.ts` (`isInvitationCode`, `formatInvitationCode`, `TOKEN2049_TEAMS`, `T2049_TEAM_TIERS`).

**마감일이 하드코딩된 `t.t2049Tba`다.** 정해지면 `src/i18n/strings/token2049.ts`를 고쳐야 한다.

### 3. 예측마켓 주문과 체결

**지금 동작.** 전부 브라우저에서 돈다. 서버 주문서가 없다.

가격은 RFQ 방식이다. 수량을 넣으면 4초 만료의 확정 견적이 나온다 (`QUOTE_TTL_MS = 4000`). 견적마다 `idempotencyKey`가 붙는다. 리듀서가 이미 본 키는 거부한다 (최근 64개 기억). 스프레드는 `RFQ_SPREAD = 1`포인트.

가격 형성은 3가지 항의 합이고 `TOTAL_PRICE = 100`으로 정규화한다. 잔고 드리프트 (`BALANCE_DRIFT = 0.014`), 3분 창 모멘텀 (`MOMENTUM_WEIGHT = 37.5`, 상한 5), 가상 유동성 100 기준 수요 (`DEMAND_WEIGHT = 10`, 상한 10).

리듀서는 `time`과 `seed`를 명시적으로 받는다. `Date.now()`나 `Math.random()`을 안에서 부르지 않는다. 이래서 프리뷰 리플레이와 테스트가 결정적이다.

**없는 것.** 주문 서버, 체결 원장, 다른 사용자와의 상태 공유, 정합성. 상대 참가자 57명은 시드 `19990331`로 만든 합성 데이터다 (`src/market/leaderboard.ts`). 내 옆자리 사람이 같은 화면을 열면 완전히 다른 순위표를 본다.

**저장은 브라우저 하나짜리다.** `localStorage` 키 `perpdex.market.v3`와 `perpdex.t2049.v1`. 다른 기기, 다른 브라우저, 시크릿 창은 전부 별개 런이다.

**필요한 계약.** 서버로 옮길 때 최소 이것들.

```
POST /api/market/quote     { marketId, side, direction, quantity }
                        -> { quoteId, idempotencyKey, unitPrice, totalPrice, expiresAt }
POST /api/market/fill      { quoteId, idempotencyKey }
                        -> { fill } | 409 QUOTE_EXPIRED | 409 DUPLICATE_KEY | 402 INSUFFICIENT_POINT
GET  /api/market/state     -> { point, holdings, prices, phase, updatedAt }
GET  /api/market/leaderboard -> [{ rank, handle, point, ... }]
```

`idempotencyKey`는 이미 프론트가 만들어 보낸다. 서버가 그대로 쓰면 재시도 중복 체결을 막을 수 있다.

**파일.** `src/market/quote.ts`, `src/market/useOrderDesk.ts`, `src/market/engine/` (pricing, rfq, positions, settlement, simulation, random, roster), `src/market/perpdexday/state.ts`, `src/market/token2049/state.ts`, `src/market/leaderboard.ts`.

**검증.** `src/market/perpdexday/market.test.ts`, `src/market/token2049/market.test.ts`, `src/market/leaderboard.test.ts`, `src/market/performance.test.ts`.

### 4. Kalshi 주소 검증

**지금 동작.** `/perps-day/kalshi`에서 이메일 형식만 본다.

```ts
const EMAIL_ADDRESS = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
```

통과하면 완료 화면에 `PENDING` 배지를 띄운다. **하드코딩이다.** 상태 타입에는 4개가 있는데 (`NOT_SUBMITTED` `PENDING` `VERIFIED` `REJECTED`) `PENDING` 말고는 화면에 도달할 방법이 없다. 아무 곳에도 보내지 않는다.

**필요한 계약.**

```
POST /api/kalshi/link      { email }  -> { status: "PENDING" }
GET  /api/kalshi/status              -> { status: "PENDING" | "VERIFIED" | "REJECTED", reason? }
```

`VERIFIED`와 `REJECTED`를 그릴 때 `REJECTED`에 이유 문구가 필요하다. 지금은 카피가 없다.

**파일.** `src/pages/Token2049KalshiPage.tsx` (94줄), `src/data/token2049Content.ts` (`KalshiStatus`, `isEmailAddress`).

### 5. WONDERLAND 실시간 순위 피드

**지금 동작.** 순위표가 시계의 순수 함수다 (`src/market/wonderlandBoard.ts`). 입력은 `Date.now()` 하나. 12석의 `drift`, `tempo`, `report` 상수로 손익을 계산한다.

`HEAT_START = 2026-09-29T19:30:00+09:00` 전에는 같은 30분이 계속 반복 재생된다 (`elapsedAt` 모듈로). 그래서 행사 전에 열어도 순위가 움직인다.

**없는 것.** 거래소 피드, 실제 참가자, 참가 등록. 12석은 상수 배열이다. `JABBERWOCK`은 `tempo: 0, report: 0`이라 영구 미채점으로 남는다. 의도된 상태다.

**필요한 계약.**

```
GET /api/wonderland/board -> { phase, rows: [{ handle, equity, pnl, returnPct, reportedAt }] }
```

점수는 수익 순위 + 수익률 순위의 합이다. 동점은 높은 순위를 공유한다. 미채점 행은 맨 아래로 밀린다. 서버로 옮기더라도 이 규칙은 프론트에 남겨야 화면 설명 (`.wonder-basis`)과 어긋나지 않는다.

**파일.** `src/market/wonderlandBoard.ts`, `src/pages/WonderlandBoardPage.tsx` (137줄).

**검증.** `src/market/wonderlandBoard.test.ts`.

### 6. 상금 지급

**지금 동작.** 정산은 결과만 기록한다. 포인트를 지급하지 않는다.

PERP-DEX DAY: `settle()`이 승자와 payout을 기록하고 `point`는 건드리지 않는다. PERPS DAY의 중간 탈락 (cut)은 예외다. 탈락한 좌석은 즉시 정산돼서 (YES 0, NO 100) `point`에 바로 들어간다.

**의도된 동작이다.** 실제 상금은 대회 종료 며칠 뒤에 운영진이 손으로 지급한다. 화면의 payout 숫자는 안내용이다.

**없는 것.** 지급 기록, 지급 상태, 수령 확인. 리워드 상수는 `REWARD_TOP = 50`, `REWARD_FIRST_USDT = 100`.

**파일.** `src/market/engine/settlement.ts`, `src/components/SettledBanner.tsx`.

### 7. 세션 복구와 다중 기기

**지금 동작.** 로그인은 메모리, 마켓 런은 `localStorage`. 두 개가 서로 모른다. 새로고침하면 로그인은 사라지고 마켓 런은 남는다.

`src/infrastructure/storage.ts`의 읽기와 쓰기가 모두 예외를 삼킨다. 시크릿 창, 저장소 차단, 용량 초과에서 앱이 죽지 않고 그냥 메모리 세션으로 돈다. 조용히 실패한다는 뜻이다. 사용자는 저장이 안 됐다는 사실을 알 수 없다.

**필요한 것.** 서버 세션이 붙으면 `GET /api/session`으로 부팅 시 복구하고, 마켓 상태도 서버에서 읽어야 한다. 그때 `localStorage` 경로는 오프라인 폴백으로만 남긴다.

---

## 행사별 상세

### PERP-DEX DAY

KBW 2026 · 2026-09-28. 언어 ko / en. 트레이더 4명이 실시간으로 경쟁하고, 관객이 승자를 예측한다. 탈락은 없다.

#### 화면

| 경로 | 섹션 구성 |
| --- | --- |
| `/perp-dex-day` | `EventHero` (마켓 진입 CTA 포함) → `.sponsors` (스폰서 워드마크) → `SpeakerSection` → `#agenda` → `.operations` (BlackHoleBG) |
| `/perp-dex-day/market` | `.market-header` (뒤로 + 태그 + 언어) → `.market-feature` (ASCII 히어로) → `.market-content` (제목 + `.market-spec` dl) → `.market-overview` (국면 배지, `.market-bar` 확률, 내 순위, 남은 시간) → (조건부) `SettledBanner` → `.market-layout` (좌 `.market-main`: `TraderTable`, `MarketChart`, `PositionsSection`, `Leaderboard`, `RulesSection` / 우 `.market-side`: `OrderTicket`) → `.market-brand-card` → `.market-footer` |

발표자 사진은 `public/assets/speakers/PerpDexDay/`. 1600×1600 RGB 매트릭스 그린 원본이라 검정 배경에 그대로 올린다. Wonderland 폴더와 섞으면 안 된다.

#### 상태 케이스

숫자는 `src/data/perpDexMarketContent.ts`. 경기 1800초, 정산 20초, 시작 포인트 100, 개시 YES 25 × 4.

| 국면 | 조건 | 화면 | 주문 |
| --- | --- | --- | --- |
| `ready` | `time < startAt` | 국면 배지 + 카운트다운. 개시가 25 고정 | 잠김 |
| `live` | `startAt ≤ time < closeAt` | 1초마다 가격 갱신, 차트 진행, 리더보드 이동 | 열림 |
| `settling` | `closeAt ≤ time`, 정산 없음 | 정산 안내. 가격 멈춤 | 잠김 |
| `ended` | 정산 기록됨 | `SettledBanner` (승자, 분배, 내 payout, 최종 포인트). 리더보드 `final` 모드 | 잠김 |

데이터 상태는 좌석별로 따로 계산한다. 5초 넘으면 `delayed`, 15초 넘으면 `stale`. `live` 국면에서만 판정한다. 다른 국면에서는 전부 `live`로 표시한다. 피드 갱신 확률은 틱당 0.92라서 `delayed`는 흔하고 `stale`은 드물다.

내 포지션 (`PositionsSection`)은 보유가 0이면 아예 렌더하지 않는다.

#### 예외 케이스

| 상황 | 결과 |
| --- | --- |
| 로그인 없이 `/perp-dex-day/market` 직접 접근 | 뒤에 **랜딩 페이지**를 그리고 그 위에 모달. 모달을 닫으면 `/perp-dex-day`로 간다. 마켓 화면이 잠깐 보이지 않는다 |
| 수량에 `0`, `-1`, `0.5`, 문자, 빈 값 | `parseQuantity`가 `null`. `t.errorQuantity`. 견적을 만들지 않는다 |
| 포인트 부족 | `t.errorPoint(보유, 최대수량)`. 최대 가능 수량을 같이 알려준다 |
| 보유 없이 매도 | `t.errorOwned(보유량)` |
| 견적 4초 초과 | 확인 버튼 잠김. 취소 버튼이 `t.requoteCta`로 바뀐다. 다시 견적을 받아야 한다 |
| 같은 `idempotencyKey` 재전송 | 리듀서가 무시. 중복 체결 없음 |
| 좌석 피드 `stale` | 그 좌석 주문만 거부. `t.hintStale(트레이더)` |
| 견적 대기 중 다른 조작 | 모든 컨트롤이 `disabled`. 방향/사이드/좌석을 바꾸면 견적이 즉시 무효화된다 |
| 저장된 런을 다시 열기 | **`ended`로 열린다.** 아래 [알려진 결함](#알려진-결함) 1번 |
| `localStorage` 차단 | 조용히 메모리 런. 새로고침하면 전부 초기화 |

### REBOUNDX IN WONDERLAND

KBW 2026 · 2026-09-29. 언어 ko / en.

#### 배포 번들 경고 (먼저 읽을 것)

`/reboundx-in-wonderland` 랜딩은 **이 저장소의 `src/`가 만들지 않는다.** `public/reboundx/assets/`에 미리 빌드된 번들이 들어있다.

```
public/reboundx/assets/main-DoaZh5TM.js        # 미니파이 단일 라인
public/reboundx/assets/SiteFooter-CZ_doPla.css # 미니파이 단일 라인, 15KB
public/reboundx/assets/SiteFooter-CdLug1aP.js
```

**소스가 번들보다 약 40% 뒤쳐졌다. 리빌드 금지.** 리빌드하면 최근 변경이 전부 사라진다. 수정은 번들 파일 직접 손패치만 한다.

손패치 방법. 유일한 매치를 확인하고 바꾼다.

```python
old = '.card{...}'
assert s.count(old) == 1, (path, s.count(old))
s = s.replace(old, new)
```

CSS를 고쳤으면 중괄호 균형을 세어 확인한다. 현재 `SiteFooter-CZ_doPla.css`는 187쌍이다.

번들 안에서 클래스 modifier는 템플릿 보간으로 만든다 (`card__index card__index--${u}`). 그래서 `grep`으로 `card__index--red`를 찾으면 0건이 나온다. 셀렉터가 죽은 게 아니다.

Wonderland 발표자 사진은 `public/assets/speakers/Wonderland/`. 800×800 RGBA 투명 컷아웃 (Variational-Justin만 1000×944). 크림색 카드에 올린다. 파일명에 공백과 한글이 있어서 (`Base - 권혁재.webp`) 번들 안에서는 퍼센트 인코딩 경로를 써야 한다.

한글 폰트는 Zen Serif다. Wonderland의 한글은 Zen Serif가 정답이고 나머지는 Wanted Sans.

#### 화면

| 경로 | 내용 |
| --- | --- |
| `/reboundx-in-wonderland` | 배포 번들. 히어로, 라인업 덱 (카드 4열), 거래소 섹션, 푸터 |
| `/reboundx-in-wonderland/leaderboard` | `src/pages/WonderlandBoardPage.tsx`. 대시보드 → 헤드 → 채점 기준 → (조건부) 피드 경고 → 순위표 → 각주 |

라인업 덱은 컨테이너 쿼리를 쓴다. `.card-slot`에 `container-type: inline-size`, 카드 안 글자 크기는 `cqw` 단위. 4열 (1200px 초과) → 3열 (1200px 이하) → 2열 (1024px 이하) → 1열 (720px 이하). **이 3개 폭에서 실제 렌더를 육안 확인하지 않았다.**

순위표는 1초 간격 `setInterval`. 12석, 시작 자본 10000, 히트 30분, 정산 120초. 내 핸들은 `KNAVE`.

#### 상태 케이스

| 국면 | 조건 | 화면 |
| --- | --- | --- |
| `ready` | `now < HEAT_START` | 같은 30분이 반복 재생. 순위가 계속 움직인다 |
| `live` | `HEAT_START ≤ now ≤ HEAT_END` | 실제 경과 시간으로 계산. 등락 글리프 ▲▼· 표시 (60초 창) |
| `settling` | `HEAT_END < now ≤ SETTLING_END` | 순위 고정, 정산 안내 |
| `ended` | `SETTLING_END < now` | 최종 순위. 1위에 `QUEEN'S FAVOUR` |

행별 상태. `JABBERWOCK`은 항상 미채점 (`t.wonderlandUnscored`)이고 정렬 맨 아래다. 나머지 11석은 각자 보고 주기가 있어서 (3, 4, 3, 8, 3, 5, 6, 21, 4, 12, 3초) `reportAge`가 다르게 표시된다.

#### 예외 케이스

| 상황 | 결과 |
| --- | --- |
| 행사 전 접속 | 순위가 움직인다. 반복 재생이라는 표시가 화면에 없다 |
| 전체 피드 끊김 | `.wonder-cut` 경고가 나와야 하는데 **실제로는 절대 안 나온다.** [알려진 결함](#알려진-결함) 2번 |
| 발표자 사진 404 | `/assets/wonderland/traders/<handle-kebab>.svg`. 없으면 깨진 이미지. 폴백 없음 |
| 영어 모드 | 한글이 섞여 나오는 문자열이 남아 있을 수 있다. `src/i18n/strings/wonderland.ts` 확인 |
| `prefers-reduced-motion` | 카드 transition 제거. 순위표 1초 갱신은 그대로 |
| 번들 리빌드 | 최근 변경 소실. 하지 말 것 |

### TOKEN2049 SIDE EVENT (PERPS DAY)

TOKEN2049 Singapore · 2026-10-05 00:00 SGT. **영어 전용.** 트레이더 8명 서바이벌. 탈락이 있다.

라벨은 `TOKEN2049 SIDE EVENT`, 제목은 `PERPS DAY`. 라우트는 `perps-day`. 카피는 `src/i18n/strings/token2049.ts` 한 곳에서 관리한다.

#### 화면

| 경로 | 섹션 구성 |
| --- | --- |
| `/perps-day` | `T2049Hero` (`EventCountdown` 포함) → `T2049Nav` → `T2049Format` → `T2049Field` → `T2049Predict` → `T2049Attend` → `T2049Join` |
| `/perps-day/market` | `.market-header` → `.market-content` → `.market-overview` (국면 배지, 확률, 내 순위, `.market-cut-clock`) → 조건부 블록 (`.market-break` 휴식/정산, `.market-cut` 탈락 알림, `SettledBanner`) → `.market-layout` (좌: 좌석 표, 차트, 포지션, 리더보드, `RulesSection` / 우: `OrderTicket` + `.market-history`) → `.market-footer`. ASCII 히어로 (`.market-feature`) 없음 |
| `/perps-day/teams` | 초대 코드 입력 → 트레이더 2명 이름 → 완료 화면 (코드 + 명단 + 뒤로) |
| `/perps-day/kalshi` | 이메일 입력 → 완료 화면 (`PENDING` 배지 + 지급 안내 + 다시 입력) |

#### 상태 케이스

숫자는 `src/data/t2049MarketContent.ts`. 세션 A 1800초, 휴식 600초, 세션 C 1800초, 정산 20초, 총 4220초. 탈락 간격 450초라 7:30 / 15:00 / 22:30 / 30:00에 한 명씩 떨어진다. 결선 4명. 개시 YES 12.5 × 8.

| 세션 | 조건 | 화면 | 주문 |
| --- | --- | --- | --- |
| `ready` | 시작 전 | 카운트다운, 개시가 12.5 | 잠김 |
| `sessionA` | 0 ~ 1800초 | 가격 갱신 + 탈락 진행 | 열림 |
| `break` | 1800 ~ 2400초 | `.market-break` 안내. 가격 멈춤 | 잠김 (`t.hintPaused`) |
| `sessionC` | 2400 ~ 4200초 | 결선 4명만 거래 | 열림 |
| `settling` | 4200 ~ 4220초 | 정산 안내 | 잠김 |
| `ended` | 정산 기록됨 | `SettledBanner` | 잠김 |

좌석별 상태가 세션과 별개로 있다.

| 좌석 상태 | 화면 | 주문 |
| --- | --- | --- |
| 생존 | 정상 | 열림 (거래 세션 + 피드 정상일 때) |
| 탈락 | `.market-cut` 알림 `t.cutTitle(트레이더)`. 즉시 정산 (YES 0, NO 100) 후 `point`에 지급 | 영구 잠김 (`t.hintEliminated`) |
| 피드 `stale` | 힌트 표시 | 그 좌석만 잠김 |

탈락은 세션 상태와 무관하게 밀린 만큼 처리한다. 4번째 탈락이 세션 A 종료 벨에 걸리기 때문에 `break`와 `settling`에서도 탈락 정산이 발생할 수 있다.

`.market-overview`의 `.market-cut-clock`이 다음 탈락까지 남은 시간과 생존 수 (`3/8` 형태)를 같이 보여준다. 60초 이하로 떨어지면 `data-urgent="true"`가 붙는다.

#### 예외 케이스

| 상황 | 결과 |
| --- | --- |
| 초대 코드 형식 오류 | `t.t2049TeamsErrorCode`. `aria-invalid`가 코드 입력에 붙는다 |
| 트레이더 이름 빈칸 | `t.t2049TeamsErrorTrader`. 코드 검사를 먼저 통과해야 이 에러를 본다 |
| 유효한 형식의 가짜 코드 | **통과한다.** 형식만 보기 때문. 서버 검증이 없다 |
| 같은 코드 반복 제출 | 매번 통과. 소진 체크가 없다 |
| Kalshi 이메일 형식 오류 | `t.t2049KalshiErrorEmail` |
| Kalshi 제출 성공 | 항상 `PENDING`. `VERIFIED`와 `REJECTED`는 도달 불가 |
| 탈락 좌석에 주문 | 리듀서가 거부 (`state.eliminated.includes(marketId)`) |
| 휴식 중 주문 | 거부. 티켓에 `t.hintPaused` |
| 저장된 런이 4220초를 넘김 | `isSpent`가 걸려서 새 런으로 다시 시작한다. PERP-DEX DAY와 다른 동작 |
| 언어 토글 | PERPS DAY 라우트에는 없다. 영어 고정 |
| 레거시 URL | `/token2049-side-event/market`이 `replaceState`로 조용히 다시 쓰인다. 뒤로가기 이력에 남지 않는다 |
| 최종 정산된 포지션 | "내 포지션"에 `Settled.` 표시로 남는다. 청산 내역으로 안 넘어간다. [알려진 결함](#알려진-결함) 3번 |
| 청산 내역이 비었을 때 | `.market-history` 섹션을 렌더하지 않는다. `PositionsSection`도 보유 0이면 같다 |

---

## 공통 예외 케이스

| 상황 | 동작 |
| --- | --- |
| `localStorage` 비활성 / 용량 초과 | 읽기와 쓰기가 예외를 삼킨다. 앱은 메모리 세션으로 계속 돈다. 사용자에게 알리지 않는다 |
| 새로고침 | 로그인 소실. 마켓 런은 유지 |
| 모르는 URL | 404 없이 허브로 |
| `?preview=` 잘못된 값 | `console.warn` 후 무시 |
| `prefers-reduced-motion` | 허브 자동 회전 정지, 카드 transition 제거 |
| 탭 백그라운드 | 허브 자동 회전 정지 (`document.hidden`) |
| 허브가 화면 밖 | `IntersectionObserver`로 자동 회전 정지 |
| 브라우저 스크롤 복원 | 마운트 동안 `scrollRestoration = 'manual'` 강제. `popstate`에서 다시 맞춘다 |
| meta/ctrl/shift/가운데 클릭 | SPA 네비게이션을 건너뛰고 브라우저 기본 동작 (새 탭) |
| 구글 GSI 스크립트 로드 실패 | 12초 타임아웃 후 `failed` 상태. 재시도 시 SDK promise를 다시 만든다 |
| 검증 요청 응답 없음 | 15초 후 `AbortController`로 취소, `failed` |

---

## 알려진 결함

수정하지 않고 남겨둔 것들. 사용자에게 이미 알렸다.

1. **PERP-DEX DAY 저장 런이 일회성이다.** `src/market/perpdexday/state.ts`에 `isSpent` 체크가 없다. PERPS DAY에는 있다. 그래서 PERP-DEX DAY는 한 번 경기가 끝난 브라우저로 다시 들어오면 계속 `ended` 화면을 본다. PERPS DAY는 4220초가 지나면 새 런으로 다시 시작한다. 같은 구조에서 동작이 다르다. → 수정하려면 `token2049/state.ts`의 `isSpent` 패턴을 `perpdexday/state.ts`에 옮긴다.

2. **WONDERLAND `feedCut`이 절대 발동하지 않는다.** `src/market/wonderlandBoard.ts`의 `FEED_GAP = 15`인데 12석 중 가장 짧은 보고 주기가 3초다. `reportAgeAt`이 `elapsed % period`라서 그 행의 `reportAge`는 최대 2다. `feedCut`은 모든 행이 15 이상일 때만 참이므로 조건이 성립할 수 없다. `.wonder-cut` 경고 블록은 죽은 코드다. → `FEED_GAP`을 3 미만으로 내리거나, 경고 블록을 지운다.

3. **PERPS DAY 최종 정산이 `closed`에 기록되지 않는다.** `src/market/token2049/state.ts`의 `settle()`이 `closed` 배열을 건드리지 않는다. 중간 탈락 (cut)은 `ClosedPosition` 행을 넣는데 최종 정산은 안 넣는다. 그래서 최종 정산된 포지션은 "내 포지션"에 `Settled.` 라벨로 남고 `.market-history`에는 안 나온다.

4. **`src/ui.test.tsx` 테스트 6건이 낡았다.** `HubPage` 재작성을 따라오지 못했다. 위 [현재 테스트 상태](#현재-테스트-상태) 참고.

---

## 파일 고칠 때 알아야 할 것

**배포 번들.** `public/reboundx/assets/`는 리빌드 금지. 손패치만. 유일 매치 확인 후 교체하고 CSS는 중괄호 균형을 센다.

**CSS 로드 순서.** `src/styles/NN-*.css`. 파일명 앞 숫자가 로드 순서다. Tailwind 없음. Framer Motion 없음. 플레인 CSS다.

**영어 전용 라우트.** `perps-day`, `perps-day/market`, `perps-day/teams`, `perps-day/kalshi`. 언어 토글을 넣지 말 것. `App.tsx`의 `englishOnly` 플래그가 이 목록을 들고 있다.

**발표자 사진 폴더.** `PerpDexDay/`는 매트릭스 그린 원본, `Wonderland/`는 투명 컷아웃. 처리 방식이 반대라서 섞으면 안 된다.

**`tsc` 종료 코드.** 출력이 길면 잘린다. `npx tsc --noEmit > /tmp/tsc.out 2>&1; echo "exit=$?"`로 확인한다.

**`noUnusedLocals`가 꺼져 있다.** `tsconfig`는 `strict: true`지만 미사용 변수를 잡지 않는다. import를 지울 때 직접 grep해야 한다.

**동시 편집.** 다른 편집자가 같은 저장소를 만진다. 파일 전면 재작성 금지. `ls -lT`로 mtime 먼저 확인한다. `ls -lT`에 파일이 여러 개면 이름순으로 정렬되므로 awk에서 파일명 필드를 반드시 출력한다.

---

## 문서

| 파일 | 내용 |
| --- | --- |
| `GOOGLE_AUTH_SETUP.md` | 구글 로그인 설정 3단계, 서버 계약 |
| `docs/design-system-hig.md` | 디자인 시스템. Apple HIG + WCAG 2.2 AA (466줄) |
| `docs/performance-architecture.md` | 성능 구조 (117줄) |
| `docs/prediction-market-prd.md` | 예측마켓 PRD v2.0 (366줄). 리네임 전 파일명 (`voteContent.ts`, `VotePage.tsx`)을 아직 참조한다 |
| `docs/ui-grid.md` | 4px 그리드 규칙 (18줄) |

`docs/superpowers/plans/`에 작업 계획 2건이 더 있다 (`2026-09-09-performance-architecture.md`, `2026-09-10-clean-architecture.md`).

모든 문서는 한국어다.
