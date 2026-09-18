# 프론트엔드 아키텍처 — 2026-09-18

## 범위와 보존한 동작

현재 체크아웃의 동작을 유지하는 리팩터링이다. 기존 사용자 변경인 Kalshi 게이트, 로그인할 때 저장 주소 초기화, 마켓/리더보드 전환을 보존했다. 이전 요청에 등장한 기능 변경을 다시 적용하지 않았다.

- Hub: 소개 문구 → PERP-DEX DAY → Wonderland → TOKEN2049, 현재의 **5초** 주기 유지. 키보드 포커스·화면 밖·모션 감소 설정에 따른 정지도 유지.
- 공개 행사 소개, Google 로그인 단계, TOKEN2049 Kalshi 단계, 모달 취소와 복귀 경로 유지.
- 마켓 ↔ 리더보드는 같은 컴포넌트 인스턴스를 유지하여 시뮬레이션이 재시작되지 않는다.
- 주문 견적·체결·정산·저장·언어·메타데이터·외부 터미널 링크는 변경하지 않았다.
- 시각 디자인과 CSS 우선순위는 유지했다. 새 의존성은 설치하지 않았다.

## 폴더 구조

```text
src/
├── main.tsx                       # React 진입점
├── App.tsx                        # 조립 지점: 라우팅·인증·언어 연결
├── app/
│   ├── ActionPage.tsx             # 액션 화면 라우팅, 마켓 인스턴스 유지
│   ├── EventLanding.tsx           # 공개 소개 화면 조립
│   └── useRouteMeta.ts            # 행사별 문서 메타데이터 정책
├── features/hub/
│   ├── useHubSlideshow.ts         # 타이머·가시성·포커스·선택 상태
│   ├── HubBackdrop.tsx            # 행사별 그래픽 선택/사전 로드
│   ├── HubSlides.tsx              # 소개 문구와 행사 CTA
│   ├── HubEventRail.tsx           # 행사 선택 메뉴
│   └── hub.css                    # Hub 전용 스타일
├── auth/
│   ├── useMarketAccess.ts         # 로그인 전후 진입 정책
│   ├── useGoogleSignIn.ts         # 로그인 상태·재시도·취소
│   ├── GoogleLoginModal.tsx       # Google 모달 UI
│   ├── KalshiAccountModal.tsx     # Kalshi 모달 UI
│   ├── kalshiAccount.ts           # 기존 데모 주소 게이트
│   └── auth.css                   # 인증 UI 스타일
├── infrastructure/
│   ├── googleIdentity.ts          # Google SDK 로드와 검증 HTTP 요청
│   └── storage.ts                 # 브라우저 저장소 접근
├── router/
│   ├── routes.ts                  # 순수 경로 해석/생성, AppRoute
│   ├── navigation.ts              # 링크 클릭 처리
│   ├── useAppRoute.ts             # 히스토리·popstate·스크롤 복원
│   ├── useDocumentMeta.ts         # DOM 메타 태그 수명 관리
│   └── preview.ts                 # 기존 데모 시나리오 선택
├── pages/                         # 페이지 조립 및 화면
├── components/
│   ├── useModalDialog.ts          # 공통 dialog/스크롤/포커스 수명 관리
│   ├── trader-table.css           # 공통 트레이더 테이블 보조 스타일
│   ├── events/                    # 행사 소개 공통 컴포넌트
│   ├── t2049/                     # TOKEN2049 소개 섹션
│   └── ...                        # 재사용 UI/그래픽
├── market/
│   ├── engine/                    # 기존 순수 가격·포지션·정산 커널
│   ├── perpdexday/                # PERP-DEX 규칙·reducer·React 어댑터
│   ├── token2049/                 # TOKEN2049 규칙·reducer·React 어댑터
│   └── ...                        # 차트·견적·히스토리·리더보드 계산
├── data/                          # 행사 구성 및 정적 데이터
├── i18n/                          # 언어 정책과 번역
├── motion/                        # 공통 스크롤 모션
└── styles/                        # 기존 공통/화면별 스타일

scripts/audit-source.mjs           # 읽기 전용 소스 참조 검사
docs/source-inventory.md           # 파일별 사용 현황
```

## 책임과 의존 방향

