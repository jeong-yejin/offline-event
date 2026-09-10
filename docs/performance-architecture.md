# 성능 최적화와 구조 리팩터링

현재 폴더의 React/TypeScript 앱을 대상으로 적용한 변경이다. 화면, URL, 거래·탈락·정산 규칙, 난수 호출 순서, 저장 키와 JSON 형식은 유지한다. 기존 미커밋 작업 위에 필요한 변경만 적용했다.

## 새 폴더 구조

```text
src/
  App.tsx                     # 페이지 구성과 언어/라우트 연결
  main.tsx                    # React 진입점
  pages/                      # 이벤트·시장 화면 조립
  components/
    events/
      EventCountdown.tsx      # 카운트다운의 상태·타이머·표시
      SpeakerSection.tsx      # 발표자 선택·순환·표시
      renderIsolation.test.tsx
    MarketChart.tsx           # 차트 UI, 포인터 상태, 계산 결과 캐시
    MarketChart.test.tsx
    Leaderboard.tsx           # 순위 표시와 순위 변경 효과
    DigitalRain.tsx           # effect 내부 canvas 시뮬레이션
    ...                       # 기존 공통 UI 및 효과
  market/
    state/
      perpDex.ts              # PERP-DEX 초기 상태·전이·선택자
      token2049.ts            # TOKEN2049 초기 상태·전이·선택자
    useMarket.ts              # PERP-DEX React/저장소 연결
    useT2049Market.ts         # TOKEN2049 React/저장소 연결
    useMarketClock.ts         # 공통 1초 tick, 시간·seed 주입, 해제
    history.ts                # 과거 샘플 조회·불변 길이 제한 배열
    record.ts                 # 선형 시간 레코드 생성
    chart.ts                  # 순수 샘플링·축·SVG 경로 계산
    marketEngine.ts           # 기존 가격·잔고·보유·정산 계산
    t2049Engine.ts            # 세션·탈락·TOKEN2049 가격 계산
    leaderboard.ts            # 참가자 생성·순위 계산
    wonderlandBoard.ts        # 시각으로 결정되는 보드 계산
    quote.ts                  # 견적·수량·만료 규칙
    format.ts                 # 재사용 Intl 포맷터
    *.test.ts(x)              # 도메인·동등성·수명주기 검증
  infrastructure/
    storage.ts                # localStorage 및 JSON 오류 처리
  router/                     # 탐색 및 document metadata 효과
  data/                       # 이벤트 콘텐츠·경기 설정
  i18n/                       # 사전·현지화·언어 선택
  motion/                     # 등장 효과
  styles/                     # 기존 CSS 계층과 cascade
public/                       # 이미지·폰트·임베드된 배포 산출물
scripts/benchmark-market.ts   # 재현 가능한 계산 마이크로벤치마크
docs/performance-architecture.md
```

## 책임과 의존성

페이지는 훅을 사용해 상태를 받고 UI를 조립한다. 시장 훅은 `useMarketClock`과 저장소 어댑터를 연결하며, 상태 모듈은 주어진 상태·명령·시간·seed로 다음 상태를 계산한다. 상태 모듈은 React, `window`, localStorage, `Date.now()`를 직접 사용하지 않는다. 초기 상태도 `createInitialState(time, restoredAccount)`로 만든다. 따라서 브라우저 없이 규칙을 검증할 수 있고, 이후 다른 저장소나 실행 환경을 붙일 때 가격·정산 규칙을 변경할 필요가 줄어든다.

기존 훅의 `reduceMarket`, `phaseOf`, 타입 등 공개 export는 호환성을 위해 재노출한다. 도메인 테스트와 i18n의 Phase 타입은 상태 모듈을 직접 참조한다. 서로 다른 두 경기의 정산 정책을 하나의 거대한 범용 엔진으로 합치지 않고, 실제로 동일한 시계·저장·히스토리·레코드 생성만 공유한다.

