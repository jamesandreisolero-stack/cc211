/* =========================================================
   JS Movies - behavior (needs movies.js loaded first)
   Sections: 1 Setup | 2 Settings | 3 Posters + hero | 4 Browse
             5 Detail + player | 6 Navigation | 7 Footer | 8 Start
   ========================================================= */

/* ---------- 1. SETUP ---------- */
const $ = selector => document.querySelector(selector);
const byTitle = title => DATA.find(m => m.title === title);

// default row of posters shown first
const FEATURED = ['Chernobyl', 'Avengers: Infinity War', 'Star Wars'].map(byTitle);

const TYPE_LABELS = { movie: 'Movies', anime: 'Anime', tv: 'Tv shows', popular: 'Popular' };

const MESSAGES = {
  help:     ['Help', 'Pick a title to see its details, use Rotate and Quality on the picture, or search by name.'],
  faq:      ['FAQ', 'Is this a real streaming site? No, it is a school project. Where do the titles come from? They are listed in movies.js.'],
  feedback: ['Feedback', 'Thanks for visiting! A feedback form is coming soon.'],
  privacy:  ['Privacy Policy', 'This site has no database and collects no personal data. Your settings are saved only in your own browser.'],
  terms:    ['Terms of Service', 'For educational use only. Movie names and images belong to their owners.']
};

