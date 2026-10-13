import { layout, tie, telBtn } from '../lib/html.mjs';
import { esc, hash, km2, won, shuffle } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import {
  courseGrid, stepList, factTable, faqBlock, noticeBlock,
  longtail, telCta, siteLinks,
} from '../lib/blocks.mjs';
import { SEC } from '../content/copy.mjs';
import { POSTS } from '../content/posts.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];
const baseCtx = (cfg, courses, place) => ({
  place, hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
  tel: cfg.tel, telLabel: cfg.telLabel,
  minPrice: won(Math.min(...courses.map((c) => c.price))),
});

/* ── 대문 ─────────────────────────────────────────────────────── */
export function homePage(ctx) {
  const { cfg, siteUrl, courses, regions, counts, latestPosts } = ctx;
  const seed = 'home';
  const h = hash(seed, 'hm');
  const main = regions.filter((r) => r.main);
  const sub = regions.filter((r) => !r.main);

  const hero = `<section class="hero" aria-label="처음 안내">
  <p class="hero-sl">${esc(cfg.brand.slogan)}</p>
  <p class="hero-p">내건 간판이 없습니다. 걸어 주시면 관리사가 그 주소로 움직입니다. 수도권과 부산은 동과 읍을 한 칸씩 쪼개 적었고, 대전·대구·울산과 지정한 시·군은 시군구 선까지 적었습니다.</p>
  ${telBtn(cfg, { size: 'l' })}
  <dl class="hero-f">
    <div><dt>${esc(cfg.hours)}</dt><dd>시각을 가리지 않습니다</dd></div>
    <div><dt>${esc(cfg.pay)}</dt><dd>지갑은 맨 끝에 여십니다</dd></div>
    <div><dt>${esc(cfg.arrive)}</dt><dd>현관에 닿기까지</dd></div>
    <div><dt>동·읍 ${counts.spot}칸</dt><dd>시군구 ${counts.gu}칸 속에</dd></div>
  </dl>
</section>`;

  const areaBlock = tie('area', 'where', '사시는 지역부터 짚어 주십시오',
    `<div class="two">
      <div>
        <p class="two-h">동읍까지 쪽이 있는 곳</p>
        <ul class="two-ul">${main.map((r) => `<li><a href="/${r.slug}/"><b>${esc(r.name)}</b><span>시군구 ${r.gu.length} · 동읍 ${r.spotCount}칸</span></a></li>`).join('\n')}</ul>
      </div>
      <div>
        <p class="two-h">시군구까지 쪽이 있는 곳</p>
        <ul class="two-ul thin">${sub.map((r) => `<li><a href="/${r.slug}/"><b>${esc(r.name)}</b><span>시군구 ${r.gu.length}</span></a></li>`).join('\n')}</ul>
      </div>
    </div>
    <p class="tie-tail">층이 달라도 번호와 값은 한 가지입니다. <a href="/area/">모아 둔 목록</a>을 펼쳐 보셔도 됩니다.</p>`,
    '층을 둘로 나눈 것은 적어 둔 깊이가 다를 뿐이고, 받는 지역을 가린 것이 아닙니다.', '01');

  const whyBlock = tie('why', 'method', '왜 매듭부터 세나요?',
    `<div class="lead">
      <p>동 쪽에 들어가시면 그 자리의 <strong>매듭 수</strong>가 적혀 있습니다. 경계선 위에서 셋 이상이 한 점을 함께 쥔 자리를 센 값입니다. 두 동네만 맞댄 점은 담벼락일 뿐이라 빼고, 세 갈래로 갈라지는 점만 골라 셉니다.</p>
      <p>행정 경계는 대개 옛 물길이나 고갯마루, 큰 도로를 따라 그어졌습니다. 그러니 매듭 언저리는 길이 모이는 자리인 경우가 많습니다. 매듭이 많다는 것은 <strong>바깥에서 들어올 입구가 여러 갈래</strong>라는 뜻이고, 그 선택이 몇 분을 가릅니다.</p>
      <p>모두 공개 경계 자료를 세어 나온 값이고, 같은 자료로 다시 세면 같은 값이 나옵니다. 세는 방법은 <a href="/magazine/what-is-a-knot/">노트에 적어 두었습니다</a>.</p>
    </div>`, null, '02');

  const postBlock = tie('note', 'notes', '부르기 전에 읽어 두면 좋은 글',
    `<ul class="plist">${latestPosts.map((p) => `<li><a href="${p.path}"><b>${esc(p.title)}</b><p>${esc(p.summary)}</p><time datetime="${p.date}">${p.date}</time></a></li>`).join('\n')}</ul>
     <p class="tie-tail"><a href="/magazine/">노트 전체 보기</a></p>`,
    '받아 본 사람의 소감이 아닙니다. 걸기 전에 미리 정해 두면 편한 것만 추렸습니다.', '05');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '지금 계신 곳'), 6, '06');

  const pool = [];
  for (const r of regions) {
    if (r.main) for (const g of r.gu) for (const s of g.spots) pool.push({ label: `${g.name} ${s.name}`, href: `/${r.slug}/${g.slug}/${s.slug}/` });
    else for (const g of r.gu) pool.push({ label: `${r.name} ${g.name}`, href: `/${r.slug}/${g.slug}/` });
  }

  const body = [
    hero,
    areaBlock,
    whyBlock,
    courseGrid(courses, seed, '부르신 자리', '03'),
    stepList(seed, '04'),
    postBlock,
    faqHtml,
    noticeBlock(seed, '07'),
    longtail(pool, seed, 30, 'popular', '많이 찾으시는 자리', null, '08'),
    telCta(cfg, '지금 계신 곳', seed),
  ].join('\n');

  return {
    path: '/',
    html: layout(ctx, {
      path: '/',
      title: title.home(),
      desc: clampDesc(desc.home()),
      h1: `${esc(cfg.brand.ko)} 출장마사지 홈타이 <span class="ttl-s">서울·인천·경기·부산 동읍 ${counts.spot}곳 · 시군구 ${counts.gu}곳 방문</span>`,
      body,
      pageKind: 'home',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }],
      jsonld: [
        S.service({
          siteUrl, url: siteUrl + '/', cfg,
          name: `${cfg.brand.ko} 출장마사지 홈타이 방문`,
          desc: clampDesc(desc.home()),
          areaServed: { '@type': 'Country', name: '대한민국' },
          courses,
        }),
        S.itemList(`${siteUrl}/#sidolist`, '받는 시도', regions.map((r) => ({ name: r.name, url: `${siteUrl}/${r.slug}/` }))),
        S.faqPage(`${siteUrl}/`, qa),
      ],
    }),
  };
}

