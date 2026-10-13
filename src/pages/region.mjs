import { layout, tie } from '../lib/html.mjs';
import { esc, hash, km2, won, josa } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import {
  courseGrid, stepList, factTable, faqBlock, noticeBlock, longtail,
  knotKin, spotIndex, myeonList, dongNameList, guIndex, nearList, telCta,
} from '../lib/blocks.mjs';
import {
  SPOT_LEAD_A, SPOT_LEAD_A_EUP, SPOT_LEAD_A_ZERO, SPOT_LEAD_B, SPOT_LEAD_C,
  GU_LEAD, SIDO_LEAD_MAIN, SIDO_LEAD_SUB, SEC, knotWord, topWord, walkWord,
} from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

/** 리드·FAQ 틀에 넘기는 값 꾸러미. 전부 경계 자료를 세어 나온 사실이다. */
function spotCtx(ctx, sd, g, s) {
  const { cfg, courses } = ctx;
  const per = s.area ? s.knot / s.area : 0;
  return {
    sd, g, s,
    nm: s.name, gu: g.name, sido: sd.name, kind: s.kind,
    area: km2(s.area), knotN: s.knot, knotTop: s.knotTop, bigN: s.knotBig,
    knotRank: s.knotRank, parts: s.parts,
    knotWord: knotWord(s.knot), topNote: topWord(s.knotTop), walk: walkWord(s.area),
    denseWord: per > 4 ? '빽빽한 편입니다.' : per > 1.5 ? '보통입니다.' : '성긴 편입니다.',
    guSpotCount: g.spotCount,
    place: `${g.name} ${s.name}`,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((c) => c.price))),
  };
}

