// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'SportGuru Unirii',
    address: 'Bulevardul Unirii nr. 69, Bucuresti',
    phone: '0374 050 029',
    hours: 'Luni-Vineri: 10:00-20:00, Sambata: 10:00-17:00',
  },
  {
    name: 'SportGuru Cluj',
    address: 'Strada Ploiesti nr. 39-45, Cluj',
    phone: '0374 027 028',
    hours: 'Luni-Vineri: 10:00-19:00, Sambata: 09:00-16:00',
  },
];

// Brand palette from BuildWidgetRequest — used to derive card background.
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
const ACCENT = PALETTE[0] || '#6100a2';
const ACCENT2 = PALETTE[1] || '#3de525';

function pinIcon(size, color) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', color);
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z');
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', '12');
  circle.setAttribute('cy', '10');
  circle.setAttribute('r', '3');
  svg.appendChild(path);
  svg.appendChild(circle);
  return svg;
}

function renderEmpty(block, bridge) {
  const card = document.createElement('div');
  card.className = 'find-store-empty';
  card.style.cssText = `background:${theme?.bg ?? '#1a3a5c'};color:${theme?.fg ?? '#fff'}`;

  const iconWrap = document.createElement('div');
  iconWrap.className = 'find-store-empty-icon';
  iconWrap.appendChild(pinIcon(40, theme?.fg ?? '#fff'));
  card.appendChild(iconWrap);

  const heading = document.createElement('div');
  heading.className = 'find-store-empty-heading';
  heading.textContent = 'Find a store near you';
  card.appendChild(heading);

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'find-store-input';
  input.placeholder = 'Enter city…';
  card.appendChild(input);

  const btn = document.createElement('button');
  btn.className = 'find-store-search-btn';
  btn.textContent = 'Cauta magazin';
  btn.style.background = ACCENT;
  const submit = () => {
    const val = input.value.trim();
    if (bridge && val) bridge.sendMessage(`Find a SportGuru store in ${val}`);
  };
  btn.addEventListener('click', submit);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
  card.appendChild(btn);

  block.appendChild(card);
}

function renderStores(block, stores) {
  const row = document.createElement('div');
  row.className = 'find-store-row';

  stores.forEach((store) => {
    const card = document.createElement('div');
    card.className = 'find-store-card';
    card.style.cssText = `background:${theme?.bg ?? '#1a3a5c'};color:${theme?.fg ?? '#fff'}`;

    const pin = document.createElement('div');
    pin.className = 'find-store-pin';
    pin.appendChild(pinIcon(18, theme?.fg ?? '#fff'));
    card.appendChild(pin);

    const name = document.createElement('div');
    name.className = 'find-store-name';
    name.textContent = store.name || '';
    card.appendChild(name);

    if (store.address) {
      const addr = document.createElement('div');
      addr.className = 'find-store-address';
      addr.textContent = store.address;
      card.appendChild(addr);
    }

    if (store.phone) {
      const phone = document.createElement('div');
      phone.className = 'find-store-phone';
      phone.textContent = store.phone;
      phone.style.color = ACCENT2;
      card.appendChild(phone);
    }

    if (store.hours) {
      const hours = document.createElement('div');
      hours.className = 'find-store-hours';
      hours.textContent = store.hours;
      card.appendChild(hours);
    }

    row.appendChild(card);
  });

  block.appendChild(row);
}

function render(block, stores, bridge) {
  block.textContent = '';
  if (stores && stores.length) {
    renderStores(block, stores);
  } else {
    renderEmpty(block, bridge);
  }
}

export default async function decorate(block, bridge) {
  let stores;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      stores = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.stores — bare array outputSchema; key derived from actionName "find_store"
      stores = structuredContent?.stores || [];
    }
    render(block, stores, bridge);
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  } else {
    stores = SAMPLE_DATA;
    render(block, stores, bridge);
  }
}
