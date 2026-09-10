# 4px UI grid

고정된 간격·크기·폰트 값은 정수 px로 쓰고 가장 가까운 4px 배수로 맞춘다.

- 14px → 16px, 18px → 20px, 13px → 12px.
- rem은 현재 기본 루트 크기 16px 기준으로 변환한다. .8125rem → 12px.
- 중간값은 절댓값이 큰 쪽으로 반올림한다. 0은 유지하고 0이 아닌 작은 길이는 최소 ±4px로 유지한다.
- 대상: gap, padding, margin, width/height, min/max 크기, font-size, 고정 line-height, 위치, radius, grid 트랙 길이, flex-basis, 고정 transform 이동 거리, CSS 변수의 px/rem 길이.
- 반응형 비율(%, vw/vh, fr), 글꼴 상대 비율(em, ch), 행간 배율, 자간, hairline border/outline, 색상/투명도, 시간, SVG/셰이더 좌표, 거래 데이터는 그대로 유지한다.
- 미디어쿼리의 700px/701px 같은 경계는 스타일 길이가 아닌 조건이므로 유지한다.
- 브라우저가 계산하는 유동 크기나 텍스트 너비까지 정수/4의 배수로 강제하지 않는다.

검사: `python3 scripts/normalize-ui-grid.py --check`
적용: `python3 scripts/normalize-ui-grid.py --write`

이번 적용은 src와 public의 CSS 27개 파일을 검사해 516개 선언을 정리했다. Canvas glyph 기본 크기도 10에서 12로 변경했다. 모바일 마켓 표는 위치 기준을 가진 스크롤 컨테이너로 수정해 숨김 접근성 텍스트가 문서 폭을 늘리지 않게 했다.

1440px/390px에서 7개 경로를 확인했고, 두 모바일 마켓의 표는 내부 가로 스크롤을 유지하면서 문서 너비가 390px에 맞는 것을 재확인했다. 테스트 94개와 빌드가 통과했다. 타입 검사는 EventCountdown.tsx가 현재 사전에 없는 t2049StartTba를 참조하는 별도 오류가 남아 있다.
