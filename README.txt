BELIBAGS.ID - WEBSITE KATALOG

Teknologi:
- HTML
- CSS
- JavaScript (Vanilla JS)
- PapaParse untuk membaca file CSV

CARA MENJALANKAN DI KOMPUTER:
1. Buka folder project di VS Code.
2. Pastikan folder data berisi products.csv.
3. Jalankan dengan extension Live Server (klik kanan index.html > Open with Live Server).
4. Jangan membuka index.html dengan double-click/file:// karena browser membatasi fetch file CSV lokal.

DATA CSV:
File data/products.csv adalah file scraping asli yang diberikan. Kode membaca kolom:
- contents href              : URL produk Shopee
- _image_yazkc_11 src        : URL gambar produk
- whitespace-normal          : nama produk
- font-medium 2              : harga produk
- min-w-0                    : teks tambahan jika tersedia

CATATAN HARGA:
Data harga hasil scraping seperti 59.301 ditampilkan sebagai Rp59.301.

DEPLOY KE VERCEL:
1. Upload seluruh isi folder ini ke GitHub.
2. Di Vercel pilih Add New Project lalu import repository.
3. Framework Preset: Other.
4. Build Command: kosongkan.
5. Output Directory: . (root project).
6. Klik Deploy.

PENTING:
Ini adalah frontend katalog. Chatbot RAG dan WhatsApp Gateway belum diintegrasikan pada versi ini.
