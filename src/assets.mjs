import fs from 'node:fs';
import path from 'node:path';

/**
 * 손으로 쓴 CSS·JS·SVG. 빌드 도구를 쓰지 않고 바깥 글꼴·바깥 스크립트도 쓰지 않는다.
 *
 * ★무늬는 **엮인 두 줄(매듭)**이다. 섹션 머리마다 두 선이 한 번 꼬이고, 꼬인 자리에
 *   라벨이 걸린다. 앞선 여섯 사이트와 겹치지 않는 축을 잡은 것이다.
 *     루네사       둥근 점머리 · 알약 버튼 · 밤 네이비+금빛
 *     리바이브모션 눈금 레일 · 각진 판 · 뼈색+녹슨 주황
 *     세린터치     대괄호 머리표 · 점선 가름 · 크림+숲 녹색
 *     벨벳럽       굵은 괘선 · 큰 순번 · 흰 바탕+진홍
 *     마루온       모눈 바탕 · 모서리 꺾쇠 · 회청+파랑
 *     바이탈리즈   세로축 관통 · 동그란 마디 · 연보라+보라
 *   ★여기만 **어두운 바탕**을 쓴다(루네사는 남색, 이쪽은 중성 흑연빛에 시트론).
 * ★스크립트에 무작위가 없다. 같은 주소면 언제 들어와도 같은 화면이어야 한다.
 */
export const THEME = {
  paper: '#15171B', card: '#1E2127', soft: '#262A31',
  ink: '#ECEFF2', dim: '#A2AAB4',
  acc: '#C6DE4F', accDk: '#D9ED6E', accSoft: '#2F3521',
  line: '#343A43', warn: '#F0A05A',
};

