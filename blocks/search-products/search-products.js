// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'Pantofi alergare trail barbati Hoka Challenger 8 Wide SS 2026',
    description: 'Wide-fit trail running shoe for men.',
    image_url: 'https://media.sportguru.ro/media/catalog/product/1/_/1_62d9fdfd-b14b-41ee-b5c6-3429a1bded29_1_1.jpg?width=304&height=219&store=default&image-type=small_image',
    price: '785,00 Lei',
    category: 'Running Shoes',
  },
  {
    name: 'Pantofi alergare trail barbati Hoka Rocket X Trail',
    description: 'Performance trail racing shoe for men.',
    image_url: 'https://media.sportguru.ro/media/catalog/product/1/1/1176330-nzn_1_1__1.jpg?width=304&height=219&store=default&image-type=small_image',
    price: '1.175,00 Lei',
    category: 'Running Shoes',
  },
  {
    name: 'Pantofi alergare barbati Nike Vomero Premium SS 2026',
    description: 'Premium cushioned road running shoe for men.',
    image_url: 'https://media.sportguru.ro/media/catalog/product/n/i/nike_vomero_premium_adidas_2.jpg?width=304&height=219&store=default&image-type=small_image',
    price: '1.334,00 Lei',
    category: 'Running Shoes',
  },
  {
    name: 'Ceas Garmin Forerunner 170 Music',
    description: 'GPS running watch with onboard music storage.',
    image_url: 'https://media.sportguru.ro/media/catalog/product/0/1/010-03920-11_1__1.jpg?width=304&height=219&store=default&image-type=small_image',
    price: 'de la 1.789,00 Lei',
    category: 'Sports Watches',
  },
  {
    name: 'Ceas Huawei Watch Fit 5 Pro',
    description: 'Smartwatch with fitness and activity tracking.',
    image_url: 'https://media.sportguru.ro/media/catalog/product/f/i/fit_5_pro_orange_1_1.jpg?width=304&height=219&store=default&image-type=small_image',
    price: 'de la 1.399,00 Lei',
    category: 'Sports Watches',
  },
  {
    name: 'Ceas Garmin Quatix 8 Pro AMOLED - 47 mm',
    description: 'Premium marine and multisport GPS smartwatch.',
    image_url: 'https://media.sportguru.ro/media/catalog/product/c/1/c18cd661-b6b1-4283-9792-5512d4e8b8b7_1_1.jpg?width=304&height=219&store=default&image-type=small_image',
    price: '6.539,00 Lei',
    category: 'Sports Watches',
  },
  {
    name: 'Ceas iGPSPORT LW10',
    description: 'Affordable GPS smartwatch for sport tracking.',
    image_url: 'https://media.sportguru.ro/media/catalog/product/s/m/smartwatch-igpsport-lw10-titanium_5__1_1.jpg?width=304&height=219&store=default&image-type=small_image',
    price: 'de la 599,00 Lei',
    category: 'Sports Watches',
  },
];

// Brand palette from BuildWidgetRequest.
// getThemedCardBg() darkens palette[0] to luminance <= 0.12 so white text has WCAG AA contrast.
const PALETTE = ['#6100a2', '#3de525'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}

const theme = getThemedCardBg(PALETTE);
const ACCENT = PALETTE[0] || '#2563eb';
const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

export default async function decorate(block, bridge) {
  let items;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      items = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.products — bare array outputSchema; key derived from actionName "search_products"
      items = structuredContent?.products || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  block.textContent = '';
  renderItems(block, items, bridge);

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

function renderItems(block, items, bridge) {
  const list = (items || []).slice(0, 5);

  const wrapper = document.createElement('div');
  wrapper.className = 'search-products-carousel-wrapper';

  const track = document.createElement('div');
  track.className = 'search-products-track';

  list.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'search-products-card';

    const imageWrap = document.createElement('div');
    imageWrap.className = 'search-products-image';
    const fallbackColor = CARD_COLORS[i % CARD_COLORS.length];
    const colorDiv = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
      return d;
    };
    if (item.image_url) {
      const img = document.createElement('img');
      img.src = item.image_url;
      img.alt = item.name || '';
      img.loading = 'lazy';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => { if (img.parentNode) img.parentNode.replaceChild(colorDiv(), img); };
      imageWrap.appendChild(img);
    } else {
      imageWrap.appendChild(colorDiv());
    }
    card.appendChild(imageWrap);

    const info = document.createElement('div');
    info.className = 'search-products-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

    if (item.category) {
      const badge = document.createElement('span');
      badge.className = 'search-products-badge';
      badge.textContent = item.category;
      badge.style.background = ACCENT;
      info.appendChild(badge);
    }

    const title = document.createElement('h3');
    title.className = 'search-products-name';
    title.textContent = item.name || '';
    info.appendChild(title);

    if (item.description) {
      const desc = document.createElement('p');
      desc.className = 'search-products-desc';
      desc.textContent = item.description;
      info.appendChild(desc);
    }

    const priceRow = document.createElement('div');
    priceRow.className = 'search-products-price-row';
    const price = document.createElement('span');
    price.className = 'search-products-price';
    price.textContent = item.price || '';
    priceRow.appendChild(price);
    info.appendChild(priceRow);

    const cta = document.createElement('button');
    cta.className = 'search-products-cta';
    cta.type = 'button';
    cta.textContent = 'Vezi detalii';
    cta.style.background = ACCENT;
    if (bridge) {
      cta.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about ${item.name}`);
      });
    }
    info.appendChild(cta);

    card.appendChild(info);
    track.appendChild(card);
  });

  wrapper.appendChild(track);

  const fade = document.createElement('div');
  fade.className = 'search-products-fade';
  fade.style.background = `linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc)`;
  wrapper.appendChild(fade);

  const mkArrow = (dir) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `search-products-arrow search-products-arrow-${dir}`;
    btn.textContent = dir === 'left' ? '◀' : '▶';
    btn.setAttribute('aria-label', dir === 'left' ? 'Scroll left' : 'Scroll right');
    const scroll = () => {
      const amount = 220 + 16;
      track.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    };
    btn.addEventListener('click', scroll);
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scroll(); }
    });
    return btn;
  };
  const leftArrow = mkArrow('left');
  const rightArrow = mkArrow('right');
  wrapper.appendChild(leftArrow);
  wrapper.appendChild(rightArrow);

  const updateArrows = () => {
    const atStart = track.scrollLeft <= 2;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    leftArrow.style.display = atStart ? 'none' : 'flex';
    rightArrow.style.display = atEnd ? 'none' : 'flex';
    fade.style.display = atEnd ? 'none' : 'block';
  };
  track.addEventListener('scroll', updateArrows);
  setTimeout(updateArrows, 0);

  block.appendChild(wrapper);
}
