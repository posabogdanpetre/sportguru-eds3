// Sample data for standalone EDS preview (no bridge).
// In production, the single product object comes from bridge.toolResult.
const SAMPLE_ITEM = {
  name: 'Ceas Garmin Forerunner 170 Music',
  description: 'GPS running watch with onboard music storage.',
  image_url: 'https://media.sportguru.ro/media/catalog/product/0/1/010-03920-11_1__1.jpg?width=304&height=219&store=default&image-type=small_image',
  price: 'de la 1.789,00 Lei',
  category: 'Sports Watches',
};

// Brand palette from BuildWidgetRequest. getThemedCardBg() darkens palette[0]
// to luminance <= 0.12 so white text keeps WCAG AA contrast.
const PALETTE = ['#6100a2', '#3de525'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  const [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0; let hi = 1;
  for (let i = 0; i < 20; i += 1) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo); const dg = Math.round(g * lo); const db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}

// Secondary palette color for the CTA, with computed readable text color.
function getCtaColors(palette) {
  const fallback = { bg: '#3de525', fg: '#0a0a0a' };
  if (!palette || !palette[1]) return fallback;
  let hex = palette[1].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return fallback;
  const [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return fallback;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  const rl = 0.2126 * lum(r) + 0.7152 * lum(g) + 0.0722 * lum(b);
  return { bg: `#${hex}`, fg: rl > 0.4 ? '#0a0a0a' : '#ffffff' };
}

const theme = getThemedCardBg(PALETTE);
const cta = getCtaColors(PALETTE);
const FALLBACK_COLOR = '#6100a2';

export default async function decorate(block, bridge) {
  let item;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      item = SAMPLE_ITEM;
    } else {
      // Detail concept — structuredContent IS the item (flat). No wrapper key.
      const _result = await bridge.toolResult;
      item = (_result?.structuredContent || _result) || {};
    }
  } else {
    item = SAMPLE_ITEM;
  }

  block.textContent = '';
  renderDetail(block, item, bridge);

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  }
}

function renderDetail(block, item, bridge) {
  const card = document.createElement('div');
  card.className = 'detail-card';

  // Image (left)
  const imageWrap = document.createElement('div');
  imageWrap.className = 'detail-image';
  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${FALLBACK_COLOR};`;
    return d;
  };
  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || '';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
    imageWrap.appendChild(img);
  } else {
    imageWrap.appendChild(colorDiv());
  }
  card.appendChild(imageWrap);

  // Content (right)
  const content = document.createElement('div');
  content.className = 'detail-content';
  content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

  if (item.category) {
    const badge = document.createElement('span');
    badge.className = 'detail-badge';
    badge.textContent = item.category;
    content.appendChild(badge);
  }

  const title = document.createElement('h3');
  title.className = 'detail-title';
  title.textContent = item.name || '';
  content.appendChild(title);

  if (item.description) {
    const desc = document.createElement('p');
    desc.className = 'detail-desc';
    desc.textContent = item.description;
    content.appendChild(desc);
  }

  if (item.price) {
    const price = document.createElement('div');
    price.className = 'detail-price';
    price.textContent = item.price;
    content.appendChild(price);
  }

  const btn = document.createElement('button');
  btn.className = 'detail-cta';
  btn.type = 'button';
  btn.textContent = 'Adauga in cos';
  btn.style.cssText = `background:${cta.bg};color:${cta.fg};`;
  if (bridge) {
    btn.addEventListener('click', () => {
      bridge.sendMessage(`I'd like to add ${item.name} to my cart`);
    });
  }
  content.appendChild(btn);

  card.appendChild(content);
  block.appendChild(card);
}
