/* =========================================================
   KINE KLUB — Kalender & Manajemen UKM (Mode Demo)
   Standalone Demo: LocalStorage + Multi-Tab Live Sync (BroadcastChannel)
   Login dengan Username & PIN (Sudah disediakan akun demo)
   ========================================================= */

(() => {
'use strict';

/* ---------- Data Master ---------- */
const DIVS = [
  { id: 'BPH',       name: 'BPH',       full: 'Badan Pengurus Harian', color: '#e8e4df', desc: 'Pimpinan organisasi: koordinasi, arah, dan keputusan UKM.' },
  { id: 'MEDIA',     name: 'Media',     full: 'Media & Publikasi',     color: '#d4263c', desc: 'Desain poster, konten, dan pengelolaan sosial media UKM.' },
  { id: 'APRESIASI', name: 'Apresiasi', full: 'Apresiasi & Kajian',    color: '#e58a9b', desc: 'Screening film, review/diskusi, dan kajian audio visual.' },
  { id: 'ASSET',     name: 'Asset',     full: 'Aset & Inventaris',     color: '#8f8f98', desc: 'Peralatan kamera, peminjaman alat, dan inventaris UKM.' },
  { id: 'PRODUKSI',  name: 'Produksi',  full: 'Produksi Karya',        color: '#f06a4d', desc: 'Pembuatan film pendek, dokumenter, dan projek audio visual.' },
  { id: 'HUMAS',     name: 'Humas',     full: 'Hubungan Masyarakat',   color: '#cfa77d', desc: 'Relasi eksternal kampus, sponsorship, dan publikasi luar.' },
  { id: 'PSDM',      name: 'PSDM',      full: 'Pengembangan SDM',      color: '#b0566a', desc: 'Kaderisasi, pelatihan skill, dan keakraban anggota.' },
];

const TYPES = ['Rapat', 'Produksi', 'Screening', 'Workshop', 'Deadline', 'Acara', 'Lainnya'];
const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const DAYS = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];
const DOW = ['SEN','SEL','RAB','KAM','JUM','SAB','MIN'];
const MON3 = ['JAN','FEB','MAR','APR','MEI','JUN','JUL','AGU','SEP','OKT','NOV','DES'];

const ICON = {
  home: '<path d="M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1z"/>',
  cal: '<rect x="3" y="4" width="18" height="17" rx="1"/><path d="M3 9h18M8 2v4M16 2v4"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  users: '<circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-6 7-6s7 2 7 6M17 4a4 4 0 010 8M22 21c0-3-2-5-4-5.5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  left: '<path d="M15 5l-7 7 7 7"/>', right: '<path d="M9 5l7 7-7 7"/>',
  pin: '<path d="M12 22s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
  moon: '<path d="M21 13A9 9 0 1111 3a7 7 0 0010 10z"/>',
  check: '<path d="M5 12l5 5L20 7"/>', lock: '<rect x="4" y="11" width="16" height="10" rx="1"/><path d="M8 11V7a4 4 0 018 0v4"/>',
  out: '<path d="M9 21H5a1 1 0 01-1-1V4a1 1 0 011-1h4M16 17l5-5-5-5M21 12H9"/>',
  film: '<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M7 3v18M17 3v18M3 8h4M3 16h4M17 8h4M17 16h4"/>',
  refresh: '<path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>'
};
const ic = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[n] || ''}</svg>`;

/* ---------- Utils ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const key = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const todayKey = () => key(new Date());
const div = (id) => DIVS.find((d) => d.id === id) || DIVS[0];
const uid = () => Math.random().toString(36).slice(2, 10);
const dayName = (k) => DAYS[(parse(k).getDay() + 6) % 7];
const fullDate = (k) => { const d = parse(k); return `${dayName(k)}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
const timeStr = (e) => (e.start ? e.start + (e.end ? ' – ' + e.end : '') : 'Sepanjang hari');
const cmp = (a, b) => (a.date + (a.start || '00:00')).localeCompare(b.date + (b.start || '00:00'));
const dc = (id) => `style="--dc:${div(id).color}"`;

let toastT;
const toast = (m) => { 
  const t = $('#toast'); 
  t.textContent = m; 
  t.classList.add('show'); 
  clearTimeout(toastT); 
  toastT = setTimeout(() => t.classList.remove('show'), 2400); 
};

/* ---------- Storage & Sync Keys ---------- */
const LS = {
  events: 'kine_demo_events_v2',
  members: 'kine_demo_members_v2',
  session: 'kine_demo_session_v2',
  theme: 'kine.theme'
};

/* BroadcastChannel untuk sinkronisasi seketika antar Tab browser */
let bc = null;
try {
  bc = new BroadcastChannel('kine_klub_sync');
  bc.onmessage = (msg) => {
    if (msg.data === 'sync_events') {
      S.events = loadEvents();
      if (document.activeElement?.id !== 'q') render();
      toast('DATA AGENDA TERSINKRON DARI TAB LAIN');
    } else if (msg.data === 'sync_members') {
      S.members = loadMembers();
      if (S.tab === 'anggota') render();
    }
  };
} catch {
  // fallback listener storage
  window.addEventListener('storage', (e) => {
    if (e.key === LS.events) {
      S.events = loadEvents();
      if (document.activeElement?.id !== 'q') render();
    }
    if (e.key === LS.members) {
      S.members = loadMembers();
      if (S.tab === 'anggota') render();
    }
  });
}

function notifySync(type) {
  if (bc) bc.postMessage(type);
}

/* Default Demo Members */
function seedMembers() {
  return [
    { uid: 'u_bph',      username: 'bph',      pin: '123456', name: 'BPH',            div: 'BPH',       role: 'kadiv',   active: true },
    { uid: 'u_kadiv',    username: 'kadiv',    pin: '123456', name: 'Ketua Divisi',   div: 'PRODUKSI', role: 'kadiv',   active: true },
    { uid: 'u_wakadiv',  username: 'wakadiv',  pin: '123456', name: 'Wakil Divisi',   div: 'PRODUKSI', role: 'wakadiv', active: true },
    { uid: 'u_anggota',  username: 'anggota',  pin: '123456', name: 'Anggota Divisi', div: 'PRODUKSI', role: 'anggota', active: true },
  ];
}

