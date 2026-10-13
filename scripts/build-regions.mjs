/**
 * 행정동 경계(admdongkor, CC BY 4.0) → data/regions.json
 *
 * 커버리지는 두 층이다.
 *   **메인** 서울·인천·경기·부산 — 동·읍마다 쪽을 낸다.
 *   **서브** 대전·대구·울산 전역 + 광주 광산구 + 지정 시·군 — 시군구까지만.
 *   면(面)은 어느 층에서도 쪽을 내지 않는다. 이름만 적고 접수는 받는다.
 *
 * ★★이 사이트가 쓰는 사실은 **매듭점**이다.
 *   매듭 = 행정동 경계선 **셋 이상이 한 점에서 만나는 자리**.
 *   경계 꼭짓점 하나를 세 동 이상이 함께 쥐고 있으면 그 점이 매듭이다.
 *   둘만 쥔 점은 그냥 맞댄 선이라 매듭으로 세지 않는다.
 *
 *   앞서 만든 여섯 사이트가 이미 쓴 축 — 중심점 거리·방위·면적순위·행정동 수·
 *   구 사이 거리·끝과 끝 거리·경계 맞닿음·가로세로 폭·둘레·뭉침 정도·안쪽 깊이.
 *   매듭은 그 어느 것과도 다른 값이다. 맞닿음이 **쌍**을 세는 값이라면
 *   매듭은 **점**을 세는 값이고, 셋이 모인 자리만 골라낸다.
 *
 *   node scripts/build-regions.mjs [경로/HangJeongDong.geojson]
 */
import fs from 'node:fs';
import path from 'node:path';
import { adminSlug } from './romanize.mjs';

const VERSION = 'HangJeongDong_ver20260701';
const SRC = process.argv[2] || '/tmp/hjd.geojson';
const OUT = path.join(process.cwd(), 'data', 'regions.json');

/* ── 커버리지 ──────────────────────────────────────────────── */
const MAIN = {
  서울: { full: '서울특별시', alias: '서울시', slug: 'seoul', iso: 'KR-11', src: '서울특별시' },
  인천: { full: '인천광역시', alias: '인천시', slug: 'incheon', iso: 'KR-28', src: '인천광역시' },
  경기: { full: '경기도', alias: '경기', slug: 'gyeonggi', iso: 'KR-41', src: '경기도' },
  부산: { full: '부산광역시', alias: '부산시', slug: 'busan', iso: 'KR-26', src: '부산광역시' },
};
const SUB = {
  대전: { full: '대전광역시', alias: '대전시', slug: 'daejeon', iso: 'KR-30', src: '대전광역시', all: true },
  대구: { full: '대구광역시', alias: '대구시', slug: 'daegu', iso: 'KR-27', src: '대구광역시', all: true },
  울산: { full: '울산광역시', alias: '울산시', slug: 'ulsan', iso: 'KR-31', src: '울산광역시', all: true },
  광주: { full: '광주광역시', alias: '광주시', slug: 'gwangju', iso: 'KR-29', src: '전남광주통합특별시', only: ['광산구'] },
  충남: { full: '충청남도', alias: '충남', slug: 'chungnam', iso: 'KR-44', src: '충청남도', only: ['천안시', '당진시', '공주시', '논산시'] },
  충북: { full: '충청북도', alias: '충북', slug: 'chungbuk', iso: 'KR-43', src: '충청북도', only: ['청주시', '제천시', '진천군', '증평군', '옥천군'] },
  강원: { full: '강원특별자치도', alias: '강원', slug: 'gangwon', iso: 'KR-42', src: '강원특별자치도', only: ['강릉시'] },
  전북: { full: '전북특별자치도', alias: '전북', slug: 'jeonbuk', iso: 'KR-45', src: '전북특별자치도', only: ['전주시', '군산시', '익산시', '정읍시'] },
  전남: { full: '전라남도', alias: '전남', slug: 'jeonnam', iso: 'KR-46', src: '전남광주통합특별시', only: ['여수시', '순천시', '광양시', '나주시', '함평군', '영광군'] },
  경북: { full: '경상북도', alias: '경북', slug: 'gyeongbuk', iso: 'KR-47', src: '경상북도', only: ['포항시', '구미시', '김천시', '성주군', '경주시', '영천시', '경산시'] },
  경남: { full: '경상남도', alias: '경남', slug: 'gyeongnam', iso: 'KR-48', src: '경상남도', only: ['양산시', '김해시'] },
};
/* 경계 자료가 광주·전남을 `전남광주통합특별시` 한 덩어리로 묶어 두었다. 다섯 구가 광주다. */
const GWANGJU_GU = new Set(['광산구', '남구', '동구', '북구', '서구']);
/* 메인 시도 안이라도 섬·산골만 있는 군은 뺀다(옹진군은 전부 섬, 군위군은 전부 읍·면). */
const DROP_GU = new Set(['인천|옹진군', '대구|군위군']);

