**Algoritma Görselleştirme Platformu** — Sıralama, arama, graf, dinamik programlama ve daha fazla algoritmayı adım adım görselleştirerek öğrenin.

🔗 **[Canlı Demo →](https://kullaniciadi.github.io/algo-viz)**

---

## 🎯 Nedir?

Algoritmaların nasıl çalıştığını anlamanın en iyi yolu onları *izlemektir*. algo-viz, 30+ algoritmayı Canvas üzerinde adım adım canlandıran, tamamen tarayıcıda çalışan bir görselleştirme platformudur. Herhangi bir kurulum gerektirmez.

---

## 🗂️ Kategoriler & Algoritmalar

<details>
<summary><b>📊 Sıralama Algoritmaları</b> (7 algoritma)</summary>

- Bubble Sort
- Selection Sort
- Insertion Sort
- Merge Sort
- Quick Sort
- Heap Sort
- Radix Sort

</details>

<details>
<summary><b>🔍 Arama Algoritmaları</b> (5 algoritma)</summary>

- Linear Search
- Binary Search
- Jump Search
- Interpolation Search
- Exponential Search

</details>

<details>
<summary><b>🗺️ En Kısa Yol (Graf)</b> (5 algoritma)</summary>

- Dijkstra
- Bellman-Ford
- Floyd-Warshall
- A* Algoritması
- BFS (Unweighted)

</details>

<details>
<summary><b>🌐 Graf Gezme</b> (2 algoritma)</summary>

- DFS — Derinlik Öncelikli Arama
- BFS — Genişlik Öncelikli Arama

</details>

<details>
<summary><b>🧮 Dinamik Programlama</b> (4 algoritma)</summary>

- Fibonacci (DP)
- 0/1 Knapsack
- Longest Common Subsequence (LCS)
- Matrix Chain Multiplication

</details>

<details>
<summary><b>✂️ Parçala ve Fethet</b> (4 algoritma)</summary>

- Merge Sort (D&C)
- Quick Sort (D&C)
- Strassen's Matrix Multiplication
- Closest Pair of Points

</details>

<details>
<summary><b>⚡ Greedy Algoritmalar</b> (4 algoritma)</summary>

- Kruskal (MST)
- Prim (MST)
- Huffman Kodlama
- Etkinlik Seçimi

</details>

<details>
<summary><b>🔁 Gerileme (Backtracking)</b> (3 algoritma)</summary>

- N-Queens
- Sudoku Çözücü
- Hamilton Yolu

</details>

<details>
<summary><b>#️⃣ Hashing</b> (3 algoritma)</summary>

- Hash Table
- Rabin-Karp (String Matching)
- KMP Algorithm

</details>

---

## ✨ Özellikler

- **Adım adım oynatma** — İleri/geri adım, oynat/duraklat
- **Hız kontrolü** — Yavaştan hızlıya ayarlanabilir animasyon
- **Graf algoritmaları için kaynak & hedef seçimi** — Dropdown ile A–F arası seçilebilir
- **Parlayan yol vurgulama** — Bulunan en kısa yol kırmızıyla işaretlenir
- **Sabit graf topolojisi** — "Veri Üret" sadece kenar ağırlıklarını değiştirir, düğümler yerinden oynamaz
- **Dark / Light tema** — Sistem temasına uyumlu toggle
- **SPA mimarisi** — Hash-based routing, sayfa yenilemesi yok
- **Tam responsive** — Canvas boyutu pencereye göre otomatik ayarlanır

---

## 🛠️ Teknoloji

| Katman | Teknoloji |
|--------|-----------|
| Yapı | Vanilla HTML5 |
| Stil | Vanilla CSS3 (CSS Variables, Glassmorphism) |
| Mantık | Vanilla JavaScript (ES6+) |
| Çizim | HTML5 Canvas API |
| 3D Hero | Spline |
| Font | Inter + Fira Code |
| Routing | Custom hash-based SPA router |

Sıfır bağımlılık. Sıfır framework. Sıfır build adımı.

---

## 🚀 Kurulum

```bash
git clone https://github.com/kullaniciadi/algo-viz.git
cd algo-viz
# Herhangi bir statik sunucu ile aç:
npx serve .
# veya doğrudan index.html'i tarayıcıda aç
```

---

## 📁 Proje Yapısı

```
algo-viz/
├── index.html          # Tek sayfa, tüm view'lar burada
├── css/
│   ├── theme.css       # CSS değişkenleri, dark/light tema
│   └── style.css       # Tüm component stilleri
└── js/
    ├── router.js       # Hash-based SPA yönlendirici
    ├── algorithms.js   # 30+ algoritma (snapshot tabanlı)
    ├── visualizer.js   # Canvas çizim motoru
    └── app.js          # Uygulama mantığı & event yönetimi
```

---

## 📖 Nasıl Çalışır?

Her algoritma çalıştığında tüm adımlarını **snapshot** olarak kaydeder:

```js
// Örnek snapshot (Bubble Sort)
{
  array:     [34, 12, 8, 55, 3],
  comparing: [1, 2],      // sarı
  swapping:  [],
  sorted:    [4],         // yeşil
  label:     "Karşılaştır: index 1 ve 2"
}
```

`Visualizer`, bu snapshot dizisini Canvas üzerinde adım adım oynatır. Graf algoritmaları için snapshot formatı farklıdır: düğüm renkleri, kenar renkleri ve ağırlıklar içerir.

---

## 📄 Lisans

GNU General Public License v3.0 © 2026

Bu projeyi kullanabilir, değiştirebilir ve dağıtabilirsiniz —
ancak türev çalışmaların da GPL v3 ile lisanslanması zorunludur.