/* Default Demo Events */
function seedEvents() {
  const t = new Date();
  const e = (off, div, type, title, start, end, loc, desc, by) => ({
    id: uid(), date: key(addDays(t, off)), div, type, title, start, end, loc, desc, by,
  });
  return [
    e(0,  'BPH',       'Rapat',     'Rapat Pleno Mingguan Pengurus', '19:30', '21:00', 'Sekretariat Kine Klub', 'Evaluasi target kerja seluruh divisi & anggaran.', 'Rangga (Ketua Umum)'),
    e(1,  'MEDIA',     'Deadline',  'Deadline Poster Open Recruitment', '', '', 'Online / Google Drive', 'Final file resolusi tinggi untuk upload Instagram @mmkineklubumy.', 'Alya (Kadiv Media)'),
    e(2,  'PRODUKSI',  'Produksi',  'Shooting Film Pendek "Senja"', '07:00', '17:00', 'Kali Code, Yogyakarta', 'Kru kumpul 06.30 di Basecamp. Siapkan clapper & 3 set baterai.', 'Dimas (Kadiv Produksi)'),
    e(3,  'ASSET',     'Lainnya',   'Maintenance & Pengecekan Kamera', '15:00', '17:00', 'Gudang Asset', 'Cek sensor, dry cabinet, lensa prime 50mm, dan mic wireless.', 'Bima (Kadiv Asset)'),
    e(4,  'APRESIASI', 'Screening', 'Screening & Diskusi Film Indie', '19:00', '22:00', 'Auditorium Kampus', 'Pemutaran 2 film indie karya sineas muda Jogja + sesi tanya jawab.', 'Fikri (Kadiv Apresiasi)'),
    e(6,  'PSDM',      'Workshop',  'Workshop Sinematografi Dasar', '13:00', '16:00', 'Ruang Multimedia UMY', 'Wajib untuk anggota baru. Teori 3-point lighting dan angle camera.', 'Gilang (Kadiv PSDM)'),
    e(8,  'HUMAS',     'Rapat',     'Audiensi Sponsor KineFest 2026', '10:00', '11:30', 'Meeting Room Kafe Sebelah', 'Pitching proposal pendanaan festival.', 'Clara (Kadiv Humas)'),
    e(10, 'BPH',       'Acara',     'Malam Keakraban Anggota (Makrab)', '18:30', '22:00', 'Villa Kaliurang', 'Membangun bonding keluarga besar MM Kine Klub.', 'Rangga (Ketua Umum)'),
    e(12, 'PRODUKSI',  'Deadline',  'Deadline Rough Cut Editing', '', '', 'Online Server', 'Kirim link preview ke grup produksi untuk review sutradara.', 'Dimas (Kadiv Produksi)'),
    e(15, 'MEDIA',     'Workshop',  'Sharing Session: Color Grading DaVinci', '15:30', '17:30', 'Lab Komputer', 'Bedah teknik workflow color grade film naratif.', 'Alya (Kadiv Media)'),
  ];
}

function loadEvents() {
  try {
    const raw = localStorage.getItem(LS.events);
    if (!raw) {
      const init = seedEvents();
      localStorage.setItem(LS.events, JSON.stringify(init));
      return init;
    }
    return JSON.parse(raw);
  } catch {
    return seedEvents();
  }
}

function saveEvents(evs) {
  S.events = evs;
  localStorage.setItem(LS.events, JSON.stringify(evs));
  notifySync('sync_events');
}

function loadMembers() {
  try {
    const raw = localStorage.getItem(LS.members);
    let list = raw ? JSON.parse(raw) : seedMembers();
    // Pastikan akun utama demo (bph, kadiv, wakadiv, anggota) selalu tersedia
    const defaults = seedMembers();
    defaults.forEach((def) => {
      const idx = list.findIndex((m) => m.username === def.username);
      if (idx === -1) {
        list.push(def);
      } else {
        list[idx].name = def.name;
        list[idx].role = def.role;
      }
    });
    localStorage.setItem(LS.members, JSON.stringify(list));
    return list;
  } catch {
    const init = seedMembers();
    localStorage.setItem(LS.members, JSON.stringify(init));
    return init;
  }
}

function saveMembers(mems) {
  S.members = mems;
  localStorage.setItem(LS.members, JSON.stringify(mems));
  notifySync('sync_members');
}

/* ---------- State ---------- */
const S = {
  events: loadEvents(),
  members: loadMembers(),
  user: null,
  loginErr: '',
  tab: 'home',
  month: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  sel: todayKey(),
  filter: 'ALL',
  q: '',
  past: false,
};

// Cek session login sebelumnya
try {
  const sess = localStorage.getItem(LS.session);
  if (sess) {
    const u = JSON.parse(sess);
    const found = S.members.find((m) => m.username === u.username && m.active);
    if (found) S.user = found;
  }
} catch { /* ignore */ }

/* ---------- Permissions Helper ---------- */
const isLeader = (u) => u && (u.role === 'kadiv' || u.role === 'wakadiv');
const isBPH = (u) => u && u.div === 'BPH' && isLeader(u);
const canEdit = (ev) => S.user && isLeader(S.user) && (S.user.div === 'BPH' || S.user.div === ev.div);
const canAdd = () => isLeader(S.user);

const roleLabel = (u) => {
  if (!u) return '';
  if (u.div === 'BPH') return 'BPH';
  if (u.role === 'kadiv') return 'KETUA DIVISI';
  if (u.role === 'wakadiv') return 'WAKIL DIVISI';
  return 'ANGGOTA DIVISI';
};