/* ── 기하 ─────────────────────────────────────────────────── */
const R = 6371.0088;
const rad = (d) => (d * Math.PI) / 180;
function haversine(a, b) {
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}
function ringStats(ring, lat0) {
  const kx = Math.cos(rad(lat0)) * 111.32, ky = 110.574;
  let a = 0, cx = 0, cy = 0;
  for (let i = 0, n = ring.length - 1; i < n; i++) {
    const x1 = ring[i][0] * kx, y1 = ring[i][1] * ky;
    const x2 = ring[i + 1][0] * kx, y2 = ring[i + 1][1] * ky;
    const f = x1 * y2 - x2 * y1;
    a += f; cx += (x1 + x2) * f; cy += (y1 + y2) * f;
  }
  a /= 2;
  if (!a) return { area: 0, cx: 0, cy: 0 };
  return { area: a, cx: cx / (6 * a), cy: cy / (6 * a), kx, ky };
}
function shapeStats(geom) {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  const lat0 = polys[0][0][0][1];
  let A = 0, X = 0, Y = 0, kx = 0, ky = 0;
  for (const poly of polys) {
    poly.forEach((ring, idx) => {
      const st = ringStats(ring, lat0);
      if (!st.area) return;
      kx = st.kx; ky = st.ky;
      const sign = (idx === 0 ? 1 : -1) * Math.abs(st.area);
      A += sign; X += st.cx * sign; Y += st.cy * sign;
    });
  }
  if (!A) return null;
  return { area: Math.abs(A), lng: (X / A) / kx, lat: (Y / A) / ky };
}
/** 조각 수 — 본 조각 말고 섬·비지가 더 있는지. 바깥 고리만 센다. */
function partsOf(geom) {
  return geom.type === 'Polygon' ? 1 : geom.coordinates.length;
}
const r6 = (v) => Math.round(v * 1e6) / 1e6;
const r1 = (v) => Math.round(v * 10) / 10;
const r2 = (v) => Math.round(v * 100) / 100;
const pretty = (n) => n.replace(/^(.+?시)(.+구)$/, '$1 $2');
const kindOf = (n) => (/읍$/.test(n) ? '읍' : /면$/.test(n) ? '면' : '동');

/* ── 읽기 ─────────────────────────────────────────────────── */
const geo = JSON.parse(fs.readFileSync(SRC, 'utf8'));

function sidoOf(p) {
  for (const [short, m] of Object.entries(MAIN)) {
    if (m.src !== p.sidonm) continue;
    if (DROP_GU.has(`${short}|${p.sggnm}`)) return [null, null, false];
    return [short, m, true];
  }
  for (const [short, m] of Object.entries(SUB)) {
    if (m.src !== p.sidonm) continue;
    if (m.src === '전남광주통합특별시') {
      const isGwangju = GWANGJU_GU.has(p.sggnm);
      if (short === '광주' && !isGwangju) continue;
      if (short === '전남' && isGwangju) continue;
    }
    if (m.only && !m.only.some((x) => p.sggnm.startsWith(x))) continue;
    if (DROP_GU.has(`${short}|${p.sggnm}`)) continue;
    return [short, m, false];
  }
  return [null, null, false];
}