/* ── 지역 허브 ────────────────────────────────────────────────── */
export function areaHub(ctx) {
  const { cfg, siteUrl, regions, counts, courses } = ctx;
  const seed = 'area';

  const lead = `<div class="lead">
  <p>쪽을 낸 자리를 한 장에 몰아 두었습니다. 시군구 ${counts.gu}칸, 동·읍 ${counts.spot}칸입니다. 면 ${counts.myeon}칸에는 쪽이 없지만 전화도 발길도 똑같이 닿습니다.</p>
  <p>수도권과 부산은 동·읍을 하나씩 눌러 보실 수 있고, 나머지는 시군구 쪽 목록 안에 동 이름을 넣어 두었습니다. 층을 달리한 것은 찾는 분이 몰리는 쪽을 더 잘게 갈랐기 때문입니다.</p>
</div>`;

  const blocks = regions.map((r, i) => tie(`sd-${r.slug}`, r.main ? 'to dong' : 'to district', `<a href="/${r.slug}/">${esc(r.name)}</a> ${r.main ? `동·읍 ${r.spotCount}곳` : `시군구 ${r.gu.length}곳`}`,
    `<ul class="idx">${r.gu.map((g) => `<li><a href="/${r.slug}/${g.slug}/"><span class="i-n">${esc(g.name)}</span><span class="i-m">동 ${g.dongCount}${g.myeonCount ? ` / 면 ${g.myeonCount}` : ''}</span></a></li>`).join('\n')}</ul>`,
    r.main
      ? `${r.name}에서는 시군구를 열면 그 안 동·읍이 쭉 펼쳐집니다. 행정동을 모두 세면 ${r.dongCount}칸입니다.`
      : `${r.name}은 시군구에서 끊어 둡니다. 행정동 ${r.dongCount}칸의 이름은 시군구 쪽 목록 안에 있습니다.`,
    String(i + 1).padStart(2, '0'))).join('\n');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '사시는 동네'), 4, '98');

  const body = [lead, telCta(cfg, '사시는 곳', seed), blocks, faqHtml, stepList(seed, '99')].join('\n');

  return {
    path: '/area/',
    html: layout(ctx, {
      path: '/area/',
      title: title.areaHub(counts),
      desc: clampDesc(desc.areaHub(counts)),
      h1: `받는 자리 모음 <span class="ttl-s">시군구 ${counts.gu}칸과 그 안의 동·읍 ${counts.spot}칸</span>`,
      body,
      pageKind: 'areahub',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '받는 자리', url: `${siteUrl}/area/` }],
      jsonld: [
        S.itemList(`${siteUrl}/area/#list`, '받는 시도', regions.map((r) => ({ name: r.name, url: `${siteUrl}/${r.slug}/` }))),
        S.faqPage(`${siteUrl}/area/`, qa),
      ],
    }),
  };
}

