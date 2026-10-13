/**
 * 타이틀·디스크립션 정본.
 *
 * ★토막 모양을 앞선 여섯 사이트와 전부 다르게 둔다. 같은 뼈대에 단어만 갈면 그것도 중복이다.
 *     루네사       `{동} 출장 {코스어} 마사지·홈타이 - 루네사 | {시도} {행동어}`
 *     리바이브모션 `{구} 출장마사지 {코스어} 홈타이 | {시도} {구} 방문 {행동어} - 리바이브모션`
 *     세린터치     `{동} 출장마사지 홈타이 {코스어} · {구} {동} 방문 {행동어} | 세린터치`
 *     벨벳럽       `{동} {코스어} 출장마사지 홈타이 — {구} {동} 방문 {행동어} · 벨벳럽`
 *     마루온       `{동} 출장마사지·홈타이 {코스어} | {구} {동} {행동어} — 마루온`
 *     바이탈리즈   `{동} 출장마사지 홈타이 ({구}) · {코스어} {행동어} | 바이탈리즈`
 *     블리스놋     `{구} {동} 출장마사지 홈타이 — {코스어} {행동어} | 블리스놋`
 *   ★앞머리를 **시군구부터** 시작하는 모양은 여기서 처음 쓴다. 여섯 곳 모두 동 이름으로 연다.
 * ★'마사지'는 제목에 한 번만 넣는다(스터핑 방지).
 * ★'여성전용마사지'는 쓰지 않는다 — 업소를 싣지 않아 뒷받침할 자료가 없다.
 * ★설명문은 **100자 안쪽**으로 둔다(80자 안팎이 가장 안전하다). 가운데 토막은
 *   그 자리에서만 나오는 실측값(매듭 수·겹수·넓이)으로 채워 전부 달라지게 한다.
 */
import { hash, km2, josa } from './util.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

export const BRAND = '블리스놋';
const KEY = '출장마사지 홈타이';

/** 제목에 끼우는 코스어 — 실제로 받는 여덟 가지에서만 돌린다. */
const COURSE_WORD = ['스웨디시', '아로마', '타이', '딥티슈', '림프', '경락', '건식', '등어깨'];
/** 제목 꼬리 행동어 */
const ACT = ['매듭 보기', '몇 분 걸리나', '한밤 접수', '지금 거십시오', '오늘도 갑니다'];

/* ── 제목 ─────────────────────────────────────────────────────────── */
export const title = {
  home: () => `${BRAND} ${KEY} — 서울 인천 경기 부산 동읍 방문 관리 24시 | 지금 거십시오`,
  areaHub: (c) => `받는 자리 동읍 ${c.spot}곳 ${KEY} — 시군구 ${c.gu}곳 전체 목록 | ${BRAND}`,
  sido: (sd) => `${sd.name} ${KEY} — ${sd.main ? `동읍 ${sd.spotCount}곳` : `시군구 ${sd.gu.length}곳`} 방문 ${at(hash(sd.name, 'sdt'), ACT)} | ${BRAND}`,
  gu: (sd, g) => {
    const h = hash(sd.name, g.name, 'gt');
    return `${sd.name} ${g.name} ${KEY} — ${g.main ? `동읍 ${g.spotCount}곳` : `행정동 ${g.dongCount}곳`} ${at(h, ACT, 0)} | ${BRAND}`;
  },
  spot: (sd, g, s) => {
    const h = hash(sd.name, g.name, s.name, 'st');
    return `${g.name} ${s.name} ${KEY} — ${at(h, COURSE_WORD, 0)} ${at(h, ACT, 1)} | ${BRAND}`;
  },
  course: (c) => `${c.ko} ${KEY} — ${c.min}분 ${c.price.toLocaleString('ko-KR')}원 · 세기 ${c.pressure} | ${BRAND}`,
  sidoCourse: (sd, c) => `${sd.name} ${c.ko} ${KEY} — ${sd.name} 방문 ${at(hash(sd.name, c.slug), ACT)} | ${BRAND}`,
  page: (t) => `${t} | ${BRAND} ${KEY}`,
  post: (p) => `${p.title} | ${BRAND} 매듭 노트`,
};