/* 꼭짓점 하나를 몇 동이 함께 쥐고 있는지 — 전국 전체를 훑는다.
   커버리지 안쪽만 보면 시도 경계에 걸린 매듭이 통째로 사라진다. */
const vkey = (c) => `${c[0].toFixed(6)},${c[1].toFixed(6)}`;
const vertex = new Map();                   // 꼭짓점 → Set(행정동코드)
const byCode = new Map();
const buckets = new Map();

for (const ft of geo.features) {
  const p = ft.properties;
  const code = String(p.adm_cd2);
  const name = String(p.adm_nm).trim().split(/\s+/).pop();
  const polys = ft.geometry.type === 'Polygon' ? [ft.geometry.coordinates] : ft.geometry.coordinates;
  const vs = new Set();
  for (const poly of polys) for (const ring of poly) for (const c of ring) vs.add(vkey(c));
  for (const k of vs) {
    if (!vertex.has(k)) vertex.set(k, new Set());
    vertex.get(k).add(code);
  }
  const [sidoKey, meta, isMain] = sidoOf(p);
  const st = shapeStats(ft.geometry);
  if (!st) continue;
  const rec = {
    code, name, kind: kindOf(name), sidoKey, isMain,
    sggnm: p.sggnm, sidonm: p.sidonm,
    lat: r6(st.lat), lng: r6(st.lng), area: r2(st.area),
    parts: partsOf(ft.geometry),
  };
  byCode.set(code, rec);
  if (!sidoKey) continue;
  const k = `${sidoKey}|${p.sggnm}`;
  if (!buckets.has(k)) buckets.set(k, []);
  buckets.get(k).push(rec);
}

/* ── 매듭 ──────────────────────────────────────────────────
   셋 이상이 함께 쥔 꼭짓점이 매듭이다. 같은 세 동이 두 점에서 만나는 일이 드물게
   있으므로 **참여한 동 집합**으로 한 번 더 묶어 같은 매듭을 두 번 세지 않는다. */
const knotSets = new Map();                 // '코드,코드,코드' → Set(코드)
for (const set of vertex.values()) {
  if (set.size < 3) continue;
  const key = [...set].sort().join(',');
  if (!knotSets.has(key)) knotSets.set(key, set);
}
const knotOf = new Map();                   // 코드 → 매듭키 배열
for (const [key, set] of knotSets) {
  for (const c of set) {
    if (!knotOf.has(c)) knotOf.set(c, []);
    knotOf.get(c).push(key);
  }
}
/** 그 코드가 낀 매듭 가운데 가장 많은 동이 모인 매듭의 동 수 */
function knotStat(code) {
  const ks = knotOf.get(code) || [];
  let top = 0, big = 0;
  for (const k of ks) {
    const n = knotSets.get(k).size;
    if (n > top) top = n;
    if (n >= 4) big++;
  }
  return { count: ks.length, top, big };
}
/* 시군구 매듭 — 같은 점에서 시군구가 셋 이상 만나는 자리(삼군점) */
const codeSgg = new Map();
for (const [code, r] of byCode) codeSgg.set(code, `${r.sidonm}|${r.sggnm}`);
const guKnotSets = new Map();
for (const set of vertex.values()) {
  if (set.size < 3) continue;
  const gus = new Set();
  for (const c of set) { const k = codeSgg.get(c); if (k) gus.add(k); }
  if (gus.size < 3) continue;
  const key = [...gus].sort().join('/');
  if (!guKnotSets.has(key)) guKnotSets.set(key, gus);
}
const guKnotOf = new Map();                 // '시도|시군구' → 매듭키 배열
for (const [key, gus] of guKnotSets) {
  for (const g of gus) {
    if (!guKnotOf.has(g)) guKnotOf.set(g, []);
    guKnotOf.get(g).push(key);
  }
}

