import { layout, tie } from '../lib/html.mjs';
import { esc, hash, won, josa, km2 } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import { factTable, faqBlock, stepList, noticeBlock, longtail, telCta, courseGrid } from '../lib/blocks.mjs';
import { SEC } from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

/* ★동·읍 × 코스는 만들지 않는다. 1,275 × 8 = 1만 쪽이 되는데 자리가 바뀌어도
   코스 설명이 같아 전부 얇은 조합 쪽이 된다(도어웨이로 읽힌다).
   코스는 전국 한 장 + 시도별 한 장까지만 낸다. */

const OIL_NOTE = {
  true: '기름을 씁니다. 마치고 씻으실 수 있는 상황인지만 미리 봐 주십시오.',
  false: '기름이 없는 코스입니다. 옷을 입은 채 받으셔도 되고 끝나는 대로 나가실 수 있습니다.',
};
const PRESSURE_NOTE = [
  '세기는 받는 도중에 고칩니다. 십 분쯤 지나면 어느 정도가 맞는지 서로 감이 옵니다.',
  '적어 둔 세기는 출발선일 뿐입니다. 참기보다 그 자리에서 알려 주시는 편이 훨씬 낫습니다.',
  '같은 힘이라도 받는 분에 따라 전혀 다르게 느껴집니다. 적힌 등급보다 그날 몸이 먼저입니다.',
];
const WHY = [
  (c) => `${c.ko} 쪽을 고르시는 분은 거의 ${c.for} 연락을 주십니다.`,
  (c) => `${c.for} 맞는 코스입니다. 사정이 다르시면 전화에서 다른 쪽으로 돌려 드립니다.`,
  (c) => `${c.for} 이쪽을 권합니다. 정하신 뒤에 돌리셔도 되고, 값은 맨 끝에 확정한 코스로 셉니다.`,
];

/* ── 코스 한 장 ───────────────────────────────────────────────── */
export function coursePage(ctx, c) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/course/${c.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `course/${c.slug}`;
  const h = hash(seed, 'cp');

  const fc = {
    place: '사시는 곳', hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  const lead = `<div class="lead">
  <p>${esc(at(h, WHY, 0)(c))} ${esc(c.lines[0])}</p>
  <p>${esc(c.lines[1])} ${esc(c.lines[2])}</p>
  <p>${esc(OIL_NOTE[String(c.oil)])} ${esc(at(h, PRESSURE_NOTE, 1))}</p>
</div>`;

  const facts = tie('fact', 'course', `${esc(c.ko)} 한눈에`,
    factTable([
      ['기본 길이', `${c.min}분`],
      ['금액', `${won(c.price)}원 — 지역에 따라 달라지지 않음`],
      ['세기', esc(c.pressure)],
      ['손 속도', esc(c.tempo)],
      ['주로 쓰는 자리', esc(c.focus)],
      ['기름', c.oil ? '씀' : '안 씀'],
      ['준비물', c.oil ? '수건 두 장과 누울 자리' : '누울 자리 — 수건은 한 장이면 넉넉합니다'],
      ['받는 시각', `${esc(cfg.hours)} / 셈은 ${esc(cfg.pay)} / 현관까지 ${esc(cfg.arrive)}`],
    ]), esc(at(h, SEC.factSub, 7)), '00');

  const others = courses.filter((x) => x.slug !== c.slug);
  const compare = tie('cmp', 'compare', `${esc(c.ko)}${josa(c.ko, '과/와')} 다른 코스의 차이`,
    `<table class="cmp"><thead><tr><th scope="col">코스</th><th scope="col">길이</th><th scope="col">금액</th><th scope="col">세기</th><th scope="col">기름</th></tr></thead>
     <tbody>
      <tr class="cur"><th scope="row">${esc(c.ko)}</th><td>${c.min}분</td><td>${won(c.price)}원</td><td>${esc(c.pressure)}</td><td>${c.oil ? '씀' : '안 씀'}</td></tr>
      ${others.map((x) => `<tr><th scope="row"><a href="/course/${x.slug}/">${esc(x.ko)}</a></th><td>${x.min}분</td><td>${won(x.price)}원</td><td>${esc(x.pressure)}</td><td>${x.oil ? '씀' : '안 씀'}</td></tr>`).join('\n')}
     </tbody></table>`,
    '길다고 더 센 것이 아닙니다. 세기와 길이는 따로 보십시오.', '01');

  const { html: faqHtml, qa } = faqBlock(seed, fc, 5, '03');

  const pool = [];
  for (const r of regions) pool.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });
  for (const r of regions) {
    if (!r.main) continue;
    for (const g of r.gu) pool.push({ label: `${g.name}`, href: `/${r.slug}/${g.slug}/` });
  }

  const body = [
    lead,
    facts,
    telCta(cfg, c.ko, seed),
    compare,
    stepList(seed, '02'),
    faqHtml,
    noticeBlock(seed, '04'),
    longtail(pool, seed, 22, 'regions', `${c.ko}${josa(c.ko, '을/를')} 지역에서 찾기`, '시도를 짚으시면 그 지역 쪽이 열립니다.', '05'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.course(c),
      desc: clampDesc(desc.course(c)),
      h1: `${esc(c.ko)} <span class="ttl-s">${c.min}분 ${won(c.price)}원 · 세기 ${esc(c.pressure)}</span>`,
      body,
      pageKind: 'course',
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '코스', url: `${siteUrl}/course/` },
        { name: c.ko, url },
      ],
      jsonld: [
        S.service({
          siteUrl, url, cfg,
          name: `${c.ko} 출장마사지 홈타이`,
          desc: clampDesc(desc.course(c)),
          areaServed: { '@type': 'Country', name: '대한민국' },
          courses: [c],
        }),
        S.faqPage(url, qa),
      ],
    }),
  };
}