/* ── 디스크립션 ───────────────────────────────────────────────────── */
/** 동 설명 가운데 토막 — 매듭 수·겹수·넓이로만 짠다. */
function spotMiddle(sd, g, s, h) {
  const frames = [
    () => `셋이 만나는 매듭이 ${s.knot}군데, 가장 큰 매듭은 ${s.knotTop}겹`,
    () => `매듭 ${s.knot}군데에 넓이 ${km2(s.area)}, ${g.name} 안에서 ${s.knotRank}번째`,
    () => `경계가 세 갈래로 갈라지는 지점이 ${s.knot}군데`,
    () => `${s.kind === '읍' ? `${g.name}에서 길이 모이는 읍, 매듭 ${s.knot}군데` : `매듭 ${s.knot}군데·${s.knotTop}겹짜리 자리`}`,
    () => `넓이 ${km2(s.area)}에 매듭 ${s.knot}군데, 드는 길이 갈립니다`,
    () => `${s.knotBig ? `네 겹 넘는 매듭이 ${s.knotBig}군데` : `매듭 ${s.knot}군데가 모두 세 겹`}`,
  ];
  return frames[parseInt(h.substr(6, 3), 16) % frames.length]();
}
const TAIL = [
  '마친 뒤에 셈합니다',
  '미리 보내실 돈이 없습니다',
  '새벽에도 값이 같습니다',
  '길 값을 따로 붙이지 않습니다',
  '값은 끝나고 받습니다',
];
const tailOf = (h) => TAIL[parseInt(h.substr(9, 3), 16) % TAIL.length];

export const desc = {
  home: () =>
    '서울·인천·경기·부산은 동·읍까지, 그 밖 지정 지역은 시군구까지 적은 출장마사지 홈타이 방문 안내. 길이 모이는 매듭부터 짚습니다.',
  areaHub: (c) =>
    `출장마사지 홈타이를 받는 동·읍 ${c.spot}곳과 시군구 ${c.gu}곳. 자리마다 셋이 만나는 매듭 수를 적어 두었습니다.`,
  sido: (sd) =>
    sd.main
      ? `${sd.name} ${KEY} 방문 안내. 시군구 ${sd.gu.length}곳과 동·읍 ${sd.spotCount}곳에 쪽을 냈습니다. 후불이고 24시간 받습니다.`
      : `${sd.name} ${KEY} 방문 안내. 시군구 ${sd.gu.length}곳에 쪽을 냈고 동 이름은 그 안에 있습니다. 후불이고 24시간 받습니다.`,
  gu: (sd, g) => {
    const h = hash(sd.name, g.name, 'gd');
    const mid = g.main
      ? [
        `동·읍 ${g.spotCount}곳에 쪽을 냈고 넓이는 ${km2(g.area)}`,
        g.mostKnot ? `매듭이 가장 많은 자리는 ${g.mostKnot}, ${g.mostKnotN}군데` : `넓이 ${km2(g.area)}`,
        `안쪽에서 잡히는 매듭이 모두 ${g.knotTotal}군데`,
        `${km2(g.area)} 안에 받는 자리 ${g.spotCount}곳`,
      ][parseInt(h.substr(3, 3), 16) % 4]
      : [
        `행정동 ${g.dongCount}곳이 들어 있고 넓이는 ${km2(g.area)}`,
        `매듭 ${g.knotTotal}군데가 잡히는 ${km2(g.area)}`,
        g.myeonCount ? `동 ${g.dongNames.length}곳과 면 ${g.myeonCount}곳 모두 받습니다` : `동 ${g.dongNames.length}곳 어디서나 같은 번호로 받습니다`,
      ][parseInt(h.substr(3, 3), 16) % 3];
    return `${sd.name} ${g.name} ${KEY} 방문. ${mid}. ${tailOf(h)}.`;
  },
  spot: (sd, g, s) => {
    const h = hash(sd.name, g.name, s.name, 'sd');
    return `${sd.name} ${g.name} ${s.name} ${KEY} 방문. ${spotMiddle(sd, g, s, h)}. ${tailOf(h)}.`;
  },
  course: (c) =>
    `${c.ko} 출장 방문 안내. ${c.focus}${josa(c.focus, '을/를')} 보고 세기는 ${c.pressure}입니다. ${c.min}분 ${c.price.toLocaleString('ko-KR')}원, 지역을 타지 않습니다.`,
  sidoCourse: (sd, c) =>
    `${sd.name} ${c.ko} ${KEY} 방문. ${c.focus}에 시간을 쓰고 세기는 ${c.pressure}입니다. ${sd.name} 어디서나 ${c.min}분 ${c.price.toLocaleString('ko-KR')}원.`,
  post: (p) => p.summary,
};

/** 설명이 예산을 넘으면 문장 단위로 자른다. */
export function clampDesc(s, limit = 100) {
  if (s.length <= limit) return s;
  const parts = s.split(/(?<=\.)\s+/);
  let out = '';
  for (const p of parts) {
    if ((out + p).length > limit) break;
    out += (out ? ' ' : '') + p;
  }
  return out || s.slice(0, limit - 1) + '…';
}