차트 계산은 `market/chart.ts`에 있고 React 컴포넌트는 결과를 표시한다. 입력 배열의 불변성이 캐시 계약이다. 새 데이터가 생기면 새 배열을 전달해야 한다. 리듀서는 기존 스냅샷을 변경하지 않으며, canvas의 stream은 effect 내부에서만 소유하므로 제자리 압축이 가능하다.

## 발견한 문제와 적용 전략

| 문제 | 적용한 변경 | 효과 및 한계 |
|---|---|---|
| 매 tick `history.filter()` 후 마지막 원소만 사용 | 뒤에서 첫 일치 항목을 반환 | 중간 배열 제거. 1초 샘플/3분 창에서는 약 181개 검사. 최악 O(H)는 유지 |
| `[...history, item].slice(-3600)` | 유지할 tail을 한 번 복사한 뒤 push | 전체 크기 배열 2개 → 1개. React 불변성 유지, append 자체는 O(H) |
| 초기 히스토리에서 누적 배열 spread 반복 | 함수 내부 새 배열에 push 후 reverse | 배열 구축 O(H²) → O(H), 난수 순서와 모든 결과 유지 |
| 레코드 reduce마다 누적 객체 spread | `mapRecord`로 새 객체에 순서대로 대입 | O(N²) → O(N), 키 순서·특수 키 의미 보존 |
| 차트 hover마다 샘플·축·모든 경로 재계산 | 입력별 `useMemo`, 경로 Map, `memo` | hover에서 경로 계산 0회. 데이터 변경 시에는 정상 재계산 |
| 축 계산에서 flatMap/map/filter와 spread | 유한값에 대한 단일 중첩 순회 | 임시 값 배열과 함수 인자 수 제한 제거 |
| fill 영역과 선에서 같은 경로 중복 생성 | 캐시된 선 경로를 fill 영역에 재사용 | 선택된 경로 중복 직렬화 제거 |
| 주문 UI 변경에도 전체 순위 재정렬 | 가격·잔고·보유·참가자 기반 memo | 관련 입력이 같으면 정렬 생략; Leaderboard도 동일 props 렌더 생략 |
| 카운트다운이 TOKEN2049 전체 페이지 갱신 | EventCountdown으로 상태 이동 | 1초 갱신 범위를 시계로 제한 |
| 발표자 전환이 PERP-DEX 전체 페이지 갱신 | SpeakerSection으로 상태 이동 | 2.4초 및 hover/focus 갱신 범위를 발표자 영역으로 제한 |
| Wonderland 종료 후 같은 순위를 반복 계산 | elapsed 기반 memo | 종료 후 보드 계산 재사용, 기존 시계 주기 유지 |
| DigitalRain에서 각 글자마다 Math.pow | trail 변경 시 taper 테이블 계산 | 프레임 반복 지수 계산 제거 |
| 매 frame 모든 column의 stream filter 배열 생성 | effect 소유 배열을 제자리 압축 | column 수 × frame 수 만큼의 임시 배열 생성 제거 |
| 두 훅에 저장소/타이머/규칙 혼재 | state, clock, infrastructure로 분리 | 브라우저 의존성을 경계로 이동하고 중복 제거 |

## 측정

실행: `node --import tsx scripts/benchmark-market.ts`

동일 입력에 대한 결과를 먼저 `assert.deepEqual`로 검증한다. 각 함수 500회 준비 실행 후 2,000회 실행 시간을 7회 측정한 중앙값이다. 3,600개 샘플과 8개 시장의 합성 데이터이며, 이 환경의 한 번의 실행 결과다.

| 계산 | 이전 2,000회 | 이후 2,000회 | 비율 |
|---|---:|---:|---:|
| 과거 잔고 조회 | 13.366 ms | 0.239 ms | 55.97× |
| 길이 제한 append | 4.417 ms | 3.169 ms | 1.39× |
| 차트 축 범위 | 73.445 ms | 15.849 ms | 4.63× |
| 4개 키 레코드 | 0.508 ms | 0.125 ms | 4.06× |
| 8개 키 레코드 | 1.272 ms | 0.165 ms | 7.73× |
| 128개 키 레코드 | 235.991 ms | 4.897 ms | 48.19× |

