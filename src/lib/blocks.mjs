import { esc, hash, shuffle, km2, won, josa } from './util.mjs';
import { tie, telBtn } from './html.mjs';
import { ANCHOR, FAQ_POOL, STEP_SETS, NOTICE, SEC } from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

/* ── 예약 문의 띠 ─────────────────────────────────────────────────
   번호가 본문 어디에 나오든 '예약 문의'가 붙은 버튼으로만 나온다. */
export function telCta(cfg, place, seedKey) {
  const h = hash(seedKey, 'cta');
  const lines = [
    `${place} 번지까지 들으면 어느 매듭을 지나 붙을지가 그 자리에서 정해집니다.`,
    `${place}까지 지금 움직일 수 있는 사람이 있는지 통화에서 곧바로 확인해 드립니다.`,
    `${place} 방문은 코스와 시각, 주소 셋만 정하시면 더 여쭐 것이 없습니다.`,
    `${place} 접수는 이 번호 한 줄로만 들어옵니다. 곁길을 따로 터 두지 않았습니다.`,
  ];
  return `<section class="cta" aria-label="${esc(place)} 예약 문의">
  <p class="cta-p">${esc(at(h, lines))}</p>
  ${telBtn(cfg, { size: 'l' })}
  <p class="cta-s">${esc(at(h, SEC.askTail, 2).replace('@A', cfg.arrive).replace('@H', cfg.hours).replace('@P', cfg.pay))}</p>
</section>`;
}

/* ── 코스 ─────────────────────────────────────────────────────── */
export function courseGrid(courses, seedKey, place, num = '01') {
  const h = hash(seedKey, 'cg');
  // 여덟 설명을 다 달면 어느 쪽이든 같은 여덟 문장이 깔린다. 둘만 시드로 골라 단다.
  const withText = new Set(shuffle(courses.map((c) => c.slug), h).slice(0, 2));
  const list = courses.map((c) => {
    const line = at(hash(seedKey, c.slug), c.lines);
    return `<li>
    <a href="/course/${c.slug}/">
      <span class="g-k">${esc(c.ko)}</span>
      <span class="g-v">${won(c.price)}<i>원 / ${c.min}분</i></span>
      <span class="g-p">세기 ${esc(c.pressure)}${c.oil ? ' · 기름 씀' : ' · 기름 안 씀'}</span>
    </a>
    ${withText.has(c.slug) ? `<p class="g-d">${esc(line)}</p>` : ''}
  </li>`;
  }).join('\n');
  return tie('course', 'course', `${esc(place)}에 들고 가는 여덟 가지`,
    `<ul class="grid">\n${list}\n</ul>
     <p class="tie-tail">${esc(at(h, SEC.courseTail, 2))} ${at(h, SEC.courseLink, 5)}</p>`,
    esc(at(h, SEC.courseSub, 1)), num);
}

/* ── 접수 흐름 ────────────────────────────────────────────────── */
export function stepList(seedKey, num = '04') {
  const h = hash(seedKey, 'st');
  const steps = at(h, STEP_SETS);
  return tie('step', 'steps', esc(at(h, SEC.stepTitle, 1)),
    `<ol class="steps">\n${steps.map((s) => `<li><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></li>`).join('\n')}\n</ol>`,
    esc(at(h, SEC.stepSub, 2)), num);
}

/* ── 빠른 정보 표 ─────────────────────────────────────────────── */
export function factTable(rows) {
  return `<table class="tbl"><tbody>\n${rows.map((r) => `<tr><th scope="row">${esc(r[0])}</th><td>${r[1]}</td></tr>`).join('\n')}\n</tbody></table>`;
}

/* ── 자주 묻는 것 ────────────────────────────────────────────────
   ★질문은 **h3 소제목**으로 낸다. AI 가 답을 찾을 때 먼저 보는 자리라
     dl/dt 로 두면 소제목으로 세어지지 않는다. 순번은 h3 **밖에** 둔다. */
