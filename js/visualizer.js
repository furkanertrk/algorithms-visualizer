/* ============================================================
   visualizer.js — HTML5 Canvas Çizim Motoru
   
   MİMARİ:
     graphState  → Sabit topoloji + rastgele ağırlıklar (veri katmanı)
     drawGraph() → Koordinatları hardcoded, sadece bu fonksiyon çizer
     Playback    → play / pause / step / setSpeed API
   
   KURAL: Hiçbir fonksiyon düğüm konumu HESAPLAMAZ.
          Tüm pozisyonlar FIXED_NODES içinde sonsuza dek sabittir.
   ============================================================ */

'use strict';

const Visualizer = (() => {

  /* ============================================================
     BÖLÜM 1: SABİT GRAF VERİSİ (graphState)
     6 düğüm — koordinatlar canvas'a göre oran (0.0 – 1.0)
     Topoloji (kenarlar) hiçbir zaman değişmez.
     Sadece kenar ağırlıkları (weight) "Veri Üret"te yenilenir.
     ============================================================ */

  /**
   * 6 düğümün canvas üzerindeki sabit konumları.
   * rx, ry → canvas genişlik/yüksekliğinin oranı
   */
  const FIXED_NODES = [
    { id: 0, label: 'A', rx: 0.10, ry: 0.20 },
    { id: 1, label: 'B', rx: 0.38, ry: 0.12 },
    { id: 2, label: 'C', rx: 0.70, ry: 0.18 },
    { id: 3, label: 'D', rx: 0.18, ry: 0.68 },
    { id: 4, label: 'E', rx: 0.50, ry: 0.75 },
    { id: 5, label: 'F', rx: 0.82, ry: 0.60 },
  ];

  /**
   * Sabit kenar topolojisi.
   * "Veri Üret" butonuna basıldığında SADECE weight değerleri
   * rastgele yeni sayılarla güncellenir; from/to asla değişmez.
   */
  const graphState = {
    edges: [
      { from: 0, to: 1, weight: 7 },   // A – B
      { from: 0, to: 3, weight: 4 },   // A – D
      { from: 1, to: 2, weight: 11 },  // B – C
      { from: 1, to: 3, weight: 9 },   // B – D
      { from: 1, to: 4, weight: 5 },   // B – E
      { from: 2, to: 4, weight: 8 },   // C – E
      { from: 2, to: 5, weight: 3 },   // C – F
      { from: 3, to: 4, weight: 14 },  // D – E
      { from: 4, to: 5, weight: 6 },   // E – F
    ]
  };

  /**
   * Yalnızca kenar ağırlıklarını rastgele günceller.
   * Topoloji (from / to) kesinlikle değişmez.
   */
  function randomizeWeights() {
    for (const edge of graphState.edges) {
      edge.weight = Math.floor(Math.random() * 19) + 1; // 1-19 arası
    }
  }

  /* ============================================================
     BÖLÜM 2: RENK PALETİ
     ============================================================ */
  const COLORS = {
    /* Genel */
    edgeLine:    'rgba(255,255,255,0.18)',
    edgeActive:  '#7ee8a2',
    edgeMst:     '#7ee8a2',
    edgePath:    '#ff3333',
    weightLabel: 'rgba(255,255,255,0.80)',
    weightBg:    'rgba(13,15,20,0.88)',
    /* Düğümler */
    nodeDefault: '#5b5bd6',
    nodeCurrent: '#f5a623',
    nodeActive:  '#7ee8a2',
    nodeVisited: '#3a3a9a',
    nodePath:    '#ff3333',
    nodeStroke:  '#7c7cff',
    nodeText:    '#ffffff',
    /* Bar chart */
    barDefault:  '#5b5bd6',
    barCompare:  '#f5a623',
    barSwap:     '#ff6b6b',
    barSorted:   '#7ee8a2',
    /* Grid */
    gridBg:      'rgba(255,255,255,0.04)',
    gridCompare: 'rgba(245,166,35,0.50)',
    gridActive:  'rgba(126,232,162,0.40)',
    gridPlaced:  'rgba(126,232,162,0.22)',
    gridConflict:'rgba(255,107,107,0.40)',
    gridBorder:  'rgba(255,255,255,0.08)',
    gridText:    'rgba(255,255,255,0.85)',
    /* Etiket */
    label:       'rgba(255,255,255,0.50)',
  };

  /* ============================================================
     BÖLÜM 3: İÇ DURUM (Internal State)
     ============================================================ */
  let _canvas        = null;
  let _ctx           = null;
  let _steps         = [];
  let _stepIndex     = 0;
  let _playing       = false;
  let _speed         = 50;        // 1-100
  let _animTimer     = null;
  let _onStepChange  = null;      // App'e callback

  /* ============================================================
     BÖLÜM 4: YARDIMCI FONKSİYONLAR (Private)
     ============================================================ */

  /** Canvas'ı tamamen siler */
  function _clearCanvas() {
    if (!_ctx) return;
    _ctx.clearRect(0, 0, _canvas.width, _canvas.height);
  }

  /** Hız (1-100) → milisaniye (logaritmik ölçek) */
  function _speedToMs(speed) {
    return Math.round(1500 - (speed / 100) * 1450);
  }

  /** App'e adım bilgisini gönder */
  function _notify() {
    if (!_onStepChange) return;
    _onStepChange({
      current:   _stepIndex,
      total:     _steps.length,
      isPlaying: _playing,
      label:     _steps[_stepIndex]?.label || ''
    });
  }

  /**
   * Sabit düğüm rx/ry değerlerini canvas piksel koordinatına çevirir.
   * Canvas yeniden boyutlandırıldığında piksel koordinatları
   * değişir ama oran (rx/ry) hiçbir zaman değişmez.
   */
  function _resolvePositions() {
    const W = _canvas.width;
    const H = _canvas.height - 40; // alt etiket payı
    return FIXED_NODES.map(n => ({
      ...n,
      x: n.rx * W,
      y: n.ry * H + 20
    }));
  }

  /* ============================================================
     BÖLÜM 5: drawGraph(ctx, step)
     Graf snapshot'ını FIXED_NODES konumlarıyla çizer.
     Bu fonksiyon hiçbir zaman pozisyon hesaplamaz;
     sadece FIXED_NODES'taki rx/ry değerlerini piksel'e çevirir.
     ============================================================ */

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} step  — { type:'graph', nodes:[], edges:[], label:'' }
   */
  function drawGraph(ctx, step) {
    const positions = _resolvePositions();
    const W = _canvas.width;
    const H = _canvas.height;
    const NODE_R = Math.min(W, H) * 0.044;

    /* ── Kenar renk haritası (snapshot'tan) ── */
    const edgeColorMap = {};
    for (const e of (step.edges || [])) {
      const key = Math.min(e.from, e.to) + '-' + Math.max(e.from, e.to);
      edgeColorMap[key] = e.color || 'default';
    }

    /* ── 1. Kenarları çiz ── */
    const drawnEdges = new Set();
    for (const e of (step.edges || [])) {
      const key = Math.min(e.from, e.to) + '-' + Math.max(e.from, e.to);
      if (drawnEdges.has(key)) continue;
      drawnEdges.add(key);

      const from = positions[e.from];
      const to   = positions[e.to];
      if (!from || !to) continue;

      /* Renk seçimi */
      let lineColor  = COLORS.edgeLine;
      let lineWidth  = 1.5;
      let isPathEdge = false;
      if (e.color === 'active') { lineColor = COLORS.edgeActive; lineWidth = 2.5; }
      else if (e.color === 'mst')  { lineColor = COLORS.edgeMst;    lineWidth = 2.5; }
      else if (e.color === 'path') { lineColor = COLORS.edgePath;   lineWidth = 4; isPathEdge = true; }

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = lineColor;
      ctx.lineWidth   = lineWidth;
      if (isPathEdge) {
        /* Parlayan kırmızı glow katmanı */
        ctx.shadowColor = '#ff3333';
        ctx.shadowBlur  = 18;
        ctx.stroke();
        ctx.shadowBlur  = 36;
        ctx.lineWidth   = 2;
        ctx.globalAlpha = 0.4;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.shadowBlur  = 0;
        ctx.lineWidth   = lineWidth;
        ctx.stroke();
      } else {
        ctx.shadowBlur = 0;
        ctx.stroke();
      }

      /* Ağırlık etiketi — her zaman kenar ortasında, her zaman görünür */
      const mx  = (from.x + to.x) / 2;
      const my  = (from.y + to.y) / 2;
      const wtxt = String(e.weight ?? '');
      const pad  = 5;
      ctx.font = '11px monospace';
      const tw  = ctx.measureText(wtxt).width + pad * 2;
      const th  = 16;

      ctx.fillStyle = COLORS.weightBg;
      ctx.fillRect(mx - tw / 2, my - th / 2, tw, th);
      ctx.fillStyle  = COLORS.weightLabel;
      ctx.textAlign  = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(wtxt, mx, my);
    }

    /* ── 2. Düğümleri çiz ── */
    const nodeColorMap = {};
    for (const n of (step.nodes || [])) nodeColorMap[n.id] = n;

    for (const pos of positions) {
      const nodeInfo = nodeColorMap[pos.id];
      const colorKey = nodeInfo?.color || 'default';

      let fillColor = COLORS.nodeDefault;
      if (colorKey === 'current') fillColor = COLORS.nodeCurrent;
      else if (colorKey === 'active')  fillColor = COLORS.nodeActive;
      else if (colorKey === 'visited') fillColor = COLORS.nodeVisited;
      else if (colorKey === 'path')    fillColor = COLORS.nodePath;

      /* Glow efekti */
      ctx.shadowColor = fillColor;
      ctx.shadowBlur  = colorKey === 'path' ? 28 : colorKey !== 'default' ? 16 : 6;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, NODE_R, 0, Math.PI * 2);
      ctx.fillStyle   = fillColor;
      ctx.fill();
      ctx.strokeStyle = COLORS.nodeStroke;
      ctx.lineWidth   = 1.5;
      ctx.stroke();
      ctx.shadowBlur  = 0;

      /* Harf etiketi */
      ctx.fillStyle    = COLORS.nodeText;
      ctx.font         = `bold ${Math.round(NODE_R * 0.82)}px sans-serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pos.label, pos.x, pos.y);

      /* Mesafe değeri (düğümün sol-altına küçük yazı) */
      const val = nodeInfo?.value;
      if (val !== null && val !== undefined) {
        ctx.font         = '11px monospace';
        ctx.fillStyle    = 'rgba(255,255,255,0.80)';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(String(val), pos.x - NODE_R * 0.65, pos.y + NODE_R + 4);
      }
    }

    /* ── 3. Durum etiketi (sol-alt) ── */
    if (step.label) {
      ctx.fillStyle    = COLORS.label;
      ctx.font         = '13px monospace';
      ctx.textAlign    = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(step.label, 12, H - 8);
    }
  }

  /* ============================================================
     BÖLÜM 6: drawBarChart(ctx, step) — Dizi algoritmaları
     ============================================================ */

  function _drawBarChart(ctx, step) {
    const W      = _canvas.width;
    const H      = _canvas.height - 30;
    const arr    = step.array || [];
    const n      = arr.length;
    if (n === 0) return;

    const maxVal = Math.max(...arr, 1);
    const barW   = Math.floor((W - 20) / n);
    const gap    = Math.max(1, Math.floor(barW * 0.1));

    for (let i = 0; i < n; i++) {
      let color = COLORS.barDefault;
      if (step.sorted?.includes(i))    color = COLORS.barSorted;
      if (step.swapping?.includes(i))  color = COLORS.barSwap;
      if (step.comparing?.includes(i)) color = COLORS.barCompare;

      const barH = Math.max(2, Math.floor((arr[i] / maxVal) * (H - 20)));
      const x    = 10 + i * barW + gap;
      const y    = H - barH;
      const bw   = barW - gap * 2;

      ctx.fillStyle = color;
      ctx.fillRect(x, y, bw, barH);

      // Sayı etiketi — sadece sütun yeterince genişse göster
      if (barW >= 12) {
        const fontSize = Math.max(8, Math.min(11, Math.floor(barW * 0.55)));
        ctx.fillStyle    = 'rgba(255,255,255,0.70)';
        ctx.font         = `${fontSize}px monospace`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(String(arr[i]), x + bw / 2, H + 2);
      }
    }

    if (step.label) {
      ctx.fillStyle    = COLORS.label;
      ctx.font         = '13px monospace';
      ctx.textAlign    = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(step.label, 12, _canvas.height - 6);
    }
  }

  /* ============================================================
     BÖLÜM 7: drawGrid(ctx, step) — Floyd-Warshall, N-Queens vb.
     ============================================================ */

  function _drawGrid(ctx, step) {
    const W        = _canvas.width;
    const H        = _canvas.height - 30;
    const { grid, rows, cols, highlights = [] } = step;
    const cellSize = Math.min(
      Math.floor((W - 40) / cols),
      Math.floor((H - 40) / rows),
      60
    );
    const startX = (W - cellSize * cols) / 2;
    const startY = (H - cellSize * rows) / 2;

    /* highlight haritası */
    const hlMap = {};
    for (const hl of highlights) hlMap[`${hl.row},${hl.col}`] = hl.color;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x  = startX + c * cellSize;
        const y  = startY + r * cellSize;
        const hl = hlMap[`${r},${c}`];

        let bg = COLORS.gridBg;
        if (hl === 'comparing') bg = COLORS.gridCompare;
        else if (hl === 'active')    bg = COLORS.gridActive;
        else if (hl === 'placed')    bg = COLORS.gridPlaced;
        else if (hl === 'conflict')  bg = COLORS.gridConflict;

        ctx.fillStyle = bg;
        ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
        ctx.strokeStyle = COLORS.gridBorder;
        ctx.lineWidth   = 1;
        ctx.strokeRect(x, y, cellSize, cellSize);

        const val = grid[r]?.[c];
        if (val !== undefined && val !== null && val !== 0) {
          ctx.fillStyle    = COLORS.gridText;
          ctx.font         = `${Math.max(10, Math.floor(cellSize * 0.3))}px monospace`;
          ctx.textAlign    = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(val === 999 ? '∞' : String(val), x + cellSize / 2, y + cellSize / 2);
        }
      }
    }

    if (step.label) {
      ctx.fillStyle    = COLORS.label;
      ctx.font         = '13px monospace';
      ctx.textAlign    = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(step.label, 12, _canvas.height - 6);
    }
  }

  /* ============================================================
     BÖLÜM 8: Ana Render Dağıtıcısı
     ============================================================ */

  function _render(step) {
    if (!_ctx || !step) return;
    _clearCanvas();

    if (step.type === 'graph') {
      drawGraph(_ctx, step);
    } else if (step.type === 'grid') {
      _drawGrid(_ctx, step);
    } else {
      _drawBarChart(_ctx, step);
    }
  }

  /* ============================================================
     BÖLÜM 9: Oynatma Motoru (Tick Loop)
     ============================================================ */

  function _tick() {
    if (!_playing) return;
    if (_stepIndex >= _steps.length - 1) {
      _playing = false;
      _notify();
      return;
    }
    _stepIndex++;
    _render(_steps[_stepIndex]);
    _notify();
    _animTimer = setTimeout(_tick, _speedToMs(_speed));
  }

  /* ============================================================
     PUBLIC API
     ============================================================ */
  return {

    /**
     * Visualizer'ı başlatır.
     * @param {HTMLCanvasElement} canvas
     * @param {Function} onStepChange — (info: {current,total,isPlaying,label}) => void
     */
    init(canvas, onStepChange) {
      _canvas       = canvas;
      _ctx          = canvas.getContext('2d');
      _onStepChange = onStepChange;

      function _resize() {
        const p = canvas.parentElement;
        if (!p) return;
        canvas.width  = p.clientWidth;
        canvas.height = p.clientHeight;
        if (_steps.length > 0) _render(_steps[_stepIndex]);
      }
      _resize();
      window.addEventListener('resize', _resize);
    },

    /**
     * "Veri Üret" butonuna basıldığında SADECE bu fonksiyon çağrılır.
     * Düğüm konumları ve kenar topolojisi ASLA değişmez.
     * Yalnızca graphState.edges içindeki weight değerleri yenilenir.
     * Ardından algoritma yeniden adımlandırılır.
     *
     * @param {Array} steps — algorithms.js'ten gelen snapshot dizisi
     */
    load(steps) {
      clearTimeout(_animTimer);
      _playing   = false;
      _steps     = steps || [];
      _stepIndex = 0;

      if (_steps.length > 0) _render(_steps[0]);
      else _clearCanvas();

      _notify();
    },

    /** Grafik adımlarını sıfırlamadan sadece ağırlıkları yeniler ve canvas'ı çizer. */
    regenerateWeights() {
      randomizeWeights();
    },

    /** Mevcut graphState.edges'e erişim (algorithms.js için) */
    getGraphState() {
      return graphState;
    },

    /** Oynatmayı başlatır */
    play() {
      if (_playing || _steps.length === 0) return;
      _playing = true;
      _notify();
      _tick();
    },

    /** Oynatmayı duraklatır */
    pause() {
      _playing = false;
      clearTimeout(_animTimer);
      _notify();
    },

    /** Bir adım ileri */
    stepForward() {
      if (_stepIndex >= _steps.length - 1) return;
      this.pause();
      _stepIndex++;
      _render(_steps[_stepIndex]);
      _notify();
    },

    /** Bir adım geri */
    stepBack() {
      if (_stepIndex <= 0) return;
      this.pause();
      _stepIndex--;
      _render(_steps[_stepIndex]);
      _notify();
    },

    /** Canvas'ı temizler ve tüm state'i sıfırlar */
    clear() {
      this.pause();
      _steps     = [];
      _stepIndex = 0;
      _clearCanvas();
      _notify();
    },

    /** Animasyon hızını ayarlar (1 = yavaş, 100 = hızlı) */
    setSpeed(val) {
      _speed = Math.max(1, Math.min(100, Number(val)));
    },

    /** Oynatılıyor mu? */
    isPlaying() {
      return _playing;
    },

    /* ---- Dahili sabitler (test/debug için) ---- */
    _FIXED_NODES: FIXED_NODES,
    _graphState:  graphState,
  };

})();