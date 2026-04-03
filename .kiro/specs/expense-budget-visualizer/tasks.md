# Implementation Plan: Expense & Budget Visualizer

## Overview

Implementasi aplikasi web satu halaman menggunakan HTML, CSS, dan Vanilla JavaScript murni. Struktur terdiri dari tiga file: `index.html`, `css/style.css`, dan `js/script.js`. Chart.js dimuat via CDN. Tidak ada build tool, tidak ada backend, tidak ada test setup.

## Tasks

- [x] 1. Buat struktur HTML dasar (`index.html`)
  - Buat file `index.html` dengan elemen-elemen utama: header (judul, tombol dark/light toggle), section form input (field name, amount, category dropdown, tombol submit, area error), section saldo total, section daftar transaksi (dengan select sort), dan section canvas pie chart
  - Sertakan CDN Chart.js di `<head>` dan link ke `css/style.css` dan `js/script.js`
  - Pastikan semua elemen memiliki `id` yang sesuai dengan yang direferensikan di desain (`#transaction-list`, `#total-balance`, `#form-errors`, dll.)
  - _Requirements: 1.1, 1.2, 2.1, 3.1, 4.1, 6.2, 6.4, 7.1_

- [x] 2. Implementasi StorageManager dan data model
  - [x] 2.1 Buat file `js/script.js` dan implementasikan `StorageManager`
    - Implementasikan `StorageManager` dengan konstanta `KEYS`, method `getTransactions()`, `saveTransactions()`, `getTheme()`, `saveTheme()`, dan `isAvailable()`
    - Tangani `JSON.parse` error secara graceful (kembalikan `[]`, log ke `console.error`)
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [ ]* 2.2 Tulis property test untuk Property 4: Round-trip Local Storage transaksi
    - **Property 4: Round-trip Local Storage transaksi**
    - **Validates: Requirements 5.1, 5.2, 5.3**
  - [ ]* 2.3 Tulis property test untuk Property 9: Round-trip preferensi tema
    - **Property 9: Round-trip preferensi tema**
    - **Validates: Requirements 7.3, 7.4**

- [x] 3. Implementasi Validator
  - [x] 3.1 Implementasikan `Validator.validateTransaction(name, amount, category)`
    - Kembalikan `{ valid: boolean, errors: [] }` sesuai skema `ValidationResult`
    - Validasi: name non-empty, amount > 0 dan merupakan angka, category salah satu dari 'Food'/'Transport'/'Fun'
    - Tampilkan semua error sekaligus (bukan satu per satu)
    - _Requirements: 1.4, 1.5_
  - [ ]* 3.2 Tulis property test untuk Property 1: Validasi menolak semua input tidak valid
    - **Property 1: Validasi menolak semua input tidak valid**
    - **Validates: Requirements 1.4, 1.5**
  - [ ]* 3.3 Tulis property test untuk Property 2: Validasi menerima semua input valid
    - **Property 2: Validasi menerima semua input valid**
    - **Validates: Requirements 1.3**

- [x] 4. Implementasi TransactionManager
  - [x] 4.1 Implementasikan `TransactionManager` dengan semua method-nya
    - `addTransaction(name, amount, category)`: buat objek Transaction baru (id berbasis timestamp, `createdAt: Date.now()`), simpan via StorageManager, kembalikan array terbaru
    - `deleteTransaction(id)`: filter array, simpan via StorageManager, kembalikan array terbaru
    - `calculateTotal(transactions)`: jumlahkan semua `amount`
    - `groupByCategory(transactions)`: kembalikan objek `{ Food: n, Transport: n, Fun: n }`
    - `sortTransactions(transactions, sortOption)`: sort berdasarkan 'amount-asc', 'amount-desc', 'category-az' tanpa mutasi array asli
    - _Requirements: 2.3, 3.2, 3.3, 3.4, 4.2, 4.3, 4.5, 8.2, 8.3_
  - [ ]* 4.2 Tulis property test untuk Property 3: Kalkulasi total selalu konsisten
    - **Property 3: Kalkulasi total selalu konsisten**
    - **Validates: Requirements 3.2, 3.3, 3.4**
  - [ ]* 4.3 Tulis property test untuk Property 5: groupByCategory akurat
    - **Property 5: groupByCategory akurat setelah perubahan**
    - **Validates: Requirements 4.2, 4.3, 4.5**
  - [ ]* 4.4 Tulis property test untuk Property 6: Sorting tidak mengubah data di Local Storage
    - **Property 6: Sorting tidak mengubah data di Local Storage**
    - **Validates: Requirements 8.2, 8.3**
  - [ ]* 4.5 Tulis property test untuk Property 7: Sorting amount-asc menghasilkan urutan benar
    - **Property 7: Sorting amount-asc menghasilkan urutan benar**
    - **Validates: Requirements 8.1, 8.2**
  - [ ]* 4.6 Tulis property test untuk Property 10: Delete menghapus tepat satu transaksi
    - **Property 10: Delete menghapus tepat satu transaksi**
    - **Validates: Requirements 2.3**

