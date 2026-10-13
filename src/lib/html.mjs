import { esc } from './util.mjs';
import * as S from './schema.mjs';

export const ASSET_V = '1';

/**
 * 공통 뼈대.
 *   head  — SEO·GEO 메타 + JSON-LD
 *   푸터  — 네이버 C랭크 네 신호(출처·최신성·수집 경로·정보량) + AI 활용 고지
 *
 * ★전화번호는 **telBtn() 으로만** 찍는다. 번호가 맨몸으로 적힌 자리가 생기면 안 된다.
 *   버튼에 '안심번호'라는 말은 넣지 않는다 — 라벨은 '예약 문의' 하나다.
 *   번호의 성격은 이용약관과 개인정보처리방침에 적어 둔다.
 */
export function layout(ctx, opts) {
  const { cfg, siteUrl, latestPosts } = ctx;
  const {
    path, title, desc, h1, body, jsonld = [], geo, crumbs = [],
    noindex = false, pageKind = '',
  } = opts;
  const url = `${siteUrl}${path}`;
  const graph = S.graph([
    S.organization(cfg, siteUrl),
    S.website(cfg, siteUrl),
    crumbs.length ? S.breadcrumb(url, crumbs) : null,
    S.webpage({ url, siteUrl, title, desc, breadcrumbId: crumbs.length ? `${url}#crumb` : null }),
    ...jsonld,
  ]);

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
${cfg.naverVerification ? `<meta name="naver-site-verification" content="${esc(cfg.naverVerification)}"/>` : ''}
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1'}">
<meta name="format-detection" content="telephone=yes">
<meta name="author" content="${esc(cfg.brand.ko)}">
<meta name="theme-color" content="#15171B">
${geo ? `<meta name="geo.region" content="${esc(geo.iso)}">
<meta name="geo.placename" content="${esc(geo.placename)}">
<meta name="geo.position" content="${geo.lat};${geo.lng}">
<meta name="ICBM" content="${geo.lat}, ${geo.lng}">` : '<meta name="geo.region" content="KR">'}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(cfg.brand.ko)} 출장마사지">
<meta property="og:locale" content="ko_KR">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${siteUrl}/assets/og.svg">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
<link rel="alternate" type="application/rss+xml" title="${esc(cfg.rssTitle)}" href="${siteUrl}/rss.xml">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/favicon.svg">
<link rel="manifest" href="/site.webmanifest">
<link rel="stylesheet" href="/assets/knot.css?v=${ASSET_V}">
<script type="application/ld+json">${graph}</script>
</head>
<body data-kind="${pageKind}">
<a class="jump" href="#main">본문으로 건너뛰기</a>
${header(ctx, path)}
${crumbs.length > 1 ? crumbHtml(crumbs) : ''}
<main id="main">
<h1 class="ttl">${h1}</h1>
${body}
</main>
${footer(ctx, latestPosts)}
${bottomBar(cfg)}
<script src="/assets/knot.js?v=${ASSET_V}" defer></script>
</body>
</html>`;
}

/* ── 예약 문의 버튼 ────────────────────────────────────────────────
   겉은 버튼이지만 `<a href="tel:">` 로 둔다. <button> 이면 스크립트 없이는
   아무 일도 안 일어나고, 누르는 즉시 통화로 넘어가야 하기 때문이다.
   size: s(머리띠) · m(본문) · l(대문·아래 바) */
export function telBtn(cfg, { size = 'm', block = false } = {}) {
  return `<a class="kb kb-${size}${block ? ' kb-f' : ''}" href="tel:${cfg.telRaw}">
  <span class="kb-tie" aria-hidden="true">${phoneMark()}</span>
  <span class="kb-tx"><span class="kb-lb">${esc(cfg.telLabel)}</span><span class="kb-nm">${esc(cfg.tel)}</span></span>