1. `App`은 구성만 담당한다. 세션 정책은 `useMarketAccess`, 소개 화면은 `EventLanding`, 액션 화면은 `ActionPage`로 분리했다.
2. Hub의 타이머는 이벤트 수만 받는다. Google, 라우팅, 시장 엔진을 알지 못한다. 그래픽은 `HubBackdrop`만 선택한다.
3. 로그인 UI는 fetch나 SDK 스크립트를 직접 관리하지 않는다. `useGoogleSignIn`이 상태를 관리하고 `googleIdentity`가 외부 I/O를 처리한다.
4. `useMarketAccess`는 Google SDK와 저장소를 import하지 않는다. 성공 후 Kalshi 주소 초기화는 조립 지점인 `App`이 실행한다.
5. 경로 타입과 URL 함수는 React 훅에서 분리했다. 링크 컴포넌트가 히스토리 훅과 데모 시뮬레이션을 함께 import하지 않는다.
6. 기존 `market/engine`은 React·DOM·페이지·네트워크에 의존하지 않는다. 이미 적절히 나뉜 계산 코드는 이동하거나 다시 작성하지 않았다.

완전한 프레임워크 독립 도메인 계층으로 전면 재작성한 것은 아니다. 기존 시장 React 훅에는 저장 및 preview 어댑터 의존성이 있고, `kalshiAccount`도 데모 저장소를 직접 사용한다. 이 경계를 보존함으로써 기능 변경을 피했다.

## 미사용 코드 정리

| 파일/그룹 | 조치와 근거 |
|---|---|
| `components/ReboundXHero.tsx` | 진입점/테스트 어느 쪽에서도 참조하지 않는 구형 Hero 제거 |
| `styles/12-home-content.css`, `13-home-mobile.css` | 위 컴포넌트만 사용하는 page/intro/headline 규칙 제거. Wonderland 공통 규칙 유지 |
| `styles/53-hub-auth.css` | 삭제 후 Hub·인증·테이블 소유 파일로 분리. 관련 media query도 함께 이동 |
| `components/AsciiArt.tsx` | 참조가 없는 `ASCII_D60_HERO` 레시피 제거. 사용 중인 영상 레시피 유지 |
| `i18n/types.ts` | 사용하지 않는 `LANGS` 상수 제거 |
| `ui.test.tsx` | 사용하지 않는 userEvent 인스턴스 제거 |
| 컴포넌트·데이터·번역·시장·라우터 파일 | 외부 소비자가 없는 24개 선언에서 `export` 제거. 내부에서 사용하는 타입/함수/상수 자체는 유지 |
| `package.json`, `package-lock.json` | 실제 파일이 없는 `tools/codex-orchestrator` 실행 항목 제거 |
| `tsconfig.json`, `vitest.config.ts` | 존재하지 않는 tools 디렉터리 검사 경로 제거 |
| `tsconfig.json` | `noUnusedLocals`, `noUnusedParameters` 활성화하여 재발 방지 |

삭제한 추적 파일은 Git 이력으로 복원할 수 있다. 개인 데이터·기존 사용자 수정·공개 이미지/폰트·생성된 Wonderland 번들은 삭제하지 않았다.

## 검증 및 한계

```sh
npm run typecheck
npm test
npm run build
npm run audit:source
node scripts/audit-source.mjs --json
```

기준 테스트 130개에 Hub 동작 보존 테스트 3개를 추가했다. 소스 검사는 현재 프로젝트의 문자열 리터럴 상대 import/re-export를 추적한다. 타입 import와 테스트 참조도 포함한다. 계산된 동적 경로, 런타임 CSS 조합, 외부에서 실행되는 스크립트까지 미사용이라고 판정하지 않는다. 세부 결과는 `source-inventory.md`를 참조한다.

Google/Kalshi는 기존 **데모 동작**을 유지했다. Client ID가 없으면 모달 버튼이 게이트를 열고, 검증 API가 없으면 서버 검증을 생략한다. Kalshi 주소 저장도 실제 계정 검증이 아니다. 이 리팩터링은 보안 인증을 완성하지 않으며 실제 운영에는 별도의 서버 검증이 필요하다.

Spline의 큰 청크와 WASM 경로 빌드 경고는 기존 의존성의 제약으로 남아 있다. 번들러/3D 런타임 교체는 이번 동작 보존 범위에 포함하지 않았다.
