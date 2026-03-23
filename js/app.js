/* ============================================================
   app.js — Algoritma Görselleştirme Platformu
   Ana uygulama mantığı: veri modeli, workspace yönetimi,
   event listener'lar ve UI güncellemeleri.
   
   Bağımlılıklar: router.js, algorithms.js, visualizer.js
   ============================================================ */

'use strict';

/**
 * App — Ana uygulama modülü.
 * Tüm kategori verileri, workspace durumu ve kullanıcı etkileşimleri
 * bu modül üzerinden yönetilir.
 */
const App = (() => {

  /* ============================================================
     BÖLÜM 1: Veri Modeli — Kategoriler ve Algoritmalar
     Her kategorinin benzersiz bir slug'ı, başlığı, ikonları,
     açıklaması ve algoritma listesi vardır.
     ============================================================ */
  const CATEGORIES = [
    {
      slug: 'sorting',
      title: 'Sıralama Algoritmaları',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M3 12h12"/><path d="M3 18h6"/></svg>`,
      desc: 'Dizileri farklı stratejilerle sıralayan temel algoritmalar.',
      algorithms: [
        { id: 'bubble', name: 'Bubble Sort' },
        { id: 'selection', name: 'Selection Sort' },
        { id: 'insertion', name: 'Insertion Sort' },
        { id: 'merge', name: 'Merge Sort' },
        { id: 'quick', name: 'Quick Sort' },
        { id: 'heap', name: 'Heap Sort' },
        { id: 'radix', name: 'Radix Sort' },
      ]
    },
    {
      slug: 'searching',
      title: 'Arama Algoritmaları',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
      desc: 'Veri yapıları içinde eleman arayan algoritmalar.',
      algorithms: [
        { id: 'linear', name: 'Linear Search' },
        { id: 'binary', name: 'Binary Search' },
        { id: 'jump', name: 'Jump Search' },
        { id: 'interpolation', name: 'Interpolation Search' },
        { id: 'exponential', name: 'Exponential Search' },
      ]
    },
    {
      slug: 'shortest-path',
      title: 'En Kısa Yol Bulma (Graf)',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v1"/><path d="m10 14 3 3 7-7"/></svg>`,
      desc: 'Ağırlıklı graflarda en kısa yolu bulan algoritmalar.',
      algorithms: [
        { id: 'dijkstra', name: 'Dijkstra' },
        { id: 'bellman-ford', name: 'Bellman-Ford' },
        { id: 'floyd-warshall', name: 'Floyd-Warshall' },
        { id: 'a-star', name: 'A* Algoritması' },
        { id: 'bfs-shortest', name: 'BFS (Unweighted)' },
      ]
    },
    {
      slug: 'graph-traversal',
      title: 'Graf Gezme Algoritmaları',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><circle cx="5" cy="19" r="2"/><path d="M10.4 9.6 7 7"/><path d="m13.6 9.6 3.4-2.6"/><path d="m13.6 14.4 3.4 2.6"/><path d="M10.4 14.4 7 17"/></svg>`,
      desc: 'Graf yapılarını sistematik olarak gezen algoritmalar.',
      algorithms: [
        { id: 'dfs', name: 'DFS (Derinlik Öncelikli)' },
        { id: 'bfs', name: 'BFS (Genişlik Öncelikli)' },
      ]
    },
    {
      slug: 'dynamic-programming',
      title: 'Dinamik Programlama',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
      desc: 'Alt problemlere bölerek optimal çözüm bulan teknikler.',
      algorithms: [
        { id: 'fibonacci', name: 'Fibonacci (DP)' },
        { id: 'knapsack', name: 'Sırt Çantası (Knapsack)' },
        { id: 'lcs', name: 'En Uzun Ortak Alt Dizi (LCS)' },
        { id: 'matrix-chain', name: 'Matrix Chain Multiplication' },
      ]
    },
    {
      slug: 'divide-conquer',
      title: 'Parçala ve Fethet',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/></svg>`,
      desc: 'Büyük problemi küçük parçalara bölerek çözen yaklaşım.',
      algorithms: [
        { id: 'dc-merge-sort', name: 'Merge Sort (D&C)' },
        { id: 'dc-quick-sort', name: 'Quick Sort (D&C)' },
        { id: 'strassen', name: "Strassen's Matrix Multiplication" },
        { id: 'closest-pair', name: 'Closest Pair of Points' },
      ]
    },
    {
      slug: 'greedy',
      title: 'Greedy Algoritmalar',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
      desc: 'Her adımda yerel en iyi seçimi yapan açgözlü algoritmalar.',
      algorithms: [
        { id: 'kruskal', name: 'Kruskal (MST)' },
        { id: 'prim', name: 'Prim (MST)' },
        { id: 'huffman', name: 'Huffman Kodlama' },
        { id: 'activity-selection', name: 'Etkinlik Seçimi' },
      ]
    },
    {
      slug: 'backtracking',
      title: 'Gerileme (Backtracking)',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>`,
      desc: 'Deneme-yanılma ile tüm olasılıkları tarayan algoritmalar.',
      algorithms: [
        { id: 'n-queens', name: 'N-Queens (N Vezir)' },
        { id: 'sudoku', name: 'Sudoku Çözücü' },
        { id: 'hamiltonian', name: 'Hamilton Yolu' },
      ]
    },
    {
      slug: 'hashing',
      title: 'Hashing ve Veri Yapıları',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/></svg>`,
      desc: 'Hash tabloları ve temel veri yapılarının görselleştirilmesi.',
      algorithms: [
        { id: 'hash-table', name: 'Hash Table' },
        { id: 'rabin-karp', name: 'Rabin-Karp (String Matching)' },
        { id: 'kmp', name: 'KMP Algorithm' },
      ]
    }
  ];

  /* ============================================================
     BÖLÜM 2: Uygulama Durumu (State)
     ============================================================ */
  const state = {
    currentCategory: null,    // Seçili kategori slug'ı
    currentAlgorithm: null,   // Seçili algoritma id'si
    isPlaying: false,         // Oynatma durumu
    speed: 50,                // Animasyon hızı (0-100)
    currentStep: 0,           // Mevcut adım
    totalSteps: 0,            // Toplam adım sayısı
    sourceNode: 0,            // Graf kaynak düğümü (A=0)
    targetNode: 5,            // Graf hedef düğümü (F=5)
  };

  /** Kaynak seçici gösterilecek algoritmalar */
  const GRAPH_ALGO_IDS = new Set([
    'dijkstra', 'bellman-ford', 'a-star', 'bfs-shortest',
    'dfs', 'bfs', 'prim', 'hamiltonian'
    // kruskal: kaynak düğümü yoktur, seçici gösterilmez
  ]);

  /** Hedef seçici AYRICA gösterilecek algoritmalar (kaynak→hedef mantığı olanlar) */
  const TARGET_ALGO_IDS = new Set([
    'dijkstra', 'bellman-ford', 'a-star', 'bfs-shortest'
  ]);

  /* ============================================================
     BÖLÜM 3: DOM Referansları
     Performans için DOM sorgularını bir kez yapıp saklıyoruz.
     ============================================================ */
  let DOM = {};

  /** Algoritma id → Algorithms fonksiyonu eşlemesi (sıralama) */
  const ALGO_MAP = {
    /* Sıralama */
    bubble: Algorithms.bubble,
    selection: Algorithms.selection,
    insertion: Algorithms.insertion,
    merge: Algorithms.merge,
    quick: Algorithms.quick,
    heap: Algorithms.heap,
    radix: Algorithms.radix,

    /* Arama */
    linear: Algorithms.linear,
    binary: Algorithms.binary,
    jump: Algorithms.jump,
    interpolation: Algorithms.interpolation,
    exponential: Algorithms.exponential,

    /* En Kısa Yol */
    dijkstra: Algorithms.dijkstra,
    'bellman-ford': Algorithms['bellman-ford'],
    'floyd-warshall': Algorithms['floyd-warshall'],
    'a-star': Algorithms['a-star'],
    'bfs-shortest': Algorithms['bfs-shortest'],

    /* Graf Gezme */
    dfs: Algorithms.dfs,
    bfs: Algorithms.bfs,

    /* Dinamik Programlama */
    fibonacci: Algorithms.fibonacci,
    knapsack: Algorithms.knapsack,
    lcs: Algorithms.lcs,
    'matrix-chain': Algorithms['matrix-chain'],

    /* Parçala ve Fethet */
    'dc-merge-sort': Algorithms['dc-merge-sort'],
    'dc-quick-sort': Algorithms['dc-quick-sort'],
    strassen: Algorithms.strassen,
    'closest-pair': Algorithms['closest-pair'],

    /* Greedy */
    kruskal: Algorithms.kruskal,
    prim: Algorithms.prim,
    huffman: Algorithms.huffman,
    'activity-selection': Algorithms['activity-selection'],

    /* Backtracking */
    'n-queens': Algorithms['n-queens'],
    sudoku: Algorithms.sudoku,
    hamiltonian: Algorithms.hamiltonian,

    /* Hashing */
    'hash-table': Algorithms['hash-table'],
    'rabin-karp': Algorithms['rabin-karp'],
    kmp: Algorithms.kmp,
  };

  /**
   * Kaynak ve Hedef düğüm seçicilerini kontrol paneline ekler.
   * Sadece bir kez inject edilir, sonra show/hide ile yönetilir.
   */
  function _injectGraphControls() {
    // Zaten varsa sadece değerleri güncelle, yeniden oluşturma
    const existing = document.getElementById('graph-node-controls');
    if (existing) {
      const srcEl = document.getElementById('select-source');
      const tgtEl = document.getElementById('select-target');
      if (srcEl) state.sourceNode = parseInt(srcEl.value, 10);
      if (tgtEl) state.targetNode = parseInt(tgtEl.value, 10);
      return;
    }

    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
    const makeOptions = (selectedIdx) =>
      labels.map((l, i) =>
        `<option value="${i}"${i === selectedIdx ? ' selected' : ''}>${l}</option>`
      ).join('');

    const div = document.createElement('div');
    div.id = 'graph-node-controls';
    div.className = 'graph-node-controls';
    div.style.display = 'none';
    div.innerHTML = `
      <div class="graph-node-controls__group">
        <span class="graph-node-controls__label">Kaynak</span>
        <select id="select-source" class="graph-node-controls__select">
          ${makeOptions(0)}
        </select>
      </div>
      <div class="graph-node-controls__group" id="target-group">
        <span class="graph-node-controls__label">Hedef</span>
        <select id="select-target" class="graph-node-controls__select">
          ${makeOptions(5)}
        </select>
      </div>
    `;

    // "Veri Üret" butonunun hemen yanına ekle
    if (DOM.btnGenerate && DOM.btnGenerate.parentElement) {
      DOM.btnGenerate.insertAdjacentElement('afterend', div);
    }

    document.getElementById('select-source').addEventListener('change', (e) => {
      state.sourceNode = parseInt(e.target.value, 10);
    });
    document.getElementById('select-target').addEventListener('change', (e) => {
      state.targetNode = parseInt(e.target.value, 10);
    });
  }

  function _cacheDOMReferences() {
    DOM = {
      // View container'ları
      homeView: document.getElementById('home-view'),
      workspaceView: document.getElementById('workspace-view'),

      // Ana sayfa elemanları
      categoryGrid: document.getElementById('category-grid'),

      // Workspace elemanları
      topbarTitle: document.getElementById('workspace-title'),
      algoTabs: document.getElementById('algo-tabs'),
      visualizerArea: document.getElementById('visualizer-area'),
      placeholder: document.getElementById('visualizer-placeholder'),
      canvas: document.getElementById('visualizer-canvas'),

      // Kontrol paneli
      btnGenerate: document.getElementById('btn-generate'),
      btnStepBack: document.getElementById('btn-step-back'),
      btnPlayPause: document.getElementById('btn-play-pause'),
      btnStepForward: document.getElementById('btn-step-forward'),
      speedSlider: document.getElementById('speed-slider'),

      // Durum çubuğu
      statusAlgo: document.getElementById('status-algo'),
      statusStep: document.getElementById('status-step'),
      statusIndicator: document.getElementById('status-indicator'),

      // Geri butonu
      btnBack: document.getElementById('btn-back'),
    };
  }

  /* ============================================================
     BÖLÜM 4: Ana Sayfa — Kategori Kartlarını Render Et
     ============================================================ */
  function _renderCategoryCards() {
    if (!DOM.categoryGrid) return;

    const fragment = document.createDocumentFragment();

    CATEGORIES.forEach(category => {
      const card = document.createElement('div');
      card.className = 'category-card';
      card.dataset.slug = category.slug;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `${category.title} kategorisine git`);

      card.innerHTML = `
        <div class="category-card__icon">${category.icon}</div>
        <h3 class="category-card__title">${category.title}</h3>
        <p class="category-card__desc">${category.desc}</p>
        <span class="category-card__count">${category.algorithms.length} algoritma</span>
      `;

      // Kart tıklama → İlgili kategoriye yönlendir
      card.addEventListener('click', () => {
        Router.navigate(`category/${category.slug}`);
      });

      // Klavye erişilebilirliği: Enter veya Space ile tıklama
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          Router.navigate(`category/${category.slug}`);
        }
      });

      fragment.appendChild(card);
    });

    DOM.categoryGrid.appendChild(fragment);
  }

  /* ============================================================
     BÖLÜM 5: Workspace — Algoritma Sekmelerini Render Et
     ============================================================ */
  function _renderAlgoTabs(category) {
    if (!DOM.algoTabs) return;

    // Mevcut sekmeleri temizle
    DOM.algoTabs.innerHTML = '';

    const fragment = document.createDocumentFragment();

    category.algorithms.forEach(algo => {
      const tab = document.createElement('button');
      tab.className = 'algo-tab';
      tab.dataset.algoId = algo.id;
      tab.textContent = algo.name;
      tab.setAttribute('type', 'button');

      // Sekme tıklama → Algoritmayı seç
      tab.addEventListener('click', () => {
        _selectAlgorithm(algo.id, category);
      });

      fragment.appendChild(tab);
    });

    DOM.algoTabs.appendChild(fragment);
  }

  /**
   * Bir algoritmayı seçer ve UI'ı günceller.
   * 
   * @param {string} algoId   - Seçilen algoritmanın id'si
   * @param {Object} category - Ait olduğu kategori objesi
   */
  function _selectAlgorithm(algoId, category) {
    const algo = category.algorithms.find(a => a.id === algoId);
    if (!algo) return;

    // State güncelle
    state.currentAlgorithm = algoId;
    state.currentStep = 0;
    state.totalSteps = 0;
    state.isPlaying = false;

    // Aktif sekmeyi güncelle
    DOM.algoTabs.querySelectorAll('.algo-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.algoId === algoId);
    });

    // Placeholder göster, canvas gizle
    _showPlaceholder();
    if (DOM.placeholder) {
      DOM.placeholder.querySelector('.visualizer-placeholder__text').textContent =
        `"${algo.name}" seçildi — Veri üretmek için aşağıdaki butona tıklayın.`;
    }

    // Visualizer'ı temizle
    Visualizer.clear();

    // Durum çubuğunu güncelle
    _updateStatusBar(algo.name);

    // Play/Pause butonunu sıfırla
    _updatePlayPauseButton(false);

    // Graf algoritması seçildiyse kaynak/hedef seçiciyi göster
    _injectGraphControls();
    const gControls = document.getElementById('graph-node-controls');
    if (gControls) {
      gControls.style.display = GRAPH_ALGO_IDS.has(algoId) ? 'flex' : 'none';
    }
    // Hedef seçiciyi sadece kaynak→hedef algoritmalarında göster
    const targetGroup = document.getElementById('target-group');
    if (targetGroup) {
      targetGroup.style.display = TARGET_ALGO_IDS.has(algoId) ? 'flex' : 'none';
    }
  }

  /* ============================================================
     BÖLÜM 5.5: Canvas / Placeholder Toggle
     ============================================================ */

  /** Placeholder'ı göster, canvas'ı gizle */
  function _showPlaceholder() {
    if (DOM.placeholder) DOM.placeholder.style.display = '';
    if (DOM.canvas) DOM.canvas.style.display = 'none';
  }

  /** Canvas'ı göster, placeholder'ı gizle */
  function _showCanvas() {
    if (DOM.placeholder) DOM.placeholder.style.display = 'none';
    if (DOM.canvas) DOM.canvas.style.display = 'block';
  }

  /* ============================================================
     BÖLÜM 6: Durum Çubuğu ve Kontrol Güncellemeleri
     ============================================================ */

  /**
   * Durum çubuğunu günceller.
   * @param {string} algoName - Aktif algoritma adı
   */
  function _updateStatusBar(algoName) {
    if (DOM.statusAlgo) {
      DOM.statusAlgo.textContent = algoName || 'Algoritma seçilmedi';
    }
    if (DOM.statusStep) {
      DOM.statusStep.textContent = state.totalSteps > 0
        ? `İşlem: ${state.currentStep} / ${state.totalSteps}`
        : 'Beklemede';
    }
    if (DOM.statusIndicator) {
      DOM.statusIndicator.className = 'status-bar__indicator';
      if (state.isPlaying) {
        DOM.statusIndicator.classList.add('status-bar__indicator--running');
      } else if (state.currentAlgorithm) {
        DOM.statusIndicator.classList.add('status-bar__indicator--ready');
      }
    }
  }

  /**
   * Play/Pause butonunun ikonunu günceller.
   * @param {boolean} isPlaying - Oynatılıyor mu?
   */
  function _updatePlayPauseButton(isPlaying) {
    state.isPlaying = isPlaying;
    if (DOM.btnPlayPause) {
      // ▶ = Play, ⏸ = Pause (Unicode semboller)
      DOM.btnPlayPause.textContent = isPlaying ? '⏸' : '▶';
      DOM.btnPlayPause.setAttribute('aria-label', isPlaying ? 'Duraklat' : 'Oynat');
    }
    // Durum çubuğu göstergesini güncelle
    _updateStatusBar(
      state.currentAlgorithm
        ? CATEGORIES.find(c => c.slug === state.currentCategory)
          ?.algorithms.find(a => a.id === state.currentAlgorithm)?.name
        : null
    );
  }

  /* ============================================================
     BÖLÜM 7: Event Listener'lar
     ============================================================ */
  function _bindEvents() {

    // ---- Geri Butonu ----
    if (DOM.btnBack) {
      DOM.btnBack.addEventListener('click', () => {
        Router.navigate('home');
      });
    }

    // ---- Veri Üret Butonu ----
    if (DOM.btnGenerate) {
      DOM.btnGenerate.addEventListener('click', () => {
        if (!state.currentAlgorithm) {
          _flashMessage('Önce bir algoritma seçin!');
          return;
        }

        // Sıralama kategorisi mi kontrol et
        const algoFn = ALGO_MAP[state.currentAlgorithm];
        if (!algoFn) {
          _flashMessage('Bu algoritma henüz implement edilmedi.');
          return;
        }

        // Rastgele dizi oluştur
        const arr = Algorithms.generateArray(40, 100);

        // Algoritmayı çalıştır — değerleri her zaman DOM'dan oku (state stale olabilir)
        const srcEl = document.getElementById('select-source');
        const tgtEl = document.getElementById('select-target');
        const src = srcEl ? parseInt(srcEl.value, 10) : 0;
        const tgt = tgtEl ? parseInt(tgtEl.value, 10) : 5;
        state.sourceNode = src;
        state.targetNode = tgt;
        const steps = algoFn(arr, src, tgt);

        // Canvas'ı göster, placeholder'ı gizle
        _showCanvas();

        // Snapshot'ları Visualizer'a yükle
        Visualizer.load(steps);
      });
    }

    // ---- Play / Pause Butonu ----
    if (DOM.btnPlayPause) {
      DOM.btnPlayPause.addEventListener('click', () => {
        if (!state.currentAlgorithm) return;
        if (Visualizer.isPlaying()) {
          Visualizer.pause();
        } else {
          Visualizer.play();
        }
      });
    }

    // ---- Adım Geri Butonu ----
    if (DOM.btnStepBack) {
      DOM.btnStepBack.addEventListener('click', () => {
        Visualizer.stepBack();
      });
    }

    // ---- Adım İleri Butonu ----
    if (DOM.btnStepForward) {
      DOM.btnStepForward.addEventListener('click', () => {
        Visualizer.stepForward();
      });
    }

    // ---- Hız Slider'ı ----
    if (DOM.speedSlider) {
      DOM.speedSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        state.speed = val;
        Visualizer.setSpeed(val);
      });
    }

    // ---- Hero Scroll Indicator ----
    const heroScrollBtn = document.querySelector('.hero-scroll-indicator');
    if (heroScrollBtn) {
      heroScrollBtn.addEventListener('click', () => {
        const target = document.getElementById('algorithms-section');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }

  /**
     * Kısa süreli bir bilgilendirme mesajı gösterir.
     * (Placeholder gövdesinde gösterilir)
     * @param {string} message - Gösterilecek mesaj
     */
  function _flashMessage(message) {
    if (!DOM.placeholder) return;

    const textEl = DOM.placeholder.querySelector('.visualizer-placeholder__text');
    const originalText = textEl.textContent;

    textEl.textContent = message;
    textEl.style.color = 'var(--accent-amber)';

    setTimeout(() => {
      textEl.textContent = originalText;
      textEl.style.color = '';
    }, 2000);
  }

  /* ============================================================
     BÖLÜM 8: Rota İşleyicileri (Route Handlers)
     ============================================================ */

  /**
   * Ana Sayfa rotası işleyicisi.
   * Home view'ı gösterir, workspace'i gizler.
   */
  function _handleHome() {
    // Animasyonu durdur ve temizle
    Visualizer.clear();

    // State'i sıfırla
    state.currentCategory = null;
    state.currentAlgorithm = null;
    state.isPlaying = false;
    state.currentStep = 0;
    state.totalSteps = 0;

    // View geçişi
    Router.showView('home-view');
  }

  /**
   * Kategori rotası işleyicisi.
   * Workspace view'ı gösterir ve ilgili kategoriyi yükler.
   * 
   * @param {string} slug - Kategori slug'ı (örn: "sorting")
   */
  function _handleCategory(slug) {
    // Kategoriyi bul
    const category = CATEGORIES.find(c => c.slug === slug);
    if (!category) {
      console.warn(`[App] Kategori bulunamadı: "${slug}"`);
      Router.navigate('home');
      return;
    }

    // State güncelle
    state.currentCategory = slug;
    state.currentAlgorithm = null;
    state.isPlaying = false;
    state.currentStep = 0;
    state.totalSteps = 0;

    // Workspace başlığını güncelle
    if (DOM.topbarTitle) {
      DOM.topbarTitle.textContent = category.title;
    }

    // Algoritma sekmelerini render et
    _renderAlgoTabs(category);

    // Visualizer temizle, placeholder göster
    Visualizer.clear();
    _showPlaceholder();

    // Graf kontrollerini gizle (yeni kategori seçildi)
    const gctrl = document.getElementById('graph-node-controls');
    if (gctrl) gctrl.style.display = 'none';
    if (DOM.placeholder) {
      DOM.placeholder.querySelector('.visualizer-placeholder__text').textContent =
        'Lütfen başlatmak için bir algoritma seçin ve veri üretin.';
    }

    // Durum çubuğunu sıfırla
    _updateStatusBar(null);
    _updatePlayPauseButton(false);

    // View geçişi
    Router.showView('workspace-view');
  }

  /* ============================================================
     BÖLÜM 9: Başlatma (Initialization)
     ============================================================ */
  return {

    /**
     * Uygulamayı başlatır.
     * DOM yüklendikten sonra çağrılmalıdır.
     */
    init() {
      // 1. DOM referanslarını sakla
      _cacheDOMReferences();

      // 2. Visualizer'ı başlat (canvas + step callback)
      if (DOM.canvas) {
        Visualizer.init(DOM.canvas, (info) => {
          // Adım değiştiğinde UI'ı güncelle
          state.currentStep = info.current;
          state.totalSteps = info.total;
          state.isPlaying = info.isPlaying;

          const algoName = state.currentAlgorithm
            ? CATEGORIES.find(c => c.slug === state.currentCategory)
              ?.algorithms.find(a => a.id === state.currentAlgorithm)?.name
            : null;

          _updateStatusBar(algoName);
          _updatePlayPauseButton(info.isPlaying);
        });
      }

      // 3. Kategori kartlarını render et
      _renderCategoryCards();

      // 4. Event listener'ları bağla
      _bindEvents();

      // 5. Rotaları tanımla
      Router
        .on('home', _handleHome)
        .on('category', _handleCategory);

      // 6. Router'ı başlat
      Router.init('app');

      console.log('[App] Algoritma Görselleştirme Platformu başlatıldı.');
    },

    /**
     * Dışarıdan kategori verilerine erişim sağlar.
     * (İleride algoritma modülleri tarafından kullanılabilir)
     * 
     * @returns {Array} Tüm kategoriler
     */
    getCategories() {
      return CATEGORIES;
    },

    /**
     * Mevcut uygulama durumunu döndürür.
     * @returns {Object} state objesi
     */
    getState() {
      return { ...state };
    }
  };

})();

/* ============================================================
   DOM hazır olduğunda uygulamayı başlat.
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  App.init();

  /* ---- Dark / Light Theme Toggle ---- */
  const themeToggle = document.getElementById('theme-toggle');
  const htmlEl = document.documentElement;

  // Kayıtlı tema tercihi varsa uygula
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    htmlEl.setAttribute('data-theme', savedTheme);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = htmlEl.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      htmlEl.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }
});