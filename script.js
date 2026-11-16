/* ---------- DATA ----------
   Posters are loaded from images/<title-in-lowercase-with-dashes>.jpg
   e.g. images/avengers-infinity-war.jpg. Missing images show a title tile.
   To enable real playback, add video files: video:{720:'videos/x.mp4'} */
const slug = t => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// flags: p = popular, h = rotates in the top picture
const M = (title, type, year, rating, area, genres, synopsis, flags = '') => ({
  title, type, year, rating, area, genres, synopsis,
  popular: flags.includes('p'), hero: flags.includes('h'),
  img: `images/${slug(title)}.jpg`, video: {}
});

const DATA = [
  M('The Truman Show','movie',1998,8.2,'America',['Sci-Fi','Drama'],'A man slowly discovers his whole life is a TV show.','h'),
  M('Chernobyl','tv',2019,9.3,'UK / USA',['Thriller','Drama'],'The 1986 nuclear disaster and the people who faced it.','p'),
  M('Avengers: Infinity War','movie',2018,9.6,'America',['Action','Adventure','Sci-Fi'],'The Avengers face Thanos as he hunts the Infinity Stones.','p'),
  M('Star Wars','movie',1977,8.6,'America',['Action','Adventure','Sci-Fi'],'A farm boy joins a rebellion against a galactic empire.','p'),
  M('Inception','movie',2010,8.8,'America',['Sci-Fi','Action','Thriller'],'A thief enters dreams to plant an idea.','ph'),
  M('The Dark Knight','movie',2008,9.0,'America',['Action','Thriller'],'Batman faces the Joker in Gotham.','ph'),
  M('Interstellar','movie',2014,8.7,'America',['Sci-Fi','Adventure'],'Explorers travel through a wormhole to save humanity.','h'),
  M('Se7en','movie',1995,8.6,'America',['Thriller'],'Two detectives hunt a killer who uses the seven deadly sins.'),
  M('Mad Max: Fury Road','movie',2015,8.1,'Australia',['Action','Sci-Fi'],'A desert chase to escape a tyrant.'),
  M('Attack on Titan','anime',2013,9.1,'Japan',['Action','Thriller'],'Humanity fights giants from behind towering walls.','p'),
  M('Death Note','anime',2006,9.0,'Japan',['Thriller'],'A student finds a notebook that kills by name.','h'),
  M('Cowboy Bebop','anime',1998,8.9,'Japan',['Sci-Fi','Action'],'Bounty hunters drift through space.'),
  M('Steins;Gate','anime',2011,8.8,'Japan',['Sci-Fi','Thriller'],'A group of friends discovers messages to the past.'),
  M('Demon Slayer','anime',2019,8.7,'Japan',['Action'],'A boy becomes a demon slayer to save his sister.'),
  M('Fullmetal Alchemist: Brotherhood','anime',2009,9.1,'Japan',['Action','Adventure'],'Two brothers search for the Philosopher’s Stone.'),
  M('Breaking Bad','tv',2008,9.5,'America',['Thriller','Drama'],'A teacher turns to making drugs.','p'),
  M('Stranger Things','tv',2016,8.7,'America',['Sci-Fi','Thriller'],'Kids uncover secrets and a parallel dimension.','ph'),
  M('The Mandalorian','tv',2019,8.7,'America',['Sci-Fi','Action'],'A bounty hunter protects a mysterious child.'),
  M('Black Mirror','tv',2011,8.7,'UK',['Sci-Fi','Thriller'],'Stories about technology’s dark side.'),
  M('The Boys','tv',2019,8.7,'America',['Action','Thriller'],'Vigilantes take on corrupt superheroes.')
];
const byTitle = t => DATA.find(m => m.title === t);
const FEATURED = ['Chernobyl','Avengers: Infinity War','Star Wars'].map(byTitle);
const LABELS = { movie:'Movies', anime:'Anime', tv:'Tv shows', popular:'Popular' };