const CSS = (t) => `:root{
  --paper:${t.paper};--card:${t.card};--soft:${t.soft};--ink:${t.ink};--dim:${t.dim};
  --acc:${t.acc};--accDk:${t.accDk};--accSoft:${t.accSoft};--line:${t.line};--warn:${t.warn};
  --w:1080px;
  --sans:system-ui,-apple-system,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif;
  --mono:ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace;
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;font-family:var(--sans);color:var(--ink);background:var(--paper);
  line-height:1.8;font-size:16px;letter-spacing:-.005em;padding-bottom:86px}
@media (min-width:880px){body{padding-bottom:0}}
img,svg{max-width:100%}
a{color:var(--acc);text-decoration:none}
a:hover{text-decoration:underline}
:focus-visible{outline:2px solid var(--acc);outline-offset:3px}
strong{color:var(--accDk);font-weight:700}
.jump{position:absolute;left:-9999px}
.jump:focus{position:fixed;left:10px;top:10px;z-index:60;background:var(--acc);color:#15171B;padding:10px 16px;font-weight:800}

/* ── 머리띠 ────────────────────────────────────────── */
.top{border-bottom:1px solid var(--line);background:var(--card)}
.top-in{max-width:var(--w);margin:0 auto;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
.sig{display:inline-flex;align-items:center;gap:11px;color:var(--ink)}
.sig:hover{text-decoration:none}
.kmk{width:28px;height:28px;stroke:var(--acc);fill:none}
.sig-t b{display:block;font-size:19px;font-weight:800;letter-spacing:-.02em;line-height:1.1}
.sig-t i{display:block;font-style:normal;font-family:var(--mono);font-size:10px;letter-spacing:.22em;color:var(--dim)}
.top-r{display:flex;align-items:center;gap:13px;flex-wrap:wrap}
.top-run{margin:0;font-size:11px;color:var(--dim);text-align:right;line-height:1.5}
.top-run span{display:block}
.nav{border-bottom:1px solid var(--line)}
.nav ul{max-width:var(--w);margin:0 auto;padding:0 18px;list-style:none;display:flex;gap:0;overflow-x:auto}
.nav a{display:block;padding:11px 15px;font-size:14px;font-weight:700;color:var(--dim);white-space:nowrap;border-right:1px solid var(--line)}
.nav li:first-child a{border-left:1px solid var(--line)}
.nav a:hover{color:var(--acc);text-decoration:none;background:var(--soft)}
.nav a[aria-current]{color:#15171B;background:var(--acc)}

/* ── 빵부스러기 ────────────────────────────────────── */
.path{max-width:var(--w);margin:0 auto;padding:13px 18px 0}
.path ol{list-style:none;display:flex;flex-wrap:wrap;gap:7px;margin:0;padding:0;font-size:12px;color:var(--dim);font-family:var(--mono)}
.path li+li::before{content:"/";margin-right:7px;color:var(--line)}
.path a{color:var(--dim)}

/* ── 본문 ──────────────────────────────────────────── */
main{max-width:var(--w);margin:0 auto;padding:20px 18px 60px}
.ttl{font-size:27px;font-weight:800;letter-spacing:-.03em;line-height:1.3;margin:6px 0 20px}
@media (min-width:720px){.ttl{font-size:34px}}
.ttl-s{display:block;margin-top:9px;font-size:14px;font-weight:600;color:var(--dim);letter-spacing:-.01em}
.lead{border-left:3px solid var(--acc);padding:2px 0 2px 17px;margin:0 0 30px}
.lead p{margin:0 0 .85em;color:var(--ink)}
.lead p:last-child{margin-bottom:0}

/* ── 섹션 = 엮인 두 줄 ─────────────────────────────── */
.tie{margin:0 0 34px;padding-top:4px}
.tie-h{display:flex;align-items:flex-start;gap:13px;margin:0 0 15px}
.tie-x{flex:none;width:24px;height:24px;margin-top:5px;stroke:var(--acc);fill:none;opacity:.95}
.tie-t{min-width:0;flex:1}
.tie-lb{margin:0 0 3px;font-family:var(--mono);font-size:10px;letter-spacing:.26em;color:var(--dim);text-transform:uppercase}
.tie-lb em{font-style:normal;color:var(--acc);margin-left:7px}
.tie h2{margin:0;font-size:19px;font-weight:800;letter-spacing:-.02em;line-height:1.38}
@media (min-width:720px){.tie h2{font-size:21px}}
.tie-sb{margin:8px 0 0;font-size:14px;color:var(--dim)}
.tie-b{border-top:1px solid var(--line);padding-top:16px}
.tie-tail{margin:14px 0 0;font-size:13px;color:var(--dim)}

/* ── 실측 표 ───────────────────────────────────────── */
.tbl{width:100%;border-collapse:collapse;font-size:14.5px}
.tbl th,.tbl td{border-bottom:1px solid var(--line);padding:11px 2px;text-align:left;vertical-align:top}
.tbl th{width:38%;font-weight:700;color:var(--dim);font-size:13px}
@media (min-width:600px){.tbl th{width:28%}}

/* ── 코스 ──────────────────────────────────────────── */
.grid{list-style:none;margin:0;padding:0;display:grid;gap:11px}
@media (min-width:600px){.grid{grid-template-columns:1fr 1fr}}
.grid>li{border:1px solid var(--line);background:var(--card);padding:14px 15px}
.grid a{display:block;color:var(--ink)}
.grid a:hover{text-decoration:none}
.grid a:hover .g-k{color:var(--acc)}
.g-k{display:block;font-size:16px;font-weight:800;letter-spacing:-.02em}
.g-v{display:block;margin-top:5px;font-family:var(--mono);font-size:15px;color:var(--acc)}
.g-v i{font-style:normal;font-size:12px;color:var(--dim);margin-left:4px}
.g-p{display:block;margin-top:4px;font-size:12px;color:var(--dim)}
.g-d{margin:10px 0 0;font-size:13px;color:var(--dim);border-top:1px dashed var(--line);padding-top:9px}

/* ── 순서 ──────────────────────────────────────────── */
.steps{list-style:none;margin:0;padding:0;counter-reset:st}
.steps li{position:relative;padding:0 0 16px 46px;margin:0 0 16px;border-bottom:1px solid var(--line)}
.steps li:last-child{border-bottom:0;padding-bottom:0;margin-bottom:0}
.steps li::before{counter-increment:st;content:counter(st,decimal-leading-zero);position:absolute;left:0;top:1px;
  font-family:var(--mono);font-size:13px;font-weight:700;color:var(--acc);border:1px solid var(--line);padding:2px 6px}
.steps h3{margin:0 0 5px;font-size:15px;font-weight:800}
.steps p{margin:0;font-size:14px;color:var(--dim)}

/* ── 묻고 답하기 ───────────────────────────────────── */
.qa{display:grid;gap:0}
.qa-i{border-top:1px solid var(--line);padding:15px 0}
.qa-i:first-child{border-top:0;padding-top:0}
.qa-n{display:inline-block;font-family:var(--mono);font-size:11px;color:var(--acc);margin-bottom:5px;letter-spacing:.12em}
.qa-q{margin:0 0 7px;font-size:16px;font-weight:800;letter-spacing:-.02em}
.qa-a{margin:0;font-size:14.5px;color:var(--dim)}

/* ── 유의 ──────────────────────────────────────────── */
.marks{list-style:none;margin:0;padding:0;display:grid;gap:10px}
.marks li{position:relative;padding-left:20px;font-size:14px;color:var(--dim)}
.marks li::before{content:"";position:absolute;left:0;top:11px;width:9px;height:9px;border:2px solid var(--acc);transform:rotate(45deg)}

/* ── 목록·링크 ─────────────────────────────────────── */
.rail{list-style:none;margin:0;padding:0;display:grid;gap:7px;font-size:14px}
@media (min-width:560px){.rail{grid-template-columns:1fr 1fr}}
@media (min-width:860px){.rail{grid-template-columns:1fr 1fr 1fr}}
.rail a{display:block;padding:7px 10px;border:1px solid var(--line);color:var(--ink);background:var(--card)}
.rail a:hover{border-color:var(--acc);color:var(--acc);text-decoration:none}
.idx{list-style:none;margin:0;padding:0;display:grid;gap:6px}
@media (min-width:560px){.idx{grid-template-columns:1fr 1fr}}
@media (min-width:880px){.idx{grid-template-columns:1fr 1fr 1fr}}
.idx a{display:flex;justify-content:space-between;align-items:baseline;gap:8px;padding:9px 11px;border:1px solid var(--line);color:var(--ink)}
.idx a:hover{border-color:var(--acc);text-decoration:none}
.idx .cur a,.idx a[aria-current]{border-color:var(--acc);background:var(--accSoft)}
.i-n{font-weight:700;font-size:14.5px}
.i-m{font-family:var(--mono);font-size:11px;color:var(--dim);white-space:nowrap}
.nmz{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:6px}
.nmz li{border:1px solid var(--line);padding:4px 10px;font-size:13px;color:var(--dim)}
.nbr{list-style:none;margin:0;padding:0;display:grid;gap:6px}
@media (min-width:560px){.nbr{grid-template-columns:1fr 1fr}}
.nbr a{display:flex;justify-content:space-between;gap:8px;padding:9px 11px;border:1px solid var(--line);color:var(--ink)}
.nbr a:hover{border-color:var(--acc);text-decoration:none}
.nbr span{font-size:11px;color:var(--dim);font-family:var(--mono)}

/* ── 견주기 표 ─────────────────────────────────────── */
.cmp{width:100%;border-collapse:collapse;font-size:14px}
.cmp th,.cmp td{border:1px solid var(--line);padding:9px 10px;text-align:left}
.cmp thead th{background:var(--soft);font-size:12px;color:var(--dim);font-weight:700}
.cmp tbody tr.cur{background:var(--accSoft)}
.cmp tbody tr.cur th{color:var(--acc)}

/* ── 예약 문의 ─────────────────────────────────────── */
.kb{display:inline-flex;align-items:stretch;gap:0;border:2px solid var(--acc);background:transparent;color:var(--ink);
  text-decoration:none;font-family:var(--sans)}
.kb:hover{text-decoration:none;background:var(--accSoft)}
.kb-tie{flex:none;display:flex;align-items:center;justify-content:center;padding:0 9px;background:var(--acc)}
.kb-tie svg{width:15px;height:15px;stroke:#15171B;fill:none}
.kb-tx{display:flex;flex-direction:column;justify-content:center;padding:7px 14px;min-width:0}
.kb-lb{font-size:10px;letter-spacing:.2em;color:var(--acc);font-family:var(--mono)}
.kb-nm{font-family:var(--mono);font-weight:700;letter-spacing:.02em;white-space:nowrap}
.kb-s .kb-nm{font-size:15px}
.kb-m .kb-nm{font-size:18px}
.kb-l .kb-nm{font-size:21px}
.kb-l .kb-tx{padding:10px 18px}
.kb-f{display:flex;width:100%}
.kb-f .kb-tx{flex:1}
.cta{border:1px solid var(--line);background:var(--card);padding:20px 18px;margin:0 0 34px}
.cta-p{margin:0 0 14px;font-size:15px}
.cta-s{margin:12px 0 0;font-size:12.5px;color:var(--dim);font-family:var(--mono)}

/* ── 대문 ──────────────────────────────────────────── */
.hero{border:1px solid var(--line);border-top:3px solid var(--acc);background:var(--card);padding:26px 20px;margin:0 0 34px}
.hero-sl{margin:0 0 12px;font-size:20px;font-weight:800;letter-spacing:-.03em;color:var(--accDk)}
@media (min-width:720px){.hero-sl{font-size:25px}}
.hero-p{margin:0 0 18px;color:var(--dim);font-size:15px}
.hero-f{display:grid;gap:12px;margin:20px 0 0;padding:16px 0 0;border-top:1px solid var(--line)}
@media (min-width:600px){.hero-f{grid-template-columns:1fr 1fr 1fr 1fr}}
.hero-f div{min-width:0}
.hero-f dt{font-family:var(--mono);font-size:14px;font-weight:700;color:var(--acc)}
.hero-f dd{margin:3px 0 0;font-size:12.5px;color:var(--dim)}
.two{display:grid;gap:22px}
@media (min-width:760px){.two{grid-template-columns:1fr 1fr}}
.two-h{margin:0 0 10px;font-size:13px;font-weight:800;letter-spacing:.06em;color:var(--acc);font-family:var(--mono)}
.two-ul{list-style:none;margin:0;padding:0;display:grid;gap:7px}
.two-ul a{display:flex;justify-content:space-between;gap:8px;align-items:baseline;padding:10px 12px;border:1px solid var(--line);background:var(--card);color:var(--ink)}
.two-ul a:hover{border-color:var(--acc);text-decoration:none}
.two-ul b{font-size:15px}
.two-ul span{font-size:11px;color:var(--dim);font-family:var(--mono)}
.thin a{padding:7px 10px}

/* ── 글 ────────────────────────────────────────────── */
.post{max-width:46rem}
.post h2{margin:30px 0 12px;font-size:19px;font-weight:800;border-left:3px solid var(--acc);padding-left:12px}
.post p{margin:0 0 1em}
.post ul{margin:0 0 1em;padding-left:1.1em;color:var(--dim)}
.plist{list-style:none;margin:0;padding:0;display:grid;gap:11px}
.plist a{display:block;border:1px solid var(--line);background:var(--card);padding:14px 15px;color:var(--ink)}
.plist a:hover{border-color:var(--acc);text-decoration:none}
.plist b{display:block;font-size:16px;font-weight:800;margin-bottom:5px}
.plist p{margin:0;font-size:13.5px;color:var(--dim)}
.plist time{display:block;margin-top:7px;font-family:var(--mono);font-size:11px;color:var(--acc)}
.doc h2{margin:28px 0 10px;font-size:17px;font-weight:800;color:var(--accDk)}
.doc p,.doc li{font-size:14.5px;color:var(--dim)}
.doc ul,.doc ol{padding-left:1.2em;margin:0 0 1em}

/* ── 푸터 — 한 줄로 쌓는다 ─────────────────────────── */
.foot{border-top:1px solid var(--line);background:var(--card);margin-top:34px}
.foot-in{max-width:var(--w);margin:0 auto;padding:30px 18px 24px;display:grid;gap:26px}
.fz-h{margin:0 0 10px;font-family:var(--mono);font-size:10px;letter-spacing:.26em;color:var(--acc)}
.fz-nm{margin:0 0 8px;font-size:18px;font-weight:800}
.fz-say{margin:0 0 14px;font-size:13.5px;color:var(--dim);max-width:44rem}
.fz-run{margin:12px 0 0;font-size:12px;color:var(--dim);font-family:var(--mono)}
.fz-chip{list-style:none;margin:0 0 12px;padding:0;display:flex;flex-wrap:wrap;gap:6px}
.fz-chip a{display:block;border:1px solid var(--line);padding:5px 11px;font-size:13px;color:var(--ink)}
.fz-chip a:hover{border-color:var(--acc);text-decoration:none}
.fz-row{display:grid;gap:22px}
@media (min-width:720px){.fz-row{grid-template-columns:1fr 1fr 1fr}}
.fz-ul{list-style:none;margin:0;padding:0;display:grid;gap:6px;font-size:13.5px}
.fz-ul time{display:block;font-family:var(--mono);font-size:10px;color:var(--dim)}
.fz-sm{margin:10px 0 0;font-size:12px;color:var(--dim)}
.foot-end{border-top:1px solid var(--line)}
.foot-end div{max-width:var(--w);margin:0 auto;padding:18px}
.fz-biz{margin:0 0 8px;font-size:12px;color:var(--dim)}
.fz-dim{opacity:.7}
.fz-ai{margin:0 0 8px;font-size:12px;color:var(--dim);line-height:1.7}
.fz-cr{margin:0;font-size:11.5px;color:var(--dim)}

/* ── 아래 고정 바 ──────────────────────────────────── */
.bar{position:fixed;left:0;right:0;bottom:0;z-index:40;background:var(--card);border-top:1px solid var(--line);
  padding:9px 14px calc(9px + env(safe-area-inset-bottom));display:flex;align-items:center;gap:11px;transition:transform .2s}
.bar.off{transform:translateY(130%)}
.bar-s{font-size:11px;color:var(--dim);white-space:nowrap;font-family:var(--mono)}
@media (min-width:880px){.bar{display:none}}
@media print{.bar,.nav,.cta{display:none}}
`;