/* ── 동·읍 쪽 — 메인 네 시도에서만 낸다 ────────────────────────── */
export function spotPage(ctx, sd, g, s) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/${g.slug}/${s.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/${g.name}/${s.name}`;
  const h = hash(seed, 'spot');
  const c = spotCtx(ctx, sd, g, s);

  const poolA = s.knot === 0 ? SPOT_LEAD_A_ZERO : (s.kind === '읍' ? SPOT_LEAD_A_EUP : SPOT_LEAD_A);
  const lead = `<div class="lead">
  <p>${at(h, poolA, 0)(c)}</p>
  <p>${at(h, SPOT_LEAD_B, 1)(c)}</p>
  <p>${at(h, SPOT_LEAD_C, 2)(c)}</p>
</div>`;

  const facts = tie('fact', 'counted', `${esc(s.name)} 세어 본 값`,
    factTable([
      ['시도', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
      ['시군구', `<a href="/${sd.slug}/${g.slug}/">${esc(g.name)}</a>`],
      ['갈래', s.kind === '읍' ? '읍 — 군 안에서 사람과 가게가 가장 빽빽한 자리' : '행정동'],
      ['넓이', `${km2(s.area)} — ${esc(walkWord(s.area))}`],
      ['매듭', `${s.knot}군데 · ${esc(g.name)} 안에서 ${s.knotRank}번째`],
      ['가장 큰 매듭', s.knotTop ? `${s.knotTop}겹 — 한 점에 ${s.knotTop}곳이 모임` : '없음 — 셋이 만나는 점이 잡히지 않음'],
      ['네 겹 넘는 매듭', s.knotBig ? `${s.knotBig}군데` : '없음'],
      ['조각', s.parts > 1 ? `${s.parts}덩이 — 떨어진 조각도 같은 이름으로 받음` : '한 덩이'],
      ['받는 시각', `${esc(cfg.hours)} / 셈은 ${esc(cfg.pay)} / 현관까지 ${esc(cfg.arrive)}`],
    ]),
    esc(at(h, SEC.factSub, 7)), '00');

  const { html: faqHtml, qa } = faqBlock(seed, c, 5, '06');

  const pool = [];
  for (const r of regions) {
    if (r.slug === sd.slug) continue;
    if (r.main) for (const x of r.gu) for (const y of x.spots) pool.push({ label: `${x.name} ${y.name}`, href: `/${r.slug}/${x.slug}/${y.slug}/` });
    else for (const x of r.gu) pool.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }

  const body = [
    lead,
    facts,
    telCta(cfg, `${g.name} ${s.name}`, seed),
    courseGrid(courses, seed, s.name, '01'),
    knotKin(sd, g, s, seed, '02'),
    spotIndex(sd, g, seed, s.slug, '03'),
    stepList(seed, '04'),
    guIndex(sd, seed, g.slug, '05'),
    faqHtml,
    noticeBlock(seed, '07'),
    longtail(pool, seed, 24, 'elsewhere', esc(at(h, SEC.crossHead, 8)), null, '08'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.spot(sd, g, s),
      desc: clampDesc(desc.spot(sd, g, s)),
      h1: `${esc(g.name)} ${esc(s.name)} <span class="ttl-s">출장마사지 홈타이 — ${s.kind === '읍' ? '읍' : '동'} 한 칸까지 쪼갠 안내</span>`,
      body,
      pageKind: 'spot',
      geo: { iso: sd.iso, placename: `${sd.full} ${g.name} ${s.name}`, lat: s.lat, lng: s.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '받는 자리', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: g.name, url: `${siteUrl}/${sd.slug}/${g.slug}/` },
        { name: s.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, `${sd.full} ${g.name} ${s.name}`, { lat: s.lat, lng: s.lng },
          { area: s.area, containedIn: { '@type': 'AdministrativeArea', name: `${sd.full} ${g.name}` } }),
        S.service({
          siteUrl, url, cfg,
          name: `${g.name} ${s.name} 출장마사지 홈타이 방문`,
          desc: clampDesc(desc.spot(sd, g, s)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        S.faqPage(url, qa),
      ],
    }),
  };
}

/* ── 시군구 쪽 ────────────────────────────────────────────────── */
export function guPage(ctx, sd, g) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/${g.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/${g.name}`;
  const h = hash(seed, 'gu');

  const c = {
    sido: sd.name, name: g.name, gu: g.name, mainSite: g.main,
    unitW: g.main ? '동·읍' : '행정동',
    unitN: g.main ? g.spotCount : g.dongNames.length,
    spotCount: g.spotCount, dongCount: g.dongCount, myeonCount: g.myeonCount,
    area: km2(g.area), knotTotal: g.knotTotal, knotBigTotal: g.knotBigTotal,
    guKnot: g.guKnot, guKnotTop: g.guKnotTop,
    mostKnot: g.mostKnot || '', mostKnotN: g.mostKnotN || 0,
    leastKnot: g.leastKnot || '', leastKnotN: g.leastKnotN || 0,
    place: `${sd.name} ${g.name}`,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  // 같은 풀에서 둘을 뽑으므로 겹치지 않게 뒤 칸을 밀어 준다
  const i0 = parseInt(h.substr(0, 3), 16) % GU_LEAD.length;
  const i1 = (i0 + 1 + (parseInt(h.substr(9, 3), 16) % (GU_LEAD.length - 1))) % GU_LEAD.length;
  const lead = `<div class="lead">
  <p>${GU_LEAD[i0](c)}</p>
  <p>${GU_LEAD[i1](c)}</p>
</div>`;

  const rows = [
    ['시도', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
    ['행정동 합', `${g.dongCount}곳`],
    g.main ? ['쪽을 낸 동·읍', `${g.spotCount}곳`] : ['쪽을 낸 깊이', '시군구까지 — 동 이름은 이 쪽 목록에'],
    ['면', g.myeonCount ? `${g.myeonCount}곳 — 이름만 올림` : '없음'],
    ['넓이', km2(g.area)],
    ['안쪽 매듭', `모두 ${g.knotTotal}군데${g.knotBigTotal ? ` · 네 겹 넘는 것 ${g.knotBigTotal}군데` : ''}`],
    ['시군구 삼거리', g.guKnot ? `${g.guKnot}군데 — 시군구 ${g.guKnotTop}곳이 한 점에서 만남` : '없음'],
    ['받는 시각', `${esc(cfg.hours)} / 셈은 ${esc(cfg.pay)}`],
  ];
  if (g.main && g.mostKnot) {
    rows.splice(6, 0,
      ['매듭이 가장 많은 자리', `<a href="/${sd.slug}/${g.slug}/${g.mostKnotSlug}/">${esc(g.mostKnot)}</a> ${g.mostKnotN}군데`],
      ['매듭이 가장 적은 자리', `<a href="/${sd.slug}/${g.slug}/${g.leastKnotSlug}/">${esc(g.leastKnot)}</a> ${g.leastKnotN}군데`]);
  }
  const facts = tie('fact', 'counted', `${esc(g.name)} 세어 본 값`, factTable(rows), esc(at(h, SEC.factSub, 7)), '00');

  const { html: faqHtml, qa } = faqBlock(seed, c, 5, '05');

  const pool = [];
  for (const r of regions) for (const x of r.gu) {
    if (r.slug === sd.slug && x.slug === g.slug) continue;
    pool.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }

  const body = [
    lead,
    facts,
    telCta(cfg, `${sd.name} ${g.name}`, seed),
    g.main ? spotIndex(sd, g, seed, null, '01') : dongNameList(g, seed, '01'),
    myeonList(g, seed, '02'),
    courseGrid(courses, seed, g.name, '03'),
    nearList(sd, g, seed, '04'),
    faqHtml,
    stepList(seed, '06'),
    noticeBlock(seed, '07'),
    guIndex(sd, seed, g.slug, '08'),
    longtail(pool, seed, 20, 'districts', '옆 시군구에서 받는 자리', null, '09'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.gu(sd, g),
      desc: clampDesc(desc.gu(sd, g)),
      h1: `${esc(sd.name)} ${esc(g.name)} <span class="ttl-s">${g.main ? `동·읍 ${g.spotCount}칸` : `행정동 ${g.dongCount}칸`}에 닿는 출장마사지 홈타이</span>`,
      body,
      pageKind: 'gu',
      geo: { iso: sd.iso, placename: `${sd.full} ${g.name}`, lat: g.lat, lng: g.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '받는 자리', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: g.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, `${sd.full} ${g.name}`, { lat: g.lat, lng: g.lng },
          { area: g.area, containedIn: { '@type': 'AdministrativeArea', name: sd.full } }),
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} ${g.name} 출장마사지 홈타이 방문`,
          desc: clampDesc(desc.gu(sd, g)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        g.main && g.spots.length
          ? S.itemList(`${url}#spotlist`, `${g.name} 동·읍`, g.spots.map((s) => ({ name: s.name, url: `${siteUrl}/${sd.slug}/${g.slug}/${s.slug}/` })))
          : null,
        S.faqPage(url, qa),
      ].filter(Boolean),
    }),
  };
}