/* ---------- Chrome & Layout ---------- */
const NAV = [
  ['home', 'Beranda', 'home'], 
  ['calendar', 'Kalender', 'cal'], 
  ['agenda', 'Agenda', 'list'],
  ['divisi', 'Divisi', 'users'], 
  ['profil', 'Profil', 'user'],
];
const brand = `<div class="brand"><img src="icon.svg" alt="" width="30" height="30"><b>KINE<i>KLUB</i></b></div>`;

function renderChrome() {
  const item = ([id, label, icon]) => `<button class="nav-item ${S.tab === id ? 'active' : ''}" data-tab="${id}" aria-label="${label}">${ic(icon)}<span>${label}</span></button>`;
  const add = canAdd() ? `<button class="btn btn-primary btn-block" data-act="add">${ic('plus')}Tambah agenda</button>` : '';
  
  $('#rail').innerHTML = `${brand}${NAV.map(item).join('')}${add}
    <div class="rail-foot mono">${esc(S.user.name)}<br><span style="color:var(--accent)">${esc(roleLabel(S.user))}</span></div>`;
    
  const n = NAV.map(item);
  const fab = canAdd() ? `<div class="fab-wrap"><button class="nav-fab" data-act="add" aria-label="Tambah agenda">${ic('plus')}</button></div>` : '';
  $('#dock').innerHTML = canAdd() ? n.slice(0, 2).join('') + fab + n.slice(2, 4).join('') + n[4] : n.join('');
  
  $('#topbar').innerHTML = `${brand}
    <div class="top-actions">
      <button class="icon-btn" data-act="theme" aria-label="Ganti tema">${ic(document.body.classList.contains('light') ? 'moon' : 'sun')}</button>
    </div>`;
}

/* ---------- Event Helpers ---------- */
const eventsOn = (k) => S.events.filter((e) => e.date === k && (S.filter === 'ALL' || e.div === S.filter)).sort(cmp);
const upcoming = () => S.events.filter((e) => e.date >= todayKey()).sort(cmp);

function evRow(e) {
  const d = parse(e.date);
  return `<button class="ev" ${dc(e.div)} data-ev="${e.id}">
    <div class="ev-date"><b>${d.getDate()}</b><span>${MON3[d.getMonth()]}</span></div>
    <div class="ev-body"><h3>${esc(e.title)}</h3>
      <div class="ev-sub"><span class="tag solid" ${dc(e.div)}>${esc(div(e.div).name)}</span>
      <span>${ic('clock')}${esc(timeStr(e))}</span>${e.loc ? `<span>${ic('pin')}${esc(e.loc)}</span>` : ''}</div></div></button>`;
}

const emptyBox = (m) => `<div class="empty">${ic('film')}<div>${m}</div></div>`;

function countdown(k) {
  const diff = Math.round((parse(k) - parse(todayKey())) / 864e5);
  if (diff === 0) return ['HARI', 'INI'];
  return ['H-' + diff, diff === 1 ? 'BESOK' : 'HARI LAGI'];
}

/* ---------- Views ---------- */
function viewHome() {
  const up = upcoming(), next = up[0];
  const h = new Date().getHours();
  const hi = h < 11 ? 'Pagi' : h < 15 ? 'Siang' : h < 18 ? 'Sore' : 'Malam';
  const week = up.filter((e) => e.date <= key(addDays(new Date(), 7)));
  const month = S.events.filter((e) => e.date.slice(0, 7) === todayKey().slice(0, 7));
  const maxN = Math.max(1, ...DIVS.map((d) => up.filter((e) => e.div === d.id).length));
  
  const hero = next ? (() => { 
    const [a, b] = countdown(next.date); 
    return `
    <button class="hero" style="display:block;width:100%;text-align:left" data-ev="${next.id}">
      <span class="mono">Agenda berikutnya · ${esc(div(next.div).full)}</span>
      <h1>${esc(next.title)}</h1><p>${fullDate(next.date)}</p>
      <div class="meta"><div>${ic('clock')}${esc(timeStr(next))}</div>${next.loc ? `<div>${ic('pin')}${esc(next.loc)}</div>` : ''}</div>
      <div class="count">${a}<small>${b}</small></div>
    </button>`; 
  })() : `<div class="hero"><span class="mono">Agenda berikutnya</span><h1>Belum ada agenda</h1><p>Kadiv/Wakadiv dapat menambahkan agenda baru.</p></div>`;

  return `
    <div class="greeting">
      <span class="mono">${fullDate(todayKey())}</span>
      <h2>Selamat ${hi}, <i>${esc(S.user.name.split(' ')[0])}</i></h2>
      <div class="mono" style="margin-top:2px;color:var(--accent)">${esc(roleLabel(S.user))}</div>
    </div>
    ${hero}
    <div class="stats">
      <div class="card stat"><b>${week.length}</b><span class="mono">7 hari ke depan</span></div>
      <div class="card stat"><b>${month.length}</b><span class="mono">Bulan ini</span></div>
      <div class="card stat"><b>${up.length}</b><span class="mono">Akan datang</span></div>
    </div>
    <div class="section-head"><h2>Minggu ini</h2><button data-tab="agenda">Semua agenda →</button></div>
    <div class="ev-list">${week.length ? week.slice(0, 5).map(evRow).join('') : emptyBox('Tidak ada agenda 7 hari ke depan.')}</div>
    <div class="section-head"><h2>Beban agenda per divisi</h2></div>
    <div class="card bars">${DIVS.map((d) => { 
      const n = up.filter((e) => e.div === d.id).length;
      return `<div class="bar-row" ${dc(d.id)}><span>${d.name.toUpperCase()}</span><div class="bar"><i style="width:${(n / maxN) * 100}%"></i></div><b>${n}</b></div>`; 
    }).join('')}</div>`;
}

function filterChips() {
  return `<div class="chips" role="group" aria-label="Filter divisi">
    <button class="chip ${S.filter === 'ALL' ? 'on' : ''}" data-filter="ALL">Semua Divisi</button>
    ${DIVS.map((d) => `<button class="chip ${S.filter === d.id ? 'on' : ''}" data-filter="${d.id}">${d.name}</button>`).join('')}</div>`;
}