/* ── 시도 × 코스 ──────────────────────────────────────────────── */
export function sidoCoursePage(ctx, sd, c) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/course/${c.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/course/${c.slug}`;
  const h = hash(seed, 'sc');

  const fc = {
    place: sd.name, hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  const open = [
    `${c.min}분에 ${won(c.price)}원. ${sd.name} 안쪽이라면 번지가 어디든 ${c.ko} 값이 이 한 줄입니다. 멀다는 까닭으로 숫자를 올리지 않습니다.`,
    `${sd.name} 어느 자리에서 부르셔도 ${c.ko} 구성은 그대로 갑니다. 바뀌는 것은 현관까지 드는 시간 하나뿐입니다.`,
    `${sd.name}에서 들어오는 ${c.ko}도 같은 줄로 받습니다. ${c.min}분 ${won(c.price)}원으로 셈합니다.`,
  ];
  const second = sd.main
    ? `${sd.name}은 동·읍 ${sd.spotCount}곳까지 쪽을 냈습니다. 사시는 자리를 짚으면 셋이 만나는 매듭이 몇 군데인지 뜨는데, 어떤 날은 금세 닿고 어떤 날은 늦는 까닭이 거기 있습니다.`
    : `${sd.name}은 시군구 ${sd.gu.length}곳까지 쪽을 냈습니다. 동 이름은 시군구 쪽 목록에 넣어 두었으니 전화에서 그대로 읽어 주십시오.`;

  const lead = `<div class="lead">
  <p>${esc(at(h, open, 0))}</p>
  <p>${esc(second)}</p>
  <p>${esc(c.lines[(parseInt(h.substr(3, 3), 16)) % c.lines.length])}</p>
</div>`;

  const facts = tie('fact', 'course', `${esc(sd.name)} ${esc(c.ko)} 한눈에`,
    factTable([
      ['지역', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
      ['쪽을 낸 깊이', sd.main ? `시군구 ${sd.gu.length} → 동·읍 ${sd.spotCount}` : `시군구 ${sd.gu.length}`],
      ['기본 길이', `${c.min}분`],
      ['금액', `${won(c.price)}원 — ${esc(sd.name)} 통틀어 한 가지`],
      ['세기 · 속도', `${esc(c.pressure)} · ${esc(c.tempo)}`],
      ['주로 쓰는 자리', esc(c.focus)],
      ['기름', c.oil ? '씀' : '안 씀'],
      ['받는 넓이', km2(sd.area)],
    ]), esc(at(h, SEC.factSub, 7)), '00');

  const { html: faqHtml, qa } = faqBlock(seed, fc, 4, '02');

  /* ★시군구가 한두 곳뿐인 서브 시도는 이것만으로 링크가 스무 개가 안 된다.
     다른 시도의 같은 코스 쪽을 함께 걸어 얇은 쪽이 생기지 않게 한다. */
  const pool = [];
  for (const g of sd.gu) pool.push({ label: `${g.name} ${c.ko}`, href: `/${sd.slug}/${g.slug}/` });
  for (const x of courses) {
    if (x.slug === c.slug) continue;
    pool.push({ label: `${sd.name} ${x.ko}`, href: `/${sd.slug}/course/${x.slug}/` });
  }
  for (const r of regions) {
    if (r.slug === sd.slug) continue;
    pool.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });
  }

  const body = [
    lead,
    facts,
    telCta(cfg, `${sd.name} ${c.ko}`, seed),
    courseGrid(courses, seed, sd.name, '01'),
    faqHtml,
    stepList(seed, '03'),
    longtail(pool, seed, 20, 'nearby', `${sd.name} 안에서 더 보기`, null, '04'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.sidoCourse(sd, c),
      desc: clampDesc(desc.sidoCourse(sd, c)),
      h1: `${esc(sd.name)}에서 받는 ${esc(c.ko)} <span class="ttl-s">출장마사지 홈타이 — 기본 ${c.min}분, ${won(c.price)}원</span>`,
      body,
      pageKind: 'sidocourse',
      geo: { iso: sd.iso, placename: sd.full, lat: sd.lat, lng: sd.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '받는 자리', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: c.ko, url },
      ],
      jsonld: [
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} ${c.ko} 출장마사지 홈타이`,
          desc: clampDesc(desc.sidoCourse(sd, c)),
          areaServed: { '@type': 'AdministrativeArea', name: sd.full },
          courses: [c],
        }),
        S.faqPage(url, qa),
      ],
    }),
  };
}
