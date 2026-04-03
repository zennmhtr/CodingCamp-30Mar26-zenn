# Dokumen Desain: Expense & Budget Visualizer

## Overview

Expense & Budget Visualizer adalah aplikasi web satu halaman (SPA) yang dibangun dengan HTML, CSS, dan Vanilla JavaScript murni tanpa framework. Aplikasi memungkinkan pengguna mencatat pengeluaran, melihat ringkasan saldo, memvisualisasikan distribusi pengeluaran per kategori melalui pie chart, serta mengelola preferensi tampilan — semuanya tersimpan secara persisten di Local Storage browser.

Tidak ada server atau backend. Seluruh logika berjalan di sisi klien (client-side only).

### Tujuan Teknis

- Satu file HTML (`index.html`), satu CSS (`css/style.css`), satu JS (`js/script.js`)
- Chart.js dimuat via CDN untuk pie chart
- Local Storage sebagai satu-satunya mekanisme persistensi
- Responsif dari 320px hingga 1920px
- Mendukung dark/light mode, sorting transaksi, dan highlight pengeluaran > 500

---

## Architecture

Arsitektur aplikasi mengikuti pola **MVC ringan berbasis modul** dalam satu file JavaScript. Tidak ada build tool atau bundler — semua dieksekusi langsung di browser.

```
┌─────────────────────────────────────────────────────┐
│                    index.html                        │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Form     │  │ Summary /    │  │ Transaction   │  │
│  │ Input    │  │ Balance      │  │ List          │  │
│  └──────────┘  └──────────────┘  └───────────────┘  │
│  ┌──────────────────────────────────────────────┐    │
│  │              Pie Chart (Chart.js)            │    │
│  └──────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
         │                        │
         ▼                        ▼
  ┌─────────────┐         ┌──────────────┐
  │  js/script  │         │  Local       │
  │  .js        │◄───────►│  Storage     │
  │  (Logic)    │         │  (Browser)   │
  └─────────────┘         └──────────────┘
```

### Alur Data

1. Pengguna mengisi form → validasi → simpan ke Local Storage → render ulang UI
2. Pengguna hapus transaksi → hapus dari Local Storage → render ulang UI
3. Halaman dimuat → baca Local Storage → render semua komponen
4. Toggle dark/light → simpan preferensi ke Local Storage → terapkan class CSS

### Prinsip Desain

- **Single source of truth**: Array transaksi di memori selalu disinkronkan dengan Local Storage
- **Render ulang penuh**: Setiap perubahan data memicu render ulang daftar dan chart (sederhana, tidak perlu virtual DOM)
- **Stateless rendering**: Fungsi render hanya membaca state, tidak memodifikasinya

---

## Components and Interfaces

### 1. StorageManager

Bertanggung jawab atas semua operasi Local Storage.

```javascript
StorageManager = {
  // Kunci yang digunakan di Local Storage
  KEYS: {
    TRANSACTIONS: 'ebv_transactions',
    THEME: 'ebv_theme'
  },

  // Mengembalikan array transaksi, atau [] jika kosong/error
  getTransactions(): Transaction[],

  // Menyimpan seluruh array transaksi
  saveTransactions(transactions: Transaction[]): void,

  // Mengembalikan 'dark' | 'light', default 'light'
  getTheme(): string,

  // Menyimpan preferensi tema
  saveTheme(theme: string): void,

  // Mengembalikan true jika Local Storage tersedia
  isAvailable(): boolean
}
```

### 2. TransactionManager

Mengelola logika bisnis transaksi (CRUD, kalkulasi).

```javascript
TransactionManager = {
  // Menambah transaksi baru, mengembalikan array terbaru
  addTransaction(name: string, amount: number, category: string): Transaction[],

  // Menghapus transaksi berdasarkan id, mengembalikan array terbaru
  deleteTransaction(id: string): Transaction[],

  // Menghitung total semua transaksi
  calculateTotal(transactions: Transaction[]): number,

  // Mengelompokkan total per kategori untuk chart
  groupByCategory(transactions: Transaction[]): { [category: string]: number },

  // Mengurutkan transaksi sesuai opsi sort
  sortTransactions(transactions: Transaction[], sortOption: string): Transaction[]
}
```

### 3. Validator

Memvalidasi input form sebelum diproses.

```javascript
Validator = {
  // Mengembalikan { valid: boolean, errors: { field: string, message: string }[] }
  validateTransaction(name: string, amount: string, category: string): ValidationResult
}
```