/* ── 시군구 묶기 ──────────────────────────────────────────── */
const guAll = [];
const spotAll = [];
for (const [k, list] of buckets) {
  const [sidoKey, rawName] = k.split('|');
  const isMain = !!MAIN[sidoKey];
  const name = pretty(rawName);
  let A = 0, X = 0, Y = 0;
  for (const d of list) { A += d.area; X += d.lng * d.area; Y += d.lat * d.area; }
  const spots = list.filter((d) => d.kind !== '면');
  const myeon = list.filter((d) => d.kind === '면').map((d) => d.name).sort((a, b) => a.localeCompare(b, 'ko'));
  const sggKey = `${list[0].sidonm}|${list[0].sggnm}`;
  const gKnots = guKnotOf.get(sggKey) || [];
  const g = {
    sidoKey, main: isMain, name, raw: rawName, slug: adminSlug(name), sggKey,
    lat: r6(Y / A), lng: r6(X / A), area: r1(A),
    dongCount: list.length, myeon, myeonCount: myeon.length,
    spots: [],
    dongNames: isMain ? [] : list.filter((d) => d.kind !== '면').map((d) => d.name).sort((a, b) => a.localeCompare(b, 'ko')),
    codes: list.map((d) => d.code),
    /* 이 시군구가 낀 삼군점 — 세 시군구 이상이 한 점에서 만나는 자리 */
    guKnot: gKnots.length,
    guKnotTop: gKnots.reduce((m, x) => Math.max(m, guKnotSets.get(x).size), 0),
  };
  if (isMain) {
    const used = new Set();
    for (const d of spots) {
      let sl = adminSlug(d.name);
      if (used.has(sl)) { let i = 2; while (used.has(`${sl}-${i}`)) i++; sl = `${sl}-${i}`; }
      used.add(sl);
      const ks = knotStat(d.code);
      const s = {
        name: d.name, kind: d.kind, slug: sl, code: d.code,
        lat: d.lat, lng: d.lng, area: d.area, parts: d.parts,
        knot: ks.count, knotTop: ks.top, knotBig: ks.big,
      };
      g.spots.push(s); spotAll.push(s);
    }
  }
  g.spotCount = g.spots.length;
  /* 이 시군구 안 동들이 낀 매듭을 겹치지 않게 모은다 */
  {
    const uniq = new Set();
    for (const c of g.codes) for (const kk of (knotOf.get(c) || [])) uniq.add(kk);
    g.knotTotal = uniq.size;
    let big = 0;
    for (const kk of uniq) if (knotSets.get(kk).size >= 4) big++;
    g.knotBigTotal = big;
  }
  guAll.push(g);
}

/* 길을 걸 때 쓰는 이웃 — 문장에서는 숫자로 내세우지 않는다(맞닿음은 다른 사이트의 축이다). */
const touchPair = new Map();
for (const set of vertex.values()) {
  if (set.size < 2) continue;
  const arr = [...set];
  for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) {
    for (const [a, b] of [[arr[i], arr[j]], [arr[j], arr[i]]]) {
      if (!touchPair.has(a)) touchPair.set(a, new Map());
      touchPair.get(a).set(b, (touchPair.get(a).get(b) || 0) + 1);
    }
  }
}
const neighborsOf = (code) => {
  const m = touchPair.get(code);
  return m ? [...m.entries()].filter(([, n]) => n >= 2).map(([c]) => c) : [];
};
const codeGu = new Map();
for (const g of guAll) for (const c of g.codes) codeGu.set(c, g);
for (const g of guAll) {
  const set = new Set();
  for (const c of g.codes) for (const n of neighborsOf(c)) {
    const o = codeGu.get(n);
    if (o && o !== g) set.add(o);
  }
  g.near = [...set].map((o) => ({ sidoSlug: (MAIN[o.sidoKey] || SUB[o.sidoKey]).slug, gu: o.name, slug: o.slug, same: o.sidoKey === g.sidoKey }));
  g.nearCount = g.near.length;
}