</a>`;
}

/** 머리띠 — 상호·운영 표시·버튼을 한 줄에, 메뉴는 칸 지른 탭으로 */
function header(ctx, path) {
  const { cfg } = ctx;
  const on = (p) => (path === p || (p !== '/' && path.startsWith(p)) ? ' aria-current="page"' : '');
  const menu = [['/area/', '받는 자리'], ['/course/', '코스'], ['/price/', '금액'], ['/guide/', '이용안내'], ['/magazine/', '노트']];
  return `<header class="top">
  <div class="top-in">
    <a class="sig" href="/" aria-label="${esc(cfg.brand.ko)} 처음으로">
      ${knotMark()}<span class="sig-t"><b>${esc(cfg.brand.ko)}</b><i>${esc(cfg.brand.en)}</i></span>
    </a>
    <div class="top-r">
      <p class="top-run"><span>${esc(cfg.hours)}</span><span>${esc(cfg.pay)}</span></p>
      ${telBtn(cfg, { size: 's' })}
    </div>
  </div>
</header>
<nav class="nav" aria-label="주요 메뉴"><ul>${menu.map(([h, t]) => `<li><a href="${h}"${on(h)}>${t}</a></li>`).join('')}</ul></nav>`;
}

function crumbHtml(crumbs) {
  return `<nav class="path" aria-label="현재 위치"><ol>${crumbs
    .map((c, i) => (i === crumbs.length - 1
      ? `<li><span aria-current="page">${esc(c.name)}</span></li>`
      : `<li><a href="${c.url.replace(/^https?:\/\/[^/]+/, '')}">${esc(c.name)}</a></li>`))
    .join('')}</ol></nav>`;
}

/** 푸터 = 출처·최신성·수집 경로·정보량 네 신호 + AI 고지. **한 줄로 쌓는다**. */
function footer(ctx, latestPosts = []) {
  const { cfg, regions, counts, data, updated } = ctx;
  const b = cfg.business;
  const biz = [
    b.name ? `상호 ${esc(b.name)}` : '',
    b.owner ? `대표 ${esc(b.owner)}` : '',
    b.regNo ? `사업자등록번호 ${esc(b.regNo)}` : '',
    b.address ? `주소 ${esc(b.address)}` : '',
    b.privacyOfficer ? `개인정보 책임자 ${esc(b.privacyOfficer)}` : '',
    b.email ? `문의 ${esc(b.email)}` : '',
  ].filter(Boolean).join(' · ');
  const main = regions.filter((r) => r.main);
  const sub = regions.filter((r) => !r.main);

  return `<footer class="foot">
  <div class="foot-in">
    <section>
      <p class="fz-nm">${esc(cfg.brand.ko)}</p>
      <p class="fz-say">가게 자리를 두지 않습니다. 부르시면 관리사가 그 주소로 움직입니다. 쪽을 낸 단위는 시군구 ${counts.gu}곳과 동·읍 ${counts.spot}곳이며, 받는 창구는 아래 번호 하나입니다.</p>
      ${telBtn(cfg, { size: 'm' })}
      <p class="fz-run">${esc(cfg.hours)} · ${esc(cfg.pay)} · 미리 보내실 돈 없음</p>
    </section>
    <nav aria-label="지역 바로가기">
      <p class="fz-h">동읍까지</p>
      <ul class="fz-chip">${main.map((r) => `<li><a href="/${r.slug}/">${r.name}</a></li>`).join('')}</ul>
      <p class="fz-h">시군구까지</p>
      <ul class="fz-chip">${sub.map((r) => `<li><a href="/${r.slug}/">${r.name}</a></li>`).join('')}</ul>
      <p class="fz-sm"><a href="/area/">받는 자리 모두 보기</a> · 면 ${counts.myeon}곳은 이름만 올렸습니다</p>
    </nav>
    <div class="fz-row">
      <nav aria-label="안내 문서">
        <p class="fz-h">문서</p>
        <ul class="fz-ul">
          <li><a href="/guide/">이용안내</a></li>
          <li><a href="/price/">금액</a></li>
          <li><a href="/course/">코스</a></li>
          <li><a href="/company/">소개</a></li>
          <li><a href="/terms/">이용약관</a></li>
          <li><a href="/privacy/">개인정보처리방침</a></li>
        </ul>
      </nav>
      <nav aria-label="최근 글">
        <p class="fz-h">최근 노트</p>
        <ul class="fz-ul">${latestPosts.slice(0, 3).map((p) => `<li><a href="${p.path}">${esc(p.title)}</a><time datetime="${p.date}">${p.date}</time></li>`).join('')}</ul>
      </nav>
      <nav aria-label="수집 경로">
        <p class="fz-h">수집 경로</p>
        <ul class="fz-ul">
          <li><a href="/rss.xml">RSS</a></li>
          <li><a href="/sitemap.xml">사이트맵</a></li>
          <li><a href="/llms.txt">llms.txt</a></li>
        </ul>
        <p class="fz-sm">마지막 손질 <time datetime="@@LM@@">@@LM@@</time></p>
      </nav>
    </div>
  </div>
  <div class="foot-end"><div>
    ${biz ? `<p class="fz-biz">${biz}</p>` : '<p class="fz-biz fz-dim">사업자 정보는 확인되는 대로 이 줄에 적습니다.</p>'}
    <p class="fz-ai">지역 설명에 쓰인 매듭 수와 넓이는 공개된 경계 자료를 직접 계산해 뽑았고, 문장은 <strong>AI 도구의 도움을 받아 쓴 뒤</strong> 사람이 다시 읽고 고쳤습니다. 후기·체험담·평점을 싣지 않으며 사람 사진도 올리지 않습니다. 경계 자료 출처: ${esc(data.source)}</p>
    <p class="fz-cr">© ${esc(updated.slice(0, 4))} ${esc(cfg.brand.ko)}. 질병을 다루는 의료 행위가 아니고, 성적 서비스를 제공하지 않습니다.</p>
  </div></div>