export function faqBlock(seedKey, c, n = 5, num = '05') {
  const h = hash(seedKey, 'faq');
  const idx = shuffle(FAQ_POOL.map((_, i) => i), h).slice(0, n);
  const qa = idx.map((i) => {
    const item = FAQ_POOL[i];
    const av = item.a[parseInt(hash(seedKey, 'av', i).substr(0, 3), 16) % item.a.length];
    return { q: item.q(c), a: av(c) };
  });
  const html = tie('faq', 'asked', esc(at(h, SEC.faqTitle, 3)),
    `<div class="qa">\n${qa.map((x, i) => `<div class="qa-i"><span class="qa-n" aria-hidden="true">Q${i + 1}</span><h3 class="qa-q">${esc(x.q)}</h3><p class="qa-a">${esc(x.a)}</p></div>`).join('\n')}\n</div>`,
    esc(at(h, SEC.faqSub, 4)), num);
  return { html, qa };
}

/* ── 안내/주의 ────────────────────────────────────────────────── */
export function noticeBlock(seedKey, num) {
  const h = hash(seedKey, 'nt');
  const items = shuffle(NOTICE, h).slice(0, 4);
  return tie('notice', 'mind', esc(at(h, SEC.noticeTitle, 5)),
    `<ul class="marks">\n${items.map((t) => `<li>${esc(t)}</li>`).join('\n')}\n</ul>`, null, num);
}

/* ── 롱테일 링크 격자 ─────────────────────────────────────────── */
export function longtail(pool, seedKey, n, label, heading, sub, num) {
  const h = hash(seedKey, 'lt');
  const picked = shuffle(pool, h).slice(0, n);
  const items = picked.map((p) => {
    const tpl = ANCHOR[parseInt(hash(seedKey, p.label).substr(0, 3), 16) % ANCHOR.length];
    return `<li><a href="${p.href}">${esc(tpl(p.label))}</a></li>`;
  }).join('\n');
  return tie('longtail', label, heading, `<ul class="rail">\n${items}\n</ul>`, sub || esc(at(h, SEC.ltSub, 6)), num);
}

/* ── 매듭이 다른 자리 ───────────────────────────────────────────
   ★이 사이트의 성격을 가장 잘 보여 주는 칸이다. 거리순 '가까운 동'이 아니라
     **매듭 수가 양끝인 자리**를 건다. */
export function knotKin(sd, g, s, seedKey, num) {
  const pool = g.spots.filter((x) => x.slug !== s.slug);
  if (!pool.length) return '';
  const byKnot = pool.slice().sort((a, b) => b.knot - a.knot);
  const near = pool.slice().sort((a, b) => Math.abs(a.knot - s.knot) - Math.abs(b.knot - s.knot));
  const pick = [];
  const seen = new Set();
  const add = (x) => { if (x && !seen.has(x.slug)) { seen.add(x.slug); pick.push(x); } };
  add(byKnot[0]);
  add(byKnot[byKnot.length - 1]);
  for (const x of byKnot) { if (x.knotTop >= 4) { add(x); break; } }
  for (const x of near.slice(0, 6)) add(x);
  return tie('kin', 'knots', `${esc(g.name)} 안에서 매듭 수가 다른 자리`,
    `<ul class="idx">\n${pick.slice(0, 8).map((x) => `<li><a href="/${sd.slug}/${g.slug}/${x.slug}/"><span class="i-n">${esc(x.name)}</span><span class="i-m">매듭 ${x.knot} · ${x.knotTop}겹</span></a></li>`).join('\n')}\n</ul>`,
    esc(at(hash(seedKey, 'kn'), SEC.knotKinSub)), num);
}

/* ── 구 안의 자리 목록 ──────────────────────────────────────────── */
export function spotIndex(sd, g, seedKey, currentSlug, num) {
  const items = g.spots.map((s) => `<li${s.slug === currentSlug ? ' class="cur"' : ''}><a href="/${sd.slug}/${g.slug}/${s.slug}/"${s.slug === currentSlug ? ' aria-current="page"' : ''}><span class="i-n">${esc(s.name)}</span><span class="i-m">매듭 ${s.knot}</span></a></li>`).join('\n');
  return tie('spotidx', 'places', `${esc(g.name)}에 쪽을 낸 자리 ${g.spotCount}곳`,
    `<ul class="idx">\n${items}\n</ul>`,
    esc(at(hash(seedKey, 'sx'), SEC.spotIdxSub)), num);
}

