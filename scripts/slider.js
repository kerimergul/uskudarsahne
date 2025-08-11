(() => {
  const wrapper = document.querySelector('.auto-slider');
  if (!wrapper) return;

  const track = wrapper.querySelector('.track');
  const prevBtn = wrapper.querySelector('[data-dir="prev"]');
  const nextBtn = wrapper.querySelector('[data-dir="next"]');
  if (!track || track.children.length < 2) return;

  // Ayarlar: daha hızlı geçiş ve bekleme süresi
  const SPEED = 400;    // ms (geçiş süresi)
  const DURATION = 2500; // ms (slayt başına bekleme)
  track.style.transition = `transform ${SPEED}ms ease`;

  // Sonsuz döngü: başa & sona klon
  const slides = Array.from(track.children);
  const firstClone = slides[0].cloneNode(true);
  const lastClone  = slides[slides.length - 1].cloneNode(true);
  track.insertBefore(lastClone, slides[0]);
  track.appendChild(firstClone);

  const total = track.children.length; // klonlar dahil
  let index = 1;         // gerçek ilk slayt
  let isAnimating = false;

  // Başlangıç pozisyonu
  const jumpNoAnim = (i) => {
    track.style.transition = 'none';
    index = i;
    track.style.transform = `translateX(-${index * 100}%)`;
    // reflow
    void track.offsetWidth;
    track.style.transition = `transform ${SPEED}ms ease`;
  };
  jumpNoAnim(1);

  const goTo = (i) => {
    isAnimating = true;
    index = i;
    track.style.transform = `translateX(-${index * 100}%)`;
  };

  const next = () => {
    if (isAnimating) return;
    goTo(index + 1);
  };

  const prev = () => {
    if (isAnimating) return;
    goTo(index - 1);
  };

  // Geçiş bitince sahneleme ve sonsuzlama
  track.addEventListener('transitionend', () => {
    isAnimating = false;
    if (index === total - 1) {       // sağdaki ilk klon
      jumpNoAnim(1);
    } else if (index === 0) {        // soldaki son klon
      jumpNoAnim(total - 2);
    }
  });

  // Otomatik oynat
  let timer = setInterval(() => next(), DURATION);
  const restartTimer = () => { clearInterval(timer); timer = setInterval(() => next(), DURATION); };

  // Butonlar
  nextBtn?.addEventListener('click', () => { next(); restartTimer(); });
  prevBtn?.addEventListener('click', () => { prev(); restartTimer(); });

  // Sürükleme / kaydırma (mouse + touch + pen)
  let isDown = false;
  let startX = 0;
  let deltaX = 0;

  const onDown = (e) => {
    isDown = true;
    wrapper.classList.add('dragging');
    track.style.transition = 'none';
    startX = e.clientX ?? (e.touches && e.touches[0].clientX) ?? 0;
    clearInterval(timer);
  };

  const onMove = (e) => {
    if (!isDown) return;
    const clientX = e.clientX ?? (e.touches && e.touches[0].clientX) ?? 0;
    deltaX = clientX - startX;
    const percent = (deltaX / wrapper.clientWidth) * 100;
    track.style.transform = `translateX(calc(-${index * 100}% + ${percent}%))`;
  };

  const onUp = () => {
    if (!isDown) return;
    isDown = false;
    wrapper.classList.remove('dragging');
    track.style.transition = `transform ${SPEED}ms ease`;

    const threshold = wrapper.clientWidth * 0.15; // %15 eşik
    if (Math.abs(deltaX) > threshold) {
      deltaX < 0 ? next() : prev();
    } else {
      // geri oturt
      track.style.transform = `translateX(-${index * 100}%)`;
    }
    deltaX = 0;
    restartTimer();
  };

  // Pointer Events (modern tarayıcılar)
  wrapper.addEventListener('pointerdown', (e) => { wrapper.setPointerCapture?.(e.pointerId); onDown(e); });
  wrapper.addEventListener('pointermove', onMove);
  wrapper.addEventListener('pointerup', onUp);
  wrapper.addEventListener('pointercancel', onUp);
  wrapper.addEventListener('mouseleave', onUp);

  // Eski touch destek (gerekirse)
  wrapper.addEventListener('touchstart', onDown, { passive: true });
  wrapper.addEventListener('touchmove', onMove, { passive: true });
  wrapper.addEventListener('touchend', onUp);

  // Görünürlük değişince durdur/başlat
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearInterval(timer);
    else restartTimer();
  });

  // Görsellerin yerinden sürüklenmesini engelle
  wrapper.querySelectorAll('img').forEach(img => img.addEventListener('dragstart', (e) => e.preventDefault()));
})();
