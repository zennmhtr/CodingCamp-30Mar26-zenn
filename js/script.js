

const StorageManager = {
  KEYS: {
    TRANSACTIONS: 'ebv_transactions',
    THEME: 'ebv_theme'
  },

  isAvailable() {
    try {
      const testKey = '__ebv_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  },

  getTransactions() {
    try {
      const raw = localStorage.getItem(this.KEYS.TRANSACTIONS);
      if (raw === null) return [];
      return JSON.parse(raw);
    } catch (e) {
      console.error('[StorageManager] Gagal mem-parse transaksi dari Local Storage:', e);
      return [];
    }
  },

  /**
   * Menyimpan seluruh array transaksi ke Local Storage.
   * @param {Array} transactions - Array transaksi yang akan disimpan
   */
  saveTransactions(transactions) {
    localStorage.setItem(this.KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  /**
   * Membaca preferensi tema dari Local Storage.
   * Mengembalikan 'light' sebagai default jika belum diset.
   * @returns {'light'|'dark'}
   */
  getTheme() {
    const theme = localStorage.getItem(this.KEYS.THEME);
    return theme === 'dark' ? 'dark' : 'light';
  },

  /**
   * Menyimpan preferensi tema ke Local Storage.
   * @param {'light'|'dark'} theme
   */
  saveTheme(theme) {
    localStorage.setItem(this.KEYS.THEME, theme);
  }
};

const Validator = {
  VALID_CATEGORIES: ['Food', 'Transport', 'Fun'],

  /**
   * Memvalidasi semua field form sekaligus.
   * @param {string} name
   * @param {string|number} amount
   * @param {string} category
   * @returns {{ valid: boolean, errors: Array<{ field: string, message: string }> }}
   */
  validateTransaction(name, amount, category) {
    const errors = [];

    // Validasi name
    if (!name || String(name).trim() === '') {
      errors.push({ field: 'name', message: 'Nama item tidak boleh kosong' });
    }

    // Validasi amount
    if (amount === '' || amount === null || amount === undefined) {
      errors.push({ field: 'amount', message: 'Jumlah tidak boleh kosong' });
    } else {
      const parsed = Number(amount);
      if (isNaN(parsed) || parsed <= 0) {
        errors.push({ field: 'amount', message: 'Jumlah harus berupa angka positif' });
      }
    }

    // Validasi category
    if (!this.VALID_CATEGORIES.includes(category)) {
      errors.push({ field: 'category', message: 'Pilih kategori pengeluaran' });
    }

    return { valid: errors.length === 0, errors };
  }
};


// ============================================================
// TransactionManager
// Mengelola logika bisnis transaksi (CRUD, kalkulasi).
// ============================================================
const TransactionManager = {
  /**
   * Menambah transaksi baru ke storage dan mengembalikan array terbaru.
   * @param {string} name
   * @param {string|number} amount
   * @param {string} category
   * @returns {Array} Array transaksi terbaru
   */
  addTransaction(name, amount, category) {
    const transaction = {
      id: String(Date.now()),
      name,
      amount: Number(amount),
      category,
      createdAt: Date.now()
    };
    const transactions = StorageManager.getTransactions();
    transactions.push(transaction);
    StorageManager.saveTransactions(transactions);
    return transactions;
  },

  /**
   * Menghapus transaksi berdasarkan id dan mengembalikan array terbaru.
   * @param {string} id
   * @returns {Array} Array transaksi terbaru
   */
  deleteTransaction(id) {
    const transactions = StorageManager.getTransactions().filter(t => t.id !== id);
    StorageManager.saveTransactions(transactions);
    return transactions;
  },

  /**
   * Menghitung total semua amount dalam array transaksi.
   * @param {Array} transactions
   * @returns {number}
   */
  calculateTotal(transactions) {
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  },

  /**
   * Mengelompokkan total pengeluaran per kategori.
   * Hanya kategori yang memiliki transaksi yang disertakan.
   * @param {Array} transactions
   * @returns {{ [category: string]: number }}
   */
  groupByCategory(transactions) {
    return transactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
  },

  /**
   * Mengurutkan transaksi sesuai opsi sort tanpa mutasi array asli.
   * @param {Array} transactions
   * @param {'amount-asc'|'amount-desc'|'category-az'|string} sortOption
   * @returns {Array}
   */
  sortTransactions(transactions, sortOption) {
    const copy = [...transactions];
    if (sortOption === 'amount-asc') {
      return copy.sort((a, b) => a.amount - b.amount);
    }
    if (sortOption === 'amount-desc') {
      return copy.sort((a, b) => b.amount - a.amount);
    }
    if (sortOption === 'category-az') {
      return copy.sort((a, b) => a.category.localeCompare(b.category));
    }
    return copy;
  }
};


// ============================================================
// ChartManager
// Mengelola instance Chart.js dan pembaruan data pie chart.
// Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
// ============================================================
const ChartManager = {
  _chart: null,

  // Warna per kategori sesuai desain
  CATEGORY_COLORS: {
    Food: '#FF6384',
    Transport: '#36A2EB',
    Fun: '#FFCE56'
  },

  /**
   * Inisialisasi chart kosong pada canvas yang diberikan.
   * Jika Chart.js tidak tersedia, tampilkan pesan fallback.
   * @param {string} canvasId - ID elemen canvas
   */
  init(canvasId) {
    if (typeof Chart === 'undefined') {
      this._showUnavailableMessage(canvasId);
      return;
    }

    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    this._chart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: []
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  },

  /**
   * Perbarui data chart dengan data kategori terbaru.
   * Jika categoryData kosong, tampilkan pesan kosong.
   * @param {{ [category: string]: number }} categoryData
   */
  update(categoryData) {
    if (typeof Chart === 'undefined') return;

    const canvas = document.getElementById('expense-chart');
    if (!canvas) return;

    // Hapus pesan kosong jika ada
    const container = canvas.parentElement;
    const existingMsg = container.querySelector('.chart-empty-message');
    if (existingMsg) existingMsg.remove();

    if (!categoryData || Object.keys(categoryData).length === 0) {
      this.showEmpty();
      return;
    }

    // Pastikan canvas terlihat
    canvas.style.display = '';

    const labels = Object.keys(categoryData);
    const data = labels.map(label => categoryData[label]);
    const colors = labels.map(label => this.CATEGORY_COLORS[label] || '#CCCCCC');

    // Re-init jika chart sudah di-destroy sebelumnya
    if (!this._chart) {
      this._chart = new Chart(canvas, {
        type: 'pie',
        data: { labels, datasets: [{ data, backgroundColor: colors }] },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    } else {
      this._chart.data.labels = labels;
      this._chart.data.datasets[0].data = data;
      this._chart.data.datasets[0].backgroundColor = colors;
      this._chart.update();
    }
  },

  /**
   * Tampilkan pesan kosong tanpa menyembunyikan canvas.
   */
  showEmpty() {
    if (this._chart) {
      this._chart.destroy();
      this._chart = null;
    }

    const canvas = document.getElementById('expense-chart');
    if (canvas) {
      canvas.style.display = 'none';
      const container = canvas.parentElement;
      let msg = container.querySelector('.chart-empty-message');
      if (!msg) {
        msg = document.createElement('p');
        msg.className = 'chart-empty-message';
        container.appendChild(msg);
      }
      msg.textContent = 'Belum ada data pengeluaran untuk ditampilkan.';
    }
  },

  /**
   * Tampilkan pesan ketika Chart.js tidak tersedia (CDN gagal dimuat).
   * @param {string} canvasId
   */
  _showUnavailableMessage(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const container = canvas.parentElement;
    canvas.style.display = 'none';

    let msg = container.querySelector('.chart-unavailable-message');
    if (!msg) {
      msg = document.createElement('p');
      msg.className = 'chart-unavailable-message';
      msg.style.textAlign = 'center';
      msg.style.color = '#888';
      container.appendChild(msg);
    }
    msg.textContent = 'Visualisasi tidak tersedia. Periksa koneksi internet Anda.';
  }
};

// ============================================================
// UIRenderer
// Bertanggung jawab merender semua komponen UI ke DOM.
// Requirements: 2.1, 2.2, 2.4, 3.1, 7.2, 9.1, 9.3, 9.4
// ============================================================
const UIRenderer = {
  SPENDING_LIMIT: 500,

  /**
   * Render daftar transaksi ke #transaction-list.
   * Terapkan class .over-limit untuk amount > SPENDING_LIMIT.
   * @param {Array} transactions
   */
  renderTransactionList(transactions) {
    const list = document.getElementById('transaction-list');
    if (!list) return;

    if (transactions.length === 0) {
      this.renderEmptyState();
      return;
    }

    list.innerHTML = transactions.map(t => `
      <li class="transaction-item${t.amount > this.SPENDING_LIMIT ? ' over-limit' : ''}" data-id="${t.id}">
        <div class="transaction-info">
          <span class="transaction-name">${this._escape(t.name)}</span>
          <span class="transaction-category category-${t.category.toLowerCase()}">${t.category}</span>
        </div>
        <div class="transaction-right">
          <span class="transaction-amount">Rp ${t.amount.toLocaleString('id-ID')}</span>
          ${t.amount > this.SPENDING_LIMIT ? '<span class="over-limit-badge" title="Melebihi batas pengeluaran">⚠️</span>' : ''}
          <button class="btn-delete" data-id="${t.id}" aria-label="Hapus transaksi ${this._escape(t.name)}">✕</button>
        </div>
      </li>
    `).join('');
  },

  /**
   * Render nilai total ke #total-balance.
   * @param {number} total
   */
  renderTotal(total) {
    const el = document.getElementById('total-balance');
    if (el) el.textContent = `Rp ${total.toLocaleString('id-ID')}`;
  },

  /**
   * Render pesan error validasi ke #form-errors.
   * @param {Array<{ field: string, message: string }>} errors
   */
  renderValidationErrors(errors) {
    const el = document.getElementById('form-errors');
    if (!el) return;
    el.innerHTML = errors.map(e => `<p class="error-msg">${this._escape(e.message)}</p>`).join('');
  },

  /** Hapus semua pesan error dari #form-errors. */
  clearValidationErrors() {
    const el = document.getElementById('form-errors');
    if (el) el.innerHTML = '';
  },

  /** Reset semua field form ke nilai kosong. */
  resetForm() {
    const form = document.getElementById('transaction-form');
    if (form) form.reset();
  },

  /**
   * Terapkan tema ke <body> via class 'dark'.
   * @param {'light'|'dark'} theme
   */
  applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
  },

  /** Tampilkan pesan kosong di #transaction-list. */
  renderEmptyState() {
    const list = document.getElementById('transaction-list');
    if (list) list.innerHTML = '<li class="empty-state">Belum ada transaksi. Tambahkan pengeluaran pertama Anda!</li>';
  },

  /** Escape HTML untuk mencegah XSS. */
  _escape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
};

// ============================================================
// App — Controller utama
// Mengorkestrasi semua modul dan mengelola state aplikasi.
// Requirements: 1.3, 2.3, 3.2, 3.3, 5.1–5.4, 7.2–7.4, 8.1, 8.3
// ============================================================
const App = {
  state: {
    transactions: [],
    sortOption: 'default',
    theme: 'light',
    spendingLimit: 500
  },

  /** Inisialisasi aplikasi saat DOMContentLoaded. */
  init() {
    // Cek ketersediaan Local Storage
    if (!StorageManager.isAvailable()) {
      const warning = document.getElementById('storage-warning');
      if (warning) warning.hidden = false;
    }

    // Baca data dari storage
    this.state.transactions = StorageManager.getTransactions();
    this.state.theme = StorageManager.getTheme();

    // Terapkan tema
    UIRenderer.applyTheme(this.state.theme);

    // Inisialisasi chart
    ChartManager.init('expense-chart');

    // Render awal
    this.render();

    // Pasang event listeners
    this._bindEvents();
  },

  /** Pasang semua event listener. */
  _bindEvents() {
    // Submit form
    const form = document.getElementById('transaction-form');
    if (form) form.addEventListener('submit', (e) => this.handleAddTransaction(e));

    // Delete transaksi (event delegation)
    const list = document.getElementById('transaction-list');
    if (list) list.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-delete');
      if (btn) this.handleDeleteTransaction(btn.dataset.id);
    });

    // Sort
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.addEventListener('change', (e) => this.handleSortChange(e.target.value));

    // Theme toggle
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', () => this.handleThemeToggle());
  },

  /** Handler submit form tambah transaksi. */
  handleAddTransaction(event) {
    event.preventDefault();
    const name = document.getElementById('item-name').value.trim();
    const amount = document.getElementById('item-amount').value;
    const category = document.getElementById('item-category').value;

    const result = Validator.validateTransaction(name, amount, category);
    if (!result.valid) {
      UIRenderer.renderValidationErrors(result.errors);
      return;
    }

    UIRenderer.clearValidationErrors();
    this.state.transactions = TransactionManager.addTransaction(name, amount, category);
    UIRenderer.resetForm();
    this.render();
  },

  /** Handler hapus transaksi. */
  handleDeleteTransaction(id) {
    this.state.transactions = TransactionManager.deleteTransaction(id);
    this.render();
  },

  /** Handler perubahan sort. */
  handleSortChange(sortOption) {
    this.state.sortOption = sortOption;
    this.render();
  },

  /** Handler toggle tema. */
  handleThemeToggle() {
    this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
    StorageManager.saveTheme(this.state.theme);
    UIRenderer.applyTheme(this.state.theme);
  },

  /** Render ulang seluruh UI berdasarkan state terkini. */
  render() {
    const sorted = TransactionManager.sortTransactions(this.state.transactions, this.state.sortOption);
    const total = TransactionManager.calculateTotal(this.state.transactions);
    const categoryData = TransactionManager.groupByCategory(this.state.transactions);

    UIRenderer.renderTransactionList(sorted);
    UIRenderer.renderTotal(total);
    ChartManager.update(categoryData);
  }
};

// Jalankan aplikasi
document.addEventListener('DOMContentLoaded', () => App.init());