function viewCalendar() {
  const y = S.month.getFullYear(), m = S.month.getMonth();
  const first = new Date(y, m, 1), offset = (first.getDay() + 6) % 7;
  const start = addDays(first, -offset), tk = todayKey();
  let cells = '';
  for (let i = 0; i < 42; i++) {
    const d = addDays(start, i), k = key(d);
    if (i >= 35 && d.getMonth() !== m) break;
    const evs = eventsOn(k);
    cells += `<button class="cell ${d.getMonth() !== m ? 'out' : ''} ${k === tk ? 'today' : ''} ${k === S.sel ? 'sel' : ''} ${d.getDay() === 0 ? 'sun' : ''}" data-day="${k}" aria-label="${fullDate(k)}, ${evs.length} agenda">
      <span class="n">${d.getDate()}</span>
      <span>${evs.slice(0, 2).map((e) => `<span class="pill" ${dc(e.div)}>${esc(e.title)}</span>`).join('')}
      <span class="dots">${evs.slice(0, 4).map((e) => `<i ${dc(e.div)}></i>`).join('')}${evs.length > 4 ? `<em>+${evs.length - 4}</em>` : ''}</span></span></button>`;
  }
  const sel = eventsOn(S.sel);
  return `
    <div class="cal-head">
      <h1>${MONTHS[m]}<small>${y}</small></h1>
      <div class="cal-nav">
        <button class="icon-btn" data-act="prev" aria-label="Bulan sebelumnya">${ic('left')}</button>
        <button class="btn" data-act="today">Hari ini</button>
        <button class="icon-btn" data-act="next" aria-label="Bulan berikutnya">${ic('right')}</button>
      </div>
    </div>
    ${filterChips()}<div style="height:12px"></div>
    <div class="cal-grid">${DOW.map((d, i) => `<div class="cal-dow mono ${i === 6 ? 'sun' : ''}">${d}</div>`).join('')}${cells}</div>
    <div class="legend">${DIVS.map((d) => `<span ${dc(d.id)}><i></i>${d.name}</span>`).join('')}</div>
    <div class="day-title"><h2>${fullDate(S.sel)}</h2>${canAdd() ? `<button class="btn" data-act="add">${ic('plus')}Agenda</button>` : ''}</div>
    <div class="ev-list">${sel.length ? sel.map(evRow).join('') : emptyBox('Tidak ada agenda di tanggal ini.')}</div>`;
}

function viewAgenda() {
  const q = S.q.toLowerCase();
  let list = S.events.filter((e) => (S.past ? e.date < todayKey() : e.date >= todayKey())
    && (S.filter === 'ALL' || e.div === S.filter)
    && (!q || (e.title + e.loc + e.desc + e.type).toLowerCase().includes(q))).sort(cmp);
  if (S.past) list.reverse();
  let last = '', out = '';
  list.forEach((e) => { 
    if (e.date !== last) { 
      last = e.date; 
      out += `<div class="date-group mono">${fullDate(e.date)}</div>`; 
    } 
    out += evRow(e); 
  });
  return `
    <div class="cal-head">
      <h1>Agenda</h1>
      <div class="cal-nav">
        <button class="chip ${!S.past ? 'on' : ''}" data-past="0">Akan datang</button>
        <button class="chip ${S.past ? 'on' : ''}" data-past="1">Riwayat</button>
      </div>
    </div>
    <label class="search">${ic('search')}<input id="q" type="search" placeholder="Cari agenda, lokasi, atau jenis…" value="${esc(S.q)}"></label>
    ${filterChips()}
    <div class="ev-list" style="margin-top:6px">${out || emptyBox('Tidak ada agenda yang cocok.')}</div>`;
}

function viewDivisi() {
  return `<div class="cal-head"><h1>Divisi</h1></div><div class="div-grid">${DIVS.map((d) => {
    const n = upcoming().filter((e) => e.div === d.id).length;
    return `<button class="card div-card" ${dc(d.id)} data-divgo="${d.id}">
      <span class="mono">${esc(d.full)}</span>
      <h3>${d.name}</h3>
      <p>${esc(d.desc)}</p>
      <div class="foot"><span>${n} AGENDA AKTIF</span><span>LIHAT AGENDA →</span></div>
    </button>`; 
  }).join('')}</div>`;
}

function viewProfil() {
  const u = S.user, lead = isLeader(u), all = isBPH(u);
  const perms = [
    [true, 'Melihat seluruh kalender & agenda UKM semua divisi'],
    [lead, all ? 'Menambah, mengubah & menghapus agenda SEMUA divisi (BPH)' : `Menambah & mengubah agenda khusus divisi ${div(u.div).name}`],
    [all, 'Mengelola akun anggota, membuat PIN baru, dan hak akses UKM'],
  ];
  return `
    <div class="cal-head"><h1>Profil</h1></div>
    <div class="card profile-card">
      <div class="avatar">${esc(u.name[0].toUpperCase())}</div>
      <div>
        <h2>${esc(u.name)}</h2>
        <span class="mono">@${esc(u.username)} · ${esc(roleLabel(u))}</span>
      </div>
    </div>

    <div class="section-head"><h2>Hak Akses Anda</h2></div>
    <ul class="perm">${perms.map(([ok, t]) => `<li class="card ${ok ? '' : 'no'}">${ic(ok ? 'check' : 'lock')}${t}</li>`).join('')}</ul>

    ${all ? `
    <div class="section-head"><h2>Manajemen Anggota (BPH)</h2></div>
    <button class="card setting" data-tab="anggota">
      <span>Kelola Anggota & Atur PIN Akses</span>
      ${ic('users')}
    </button>` : ''}

    <div class="section-head"><h2>Tentang UKM</h2></div>
    <div class="card about">
      <b>UKM MM Kine Klub UMY (Multimedia Kine Klub)</b><br>
      Wadah aktivitas kemahasiswaan bidang audio visual grafis & pelatihan organisasi.<br>
      Instagram: <a href="https://www.instagram.com/mmkineklubumy/" target="_blank" rel="noopener">@mmkineklubumy</a>
    </div>

    <div class="section-head"><h2>Ganti Akun Demo (1-Klik)</h2></div>
    <div class="card" style="padding:12px;display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <button class="btn ${S.user.username === 'bph' ? 'btn-primary' : ''}" data-switchdemo="bph">BPH</button>
      <button class="btn ${S.user.username === 'kadiv' ? 'btn-primary' : ''}" data-switchdemo="kadiv">KETUA DIVISI</button>
      <button class="btn ${S.user.username === 'wakadiv' ? 'btn-primary' : ''}" data-switchdemo="wakadiv">WAKIL DIVISI</button>
      <button class="btn ${S.user.username === 'anggota' ? 'btn-primary' : ''}" data-switchdemo="anggota">ANGGOTA DIVISI</button>
    </div>

    <div class="section-head"><h2>Pengaturan Akun</h2></div>
    <button class="card setting" data-act="chpin"><span>Ganti PIN Saya</span>${ic('lock')}</button>
    <button class="card setting" data-act="resetdemo"><span>Reset Ulang Semua Data Demo</span><span class="mono">Reset</span></button>
    <button class="card setting" data-act="logout"><span>Keluar / Logout</span>${ic('out')}</button>`;
}