const MESSAGES = {
  help:['Help','Pick a title to see its details, use Rotate view and Quality under the player, or search by name.'],
  faq:['FAQ','Is this a real streaming site? No, it is a school project. Where do the titles come from? They are listed in script.js.'],
  feedback:['Feedback','Thanks for visiting! A feedback form is coming soon.'],
  privacy:['Privacy Policy','This site has no database and collects no personal data. Your settings are saved only in your own browser.'],
  terms:['Terms of Service','For educational use only. Movie names and images belong to their owners.']
};

/* ---------- helpers + settings ---------- */
const $ = s => document.querySelector(s);
let S = { rotate:true, quality:'720p', size:'100' };
try { Object.assign(S, JSON.parse(localStorage.getItem('js-settings') || '{}')); } catch (e) {}
const saveSettings = () => { try { localStorage.setItem('js-settings', JSON.stringify(S)); } catch (e) {} };

function poster(m, cls = '') {
  const d = document.createElement('div');
  d.className = 'poster ' + cls;
  d.dataset.title = m.title;
  const i = new Image();
  i.alt = m.title;
  i.src = m.img;
  i.onerror = () => { i.remove(); d.classList.add('noimg'); };
  d.append(i);
  return d;
}

/* ---------- hero (rotating top picture) ---------- */
const heroes = [byTitle('The Truman Show'), ...DATA.filter(m => m.hero && m.title !== 'The Truman Show')];
let hi = 0, heroTimer;
function showHero() { $('#heroBtn').replaceChildren(poster(heroes[hi])); $('#heroBtn').setAttribute('aria-label', 'Open ' + heroes[hi].title); }
function startHero() {
  clearInterval(heroTimer);
  if (S.rotate) heroTimer = setInterval(() => { hi = (hi + 1) % heroes.length; showHero(); }, 5000);
}
$('#heroBtn').onclick = () => selectTitle(heroes[hi]);

/* ---------- browse + filter + search ---------- */
const state = { type:null, genre:null, q:'' };

function renderGrid() {
  const q = state.q.trim().toLowerCase();
  let list = q ? DATA
    : state.type === 'popular' ? DATA.filter(m => m.popular)
    : state.type ? DATA.filter(m => m.type === state.type)
    : state.genre ? DATA : FEATURED;
  if (q) list = list.filter(m => m.title.toLowerCase().includes(q));
  if (state.genre) list = list.filter(m => m.genres.includes(state.genre));

  let label = q ? `Results for “${state.q.trim()}”` : (LABELS[state.type] || 'Featured');
  if (state.genre) label += ' – ' + state.genre;
  $('#gridTitle').textContent = label;

  document.querySelectorAll('#typeTabs button').forEach(b => b.classList.toggle('on', b.dataset.type === state.type));
  document.querySelectorAll('#genreTabs button').forEach(b => b.classList.toggle('on', b.dataset.genre === state.genre));

  const grid = $('#grid');
  grid.replaceChildren();
  if (!list.length) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = 'No titles found. Try another word or clear the filter.';
    grid.append(p);
    return;
  }
  list.forEach(m => {
    const b = document.createElement('button');
    b.className = 'card' + (current === m ? ' sel' : '');
    b.setAttribute('aria-label', m.title);
    b.dataset.title = m.title;
    b.append(poster(m));
    b.onclick = () => selectTitle(m);
    grid.append(b);
  });
}

$('#typeTabs').onclick = e => {
  const b = e.target.closest('button'); if (!b) return;
  state.type = state.type === b.dataset.type ? null : b.dataset.type;
  state.q = ''; $('#searchInput').value = '';
  renderGrid();
};
$('#genreTabs').onclick = e => {
  const b = e.target.closest('button'); if (!b) return;
  state.genre = state.genre === b.dataset.genre ? null : b.dataset.genre;
  renderGrid();
};
$('#searchInput').oninput = e => { state.q = e.target.value; renderGrid(); };
$('#searchForm').onsubmit = e => { e.preventDefault(); state.q = $('#searchInput').value; renderGrid(); };