- [x] 5. Implementasi ChartManager
  - [x] 5.1 Implementasikan `ChartManager` dengan `init(canvasId)`, `update(categoryData)`, dan `showEmpty()`
    - Bungkus semua operasi dalam pengecekan `typeof Chart !== 'undefined'`
    - Jika Chart.js tidak tersedia, tampilkan pesan fallback di area chart
    - `update()` harus destroy dan recreate chart, atau gunakan `chart.data` + `chart.update()` untuk efisiensi
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 6. Implementasi UIRenderer
  - [x] 6.1 Implementasikan `UIRenderer` dengan semua method render
    - `renderTransactionList(transactions)`: render item transaksi ke `#transaction-list`, terapkan class highlight untuk amount > 500, tampilkan nama/amount/kategori dan tombol delete per item
    - `renderTotal(total)`: update teks di `#total-balance`
    - `renderValidationErrors(errors)` dan `clearValidationErrors()`: tampilkan/hapus pesan error di `#form-errors`
    - `resetForm()`: reset semua field form ke nilai kosong
    - `applyTheme(theme)`: tambah/hapus class `dark` pada `<body>`
    - `renderEmptyState()`: tampilkan pesan kosong di `#transaction-list`
    - _Requirements: 2.1, 2.2, 2.4, 3.1, 7.2, 9.1, 9.3, 9.4_
  - [ ]* 6.2 Tulis property test untuk Property 8: Highlight pengeluaran melebihi batas
    - **Property 8: Highlight pengeluaran melebihi batas**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4**

- [x] 7. Implementasi App controller dan wiring
  - [x] 7.1 Implementasikan `App` sebagai controller utama
    - Definisikan `App.state` dengan `transactions`, `sortOption: 'default'`, `theme`, `spendingLimit: 500`
    - `App.init()`: baca Local Storage, terapkan tema, cek ketersediaan Local Storage (tampilkan banner jika tidak tersedia), render semua komponen, pasang semua event listener
    - `App.handleAddTransaction(event)`: validasi → jika valid, tambah transaksi, render ulang; jika tidak valid, tampilkan error
    - `App.handleDeleteTransaction(id)`: hapus transaksi, render ulang
    - `App.handleSortChange(sortOption)`: update `state.sortOption`, render ulang daftar
    - `App.handleThemeToggle()`: toggle tema, simpan ke storage, terapkan ke UI
    - `App.render()`: panggil semua UIRenderer dan ChartManager dengan data terkini (terapkan sort aktif sebelum render)
    - Panggil `App.init()` di event `DOMContentLoaded`
    - _Requirements: 1.3, 2.3, 3.2, 3.3, 5.1, 5.2, 5.3, 5.4, 7.2, 7.3, 7.4, 8.1, 8.3_

- [x] 8. Checkpoint — Pastikan semua fitur inti berfungsi
  - Pastikan semua tests pass, tanyakan kepada user jika ada pertanyaan.

- [x] 9. Implementasi CSS (`css/style.css`)
  - [x] 9.1 Buat layout responsif dengan CSS Grid atau Flexbox
    - Layout dua kolom di desktop (form + chart di kiri, daftar di kanan), satu kolom di mobile (≤ 768px)
    - Daftar transaksi scrollable dengan `max-height` dan `overflow-y: auto`
    - Responsif dari 320px hingga 1920px
    - _Requirements: 6.1, 6.3, 6.4_
  - [x] 9.2 Implementasikan dark/light mode via CSS custom properties dan class `.dark` pada `<body>`
    - Definisikan CSS variables untuk warna di `:root` (light) dan `body.dark` (dark)
    - Terapkan ke semua komponen: background, teks, border, tombol
    - _Requirements: 7.2_
  - [x] 9.3 Implementasikan style highlight untuk transaksi melebihi batas
    - Class `.over-limit` pada item transaksi: warna latar atau border berbeda (misal merah/oranye)
    - Pastikan kontras warna memadai di kedua mode (light dan dark)
    - _Requirements: 9.1, 9.3_

- [x] 10. Final checkpoint — Verifikasi end-to-end
  - Pastikan semua tests pass, tanyakan kepada user jika ada pertanyaan.

## Notes

- Task bertanda `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Setiap task mereferensikan requirement spesifik untuk keterlacakan
- Tidak ada test setup yang diperlukan — implementasi langsung di browser
- Property tests (task `*`) mengacu pada properti di design.md dan memerlukan Jest + fast-check jika ingin dijalankan