### 4. UIRenderer

Bertanggung jawab merender semua komponen UI ke DOM.

```javascript
UIRenderer = {
  // Render daftar transaksi ke #transaction-list
  renderTransactionList(transactions: Transaction[], limit: number): void,

  // Render nilai total ke #total-balance
  renderTotal(total: number): void,

  // Render pesan error validasi ke #form-errors
  renderValidationErrors(errors: ValidationError[]): void,

  // Bersihkan pesan error
  clearValidationErrors(): void,

  // Reset semua field form
  resetForm(): void,

  // Terapkan tema ke <body>
  applyTheme(theme: string): void,

  // Render pesan kosong jika tidak ada transaksi
  renderEmptyState(): void
}
```

### 5. ChartManager

Mengelola instance Chart.js dan pembaruan data.

```javascript
ChartManager = {
  // Instance Chart.js aktif
  _chart: null,

  // Inisialisasi chart pertama kali
  init(canvasId: string): void,

  // Perbarui data chart dengan data kategori terbaru
  update(categoryData: { [category: string]: number }): void,

  // Tampilkan kondisi kosong (destroy chart jika ada)
  showEmpty(): void
}
```

### 6. App (Controller)

Titik masuk utama yang mengorkestrasi semua komponen.

```javascript
App = {
  // State aktif
  state: {
    transactions: Transaction[],
    sortOption: string,   // 'amount-asc' | 'amount-desc' | 'category-az'
    theme: string,        // 'light' | 'dark'
    spendingLimit: number // default: 500
  },

  // Inisialisasi aplikasi saat DOMContentLoaded
  init(): void,

  // Handler submit form
  handleAddTransaction(event: Event): void,

  // Handler delete transaksi
  handleDeleteTransaction(id: string): void,

  // Handler perubahan sort
  handleSortChange(sortOption: string): void,

  // Handler toggle tema
  handleThemeToggle(): void,

  // Render ulang seluruh UI berdasarkan state terkini
  render(): void
}
```

---

## Data Models

### Transaction

```javascript
{
  id: string,        // UUID atau timestamp-based unique ID
  name: string,      // Nama item pengeluaran (non-empty)
  amount: number,    // Jumlah pengeluaran (> 0)
  category: string,  // 'Food' | 'Transport' | 'Fun'
  createdAt: number  // Unix timestamp (Date.now())
}
```

### ValidationResult

```javascript
{
  valid: boolean,
  errors: [
    {
      field: string,   // 'name' | 'amount' | 'category'
      message: string  // Pesan error yang ditampilkan ke pengguna
    }
  ]
}
```

### AppState (in-memory)

```javascript
{
  transactions: Transaction[],
  sortOption: 'default' | 'amount-asc' | 'amount-desc' | 'category-az',
  theme: 'light' | 'dark',
  spendingLimit: 500
}
```

### Local Storage Schema

| Key | Value | Deskripsi |
|-----|-------|-----------|
| `ebv_transactions` | `JSON.stringify(Transaction[])` | Array semua transaksi |
| `ebv_theme` | `'light'` atau `'dark'` | Preferensi tema pengguna |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Validasi menolak semua input tidak valid

*For any* kombinasi input form di mana setidaknya satu field kosong (name kosong, amount kosong/nol/negatif, atau category tidak dipilih), fungsi `Validator.validateTransaction` harus mengembalikan `valid: false` dan menyertakan error untuk field yang bermasalah.

**Validates: Requirements 1.4, 1.5**

---

### Property 2: Validasi menerima semua input valid

*For any* kombinasi input form di mana name non-empty, amount > 0, dan category adalah salah satu dari 'Food', 'Transport', 'Fun', fungsi `Validator.validateTransaction` harus mengembalikan `valid: true` dengan array errors kosong.

**Validates: Requirements 1.3**

---

### Property 3: Kalkulasi total selalu konsisten

*For any* array transaksi, `TransactionManager.calculateTotal` harus mengembalikan nilai yang sama persis dengan hasil penjumlahan manual semua field `amount` dalam array tersebut.

**Validates: Requirements 3.2, 3.3, 3.4**

---

### Property 4: Round-trip Local Storage transaksi

*For any* array transaksi, setelah memanggil `StorageManager.saveTransactions(transactions)`, memanggil `StorageManager.getTransactions()` harus mengembalikan array yang ekuivalen (sama panjang, sama id, sama amount, sama name, sama category).

**Validates: Requirements 5.1, 5.2, 5.3**

---