/* ── 코스 허브 ────────────────────────────────────────────────── */
export function courseHub(ctx) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const seed = 'coursehub';
  const sorted = courses.slice().sort((a, b) => a.price - b.price);
  const shortest = courses.slice().sort((a, b) => a.min - b.min)[0];
  const longest = courses.slice().sort((a, b) => b.min - a.min)[0];

  const lead = `<div class="lead">
  <p>모두 ${courses.length}가지입니다. 따지실 것은 셋뿐입니다 — 얼마나 세게, 얼마나 길게, 기름을 쓸지 말지. 셋만 정해 주시면 남은 것은 전화하며 맞춥니다.</p>
  <p>가장 짧은 쪽이 ${esc(shortest.ko)}(${shortest.min}분), 가장 긴 쪽이 ${esc(longest.ko)}(${longest.min}분)입니다. 길다고 센 것이 아니고 값이 높다고 더 나은 것도 아닙니다. 그날 몸이 무엇을 바라느냐가 다를 뿐입니다.</p>
</div>`;

  const table = tie('all', 'table', `${courses.length}가지를 나란히`,
    `<table class="cmp"><thead><tr><th scope="col">코스</th><th scope="col">길이</th><th scope="col">금액</th><th scope="col">세기</th><th scope="col">속도</th><th scope="col">기름</th></tr></thead>
     <tbody>${sorted.map((c) => `<tr><th scope="row"><a href="/course/${c.slug}/">${esc(c.ko)}</a></th><td>${c.min}분</td><td>${won(c.price)}원</td><td>${esc(c.pressure)}</td><td>${esc(c.tempo)}</td><td>${c.oil ? '씀' : '안 씀'}</td></tr>`).join('\n')}</tbody></table>`,
    '싼 쪽부터 늘어놓았습니다. 어느 지역에서 부르시든 숫자는 그대로입니다.', '01');

  const pickBy = tie('bycase', 'choose', '이런 때는 어느 쪽인가요?',
    `<ul class="plist">${courses.map((c) => `<li><a href="/course/${c.slug}/"><b>${esc(c.ko)}</b><p>${esc(c.for)}</p></a></li>`).join('\n')}</ul>`,
    '정하신 뒤에 돌리셔도 됩니다. 값은 맨 끝에 확정한 코스로 셉니다.', '02');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '사시는 곳'), 4, '03');

  const pool = [];
  for (const r of regions) for (const c of courses) pool.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });

  const body = [lead, table, pickBy, telCta(cfg, '코스 상담', seed), faqHtml, longtail(pool, seed, 24, 'by region', '지역에서 코스 찾기', null, '04')].join('\n');

  return {
    path: '/course/',
    html: layout(ctx, {
      path: '/course/',
      title: title.page(`코스 ${courses.length}가지 출장마사지 홈타이`),
      desc: clampDesc(`출장마사지 홈타이 코스 ${courses.length}가지를 세기·길이·기름 여부로 견주어 두었습니다. ${won(sorted[0].price)}원부터이고 지역을 타지 않습니다.`),
      h1: `코스 ${courses.length}가지 <span class="ttl-s">세기 · 길이 · 기름으로 견주기</span>`,
      body,
      pageKind: 'coursehub',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '코스', url: `${siteUrl}/course/` }],
      jsonld: [
        S.itemList(`${siteUrl}/course/#list`, '코스', courses.map((c) => ({ name: c.ko, url: `${siteUrl}/course/${c.slug}/` }))),
        S.faqPage(`${siteUrl}/course/`, qa),
      ],
    }),
  };
}