/* ── 시도 쪽 ──────────────────────────────────────────────────── */
export function sidoPage(ctx, sd) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = sd.name;
  const h = hash(seed, 'sd');
  const byArea = sd.gu.slice().sort((a, b) => b.area - a.area);

  const c = {
    name: sd.name, full: sd.full, guCount: sd.gu.length,
    spotCount: sd.spotCount, dongCount: sd.dongCount, myeonCount: sd.myeonCount,
    knotSum: sd.knotSum,
    place: sd.name,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  const lead = `<div class="lead"><p>${at(h, sd.main ? SIDO_LEAD_MAIN : SIDO_LEAD_SUB, 0)(c)}</p></div>`;

  const facts = tie('fact', 'counted', `${esc(sd.name)} 세어 본 값`,
    factTable([
      ['행정 명칭', esc(sd.full)],
      ['쪽을 낸 깊이', sd.main ? '시군구 → 동·읍' : '시군구까지'],
      ['시군구', `${sd.gu.length}곳`],
      ['행정동 합', `${sd.dongCount}곳`],
      sd.main ? ['쪽을 낸 동·읍', `${sd.spotCount}곳`] : ['동 이름', '시군구 쪽 목록 안에'],
      ['면', sd.myeonCount ? `${sd.myeonCount}곳 — 시군구 쪽에 이름만` : '없음'],
      ['받는 넓이', km2(sd.area)],
      ['매듭 합', `${sd.knotSum}군데`],
      ['넓이가 으뜸인 시군구', `<a href="/${sd.slug}/${byArea[0].slug}/">${esc(byArea[0].name)}</a> — ${km2(byArea[0].area)}`],
      ['받는 시각', `${esc(cfg.hours)} / 셈은 ${esc(cfg.pay)}`],
    ]), esc(at(h, SEC.factSub, 7)), '00');

  const { html: faqHtml, qa } = faqBlock(seed, c, 4, '05');

  const csLinks = tie('sidocourse', 'courses', `${esc(sd.name)}에서 고를 수 있는 코스`,
    `<ul class="rail">\n${courses.map((x) => `<li><a href="/${sd.slug}/course/${x.slug}/">${esc(sd.name)}에서 ${esc(x.ko)} 부르기</a></li>`).join('\n')}\n</ul>`,
    `코스마다 손이 머무는 자리와 속도가 달라집니다. ${esc(sd.name)} 어느 자리든 값은 한 가지입니다.`, '03');

  let pickBlock = '';
  if (sd.main) {
    const deep = [];
    for (const g of sd.gu) for (const s of g.spots) deep.push({ g, s });
    deep.sort((a, b) => b.s.knot - a.s.knot || a.s.name.localeCompare(b.s.name, 'ko'));
    pickBlock = tie('knotpick', 'tangled', `${esc(sd.name)}에서 매듭이 많은 동·읍`,
      `<ul class="rail">\n${deep.slice(0, 18).map((x) => `<li><a href="/${sd.slug}/${x.g.slug}/${x.s.slug}/">${esc(x.g.name)} ${esc(x.s.name)} 매듭 ${x.s.knot}</a></li>`).join('\n')}\n</ul>`,
      `길이 여러 갈래로 갈리는 자리입니다. 시각을 말씀드릴 때 어느 쪽으로 드는지를 먼저 정합니다. 나머지 ${sd.spotCount}곳은 시군구를 짚어 들어가십시오.`, '02');
  } else {
    const byDong = sd.gu.slice().sort((a, b) => b.dongCount - a.dongCount);
    pickBlock = tie('gupick', 'dense', `${esc(sd.name)}에서 주소가 가장 촘촘한 곳`,
      `<ul class="rail">\n${byDong.slice(0, 12).map((g) => `<li><a href="/${sd.slug}/${g.slug}/">${esc(g.name)} 행정동 ${g.dongCount}곳</a></li>`).join('\n')}\n</ul>`,
      '행정동이 많다는 것은 같은 넓이를 더 잘게 나눠 썼다는 뜻입니다.', '02');
  }

  const pool = [];
  for (const r of regions) {
    if (r.slug === sd.slug) continue;
    for (const x of r.gu) pool.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }

  const body = [
    lead,
    facts,
    telCta(cfg, sd.name, seed),
    guIndex(sd, seed, null, '01'),
    pickBlock,
    csLinks,
    courseGrid(courses, seed, sd.name, '04'),
    faqHtml,
    stepList(seed, '06'),
    longtail(pool, seed, 20, 'provinces', '다른 시도에서 받는 자리', null, '07'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.sido(sd),
      desc: clampDesc(desc.sido(sd)),
      h1: `${esc(sd.name)} <span class="ttl-s">출장마사지 홈타이 — ${sd.main ? `동·읍 ${sd.spotCount}칸` : `시군구 ${sd.gu.length}칸`}</span>`,
      body,
      pageKind: 'sido',
      geo: { iso: sd.iso, placename: sd.full, lat: sd.lat, lng: sd.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '받는 자리', url: `${siteUrl}/area/` },
        { name: sd.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, sd.full, { lat: sd.lat, lng: sd.lng }, { area: sd.area, alternateName: sd.alias }),
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} 출장마사지 홈타이 방문`,
          desc: clampDesc(desc.sido(sd)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        S.itemList(`${url}#gulist`, `${sd.name} 시군구`, sd.gu.map((g) => ({ name: g.name, url: `${siteUrl}/${sd.slug}/${g.slug}/` }))),
        S.faqPage(url, qa),
      ],
    }),
  };
}
