/* ============================================================
   algorithms.js — Sıralama Algoritmaları
   Her algoritma diziyi sıralarken her adımı "snapshot" olarak
   kaydeder. Bu snapshot dizisi sonra Visualizer tarafından
   adım adım oynatılır.

   Snapshot formatı:
   {
     array:     [...],          // dizinin o anki hali
     comparing: [i, j] | [],    // karşılaştırılan indeksler
     swapping:  [i, j] | [],    // yer değiştirilen indeksler
     sorted:    [...],          // sıralanmış (yeşil) indeksler
     label:     "açıklama"      // durum çubuğu için metin
   }
   ============================================================ */

'use strict';

const Algorithms = (() => {

  /* ---- Yardımcı: Snapshot kaydet ---- */
  function snap(steps, arr, comparing, swapping, sorted, label) {
    steps.push({
      array: [...arr],
      comparing: comparing || [],
      swapping: swapping || [],
      sorted: sorted ? [...sorted] : [],
      label: label || ''
    });
  }

  /* ============================================================
     BUBBLE SORT
     ============================================================ */
  function bubbleSort(inputArr) {
    const arr = [...inputArr];
    const n = arr.length;
    const steps = [];
    const sorted = [];

    snap(steps, arr, [], [], sorted, 'Başlangıç dizisi');

    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      for (let j = 0; j < n - 1 - i; j++) {
        // Karşılaştırma
        snap(steps, arr, [j, j + 1], [], sorted,
          `Karşılaştır: index ${j} ve ${j + 1}`);

        if (arr[j] > arr[j + 1]) {
          // Swap
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swapped = true;
          snap(steps, arr, [], [j, j + 1], sorted,
            `Yer değiştir: ${arr[j + 1]} ↔ ${arr[j]}`);
        }
      }
      sorted.push(n - 1 - i);
      snap(steps, arr, [], [], sorted,
        `Eleman ${arr[n - 1 - i]} yerleşti`);

      if (!swapped) break;
    }

    // Kalan elemanları sorted olarak işaretle
    for (let i = 0; i < n; i++) {
      if (!sorted.includes(i)) sorted.push(i);
    }
    snap(steps, arr, [], [], sorted, 'Sıralama tamamlandı!');
    return steps;
  }

  /* ============================================================
     SELECTION SORT
     ============================================================ */
  function selectionSort(inputArr) {
    const arr = [...inputArr];
    const n = arr.length;
    const steps = [];
    const sorted = [];

    snap(steps, arr, [], [], sorted, 'Başlangıç dizisi');

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;

      for (let j = i + 1; j < n; j++) {
        snap(steps, arr, [minIdx, j], [], sorted,
          `Min ara: index ${minIdx} vs ${j}`);

        if (arr[j] < arr[minIdx]) {
          minIdx = j;
        }
      }

      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        snap(steps, arr, [], [i, minIdx], sorted,
          `Yer değiştir: ${arr[minIdx]} ↔ ${arr[i]}`);
      }

      sorted.push(i);
      snap(steps, arr, [], [], sorted,
        `Eleman ${arr[i]} yerleşti (pos ${i})`);
    }

    sorted.push(n - 1);
    snap(steps, arr, [], [], sorted, 'Sıralama tamamlandı!');
    return steps;
  }

  /* ============================================================
     INSERTION SORT
     ============================================================ */
  function insertionSort(inputArr) {
    const arr = [...inputArr];
    const n = arr.length;
    const steps = [];
    const sorted = [0]; // İlk eleman zaten "sıralı"

    snap(steps, arr, [], [], sorted, 'Başlangıç dizisi');

    for (let i = 1; i < n; i++) {
      const key = arr[i];
      let j = i - 1;

      snap(steps, arr, [i], [], sorted,
        `Anahtar seçildi: ${key} (index ${i})`);

      while (j >= 0 && arr[j] > key) {
        snap(steps, arr, [j, j + 1], [], sorted,
          `Karşılaştır: ${arr[j]} > ${key}`);

        arr[j + 1] = arr[j];
        snap(steps, arr, [], [j, j + 1], sorted,
          `Kaydır: ${arr[j]} → sağa`);

        j--;
      }

      arr[j + 1] = key;
      sorted.push(i);
      snap(steps, arr, [], [], sorted,
        `${key} yerleştirildi (pos ${j + 1})`);
    }

    const allSorted = Array.from({ length: n }, (_, i) => i);
    snap(steps, arr, [], [], allSorted, 'Sıralama tamamlandı!');
    return steps;
  }

  /* ============================================================
     MERGE SORT
     ============================================================ */
  function mergeSort(inputArr) {
    const arr = [...inputArr];
    const n = arr.length;
    const steps = [];

    snap(steps, arr, [], [], [], 'Başlangıç dizisi');

    function mergeSortHelper(start, end) {
      if (end - start <= 1) return;

      const mid = Math.floor((start + end) / 2);
      mergeSortHelper(start, mid);
      mergeSortHelper(mid, end);
      merge(start, mid, end);
    }

    function merge(start, mid, end) {
      const left = arr.slice(start, mid);
      const right = arr.slice(mid, end);
      let i = 0, j = 0, k = start;

      while (i < left.length && j < right.length) {
        snap(steps, arr, [start + i, mid + j], [], [],
          `Birleştir: ${left[i]} vs ${right[j]}`);

        if (left[i] <= right[j]) {
          arr[k] = left[i];
          i++;
        } else {
          arr[k] = right[j];
          j++;
        }
        snap(steps, arr, [], [k], [],
          `Yerleştir: ${arr[k]} → pos ${k}`);
        k++;
      }

      while (i < left.length) {
        arr[k] = left[i];
        snap(steps, arr, [], [k], [],
          `Kalan sol: ${arr[k]} → pos ${k}`);
        i++; k++;
      }

      while (j < right.length) {
        arr[k] = right[j];
        snap(steps, arr, [], [k], [],
          `Kalan sağ: ${arr[k]} → pos ${k}`);
        j++; k++;
      }
    }

    mergeSortHelper(0, n);

    const allSorted = Array.from({ length: n }, (_, i) => i);
    snap(steps, arr, [], [], allSorted, 'Sıralama tamamlandı!');
    return steps;
  }

  /* ============================================================
     QUICK SORT
     ============================================================ */
  function quickSort(inputArr) {
    const arr = [...inputArr];
    const n = arr.length;
    const steps = [];
    const sorted = [];

    snap(steps, arr, [], [], sorted, 'Başlangıç dizisi');

    function partition(low, high) {
      const pivot = arr[high];
      snap(steps, arr, [high], [], sorted,
        `Pivot seçildi: ${pivot} (index ${high})`);

      let i = low - 1;

      for (let j = low; j < high; j++) {
        snap(steps, arr, [j, high], [], sorted,
          `Karşılaştır: ${arr[j]} vs pivot ${pivot}`);

        if (arr[j] <= pivot) {
          i++;
          if (i !== j) {
            [arr[i], arr[j]] = [arr[j], arr[i]];
            snap(steps, arr, [], [i, j], sorted,
              `Yer değiştir: ${arr[j]} ↔ ${arr[i]}`);
          }
        }
      }

      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      snap(steps, arr, [], [i + 1, high], sorted,
        `Pivot yerleşti: pos ${i + 1}`);

      sorted.push(i + 1);
      return i + 1;
    }

    function qsHelper(low, high) {
      if (low < high) {
        const pi = partition(low, high);
        qsHelper(low, pi - 1);
        qsHelper(pi + 1, high);
      } else if (low === high) {
        sorted.push(low);
      }
    }

    qsHelper(0, n - 1);

    const allSorted = Array.from({ length: n }, (_, i) => i);
    snap(steps, arr, [], [], allSorted, 'Sıralama tamamlandı!');
    return steps;
  }

  /* ============================================================
     HEAP SORT
     ============================================================ */
  function heapSort(inputArr) {
    const arr = [...inputArr];
    const n = arr.length;
    const steps = [];
    const sorted = [];

    snap(steps, arr, [], [], sorted, 'Başlangıç dizisi');

    function heapify(size, root) {
      let largest = root;
      const left = 2 * root + 1;
      const right = 2 * root + 2;

      if (left < size) {
        snap(steps, arr, [largest, left], [], sorted,
          `Heap: ${arr[largest]} vs sol çocuk ${arr[left]}`);
        if (arr[left] > arr[largest]) largest = left;
      }

      if (right < size) {
        snap(steps, arr, [largest, right], [], sorted,
          `Heap: ${arr[largest]} vs sağ çocuk ${arr[right]}`);
        if (arr[right] > arr[largest]) largest = right;
      }

      if (largest !== root) {
        [arr[root], arr[largest]] = [arr[largest], arr[root]];
        snap(steps, arr, [], [root, largest], sorted,
          `Yer değiştir: ${arr[largest]} ↔ ${arr[root]}`);
        heapify(size, largest);
      }
    }

    // Max heap oluştur
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      heapify(n, i);
    }
    snap(steps, arr, [], [], sorted, 'Max heap oluşturuldu');

    // Tek tek çıkar
    for (let i = n - 1; i > 0; i--) {
      [arr[0], arr[i]] = [arr[i], arr[0]];
      sorted.push(i);
      snap(steps, arr, [], [0, i], sorted,
        `Kök ↔ son: ${arr[i]} yerleşti`);
      heapify(i, 0);
    }

    sorted.push(0);
    snap(steps, arr, [], [], Array.from({ length: n }, (_, i) => i),
      'Sıralama tamamlandı!');
    return steps;
  }

  /* ============================================================
     RADIX SORT
     ============================================================ */
  function radixSort(inputArr) {
    const arr = [...inputArr];
    const n = arr.length;
    const steps = [];
    const sorted = [];

    snap(steps, arr, [], [], sorted, 'Başlangıç dizisi');

    const maxVal = Math.max(...arr);
    const maxDigits = Math.floor(Math.log10(maxVal)) + 1;

    for (let digit = 0; digit < maxDigits; digit++) {
      const exp = Math.pow(10, digit);
      const digitName = digit === 0 ? 'birler' : digit === 1 ? 'onlar' : 'yüzler';
      snap(steps, arr, [], [], sorted, `Basamak: ${digitName} (10^${digit})`);

      const output = new Array(n);
      const count = new Array(10).fill(0);

      for (let i = 0; i < n; i++) {
        const d = Math.floor(arr[i] / exp) % 10;
        count[d]++;
        snap(steps, arr, [i], [], sorted, `${arr[i]} → basamak değeri ${d}`);
      }

      for (let i = 1; i < 10; i++) { count[i] += count[i - 1]; }

      for (let i = n - 1; i >= 0; i--) {
        const d = Math.floor(arr[i] / exp) % 10;
        output[count[d] - 1] = arr[i];
        count[d]--;
      }

      for (let i = 0; i < n; i++) { arr[i] = output[i]; }

      snap(steps, arr, [], [], sorted, `Basamak ${digitName} sıralaması tamamlandı`);
    }

    const allSorted = Array.from({ length: n }, (_, i) => i);
    snap(steps, arr, [], [], allSorted, 'Radix Sort tamamlandı!');
    return steps;
  }

  /* ============================================================
     LINEAR SEARCH
     ============================================================ */
  function linearSearch(inputArr) {
    const arr = [...inputArr];
    const n = arr.length;
    const steps = [];
    const target = arr[Math.floor(Math.random() * n)];

    snap(steps, arr, [], [], [], `Aranan değer: ${target}`);

    for (let i = 0; i < n; i++) {
      snap(steps, arr, [i], [], [], `Kontrol: index ${i} → ${arr[i]} == ${target}?`);
      if (arr[i] === target) {
        snap(steps, arr, [], [], [i], `Bulundu! index ${i} → ${arr[i]}`);
        return steps;
      }
      snap(steps, arr, [], [i], [], `${arr[i]} ≠ ${target}, devam`);
    }

    snap(steps, arr, [], [], [], `${target} dizide bulunamadı.`);
    return steps;
  }

  /* ============================================================
     BINARY SEARCH
     ============================================================ */
  function binarySearch(inputArr) {
    const arr = [...inputArr].sort((a, b) => a - b);
    const n = arr.length;
    const steps = [];
    const target = arr[Math.floor(Math.random() * n)];

    snap(steps, arr, [], [], [], `Sıralı dizi — Aranan: ${target}`);

    let low = 0, high = n - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      snap(steps, arr, [low, mid, high], [], [], `low=${low} mid=${mid} high=${high} → ${arr[mid]}`);

      if (arr[mid] === target) {
        snap(steps, arr, [], [], [mid], `Bulundu! index ${mid} → ${arr[mid]}`);
        return steps;
      } else if (arr[mid] < target) {
        snap(steps, arr, [], [mid], [], `${arr[mid]} < ${target} → sağa git`);
        low = mid + 1;
      } else {
        snap(steps, arr, [], [mid], [], `${arr[mid]} > ${target} → sola git`);
        high = mid - 1;
      }
    }

    snap(steps, arr, [], [], [], `${target} bulunamadı.`);
    return steps;
  }

  /* ============================================================
     JUMP SEARCH
     ============================================================ */
  function jumpSearch(inputArr) {
    const arr = [...inputArr].sort((a, b) => a - b);
    const n = arr.length;
    const steps = [];
    const target = arr[Math.floor(Math.random() * n)];
    const jumpSize = Math.floor(Math.sqrt(n));

    snap(steps, arr, [], [], [], `Sıralı dizi — Aranan: ${target}, Atlama: ${jumpSize}`);

    let prev = 0, curr = 0;
    while (curr < n && arr[Math.min(curr, n - 1)] < target) {
      snap(steps, arr, [Math.min(curr, n - 1)], [], [], `Atlama: index ${curr} → ${arr[Math.min(curr, n - 1)]}`);
      prev = curr;
      curr += jumpSize;
    }

    for (let i = prev; i < Math.min(curr + 1, n); i++) {
      snap(steps, arr, [i], [], [], `Doğrusal: index ${i} → ${arr[i]} == ${target}?`);
      if (arr[i] === target) {
        snap(steps, arr, [], [], [i], `Bulundu! index ${i}`);
        return steps;
      }
    }

    snap(steps, arr, [], [], [], `${target} bulunamadı.`);
    return steps;
  }

  /* ============================================================
     INTERPOLATION SEARCH
     ============================================================ */
  function interpolationSearch(inputArr) {
    const arr = [...inputArr].sort((a, b) => a - b);
    const n = arr.length;
    const steps = [];
    const target = arr[Math.floor(Math.random() * n)];

    snap(steps, arr, [], [], [], `Sıralı dizi — Aranan: ${target}`);

    let low = 0, high = n - 1;
    while (low <= high && target >= arr[low] && target <= arr[high]) {
      const pos = low + Math.floor(((target - arr[low]) * (high - low)) / (arr[high] - arr[low]));
      snap(steps, arr, [low, pos, high], [], [], `Tahmin: pos=${pos} → ${arr[pos]}`);

      if (arr[pos] === target) {
        snap(steps, arr, [], [], [pos], `Bulundu! index ${pos}`);
        return steps;
      } else if (arr[pos] < target) {
        snap(steps, arr, [], [pos], [], `${arr[pos]} < ${target} → sağa`);
        low = pos + 1;
      } else {
        snap(steps, arr, [], [pos], [], `${arr[pos]} > ${target} → sola`);
        high = pos - 1;
      }
    }

    snap(steps, arr, [], [], [], `${target} bulunamadı.`);
    return steps;
  }

  /* ============================================================
     EXPONENTIAL SEARCH
     ============================================================ */
  function exponentialSearch(inputArr) {
    const arr = [...inputArr].sort((a, b) => a - b);
    const n = arr.length;
    const steps = [];
    const target = arr[Math.floor(Math.random() * n)];

    snap(steps, arr, [], [], [], `Sıralı dizi — Aranan: ${target}`);

    if (arr[0] === target) {
      snap(steps, arr, [], [], [0], `Bulundu! index 0`);
      return steps;
    }

    let bound = 1;
    while (bound < n && arr[bound] <= target) {
      snap(steps, arr, [bound], [], [], `Üstel atlama: index ${bound} → ${arr[bound]}`);
      bound *= 2;
    }

    let low = Math.floor(bound / 2), high = Math.min(bound, n - 1);
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      snap(steps, arr, [low, mid, high], [], [], `Binary: mid=${mid} → ${arr[mid]}`);
      if (arr[mid] === target) {
        snap(steps, arr, [], [], [mid], `Bulundu! index ${mid}`);
        return steps;
      } else if (arr[mid] < target) { low = mid + 1; }
      else { high = mid - 1; }
    }

    snap(steps, arr, [], [], [], `${target} bulunamadı.`);
    return steps;
  }

  /* ============================================================
     GRAF YARDIMCI: Rastgele graf + snapshot oluşturucular
     ============================================================ */
  const NODE_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  /**
   * Sabit 6-düğümlü graf için komşuluk listesi üretir.
   * Topoloji (from/to) sonsuza dek sabittir — sadece ağırlıklar rastgeledir.
   * @param {number} _ignored — artık kullanılmıyor, her zaman 6 düğüm
   */
  function _generateGraph(_ignored) {
    const n = 6; // KESİNLİKLE 6 düğüm (A B C D E F)
    const adj = Array.from({ length: n }, () => []);

    // SABİT TOPOLOJI — bu liste asla değişmez
    const FIXED_EDGES = [
      [0, 1],  // A – B
      [0, 3],  // A – D
      [1, 2],  // B – C
      [1, 3],  // B – D
      [1, 4],  // B – E
      [2, 4],  // C – E
      [2, 5],  // C – F
      [3, 4],  // D – E
      [4, 5],  // E – F
    ];

    for (const [u, v] of FIXED_EDGES) {
      const w = Math.floor(Math.random() * 19) + 1; // sadece ağırlık rastgele
      adj[u].push({ to: v, w });
      adj[v].push({ to: u, w });
    }

    return adj;
  }

  /** Graf snapshot üretici */
  function _graphSnap(steps, adj, n, nodeColors, edgeColors, label) {
    const nodes = [];
    for (let i = 0; i < n; i++) {
      nodes.push({
        id: i,
        label: i < NODE_LABELS.length ? NODE_LABELS[i] : i.toString(),
        color: nodeColors[i] || 'default',
        value: nodeColors[i + '_val'] !== undefined ? nodeColors[i + '_val'] : null
      });
    }
    const edges = [];
    const seen = new Set();
    for (let u = 0; u < n; u++) {
      for (const e of adj[u]) {
        const key = Math.min(u, e.to) + '-' + Math.max(u, e.to);
        if (!seen.has(key)) {
          seen.add(key);
          edges.push({
            from: u,
            to: e.to,
            weight: e.w,
            color: edgeColors[key] || 'default'
          });
        }
      }
    }
    steps.push({ type: 'graph', nodes, edges, label });
  }

  /* ============================================================
     DIJKSTRA'S ALGORITHM
     ============================================================ */
  function dijkstra(inputArr, source = 0, target = 5) {
    const n = 6; // SABİT: 6 düğüm
    const adj = _generateGraph(n);
    const dist = new Array(n).fill(Infinity);
    const prev = new Array(n).fill(-1); // ← yolu geri izlemek için
    const visited = new Set();
    const steps = [];
    dist[source] = 0;

    const nc = {}, ec = {};
    nc[source + '_val'] = 0;
    _graphSnap(steps, adj, n, nc, ec, `Dijkstra: kaynak=${NODE_LABELS[source]} → hedef=${NODE_LABELS[target]}`);

    for (let count = 0; count < n; count++) {
      let u = -1, minD = Infinity;
      for (let v = 0; v < n; v++) {
        if (!visited.has(v) && dist[v] < minD) { minD = dist[v]; u = v; }
      }
      if (u === -1) break;

      visited.add(u);
      const nc2 = {};
      for (let i = 0; i < n; i++) {
        nc2[i] = visited.has(i) ? 'visited' : 'default';
        nc2[i + '_val'] = dist[i] === Infinity ? null : dist[i];
      }
      nc2[u] = 'current';
      _graphSnap(steps, adj, n, nc2, { ...ec }, `Düğüm ${NODE_LABELS[u]} seçildi (d=${dist[u]})`);

      for (const edge of adj[u]) {
        if (!visited.has(edge.to)) {
          const eKey = Math.min(u, edge.to) + '-' + Math.max(u, edge.to);
          const nc3 = { ...nc2 };
          const ec3 = { ...ec };
          ec3[eKey] = 'active';
          nc3[edge.to] = 'active';
          _graphSnap(steps, adj, n, nc3, ec3, `Kenar ${NODE_LABELS[u]}→${NODE_LABELS[edge.to]} (w=${edge.w})`);

          if (dist[u] + edge.w < dist[edge.to]) {
            dist[edge.to] = dist[u] + edge.w;
            prev[edge.to] = u; // ← önceki düğümü kaydet
            nc3[edge.to + '_val'] = dist[edge.to];
            ec3[eKey] = 'mst';
            _graphSnap(steps, adj, n, nc3, ec3, `Güncelle: d(${NODE_LABELS[edge.to]})=${dist[edge.to]}`);
            ec[eKey] = 'mst';
          }
        }
      }
    }

    // En kısa yolu geri iz — kenarları 'path' olarak işaretle
    const ncF = {};
    const ecF = { ...ec };
    for (let i = 0; i < n; i++) { ncF[i] = 'visited'; ncF[i + '_val'] = dist[i] === Infinity ? null : dist[i]; }
    ncF[source] = 'current';
    if (dist[target] < Infinity) {
      let cur = target;
      while (cur !== -1 && prev[cur] !== -1) {
        const eKey = Math.min(cur, prev[cur]) + '-' + Math.max(cur, prev[cur]);
        ecF[eKey] = 'path'; // ← kırmızı parlayan kenara dönüşür
        ncF[cur] = 'path';
        cur = prev[cur];
      }
      ncF[source] = 'path';
    }
    const cost = dist[target] === Infinity ? '∞' : dist[target];
    _graphSnap(steps, adj, n, ncF, ecF, `Dijkstra tamamlandı! ${NODE_LABELS[source]}→${NODE_LABELS[target]}: ${cost}`);
    return steps;
  }

  /* ============================================================
     BELLMAN-FORD ALGORITHM
     ============================================================ */
  function bellmanFord(inputArr, source = 0, target = 5) {
    const n = 6; // SABİT: 6 düğüm
    const adj = _generateGraph(n);
    const dist = new Array(n).fill(Infinity);
    const prev = new Array(n).fill(-1);
    const steps = [];
    dist[source] = 0;

    const edges = [];
    const seen = new Set();
    for (let u = 0; u < n; u++) {
      for (const e of adj[u]) {
        const key = Math.min(u, e.to) + '-' + Math.max(u, e.to);
        if (!seen.has(key)) { seen.add(key); edges.push({ from: u, to: e.to, w: e.w }); }
      }
    }

    const ec = {};
    _graphSnap(steps, adj, n, { [source + '_val']: 0 }, ec, `Bellman-Ford: kaynak=${NODE_LABELS[source]} → hedef=${NODE_LABELS[target]}`);

    for (let iter = 0; iter < n - 1; iter++) {
      let updated = false;
      for (const e of edges) {
        if (dist[e.from] < Infinity) {
          const eKey = Math.min(e.from, e.to) + '-' + Math.max(e.from, e.to);
          const nc = {};
          for (let i = 0; i < n; i++) { nc[i + '_val'] = dist[i] === Infinity ? null : dist[i]; }
          nc[e.from] = 'visited'; nc[e.to] = 'active';
          _graphSnap(steps, adj, n, nc, { ...ec, [eKey]: 'active' }, `Kenar ${NODE_LABELS[e.from]}→${NODE_LABELS[e.to]} (w=${e.w})`);

          if (dist[e.from] + e.w < dist[e.to]) {
            dist[e.to] = dist[e.from] + e.w;
          prev[e.to] = e.from;
            ec[eKey] = 'mst';
            nc[e.to + '_val'] = dist[e.to];
            _graphSnap(steps, adj, n, nc, ec, `Güncelle: d(${NODE_LABELS[e.to]})=${dist[e.to]}`);
            updated = true;
          }
        }
      }
      if (!updated) break;
    }

    const ncF = {};
    const ecF = { ...ec };
    for (let i = 0; i < n; i++) { ncF[i] = 'visited'; ncF[i + '_val'] = dist[i] === Infinity ? null : dist[i]; }
    ncF[source] = 'current';
    if (dist[target] < Infinity) {
      let cur = target;
      while (cur !== -1 && prev[cur] !== -1) {
        const eKey = Math.min(cur, prev[cur]) + '-' + Math.max(cur, prev[cur]);
        ecF[eKey] = 'path';
        ncF[cur] = 'path';
        cur = prev[cur];
      }
      ncF[source] = 'path';
    }
    const bfCost = dist[target] === Infinity ? '∞' : dist[target];
    _graphSnap(steps, adj, n, ncF, ecF, `Bellman-Ford tamamlandı! ${NODE_LABELS[source]}→${NODE_LABELS[target]}: ${bfCost}`);
    return steps;
  }

  /* ============================================================
     FLOYD-WARSHALL ALGORITHM (Grid mode — mesafe matrisi)
     ============================================================ */
  function floydWarshall(inputArr) {
    const n = 6; // SABİT: 6 düğüm
    const dist = Array.from({ length: n }, () => new Array(n).fill(999));
    const adj = _generateGraph(n);
    const steps = [];

    for (let i = 0; i < n; i++) dist[i][i] = 0;
    for (let u = 0; u < n; u++) {
      for (const e of adj[u]) dist[u][e.to] = Math.min(dist[u][e.to], e.w);
    }

    steps.push({ type: 'grid', grid: dist.map(r => [...r]), rows: n, cols: n, highlights: [], label: `Floyd-Warshall: ${n}×${n} mesafe matrisi` });

    for (let k = 0; k < n; k++) {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (dist[i][k] + dist[k][j] < dist[i][j]) {
            const hl = [
              { row: i, col: k, color: 'comparing' },
              { row: k, col: j, color: 'comparing' },
              { row: i, col: j, color: 'active' }
            ];
            dist[i][j] = dist[i][k] + dist[k][j];
            steps.push({ type: 'grid', grid: dist.map(r => [...r]), rows: n, cols: n, highlights: hl, label: `k=${NODE_LABELS[k]}: dist[${NODE_LABELS[i]}][${NODE_LABELS[j]}]=${dist[i][j]}` });
          }
        }
      }
    }

    const allHl = [];
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) allHl.push({ row: r, col: c, color: 'placed' });
    steps.push({ type: 'grid', grid: dist.map(r => [...r]), rows: n, cols: n, highlights: allHl, label: 'Floyd-Warshall tamamlandı!' });
    return steps;
  }

  /* ============================================================
     A* SEARCH ALGORITHM
     ============================================================ */
  function aStar(inputArr, source = 0, target = 5) {
    const n = 6; // SABİT: 6 düğüm
    const adj = _generateGraph(n);
    const goal = (target >= 0 && target < n && target !== source) ? target : n - 1;
    const heuristic = Array.from({ length: n }, (_, i) => Math.abs(goal - i) * 3);
    const gScore = new Array(n).fill(Infinity);
    const fScore = new Array(n).fill(Infinity);
    const visited = new Set();
    const steps = [];
    const ec = {};

    const prev = new Array(n).fill(-1);
    gScore[source] = 0;
    fScore[source] = heuristic[source];
    const openSet = [source];

    _graphSnap(steps, adj, n, { [source + '_val']: fScore[source] }, ec, `A*: kaynak=${NODE_LABELS[source]} → hedef=${NODE_LABELS[goal]}`);

    while (openSet.length > 0) {
      let minF = Infinity, current = -1, minIdx = -1;
      for (let i = 0; i < openSet.length; i++) {
        if (fScore[openSet[i]] < minF) { minF = fScore[openSet[i]]; current = openSet[i]; minIdx = i; }
      }
      if (current === -1) break;
      openSet.splice(minIdx, 1);

      if (current === goal) {
        visited.add(current);
        const nc = {};
        for (let i = 0; i < n; i++) { nc[i] = visited.has(i) ? 'visited' : 'default'; nc[i + '_val'] = fScore[i] === Infinity ? null : fScore[i]; }
        nc[goal] = 'path';
        _graphSnap(steps, adj, n, nc, ec, `Hedef bulundu! ${NODE_LABELS[goal]}`);
        return steps;
      }

      visited.add(current);
      const nc = {};
      for (let i = 0; i < n; i++) { nc[i] = visited.has(i) ? 'visited' : 'default'; nc[i + '_val'] = fScore[i] === Infinity ? null : fScore[i]; }
      nc[current] = 'current';
      _graphSnap(steps, adj, n, nc, ec, `Düğüm ${NODE_LABELS[current]} (f=${fScore[current]})`);

      for (const edge of adj[current]) {
        const tentG = gScore[current] + edge.w;
        if (tentG < gScore[edge.to]) {
          gScore[edge.to] = tentG;
          fScore[edge.to] = tentG + heuristic[edge.to];
          prev[edge.to] = current;
          const eKey = Math.min(current, edge.to) + '-' + Math.max(current, edge.to);
          ec[eKey] = 'active';
          const nc2 = { ...nc };
          nc2[edge.to] = 'active';
          nc2[edge.to + '_val'] = fScore[edge.to];
          _graphSnap(steps, adj, n, nc2, { ...ec }, `${NODE_LABELS[current]}→${NODE_LABELS[edge.to]}: f=${fScore[edge.to]}`);
          if (!openSet.includes(edge.to) && !visited.has(edge.to)) openSet.push(edge.to);
        }
      }
    }

    const ncF = {};
    for (let i = 0; i < n; i++) { ncF[i] = visited.has(i) ? 'visited' : 'default'; }
    _graphSnap(steps, adj, n, ncF, ec, 'A* tamamlandı');
    return steps;
  }

  /* ============================================================
     BFS SHORTEST PATH (Unweighted)
     ============================================================ */
  function bfsShortestPath(inputArr, source = 0, target = 5) {
    const n = 6; // SABİT: 6 düğüm
    const adj = _generateGraph(n);
    const dist = new Array(n).fill(-1);
    const prev = new Array(n).fill(-1);
    const visited = new Set();
    const steps = [];
    const ec = {};
    dist[source] = 0;
    visited.add(source);

    _graphSnap(steps, adj, n, { [source]: 'current', [source + '_val']: 0 }, ec, `BFS En Kısa Yol: kaynak=${NODE_LABELS[source]} → hedef=${NODE_LABELS[target]}`);

    const queue = [source];
    while (queue.length > 0) {
      const u = queue.shift();
      const nc = {};
      for (let i = 0; i < n; i++) { nc[i] = visited.has(i) ? 'visited' : 'default'; nc[i + '_val'] = dist[i] >= 0 ? dist[i] : null; }
      nc[u] = 'current';
      _graphSnap(steps, adj, n, nc, { ...ec }, `Ziyaret: ${NODE_LABELS[u]} (d=${dist[u]})`);

      for (const edge of adj[u]) {
        if (dist[edge.to] === -1) {
          dist[edge.to] = dist[u] + 1;
          visited.add(edge.to);
          queue.push(edge.to);
          const eKey = Math.min(u, edge.to) + '-' + Math.max(u, edge.to);
          ec[eKey] = 'mst';
          const nc2 = { ...nc };
          nc2[edge.to] = 'active';
          nc2[edge.to + '_val'] = dist[edge.to];
          _graphSnap(steps, adj, n, nc2, { ...ec }, `Keşfet: ${NODE_LABELS[edge.to]} (d=${dist[edge.to]})`);
        }
      }
    }

    const ncF = {};
    const ecF = { ...ec };
    for (let i = 0; i < n; i++) { ncF[i] = 'visited'; ncF[i + '_val'] = dist[i] >= 0 ? dist[i] : null; }
    if (dist[target] >= 0) {
      let cur = target;
      while (cur !== -1 && prev[cur] !== -1) {
        const eKey = Math.min(cur, prev[cur]) + '-' + Math.max(cur, prev[cur]);
        ecF[eKey] = 'path';
        ncF[cur] = 'path';
        cur = prev[cur];
      }
      ncF[source] = 'path';
    }
    const bfsCost = dist[target] >= 0 ? dist[target] : '∞';
    _graphSnap(steps, adj, n, ncF, ecF, `BFS tamamlandı! ${NODE_LABELS[source]}→${NODE_LABELS[target]}: ${bfsCost}`);
    return steps;
  }

  /* ============================================================
     DFS (Depth-First Search)
     ============================================================ */
  function dfs(inputArr, source = 0, target = -1) {
    const n = 6; // SABİT: 6 düğüm
    const adj = _generateGraph(n);
    const visited = new Set();
    const steps = [];
    const ec = {};
    let order = 1;
    const orderMap = {};

    _graphSnap(steps, adj, n, {}, ec, `DFS: kaynak=${NODE_LABELS[source]}`);

    function dfsHelper(u) {
      visited.add(u);
      orderMap[u] = order++;
      const nc = {};
      for (let i = 0; i < n; i++) { nc[i] = visited.has(i) ? 'visited' : 'default'; nc[i + '_val'] = orderMap[i] || null; }
      nc[u] = 'current';
      _graphSnap(steps, adj, n, nc, { ...ec }, `Ziyaret: ${NODE_LABELS[u]} (sıra=${orderMap[u]})`);

      const neighbors = [...new Set(adj[u].map(e => e.to))].sort((a, b) => a - b);
      for (const v of neighbors) {
        if (!visited.has(v)) {
          const eKey = Math.min(u, v) + '-' + Math.max(u, v);
          ec[eKey] = 'mst';
          const nc2 = { ...nc };
          nc2[v] = 'active';
          _graphSnap(steps, adj, n, nc2, { ...ec }, `Kenar: ${NODE_LABELS[u]}→${NODE_LABELS[v]}`);
          dfsHelper(v);
        }
      }
    }

    dfsHelper(source);
    const ncF = {};
    for (let i = 0; i < n; i++) { ncF[i] = 'visited'; ncF[i + '_val'] = orderMap[i] || null; }
    _graphSnap(steps, adj, n, ncF, ec, 'DFS tamamlandı!');
    return steps;
  }

  /* ============================================================
     BFS (Breadth-First Search)
     ============================================================ */
  function bfs(inputArr, source = 0, target = -1) {
    const n = 6; // SABİT: 6 düğüm
    const adj = _generateGraph(n);
    const visited = new Set();
    const steps = [];
    const ec = {};
    let order = 1;
    const orderMap = {};

    visited.add(source);
    orderMap[source] = order++;
    _graphSnap(steps, adj, n, { [source]: 'current', [source + '_val']: 1 }, ec, `BFS: kaynak=${NODE_LABELS[source]}`);

    const queue = [source];
    while (queue.length > 0) {
      const u = queue.shift();
      const nc = {};
      for (let i = 0; i < n; i++) { nc[i] = visited.has(i) ? 'visited' : 'default'; nc[i + '_val'] = orderMap[i] || null; }
      nc[u] = 'current';
      _graphSnap(steps, adj, n, nc, { ...ec }, `İşle: ${NODE_LABELS[u]}`);

      const neighbors = [...new Set(adj[u].map(e => e.to))].sort((a, b) => a - b);
      for (const v of neighbors) {
        if (!visited.has(v)) {
          visited.add(v);
          orderMap[v] = order++;
          queue.push(v);
          const eKey = Math.min(u, v) + '-' + Math.max(u, v);
          ec[eKey] = 'mst';
          const nc2 = { ...nc };
          nc2[v] = 'active';
          nc2[v + '_val'] = orderMap[v];
          _graphSnap(steps, adj, n, nc2, { ...ec }, `Keşfet: ${NODE_LABELS[v]} (sıra=${orderMap[v]})`);
        }
      }
    }

    const ncF = {};
    for (let i = 0; i < n; i++) { ncF[i] = 'visited'; ncF[i + '_val'] = orderMap[i] || null; }
    _graphSnap(steps, adj, n, ncF, ec, 'BFS tamamlandı!');
    return steps;
  }


  /* ============================================================
     FIBONACCI (DP)
     ============================================================ */
  function fibonacci(inputArr) {
    const n = Math.min(inputArr.length, 30);
    const fib = new Array(n).fill(0);
    const steps = [];
    const sorted = [];

    fib[0] = 1; if (n > 1) fib[1] = 1;
    snap(steps, [...fib], [], [], [], `Fibonacci DP: n=${n}`);

    for (let i = 2; i < n; i++) {
      snap(steps, [...fib], [i - 1, i - 2], [], [...sorted], `F(${i}) = F(${i - 1}) + F(${i - 2})`);
      fib[i] = fib[i - 1] + fib[i - 2];
      sorted.push(i - 2);
      snap(steps, [...fib], [], [i], [...sorted], `F(${i}) = ${fib[i]}`);
    }

    snap(steps, [...fib], [], [], Array.from({ length: n }, (_, i) => i), 'Fibonacci tamamlandı!');
    return steps;
  }

  /* ============================================================
     KNAPSACK PROBLEM (0/1 DP)
     ============================================================ */
  function knapsack(inputArr) {
    const itemCount = Math.min(inputArr.length, 10);
    const weights = Array.from({ length: itemCount }, () => Math.floor(Math.random() * 10) + 1);
    const values = Array.from({ length: itemCount }, () => Math.floor(Math.random() * 50) + 10);
    const capacity = Math.floor(weights.reduce((a, b) => a + b, 0) * 0.6);
    const steps = [];

    const dp = new Array(capacity + 1).fill(0);
    snap(steps, [...dp], [], [], [], `Knapsack: ${itemCount} eşya, kapasite=${capacity}`);

    for (let i = 0; i < itemCount; i++) {
      for (let w = capacity; w >= weights[i]; w--) {
        snap(steps, [...dp], [w, w - weights[i]], [], [], `Eşya ${i} (ağırlık=${weights[i]}, değer=${values[i]}): w=${w}`);
        if (dp[w - weights[i]] + values[i] > dp[w]) {
          dp[w] = dp[w - weights[i]] + values[i];
          snap(steps, [...dp], [], [w], [], `dp[${w}] = ${dp[w]}`);
        }
      }
    }

    snap(steps, [...dp], [], [], Array.from({ length: capacity + 1 }, (_, i) => i), `Knapsack tamamlandı! Max=${dp[capacity]}`);
    return steps;
  }

  /* ============================================================
     LONGEST COMMON SUBSEQUENCE (LCS)
     ============================================================ */
  function lcs(inputArr) {
    const n = Math.min(inputArr.length, 10);
    const a = Array.from({ length: n }, () => Math.floor(Math.random() * 20) + 1);
    const b = Array.from({ length: n }, () => Math.floor(Math.random() * 20) + 1);
    const dp = new Array((n + 1) * (n + 1)).fill(0);
    const steps = [];
    const cols = n + 1;

    snap(steps, [...dp], [], [], [], `LCS: diziler uzunluk=${n}`);

    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= n; j++) {
        const idx = i * cols + j;
        snap(steps, [...dp], [idx], [], [], `Karşılaştır: A[${i - 1}]=${a[i - 1]} vs B[${j - 1}]=${b[j - 1]}`);
        if (a[i - 1] === b[j - 1]) {
          dp[idx] = dp[(i - 1) * cols + (j - 1)] + 1;
        } else {
          dp[idx] = Math.max(dp[(i - 1) * cols + j], dp[i * cols + (j - 1)]);
        }
        snap(steps, [...dp], [], [idx], [], `dp[${i}][${j}] = ${dp[idx]}`);
      }
    }

    snap(steps, [...dp], [], [], Array.from({ length: dp.length }, (_, i) => i), `LCS tamamlandı! Uzunluk=${dp[n * cols + n]}`);
    return steps;
  }

  /* ============================================================
     MATRIX CHAIN MULTIPLICATION
     ============================================================ */
  function matrixChain(inputArr) {
    const n = Math.min(inputArr.length, 8);
    const dims = Array.from({ length: n + 1 }, () => Math.floor(Math.random() * 20) + 2);
    const dp = new Array(n * n).fill(0);
    const steps = [];

    snap(steps, [...dp], [], [], [], `Matris Zinciri: ${n} matris`);

    for (let len = 2; len <= n; len++) {
      for (let i = 0; i <= n - len; i++) {
        const j = i + len - 1;
        const idx = i * n + j;
        dp[idx] = Infinity;
        for (let k = i; k < j; k++) {
          const cost = dp[i * n + k] + dp[(k + 1) * n + j] + dims[i] * dims[k + 1] * dims[j + 1];
          snap(steps, dp.map(v => v === Infinity ? 0 : v), [i * n + k, (k + 1) * n + j], [], [], `M${i}..${j}: k=${k}, maliyet=${cost}`);
          if (cost < dp[idx]) {
            dp[idx] = cost;
          }
        }
        snap(steps, dp.map(v => v === Infinity ? 0 : v), [], [idx], [], `dp[${i}][${j}] = ${dp[idx]}`);
      }
    }

    snap(steps, dp.map(v => v === Infinity ? 0 : v), [], [], Array.from({ length: n * n }, (_, i) => i), `Matris Zinciri tamamlandı! Min=${dp[n - 1]}`);
    return steps;
  }

  /* ============================================================
     DIVIDE & CONQUER — MERGE SORT (görselleştirme)
     ============================================================ */
  function dcMergeSort(inputArr) {
    return mergeSort(inputArr);
  }

  /* ============================================================
     DIVIDE & CONQUER — QUICK SORT (görselleştirme)
     ============================================================ */
  function dcQuickSort(inputArr) {
    return quickSort(inputArr);
  }

  /* ============================================================
     STRASSEN'S MATRIX MULTIPLICATION (Simülasyon)
     ============================================================ */
  function strassenMatrix(inputArr) {
    const n = Math.min(inputArr.length, 16);
    const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 50) + 1);
    const steps = [];
    const sorted = [];

    snap(steps, [...arr], [], [], [], `Strassen Çarpma: ${n} eleman`);

    function strassenHelper(start, end) {
      if (end - start <= 1) return;
      const mid = Math.floor((start + end) / 2);
      snap(steps, [...arr], [start, mid, end - 1], [], [...sorted], `Böl: [${start}..${mid}] ve [${mid}..${end}]`);
      strassenHelper(start, mid);
      strassenHelper(mid, end);

      for (let i = start; i < end; i++) {
        arr[i] = arr[i] + Math.floor(Math.random() * 5);
        snap(steps, [...arr], [], [i], [...sorted], `Birleştir: pos ${i} → ${arr[i]}`);
      }
      for (let i = start; i < end; i++) sorted.push(i);
    }

    strassenHelper(0, n);
    snap(steps, [...arr], [], [], Array.from({ length: n }, (_, i) => i), 'Strassen tamamlandı!');
    return steps;
  }

  /* ============================================================
     CLOSEST PAIR OF POINTS
     ============================================================ */
  function closestPair(inputArr) {
    const arr = [...inputArr].sort((a, b) => a - b);
    const n = arr.length;
    const steps = [];
    const sorted = [];

    snap(steps, [...arr], [], [], [], `En Yakın Çift: ${n} nokta`);

    let minDist = Infinity, bestI = -1, bestJ = -1;

    function cpHelper(left, right) {
      if (right - left < 2) return;
      if (right - left === 2) {
        snap(steps, [...arr], [left, left + 1], [], [...sorted], `Karşılaştır: ${arr[left]} vs ${arr[left + 1]}`);
        const d = Math.abs(arr[left + 1] - arr[left]);
        if (d < minDist) { minDist = d; bestI = left; bestJ = left + 1; }
        return;
      }
      const mid = Math.floor((left + right) / 2);
      snap(steps, [...arr], [left, mid, right - 1], [], [...sorted], `Böl: [${left}..${mid}] [${mid}..${right}]`);
      cpHelper(left, mid);
      cpHelper(mid, right);

      for (let i = mid - 1; i >= left; i--) {
        for (let j = mid; j < right && arr[j] - arr[i] < minDist; j++) {
          snap(steps, [...arr], [i, j], [], [...sorted], `Şerit: fark=${Math.abs(arr[j] - arr[i])}`);
          const d = Math.abs(arr[j] - arr[i]);
          if (d < minDist) { minDist = d; bestI = i; bestJ = j; }
        }
      }
    }

    cpHelper(0, n);
    if (bestI >= 0) sorted.push(bestI, bestJ);
    snap(steps, [...arr], [], [], Array.from({ length: n }, (_, i) => i), `En yakın çift: ${arr[bestI]},${arr[bestJ]} → fark=${minDist}`);
    return steps;
  }

  /* ============================================================
     KRUSKAL'S ALGORITHM (MST) — Graf modu
     ============================================================ */
  function kruskal(inputArr, source = 0, target = -1) {
    const n = 6; // SABİT: 6 düğüm
    const adj = _generateGraph(n);
    const steps = [];
    const ec = {};

    const edges = [];
    const seen = new Set();
    for (let u = 0; u < n; u++) {
      for (const e of adj[u]) {
        const key = Math.min(u, e.to) + '-' + Math.max(u, e.to);
        if (!seen.has(key)) { seen.add(key); edges.push({ from: u, to: e.to, w: e.w, key }); }
      }
    }
    edges.sort((a, b) => a.w - b.w);

    const parent = Array.from({ length: n }, (_, i) => i);
    function find(x) { return parent[x] === x ? x : (parent[x] = find(parent[x])); }
    const mstCount = { val: 0 };

    _graphSnap(steps, adj, n, {}, ec, `Kruskal MST: ${n} düğüm, ${edges.length} kenar`);

    for (const e of edges) {
      const nc = {};
      nc[e.from] = 'active';
      nc[e.to] = 'active';
      _graphSnap(steps, adj, n, nc, { ...ec, [e.key]: 'active' }, `Kenar: ${NODE_LABELS[e.from]}-${NODE_LABELS[e.to]} (w=${e.w})`);

      const px = find(e.from), py = find(e.to);
      if (px !== py) {
        parent[px] = py;
        ec[e.key] = 'mst';
        mstCount.val++;
        const ncA = {};
        ncA[e.from] = 'visited'; ncA[e.to] = 'visited';
        _graphSnap(steps, adj, n, ncA, { ...ec }, `Kabul: ${NODE_LABELS[e.from]}-${NODE_LABELS[e.to]} (MST kenar #${mstCount.val})`);
      } else {
        _graphSnap(steps, adj, n, {}, { ...ec, [e.key]: 'path' }, `Red: ${NODE_LABELS[e.from]}-${NODE_LABELS[e.to]} (döngü)`);
      }
      if (mstCount.val === n - 1) break;
    }

    const ncF = {};
    for (let i = 0; i < n; i++) ncF[i] = 'visited';
    _graphSnap(steps, adj, n, ncF, ec, 'Kruskal MST tamamlandı!');
    return steps;
  }

  /* ============================================================
     PRIM'S ALGORITHM (MST) — Graf modu
     ============================================================ */
  function prim(inputArr, source = 0, target = -1) {
    const n = 6; // SABİT: 6 düğüm
    const adj = _generateGraph(n);
    const inMST = new Set();
    const key = new Array(n).fill(Infinity);
    const steps = [];
    const ec = {};
    key[source] = 0;

    _graphSnap(steps, adj, n, { [source]: 'current', [source + '_val']: 0 }, ec, `Prim MST: kaynak=${NODE_LABELS[source]}`);

    for (let count = 0; count < n; count++) {
      let u = -1, minK = Infinity;
      for (let v = 0; v < n; v++) {
        if (!inMST.has(v) && key[v] < minK) { minK = key[v]; u = v; }
      }

      if (u === -1) break;

      inMST.add(u);
      const nc = {};
      for (let i = 0; i < n; i++) {
        nc[i] = inMST.has(i) ? 'visited' : 'default';
        nc[i + '_val'] = key[i] === Infinity ? null : key[i];
      }
      nc[u] = 'current';
      _graphSnap(steps, adj, n, nc, { ...ec }, `Düğüm ${NODE_LABELS[u]} MST'ye eklendi (key=${key[u]})`);

      for (const e of adj[u]) {
        if (!inMST.has(e.to) && e.w < key[e.to]) {
          key[e.to] = e.w;
          const eKey = Math.min(u, e.to) + '-' + Math.max(u, e.to);
          ec[eKey] = 'mst';
          const nc2 = { ...nc };
          nc2[e.to] = 'active';
          nc2[e.to + '_val'] = key[e.to];
          _graphSnap(steps, adj, n, nc2, { ...ec }, `Güncelle: key[${NODE_LABELS[e.to]}]=${e.w}`);
        }
      }
    }

    const ncF = {};
    for (let i = 0; i < n; i++) { ncF[i] = 'visited'; ncF[i + '_val'] = key[i] === Infinity ? null : key[i]; }
    _graphSnap(steps, adj, n, ncF, ec, 'Prim MST tamamlandı!');
    return steps;
  }

  /* ============================================================
     HUFFMAN CODING (Bar chart)
     ============================================================ */
  function huffman(inputArr) {
    const arr = [...inputArr];
    const n = arr.length;
    const steps = [];
    const sorted = [];
    snap(steps, [...arr], [], [], [], `Huffman: ${n} frekans`);
    const freqs = arr.map((v, i) => ({ val: v, idx: i }));
    freqs.sort((a, b) => a.val - b.val);
    while (freqs.length > 1) {
      const a = freqs.shift();
      const b = freqs.shift();
      snap(steps, arr, [a.idx, b.idx], [], [...sorted], `Birleştir: ${a.val} + ${b.val}`);
      const merged = a.val + b.val;
      const newIdx = arr.length;
      arr.push(merged);
      sorted.push(a.idx, b.idx);
      freqs.push({ val: merged, idx: newIdx });
      freqs.sort((a, b) => a.val - b.val);
      snap(steps, [...arr], [], [newIdx], [...sorted], `Yeni düğüm: ${merged}`);
    }
    snap(steps, [...arr], [], [], Array.from({ length: arr.length }, (_, i) => i), 'Huffman tamamlandı!');
    return steps;
  }

  /* ============================================================
     ACTIVITY SELECTION PROBLEM (Bar chart)
     ============================================================ */
  function activitySelection(inputArr) {
    const n = Math.min(inputArr.length, 20);
    const activities = Array.from({ length: n }, () => {
      const s = Math.floor(Math.random() * 20);
      return { start: s, end: s + Math.floor(Math.random() * 10) + 1 };
    });
    activities.sort((a, b) => a.end - b.end);
    const endTimes = activities.map(a => a.end);
    const steps = [];
    const selected = [];
    snap(steps, endTimes, [], [], [], `Etkinlik Seçimi: ${n} etkinlik`);
    let lastEnd = -1;
    for (let i = 0; i < n; i++) {
      snap(steps, endTimes, [i], [], [...selected], `Etkinlik ${i}: [${activities[i].start}, ${activities[i].end})`);
      if (activities[i].start >= lastEnd) {
        selected.push(i);
        lastEnd = activities[i].end;
        snap(steps, endTimes, [], [i], [...selected], `Kabul: [${activities[i].start}, ${activities[i].end})`);
      } else {
        snap(steps, endTimes, [], [], [...selected], 'Red: çakışma');
      }
    }
    snap(steps, endTimes, [], [], [...selected], `Seçilen: ${selected.length} etkinlik`);
    return steps;
  }

  /* ============================================================
     N-QUEENS PROBLEM — Grid modu
     ============================================================ */
  function nQueens(inputArr) {
    const n = Math.min(Math.max(inputArr.length, 4), 8);
    const board = Array.from({ length: n }, () => new Array(n).fill(0));
    const steps = [];
    steps.push({ type: 'grid', grid: board.map(r => [...r]), rows: n, cols: n, highlights: [], label: `N-Queens: ${n}×${n} tahta` });

    function isSafe(row, col) {
      for (let i = 0; i < row; i++) if (board[i][col] === 'Q') return false;
      for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) if (board[i][j] === 'Q') return false;
      for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) if (board[i][j] === 'Q') return false;
      return true;
    }

    function solve(row) {
      if (row === n) return true;
      for (let col = 0; col < n; col++) {
        const hl = [{ row, col, color: 'active' }];
        steps.push({ type: 'grid', grid: board.map(r => [...r]), rows: n, cols: n, highlights: hl, label: `Dene: satır=${row}, sütun=${col}` });
        if (isSafe(row, col)) {
          board[row][col] = 'Q';
          const hl2 = [{ row, col, color: 'placed' }];
          steps.push({ type: 'grid', grid: board.map(r => [...r]), rows: n, cols: n, highlights: hl2, label: `Vezir yerleştirildi: (${row}, ${col})` });
          if (solve(row + 1)) return true;
          board[row][col] = 0;
          const hl3 = [{ row, col, color: 'conflict' }];
          steps.push({ type: 'grid', grid: board.map(r => [...r]), rows: n, cols: n, highlights: hl3, label: `Geri al: (${row}, ${col})` });
        }
      }
      return false;
    }

    if (solve(0)) {
      const allHl = [];
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (board[r][c] === 'Q') allHl.push({ row: r, col: c, color: 'placed' });
      steps.push({ type: 'grid', grid: board.map(r => [...r]), rows: n, cols: n, highlights: allHl, label: `${n}-Queens çözüldü!` });
    } else {
      steps.push({ type: 'grid', grid: board.map(r => [...r]), rows: n, cols: n, highlights: [], label: 'Çözüm bulunamadı' });
    }
    return steps;
  }

  /* ============================================================
     SUDOKU SOLVER (4x4) — Grid modu
     ============================================================ */
  function sudokuSolver(inputArr) {
    const grid = [
      [1, 0, 0, 4],
      [0, 0, 1, 0],
      [0, 1, 0, 0],
      [4, 0, 0, 2]
    ];
    const steps = [];
    const fixed = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (grid[r][c] !== 0) fixed.push({ row: r, col: c, color: 'placed' });
    steps.push({ type: 'grid', grid: grid.map(r => [...r]), rows: 4, cols: 4, highlights: [...fixed], label: 'Sudoku 4×4: başlangıç' });

    function isValid(row, col, num) {
      for (let c2 = 0; c2 < 4; c2++) if (grid[row][c2] === num) return false;
      for (let r2 = 0; r2 < 4; r2++) if (grid[r2][col] === num) return false;
      const br = Math.floor(row / 2) * 2, bc = Math.floor(col / 2) * 2;
      for (let r2 = br; r2 < br + 2; r2++) for (let c2 = bc; c2 < bc + 2; c2++) if (grid[r2][c2] === num) return false;
      return true;
    }

    function solve() {
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (grid[r][c] === 0) {
            for (let num = 1; num <= 4; num++) {
              const hl = [...fixed, { row: r, col: c, color: 'active' }];
              steps.push({ type: 'grid', grid: grid.map(row => [...row]), rows: 4, cols: 4, highlights: hl, label: `Dene: (${r},${c}) = ${num}` });
              if (isValid(r, c, num)) {
                grid[r][c] = num;
                const hl2 = [...fixed, { row: r, col: c, color: 'comparing' }];
                steps.push({ type: 'grid', grid: grid.map(row => [...row]), rows: 4, cols: 4, highlights: hl2, label: `Yerleştir: (${r},${c}) = ${num}` });
                if (solve()) return true;
                grid[r][c] = 0;
                const hl3 = [...fixed, { row: r, col: c, color: 'conflict' }];
                steps.push({ type: 'grid', grid: grid.map(row => [...row]), rows: 4, cols: 4, highlights: hl3, label: `Geri al: (${r},${c})` });
              }
            }
            return false;
          }
        }
      }
      return true;
    }

    if (solve()) {
      const allHl = [];
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) allHl.push({ row: r, col: c, color: 'placed' });
      steps.push({ type: 'grid', grid: grid.map(r => [...r]), rows: 4, cols: 4, highlights: allHl, label: 'Sudoku çözüldü!' });
    }
    return steps;
  }

  /* ============================================================
     HAMILTONIAN CYCLE — Graf modu
     ============================================================ */
  function hamiltonianCycle(inputArr, source = 0, target = -1) {
    const n = 6; // SABİT: 6 düğüm
    const adj = _generateGraph(n);
    const path = [source];
    const visited = new Set([source]);
    const steps = [];
    const ec = {};

    _graphSnap(steps, adj, n, { [source]: 'current' }, ec, `Hamilton: ${n} düğüm, başlangıç=${NODE_LABELS[source]}`);

    function solve(pos) {
      if (pos === n) {
        return adj[path[pos - 1]].some(e => e.to === path[0]);
      }
      const neighbors = [...new Set(adj[path[pos - 1]].map(e => e.to))].sort((a, b) => a - b);
      for (const v of neighbors) {
        if (!visited.has(v)) {
          visited.add(v);
          path.push(v);
          const nc = {};
          for (let i = 0; i < n; i++) nc[i] = visited.has(i) ? 'visited' : 'default';
          nc[v] = 'current';
          const eKey = Math.min(path[pos - 1], v) + '-' + Math.max(path[pos - 1], v);
          ec[eKey] = 'mst';
          _graphSnap(steps, adj, n, nc, { ...ec }, `Dene: ${NODE_LABELS[path[pos - 1]]}→${NODE_LABELS[v]}`);
          if (solve(pos + 1)) return true;
          visited.delete(v);
          path.pop();
          delete ec[eKey];
          const nc2 = {};
          for (let i = 0; i < n; i++) nc2[i] = visited.has(i) ? 'visited' : 'default';
          _graphSnap(steps, adj, n, nc2, { ...ec }, `Geri al: ${NODE_LABELS[v]}`);
        }
      }
      return false;
    }

    if (solve(1)) {
      const nc = {};
      for (let i = 0; i < n; i++) nc[i] = 'path';
      _graphSnap(steps, adj, n, nc, ec, 'Hamilton yolu bulundu!');
    } else {
      _graphSnap(steps, adj, n, {}, {}, 'Hamilton yolu bulunamadı');
    }
    return steps;
  }

  /* ============================================================
     HASH TABLE OPERATIONS (Bar chart)
     ============================================================ */
  function hashTable(inputArr) {
    const tableSize = 13;
    const table = new Array(tableSize).fill(0);
    const steps = [];
    const inserted = [];
    snap(steps, [...table], [], [], [], `Hash Table: boyut=${tableSize}`);
    const values = inputArr.slice(0, Math.min(inputArr.length, 8));
    for (const val of values) {
      let idx = val % tableSize;
      snap(steps, [...table], [idx], [], [...inserted], `Ekle: ${val} → h(${val})=${idx}`);
      let collisions = 0;
      while (table[idx] !== 0) {
        collisions++;
        snap(steps, [...table], [idx], [], [...inserted], `Çarpışma #${collisions}: idx=${idx} dolu`);
        idx = (idx + 1) % tableSize;
      }
      table[idx] = val;
      inserted.push(idx);
      snap(steps, [...table], [], [idx], [...inserted], `Yerleştirildi: table[${idx}]=${val}`);
    }
    snap(steps, [...table], [], [], Array.from({ length: tableSize }, (_, i) => i), 'Hash Table tamamlandı!');
    return steps;
  }

  /* ============================================================
     RABIN-KARP STRING MATCHING (Bar chart)
     ============================================================ */
  function rabinKarp(inputArr) {
    const n = Math.min(inputArr.length, 20);
    const text = Array.from({ length: n }, () => Math.floor(Math.random() * 9) + 1);
    const patLen = 3;
    const startP = Math.floor(Math.random() * Math.max(1, n - patLen));
    const pattern = text.slice(startP, startP + patLen);
    const steps = [];
    snap(steps, [...text], [], [], [], `Rabin-Karp: metin[${n}], desen[${patLen}]`);
    const d = 10, q = 101;
    let pHash = 0, tHash = 0, h = 1;
    for (let i = 0; i < patLen - 1; i++) h = (h * d) % q;
    for (let i = 0; i < patLen; i++) { pHash = (d * pHash + pattern[i]) % q; tHash = (d * tHash + text[i]) % q; }
    for (let i = 0; i <= n - patLen; i++) {
      const win = Array.from({ length: patLen }, (_, j) => i + j);
      snap(steps, [...text], win, [], [], `Pos ${i}: tHash=${tHash}, pHash=${pHash}`);
      if (tHash === pHash) {
        let match = true;
        for (let j = 0; j < patLen; j++) { if (text[i + j] !== pattern[j]) { match = false; break; } }
        if (match) snap(steps, [...text], [], win, win, `Eşleşme: pos=${i}`);
      }
      if (i < n - patLen) {
        tHash = (d * (tHash - text[i] * h) + text[i + patLen]) % q;
        if (tHash < 0) tHash += q;
      }
    }
    snap(steps, [...text], [], [], Array.from({ length: n }, (_, i) => i), 'Rabin-Karp tamamlandı!');
    return steps;
  }

  /* ============================================================
     KMP ALGORITHM (Bar chart)
     ============================================================ */
  function kmpAlgorithm(inputArr) {
    const n = Math.min(inputArr.length, 20);
    const text = Array.from({ length: n }, () => Math.floor(Math.random() * 5) + 1);
    const patLen = 3;
    const startI = Math.floor(Math.random() * Math.max(1, n - patLen));
    const pattern = text.slice(startI, startI + patLen);
    const steps = [];
    snap(steps, [...text], [], [], [], `KMP: metin[${n}], desen[${patLen}]`);
    const fail = new Array(patLen).fill(0);
    let k = 0;
    for (let i = 1; i < patLen; i++) {
      while (k > 0 && pattern[k] !== pattern[i]) k = fail[k - 1];
      if (pattern[k] === pattern[i]) k++;
      fail[i] = k;
    }
    let j = 0;
    for (let i = 0; i < n; i++) {
      while (j > 0 && text[i] !== pattern[j]) {
        snap(steps, [...text], [i], [], [], `Uyumsuz: pos ${i}, j=${j}`);
        j = fail[j - 1];
      }
      snap(steps, [...text], [i], [], [], `Karşılaştır: text[${i}]=${text[i]}, pat[${j}]=${pattern[j]}`);
      if (text[i] === pattern[j]) {
        j++;
        if (j === patLen) {
          const win = Array.from({ length: patLen }, (_, k2) => i - patLen + 1 + k2);
          snap(steps, [...text], [], win, win, `Eşleşme: pos=${i - patLen + 1}`);
          j = fail[j - 1];
        }
      }
    }
    snap(steps, [...text], [], [], Array.from({ length: n }, (_, i) => i), 'KMP tamamlandı!');
    return steps;
  }

  /* ============================================================
     PUBLIC API
     ============================================================ */
  return {
    /* Sıralama */
    bubble: bubbleSort,
    selection: selectionSort,
    insertion: insertionSort,
    merge: mergeSort,
    quick: quickSort,
    heap: heapSort,
    radix: radixSort,

    /* Arama */
    linear: linearSearch,
    binary: binarySearch,
    jump: jumpSearch,
    interpolation: interpolationSearch,
    exponential: exponentialSearch,

    /* En Kısa Yol */
    dijkstra: dijkstra,
    'bellman-ford': bellmanFord,
    'floyd-warshall': floydWarshall,
    'a-star': aStar,
    'bfs-shortest': bfsShortestPath,

    /* Graf Gezme */
    dfs: dfs,
    bfs: bfs,

    /* Dinamik Programlama */
    fibonacci: fibonacci,
    knapsack: knapsack,
    lcs: lcs,
    'matrix-chain': matrixChain,

    /* Parçala ve Fethet */
    'dc-merge-sort': dcMergeSort,
    'dc-quick-sort': dcQuickSort,
    strassen: strassenMatrix,
    'closest-pair': closestPair,

    /* Greedy */
    kruskal: kruskal,
    prim: prim,
    huffman: huffman,
    'activity-selection': activitySelection,

    /* Backtracking */
    'n-queens': nQueens,
    sudoku: sudokuSolver,
    hamiltonian: hamiltonianCycle,

    /* Hashing */
    'hash-table': hashTable,
    'rabin-karp': rabinKarp,
    kmp: kmpAlgorithm,

    /**
     * Rastgele dizi oluşturur.
     * @param {number} size  - Eleman sayısı
     * @param {number} max   - Maksimum değer
     * @returns {number[]}
     */
    generateArray(size = 40, max = 100) {
      return Array.from({ length: size },
        () => Math.floor(Math.random() * max) + 5);
    }
  };

})();