/* ── 금액 ─────────────────────────────────────────────────────── */
export function pricePage(ctx) {
  const { cfg, siteUrl, courses } = ctx;
  const seed = 'price';
  const sorted = courses.slice().sort((a, b) => a.price - b.price);

  const lead = `<div class="lead">
  <p>아래 표가 전부입니다. 표 바깥에서 받는 돈이 없습니다.</p>
  <p>어디로 가든 숫자가 그대로입니다. 읍내든 도심 한복판이든 코스가 같으면 숫자가 같습니다. 유난히 먼 날이 있어도 그 부담을 이용자께 넘기지 않기로 했습니다.</p>
</div>`;

  const table = tie('tbl', 'prices', '코스별 기본 길이와 금액',
    `<table class="cmp"><thead><tr><th scope="col">코스</th><th scope="col">기본 길이</th><th scope="col">금액</th><th scope="col">1분당</th></tr></thead>
     <tbody>${sorted.map((c) => `<tr><th scope="row"><a href="/course/${c.slug}/">${esc(c.ko)}</a></th><td>${c.min}분</td><td><b>${won(c.price)}원</b></td><td>${won(Math.round(c.price / c.min))}원</td></tr>`).join('\n')}</tbody></table>`,
    '1분당 숫자는 서로 대 보시라고 붙인 것입니다. 실제로 분을 쪼개 받지는 않습니다.', '01');

  const noExtra = tie('nox', 'never', '여기에 더 붙는 것이 없습니다',
    `<ul class="marks">
      <li>오가는 기름값 — 얼마나 멀든 따로 청구하지 않습니다.</li>
      <li>새벽 웃돈 — 해 뜨기 전에 불러도 표의 숫자 그대로입니다.</li>
      <li>명절과 공휴일 웃돈 — 날짜로 값을 올리지 않습니다.</li>
      <li>선금 — 예약금이라는 이름으로도 보증금이라는 이름으로도 받지 않습니다.</li>
      <li>무르실 때 내는 돈 — 미루셔도 취소하셔도 없습니다.</li>
      <li>주차 요금 — 저희 쪽에서 냅니다.</li>
    </ul>`,
    '입금할 통장을 먼저 내미는 연락은 저희 쪽이 아닙니다.', '02');

  const pay = tie('how', 'payment', '어떻게 내면 되나요?',
    factTable([
      ['내는 때', '마친 뒤 그 자리에서'],
      ['수단', '현금과 카드 — 어느 쪽이든 숫자가 같습니다'],
      ['영수증', '말씀하시면 드립니다'],
      ['길게 받으실 때', '통화에서 미리 정하시면 그만큼 더해서 셉니다'],
      ['두 분이 받으실 때', '사람마다 따로 셈합니다. 묶음값을 두지 않습니다'],
    ]), null, '03');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '사시는 자리'), 4, '04');

  const body = [lead, table, noExtra, pay, telCta(cfg, '금액 확인', seed), faqHtml, siteLinks(ctx, seed)].join('\n');

  return {
    path: '/price/',
    html: layout(ctx, {
      path: '/price/',
      title: title.page(`금액표 ${won(sorted[0].price)}원부터`),
      desc: clampDesc(`코스별 기본 길이와 금액입니다. ${won(sorted[0].price)}원부터이고 길 값·심야 웃돈·예약금을 붙이지 않습니다. 마친 뒤 현금이나 카드로 받습니다.`),
      h1: `금액표 <span class="ttl-s">맨 아래가 ${won(sorted[0].price)}원이고, 표 바깥에서 더 받는 돈이 없습니다</span>`,
      body,
      pageKind: 'price',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '금액', url: `${siteUrl}/price/` }],
      jsonld: [S.faqPage(`${siteUrl}/price/`, qa)],
    }),
  };
}

