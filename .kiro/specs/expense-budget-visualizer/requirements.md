# Dokumen Persyaratan

## Pendahuluan

Expense & Budget Visualizer adalah aplikasi web satu halaman (single-page) yang memungkinkan pengguna mencatat, mengelola, dan memvisualisasikan pengeluaran pribadi. Aplikasi dibangun menggunakan HTML, CSS, dan Vanilla JavaScript tanpa framework, dengan Local Storage sebagai mekanisme penyimpanan data. Aplikasi menampilkan ringkasan saldo, daftar transaksi, dan pie chart pengeluaran per kategori secara real-time.

## Glosarium

- **Aplikasi**: Expense & Budget Visualizer, aplikasi web satu halaman
- **Transaksi**: Satu catatan pengeluaran yang terdiri dari nama item, jumlah, dan kategori
- **Form_Input**: Komponen formulir untuk memasukkan data transaksi baru
- **Daftar_Transaksi**: Komponen yang menampilkan semua transaksi yang tersimpan
- **Saldo_Total**: Nilai agregat dari seluruh jumlah transaksi yang tersimpan
- **Pie_Chart**: Diagram lingkaran yang menampilkan proporsi pengeluaran per kategori menggunakan Chart.js
- **Local_Storage**: Web Storage API browser untuk menyimpan data transaksi secara persisten di sisi klien
- **Kategori**: Klasifikasi transaksi, terdiri dari: Food, Transport, Fun
- **Batas_Pengeluaran**: Nilai ambang batas jumlah transaksi yang ditentukan pengguna (default: 500)
- **Mode_Tampilan**: Preferensi tema antarmuka, yaitu mode terang (light) atau mode gelap (dark)

---

## Persyaratan

### Persyaratan 1: Input Transaksi

**User Story:** Sebagai pengguna, saya ingin mengisi formulir pengeluaran, agar saya dapat mencatat transaksi baru dengan cepat.

#### Kriteria Penerimaan

1. THE Form_Input SHALL menampilkan field teks untuk nama item, field angka untuk jumlah, dan dropdown untuk kategori (Food, Transport, Fun).
2. THE Form_Input SHALL menampilkan tombol submit untuk menyimpan transaksi.
3. WHEN pengguna menekan tombol submit dengan semua field terisi valid, THE Form_Input SHALL menyimpan transaksi ke Local_Storage dan mereset semua field ke nilai kosong.
4. WHEN pengguna menekan tombol submit dengan satu atau lebih field kosong, THE Form_Input SHALL menampilkan pesan validasi yang menjelaskan field mana yang belum diisi.
5. WHEN pengguna memasukkan nilai non-positif atau nol pada field jumlah, THE Form_Input SHALL menampilkan pesan validasi bahwa jumlah harus berupa angka positif.

---

### Persyaratan 2: Daftar Transaksi

**User Story:** Sebagai pengguna, saya ingin melihat semua transaksi yang telah dicatat, agar saya dapat memantau riwayat pengeluaran saya.

#### Kriteria Penerimaan

1. THE Daftar_Transaksi SHALL menampilkan semua transaksi yang tersimpan di Local_Storage, masing-masing dengan nama item, jumlah, dan kategori.
2. THE Daftar_Transaksi SHALL dapat di-scroll secara vertikal ketika jumlah transaksi melebihi tinggi area tampilan yang tersedia.
3. WHEN pengguna menekan tombol delete pada sebuah transaksi, THE Daftar_Transaksi SHALL menghapus transaksi tersebut dari Local_Storage dan memperbarui tampilan daftar.
4. WHEN tidak ada transaksi yang tersimpan, THE Daftar_Transaksi SHALL menampilkan pesan yang menginformasikan bahwa belum ada transaksi.

---

### Persyaratan 3: Saldo Total

**User Story:** Sebagai pengguna, saya ingin melihat total pengeluaran saya, agar saya dapat mengetahui berapa banyak yang telah saya keluarkan secara keseluruhan.

#### Kriteria Penerimaan

1. THE Aplikasi SHALL menampilkan Saldo_Total di bagian atas halaman.
2. WHEN transaksi baru ditambahkan, THE Aplikasi SHALL memperbarui nilai Saldo_Total secara otomatis tanpa memuat ulang halaman.
3. WHEN sebuah transaksi dihapus, THE Aplikasi SHALL memperbarui nilai Saldo_Total secara otomatis tanpa memuat ulang halaman.
4. THE Aplikasi SHALL menghitung Saldo_Total sebagai jumlah dari seluruh nilai field jumlah pada semua transaksi yang tersimpan.

---

### Persyaratan 4: Visualisasi Pie Chart

**User Story:** Sebagai pengguna, saya ingin melihat diagram pengeluaran per kategori, agar saya dapat memahami distribusi pengeluaran saya secara visual.

#### Kriteria Penerimaan