// Custom dropdown: turns a <select> into a menu that matches the site colors.
// The original <select> stays hidden underneath and still holds the value.
function enhanceSelect(select) {
  const wrap = document.createElement('div');
  wrap.className = 'dd';
  select.before(wrap);
  wrap.append(select);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'dd-btn';
  button.setAttribute('aria-haspopup', 'listbox');
  button.setAttribute('aria-expanded', 'false');

  const list = document.createElement('ul');
  list.className = 'dd-list';
  list.setAttribute('role', 'listbox');
  list.hidden = true;

  [...select.options].forEach(option => {
    const item = document.createElement('li');
    item.setAttribute('role', 'option');
    item.dataset.value = option.value;
    item.textContent = option.textContent;
    list.append(item);
  });
  wrap.append(button, list);

  // keep the button text and the highlighted option in step with the value
  select.sync = () => {
    button.textContent = select.options[select.selectedIndex].textContent;
    list.querySelectorAll('li').forEach(li =>
      li.setAttribute('aria-selected', String(li.dataset.value === select.value)));
  };

  const close = () => {
    list.hidden = true;
    wrap.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
  };

  button.onclick = () => {
    const wasOpen = !list.hidden;
    document.dispatchEvent(new Event('close-dropdowns'));
    if (!wasOpen) {
      list.hidden = false;
      wrap.classList.add('open');
      button.setAttribute('aria-expanded', 'true');
    }
  };

  list.onclick = e => {
    const item = e.target.closest('li');
    if (!item) return;
    select.value = item.dataset.value;
    select.sync();
    close();
    select.dispatchEvent(new Event('change'));
  };

  document.addEventListener('close-dropdowns', close);
  document.addEventListener('click', e => { if (!wrap.contains(e.target)) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  select.sync();
}

// set a dropdown's value from code and refresh its look
function setSelect(select, value) {
  select.value = value;
  if (select.sync) select.sync();
}

['#setQuality', '#setSize'].forEach(id => enhanceSelect($(id)));

/* ---------- 2. SETTINGS (saved in the visitor's browser) ---------- */
const DEFAULT_SETTINGS = { rotate: true, quality: '720p', size: '100' };
let settings = { ...DEFAULT_SETTINGS };

try {
  Object.assign(settings, JSON.parse(localStorage.getItem('js-settings') || '{}'));
} catch (e) { /* storage unavailable: use defaults */ }

function saveSettings() {
  try { localStorage.setItem('js-settings', JSON.stringify(settings)); } catch (e) {}
}

function applySettings() {
  document.documentElement.style.fontSize = settings.size + '%';
  $('#setRotate').checked = settings.rotate;
  setSelect($('#setQuality'), settings.quality);
  setSelect($('#setSize'), settings.size);
  startHero();
}

function toggleMenu(open) {
  const panel = $('#settings');
  panel.hidden = open === undefined ? !panel.hidden : !open;
  $('#menuBtn').setAttribute('aria-expanded', String(!panel.hidden));
}

$('#menuBtn').onclick = () => toggleMenu();
document.addEventListener('keydown', e => { if (e.key === 'Escape') toggleMenu(false); });

$('#setRotate').onchange = e => { settings.rotate = e.target.checked; saveSettings(); startHero(); };
$('#setQuality').onchange = e => { settings.quality = e.target.value; saveSettings(); };
$('#setSize').onchange = e => { settings.size = e.target.value; saveSettings(); applySettings(); };
$('#resetBtn').onclick = () => { settings = { ...DEFAULT_SETTINGS }; saveSettings(); applySettings(); };

/* ---------- 3. POSTERS + HERO ---------- */

// builds a poster; if the image file is missing, a title tile shows instead
function makePoster(movie, extraClass = '') {
  const box = document.createElement('div');
  box.className = 'poster ' + extraClass;
  box.dataset.title = movie.title;

  const img = new Image();
  img.alt = movie.title;
  img.src = movie.img;
  img.onerror = () => { img.remove(); box.classList.add('noimg'); };

  box.append(img);
  return box;
}

// top picture that changes every 5 seconds
const heroes = [byTitle('The Truman Show'), ...DATA.filter(m => m.hero && m.title !== 'The Truman Show')];
let heroIndex = 0;
let heroTimer;

function showHero() {
  const movie = heroes[heroIndex];
  $('#heroBtn').replaceChildren(makePoster(movie));
  $('#heroBtn').setAttribute('aria-label', 'Open ' + movie.title);
}

function startHero() {
  clearInterval(heroTimer);
  if (!settings.rotate) return;
  heroTimer = setInterval(() => {
    heroIndex = (heroIndex + 1) % heroes.length;
    showHero();
  }, 5000);
}

$('#heroBtn').onclick = () => selectTitle(heroes[heroIndex]);

/* ---------- 4. BROWSE: tabs, genres, search ---------- */
const view = { type: null, genre: null, query: '' };

function renderGrid() {
  const query = view.query.trim().toLowerCase();

  // pick the starting list
  let list;
  if (query)                       list = DATA;
  else if (view.type === 'popular') list = DATA.filter(m => m.popular);
  else if (view.type)               list = DATA.filter(m => m.type === view.type);
  else if (view.genre)              list = DATA;
  else                              list = FEATURED;

  // narrow it down
  if (query)       list = list.filter(m => m.title.toLowerCase().includes(query));
  if (view.genre)  list = list.filter(m => m.genres.includes(view.genre));

  // heading above the grid
  let heading = query ? `Results for “${view.query.trim()}”` : (TYPE_LABELS[view.type] || 'Featured');
  if (view.genre) heading += ' – ' + view.genre;
  $('#gridTitle').textContent = heading;

  // highlight the active tabs
  document.querySelectorAll('#typeTabs button').forEach(b => b.classList.toggle('on', b.dataset.type === view.type));
  document.querySelectorAll('#genreTabs button').forEach(b => b.classList.toggle('on', b.dataset.genre === view.genre));

  // draw the posters
  const grid = $('#grid');
  grid.replaceChildren();

  if (!list.length) {
    const message = document.createElement('p');
    message.className = 'empty';
    message.textContent = 'No titles found. Try another word or clear the filter.';
    grid.append(message);
    return;
  }

  list.forEach(movie => {
    const card = document.createElement('button');
    card.className = 'card' + (current === movie ? ' sel' : '');
    card.dataset.title = movie.title;
    card.setAttribute('aria-label', movie.title);
    card.append(makePoster(movie));
    card.onclick = () => selectTitle(movie);
    grid.append(card);
  });
}

$('#typeTabs').onclick = e => {
  const button = e.target.closest('button');
  if (!button) return;
  view.type = view.type === button.dataset.type ? null : button.dataset.type;
  view.query = '';
  $('#searchInput').value = '';
  renderGrid();
};

$('#genreTabs').onclick = e => {
  const button = e.target.closest('button');
  if (!button) return;
  view.genre = view.genre === button.dataset.genre ? null : button.dataset.genre;
  renderGrid();
};

$('#searchInput').oninput = e => { view.query = e.target.value; renderGrid(); };
$('#searchForm').onsubmit = e => { e.preventDefault(); view.query = $('#searchInput').value; renderGrid(); };

/* ---------- 5. DETAIL + PLAYER ---------- */
let current = null;

function selectTitle(movie, scroll = true) {
  current = movie;

  // details text
  const info = $('#info');
  info.replaceChildren();
  const lines = [
    ['Movie Title', movie.title],
    ['Area', movie.area],
    ['Year', movie.year],
    ['Rating', movie.rating],
    ['Categories', movie.genres.join('/')]
  ];
  lines.forEach(([label, value]) => {
    const p = document.createElement('p');
    p.textContent = `${label}: ${value}`;
    info.append(p);
  });
  const synopsis = document.createElement('p');
  synopsis.className = 'syn';
  synopsis.textContent = movie.synopsis;
  info.append(synopsis);

  renderStage();
  document.querySelectorAll('.card').forEach(c => c.classList.toggle('sel', c.dataset.title === movie.title));
  if (scroll) $('#detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// shows the video if one exists for the default quality (set in Settings), otherwise the poster
function renderStage() {
  const stage = $('#stage');
  const oldVideo = stage.querySelector('video');
  const resumeAt = oldVideo ? oldVideo.currentTime : 0;
  stage.replaceChildren();

  const source = current.video[parseInt(settings.quality)];
  if (source) {
    const video = document.createElement('video');
    video.controls = true;
    video.src = source;
    video.poster = current.img;
    video.addEventListener('loadedmetadata', () => { video.currentTime = resumeAt; });
    stage.append(video);
  } else {
    stage.append(makePoster(current, 'wide'));
  }

  $('#note').textContent = source ? '' : 'Preview only: add a video file for this title in movies.js to enable playback.';
}

/* ---------- 6. NAVIGATION ---------- */
function scrollToBottom(e) {
  e.preventDefault();
  scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
}

$('#homeLink').onclick = e => { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); };
$('#aboutLink').onclick = scrollToBottom;
$('#contactLink').onclick = scrollToBottom;

// small logo appears once you scroll down
addEventListener('scroll', () => $('#logoMini').classList.toggle('show', scrollY > 260), { passive: true });

/* ---------- 7. FOOTER MESSAGES ---------- */
document.querySelector('.legal').onclick = e => {
  const button = e.target.closest('button');
  if (!button) return;
  const [title, body] = MESSAGES[button.dataset.msg];
  $('#msgTitle').textContent = title;
  $('#msgBody').textContent = body;
  $('#msgBox').showModal();
};
$('#msgClose').onclick = () => $('#msgBox').close();

/* ---------- 8. START ---------- */
applySettings();
showHero();
selectTitle(byTitle('Avengers: Infinity War'), false);
renderGrid();