/* ── 이용안내 ─────────────────────────────────────────────────── */
export function guidePage(ctx) {
  const { cfg, siteUrl, courses } = ctx;
  const seed = 'guide';

  const lead = `<div class="lead">
  <p>처음 거시는 분께 맞춰 썼습니다. 전화 한 통으로 끝나는 일이라 길게 읽으실 것이 없습니다.</p>
</div>`;

  const what = tie('need', 'ready', '집에 있어야 하는 것은?',
    `<ul class="marks">
      <li>몸을 누일 자리 — 방바닥이어도 되고 침대여도 됩니다.</li>
      <li>수건 두 장 — 쓰시던 것이면 됩니다. 기름 없는 코스라면 한 장으로 끝납니다.</li>
      <li>문이 닫히는 방 하나 — 가족이 함께 계셔도 괜찮습니다.</li>
    </ul>
    <p class="tie-tail">깔개와 기름, 접이식 베드는 관리사가 지고 갑니다. 사다 두실 물건이 없습니다.</p>`,
    null, '01');

  const timing = tie('when', 'hours', '언제 부를 수 있나요?',
    factTable([
      ['접수', `${esc(cfg.hours)} — 시곗바늘과 상관없이 번호 하나`],
      ['도착', `${esc(cfg.arrive)}이 보통이고, 안으로 더 들어가는 만큼 붙습니다`],
      ['미루기', '언제 하셔도 됩니다. 따로 무는 돈이 없습니다'],
      ['무르기', '관리사가 현관에 닿은 뒤라면 그 한마디만 주십시오'],
      ['가장 붐비는 때', '주말로 들어가는 금요일 밤과 토요일 밤'],
      ['가장 한가한 때', '주중 낮 — 이때는 기다리실 일이 거의 없습니다'],
    ]), null, '02');

  const refuse = tie('no', 'declined', '접수를 돌려 드리는 경우는?',
    `<ul class="marks">
      <li>성적인 요구가 섞여 나올 때 — 그 자리에서 전화를 끊습니다.</li>
      <li>열이 오르거나 다친 자리가 부었을 때 — 날짜를 뒤로 옮겨 드립니다.</li>
      <li>갈 곳을 끝까지 알려 주지 않으실 때 — 누구를 어디로 보낼지 정할 수가 없습니다.</li>
      <li>관리사 개인 번호를 달라고 하실 때.</li>
      <li>병원 쪽이 맞아 보일 때 — 그쪽을 먼저 다녀오시라고 합니다.</li>
      <li>만 열아홉 살이 안 되셨을 때 — 받지 않습니다.</li>
    </ul>`,
    '돌려보내는 경우에도 무는 돈은 없습니다.', '03');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '부르시는 곳'), 6, '05');

  const body = [lead, what, timing, stepList(seed, '04'), refuse, telCta(cfg, '처음 이용', seed), faqHtml, noticeBlock(seed, '06'), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/guide/',
    html: layout(ctx, {
      path: '/guide/',
      title: title.page('이용안내 — 부르는 법과 내는 법'),
      desc: clampDesc('처음 부르실 때 필요한 것만 모았습니다. 준비물, 접수 가능한 시각, 돌려 드리는 경우, 계산 방법을 차례로 적었습니다.'),
      h1: `이용안내 <span class="ttl-s">전화 한 통으로 끝나는 차례</span>`,
      body,
      pageKind: 'guide',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '이용안내', url: `${siteUrl}/guide/` }],
      jsonld: [S.faqPage(`${siteUrl}/guide/`, qa)],
    }),
  };
}

/* ── 소개 ─────────────────────────────────────────────────────── */
export function companyPage(ctx) {
  const { cfg, siteUrl, counts, data } = ctx;
  const seed = 'company';

  const lead = `<div class="lead">
  <p>${esc(cfg.brand.ko)}(${esc(cfg.brand.en)})는 매장 없이 방문만 하는 곳입니다. 여러 업소를 늘어놓는 목록 사이트가 아니라, 저희가 직접 받는 창구 하나로 꾸립니다.</p>
  <p>이름은 편안함(bliss)과 매듭(knot)을 붙여 지었습니다. 뭉친 매듭을 푼다는 뜻이기도 하고, 길이 모이는 매듭부터 짚어 찾아간다는 뜻이기도 합니다.</p>
</div>`;

  const line = tie('line', 'limits', '어디까지 하고 어디서 멈추나요?',
    `<ul class="marks">
      <li>여기까지 합니다 — 손으로 굳은 근육을 풀어 드리는 일.</li>
      <li>손대지 않습니다 — 성적인 서비스는 어떤 모양으로도 없습니다.</li>
      <li>넘어서지 않습니다 — 병을 가려내고 고치는 일은 의사의 몫입니다.</li>
      <li>만 열아홉 살이 안 되신 분은 받지 않습니다.</li>
      <li>화면에 두지 않은 것 — 후기와 평점. 꾸며 낸 글이 섞이기 너무 쉽습니다.</li>
      <li>화면에 두지 않은 것 — 사람 사진. 실제와 어긋난 사진이 흔히 떠돕니다.</li>
      <li>지갑에서 먼저 나가는 돈 — 예약금도 보증금도 두지 않았습니다.</li>
    </ul>`, null, '01');

  const how = tie('data', 'sources', '이 숫자들은 어떻게 뽑았나요?',
    `<div class="lead">
      <p>지역 쪽의 넓이와 매듭 수는 모두 공개된 행정동 경계 자료를 세어 뽑았습니다. 넓이는 경계 도형의 면적이고, 매듭은 경계선의 꼭짓점 가운데 <strong>셋 이상이 함께 쥔 점</strong>을 센 값입니다.</p>
      <p>같은 세 동네가 두 지점에서 만나는 드문 경우가 있어, 참여한 동네 집합으로 한 번 더 묶어 같은 매듭을 두 번 세지 않습니다. 네 겹·다섯 겹 매듭은 그만큼 많은 동네가 한 점에 모였다는 뜻입니다.</p>
      <p>경계 자료가 새로 나오면 다시 세고 화면의 값도 함께 바뀝니다. 사람이 손으로 적어 넣은 칸은 한 곳도 없습니다.</p>
    </div>
    ${factTable([
      ['바탕이 된 자료', esc(data.source)],
      ['자료 판', esc(data.version)],
      ['쓰는 값', esc(data.axis)],
      ['어디까지 쪽을 내는가', esc(data.coverageFrom)],
      ['쪽을 낸 단위', `시도 ${counts.sido} · 시군구 ${counts.gu} · 동읍 ${counts.spot}`],
      ['쪽이 없는 단위', `면 ${counts.myeon}곳 — 이름만 올림`],
      ['전국 매듭', `${counts.knotAll}군데 · 시군구 삼거리 ${counts.guKnotAll}군데`],
    ])}`, null, '02');

  const body = [lead, line, how, telCta(cfg, '문의', seed), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/company/',
    html: layout(ctx, {
      path: '/company/',
      title: title.page(`${cfg.brand.ko}는 어떤 곳인가`),
      desc: clampDesc(`${cfg.brand.ko}가 하는 일과 하지 않는 일, 그리고 지역 쪽의 숫자를 어떤 자료로 어떻게 세었는지 적었습니다.`),
      h1: `${esc(cfg.brand.ko)} 소개 <span class="ttl-s">지키는 선과 자료 출처</span>`,
      body,
      pageKind: 'company',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '소개', url: `${siteUrl}/company/` }],
    }),
  };
}