이는 함수 계산 비용의 마이크로벤치마크다. 전체 앱이 같은 배수로 빨라졌다는 의미가 아니다. 브라우저 FPS, LCP, React commit 시간, 실제 heap peak는 측정하지 않았다. 메모리 개선은 코드에서 제거한 임시 배열/객체 할당에 대한 분석이며, 캐시된 SVG 경로는 소량의 유지 메모리를 추가로 사용한다.

기준 main JS는 314.70 kB / gzip 96.40 kB였고 리팩터링 후 빌드는 약 314.8 kB / gzip 96.7 kB다. CSS는 78.24 kB / gzip 15.06 kB로 동일하다. 이번 변경은 초기 다운로드 크기 감소가 아니라 실행 중 계산과 렌더 범위 개선이다.

## 검증

- 기준: 81개 중 78개 통과, 기존 문구 기대값 3개 실패. 타입 검사·빌드 통과.
- 이후: 93개 테스트 통과. `npm run typecheck`, `npm run build`, `git diff --check`로 최종 검증.
- 기존 주문·만료·중복 체결·탈락·동률 정산·라우팅·언어 UI 테스트 유지.
- 기존 실패 테스트의 `Wake up. The arena is calling.` → 현재 `Wake up, Rebounder`, hero의 `eight traders` → 현재 `PERPS DAY`로 기대값만 수정. 제품 문구 수정 없음.
- 두 엔진의 180개 초기 스냅샷 전체를 변경 직전에 저장하고 변경 직후 deep equality 확인.
- 추가 테스트: 시계 역행·중복 timestamp·빈 히스토리·보존 길이·150,000개 축 입력·레코드 키·순수 초기화·상태 불변성.
- React 테스트: hover에서 차트 경로 재계산 없음, 새 history에서 재계산, 시계/발표자 변경 시 hero 렌더 없음, timer 해제, 가격 tick에서 저장 쓰기 없음, 저장소 오류 복구.
- canvas 시각 동등성은 계산식·순서 검토 기준이다. jsdom은 실제 canvas를 렌더링하지 않으므로 픽셀 동등성이나 GPU 성능 검증은 포함하지 않는다.

## 폴더 전체 검토에서 남은 경계

앱 진입점, 페이지, 공통 컴포넌트, 시장 도메인, 데이터·i18n, 라우터·motion, CSS 구성, 테스트·빌드 설정과 public 자산 구성을 살폈다. 수정할 이유가 없는 파일까지 재작성하지 않았다.

- public은 약 11 MB이고 발표자 WebP 3개가 약 7.2 MB다. 정적 자산 다운로드/디코딩은 별도의 비용이다. 원본 해상도와 표시 품질을 유지하기 위해 이번 코드 리팩터링에서 재인코딩하지 않았다.
- 모든 페이지가 정적 import라 초기 main chunk에 포함된다. 라우트별 분할은 초기 다운로드 개선 후보지만 로딩 UI·탐색 타이밍·등장 효과 동기화까지 검증해야 하므로 이번 동작 보존 변경에는 포함하지 않았다.
- CSS에 legacy/editorial cascade가 함께 있다. 겉으로 중복인 규칙을 제거하면 우선순위와 반응형 결과가 바뀔 수 있어 유지했다.
- `public/reboundx`는 별도 임베드 앱의 배포 JavaScript/CSS다. 편집 가능한 원본 프로젝트가 없는 산출물이고 기존 변경도 있어 원본 코드처럼 재구성하지 않았다.
- 시장은 브라우저 내 시뮬레이션이다. 상태 분리는 서버 실행을 쉽게 하지만 실시간 서버, 동시 사용자 동기화, 영속 DB, 실제 거래 처리의 확장성을 구현한 것은 아니다.
- 히스토리는 최대 3,600개를 유지한다. 수십만 샘플이 필요하면 청크/순환 버퍼와 차트 집계를 함께 설계해야 한다. 현재는 React가 기대하는 불변 배열 계약을 유지한다.
