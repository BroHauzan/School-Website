# Firebase Setup — Admin Berita SMASA

## 1. Service account (Admin SDK)
1. Firebase Console > Project Settings > Service accounts > Generate new private key.
2. Copy ke `.env.local`:
   - `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `FIREBASE_ADMIN_PRIVATE_KEY` (satu baris, `\n` literal)
3. Jangan commit `.env.local`.

## 2. Storage
1. Console > Build > Storage > Get started (rekomendasi region `asia-southeast2`).
2. Bucket harus = `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` (saat ini `sman-1-lumajang.firebasestorage.app` belum ada).
3. Upload gambar lewat `/api/berita/upload` (proxy server, bebas CORS client).

## 3. Auth admin
1. Console > Build > Authentication > Sign-in method > aktifkan Email/Password.
2. Users > Add user (email + password admin).
3. Opsional: isi `ADMIN_EMAILS=email@sekolah,id` untuk allowlist.

## 4. Rules
Deploy manual via Console:
- Firestore: copy isi `firestore.rules` (publik baca koleksi `berita`, tulis ditolak).
- Storage: copy isi `storage.rules` (publik baca `berita/*`, tulis ditolak).
Tulis hanya lewat Admin SDK server (session cookie).

## 5. Env Vercel
Salin semua key dari `.env.example` ke Vercel Project > Settings > Environment Variables:
- `NEXT_PUBLIC_*` (client), `FIREBASE_ADMIN_*` + `ADMIN_EMAILS` (server only).

## 6. Skema Firestore
Koleksi `berita`, dokumen:
slug, title, excerpt, tag, image, body[], featured, published, dateISO, dateLabel, createdAt, updatedAt.