1. THE Pie_Chart SHALL menampilkan proporsi pengeluaran untuk setiap kategori (Food, Transport, Fun) menggunakan library Chart.js.
2. WHEN transaksi baru ditambahkan, THE Pie_Chart SHALL memperbarui data dan tampilan diagram secara otomatis.
3. WHEN sebuah transaksi dihapus, THE Pie_Chart SHALL memperbarui data dan tampilan diagram secara otomatis.
4. WHEN tidak ada transaksi yang tersimpan, THE Pie_Chart SHALL menampilkan kondisi kosong atau pesan yang menginformasikan bahwa belum ada data untuk ditampilkan.
5. THE Pie_Chart SHALL menampilkan label kategori dan nilai persentase atau jumlah pada diagram.

---

### Persyaratan 5: Persistensi Data

**User Story:** Sebagai pengguna, saya ingin data transaksi saya tetap tersimpan setelah menutup browser, agar saya tidak kehilangan riwayat pengeluaran.

#### Kriteria Penerimaan

1. WHEN pengguna menambahkan transaksi baru, THE Aplikasi SHALL menyimpan seluruh daftar transaksi ke Local_Storage.
2. WHEN pengguna menghapus sebuah transaksi, THE Aplikasi SHALL memperbarui data transaksi di Local_Storage.
3. WHEN halaman dimuat atau dimuat ulang, THE Aplikasi SHALL membaca data transaksi dari Local_Storage dan menampilkan semua transaksi yang tersimpan sebelumnya.
4. IF Local_Storage tidak tersedia di browser pengguna, THEN THE Aplikasi SHALL menampilkan pesan peringatan bahwa fitur penyimpanan tidak didukung.

---

### Persyaratan 6: Responsivitas dan Tampilan

**User Story:** Sebagai pengguna, saya ingin aplikasi dapat digunakan dengan nyaman di perangkat mobile maupun desktop, agar saya dapat mencatat pengeluaran dari mana saja.

#### Kriteria Penerimaan

1. THE Aplikasi SHALL menyesuaikan tata letak antarmuka secara responsif untuk lebar layar mulai dari 320px hingga 1920px.
2. THE Aplikasi SHALL menggunakan satu file CSS di folder `css/` dan satu file JavaScript di folder `js/`.
3. THE Aplikasi SHALL menampilkan antarmuka yang bersih dan minimal dengan kontras warna yang memadai untuk keterbacaan.
4. WHEN halaman pertama kali dimuat, THE Aplikasi SHALL menampilkan semua komponen utama (Form_Input, Saldo_Total, Daftar_Transaksi, Pie_Chart) tanpa memerlukan scroll horizontal.

---

### Persyaratan 7: Toggle Mode Gelap/Terang

**User Story:** Sebagai pengguna, saya ingin dapat beralih antara mode gelap dan mode terang, agar saya dapat menyesuaikan tampilan aplikasi dengan preferensi atau kondisi pencahayaan saya.

#### Kriteria Penerimaan

1. THE Aplikasi SHALL menampilkan tombol toggle untuk beralih antara Mode_Tampilan terang dan gelap.
2. WHEN pengguna menekan tombol toggle, THE Aplikasi SHALL mengubah skema warna seluruh antarmuka ke Mode_Tampilan yang dipilih.
3. WHEN pengguna menekan tombol toggle, THE Aplikasi SHALL menyimpan preferensi Mode_Tampilan ke Local_Storage.
4. WHEN halaman dimuat, THE Aplikasi SHALL membaca preferensi Mode_Tampilan dari Local_Storage dan menerapkan tema yang sesuai.

---

### Persyaratan 8: Pengurutan Transaksi

**User Story:** Sebagai pengguna, saya ingin dapat mengurutkan daftar transaksi, agar saya dapat menemukan dan menganalisis transaksi dengan lebih mudah.

#### Kriteria Penerimaan

1. THE Daftar_Transaksi SHALL menyediakan opsi pengurutan berdasarkan jumlah (ascending dan descending) dan berdasarkan kategori (A-Z).
2. WHEN pengguna memilih opsi pengurutan, THE Daftar_Transaksi SHALL menampilkan ulang daftar transaksi sesuai urutan yang dipilih tanpa mengubah data di Local_Storage.
3. WHEN transaksi baru ditambahkan atau dihapus, THE Daftar_Transaksi SHALL mempertahankan opsi pengurutan yang sedang aktif.

---

### Persyaratan 9: Sorotan Pengeluaran Melebihi Batas

**User Story:** Sebagai pengguna, saya ingin transaksi dengan jumlah besar ditandai secara visual, agar saya dapat dengan cepat mengidentifikasi pengeluaran yang signifikan.

#### Kriteria Penerimaan

1. THE Daftar_Transaksi SHALL menampilkan indikator visual yang berbeda (misalnya warna latar atau ikon peringatan) pada setiap transaksi yang memiliki jumlah melebihi Batas_Pengeluaran.
2. THE Aplikasi SHALL menggunakan nilai default Batas_Pengeluaran sebesar 500.
3. WHEN jumlah transaksi melebihi Batas_Pengeluaran, THE Daftar_Transaksi SHALL menerapkan indikator visual tersebut secara otomatis saat transaksi ditampilkan.
4. WHEN jumlah transaksi tidak melebihi Batas_Pengeluaran, THE Daftar_Transaksi SHALL menampilkan transaksi tersebut tanpa indikator peringatan.