function viewAnggota() {
  if (!isBPH(S.user)) return viewHome();
  const list = [...S.members].sort((a, b) => (a.div + a.name).localeCompare(b.div + b.name));
  return `
    <div class="cal-head">
      <h1>Anggota UKM</h1>
      <button class="btn btn-primary" data-act="addmember">${ic('plus')}Tambah Anggota</button>
    </div>
    <div class="notice">
      ${ic('lock')}
      <span>Hanya akun yang terdaftar di bawah yang bisa masuk. PIN diberikan langsung oleh BPH ke masing-masing anggota.</span>
    </div>
    <div class="ev-list">${list.map((m) => `
      <div class="card mem ${m.active ? '' : 'off'}" ${dc(m.div)}>
        <div class="avatar sm">${esc((m.name || '?')[0].toUpperCase())}</div>
        <div class="mem-b">
          <b>${esc(m.name)}</b>
          <span class="mono">@${esc(m.username)} · PIN: <code>${esc(m.pin)}</code> · ${esc(roleLabel(m))}${m.active ? '' : ' · [NONAKTIF]'}</span>
        </div>
        <div class="mem-a">
          <button class="chip" data-medit="${m.uid}">Edit</button>
          <button class="chip" data-mreset="${m.uid}">Reset PIN</button>
          ${m.uid === S.user.uid ? '' : `
            <button class="chip" data-mtoggle="${m.uid}">${m.active ? 'Nonaktifkan' : 'Aktifkan'}</button>
            <button class="chip" data-mdel="${m.uid}">Hapus</button>
          `}
        </div>
      </div>`).join('') || emptyBox('Belum ada anggota.')}
    </div>`;
}

const VIEWS = { home: viewHome, calendar: viewCalendar, agenda: viewAgenda, divisi: viewDivisi, profil: viewProfil, anggota: viewAnggota };

function render() {
  if (!S.user) return renderLogin();
  const lg = $('#login'); if (lg) lg.remove();
  $('#app').hidden = false;
  renderChrome();
  const v = $('#view'); 
  v.innerHTML = VIEWS[S.tab]();
  v.style.animation = 'none'; void v.offsetWidth; v.style.animation = '';
}

/* ---------- Login & Demo Switcher ---------- */
function renderLogin() {
  $('#app').hidden = true;
  let l = $('#login'); 
  if (!l) { 
    l = document.createElement('div'); 
    l.id = 'login'; 
    l.className = 'login'; 
    document.body.appendChild(l); 
  }

  l.innerHTML = `
    <div class="login-box">
      <img class="logo" src="icon.svg" alt="Logo Kine Klub">
      <h1>KINE<br><i>KLUB</i></h1>
      <p>Sistem Kalender Terpadu MM Kine Klub UMY.<br>Masuk menggunakan <b>Username</b> & <b>PIN (6 Digit)</b>.</p>

      <!-- Quick Switcher Demo (4 Peran) -->
      <div style="background:var(--bg-2);border:1px solid var(--line);border-radius:var(--r);padding:12px;margin-bottom:18px;">
        <span class="mono" style="color:var(--accent);display:block;margin-bottom:8px;">Akun Demo (1-Klik):</span>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
          <button class="btn" type="button" data-demo="bph">BPH</button>
          <button class="btn" type="button" data-demo="kadiv">KETUA DIVISI</button>
          <button class="btn" type="button" data-demo="wakadiv">WAKIL DIVISI</button>
          <button class="btn" type="button" data-demo="anggota">ANGGOTA DIVISI</button>
        </div>
      </div>

      <form id="login-form" autocomplete="on">
        <div class="field">
          <label class="mono" for="l-user">Username</label>
          <input id="l-user" required autocomplete="username" placeholder="bph / kadiv / wakadiv / anggota">
        </div>
        <div class="field">
          <label class="mono" for="l-pin">PIN (6 Digit)</label>
          <input id="l-pin" type="password" inputmode="numeric" pattern="\\d{6}" maxlength="6" required autocomplete="current-password" placeholder="123456">
        </div>
        <div class="login-err" role="alert" style="color:var(--danger);font-size:12px;margin-bottom:10px;">${esc(S.loginErr)}</div>
        <button class="btn btn-primary btn-block" type="submit">Masuk ke Sistem</button>
      </form>
    </div>`;

  $('#login-form').onsubmit = (e) => {
    e.preventDefault();
    const u = $('#l-user').value.trim().toLowerCase();
    const p = $('#l-pin').value.trim();
    const found = S.members.find((m) => m.username.toLowerCase() === u);
    
    if (!found) {
      S.loginErr = 'Username tidak terdaftar! Hubungi BPH untuk dibuatkan akun.';
      renderLogin();
      return;
    }
    if (!found.active) {
      S.loginErr = 'Akun Anda dinonaktifkan oleh BPH. Hubungi Ketua/Pengurus.';
      renderLogin();
      return;
    }
    if (found.pin !== p) {
      S.loginErr = 'PIN salah! Silakan coba lagi.';
      renderLogin();
      return;
    }

    S.user = found;
    S.loginErr = '';
    localStorage.setItem(LS.session, JSON.stringify({ username: found.username }));
    l.remove();
    S.tab = 'home';
    render();
    toast(`Selamat datang, ${found.name}!`);
  };
}