### Property 5: groupByCategory akurat setelah perubahan

*For any* array transaksi, `TransactionManager.groupByCategory` harus mengembalikan objek di mana setiap nilai kategori sama persis dengan jumlah amount semua transaksi dalam kategori tersebut, dan tidak ada kategori lain yang muncul selain yang ada di array.

**Validates: Requirements 4.2, 4.3, 4.5**

---

### Property 6: Sorting tidak mengubah data di Local Storage

*For any* array transaksi dan opsi sort ('amount-asc', 'amount-desc', 'category-az'), memanggil `TransactionManager.sortTransactions` harus mengembalikan array dengan elemen yang sama (tidak ada yang hilang atau ditambah), hanya urutannya yang berbeda, dan data di Local Storage tidak berubah.

**Validates: Requirements 8.2, 8.3**

---

### Property 7: Sorting amount-asc menghasilkan urutan benar

*For any* array transaksi dengan lebih dari satu elemen, hasil `sortTransactions(transactions, 'amount-asc')` harus memiliki setiap elemen dengan amount ≤ amount elemen berikutnya (non-decreasing order).

**Validates: Requirements 8.1, 8.2**

---

### Property 8: Highlight pengeluaran melebihi batas

*For any* transaksi dengan amount > 500, fungsi yang menentukan apakah transaksi perlu di-highlight harus mengembalikan `true`. *For any* transaksi dengan amount ≤ 500, fungsi tersebut harus mengembalikan `false`.

**Validates: Requirements 9.1, 9.2, 9.3, 9.4**

---

### Property 9: Round-trip preferensi tema

*For any* nilai tema ('light' atau 'dark'), setelah memanggil `StorageManager.saveTheme(theme)`, memanggil `StorageManager.getTheme()` harus mengembalikan nilai tema yang sama persis.

**Validates: Requirements 7.3, 7.4**

---

### Property 10: Delete menghapus tepat satu transaksi

*For any* array transaksi yang berisi setidaknya satu elemen, setelah memanggil `TransactionManager.deleteTransaction(id)` dengan id yang valid, array yang dikembalikan harus memiliki panjang berkurang tepat satu dan tidak mengandung transaksi dengan id tersebut.

**Validates: Requirements 2.3**

---

## Error Handling

### Validasi Input Form

| Kondisi | Pesan Error | Tindakan |
|---------|-------------|----------|
| Field `name` kosong | "Nama item tidak boleh kosong" | Tampilkan di bawah field, blok submit |
| Field `amount` kosong | "Jumlah tidak boleh kosong" | Tampilkan di bawah field, blok submit |
| `amount` ≤ 0 | "Jumlah harus berupa angka positif" | Tampilkan di bawah field, blok submit |
| `amount` bukan angka | "Jumlah harus berupa angka positif" | Tampilkan di bawah field, blok submit |
| `category` tidak dipilih | "Pilih kategori pengeluaran" | Tampilkan di bawah field, blok submit |

Semua error ditampilkan sekaligus (tidak satu per satu). Setelah submit berhasil, semua pesan error dihapus.

### Local Storage Tidak Tersedia

Saat `StorageManager.isAvailable()` mengembalikan `false`:
- Tampilkan banner peringatan di bagian atas halaman: *"Penyimpanan lokal tidak didukung di browser ini. Data tidak akan tersimpan."*
- Aplikasi tetap berjalan secara in-memory (data hilang saat refresh)
- Semua operasi simpan/baca diabaikan secara graceful

### Data Korup di Local Storage

Saat `JSON.parse` gagal saat membaca transaksi:
- Tangkap exception, kembalikan array kosong `[]`
- Tidak menampilkan error ke pengguna (silent recovery)
- Log error ke `console.error` untuk debugging

### Chart.js Gagal Dimuat (CDN tidak tersedia)

- Semua operasi `ChartManager` dibungkus dalam pengecekan `typeof Chart !== 'undefined'`
- Jika Chart.js tidak tersedia, area chart menampilkan pesan: *"Visualisasi tidak tersedia. Periksa koneksi internet Anda."*

---

## Testing Strategy

### Pendekatan Dual Testing

Strategi pengujian menggunakan dua pendekatan yang saling melengkapi:

1. **Unit Tests (Example-based)**: Memverifikasi perilaku spesifik, edge case, dan kondisi error
2. **Property-Based Tests**: Memverifikasi properti universal yang berlaku untuk semua input valid

### Library yang Digunakan

