// scripts/menu.js
(function () {
    const nav = document.querySelector('.scroll-area');
    if (!nav) return;
  
    // Üst barı sticky ve en üst z-index yap
    Object.assign(nav.style, {
      position: 'sticky',
      top: '0px',
      zIndex: '10000',
      background: 'inherit',
    });
  
    const scroller = nav.querySelector('[data-radix-scroll-area-viewport]');
    const content  = nav.querySelector('[data-radix-scroll-area-content]');
    if (!scroller || !content) return;
  
    const getCards = () => Array.from(content.querySelectorAll('[class*="w-[109px]"]'));
    const sections = Array.from(document.querySelectorAll('[id^="category-"]'));
  
    // --------- yardımcılar ----------
    function slugifyTR(s) {
      return String(s)
        .trim()
        .toLowerCase('tr')
        .replace(/İ/g, 'i').replace(/I/g, 'i').replace(/ı/g, 'i')
        .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ö/g, 'o')
        .replace(/ş/g, 's').replace(/ü/g, 'u')
        .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    }
    const labelFromCard = (card) => (card.querySelector('h3')?.textContent || card.textContent || '').trim();
    const idFromLabel   = (label) => 'category-' + slugifyTR(label);
  
    function getImgWrap(card) {
      const img = card.querySelector('img');
      if (!img) return null;
      const wrap = img.parentElement;
      if (wrap && !wrap.dataset.thumb) wrap.dataset.thumb = '1';
      return wrap;
    }
  
    function highlight(cardToActivate) {
      getCards().forEach((card) => {
        const h3 = card.querySelector('h3');
        if (!h3) return;
        if (card === cardToActivate) h3.classList.add('text-qrblue', 'font-semibold');
        else h3.classList.remove('text-qrblue', 'font-semibold');
      });
    }
  
    function centerCard(card) {
      if (!scroller || !card) return;
      const r  = card.getBoundingClientRect();
      const sr = scroller.getBoundingClientRect();
      scroller.scrollTo({
        left: scroller.scrollLeft + (r.left - sr.left) - (sr.width - r.width) / 2,
        behavior: 'smooth',
      });
    }
  
    // sticky başlığın yüksekliğini hesaba katarak scroll
    function scrollToSection(id) {
      const el = document.getElementById(id);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const y    = window.scrollY + rect.top - (nav.offsetHeight + 6);
      window.scrollTo({ top: y < 0 ? 0 : y, behavior: 'smooth' });
    }
  
    // --------- top buton ----------
    // ESKİ createTopBtn'i bununla değiştir
function createTopBtn() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Yukarı çık');
  
    // SVG ikon
    btn.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round"
           stroke-linejoin="round" aria-hidden="true">
        <path d="m18 15-6-6-6 6"></path>
      </svg>
    `;
  
    // Tamamen ekranın sağ-alt köşesine sabitle (safe-area destekli)
    Object.assign(btn.style, {
      position: 'fixed',
      // iOS güvenli alan + tüm cihazlarda 12px boşluk
      right: 'max(env(safe-area-inset-right), 12px)',
      bottom: 'max(env(safe-area-inset-bottom), 12px)',
  
      // Telefona göre duyarlı boyut
      width: 'clamp(44px, 12vw, 56px)',
      height: 'clamp(44px, 12vw, 56px)',
  
      borderRadius: '9999px',
      border: 'none',
      outline: 'none',
      cursor: 'pointer',
      zIndex: '2147483647',              // her şeyin üstünde
      background: 'var(--qrblue, #0ea5e9)',
      color: '#fff',
      boxShadow: '0 6px 18px rgba(0,0,0,.25)',
      display: 'none',                   // başta gizli
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'opacity .2s ease, transform .2s ease',
      opacity: '0',
      transform: 'translateY(6px)',
    });
  
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  
    document.body.appendChild(btn);
    return btn;
  }
  
    const topBtn = createTopBtn();
  
    // --------- compact/expand görünüm ----------
    function adjustSquares() {
      // resimler görünürken 1:1 kare yap
      getCards().forEach((card) => {
        const wrap = getImgWrap(card);
        if (!wrap) return;
        if (wrap.style.display === 'none') return; // compact modda dokunma
        // kare için genişliği ölç, yüksekliği ona eşitle
        const w = wrap.clientWidth || card.clientWidth;
        if (w > 0) {
          wrap.style.height = w + 'px';
        }
      });
    }
  
    let compactState = null;
    function setCompact(compact) {
      if (compactState === compact) return;
      compactState = compact;
  
      // img alanlarını göster/gizle
      getCards().forEach((card) => {
        const wrap = getImgWrap(card);
        if (!wrap) return;
        if (compact) {
          wrap.style.display = 'none';
          wrap.style.height  = ''; // temizle
        } else {
          wrap.style.display = '';
        }
      });
  
      // nav dolgu/yoğunluk
      nav.classList.toggle('compact', !!compact);
      // yukarı butonu görünürlüğü
      if (compact) {
        topBtn.style.display = 'flex';
        requestAnimationFrame(() => {
          topBtn.style.opacity = '1';
          topBtn.style.transform = 'translateY(0)';
        });
      } else {
        topBtn.style.opacity = '0';
        topBtn.style.transform = 'translateY(6px)';
        setTimeout(() => {
          if (!compactState) topBtn.style.display = 'none';
        }, 180);
        // resimler geri geldiğinde kare oranı ayarla
        requestAnimationFrame(adjustSquares);
        setTimeout(adjustSquares, 120); // layout otursun diye küçük ek gecikme
      }
    }
  
    function onScroll() {
      const compact = window.scrollY > 20;
      setCompact(compact);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  
    // resize’da kareleri güncelle (yalnızca resimler görünürken)
    window.addEventListener('resize', () => {
      if (!compactState) adjustSquares();
    });
  
    // --------- tıklama ve görünür bölüm izleme ----------
    content.addEventListener('click', (e) => {
      const card = e.target.closest('[class*="w-[109px]"]');
      if (!card) return;
      const label = labelFromCard(card);
      if (!label) return;
      e.preventDefault();
  
      const id = idFromLabel(label);
      highlight(card);
      centerCard(card);
      scrollToSection(id);
  
      const url = new URL(location.href);
      url.searchParams.set('category', id.replace('category-', ''));
      history.replaceState(null, '', url);
    });
  
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!vis) return;
        const id = vis.target.id;
        const target = getCards().find((c) => idFromLabel(labelFromCard(c)) === id);
        if (target) {
          highlight(target);
          if (!io._t || Date.now() - io._t > 250) {
            centerCard(target);
            io._t = Date.now();
          }
        }
      },
      // sticky başlık yüksekliğini kabaca tolere eden bir rootMargin
      { rootMargin: `-${Math.min(60, nav.offsetHeight)}px 0px -45% 0px`, threshold: [0.2, 0.4, 0.6] }
    );
    sections.forEach((s) => io.observe(s));
  
    // --------- ilk yük ----------
    function initFromUrl() {
      const url = new URL(location.href);
      const q = url.searchParams.get('category'); // sicak-kahveler vb.
      if (q) {
        const id = 'category-' + q;
        const target = getCards().find((c) => idFromLabel(labelFromCard(c)) === id);
        if (target) {
          highlight(target);
          centerCard(target);
          // sticky yükseklik payı ile hizala
          setTimeout(() => scrollToSection(id), 60);
          return;
        }
      }
      const first = getCards()[0];
      if (first) highlight(first);
    }
  
    // başlat
    onScroll();
    adjustSquares();
    initFromUrl();
  })();

  // Kategori şeridini sticky + küçülür/geri büyür yap
(function initStickyCatbar() {
    const catbar = document.querySelector('.scroll-area');
    if (!catbar) return;
  
    // Sticky davranışı için
    catbar.classList.add('catbar');
    catbar.style.overflow = 'visible'; // sticky'nin önünü aç
  
    // Kutu içindeki görsel ve başlık alanlarına helper classları bas
    // (w-[109px] Tailwind sınıfı querySelector için kaçırılmalı)
    const tiles = catbar.querySelectorAll('div.w\\[109px\\]');
    tiles.forEach(tile => {
      // İlk iç div genelde görsel konteyneri (h-[84px] olan)
      const imgWrap = tile.querySelector('div[class*="h-[84px]"]') || tile.firstElementChild;
      if (imgWrap) imgWrap.classList.add('tile-img');
  
      // Başlık metni (h3 veya p)
      const titleEl =
        tile.querySelector('h3') ||
        tile.querySelector('p') ||
        tile.querySelector('div[class*="p-1.5"]');
      if (titleEl) titleEl.classList.add('tile-title');
    });
  
    // Scroll eşiği: biraz aşağı inince "compact" mod
    const THRESHOLD = 60;
    const onScroll = () => {
      if (window.scrollY > THRESHOLD) {
        catbar.classList.add('compact');
      } else {
        catbar.classList.remove('compact');
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  })();
  
  // Kategori barı: aşağı kayınca compact, yukarıda normal
(function () {
    const bar = document.querySelector('.scroll-area');
    if (!bar) return;
    const THRESHOLD = 60; // isterse artır/azalt
    const onScroll = () => {
      if (window.scrollY > THRESHOLD) bar.classList.add('compact');
      else bar.classList.remove('compact');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  })();


  
  // Kompakt başlık barı + aktif başlık takibi
(function(){
    const BAR_HEIGHT = 40;
    const THRESHOLD = 60; // kaç px kayınca bar görünsün
  
    // Tüm kategori bölümleri
    const sections = Array.from(document.querySelectorAll('.menu-items > div[id^="category-"]'));
    if (!sections.length) return;
  
    // Bar DOM'u
    const bar = document.createElement('div');
    bar.id = 'compactCategoryBar';
    const track = document.createElement('div');
    track.className = 'cc-track';
    bar.appendChild(track);
    document.body.appendChild(bar);
  
    // Kayıt defteri: her bölüm için {id, sec, titleEl, pill}
    const registry = sections.map(sec => {
      // Bölüm içi başlık metni (tüm kategorilerde aynı yapıya geliyor)
      const titleEl = sec.querySelector('.bg-qrborder2 p');
      const title = (titleEl?.textContent || '').trim() || sec.id.replace('category-','').replace(/-/g,' ');
      // Pill
      const pill = document.createElement('button');
      pill.className = 'cc-pill';
      pill.type = 'button';
      pill.textContent = title;
      pill.addEventListener('click', () => {
        const y = sec.getBoundingClientRect().top + window.pageYOffset - (BAR_HEIGHT + 4);
        window.scrollTo({ top: y, behavior: 'smooth' });
        // Tıklamada anında görsel geri bildirim
        setActive(sec.id);
      });
      track.appendChild(pill);
      return { id: sec.id, sec, titleEl, pill };
    });
  
    // Aktif sınıfları yönet
    function setActive(id){
        registry.forEach(r => {
          const on = r.id === id;
          r.pill.classList.toggle('active', on);
          r.pill.classList.toggle('text-qrblue', on);
          // Bölüm içi başlıklara mavi uygulanmasın:
          if (r.titleEl) r.titleEl.classList.remove('text-qrblue');
        });
      }
  
    // Scroll konumuna göre aktif olanı bul (tek başlık aktif)
    function updateActive(){
      const y = window.pageYOffset + BAR_HEIGHT + 8;
      let current = registry[0]?.id;
      for (const r of registry){
        if (y >= r.sec.offsetTop - 1) current = r.id;
        else break;
      }
      setActive(current);
    }
  
    // Bar görünürlük + aktif güncelleme
    function onScroll(){
      if (window.scrollY > THRESHOLD) {
        bar.classList.add('show');
        document.documentElement.classList.add('has-compact-bar');
      } else {
        bar.classList.remove('show');
        document.documentElement.classList.remove('has-compact-bar');
      }
      updateActive();
    }
  
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('load', updateActive);
  })();
  
  
  