# Panduan Setup Kine Klub (Firebase)

Gratis dengan paket Spark. Estimasi 10–15 menit.

## 1. Buat project
1. Buka https://console.firebase.google.com → **Add project** → nama `kineklub` (Analytics boleh dimatikan).

## 2. Aktifkan login
1. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable → Save**.
   (Aplikasi mengubah *username* jadi email `username@kineklub.app`, dan *PIN 6 angka* jadi password.)
2. Pendaftaran publik tidak diberi UI di aplikasi, dan akun tanpa profil aktif di Firestore tidak bisa membaca apa pun (dijaga `firestore.rules`).

## 3. Buat database
1. **Build → Firestore Database → Create database** → pilih lokasi `asia-southeast2 (Jakarta)` → **Production mode**.
2. Tab **Rules** → tempel isi file `firestore.rules` → **Publish**.

## 4. Hubungkan web app
1. **Project settings (ikon ⚙) → Your apps → `</>` Web** → daftarkan app → salin objek `firebaseConfig`.
2. Tempel ke `js/firebase-config.js`.
3. **Authentication → Settings → Authorized domains**: tambahkan domain tempat app di-hosting (mis. `username.github.io`). `localhost` sudah ada.

## 5. Buat akun Ketua (admin pertama) — sekali saja, manual
1. **Authentication → Users → Add user**: email `ketua@kineklub.app`, password = PIN 6 angka pilihan Anda.
2. Salin **User UID** akun itu.
3. **Firestore → Start collection** `users` → Document ID = **UID tadi** → isi field:

| Field | Type | Value |
|---|---|---|
| `username` | string | `ketua` |
| `name` | string | nama Ketua |
| `div` | string | `BPH` |
| `role` | string | `kadiv` |
| `active` | boolean | `true` |

## 6. Selanjutnya semuanya dari aplikasi
Login sebagai `ketua` → **Profil → Kelola anggota & akses → Tambah**. Isi nama, username, PIN (atau "Buat PIN acak"), divisi, peran, lalu berikan username & PIN ke orangnya. Anggota bisa mengganti PIN sendiri di **Profil → Ganti PIN**.

- **Cabut akses:** *Nonaktifkan* (bisa diaktifkan lagi) atau *Hapus*. Efeknya langsung, termasuk yang sedang login.
- **Lupa PIN:** Firebase tidak mengizinkan klien mengatur ulang password orang lain. Solusi: *Hapus* anggota lalu buat ulang dengan username baru (mis. `rani2`).
  (Reset PIN satu-klik butuh Cloud Functions / paket Blaze.)

## 7. Hosting (agar bisa dibuka di HP semua anggota)
Pilih salah satu: **GitHub Pages** (seperti Piskaly), atau **Firebase Hosting** (`npm i -g firebase-tools && firebase init hosting && firebase deploy`).
Untuk uji lokal: `npx http-server -p 8090` lalu buka `http://localhost:8090`.

## Keamanan — ringkas
- Tidak ada pendaftaran publik; hanya BPH yang bisa membuat akun & memberi peran.
- Hak akses ditegakkan di server (`firestore.rules`), bukan hanya di tampilan.
- PIN 6 angka dilindungi pembatasan percobaan bawaan Firebase (`too-many-requests`).
- Sarankan anggota mengganti PIN awal dan tidak memakai PIN mudah (123456).
