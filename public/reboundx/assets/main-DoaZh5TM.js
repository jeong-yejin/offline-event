// ReboundX in Wonderland (/reboundx). Hand-maintained deployed artifact.
// There is no upstream source for this page in src/; this file is the source of
// truth and Vite copies public/ into dist/ verbatim. Edit here, never rebuild.
// See README "REBOUNDX IN WONDERLAND" for the reason.

import {
  j as jsxRuntime,
  r as React,
  u as useGSAP,
  g as gsap,
  M as MOTION_OK,
  S as easeSettle,
  E as EVENT,
  a as SUIT_GLYPHS,
  i as isRedSuit,
  T as easeTurn,
  b as TERMINAL_URL,
  c as SiteHeader,
  d as SiteFooter,
  e as createRoot
} from "./SiteFooter-CdLug1aP.js";
const __ko = new URLSearchParams(location.search).get("lang") !== "en",
  __t = (ko, en) => __ko ? ko : en;
document.documentElement.lang = __ko ? "ko" : "en";
const SEGMENTS_PER_RING = 20,
  RING_COUNT = 17,
  INNER_RADIUS = 6,
  OUTER_RADIUS = 600,
  RING_TWIST_DEG = 5,
  SEGMENT_ARC_DEG = 360 / SEGMENTS_PER_RING,
  // One ring's growth and one segment's arc plus the twist. The hero tween
  // reuses both as its scale and rotation targets, so after each loop the
  // tunnel lands exactly on the next ring and the seam is invisible.
  RING_GROWTH = (OUTER_RADIUS / INNER_RADIUS) ** (1 / RING_COUNT),
  LOOP_ROTATION_DEG = SEGMENT_ARC_DEG + RING_TWIST_DEG,
  polarPoint = (a, s) => {
    const t = s * Math.PI / 180;
    return `${(a * Math.cos(t)).toFixed(1)} ${(a * Math.sin(t)).toFixed(1)}`;
  },
  ringSegmentPath = (a, s, t, l) => `M${polarPoint(s, t)}A${s} ${s} 0 0 1 ${polarPoint(s, l)}L${polarPoint(a, l)}A${a} ${a} 0 0 0 ${polarPoint(a, t)}Z`,
  TUNNEL_PATHS = Array.from({ length: RING_COUNT }, (a, s) => s).flatMap((a) => {
    const s = INNER_RADIUS * RING_GROWTH ** a, t = a * RING_TWIST_DEG;
    return Array.from({ length: SEGMENTS_PER_RING }, (l, r) => r).filter((l) => (a + l) % 2 === 0).map((l) => ringSegmentPath(
      s,
      s * RING_GROWTH,
      t + l * SEGMENT_ARC_DEG,
      t + (l + 1) * SEGMENT_ARC_DEG
    ));
  });