const JS = `(function(){
  /* 푸터가 보이면 아래 고정 바를 내린다. 그 밖의 일은 하지 않는다 —
     화면을 흔드는 무작위를 넣지 않아야 같은 주소에서 같은 화면이 나온다. */
  var bar=document.querySelector('.bar'),ft=document.querySelector('.foot');
  if(!bar||!ft||!('IntersectionObserver' in window))return;
  new IntersectionObserver(function(es){
    es.forEach(function(e){bar.classList.toggle('off',e.isIntersecting);});
  },{rootMargin:'0px 0px -40px 0px'}).observe(ft);
})();`;

/* 매듭 — 두 줄이 한 번 꼬인 모양 */
const KNOT = 'M4 8c6 0 6 8 12 8s6-8 12-8M4 24c6 0 6-8 12-8s6 8 12 8';
const FAVICON = (t) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="${t.paper}"/><g stroke="${t.acc}" stroke-width="2.8" fill="none" stroke-linecap="round"><path d="${KNOT}"/></g></svg>`;

const LOGO = (t) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 48"><rect width="220" height="48" fill="${t.paper}"/><g stroke="${t.acc}" stroke-width="2.6" fill="none" stroke-linecap="round" transform="translate(8,8) scale(1)"><path d="${KNOT}"/></g><text x="50" y="27" font-family="system-ui,sans-serif" font-size="19" font-weight="800" fill="${t.ink}">블리스놋</text><text x="50" y="39" font-family="ui-monospace,monospace" font-size="9" letter-spacing="3" fill="${t.dim}">BLISSKNOT</text></svg>`;