- **Unit Tests**: [Jest](https://jestjs.io/) — runner dan assertion
- **Property-Based Tests**: [fast-check](https://fast-check.io/) — library PBT untuk JavaScript

### Unit Tests (Example-based)

Fokus pada:
- Keberadaan elemen DOM yang diperlukan (form fields, tombol, area chart)
- Empty state: tidak ada transaksi → pesan kosong ditampilkan
- Local Storage tidak tersedia → banner peringatan muncul
- Default spending limit = 500
- Opsi sort tersedia di UI

Contoh test cases:
```javascript
// Req 1.1, 1.2 - Elemen form ada
test('form memiliki field name, amount, category, dan tombol submit', () => { ... })

// Req 2.4 - Empty state
test('menampilkan pesan kosong ketika tidak ada transaksi', () => { ... })

// Req 5.4 - Local Storage tidak tersedia
test('menampilkan peringatan ketika Local Storage tidak tersedia', () => { ... })

// Req 9.2 - Default limit
test('spending limit default adalah 500', () => { ... })
```

### Property-Based Tests

Setiap property dari bagian Correctness Properties diimplementasikan sebagai satu property-based test dengan minimum **100 iterasi**.

Setiap test diberi tag komentar dengan format:
`// Feature: expense-budget-visualizer, Property {N}: {deskripsi singkat}`

```javascript
// Feature: expense-budget-visualizer, Property 1: Validasi menolak semua input tidak valid
test('validator menolak semua kombinasi input tidak valid', () => {
  fc.assert(fc.property(
    fc.record({ name: fc.constant(''), amount: fc.float({ max: 0 }), category: fc.constant('Food') }),
    ({ name, amount, category }) => {
      const result = Validator.validateTransaction(name, String(amount), category)
      return result.valid === false && result.errors.length > 0
    }
  ), { numRuns: 100 })
})

// Feature: expense-budget-visualizer, Property 3: Kalkulasi total selalu konsisten
test('calculateTotal sama dengan sum manual', () => {
  fc.assert(fc.property(
    fc.array(fc.record({ amount: fc.float({ min: 0.01, max: 10000 }) })),
    (transactions) => {
      const expected = transactions.reduce((sum, t) => sum + t.amount, 0)
      return Math.abs(TransactionManager.calculateTotal(transactions) - expected) < 0.001
    }
  ), { numRuns: 100 })
})

// Feature: expense-budget-visualizer, Property 4: Round-trip Local Storage transaksi
test('saveTransactions kemudian getTransactions mengembalikan data yang sama', () => {
  fc.assert(fc.property(
    fc.array(fc.record({
      id: fc.uuid(),
      name: fc.string({ minLength: 1 }),
      amount: fc.float({ min: 0.01 }),
      category: fc.constantFrom('Food', 'Transport', 'Fun'),
      createdAt: fc.integer({ min: 0 })
    })),
    (transactions) => {
      StorageManager.saveTransactions(transactions)
      const loaded = StorageManager.getTransactions()
      return JSON.stringify(loaded) === JSON.stringify(transactions)
    }
  ), { numRuns: 100 })
})

// Feature: expense-budget-visualizer, Property 8: Highlight pengeluaran melebihi batas
test('isOverLimit benar untuk semua nilai di atas dan di bawah 500', () => {
  fc.assert(fc.property(
    fc.float({ min: 0.01, max: 10000 }),
    (amount) => {
      const result = isOverLimit(amount, 500)
      return result === (amount > 500)
    }
  ), { numRuns: 100 })
})
```

### Cakupan per Requirement

| Requirement | Tipe Test | Property/Test |
|-------------|-----------|---------------|
| 1.1, 1.2 | Unit (example) | Keberadaan elemen form |
| 1.3 | Property | Property 2 |
| 1.4, 1.5 | Property | Property 1 |
| 2.3 | Property | Property 10 |
| 2.4 | Unit (example) | Empty state |
| 3.2, 3.3, 3.4 | Property | Property 3 |
| 4.2, 4.3, 4.5 | Property | Property 5 |
| 4.4 | Unit (example) | Chart empty state |
| 5.1, 5.2, 5.3 | Property | Property 4 |
| 5.4 | Unit (example) | Local Storage unavailable |
| 7.3, 7.4 | Property | Property 9 |
| 8.1 | Unit (example) | Opsi sort tersedia |
| 8.2, 8.3 | Property | Property 6, 7 |
| 9.1, 9.2, 9.3, 9.4 | Property + Unit | Property 8 |