function TunnelBackdrop() {
  return jsxRuntime.jsx(
    "svg",
    {
      className: "tunnel",
      viewBox: "-500 -500 1000 1000",
      preserveAspectRatio: "xMidYMid slice",
      "aria-hidden": "true",
      children: TUNNEL_PATHS.map((a) => jsxRuntime.jsx("path", { d: a }, a))
    }
  );
}
const HERO_FACTS = [
  { label: "Date", value: EVENT.date, note: EVENT.year },
  { label: "Venue", value: EVENT.venue, note: EVENT.city },
  { label: "Doors", value: EVENT.doors, note: `till ${EVENT.lastCall}`, tracked: true }
];
function HeroSection() {
  const scope = React.useRef(null);
  return useGSAP(() => {
    gsap.matchMedia().add(MOTION_OK, () => {
      gsap.to(
        ".tunnel",
        { scale: RING_GROWTH, rotation: LOOP_ROTATION_DEG, duration: 3, ease: "none", repeat: -1 }
      ),
        gsap.timeline({ defaults: { ease: easeSettle } }).from(
          ".hero__tunnel",
          { autoAlpha: 0, scale: 1.14, duration: 1.8 }
        ).from(".hero__logo", { autoAlpha: 0, y: 28, scale: 0.94, duration: 1.1 }, 0.15).from(
          ".hero__lede",
          { autoAlpha: 0, y: 20, duration: 0.9 },
          0.6
        ).from(
          ".hero__suits span",
          { autoAlpha: 0, y: 14, scale: 0.7, duration: 0.7, stagger: 0.08 },
          0.75
        ).from(".marquee__item", { autoAlpha: 0, y: 18, duration: 0.8, stagger: 0.09 }, 0.95);
    });
  },
    { scope: scope }),
    jsxRuntime.jsxs(
      "section",
      {
        className: "hero",
        ref: scope,
        children: [
          jsxRuntime.jsx(
            "div",
            {
              className: "hero__tunnel",
              "aria-hidden": "true",
              children: jsxRuntime.jsx(TunnelBackdrop, {})
            }
          ),
          jsxRuntime.jsx(
            "h1",
            { children: jsxRuntime.jsx(
              "img",
              {
                className: "hero__logo",
                src: "/assets/logo.png",
                alt: EVENT.name,
                width: 660,
                height: 396
              }
            ) }
          ),
          jsxRuntime.jsxs(
            "div",
            {
              className: "hero__copy",
              children: [
                jsxRuntime.jsxs(
                  "p",
                  {
                    className: "hero__lede body-kr",
                    children: [
                      __t(
                        "거래소·체인·프로토콜 6팀의 피치부터 실시간 트레이딩 컴피티션과 VIP 포커 나이트까지,",
                        "Pitches from 6 exchange, chain and protocol teams, a live trading competition, and a VIP poker night."
                      ),
                      jsxRuntime.jsx("br", {}),
                      __t("단 하루 저녁에만 이상한 나라가 열려요.", "Wonderland opens for one evening only.")
                    ]
                  }
                ),
                jsxRuntime.jsxs(
                  "p",
                  {
                    className: "hero__suits",
                    "aria-hidden": "true",
                    children: [
                      jsxRuntime.jsx("span", { children: SUIT_GLYPHS.spade }),
                      " ",
                      jsxRuntime.jsx("span", { children: SUIT_GLYPHS.heart }),
                      " ",
                      jsxRuntime.jsx("span", { children: SUIT_GLYPHS.club }),
                      " ",
                      jsxRuntime.jsx("span", { children: SUIT_GLYPHS.diamond })
                    ]
                  }
                ),
                jsxRuntime.jsx(
                  "dl",
                  {
                    className: "marquee",
                    children: HERO_FACTS.map(({ label: s, value: t, note: l, tracked: r }) => jsxRuntime.jsxs(
                      "div",
                      {
                        className: "marquee__item",
                        children: [
                          jsxRuntime.jsx("dt", { className: "marquee__label label", children: s }),
                          jsxRuntime.jsx(
                            "dd",
                            {
                              className: `marquee__value display${r ? " marquee__value--tracked" : ""}`,
                              children: t
                            }
                          ),
                          jsxRuntime.jsx("dd", { className: "marquee__note data", children: l })
                        ]
                      },
                      s
                    ))
                  }
                )
              ]
            }
          )
        ]
      }
    );
}
function LineupCard({ rank, suit, name, speaker, featured }) {
  const tone = isRedSuit(suit) ? "red" : "black",
    glyph = SUIT_GLYPHS[suit],
    photo = speaker == null ? void 0 : speaker.photo;
  return jsxRuntime.jsx(
    "li",
    {
      className: "card-slot",
      children: jsxRuntime.jsxs(
        "div",
        {
          className: "card-turn",
          children: [
            jsxRuntime.jsxs(
              "div",
              {
                className: `card${featured ? " card--featured" : ""}`,
                children: [
                  jsxRuntime.jsxs(
                    "p",
                    {
                      className: `card__index card__index--${tone} data`,
                      "aria-hidden": "true",
                      children: [
                        jsxRuntime.jsx("span", { children: rank }),
                        jsxRuntime.jsx("span", { children: glyph })
                      ]
                    }
                  ),
                  jsxRuntime.jsx("h3", { className: "card__name display", children: name }),
                  photo ? jsxRuntime.jsx(
                    "img",
                    {
                      className: "card__photo",
                      src: photo,
                      alt: "",
                      loading: "lazy",
                      decoding: "async"
                    }
                  ) : jsxRuntime.jsx(
                    "p",
                    {
                      className: `card__pip card__pip--${tone} display`,
                      "aria-hidden": "true",
                      children: glyph
                    }
                  ),
                  jsxRuntime.jsxs(
                    "div",
                    {
                      className: "card__footer",
                      children: [
                        jsxRuntime.jsx(
                          "p",
                          {
                            className: `card__speaker${speaker ? "" : " card__speaker--tba"}`,
                            children: (speaker == null ? void 0 : speaker.name) ?? "Speaker TBA"
                          }
                        ),
                        (speaker == null ? void 0 : speaker.title) && jsxRuntime.jsx(
                          "p",
                          { className: "card__title label", children: speaker.title }
                        )
                      ]
                    }
                  )
                ]
              }
            ),
            jsxRuntime.jsx("div", { className: "card-back", "aria-hidden": "true" })
          ]
        }
      )
    }
  );
}
const LINEUP = [
  { rank: "A", suit: "heart", name: "ReboundX", role: "Opening", speaker: null, featured: true },
  {
    rank: "2",
    suit: "spade",
    name: "Variational",
    role: "Protocol",
    speaker: {
      name: "Justin",
      title: "Head of Product",
      photo: "/assets/speakers/Wonderland/Variational-Justin.webp"
    }
  },
  {
    rank: "3",
    suit: "diamond",
    name: "Mantle",
    role: "Chain",
    speaker: {
      name: "Gemma",
      title: "Korea Lead",
      photo: "/assets/speakers/Wonderland/Mantle-Gemma.webp"
    }
  },
  {
    rank: "4",
    suit: "spade",
    name: "OKX WALLET",
    role: "Exchange",
    speaker: {
      name: "Lennix Lai",
      title: "Global General Manager",
      photo: "/assets/speakers/Wonderland/OKX-Lennix%20Lai.webp"
    }
  },
  {
    rank: "5",
    suit: "club",
    name: "Base",
    role: "Chain",
    speaker: {
      name: "Andrew",
      title: "APAC Ecosystem, Coinbase",
      photo: "/assets/speakers/Wonderland/Base-Andrew.webp"
    }
  },
  {
    rank: "6",
    suit: "club",
    name: "Gopax",
    role: "Exchange",
    speaker: {
      name: "Steve",
      title: "BD Director",
      photo: "/assets/speakers/Wonderland/Gopax-Steve.webp"
    }
  }
];
function LineupSection() {
  const scope = React.useRef(null);
  return useGSAP(() => {
    gsap.matchMedia().add(MOTION_OK, () => {
      gsap.from(
        ".section-head > *",
        {
          autoAlpha: 0,
          y: 24,
          duration: 0.9,
          stagger: 0.1,
          ease: easeSettle,
          scrollTrigger: { trigger: ".section-head", start: "top 88%" }
        }
      ),
        gsap.from(
          ".card-turn",
          {
            rotateY: 180,
            y: 26,
            duration: 1.6,
            stagger: { amount: 3, from: "start", grid: "auto" },
            ease: easeTurn,
            clearProps: "transform",
            scrollTrigger: { trigger: ".deck", start: "top 85%" }
          }
        );
    });
  },
    { scope: scope }),
    jsxRuntime.jsx(
      "section",
      {
        className: "section",
        id: "lineup",
        ref: scope,
        children: jsxRuntime.jsxs(
          "div",
          {
            className: "shell lineup",
            children: [
              jsxRuntime.jsxs(
                "div",
                {
                  className: "section-head",
                  children: [
                    jsxRuntime.jsxs(
                      "p",
                      { className: "section-eyebrow label", children: [LINEUP.length, " Teams"] }
                    ),
                    jsxRuntime.jsx("h2", { className: "section-title", children: "Lineup" })
                  ]
                }
              ),
              jsxRuntime.jsx(
                "ul",
                {
                  className: "deck",
                  children: LINEUP.map((s) => jsxRuntime.jsx(LineupCard, { ...s }, s.name))
                }
              )
            ]
          }
        )
      }
    );
}
const TIMETABLE = [
  {
    id: "Scene I — The Garden",
    title: __t("입장 & 부스", "Doors & Booths"),
    span: "16:00 – 18:00",
    rows: [
      { time: "16:00", title: __t("참가자 입장 시작", "Doors open") },
      { time: "16:00 – 18:00", title: __t("부스별 미션", "Booth missions") }
    ]
  },
  {
    id: "Scene II — The Trial",
    title: __t("피치", "Pitches"),
    span: "18:00 – 19:00",
    rows: [
      { time: "18:00 – 18:10", title: __t("ReboundX 오프닝 피치", "ReboundX Opening Pitch") },
      { time: "18:10 – 18:20", title: "Variational Pitch" },
      { time: "18:20 – 18:30", title: "Mantle Pitch" },
      { time: "18:30 – 18:40", title: "OKX-Wallet Pitch" },
      { time: "18:40 – 18:50", title: "Base Pitch" },
      { time: "18:50 – 19:00", title: "Gopax Pitch" }
    ]
  },
  {
    id: "Scene III — The Croquet Ground",
    title: __t("트레이딩 컴피티션", "Trading Competition"),
    span: "19:30 – 20:10",
    rows: [
      { time: "19:30 – 20:00", title: "Trading Competition", feature: true },
      { time: "20:00 – 20:10", title: __t("우승자 발표", "Winner announcement") }
    ]
  },
  {
    id: "Scene IV — A Mad Tea Party",
    title: __t("포커 나이트", "Poker Night"),
    span: "20:10 – 21:00",
    rows: [{ time: "20:10 – 21:00", title: "VIP Poker Night / Networking", feature: true }]
  }
];
function TimetableSection() {
  return jsxRuntime.jsx(
    "section",
    {
      className: "section",
      id: "timetable",
      children: jsxRuntime.jsxs(
        "div",
        {
          className: "shell timetable",
          children: [
            jsxRuntime.jsx(
              "div",
              {
                className: "section-head",
                children: jsxRuntime.jsx(
                  "h2",
                  { className: "section-title", children: "Timetable" }
                )
              }
            ),
            TIMETABLE.map((a) => jsxRuntime.jsxs(
              "section",
              {
                className: "scene",
                children: [
                  jsxRuntime.jsxs(
                    "div",
                    {
                      className: "scene__head",
                      children: [
                        jsxRuntime.jsx("h3", { className: "scene__title", children: a.title }),
                        jsxRuntime.jsx("p", { className: "scene__span data", children: a.span })
                      ]
                    }
                  ),
                  jsxRuntime.jsx(
                    "ul",
                    { children: a.rows.map((s) => jsxRuntime.jsxs(
                      "li",
                      {
                        className: "row",
                        children: [
                          jsxRuntime.jsx("p", { className: "row__time data", children: s.time }),
                          jsxRuntime.jsx(
                            "p",
                            {
                              className: `row__title ${s.feature ? "row__title--feature" : "body-kr"}`,
                              children: s.title
                            }
                          )
                        ]
                      },
                      s.title
                    )) }
                  )
                ]
              },
              a.id
            ))
          ]
        }
      )
    }
  );
}
const DOOR_OUTLINE_PATH = "M175 46.5C245.969 46.5 303.5 104.031 303.5 175V430C303.5 431.381 302.381 432.5 301 432.5H49C47.6193 432.5 46.5 431.381 46.5 430V175C46.5 104.031 104.031 46.5 175 46.5Z",
  DOOR_PANEL_PATH = "M46 175C46 103.755 103.755 46 175 46V46C246.245 46 304 103.755 304 175V430C304 431.657 302.657 433 301 433H49C47.3431 433 46 431.657 46 430V175Z";
