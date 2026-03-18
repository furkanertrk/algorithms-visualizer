/* ============================================================
   router.js — SPA Yönlendirme Motoru
   Hash-based routing ile sayfa yenilenmeden view geçişleri sağlar.
   
   Desteklenen rotalar:
     #home              → Ana Sayfa (Kategori Grid)
     #category/{slug}   → Çalışma Alanı (Workspace)
   ============================================================ */

'use strict';

/**
 * Router — Basit hash-based SPA yönlendirici.
 * Singleton pattern ile tek bir instance üzerinden çalışır.
 */
const Router = (() => {

  /* ---- Özel (Private) Değişkenler ---- */
  let _routes = {};          // Kayıtlı rota → callback eşlemeleri
  let _currentView = null;   // Şu an aktif olan view elementi
  let _viewContainer = null; // Tüm view'ları barındıran ana kapsayıcı

  /* ============================================================
     Yardımcı Fonksiyonlar (Private)
     ============================================================ */

  /**
   * URL hash'inden rota bilgisini ayrıştırır.
   * Örn: "#category/sorting" → { path: "category", param: "sorting" }
   * Örn: "#home"             → { path: "home",     param: null }
   */
  function _parseHash(hash) {
    // Hash'i temizle: "#" ve "!" karakterlerini kaldır
    const cleanHash = hash.replace(/^#\/?/, '') || 'home';
    const segments = cleanHash.split('/');

    return {
      path: segments[0],
      param: segments[1] || null
    };
  }

  /**
   * Aktif view'ı değiştirir.
   * Eski view'dan .active sınıfını kaldırır, yeni view'a ekler.
   * CSS transition ile yumuşak geçiş sağlanır.
   * 
   * @param {string} viewId - Aktif yapılacak view'ın DOM id'si
   */
  function _switchView(viewId) {
    const targetView = document.getElementById(viewId);
    if (!targetView) {
      console.warn(`[Router] View bulunamadı: #${viewId}`);
      return;
    }

    // Eğer zaten aktif olan view ise hiçbir şey yapma
    if (_currentView === targetView) return;

    // Mevcut aktif view'ı devre dışı bırak
    if (_currentView) {
      _currentView.classList.remove('active');
    }

    // Yeni view'ı aktif yap
    // requestAnimationFrame ile CSS transition'ın düzgün çalışmasını sağla
    requestAnimationFrame(() => {
      targetView.classList.add('active');
      _currentView = targetView;

      // View değiştiğinde sayfayı en yukarı kaydır
      window.scrollTo(0, 0);
    });
  }

  /**
   * Hash değişikliğinde çağrılır.
   * Rotayı ayrıştırır ve ilgili callback'i çalıştırır.
   */
  function _onHashChange() {
    const { path, param } = _parseHash(window.location.hash);

    // Kayıtlı rota var mı kontrol et
    if (_routes[path]) {
      _routes[path](param);
    } else {
      // Bilinmeyen rota → ana sayfaya yönlendir
      console.warn(`[Router] Bilinmeyen rota: "${path}" → Ana sayfaya yönlendiriliyor.`);
      Router.navigate('home');
    }
  }

  /* ============================================================
     Genel (Public) API
     ============================================================ */
  return {

    /**
     * Router'ı başlatır.
     * View container'ı belirler ve hashchange dinleyicisini ekler.
     * 
     * @param {string} containerId - View'ların bulunduğu kapsayıcının DOM id'si
     */
    init(containerId) {
      _viewContainer = document.getElementById(containerId);

      if (!_viewContainer) {
        console.error(`[Router] Container bulunamadı: #${containerId}`);
        return;
      }

      // Hash değişikliğini dinle
      window.addEventListener('hashchange', _onHashChange);

      // Sayfa ilk yüklendiğinde mevcut hash'i işle
      // (Kullanıcı URL'ye doğrudan #category/sorting yazarsa çalışsın)
      _onHashChange();
    },

    /**
     * Yeni bir rota kaydeder.
     * 
     * @param {string} path     - Rota yolu (örn: "home", "category")
     * @param {Function} callback - Rota eşleştiğinde çağrılacak fonksiyon
     */
    on(path, callback) {
      _routes[path] = callback;
      return this; // Method chaining desteği
    },

    /**
     * Belirtilen rotaya yönlendirir.
     * URL hash'ini günceller ve hashchange olayını tetikler.
     * 
     * @param {string} path  - Hedef rota (örn: "home", "category/sorting")
     */
    navigate(path) {
      window.location.hash = `#${path}`;
    },

    /**
     * Belirtilen view'ı aktif yapar.
     * CSS transition ile yumuşak geçiş sağlar.
     * 
     * @param {string} viewId - DOM element id'si
     */
    showView(viewId) {
      _switchView(viewId);
    },

    /**
     * Mevcut aktif rotanın bilgisini döndürür.
     * 
     * @returns {{ path: string, param: string|null }}
     */
    getCurrentRoute() {
      return _parseHash(window.location.hash);
    }
  };

})();