/* ── 이용약관 ─────────────────────────────────────────────────── */
const TERMS = [
  ['제1조 (무엇을 정하는 약관인가)', '블리스놋(아래에서 "회사")이 꾸리는 출장 방문 관리에 대하여, 쓰는 조건과 차례, 그리고 회사와 이용자가 서로 지킬 것을 정해 둔 글입니다.'],
  ['제2조 (받는 창구)', '접수는 사이트에 적힌 번호로 거시는 통화로만 받습니다. 이 번호는 중계 번호라 거신 분의 전화번호가 관리사에게 그대로 넘어가지 않습니다. 메신저나 게시판, 전자우편으로는 받지 않습니다.'],
  ['제3조 (하는 일의 범위)', '회사는 이용자가 정한 자리로 관리사를 보내 손으로 근육을 풀어 드립니다. 병을 가려내거나 고치는 의료 행위를 하지 않고, 성적인 서비스도 하지 않습니다.'],
  ['제4조 (쓸 수 있는 분)', '만 열아홉 살 이상만 쓰실 수 있습니다. 나이가 그에 미치지 않으면 접수를 받지 않습니다.'],
  ['제5조 (지역 숫자의 성격)', '사이트에 적힌 넓이와 매듭 수는 공개된 행정동 경계 자료를 세어 나온 값입니다. 길 사정이나 실제 이동 시간을 약속하는 값이 아니며 참고로만 보셔야 합니다.'],
  ['제6조 (값과 셈)', '값은 금액표와 같고 지역에 따라 달라지지 않습니다. 관리를 마친 자리에서 현금이나 카드로 받으며, 예약금이나 보증금 같은 미리 내는 돈은 어떤 이름으로도 받지 않습니다.'],
  ['제7조 (옮기기와 무르기)', '방문 전이라면 언제든 시각을 옮기거나 무르실 수 있고 무는 돈이 없습니다. 다만 관리사가 이미 문 앞에 닿은 뒤라면 그 사실만 바로 알려 주셔야 합니다.'],
  ['제8조 (회사가 돌려보낼 수 있는 때)', '아래에 해당하면 회사는 접수를 돌려보내거나 하던 관리를 멈출 수 있습니다. 첫째, 성적인 서비스를 요구하실 때. 둘째, 관리사에게 거친 말이나 힘을 쓰거나 개인 연락처를 달라고 하실 때. 셋째, 갈 곳을 끝까지 알려 주지 않으실 때. 넷째, 열이 있거나 상처가 벌어진 상태처럼 관리가 알맞지 않을 때.'],
  ['제9조 (이용자가 거들어 주실 것)', '누울 자리와 수건을 마련해 주시고, 관리에 영향을 줄 수 있는 몸 상태가 있으면 접수하실 때 알려 주셔야 합니다.'],
  ['제10조 (후기와 평점을 두지 않음)', '회사는 후기나 평점을 모으지도 올리지도 않습니다. 이 사이트에 적힌 어떤 문장도 누군가의 경험을 받아 적은 글이 아닙니다.'],
  ['제11조 (책임의 선)', '관리하는 동안 회사의 잘못으로 생긴 손해는 회사가 집니다. 다만 미리 알려 주지 않으신 몸 상태에서 비롯된 일, 그리고 천재지변이나 통신이 끊겨 늦어진 일까지는 지지 못합니다.'],
];