/* ---------- Sheets Modal ---------- */
function openSheet(html) {
  closeSheet();
  const bg = document.createElement('div'); bg.className = 'sheet-bg'; bg.id = 'sheet';
  bg.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
  bg.addEventListener('mousedown', (e) => { if (e.target === bg) closeSheet(); });
  $('#sheet-root').appendChild(bg);
  return bg;
}
const closeSheet = () => { const s = $('#sheet'); if (s) s.remove(); };

function openDetail(id) {
  const e = S.events.find((x) => x.id === id); if (!e) return;
  const edit = canEdit(e);
  openSheet(`<div class="sheet-top"><span class="tag solid" ${dc(e.div)}>${esc(div(e.div).full)}</span>
    <button class="icon-btn" data-close aria-label="Tutup">${ic('x')}</button></div>
    <div class="detail"><span class="mono">${esc(e.type)}</span><h2>${esc(e.title)}</h2>
    <dl><dt class="mono">Tanggal</dt><dd>${fullDate(e.date)}</dd>
      <dt class="mono">Waktu</dt><dd>${esc(timeStr(e))}</dd>
      <dt class="mono">Lokasi</dt><dd>${esc(e.loc || '—')}</dd>
      <dt class="mono">Catatan</dt><dd>${esc(e.desc || '—')}</dd>
      <dt class="mono">Pembuat</dt><dd>${esc(e.by || '—')}</dd></dl></div>
    ${edit ? `<div class="actions"><button class="btn btn-danger" data-del="${e.id}">Hapus Agenda</button><button class="btn btn-primary" data-edit="${e.id}">Edit Agenda</button></div>`
      : `<div class="notice">${ic('lock')}<span>Hanya Kadiv/Wakadiv ${esc(div(e.div).name)} atau BPH yang berhak mengubah agenda ini.</span></div>`}`);
}

function openForm(id) {
  const e = id ? S.events.find((x) => x.id === id) : null;
  const allowed = isBPH(S.user) ? DIVS : [div(S.user.div)];
  const v = e || { title: '', date: S.sel || todayKey(), div: allowed[0].id, type: 'Rapat', start: '', end: '', loc: '', desc: '' };
  
  const bg = openSheet(`<form id="ev-form"><div class="sheet-top"><h2>${e ? 'Edit' : 'Tambah'} Agenda</h2>
    <button type="button" class="icon-btn" data-close aria-label="Tutup">${ic('x')}</button></div>
    <div class="field"><label class="mono" for="f-title">Judul Agenda</label><input id="f-title" required maxlength="80" value="${esc(v.title)}" placeholder="Contoh: Rapat Koordinasi Film Pendek"></div>
    <div class="row2"><div class="field"><label class="mono" for="f-div">Divisi</label><select id="f-div" ${allowed.length === 1 ? 'disabled' : ''}>${allowed.map((d) => `<option value="${d.id}" ${d.id === v.div ? 'selected' : ''}>${d.name}</option>`).join('')}</select></div>
      <div class="field"><label class="mono" for="f-type">Jenis</label><select id="f-type">${TYPES.map((t) => `<option ${t === v.type ? 'selected' : ''}>${t}</option>`).join('')}</select></div></div>
    <div class="field"><label class="mono" for="f-date">Tanggal</label><input id="f-date" type="date" required value="${v.date}"></div>
    <div class="row2"><div class="field"><label class="mono" for="f-start">Mulai</label><input id="f-start" type="time" value="${v.start}"></div>
      <div class="field"><label class="mono" for="f-end">Selesai</label><input id="f-end" type="time" value="${v.end}"></div></div>
    <div class="field"><label class="mono" for="f-loc">Lokasi</label><input id="f-loc" maxlength="80" value="${esc(v.loc)}" placeholder="Contoh: Sekretariat / Kali Code"></div>
    <div class="field"><label class="mono" for="f-desc">Catatan / Detail Agenda</label><textarea id="f-desc" maxlength="400" placeholder="Keterangan tambahan untuk anggota">${esc(v.desc)}</textarea></div>
    <div class="actions"><button class="btn" type="button" data-close>Batal</button><button class="btn btn-primary" type="submit">Simpan Agenda</button></div></form>`);
    
  $('#f-title').focus();
  $('#ev-form', bg).onsubmit = (ev) => {
    ev.preventDefault();
    const start = $('#f-start').value, end = $('#f-end').value;
    if (start && end && end < start) return toast('JAM SELESAI HARUS SETELAH JAM MULAI!');
    const data = { 
      title: $('#f-title').value.trim(), 
      div: $('#f-div').value, 
      type: $('#f-type').value, 
      date: $('#f-date').value, 
      start, 
      end, 
      loc: $('#f-loc').value.trim(), 
      desc: $('#f-desc').value.trim() 
    };
    if (!data.title || !data.date) return;

    let updatedList = [...S.events];
    if (e) {
      const idx = updatedList.findIndex((x) => x.id === e.id);
      if (idx !== -1) updatedList[idx] = { ...updatedList[idx], ...data };
    } else {
      updatedList.push({ id: uid(), ...data, by: `${S.user.name} (${roleLabel(S.user)})` });
    }
    
    saveEvents(updatedList);
    S.sel = data.date;
    if (S.tab === 'calendar') S.month = new Date(parse(data.date).getFullYear(), parse(data.date).getMonth(), 1);
    closeSheet(); 
    render(); 
    toast(e ? 'AGENDA BERHASIL DIPERBARUI' : 'AGENDA BERHASIL DITAMBAHKAN');
  };
}