/* 시군구 안에서 매듭이 극단인 자리 — 쪽에서 바로 쓴다. */
for (const g of guAll) {
  if (!g.spots.length) continue;
  const byKnot = g.spots.slice().sort((a, b) => b.knot - a.knot || a.name.localeCompare(b.name, 'ko'));
  g.mostKnot = byKnot[0].name; g.mostKnotN = byKnot[0].knot; g.mostKnotSlug = byKnot[0].slug;
  g.leastKnot = byKnot[byKnot.length - 1].name; g.leastKnotN = byKnot[byKnot.length - 1].knot;
  g.leastKnotSlug = byKnot[byKnot.length - 1].slug;
  byKnot.forEach((s, i) => { s.knotRank = i + 1; });
  g.splitCount = g.spots.filter((s) => s.parts > 1).length;
}

/* ── 시도 묶기 ────────────────────────────────────────────── */
const sido = [];
for (const [key, m] of [...Object.entries(MAIN), ...Object.entries(SUB)]) {
  const gus = guAll.filter((g) => g.sidoKey === key);
  if (!gus.length) continue;
  let A = 0, X = 0, Y = 0;
  for (const g of gus) { A += g.area; X += g.lng * g.area; Y += g.lat * g.area; }
  gus.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  for (const g of gus) {
    g.spots.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    delete g.sidoKey; delete g.codes; delete g.sggKey;
  }
  sido.push({
    name: key, full: m.full, alias: m.alias, slug: m.slug, iso: m.iso, main: !!MAIN[key],
    lat: r6(Y / A), lng: r6(X / A), area: r1(A),
    dongCount: gus.reduce((s, g) => s + g.dongCount, 0),
    spotCount: gus.reduce((s, g) => s + g.spotCount, 0),
    myeonCount: gus.reduce((s, g) => s + g.myeonCount, 0),
    knotSum: gus.reduce((s, g) => s + g.knotTotal, 0),
    gu: gus,
  });
}

const out = {
  version: VERSION,
  source: 'admdongkor (https://github.com/vuski/admdongkor) · CC BY 4.0 · 원자료 국가공간정보포털 행정동 경계',
  built: new Date().toISOString().slice(0, 10),
  axis: '매듭점 — 행정동 경계 셋 이상이 한 점에서 만나는 자리',
  coverageFrom: '서울·인천·경기·부산은 동과 읍마다 한 칸씩 쪽을 내고, 대전·대구·울산 전역과 광주 광산구, 지정한 시·군은 시군구 선까지만 낸다. 면에는 어느 층에서도 쪽을 내지 않고 이름만 적는다.',
  counts: {
    sido: sido.length,
    sidoMain: sido.filter((s) => s.main).length,
    gu: guAll.length,
    guMain: guAll.filter((g) => g.main).length,
    spot: spotAll.length,
    dong: spotAll.filter((s) => s.kind === '동').length,
    eup: spotAll.filter((s) => s.kind === '읍').length,
    myeon: guAll.reduce((s, g) => s + g.myeonCount, 0),
    admin: guAll.reduce((s, g) => s + g.dongCount, 0),
    knotAll: knotSets.size,
    guKnotAll: guKnotSets.size,
  },
  sido,
};
fs.writeFileSync(OUT, JSON.stringify(out));
const C = out.counts;
console.log(`시도 ${C.sido}(메인 ${C.sidoMain}) · 시군구 ${C.gu}(메인 ${C.guMain}) · 거점 ${C.spot} = 동 ${C.dong} + 읍 ${C.eup} · 면 ${C.myeon} · 행정동 합 ${C.admin}`);
console.log(`매듭(전국) ${C.knotAll} · 삼군점(전국) ${C.guKnotAll}`);
for (const s of sido) console.log(`   ${s.main ? '■' : '□'} ${s.name.padEnd(3)} 시군구 ${String(s.gu.length).padStart(2)} · 거점 ${String(s.spotCount).padStart(4)} · 면 ${String(s.myeonCount).padStart(3)} · 매듭 ${s.knotSum}`);
const zero = spotAll.filter((s) => !s.knot);
if (zero.length) console.log(`★매듭이 하나도 없는 거점 ${zero.length}곳: ${zero.slice(0, 12).map((s) => s.name).join(', ')}`);
const multi = spotAll.filter((s) => s.parts > 1);
console.log(`조각이 둘 이상인 거점 ${multi.length}곳 · 최대 ${Math.max(...spotAll.map((s) => s.parts))}조각`);