export function termsPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const body = [
    `<div class="lead"><p>${esc(cfg.brand.ko)}의 이용약관을 아래에 그대로 둡니다. 전화를 주시는 순간 이 내용에 동의하신 것으로 봅니다. 고칠 일이 생기면 사이트에 먼저 올리고 올린 날부터 적용합니다.</p></div>`,
    tie('terms', 'terms', '전문', `<div class="doc">${TERMS.map(([t, d]) => `<section><h2>${esc(t)}</h2><p>${esc(d)}</p></section>`).join('')}</div>`, null, '01'),
    telCta(cfg, '약관 문의', 'terms'),
    siteLinks(ctx, 'terms'),
  ].join('\n');
  return {
    path: '/terms/',
    html: layout(ctx, {
      path: '/terms/',
      title: title.page('이용약관'),
      desc: clampDesc(`${cfg.brand.ko} 출장 방문 관리 이용약관입니다. 받는 창구, 하는 일의 범위, 값과 셈, 옮기기와 무르기를 ${TERMS.length}개 조문으로 적었습니다.`),
      h1: `이용약관 <span class="ttl-s">${TERMS.length}개 조문</span>`,
      body,
      pageKind: 'terms',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '이용약관', url: `${siteUrl}/terms/` }],
    }),
  };
}

/* ── 개인정보처리방침 ─────────────────────────────────────────── */
const PRIVACY = [
  ['하나. 통화에서 듣는 것', '받아 적는 항목은 넷입니다 — 가실 주소, 닿을 번호, 고르신 코스, 바라시는 시각. 성함이나 태어난 날, 주민등록번호는 여쭙지 않습니다.'],
  ['둘. 어디에 쓰는가', '적어 둔 것은 관리사를 보내고 출발과 도착을 알리는 데에만 씁니다. 나중에 홍보 문자를 돌리거나 먼저 전화를 거는 일이 없습니다.'],
  ['셋. 번호에 대하여', '화면의 번호는 중계 번호로 걸어 두었습니다. 그래서 거신 번호가 관리사에게 건너가지 않습니다.'],
  ['넷. 얼마나 두는가', '방문이 탈 없이 끝나면 그날로 지웁니다. 다툼이 있던 건만 매듭이 지어질 때까지 따로 둡니다.'],
  ['다섯. 밖으로 돌리지 않음', '어느 업체에도 팔거나 맡기지 않습니다. 법이 정한 수사기관의 정당한 요구가 있을 때만 예외입니다.'],
  ['여섯. 저절로 쌓이는 것', '이 사이트는 미리 찍어 둔 파일만 내보냅니다. 로그인도 장바구니도 댓글창도 없고 광고 추적이나 접속 분석 코드를 심지 않았습니다. 쿠키도 굽지 않습니다.'],
  ['일곱. 요구하실 수 있는 것', '무엇을 쥐고 있는지 보여 달라거나 없애 달라고 하실 수 있습니다. 같은 번호로 거시면 그 전화 안에서 처리합니다. 개인정보를 맡은 사람은 사업자 정보가 정해지는 대로 푸터에 적습니다.'],
];

export function privacyPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const body = [
    `<div class="lead"><p>짧습니다. 받아 적는 항목 자체가 몇 개 없기 때문입니다.</p></div>`,
    tie('pp', 'privacy', '전문', `<div class="doc">${PRIVACY.map(([t, d]) => `<section><h2>${esc(t)}</h2><p>${esc(d)}</p></section>`).join('')}</div>`, null, '01'),
    telCta(cfg, '개인정보 문의', 'privacy'),
    siteLinks(ctx, 'privacy'),
  ].join('\n');
  return {
    path: '/privacy/',
    html: layout(ctx, {
      path: '/privacy/',
      title: title.page('개인정보처리방침'),
      desc: clampDesc('접수 통화에서 듣는 것과 쓰는 곳, 두는 기간을 적었습니다. 쿠키와 추적 스크립트를 쓰지 않는 정적 사이트입니다.'),
      h1: `개인정보처리방침 <span class="ttl-s">통화에서 적는 항목이 넷입니다</span>`,
      body,
      pageKind: 'privacy',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '개인정보처리방침', url: `${siteUrl}/privacy/` }],
    }),
  };
}