/* ── 시군구 안의 면 목록 ───────────────────────────────────────── */
export function myeonList(g, seedKey, num) {
  if (!g.myeonCount) return '';
  return tie('myeon', 'myeon', `${esc(g.name)}에 딸린 면 ${g.myeonCount}곳`,
    `<ul class="nmz">\n${g.myeon.map((m) => `<li>${esc(m)}</li>`).join('\n')}\n</ul>`,
    esc(at(hash(seedKey, 'my'), SEC.myeonSub)), num);
}

/* ── 서브 지역 시군구 안의 동 이름 ─────────────────────────────── */
export function dongNameList(g, seedKey, num) {
  if (!g.dongNames || !g.dongNames.length) return '';
  return tie('dongidx', 'dong', `${esc(g.name)}에 속한 동 ${g.dongNames.length}곳`,
    `<ul class="nmz">\n${g.dongNames.map((d) => `<li>${esc(d)}</li>`).join('\n')}\n</ul>`,
    esc(at(hash(seedKey, 'dn'), SEC.dongSub)), num);
}

/* ── 시도 안의 시군구 목록 ────────────────────────────────────── */
export function guIndex(sd, seedKey, currentSlug, num) {
  const items = sd.gu.map((g) => `<li${g.slug === currentSlug ? ' class="cur"' : ''}><a href="/${sd.slug}/${g.slug}/"${g.slug === currentSlug ? ' aria-current="page"' : ''}><span class="i-n">${esc(g.name)}</span><span class="i-m">동 ${g.dongCount}${g.myeonCount ? ` / 면 ${g.myeonCount}` : ''}</span></a></li>`).join('\n');
  return tie('guidx', 'districts', `${esc(sd.name)}${josa(sd.name, '을/를')} 이루는 시군구 ${sd.gu.length}곳`,
    `<ul class="idx">\n${items}\n</ul>`,
    esc(at(hash(seedKey, 'gi'), SEC.guIdxSub)), num);
}

/* ── 옆 시군구 (길을 거는 용도) ──────────────────────────────── */
export function nearList(sd, g, seedKey, num) {
  if (!g.nearCount) return '';
  const items = g.near.map((t) => `<li><a href="/${t.sidoSlug}/${t.slug}/">${esc(t.gu)}<span>${t.same ? esc(sd.name) : '시도 밖'}</span></a></li>`).join('\n');
  return tie('near', 'next', `${esc(g.name)} 바로 옆 시군구 ${g.nearCount}곳`,
    `<ul class="nbr">\n${items}\n</ul>`,
    '테두리에 붙은 주소는 옆 시군구에서 건너오는 편이 빠른 날이 있습니다.', num);
}

/* ── 아래쪽 안내 링크 (글·약관 등 얕은 쪽용) ─────────────────── */
export function siteLinks(ctx, seedKey) {
  const { regions } = ctx;
  const h = hash(seedKey, 'sl');
  const all = [];
  for (const r of regions) for (const g of r.gu) for (const s of g.spots) all.push({ r, g, s });
  const spots = shuffle(all, h).slice(0, 12);
  return tie('also', 'more', '이어서 볼 곳',
    `<ul class="rail">
      <li><a href="/area/">받는 자리 모두</a></li>
      <li><a href="/guide/">이용안내</a></li>
      <li><a href="/price/">금액</a></li>
      <li><a href="/course/">코스</a></li>
      <li><a href="/magazine/">노트</a></li>
      ${regions.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('\n')}
      ${spots.map((x) => `<li><a href="/${x.r.slug}/${x.g.slug}/${x.s.slug}/">${esc(x.g.name)} ${esc(x.s.name)}</a></li>`).join('\n')}
    </ul>`,
    '차례는 시도에서 시군구로 이어지고, 수도권과 부산만 동·읍 한 층을 더 둡니다. 면과 서브 지역의 동은 이름으로만 목록에 걸려 있습니다.');
}