function DoorLeaf() {
  return jsxRuntime.jsxs(
    "svg",
    {
      width: "350",
      height: "479",
      viewBox: "0 0 350 479",
      fill: "none",
      "aria-hidden": "true",
      children: [
        jsxRuntime.jsx("path", { d: DOOR_PANEL_PATH, fill: "#0A0509", filter: "url(#door-glow)" }),
        jsxRuntime.jsx("path", { d: DOOR_PANEL_PATH, fill: "url(#door-fill)" }),
        jsxRuntime.jsx(
          "path",
          { d: "M76 228V175A99 99 0 0 1 274 175V228Z", stroke: "#D4AC63", strokeOpacity: "0.5" }
        ),
        jsxRuntime.jsx(
          "path",
          { d: "M76 268H274V375H76Z", stroke: "#D4AC63", strokeOpacity: "0.5" }
        ),
        jsxRuntime.jsx(
          "path",
          {
            d: "M84 220V175A91 91 0 0 1 266 175V220Z",
            stroke: "#D4AC64",
            strokeOpacity: "0.22",
            strokeWidth: "0.75"
          }
        ),
        jsxRuntime.jsx(
          "path",
          {
            d: "M84 276H266V367H84Z",
            stroke: "#D4AC64",
            strokeOpacity: "0.22",
            strokeWidth: "0.75"
          }
        ),
        jsxRuntime.jsx("path", { d: DOOR_OUTLINE_PATH, stroke: "#D4AC63", strokeWidth: "1.6" }),
        jsxRuntime.jsx(
          "rect",
          {
            x: "46",
            y: "190",
            width: "14",
            height: "30",
            rx: "2",
            stroke: "#D4AC63",
            strokeOpacity: "0.45",
            strokeWidth: "0.9"
          }
        ),
        jsxRuntime.jsx(
          "rect",
          {
            x: "46",
            y: "352",
            width: "14",
            height: "30",
            rx: "2",
            stroke: "#D4AC63",
            strokeOpacity: "0.45",
            strokeWidth: "0.9"
          }
        ),
        jsxRuntime.jsx(
          "circle",
          { cx: "53", cy: "198", r: "1.2", fill: "#D4AC63", fillOpacity: "0.5" }
        ),
        jsxRuntime.jsx(
          "circle",
          { cx: "53", cy: "212", r: "1.2", fill: "#D4AC63", fillOpacity: "0.5" }
        ),
        jsxRuntime.jsx(
          "circle",
          { cx: "53", cy: "360", r: "1.2", fill: "#D4AC63", fillOpacity: "0.5" }
        ),
        jsxRuntime.jsx(
          "circle",
          { cx: "53", cy: "374", r: "1.2", fill: "#D4AC63", fillOpacity: "0.5" }
        ),
        jsxRuntime.jsx(
          "rect",
          {
            x: "278",
            y: "226",
            width: "22",
            height: "66",
            rx: "11",
            stroke: "#D4AC63",
            strokeOpacity: "0.45"
          }
        ),
        jsxRuntime.jsx("circle", { cx: "289", cy: "272", r: "13", fill: "url(#keyhole-light)" }),
        jsxRuntime.jsx("circle", { cx: "289", cy: "271", r: "3", fill: "#F3DFA8" }),
        jsxRuntime.jsx("path", { d: "M286.2 273.8L285 280H293L291.8 273.8Z", fill: "#F3DFA8" }),
        jsxRuntime.jsx(
          "circle",
          { cx: "289", cy: "245", r: "9", stroke: "#D4AC63", strokeOpacity: "0.55" }
        ),
        jsxRuntime.jsx("circle", { cx: "289", cy: "245", r: "5.8", fill: "url(#knob-face)" }),
        jsxRuntime.jsx(
          "circle",
          { cx: "287", cy: "243", r: "1.8", fill: "#F3DFA8", fillOpacity: "0.5" }
        ),
        jsxRuntime.jsxs(
          "defs",
          { children: [
            jsxRuntime.jsxs(
              "filter",
              {
                id: "door-glow",
                x: "0",
                y: "0",
                width: "350",
                height: "479",
                filterUnits: "userSpaceOnUse",
                colorInterpolationFilters: "sRGB",
                children: [
                  jsxRuntime.jsx(
                    "feMorphology",
                    { radius: "14", operator: "erode", in: "SourceAlpha" }
                  ),
                  jsxRuntime.jsx("feGaussianBlur", { stdDeviation: "30" }),
                  jsxRuntime.jsx(
                    "feColorMatrix",
                    {
                      type: "matrix",
                      values: "0 0 0 0 0.831 0 0 0 0 0.675 0 0 0 0 0.392 0 0 0 0.35 0"
                    }
                  )
                ]
              }
            ),
            jsxRuntime.jsxs(
              "linearGradient",
              {
                id: "door-fill",
                x1: "175",
                y1: "46",
                x2: "175",
                y2: "433",
                gradientUnits: "userSpaceOnUse",
                children: [
                  jsxRuntime.jsx("stop", { stopColor: "#D4AC64", stopOpacity: "0.16" }),
                  jsxRuntime.jsx(
                    "stop",
                    { offset: "0.48", stopColor: "#D4AC64", stopOpacity: "0.035" }
                  ),
                  jsxRuntime.jsx(
                    "stop",
                    { offset: "1", stopColor: "#D4AC64", stopOpacity: "0.09" }
                  )
                ]
              }
            ),
            jsxRuntime.jsxs(
              "radialGradient",
              {
                id: "knob-face",
                cx: "0.34",
                cy: "0.3",
                r: "0.78",
                children: [
                  jsxRuntime.jsx("stop", { stopColor: "#F3DFA8" }),
                  jsxRuntime.jsx("stop", { offset: "0.45", stopColor: "#D4AC63" }),
                  jsxRuntime.jsx("stop", { offset: "1", stopColor: "#8A6524" })
                ]
              }
            ),
            jsxRuntime.jsxs(
              "radialGradient",
              {
                id: "keyhole-light",
                cx: "0.5",
                cy: "0.5",
                r: "0.5",
                children: [
                  jsxRuntime.jsx("stop", { stopColor: "#F3DFA8", stopOpacity: "0.5" }),
                  jsxRuntime.jsx("stop", { offset: "1", stopColor: "#F3DFA8", stopOpacity: "0" })
                ]
              }
            )
          ] }
        )
      ]
    }
  );
}
function Doorway() {
  return jsxRuntime.jsxs(
    "svg",
    {
      width: "350",
      height: "479",
      viewBox: "0 0 350 479",
      fill: "none",
      "aria-hidden": "true",
      children: [
        jsxRuntime.jsx("path", { d: DOOR_PANEL_PATH, fill: "url(#doorway-light)" }),
        jsxRuntime.jsx("path", { d: DOOR_OUTLINE_PATH, stroke: "#D4AC63" }),
        jsxRuntime.jsxs(
          "defs",
          { children: [jsxRuntime.jsxs(
            "radialGradient",
            {
              id: "doorway-light",
              cx: "0.5",
              cy: "0.62",
              r: "0.62",
              children: [
                jsxRuntime.jsx("stop", { stopColor: "#F3DFA8", stopOpacity: "0.62" }),
                jsxRuntime.jsx(
                  "stop",
                  { offset: "0.55", stopColor: "#D4AC64", stopOpacity: "0.24" }
                ),
                jsxRuntime.jsx("stop", { offset: "1", stopColor: "#D4AC64", stopOpacity: "0" })
              ]
            }
          )] }
        )
      ]
    }
  );
}
const TERMINAL_FACTS = [
  { label: "Date", value: `${EVENT.date}, ${EVENT.year}` },
  { label: "Venue", value: EVENT.venue },
  { label: "Doors", value: EVENT.doors },
  { label: "Last call", value: EVENT.lastCall }
];
function TerminalSection() {
  const scope = React.useRef(null);
  return useGSAP(() => {
    gsap.matchMedia().add(MOTION_OK, () => {
      window.__reboundxDoor = gsap.timeline({ defaults: { ease: easeTurn }, paused: true }).to(
        ".terminal__leaf",
        { rotateY: -62, transformOrigin: "left center", duration: 1.8 }
      ).to(".terminal__doorway", { autoAlpha: 1, duration: 1.4 }, 0.1);
    });
  },
    { scope: scope }),
    jsxRuntime.jsx(
      "section",
      {
        className: "section section--terminal",
        id: "terminal",
        ref: scope,
        children: jsxRuntime.jsxs(
          "div",
          {
            className: "shell terminal",
            children: [
              jsxRuntime.jsxs(
                "div",
                {
                  className: "terminal__door",
                  children: [
                    jsxRuntime.jsx(
                      "div",
                      { className: "terminal__doorway", children: jsxRuntime.jsx(Doorway, {}) }
                    ),
                    jsxRuntime.jsx(
                      "div",
                      { className: "terminal__leaf", children: jsxRuntime.jsx(DoorLeaf, {}) }
                    )
                  ]
                }
              ),
              jsxRuntime.jsxs(
                "div",
                {
                  className: "terminal__copy",
                  children: [
                    jsxRuntime.jsxs(
                      "div",
                      {
                        className: "terminal__head",
                        children: [
                          jsxRuntime.jsxs(
                            "div",
                            {
                              className: "section-head",
                              children: [
                                jsxRuntime.jsx(
                                  "p",
                                  {
                                    className: "section-eyebrow label",
                                    children: "Trading Competition"
                                  }
                                ),
                                jsxRuntime.jsx(
                                  "h2",
                                  { className: "section-title", children: "The Hidden Door" }
                                ),
                                jsxRuntime.jsx(
                                  "p",
                                  {
                                    className: "terminal__lede body-kr",
                                    children: __t(
                                      "실시간 트레이딩 대회는 ReboundX 터미널에서 진행됩니다.",
                                      "The live trading competition runs on the ReboundX terminal."
                                    )
                                  }
                                )
                              ]
                            }
                          ),
                          jsxRuntime.jsx(
                            "div",
                            {
                              className: "cta",
                              children: jsxRuntime.jsxs(
                                "a",
                                {
                                  className: "drink-me",
                                  href: TERMINAL_URL,
                                  target: "_blank",
                                  rel: "noopener noreferrer",
                                  children: [
                                    jsxRuntime.jsx(
                                      "span",
                                      {
                                        className: "drink-me__label display",
                                        children: "Drink Me!"
                                      }
                                    ),
                                    jsxRuntime.jsx(
                                      "span",
                                      { className: "drink-me__sub label", children: "Open →" }
                                    )
                                  ]
                                }
                              )
                            }
                          )
                        ]
                      }
                    ),
                    jsxRuntime.jsx(
                      "dl",
                      {
                        className: "essentials",
                        children: TERMINAL_FACTS.map(({ label: a2, value: s }) => jsxRuntime.jsxs(
                          "div",
                          {
                            className: "essentials__row",
                            children: [
                              jsxRuntime.jsx(
                                "dt",
                                { className: "essentials__label label", children: a2 }
                              ),
                              jsxRuntime.jsx(
                                "dd",
                                { className: "essentials__value display", children: s }
                              )
                            ]
                          },
                          a2
                        ))
                      }
                    )
                  ]
                }
              )
            ]
          }
        )
      }
    );
}
function WonderlandPage() {
  return jsxRuntime.jsxs(
    "div",
    {
      className: "page",
      children: [
        jsxRuntime.jsx(SiteHeader, {}),
        jsxRuntime.jsxs(
          "main",
          { children: [
            jsxRuntime.jsx(HeroSection, {}),
            jsxRuntime.jsx(LineupSection, {}),
            jsxRuntime.jsx(TimetableSection, {}),
            jsxRuntime.jsx(TerminalSection, {})
          ] }
        ),
        jsxRuntime.jsx(SiteFooter, {})
      ]
    }
  );
}
createRoot(document.getElementById("root")).render(jsxRuntime.jsx(
  React.StrictMode,
  { children: jsxRuntime.jsx(WonderlandPage, {}) }
));