/* ---------- Member Sheets (BPH) ---------- */
function openMemberForm(memUid) {
  const m = memUid ? S.members.find((x) => x.uid === memUid) : null;
  const v = m || { name: '', username: '', pin: '123456', div: 'MEDIA', role: 'anggota' };
  
  const bg = openSheet(`<form id="m-form"><div class="sheet-top"><h2>${m ? 'Edit Anggota' : 'Tambah Anggota Baru'}</h2>
    <button type="button" class="icon-btn" data-close aria-label="Tutup">${ic('x')}</button></div>
    <div class="field"><label class="mono" for="m-name">Nama Lengkap</label><input id="m-name" required maxlength="40" value="${esc(v.name)}" placeholder="Contoh: Dimas Wicaksono"></div>
    ${m ? `<div class="field"><label class="mono">Username</label><input value="@${esc(v.username)}" disabled></div>` : `
    <div class="row2"><div class="field"><label class="mono" for="m-user">Username</label><input id="m-user" required maxlength="20" placeholder="contoh: dimas"></div>
    <div class="field"><label class="mono" for="m-pin">PIN (6 Digit)</label><input id="m-pin" required inputmode="numeric" maxlength="6" pattern="\\d{6}" value="123456"></div></div>
    <button type="button" class="btn btn-block" data-act="genpin" style="margin-bottom:14px">Acak PIN 6-Digit</button>`}
    <div class="row2"><div class="field"><label class="mono" for="m-div">Divisi</label><select id="m-div">${DIVS.map((d) => `<option value="${d.id}" ${d.id === v.div ? 'selected' : ''}>${d.name}</option>`).join('')}</select></div>
    <div class="field"><label class="mono" for="m-role">Peran</label><select id="m-role">${[['anggota', 'Anggota (Lihat Saja)'], ['wakadiv', 'Wakadiv (Bisa Edit)'], ['kadiv', 'Kadiv (Bisa Edit)']].map(([k, l]) => `<option value="${k}" ${k === v.role ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div>
    <div class="actions"><button class="btn" type="button" data-close>Batal</button><button class="btn btn-primary" type="submit">Simpan Anggota</button></div></form>`);

  $('#m-form', bg).onsubmit = (e) => {
    e.preventDefault();
    const data = { name: $('#m-name').value.trim(), div: $('#m-div').value, role: $('#m-role').value };
    let list = [...S.members];
    if (m) {
      const idx = list.findIndex((x) => x.uid === m.uid);
      if (idx !== -1) list[idx] = { ...list[idx], ...data };
      toast('DATA ANGGOTA DIPERBARUI');
    } else {
      const username = $('#m-user').value.trim().toLowerCase();
      const pin = $('#m-pin').value.trim();
      if (!/^[a-z0-9._]{3,20}$/.test(username)) return toast('USERNAME TIDAK VALID (HURUF KECIL/ANGKA/3-20 KARAKTER)');
      if (!/^\d{6}$/.test(pin)) return toast('PIN HARUS 6 ANGKA!');
      if (list.some((x) => x.username.toLowerCase() === username)) return toast('USERNAME SUDAH DIGUNAKAN!');
      list.push({ uid: uid(), username, pin, ...data, active: true });
      toast('ANGGOTA BARU BERHASIL DITAMBAHKAN');
    }
    saveMembers(list);
    closeSheet();
    render();
  };
}

function openResetForm(memUid) {
  const m = S.members.find((x) => x.uid === memUid); if (!m) return;
  const bg = openSheet(`<form id="r-form"><div class="sheet-top"><h2>Reset PIN Anggota</h2><button type="button" class="icon-btn" data-close aria-label="Tutup">${ic('x')}</button></div>
    <p style="margin-bottom:14px;color:var(--text-2);font-size:13px;">Reset PIN baru untuk <b>${esc(m.name)}</b> (@${esc(m.username)}). Berikan PIN ini kepada anggota bersangkutan.</p>
    <div class="field"><label class="mono" for="r-pin">PIN Baru (6 Digit)</label><input id="r-pin" required inputmode="numeric" maxlength="6" pattern="\\d{6}" placeholder="Contoh: 654321"></div>
    <button type="button" class="btn btn-block" data-act="genpin_r" style="margin-bottom:14px">Acak PIN 6-Digit</button>
    <div class="actions"><button class="btn" type="button" data-close>Batal</button><button class="btn btn-primary" type="submit">Simpan PIN Baru</button></div></form>`);
    
  $('#r-form', bg).onsubmit = (e) => {
    e.preventDefault();
    const pin = $('#r-pin').value.trim();
    if (!/^\d{6}$/.test(pin)) return toast('PIN HARUS 6 ANGKA!');
    let list = [...S.members];
    const idx = list.findIndex((x) => x.uid === m.uid);
    if (idx !== -1) list[idx].pin = pin;
    saveMembers(list);
    closeSheet();
    render();
    toast(`PIN @${m.username} BERHASIL DIRESET KE ${pin}`);
  };
}

function openPinForm() {
  const bg = openSheet(`<form id="p-form"><div class="sheet-top"><h2>Ganti PIN Saya</h2><button type="button" class="icon-btn" data-close aria-label="Tutup">${ic('x')}</button></div>
    <div class="field"><label class="mono" for="p-old">PIN Lama</label><input id="p-old" type="password" inputmode="numeric" maxlength="6" required></div>
    <div class="field"><label class="mono" for="p-new">PIN Baru (6 Digit)</label><input id="p-new" type="password" inputmode="numeric" maxlength="6" required></div>
    <div class="actions"><button class="btn" type="button" data-close>Batal</button><button class="btn btn-primary" type="submit">Simpan PIN</button></div></form>`);

  $('#p-form', bg).onsubmit = (e) => {
    e.preventDefault();
    const o = $('#p-old').value.trim();
    const n = $('#p-new').value.trim();
    if (o !== S.user.pin) return toast('PIN LAMA SALAH!');
    if (!/^\d{6}$/.test(n)) return toast('PIN BARU HARUS 6 ANGKA!');
    let list = [...S.members];
    const idx = list.findIndex((x) => x.uid === S.user.uid);
    if (idx !== -1) {
      list[idx].pin = n;
      S.user.pin = n;
      saveMembers(list);
    }
    closeSheet();
    toast('PIN PRIBADI BERHASIL DIGANTI');
  };
}

/* ---------- Event Delegation ---------- */
document.addEventListener('click', (ev) => {
  const t = ev.target.closest('[data-tab],[data-ev],[data-day],[data-filter],[data-act],[data-close],[data-edit],[data-del],[data-past],[data-divgo],[data-medit],[data-mtoggle],[data-mdel],[data-mreset],[data-demo],[data-switchdemo]');
  if (!t) return;
  const d = t.dataset;

  if (d.tab) { S.tab = d.tab; render(); window.scrollTo(0, 0); }
  else if (d.ev) openDetail(d.ev);
  else if (d.day) { 
    S.sel = d.day; 
    const x = parse(d.day); 
    if (x.getMonth() !== S.month.getMonth()) S.month = new Date(x.getFullYear(), x.getMonth(), 1); 
    render(); 
  }
  else if (d.filter) { S.filter = d.filter; render(); }
  else if (d.past) { S.past = d.past === '1'; render(); }
  else if (d.divgo) { S.filter = d.divgo; S.tab = 'agenda'; S.past = false; render(); window.scrollTo(0, 0); }
  else if (d.close !== undefined) closeSheet();
  else if (d.edit) openForm(d.edit);
  else if (d.del) { 
    if (confirm('Yakin ingin menghapus agenda ini?')) { 
      saveEvents(S.events.filter((x) => x.id !== d.del)); 
      closeSheet(); 
      render(); 
      toast('AGENDA DIHAPUS'); 
    } 
  }
  else if (d.medit) openMemberForm(d.medit);
  else if (d.mreset) openResetForm(d.mreset);
  else if (d.mtoggle) { 
    let list = [...S.members];
    const m = list.find((x) => x.uid === d.mtoggle);
    if (m) {
      m.active = !m.active;
      saveMembers(list);
      render();
      toast(m.active ? `AKSES @${m.username} DIAKTIFKAN` : `AKSES @${m.username} DINONAKTIFKAN`);
    }
  }
  else if (d.mdel) { 
    const m = S.members.find((x) => x.uid === d.mdel);
    if (m && confirm(`Hapus akun ${m.name} (@${m.username})?`)) {
      saveMembers(S.members.filter((x) => x.uid !== d.mdel));
      render();
      toast('ANGGOTA DIHAPUS');
    }
  }
  else if (d.act === 'addmember') openMemberForm();
  else if (d.act === 'genpin') { 
    const p = String(Math.floor(100000 + Math.random() * 900000));
    $('#m-pin').value = p; 
  }
  else if (d.act === 'genpin_r') { 
    const p = String(Math.floor(100000 + Math.random() * 900000));
    $('#r-pin').value = p; 
  }
  else if (d.act === 'chpin') openPinForm();
  else if (d.act === 'add') openForm();
  else if (d.act === 'prev') { S.month = new Date(S.month.getFullYear(), S.month.getMonth() - 1, 1); render(); }
  else if (d.act === 'next') { S.month = new Date(S.month.getFullYear(), S.month.getMonth() + 1, 1); render(); }
  else if (d.act === 'today') { const n = new Date(); S.month = new Date(n.getFullYear(), n.getMonth(), 1); S.sel = todayKey(); render(); }
  else if (d.act === 'theme') { 
    document.body.classList.toggle('light'); 
    localStorage.setItem(LS.theme, document.body.classList.contains('light') ? 'light' : 'dark'); 
    renderChrome(); 
  }
  else if (d.act === 'resetdemo') {
    if (confirm('Kembalikan agenda dan akun anggota ke pengaturan awal demo?')) {
      localStorage.removeItem(LS.events);
      localStorage.removeItem(LS.members);
      S.events = loadEvents();
      S.members = loadMembers();
      toast('DATA DEMO DIRESET KE AWAL');
      render();
    }
  }
  else if (d.act === 'logout') { 
    localStorage.removeItem(LS.session); 
    S.user = null; 
    render(); 
  }
  else if (d.demo) {
    const aliasMap = { ketua: 'bph', produksi: 'kadiv', wakil: 'wakadiv' };
    const targetUser = aliasMap[d.demo] || d.demo;
    const acc = S.members.find((m) => m.username === targetUser);
    if (acc) {
      $('#l-user').value = acc.username;
      $('#l-pin').value = acc.pin;
      $('#login-form').requestSubmit();
    }
  }
  else if (d.switchdemo) {
    const acc = S.members.find((m) => m.username === d.switchdemo && m.active);
    if (acc) {
      S.user = acc;
      localStorage.setItem(LS.session, JSON.stringify({ username: acc.username }));
      render();
      toast(`BERALIH PERAN: ${roleLabel(acc).toUpperCase()}`);
    }
  }
});

document.addEventListener('input', (e) => {
  if (e.target.id === 'q') { 
    S.q = e.target.value; 
    const pos = e.target.selectionStart; 
    render(); 
    const q = $('#q'); 
    if (q) {
      q.focus(); 
      q.setSelectionRange(pos, pos); 
    }
  }
});

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });

/* ---------- Boot ---------- */
if (localStorage.getItem(LS.theme) === 'light') document.body.classList.add('light');
render();

})();