const OG = (t, cfg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="${t.paper}"/>
<rect x="56" y="56" width="1088" height="518" fill="${t.card}" stroke="${t.line}" stroke-width="2"/>
<rect x="56" y="56" width="1088" height="8" fill="${t.acc}"/>
<g stroke="${t.acc}" stroke-width="9" fill="none" stroke-linecap="round" transform="translate(110,150) scale(3.6)"><path d="${KNOT}"/></g>
<text x="110" y="330" font-family="system-ui,sans-serif" font-size="56" font-weight="800" fill="${t.ink}">${cfg.brand.ko} 출장마사지 홈타이</text>
<text x="110" y="396" font-family="system-ui,sans-serif" font-size="31" fill="${t.dim}">${cfg.brand.slogan}</text>
<text x="110" y="444" font-family="ui-monospace,monospace" font-size="24" fill="${t.acc}">서울 · 인천 · 경기 · 부산 동읍까지 · ${cfg.hours} · ${cfg.pay}</text>
<rect x="110" y="478" width="440" height="72" fill="none" stroke="${t.acc}" stroke-width="4"/>
<rect x="110" y="478" width="52" height="72" fill="${t.acc}"/>
<text x="182" y="508" font-family="ui-monospace,monospace" font-size="16" letter-spacing="4" fill="${t.acc}">${cfg.telLabel}</text>
<text x="182" y="540" font-family="ui-monospace,monospace" font-size="28" font-weight="700" fill="${t.ink}">${cfg.tel}</text>
</svg>`;

export function writeAssets(dist, cfg) {
  const dir = path.join(dist, 'assets');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'knot.css'), CSS(THEME));
  fs.writeFileSync(path.join(dir, 'knot.js'), JS);
  fs.writeFileSync(path.join(dir, 'favicon.svg'), FAVICON(THEME));
  fs.writeFileSync(path.join(dir, 'logo.svg'), LOGO(THEME));
  fs.writeFileSync(path.join(dir, 'og.svg'), OG(THEME, cfg));
}
