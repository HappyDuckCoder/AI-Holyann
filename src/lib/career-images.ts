/**
 * Curated Unsplash image URLs for career/job categories.
 * Mỗi ngành có nhiều ảnh; chọn theo hash(title) để mỗi nghề có ảnh khác nhau.
 */
const BASE = "https://images.unsplash.com";

/** Nhiều ảnh theo nhóm ngành - dùng hash(title) để chọn ảnh riêng cho từng nghề */
const IMAGES_BY_CATEGORY: Record<string, string[]> = {
  "kỹ thuật": [
    `${BASE}/photo-1581091226825-a6a2a5aee158?w=400&h=240&fit=crop`,
    `${BASE}/photo-1504328345606-18bbc8c9d7d1?w=400&h=240&fit=crop`,
    `${BASE}/photo-1581092918484-8313a1b5614c?w=400&h=240&fit=crop`,
    `${BASE}/photo-1504307651254-35680f356dfd?w=400&h=240&fit=crop`,
    `${BASE}/photo-1518770660439-4636190af475?w=400&h=240&fit=crop`,
    `${BASE}/photo-1531482615713-2afd69097998?w=400&h=240&fit=crop`,
  ],
  "công nghệ thông tin": [
    `${BASE}/photo-1498050108023-c5249f4df085?w=400&h=240&fit=crop`,
    `${BASE}/photo-1461749280684-dccba630e2f6?w=400&h=240&fit=crop`,
    `${BASE}/photo-1517694712202-14dd9538aa97?w=400&h=240&fit=crop`,
    `${BASE}/photo-1504639729680-9d91251842bc?w=400&h=240&fit=crop`,
  ],
  "y tế": [
    `${BASE}/photo-1579684385127-1ef15d508118?w=400&h=240&fit=crop`,
    `${BASE}/photo-1551076805-e1869033e561?w=400&h=240&fit=crop`,
    `${BASE}/photo-1576091160399-112ba8d25d1d?w=400&h=240&fit=crop`,
  ],
  "kinh doanh": [
    `${BASE}/photo-1556761175-b413da4baf72?w=400&h=240&fit=crop`,
    `${BASE}/photo-1554224155-6726b3ff858f?w=400&h=240&fit=crop`,
    `${BASE}/photo-1557804506-669a67965ba0?w=400&h=240&fit=crop`,
  ],
  "giáo dục": [
    `${BASE}/photo-1522202176988-66273c2fd55f?w=400&h=240&fit=crop`,
    `${BASE}/photo-1509062522246-3755977927d7?w=400&h=240&fit=crop`,
    `${BASE}/photo-1523240795612-9a054b0db644?w=400&h=240&fit=crop`,
  ],
  "khoa học": [
    `${BASE}/photo-1532094349884-543bc11b234d?w=400&h=240&fit=crop`,
    `${BASE}/photo-1567425907913-e048ab735808?w=400&h=240&fit=crop`,
  ],
  "nghệ thuật": [
    `${BASE}/photo-1513364776144-60967b0f800f?w=400&h=240&fit=crop`,
    `${BASE}/photo-1561070791-2526d31cc5b5?w=400&h=240&fit=crop`,
  ],
  "luật": [
    `${BASE}/photo-1589829545856-d10d557cf95f?w=400&h=240&fit=crop`,
  ],
  "xây dựng": [
    `${BASE}/photo-1504307651254-35680f356dfd?w=400&h=240&fit=crop`,
    `${BASE}/photo-1503387762-592deb58ef4e?w=400&h=240&fit=crop`,
  ],
};

const DEFAULT_IMAGES = [
  `${BASE}/photo-1522071820081-009f0129c71c?w=400&h=240&fit=crop`,
  `${BASE}/photo-1556761175-b413da4baf72?w=400&h=240&fit=crop`,
  `${BASE}/photo-1497366216548-37526070297c?w=400&h=240&fit=crop`,
  `${BASE}/photo-1600880292203-757bb62b4baf?w=400&h=240&fit=crop`,
];

/** Hash chuỗi thành số nguyên ổn định để chọn ảnh */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function normalize(s: string): string {
  return (s || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/**
 * Mỗi ngành nghề 1 ảnh: chọn từ nhiều ảnh theo category, index = hash(title) % length.
 */
export function getCareerImageUrl(title: string, category: string): string {
  const cat = normalize(category);
  const tit = normalize(title);
  const key = Object.keys(IMAGES_BY_CATEGORY).find(
    (k) => cat.includes(k) || k.includes(cat) || tit.includes(k)
  );
  const pool = key ? IMAGES_BY_CATEGORY[key] : DEFAULT_IMAGES;
  const idx = hashString(title || category || "") % pool.length;
  return pool[idx];
}

/**
 * Link tìm hiểu thêm về nghề (Google search).
 */
export function getCareerLearnMoreUrl(jobTitle: string): string {
  const q = encodeURIComponent(`${jobTitle} career nghề nghiệp`);
  return `https://www.google.com/search?q=${q}`;
}
