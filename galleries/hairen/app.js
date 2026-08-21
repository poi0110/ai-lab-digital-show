const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('#main-nav');

navToggle?.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
  mainNav?.classList.toggle('is-open', !expanded);
});

mainNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navToggle?.setAttribute('aria-expanded', 'false');
    mainNav.classList.remove('is-open');
  });
});

const video = document.querySelector('#hero-video');
const fallback = document.querySelector('#video-fallback');
const playToggle = document.querySelector('#play-toggle');
const soundToggle = document.querySelector('#sound-toggle');
const autoplayPrompt = document.querySelector('#autoplay-prompt');
const videoStatus = document.querySelector('#video-status');

function setPlayState(isPlaying) {
  if (!playToggle) return;
  playToggle.setAttribute('aria-pressed', String(isPlaying));
  const icon = playToggle.querySelector('.control-icon');
  const label = playToggle.querySelector('.control-label');
  if (icon) icon.textContent = isPlaying ? 'Ⅱ' : '▶';
  if (label) label.textContent = isPlaying ? '暂停' : '播放';
}

function setSoundState(isAudible) {
  if (!soundToggle || !video) return;
  soundToggle.setAttribute('aria-pressed', String(isAudible));
  const icon = soundToggle.querySelector('.control-icon');
  const label = soundToggle.querySelector('.control-label');
  if (icon) icon.textContent = isAudible ? '♫' : '♪';
  if (label) label.textContent = isAudible ? '关闭声音' : '打开声音';
  if (videoStatus) videoStatus.textContent = isAudible ? '声音已打开' : '静音循环播放';
}

async function tryPlay() {
  if (!video) return;
  try {
    await video.play();
    setPlayState(true);
    if (autoplayPrompt) autoplayPrompt.hidden = true;
  } catch {
    setPlayState(false);
    if (autoplayPrompt) autoplayPrompt.hidden = false;
    if (videoStatus) videoStatus.textContent = '浏览器阻止了自动播放';
  }
}

playToggle?.addEventListener('click', async () => {
  if (!video) return;
  if (video.paused) {
    await tryPlay();
  } else {
    video.pause();
    setPlayState(false);
    if (videoStatus) videoStatus.textContent = '视频已暂停';
  }
});

soundToggle?.addEventListener('click', () => {
  if (!video) return;
  video.muted = !video.muted;
  setSoundState(!video.muted);
});

autoplayPrompt?.addEventListener('click', tryPlay);

video?.addEventListener('play', () => setPlayState(true));
video?.addEventListener('pause', () => setPlayState(false));
video?.addEventListener('volumechange', () => setSoundState(!video.muted && video.volume > 0));
video?.addEventListener('error', () => {
  video.hidden = true;
  if (fallback) fallback.hidden = false;
  if (autoplayPrompt) autoplayPrompt.hidden = true;
  if (playToggle) playToggle.disabled = true;
  if (soundToggle) soundToggle.disabled = true;
  if (videoStatus) videoStatus.textContent = '视频加载失败，已显示第1张手办图片';
});

if (video) {
  video.muted = true;
  setSoundState(false);
  tryPlay();
}

const lightbox = document.querySelector('#lightbox');
const lightboxImage = document.querySelector('#lightbox-image');
const lightboxClose = document.querySelector('#lightbox-close');

document.querySelectorAll('.lightbox-trigger').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    if (!lightbox || !lightboxImage) return;
    lightboxImage.src = trigger.dataset.image || '';
    lightboxImage.alt = trigger.dataset.alt || '素材大图';
    lightbox.showModal();
    document.body.classList.add('no-scroll');
  });
});

function closeLightbox() {
  if (!lightbox?.open) return;
  lightbox.close();
  document.body.classList.remove('no-scroll');
  if (lightboxImage) lightboxImage.src = '';
}

lightboxClose?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});
lightbox?.addEventListener('close', () => document.body.classList.remove('no-scroll'));

const backToTop = document.querySelector('#back-to-top');
let backToTopFrame = 0;

function updateBackToTop() {
  backToTopFrame = 0;
  if (!backToTop) return;

  const scrollRoot = document.scrollingElement || document.documentElement;
  const revealDistance = Math.max(window.innerHeight * 0.2, 1);
  const isVisible = scrollRoot.scrollTop >= revealDistance;

  backToTop.classList.toggle('is-visible', isVisible);
  backToTop.setAttribute('aria-hidden', String(!isVisible));
  backToTop.tabIndex = isVisible ? 0 : -1;
}

function requestBackToTopUpdate() {
  if (backToTopFrame) return;
  backToTopFrame = window.requestAnimationFrame(updateBackToTop);
}

window.addEventListener('scroll', requestBackToTopUpdate, { passive: true });
window.addEventListener('resize', requestBackToTopUpdate);
backToTop?.addEventListener('click', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
});

updateBackToTop();
