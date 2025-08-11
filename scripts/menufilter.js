document.addEventListener('DOMContentLoaded', () => {

let filterBtns = document.querySelectorAll('button.filter-btn');
  if (filterBtns.length === 0) {
    // fallback: metne göre etiketle
    const allButtons = Array.from(document.querySelectorAll('button'));
    const map = { all: 'tümü', food: 'yemek', drink: 'içecek' };
    const picked = [];
    allButtons.forEach(b => {
      const t = (b.textContent || '').trim().toLowerCase();
      if (t === map.all || t === map.food || t === map.drink) {
        b.classList.add('filter-btn');
        if (t === map.all)  b.dataset.filter = 'all';
        if (t === map.food) b.dataset.filter = 'food';
        if (t === map.drink) b.dataset.filter = 'drink';
        picked.push(b);
      }
    });
    filterBtns = picked;
  }

  // 2) Kartları bul ve tiplerini belirle
  const menuCards = Array.from(document.querySelectorAll('.px-3 .grid > a.block'));
  menuCards.forEach(card => {
    // Başlığa göre tespit (en sağlamı)
    const title = (card.querySelector('h2')?.textContent || '').toLowerCase();
    const href  = decodeURIComponent((card.getAttribute('href') || '').toLowerCase());

    let type = 'drink';
    if ( /atıştırmalık|tatlı/.test(title) || /atıştırmalık|tatl/.test(href) ) {
      type = 'food';
    } else if ( /(kahve|çay|meşrubat|içecek)/.test(title) || /(kahve|çay|meşrubat|içecek)/.test(href) ) {
      type = 'drink';
    }
    card.dataset.type = type;

    // Animasyon için temel transition
    card.style.transition = 'opacity 250ms ease, transform 250ms ease';
  });

  // 3) Aktif buton rengi (mavi) – utility class’ları ezmek için inline
  function setActiveButton(btn) {
    filterBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
      b.style.color = '#000';       // seçili değil -> siyah
    });
    if (btn) {
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      btn.style.color = '#0191F2';  // seçili -> mavi
    }
  }

  // 4) Kart göster/gizle (yumuşak toparlanma animasyonu)
  function hideCard(card) {
    card.style.pointerEvents = 'none';
    // önce görünümde hafif yukarı ve saydam yap
    card.style.opacity = '0';
    card.style.transform = 'translateY(-8px)';
    // animasyon bittikten sonra display:none yap ki grid yukarı toplansın
    const onEnd = () => {
      card.style.display = 'none';
      card.removeEventListener('transitionend', onEnd);
    };
    card.addEventListener('transitionend', onEnd);
  }
  function showCard(card) {
    // önce görünür yapalım ama saydam/yukarıda başlasın
    card.style.display = '';
    // bir frame bekleyip animasyonla aşağı/opacity 1’e getir
    requestAnimationFrame(() => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(-8px)';
      // bir frame daha
      requestAnimationFrame(() => {
        card.style.pointerEvents = '';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
    });
  }

  function applyFilter(type) {
    menuCards.forEach(card => {
      const match = (type === 'all') || (card.dataset.type === type);
      const isHidden = card.style.display === 'none';
      if (match && isHidden) {
        showCard(card);
      } else if (!match && !isHidden) {
        hideCard(card);
      }
    });
  }

  // 5) Click bağla
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setActiveButton(btn);
      applyFilter(btn.dataset.filter || 'all');
    });
  });

  // 6) İlk durum: "Tümü" aktif ve hepsi görünür
  const initiallyActive =
    document.querySelector('button.filter-btn.active') ||
    Array.from(filterBtns).find(b => (b.dataset.filter || '') === 'all') ||
    filterBtns[0];

  if (initiallyActive) setActiveButton(initiallyActive);
  applyFilter('all');
});