</footer>`;
}

/** 손바닥 화면 아래에 붙는 바 */
function bottomBar(cfg) {
  return `<div class="bar">
  ${telBtn(cfg, { size: 'l', block: true })}
  <span class="bar-s">문 앞까지 ${esc(cfg.arrive)}</span>
</div>`;
}

/** 상호 표시 — 두 줄이 한 번 꼬인 매듭. 달·호·문·결·마루널·마디와 겹치지 않는 모양. */
export function knotMark() {
  return `<svg class="kmk" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M4 8c6 0 6 8 12 8s6-8 12-8M4 24c6 0 6-8 12-8s6 8 12 8" stroke-width="2.6" stroke-linecap="round"/></svg>`;
}
function phoneMark() {
  return `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="M4.2 1.6 6 1.2l1.5 3.3-1.6 1.2c.6 1.7 2 3.1 3.7 3.7l1.2-1.6 3.3 1.5-.4 1.8c-.2.8-.9 1.3-1.7 1.2C7.6 11.8 4.1 8.3 3 3.3c-.1-.8.4-1.5 1.2-1.7Z" fill="none" stroke-width="1.3" stroke-linejoin="round"/></svg>`;
}
/** 섹션 머리에 거는 작은 매듭 */
function tieMark() {
  return `<svg class="tie-x" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M4 8c6 0 6 8 12 8s6-8 12-8M4 24c6 0 6-8 12-8s6 8 12 8" stroke-width="3" stroke-linecap="round"/></svg>`;
}

/**
 * 섹션 틀 — 왼쪽에 **엮인 두 줄**이 서고 그 옆에 라벨·제목이 붙는다.
 *   ⧓  LABEL 03
 *      큰 제목
 *      ─────────
 */
export function tie(id, label, h2, inner, sub, n) {
  return `<section class="tie" id="${id}" aria-labelledby="${id}-h">
  <header class="tie-h">
    ${tieMark()}
    <div class="tie-t">
      <p class="tie-lb" aria-hidden="true">${esc(label)}${n ? `<em>${n}</em>` : ''}</p>
      <h2 id="${id}-h">${h2}</h2>
      ${sub ? `<p class="tie-sb">${sub}</p>` : ''}
    </div>
  </header>
  <div class="tie-b">${inner}</div>
</section>`;
}