/* ---------- detail + player ---------- */
let current = null, rot = 0, quality = S.quality;

function selectTitle(m, scroll = true) {
  current = m; rot = 0;
  $('#info').innerHTML = '';
  const lines = [['Movie Title', m.title], ['Area', m.area], ['Year', m.year], ['Rating', m.rating], ['Categories', m.genres.join('/')]];
  lines.forEach(([k, v]) => { const p = document.createElement('p'); p.textContent = `${k}: ${v}`; $('#info').append(p); });
  const s = document.createElement('p'); s.className = 'syn'; s.textContent = m.synopsis; $('#info').append(s);
  renderStage();
  document.querySelectorAll('.card').forEach(c => c.classList.toggle('sel', c.dataset.title === m.title));
  if (scroll) $('#detail').scrollIntoView({ behavior:'smooth', block:'start' });
}

function renderStage() {
  const stage = $('#stage');
  const old = stage.querySelector('video');
  const t = old ? old.currentTime : 0;
  stage.replaceChildren();
  const src = current.video[parseInt(quality)];
  if (src) {
    const v = document.createElement('video');
    v.controls = true; v.src = src; v.poster = current.img;
    v.addEventListener('loadedmetadata', () => { v.currentTime = t; });
    stage.append(v);
  } else stage.append(poster(current, 'wide'));
  $('#note').textContent = src ? '' : 'Preview only: add a video file for this title in script.js to enable playback.';
  $('#qBadge').textContent = quality;
  $('#quality').value = quality;
  applyRotation();
}
function applyRotation() { $('#stage').style.transform = `rotate(${rot}deg) scale(${rot % 180 ? 0.5625 : 1})`; }
$('#rotateBtn').onclick = () => { rot = (rot + 90) % 360; applyRotation(); };
$('#quality').onchange = e => { quality = e.target.value; renderStage(); };

/* ---------- nav ---------- */
const toBottom = e => { e.preventDefault(); scrollTo({ top: document.documentElement.scrollHeight, behavior:'smooth' }); };
$('#homeLink').onclick = e => { e.preventDefault(); scrollTo({ top:0, behavior:'smooth' }); };
$('#aboutLink').onclick = toBottom;
$('#contactLink').onclick = toBottom;
addEventListener('scroll', () => $('#logoMini').classList.toggle('show', scrollY > 260), { passive:true });

/* ---------- footer messages ---------- */
document.querySelector('.legal').onclick = e => {
  const b = e.target.closest('button'); if (!b) return;
  const [title, body] = MESSAGES[b.dataset.msg];
  $('#msgTitle').textContent = title; $('#msgBody').textContent = body;
  $('#msgBox').showModal();
};
$('#msgClose').onclick = () => $('#msgBox').close();

/* ---------- settings menu ---------- */
function applySettings() {
  document.documentElement.style.fontSize = S.size + '%';
  $('#setRotate').checked = S.rotate;
  $('#setQuality').value = S.quality;
  $('#setSize').value = S.size;
  startHero();
}
function toggleMenu(open) {
  const panel = $('#settings');
  panel.hidden = open === undefined ? !panel.hidden : !open;
  $('#menuBtn').setAttribute('aria-expanded', String(!panel.hidden));
}
$('#menuBtn').onclick = () => toggleMenu();
document.addEventListener('keydown', e => { if (e.key === 'Escape') toggleMenu(false); });
$('#setRotate').onchange = e => { S.rotate = e.target.checked; saveSettings(); startHero(); };
$('#setQuality').onchange = e => { S.quality = e.target.value; saveSettings(); };
$('#setSize').onchange = e => { S.size = e.target.value; saveSettings(); applySettings(); };
$('#resetBtn').onclick = () => { S = { rotate:true, quality:'720p', size:'100' }; saveSettings(); applySettings(); };

/* ---------- start ---------- */
applySettings();
showHero();
selectTitle(byTitle('Avengers: Infinity War'), false);
renderGrid();