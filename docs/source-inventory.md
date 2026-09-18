# 소스 파일별 점검 결과

2026-09-18. `node scripts/audit-source.mjs --json` 결과로 작성했다.

총 119개 TypeScript 소스 모듈. 도달할 수 없는 모듈: 0개.

`runtime`: 앱 진입점에서 참조됨. `test`: 테스트 파일. `test-only`: 테스트에서만 사용. 사용 중인 파일은 불필요하게 삭제하지 않았다.

| 파일 | 사용 상태 | 직접 내부 의존 수 |
|---|---|---:|
| `src/App.tsx` | runtime | 9 |
| `src/app/ActionPage.tsx` | runtime | 8 |
| `src/app/EventLanding.tsx` | runtime | 9 |
| `src/app/useRouteMeta.ts` | runtime | 2 |
| `src/auth/GoogleLoginModal.test.tsx` | test | 1 |
| `src/auth/GoogleLoginModal.tsx` | runtime | 3 |
| `src/auth/kalshiAccount.ts` | runtime | 0 |
| `src/auth/KalshiAccountModal.tsx` | runtime | 3 |
| `src/auth/marketGate.test.tsx` | test | 1 |
| `src/auth/useGoogleSignIn.ts` | runtime | 2 |
| `src/auth/useMarketAccess.ts` | runtime | 1 |
| `src/components/ArrowIcon.tsx` | runtime | 0 |
| `src/components/AsciiArt.tsx` | runtime | 0 |
| `src/components/BackLink.tsx` | runtime | 0 |
| `src/components/BlackHoleBG.tsx` | runtime | 0 |
| `src/components/ChanceBar.tsx` | runtime | 1 |
| `src/components/ClosedPositionList.tsx` | runtime | 3 |
| `src/components/CtaWord.tsx` | runtime | 0 |
| `src/components/DigitalRain.tsx` | runtime | 0 |
| `src/components/EventHero.tsx` | runtime | 3 |
| `src/components/events/EventCountdown.tsx` | runtime | 1 |
| `src/components/events/renderIsolation.test.tsx` | test | 4 |
| `src/components/events/SpeakerSection.tsx` | runtime | 4 |
| `src/components/EventSwitcher.tsx` | runtime | 4 |
| `src/components/FooterWordmark.tsx` | runtime | 1 |
| `src/components/HeroSplineBackground.tsx` | runtime | 0 |
| `src/components/LangToggle.tsx` | runtime | 2 |
| `src/components/Leaderboard.tsx` | runtime | 4 |
| `src/components/MarketChart.test.tsx` | test | 5 |
| `src/components/MarketChart.tsx` | runtime | 4 |
| `src/components/OrderTicket.tsx` | runtime | 4 |
| `src/components/PositionList.tsx` | runtime | 4 |
| `src/components/PositionsSection.tsx` | runtime | 4 |
| `src/components/ReboundXTunnel.test.tsx` | test | 1 |
| `src/components/ReboundXTunnel.tsx` | runtime | 0 |
| `src/components/RulesSection.tsx` | runtime | 1 |
| `src/components/SettledBanner.tsx` | runtime | 2 |
| `src/components/SiteShell.tsx` | runtime | 8 |
| `src/components/t2049/T2049Arrow.tsx` | runtime | 0 |
| `src/components/t2049/T2049Attend.tsx` | runtime | 4 |
| `src/components/t2049/T2049Field.tsx` | runtime | 4 |
| `src/components/t2049/T2049Format.tsx` | runtime | 3 |
| `src/components/t2049/T2049Hero.tsx` | runtime | 7 |
| `src/components/t2049/T2049Join.tsx` | runtime | 3 |
| `src/components/t2049/T2049Nav.tsx` | runtime | 1 |
| `src/components/t2049/T2049Predict.tsx` | runtime | 4 |
| `src/components/t2049/T2049Section.tsx` | runtime | 1 |
| `src/components/TraderTable.tsx` | runtime | 3 |
| `src/components/useModalDialog.ts` | runtime | 0 |
| `src/components/WonderlandHero.tsx` | runtime | 3 |
| `src/data/eventContent.ts` | runtime | 0 |
| `src/data/homeContent.ts` | runtime | 0 |
| `src/data/perpDexMarketContent.ts` | runtime | 0 |
| `src/data/t2049MarketContent.ts` | runtime | 1 |
| `src/data/token2049Content.ts` | runtime | 0 |
| `src/features/hub/HubBackdrop.tsx` | runtime | 3 |
| `src/features/hub/HubEventRail.tsx` | runtime | 1 |
| `src/features/hub/HubSlides.tsx` | runtime | 6 |
| `src/features/hub/useHubSlideshow.ts` | runtime | 0 |
| `src/i18n/content.ts` | runtime | 3 |
| `src/i18n/strings/common.ts` | runtime | 1 |
| `src/i18n/strings/market.ts` | runtime | 2 |
| `src/i18n/strings/perpdexday.ts` | runtime | 4 |
| `src/i18n/strings/token2049.ts` | runtime | 5 |
| `src/i18n/strings/wonderland.ts` | runtime | 3 |
| `src/i18n/types.ts` | runtime | 0 |
| `src/i18n/useLanguage.ts` | runtime | 1 |
| `src/infrastructure/googleIdentity.ts` | runtime | 0 |
| `src/infrastructure/storage.ts` | runtime | 0 |
| `src/main.tsx` | runtime | 1 |
| `src/market/chart.ts` | runtime | 1 |
| `src/market/engine/constants.ts` | runtime | 0 |
| `src/market/engine/index.ts` | runtime | 9 |
| `src/market/engine/positions.ts` | runtime | 3 |
| `src/market/engine/pricing.ts` | runtime | 3 |
| `src/market/engine/random.ts` | runtime | 0 |
| `src/market/engine/rfq.ts` | runtime | 2 |
| `src/market/engine/roster.ts` | runtime | 2 |
| `src/market/engine/settlement.ts` | runtime | 2 |
| `src/market/engine/simulation.ts` | runtime | 5 |
| `src/market/engine/types.ts` | runtime | 0 |
| `src/market/format.ts` | runtime | 0 |
| `src/market/history.ts` | runtime | 1 |
| `src/market/leaderboard.test.ts` | test | 3 |
| `src/market/leaderboard.ts` | runtime | 1 |
| `src/market/performance.test.ts` | test | 6 |
| `src/market/perpdexday/market.test.ts` | test | 4 |
| `src/market/perpdexday/market.ts` | runtime | 2 |
| `src/market/perpdexday/state.ts` | runtime | 5 |
| `src/market/perpdexday/useMarket.ts` | runtime | 7 |
| `src/market/quote.ts` | runtime | 1 |
| `src/market/record.ts` | runtime | 0 |
| `src/market/token2049/clock.ts` | runtime | 1 |
| `src/market/token2049/market.test.ts` | test | 6 |
| `src/market/token2049/market.ts` | runtime | 3 |
| `src/market/token2049/state.ts` | runtime | 6 |
| `src/market/token2049/useMarket.ts` | runtime | 7 |
| `src/market/useMarketClock.ts` | runtime | 0 |
| `src/market/useMarketHooks.test.tsx` | test | 5 |
| `src/market/useOrderDesk.ts` | runtime | 2 |
| `src/market/wonderlandBoard.test.ts` | test | 1 |
| `src/market/wonderlandBoard.ts` | runtime | 0 |
| `src/motion/reveal.ts` | runtime | 0 |
| `src/pages/HubPage.test.tsx` | test | 2 |
| `src/pages/HubPage.tsx` | runtime | 7 |
| `src/pages/MarketLeaderboardPage.tsx` | runtime | 7 |
| `src/pages/PerpDexDayMarketPage.tsx` | runtime | 21 |
| `src/pages/PerpDexDayPage.tsx` | runtime | 10 |
| `src/pages/Token2049KalshiPage.tsx` | runtime | 6 |
| `src/pages/Token2049MarketPage.tsx` | runtime | 21 |
| `src/pages/Token2049Page.tsx` | runtime | 10 |
| `src/pages/WonderlandBoardPage.tsx` | runtime | 5 |
| `src/pages/WonderlandPage.tsx` | runtime | 4 |
| `src/router/navigation.ts` | runtime | 1 |
| `src/router/preview.ts` | runtime | 4 |
| `src/router/routes.ts` | runtime | 1 |
| `src/router/useAppRoute.ts` | runtime | 2 |
| `src/router/useDocumentMeta.ts` | runtime | 0 |
| `src/ui.test.tsx` | test | 1 |

## 별도 점검

- CSS: 스타일 import와 제거된 Hero 전용 선택자를 확인했다. 동적 클래스와 공통 cascade는 보존했다.
- package/lock/config: 없는 tools 실행 파일 및 검사 경로 제거. 버전 변경 없음.
- scripts: 개발용 benchmark, UI-grid 정규화, Figma 자산 목록은 명시적 실행 도구이므로 앱 미참조를 이유로 삭제하지 않았다.
- public: 임베디드 빌드와 이미지/폰트는 자체 참조가 있으므로 유지했다.
- docs/README: 문서와 사용자의 기존 변경을 보존했다.
- node_modules/dist/.git: 생성물/의존성/Git 이력은 미사용 코드 삭제 대상에서 제외했다.

이 목록은 정적 모듈 도달 가능성 점검이며, 모든 가능한 실행 경로의 의미적 미사용 코드를 증명하지는 않는다. 미사용 로컬 선언·인자는 TypeScript 검사로 별도 확인한다.