/* ── 노트 목록 ────────────────────────────────────────────────── */
export function magazineIndex(ctx) {
  const { cfg, siteUrl } = ctx;
  const list = POSTS.slice().sort((a, b) => b.date.localeCompare(a.date));
  const body = [
    `<div class="lead"><p>걸기 전에 알아 두면 덜 헤매실 것만 적습니다. 받아 본 사람의 소감은 올리지 않습니다.</p></div>`,
    tie('list', 'notes', `모아 둔 글 ${list.length}편`,
      `<ul class="plist">${list.map((p) => `<li><a href="/magazine/${p.slug}/"><b>${esc(p.title)}</b><p>${esc(p.summary)}</p><time datetime="${p.date}">${p.date}</time></a></li>`).join('\n')}</ul>`,
      '새로 올리면 RSS 로도 흘려보냅니다.', '01'),
    telCta(cfg, '접수', 'magazine'),
    siteLinks(ctx, 'magazine'),
  ].join('\n');
  return {
    path: '/magazine/',
    html: layout(ctx, {
      path: '/magazine/',
      title: title.page('매듭 노트'),
      desc: clampDesc(`받기 전에 정해 두시면 좋은 것들을 ${list.length}편으로 적었습니다. 후기·체험담은 싣지 않습니다.`),
      h1: `매듭 노트 <span class="ttl-s">글 ${list.length}편</span>`,
      body,
      pageKind: 'magazine',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '노트', url: `${siteUrl}/magazine/` }],
      jsonld: [S.itemList(`${siteUrl}/magazine/#list`, '매듭 노트', list.map((p) => ({ name: p.title, url: `${siteUrl}/magazine/${p.slug}/` })))],
    }),
  };
}

export function postPage(ctx, p) {
  const { cfg, siteUrl } = ctx;
  const path = `/magazine/${p.slug}/`;
  const url = `${siteUrl}${path}`;
  const html = p.body.map((b) => {
    if (typeof b === 'string') return `<p>${b.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`;
    if (b[0] === 'h3') return `<h2>${esc(b[1])}</h2>`;
    if (b[0] === 'ul') return `<ul>${b[1].map((x) => `<li>${esc(x)}</li>`).join('\n')}</ul>`;
    return '';
  }).join('\n');

  const others = POSTS.filter((x) => x.slug !== p.slug).slice(0, 4);
  const body = [
    `<p class="fz-sm"><time datetime="${p.date}">${p.date}</time> · ${esc(cfg.brand.ko)} 매듭 노트</p>`,
    `<article class="post">${html}</article>`,
    telCta(cfg, '접수', p.slug),
    tie('more', 'next', '이어서 읽을 것',
      `<ul class="plist">${others.map((x) => `<li><a href="/magazine/${x.slug}/"><b>${esc(x.title)}</b><p>${esc(x.summary)}</p><time datetime="${x.date}">${x.date}</time></a></li>`).join('\n')}</ul>`,
      null, '01'),
    siteLinks(ctx, p.slug),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.post(p),
      desc: clampDesc(desc.post(p)),
      h1: esc(p.title),
      body,
      pageKind: 'post',
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '노트', url: `${siteUrl}/magazine/` },
        { name: p.title, url },
      ],
      jsonld: [S.article({ url, siteUrl, title: p.title, desc: p.summary, date: p.date, cfg })],
    }),
  };
}

/* ── 404 ──────────────────────────────────────────────────────── */
export function notFound(ctx) {
  const { cfg, siteUrl, regions } = ctx;
  const body = [
    `<div class="lead"><p>주소가 자리를 옮겼거나 애초에 없던 쪽입니다. 아래에서 다시 골라 주십시오.</p></div>`,
    tie('back', 'back', '자주 찾는 쪽',
      `<ul class="rail">
        <li><a href="/">처음</a></li>
        <li><a href="/area/">받는 자리 모두</a></li>
        <li><a href="/course/">코스</a></li>
        <li><a href="/price/">금액</a></li>
        <li><a href="/guide/">이용안내</a></li>
        ${regions.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('\n')}
      </ul>`, null, '01'),
    telCta(cfg, '바로 접수', '404'),
  ].join('\n');
  return {
    path: '/404.html',
    html: layout(ctx, {
      path: '/404.html',
      title: title.page('찾는 쪽이 없습니다'),
      desc: '주소가 바뀌었거나 처음부터 없던 쪽입니다.',
      h1: '찾는 쪽이 없습니다',
      body,
      noindex: true,
      pageKind: '404',
    }),
  };
}
