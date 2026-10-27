const byId = (id) => document.getElementById(id);
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.textContent = open ? '×' : '☰';
  });
  mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    mainNav.classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.textContent = '☰';
  }));
}
let projects = [];
let activeFilter = 'all';
const DEFAULT_CATEGORIES = ['Кухни', 'Гостиные', 'Прихожие', 'Мебель для санузла', 'Мебель для школ и офисов', 'Стеллажи', 'Кабинеты', 'Шкафы и гардеробные', 'Диваны', 'Пуфики', 'Кресла', 'Кровати', 'Другое'];
function esc(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function selectedCategories() {
  if (activeFilter === 'all') return null;
  return Array.isArray(activeFilter) ? activeFilter : [activeFilter];
}
function renderFilters() {
  const box = byId('portfolio-filters');
  if (!box) return;
  const categories = [...new Set([...DEFAULT_CATEGORIES, ...projects.map(p => p.category).filter(Boolean)])];
  const selected = selectedCategories();
  box.innerHTML = `<button class="filter-chip ${activeFilter === 'all' ? 'active' : ''}" type="button" data-filter="all">Все проекты</button>` + categories.map(c => `<button class="filter-chip ${selected && selected.includes(c) ? 'active' : ''}" type="button" data-filter="${esc(c)}">${esc(c)}</button>`).join('');
  box.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    renderFilters();
    renderProjects();
  }));
}
function renderProjects() {
  const grid = byId('portfolio-grid');
  if (!grid) return;
  const selected = selectedCategories();
  const search = (byId('portfolio-search')?.value || '').trim().toLocaleLowerCase('ru-RU');
  const shown = projects.filter(p => {
    const categoryMatches = !selected || selected.includes(p.category);
    const searchable = [p.title, p.category, p.description, p.year].filter(Boolean).join(' ').toLocaleLowerCase('ru-RU');
    return categoryMatches && (!search || searchable.includes(search));
  });
  if (!shown.length) {
    let heading;
    if (search) heading = `По запросу «${esc(search)}» ничего не найдено`;
    else if (activeFilter === 'all') heading = 'Каталог скоро пополнится новыми проектами';
    else if (Array.isArray(activeFilter)) heading = `В выбранных рубриках пока нет фотографий`;
    else heading = `В рубрике «${esc(activeFilter)}» пока нет фотографий`;
    grid.innerHTML = `<div class="portfolio-empty"><strong>${heading}</strong>Каталог постепенно пополняется реальными работами. Можно обсудить похожую мебель с нашей командой.<br><a href="#contacts">Связаться с нами ↗</a></div>`;
    return;
  }
  grid.innerHTML = shown.map(p => `<button class="project-card" type="button" data-image="${esc(p.image)}" data-title="${esc(p.title || 'Проект ВР-94')}" aria-label="Увеличить фотографию: ${esc(p.title || 'Проект ВР-94')}"><span class="project-image-wrap"><img src="${esc(p.image)}" alt="${esc(p.alt || p.title || 'Фотография мебельного проекта')}" loading="lazy"></span><span class="project-card-copy"><span class="project-meta"><span>${esc(p.category || 'Мебель на заказ')}</span><span>${esc(p.year || '')}</span></span><span class="project-title">${esc(p.title || 'Проект ВР-94')}</span>${p.description ? `<span class="project-description">${esc(p.description)}</span>` : ''}</span></button>`).join('');
  grid.querySelectorAll('.project-card').forEach(button => {
    button.addEventListener('click', () => openLightbox(button.dataset.image, button.dataset.title));
    button.querySelector('img').addEventListener('error', event => { event.currentTarget.style.visibility = 'hidden'; }, {once:true});
  });
}
// The large service cards now lead to matching catalog rubrics rather than skipping the catalog.
document.querySelectorAll('.service-card[data-categories]').forEach(card => {
  card.addEventListener('click', () => {
    const categories = card.dataset.categories.split('|').map(x => x.trim()).filter(Boolean);
    activeFilter = categories.length > 1 ? categories : (categories[0] || 'all');
    renderFilters();
    renderProjects();
  });
});
const portfolioSearch = byId('portfolio-search');
if (portfolioSearch) portfolioSearch.addEventListener('input', renderProjects);
function openLightbox(src, title) {
  const dialog = byId('lightbox'); const image = dialog.querySelector('img'); image.src = src; image.alt = title;
  dialog.querySelector('.lightbox-caption').textContent = title;
  if (typeof dialog.showModal === 'function') dialog.showModal(); else window.open(src, '_blank', 'noopener');
}
const lightbox = byId('lightbox');
lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
async function loadProjects() {
  const grid = byId('portfolio-grid');
  try { const response = await fetch('data/projects.json', {cache:'no-store'}); if (!response.ok) throw new Error('Projects not found'); projects = await response.json(); if (!Array.isArray(projects)) projects = []; renderFilters(); renderProjects(); }
  catch (_) { grid.innerHTML = '<div class="portfolio-empty"><strong>Портфолио пока не загрузилось</strong>Убедитесь, что папка data опубликована вместе с сайтом.</div>'; }
}
async function loadSettings() {
  try { const response = await fetch('data/site.json', {cache:'no-store'}); if (!response.ok) return; const s = await response.json();
    if (s.address) { const addressEl = byId('contact-address'); if (addressEl) addressEl.textContent = s.address; }
    const mapLink = byId('contact-map'); if (mapLink && s.twoGis) mapLink.href = s.twoGis;
    if (s.weekdayHours) byId('weekday-hours').textContent = s.weekdayHours;
    if (s.saturdayHours) byId('saturday-hours').textContent = s.saturdayHours;
    if (s.instagram) byId('instagram-link').href = s.instagram;
    if (s.instagramHandle) byId('instagram-link').textContent = `${s.instagramHandle} ↗`;
    if (s.instagram) { const cta = byId('instagram-cta'); if (cta) cta.href = s.instagram; }
    const applyContact = (prefix, name, phone) => {
      const nameEl = byId(`${prefix}-name`);
      const callEl = byId(`${prefix}-call`);
      const waEl = byId(`${prefix}-whatsapp`);
      if (name && nameEl) nameEl.textContent = name;
      if (phone) {
        const tel = String(phone).replace(/[^+\d]/g, '');
        const digits = String(phone).replace(/\D/g, '');
        if (callEl) { callEl.href = `tel:${tel}`; callEl.textContent = `Позвонить ${name || (nameEl ? nameEl.textContent : '')}`.trim(); }
        if (waEl) waEl.href = `https://wa.me/${digits}`;
      }
    };
    applyContact('corporate', s.corporateName, s.corporatePhone);
    applyContact('soft', s.softName, s.softPhone);
  } catch (_) { /* Static contact details remain visible. */ }
}
loadProjects(); loadSettings();
