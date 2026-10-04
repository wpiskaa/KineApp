# Kine Klub App — Kalender & Manajemen UKM MM Kine Klub UMY

Aplikasi manajemen dan kalender terpadu untuk **UKM Multimedia Kine Klub Universitas Muhammadiyah Yogyakarta (UMY)**. Didesain dengan estetika **Rock-Minimalist** (palet Merah Maron `#7a0f1e`, Hitam `#0b0b0c`, dan Putih `#f5f3f1`), tipografi editorial bergaya bioskop (*Bebas Neue* & *JetBrains Mono*), serta responsif di **Desktop**, **iPad / Tablet**, dan **Mobile (HP)**.

---

## ⚡ Fitur Utama

1. **Kalender Agenda Terpadu Lintas Divisi**:
   - Tampilan kalender bulanan interaktif dengan grid adaptif.
   - Di Desktop / Tablet: Menampilkan pill agenda langsung di kotak tanggal.
   - Di Mobile (HP): Menampilkan dot indikator warna divisi yang rapi dan ringkas.
   - Filter cepat berdasarkan divisi: **Semua**, **BPH**, **Media**, **Apresiasi**, **Asset**, **Produksi**, **Humas**, **PSDM**.

2. **Hierarki Akses & Peran Pengguna (4 Tingkatan)**:
   - **BPH**: Akses penuh untuk membuat, mengubah, menghapus agenda semua divisi, serta mengelola anggota.
   - **KETUA DIVISI**: Dapat menambah, mengubah, dan menghapus agenda untuk divisinya sendiri.
   - **WAKIL DIVISI**: Membantu ketua divisi dalam mengelola agenda divisinya sendiri.
   - **ANGGOTA DIVISI**: Mode tinjau (*read-only*), dapat melihat seluruh jadwal dan detail kegiatan tanpa risiko mengubah data secara tidak sengaja.

3. **Sinkronisasi Multi-Device & Real-Time**:
   - Mendukung **Live Multi-Tab Sync** menggunakan `BroadcastChannel` browser.
   - Dukungan Progressive Web App (PWA) lengkap dengan manifest dan icon.
   - Siap dihubungkan ke backend online (opsi Supabase atau Firebase) kapan pun dibutuhkan.

4. **Desain Rock-Minimalist & Responsif**:
   - **Desktop (>= 840px / 1200px)**: Persistent Left Sidebar Rail dengan akses cepat tambah agenda.
   - **iPad / Tablet (600px - 839px)**: Transisi fleksibel, touch-friendly, dan grid kalender proporsional.
   - **HP / Mobile (< 600px)**: Bottom Navigation Dock, Elevated Floating Action Button (FAB), serta dialog modal layar penuh.

---

## 🚀 Menjalankan Secara Lokal

Cukup jalankan web server lokal sederhana (misal menggunakan Node.js / npx, Python, atau Live Server):

```bash
# Opsi 1: Menggunakan npx http-server
npx http-server -p 8090 -c-1

# Opsi 2: Menggunakan Python 3
python -m http.server 8090
```

Buka browser di `http://localhost:8090`.

---

## 🛠️ Struktur Berkas

```
KineApp/
├── css/
│   └── style.css            # Desain rock-minimalist & sistem responsif
├── js/
│   ├── app.js               # Logika aplikasi SPA & sinkronisasi data
│   ├── firebase-config.js   # Konfigurasi Firebase (opsional)
│   └── supabase-config.js   # Konfigurasi Supabase (opsional)
├── supabase/
│   └── setup.sql            # Skema tabel & Row Level Security (RLS)
├── firestore.rules          # Aturan keamanan Firestore (opsional)
├── icon.svg                 # Ikon PWA Kine Klub (Film Strip)
├── index.html               # Semantic HTML5 App Shell
├── manifest.json            # PWA Web App Manifest
├── SETUP.md                 # Petunjuk deployment & backend
└── README.md
```

---

*Dikembangkan untuk MM Kine Klub UMY.*
