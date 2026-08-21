const video = document.querySelector('#hero-video');
const fallback = document.querySelector('#video-fallback');
const frame = document.querySelector('#video-frame');
const playToggle = document.querySelector('#play-toggle');
const soundToggle = document.querySelector('#sound-toggle');
const tapPlay = document.querySelector('#tap-play');
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('#site-nav');

function playIcon(paused) {
  return paused
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg><span>播放</span>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zm6 0h4v14h-4z"/></svg><span>暂停</span>';
}

function syncPlayState() {
  const paused = video.paused;
  playToggle.innerHTML = playIcon(paused);
  playToggle.setAttribute('aria-label', paused ? '播放视频' : '暂停视频');
  tapPlay.style.display = paused ? 'flex' : 'none';
}

async function tryPlay() {
  try {
    await video.play();
    tapPlay.style.display = 'none';
  } catch (_) {
    tapPlay.style.display = 'flex';
  }
  syncPlayState();
}

playToggle.addEventListener('click', async () => {
  if (video.paused) await tryPlay(); else video.pause();
  syncPlayState();
});

tapPlay.addEventListener('click', tryPlay);
video.addEventListener('play', syncPlayState);
video.addEventListener('pause', syncPlayState);
video.addEventListener('loadedmetadata', tryPlay, { once: true });
video.addEventListener('error', () => {
  video.style.display = 'none';
  fallback.style.display = 'block';
  frame.classList.add('using-fallback');
  tapPlay.style.display = 'none';
  playToggle.disabled = true;
  playToggle.innerHTML = '<span>视频暂不可用</span>';
});

soundToggle.addEventListener('click', () => {
  video.muted = !video.muted;
  soundToggle.querySelector('span').textContent = video.muted ? '打开声音' : '关闭声音';
  soundToggle.setAttribute('aria-label', video.muted ? '打开声音' : '关闭声音');
});

navToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});

nav.addEventListener('click', (event) => {
  if (event.target.matches('a')) {
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

tryPlay();
