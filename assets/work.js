// Shared script for the work sub-pages.
// Each page sets window.WORK = { type: 'videos' | 'ads' | 'carousels', items: [...] } before loading this file.

// ===== LANGUAGE =====
const EN = {
  "← 返回主页": "← Back to home", "免费咨询": "Free Consultation",
  "作品展示": "Our Work",
  "视频": "Videos", "单图广告": "Single-Image Ads", "懒人包": "Carousels",
  "我们做过的视频内容": "Videos we've made",
  "为本地品牌拍摄与剪辑的短视频，适合 TikTok、Reels 与小红书。点击即可播放。": "Short-form videos shot and edited for local brands — made for TikTok, Reels and Xiaohongshu. Tap to play.",
  "单图广告作品": "Single-image ad work",
  "为 Facebook 与 Instagram 广告设计的单图素材，重点是一眼看懂、让人想点。点击查看大图。": "Single-image creatives designed for Facebook and Instagram ads — clear at a glance and made to get clicks. Tap to enlarge.",
  "懒人包作品": "Carousel work",
  "把复杂信息整理成一组好读、好分享的图文，适合 Instagram 与小红书。点击左右翻看。": "Complex information turned into easy-to-read, shareable carousels for Instagram and Xiaohongshu. Tap and swipe through.",
  "作品即将上传": "Coming soon",
  "想要同样效果的内容？": "Want content like this?",
  "告诉我们你的品牌和目标，我们帮你规划最适合的内容。": "Tell us about your brand and goals — we'll plan the right content for you.",
  "WhatsApp 联系我们 →": "WhatsApp Us →",
  "小红书": "Xiaohongshu"
};
const zhText = new WeakMap();
let lang = 'zh';
function translateStatic() {
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) {
    if (n.parentElement.closest('script,.lang-toggle,[data-dyn]')) continue;
    if (!zhText.has(n)) zhText.set(n, n.nodeValue);
    const orig = zhText.get(n), key = orig.trim();
    if (!key || !(key in EN)) continue;
    n.nodeValue = lang === 'en' ? orig.replace(key, EN[key]) : orig;
  }
}
function t(zh) { return lang === 'en' && EN[zh] ? EN[zh] : zh; }
function applyLang(l) {
  lang = l;
  document.documentElement.lang = l;
  translateStatic();
  document.title = document.querySelector('.work-hero h1').textContent + ' | Deep Build Marketing';
  render();
  try { localStorage.setItem('db-lang', l); } catch (e) {}
}
function toggleLang() { applyLang(lang === 'zh' ? 'en' : 'zh'); }

// ===== GRID =====
const ICONS = {
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6,3 20,12 6,21"/></svg>',
  image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
  stack: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="6" y="6" width="14" height="14" rx="2"/><path d="M4 16V6a2 2 0 012-2h10"/></svg>'
};
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const titleOf = it => (lang === 'en' && it.titleEn) ? it.titleEn : (it.title || '');

function cardHTML(it, i, type) {
  const empty = type === 'videos' ? !it.youtube : type === 'ads' ? !it.img : !(it.imgs && it.imgs.length);
  if (empty) {
    return `<div class="work-card is-empty"><div class="work-thumb"><div class="work-ph">${type === 'carousels' ? ICONS.stack : ICONS.image}</div><span class="coming-soon">Coming Soon</span></div>
      <div class="work-info"><div class="work-client">${esc(it.client || 'Deep Build')}</div><div class="work-title">${esc(titleOf(it) || '—')}</div></div></div>`;
  }
  const cover = type === 'videos' ? `https://img.youtube.com/vi/${esc(it.youtube)}/hqdefault.jpg` : type === 'ads' ? it.img : it.imgs[0];
  const overlay = type === 'videos' ? `<div class="work-play">${ICONS.play}</div>`
    : type === 'carousels' ? `<div class="work-badge">${ICONS.stack.replace('<svg', '<svg width="11" height="11"')} ${it.imgs.length}</div>` : '';
  return `<button class="work-card" type="button" onclick="openItem(${i})">
      <div class="work-thumb"><img src="${esc(cover)}" alt="${esc(titleOf(it))}" loading="lazy">${overlay}</div>
      <div class="work-info"><div class="work-client">${esc(it.client || 'Deep Build')}</div><div class="work-title">${esc(titleOf(it))}</div></div>
    </button>`;
}
function render() {
  const { type, items } = window.WORK;
  const grid = document.getElementById('work-grid');
  grid.dataset.type = type;
  grid.innerHTML = items.map((it, i) => cardHTML(it, i, type)).join('');
  revealAll(grid.children);
}

// ===== LIGHTBOX =====
let cur = null, slide = 0;
function openItem(i) {
  const { type, items } = window.WORK;
  cur = items[i]; slide = 0;
  const lb = document.getElementById('lb');
  lb.dataset.type = type;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
  drawSlide();
}
function drawSlide() {
  const type = window.WORK.type, stage = document.getElementById('lb-stage');
  const prev = document.getElementById('lb-prev'), next = document.getElementById('lb-next'), dots = document.getElementById('lb-dots');
  if (type === 'videos') {
    stage.innerHTML = `<iframe src="https://www.youtube.com/embed/${esc(cur.youtube)}?autoplay=1&rel=0" allow="autoplay;encrypted-media" allowfullscreen></iframe>`;
  } else {
    const imgs = type === 'ads' ? [cur.img] : cur.imgs;
    stage.innerHTML = `<img src="${esc(imgs[slide])}" alt="${esc(titleOf(cur))}">`;
    const many = imgs.length > 1;
    prev.style.display = next.style.display = many ? 'flex' : 'none';
    dots.innerHTML = many ? imgs.map((_, k) => `<i class="${k === slide ? 'on' : ''}"></i>`).join('') : '';
  }
  if (type === 'videos') { prev.style.display = next.style.display = 'none'; dots.innerHTML = ''; }
  document.getElementById('lb-caption').textContent = [cur.client, titleOf(cur)].filter(Boolean).join(' · ');
}
function step(d) {
  if (!cur || !cur.imgs) return;
  slide = (slide + d + cur.imgs.length) % cur.imgs.length;
  drawSlide();
}
function closeLb() {
  document.getElementById('lb').classList.remove('open');
  document.getElementById('lb-stage').innerHTML = '';
  document.body.style.overflow = '';
  cur = null;
}
document.addEventListener('keydown', e => {
  if (!cur) return;
  if (e.key === 'Escape') closeLb();
  if (e.key === 'ArrowRight') step(1);
  if (e.key === 'ArrowLeft') step(-1);
});
(function swipe() {
  let x0 = null;
  document.addEventListener('touchstart', e => { if (cur) x0 = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    x0 = null;
  }, { passive: true });
})();

// ===== MOTION =====
let io = null;
function revealAll(els) {
  if (!('IntersectionObserver' in window)) return;
  if (!io) io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  [...els].forEach((el, k) => {
    el.classList.add('reveal');
    el.style.setProperty('--d', (k % 3) * 0.08 + 's');
    io.observe(el);
  });
}

// ===== INIT =====
(function () {
  let saved = new URLSearchParams(location.search).get('lang');
  if (!saved) { try { saved = localStorage.getItem('db-lang'); } catch (e) {} }
  applyLang(saved === 'en' ? 'en' : 'zh');
  revealAll(document.querySelectorAll('.work-cta > *'));
})();
