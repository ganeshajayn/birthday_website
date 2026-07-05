/**
 * Birthday Surprise Website — Main Script
 * Handles: Loading, Stars, Particles, Scroll Animations, Gallery,
 *          Flip Cards, Fun Section, Quiz, Music Player, Confetti,
 *          Fireworks, Click Hearts, and more.
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════════════
   0. GLOBAL STATE
═══════════════════════════════════════════════════════════════════════ */
const state = {
  heartsActive: false,
  confettiActive: false,
  quizData: [],
  quizIndex: 0,
  quizScore: 0,
  compliments: [],
  musicPlaying: false,
  giftOpened: false,
};

/* ═══════════════════════════════════════════════════════════════════════
   1. UTILITIES
═══════════════════════════════════════════════════════════════════════ */

/** Return a random number between min and max (inclusive) */
const rand = (min, max) => Math.random() * (max - min) + min;

/** Return a random integer between min and max (inclusive) */
const randInt = (min, max) => Math.floor(rand(min, max + 1));

/** Pick a random element from an array */
const randItem = (arr) => arr[randInt(0, arr.length - 1)];

/** Debounce a function */
const debounce = (fn, ms = 150) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};

/** Show a brief toast notification */
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 400);
  }, duration);
}

/* ═══════════════════════════════════════════════════════════════════════
   2. LOADING SCREEN
═══════════════════════════════════════════════════════════════════════ */
function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  // Wait for bar fill animation (≈2.2s) then hide
  setTimeout(() => {
    loader.classList.add('fade-out');
    // After transition completes, remove from flow
    setTimeout(() => {
      loader.style.display = 'none';
      initHeroAnimations();
      showMusicPlayer();
    }, 900);
  }, 2400);
}

function showMusicPlayer() {
  const player = document.getElementById('music-player');
  if (player) {
    player.classList.remove('hidden');
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   3. STARFIELD CANVAS
═══════════════════════════════════════════════════════════════════════ */
function initStarfield() {
  const canvas = document.getElementById('star-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let stars = [];
  let shootingStars = [];
  let animId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createStars();
  }

  function createStars() {
    stars = [];
    const count = Math.floor((canvas.width * canvas.height) / 6000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: rand(0, canvas.width),
        y: rand(0, canvas.height),
        r: rand(0.3, 2.2),
        baseAlpha: rand(0.3, 1),
        alpha: rand(0.3, 1),
        twinkleSpeed: rand(0.003, 0.015),
        twinkleDir: Math.random() > 0.5 ? 1 : -1,
        // Color: mostly white/blue, some pink/gold
        hue: Math.random() > 0.8 ? (Math.random() > 0.5 ? 340 : 45) : 220,
        sat: Math.random() > 0.8 ? 60 : 10,
      });
    }
  }

  function spawnShootingStar() {
    shootingStars.push({
      x: rand(canvas.width * 0.3, canvas.width),
      y: rand(0, canvas.height * 0.4),
      vx: rand(-8, -3),
      vy: rand(3, 6),
      length: rand(80, 200),
      alpha: 1,
      life: 0,
      maxLife: rand(40, 80),
    });
  }

  // Periodically spawn shooting stars
  setInterval(() => {
    if (Math.random() < 0.7) spawnShootingStar();
  }, 3500);

  function drawStar(s) {
    // Twinkle
    s.alpha += s.twinkleSpeed * s.twinkleDir;
    if (s.alpha >= 1 || s.alpha <= 0.1) s.twinkleDir *= -1;

    ctx.save();
    ctx.globalAlpha = s.alpha;
    ctx.fillStyle = `hsl(${s.hue}, ${s.sat}%, 95%)`;
    ctx.shadowColor = `hsl(${s.hue}, 80%, 80%)`;
    ctx.shadowBlur = s.r * 4;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawShootingStar(ss) {
    ss.life++;
    ss.x += ss.vx;
    ss.y += ss.vy;
    ss.alpha = 1 - ss.life / ss.maxLife;

    ctx.save();
    ctx.globalAlpha = ss.alpha;
    const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.vx * 10, ss.y - ss.vy * 10);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.5, 'rgba(255,200,230,0.5)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(ss.x, ss.y);
    ctx.lineTo(ss.x - ss.vx * (ss.length / 10), ss.y - ss.vy * (ss.length / 10));
    ctx.stroke();
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(drawStar);

    shootingStars = shootingStars.filter((ss) => {
      drawShootingStar(ss);
      return ss.life < ss.maxLife;
    });

    animId = requestAnimationFrame(animate);
  }

  resize();
  animate();
  window.addEventListener('resize', debounce(resize, 200));
}

/* ═══════════════════════════════════════════════════════════════════════
   4. HERO FLOATING PARTICLES
═══════════════════════════════════════════════════════════════════════ */
function initHeroParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;

  const PARTICLE_EMOJIS = ['✦', '✧', '❋', '✿', '♡', '❤', '🌸', '⭐', '✨', '💫'];
  const PARTICLE_COUNT = 28;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'hero-particle';

    const isEmoji = Math.random() > 0.5;
    if (isEmoji) {
      p.textContent = randItem(PARTICLE_EMOJIS);
      p.style.fontSize = `${rand(0.6, 1.5)}rem`;
    } else {
      // Glowing dot
      const size = rand(3, 8);
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.background = Math.random() > 0.5
        ? `rgba(255,110,180,${rand(0.3, 0.8)})`
        : `rgba(168,85,247,${rand(0.3, 0.8)})`;
      p.style.boxShadow = `0 0 ${size * 3}px currentColor`;
    }

    p.style.left = `${rand(2, 98)}%`;
    p.style.top = `${rand(5, 95)}%`;
    p.style.setProperty('--duration', `${rand(5, 12)}s`);
    p.style.setProperty('--delay', `${rand(0, 6)}s`);
    p.style.setProperty('--opacity', rand(0.4, 1));
    container.appendChild(p);
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   5. HERO ENTRANCE ANIMATIONS
═══════════════════════════════════════════════════════════════════════ */
function initHeroAnimations() {
  const heroElements = document.querySelectorAll('.hero-content .reveal-fade');
  heroElements.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('revealed');
    }, 200 + i * 180);
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   6. SCROLL REVEAL (Intersection Observer)
═══════════════════════════════════════════════════════════════════════ */
function initScrollReveal() {
  // Reveal generic fade elements
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  // Non-hero reveal elements
  document.querySelectorAll('.section:not(.hero-section) .reveal-fade').forEach((el) => {
    observer.observe(el);
  });

  // Section headers
  document.querySelectorAll('.section-header').forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.9s ease, transform 0.9s ease';

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          obs.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   7. TIMELINE SLIDE-IN
═══════════════════════════════════════════════════════════════════════ */
function initTimeline() {
  const cards = document.querySelectorAll('.timeline-card');
  if (!cards.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('slide-in');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25 }
  );

  cards.forEach((card) => observer.observe(card));
}

/* ═══════════════════════════════════════════════════════════════════════
   8. PHOTO GALLERY
═══════════════════════════════════════════════════════════════════════ */
function initGallery() {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  // Gallery items — real photos
  const galleryItems = [
    { src: 'assets/yana 1.jpeg', caption: 'Beautiful You 🌸' },
    { src: 'assets/yana 2.jpeg', caption: 'Shining Always ✨' },
    { src: 'assets/WhatsApp%20Image%202026-07-05%20at%204.24.57%20PM.jpeg', caption: 'Mahal Kita 🇵🇭' },
    { src: 'assets/WhatsApp%20Image%202026-07-05%20at%204.21.48%20PM.jpeg', caption: 'Sweetest Smile 💞' }
  ];

  const rotations = [-4, 3, -2, 4];

  galleryItems.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'polaroid polaroid-real';
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Photo: ${item.caption}`);
    card.style.setProperty('--rotate', `${rotations[i % rotations.length]}deg`);
    card.style.setProperty('--delay', `${i * 0.12}s`);

    card.innerHTML = `
      <div class="polaroid-img-wrap">
        <img src="${item.src}" alt="${item.caption}" loading="lazy" />
      </div>
      <div class="polaroid-caption">${item.caption}</div>
    `;

    card.addEventListener('click', () => openLightboxPhoto(item));
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') openLightboxPhoto(item); });
    grid.appendChild(card);
  });

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxHearts = document.getElementById('lightbox-hearts');

  function openLightbox(item, card) {
    // Use encodeURIComponent instead of btoa to safely handle emoji in SVG
    const svgData = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>
      <defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' style='stop-color:#1a0535'/>
        <stop offset='100%' style='stop-color:#5a1080'/>
      </linearGradient></defs>
      <rect width='400' height='400' fill='url(#g)'/>
      <text x='200' y='195' text-anchor='middle' font-size='100' font-family='serif'>${item.emoji}</text>
      <text x='200' y='265' text-anchor='middle' font-size='24' fill='rgba(255,255,255,0.7)' font-family='Georgia, serif' font-style='italic'>${item.caption}</text>
    </svg>`;
    lightboxImg.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;
    lightboxImg.alt = item.caption;
    lightboxCaption.textContent = item.caption;

    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Spawn rising hearts
    spawnLightboxHearts();
  }

  // Opens lightbox with a real photo (src path)
  function openLightboxPhoto(item) {
    lightboxImg.src = item.src;
    lightboxImg.alt = item.caption;
    lightboxCaption.textContent = item.caption;
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    spawnLightboxHearts();
  }

  function closeLightbox() {
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
    if (lightboxHearts) lightboxHearts.innerHTML = '';
  }

  function spawnLightboxHearts() {
    if (!lightboxHearts) return;
    lightboxHearts.innerHTML = '';
    const emojis = ['❤️', '💖', '💗', '💓', '💕', '🌸', '✨'];
    for (let i = 0; i < 12; i++) {
      const heart = document.createElement('div');
      heart.className = 'lightbox-heart';
      heart.textContent = randItem(emojis);
      heart.style.left = `${rand(10, 90)}%`;
      heart.style.animationDelay = `${rand(0, 1.5)}s`;
      heart.style.fontSize = `${rand(1, 2.5)}rem`;
      lightboxHearts.appendChild(heart);
    }
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && lightbox.style.display === 'flex') closeLightbox();
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   9. FLIP CARDS (Messages from API)
═══════════════════════════════════════════════════════════════════════ */
async function initFlipCards() {
  const container = document.getElementById('flip-cards-container');
  if (!container) return;

  // Try API; fallback to local data
  let messages;
  try {
    const res = await fetch('/api/messages');
    const json = await res.json();
    messages = json.messages;
  } catch {
    messages = [
      { id: 1, icon: '💖', title: 'Thank You', content: 'Thank you for being the light in my ordinary days.' },
      { id: 2, icon: '✨', title: 'You Matter', content: 'You made ordinary days feel extraordinary just by being you.' },
      { id: 3, icon: '😊', title: 'Your Smile', content: 'Your smile is a gift to everyone who gets to witness it.' },
      { id: 4, icon: '🌸', title: 'Cherished Memories', content: 'Every moment we shared is a treasure I hold close.' },
      { id: 5, icon: '🌙', title: 'Miss You', content: 'I miss our late-night conversations and all the laughter.' },
    ];
  }

  messages.forEach((msg) => {
    const card = document.createElement('div');
    card.className = 'flip-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Message: ${msg.title}. Hover to reveal.`);

    card.innerHTML = `
      <div class="flip-card-inner">
        <div class="flip-card-front">
          <span class="flip-front-icon" aria-hidden="true">${msg.icon}</span>
          <h3 class="flip-front-title">${msg.title}</h3>
          <p class="flip-front-hint">hover to reveal ✨</p>
        </div>
        <div class="flip-card-back">
          <p class="flip-back-text">${msg.content}</p>
        </div>
      </div>
    `;

    // Keyboard support: Enter/Space toggles flip
    let flipped = false;
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        flipped = !flipped;
        card.querySelector('.flip-card-inner').style.transform = flipped ? 'rotateY(180deg)' : '';
      }
    });

    container.appendChild(card);
  });

  // Scroll reveal for flip cards
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, i * 100);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  container.querySelectorAll('.flip-card').forEach((card) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   10. INTERACTIVE FUN SECTION
═══════════════════════════════════════════════════════════════════════ */

/* — Feature 1: Awesome Button — */
function initAwesomeButton() {
  const btn = document.getElementById('btn-awesome');
  const result = document.getElementById('awesome-result');
  if (!btn || !result) return;

  const responses = [
    "Of course you are! ❤️",
    "We already knew that 😊✨",
    "Obviously! You always were 💖",
    "The most awesome, actually 🌟",
    "No debate needed — 100% awesome 💫",
  ];

  let clicked = false;
  btn.addEventListener('click', () => {
    result.textContent = randItem(responses);
    result.classList.remove('hidden');
    result.style.animation = 'none';
    requestAnimationFrame(() => {
      result.style.animation = 'resultFadeIn 0.4s ease both';
    });

    if (!clicked) {
      spawnClickHearts(btn, 6);
      clicked = true;
    }
    showToast('You\'re always awesome! 💖');
  });
}

/* — Feature 2: Compliment Generator — */
async function initComplimentGenerator() {
  const btn = document.getElementById('btn-compliment');
  const result = document.getElementById('compliment-result');
  if (!btn || !result) return;

  // Fetch compliments from API or fallback
  try {
    const res = await fetch('/api/compliments');
    const json = await res.json();
    state.compliments = json.compliments;
  } catch {
    state.compliments = [
      'You have a beautiful soul that lights up every room ✨',
      'Your smile is absolutely adorable and contagious 😊',
      'You make people feel comfortable just by being near them 🌸',
      'You are stronger than you know and braver than you believe 💪',
      'Your kindness is one of the most beautiful things about you 💖',
      'You have an amazing ability to make people laugh 😄',
      'You are genuinely one of a kind, and the world is better with you 🌟',
      'Your heart is as golden as the stars above 💛',
    ];
  }

  btn.addEventListener('click', () => {
    const compliment = randItem(state.compliments);
    result.textContent = compliment;
    result.classList.remove('hidden');
    result.style.animation = 'none';
    requestAnimationFrame(() => {
      result.style.animation = 'resultFadeIn 0.4s ease both';
    });
    spawnClickHearts(btn, 4);
  });
}

/* — Feature 3: Mini Quiz — */
async function initQuiz() {
  const progressEl = document.getElementById('quiz-progress');
  const questionEl = document.getElementById('quiz-question');
  const optionsEl = document.getElementById('quiz-options');
  const explanationEl = document.getElementById('quiz-explanation');
  const nextBtn = document.getElementById('quiz-next');
  const resultWrap = document.getElementById('quiz-result-wrap');
  const questionWrap = document.getElementById('quiz-question-wrap');
  const scoreEl = document.getElementById('quiz-score');
  const scoreMsgEl = document.getElementById('quiz-score-msg');
  const restartBtn = document.getElementById('quiz-restart');

  if (!questionEl) return;

  // Fetch quiz data
  try {
    const res = await fetch('/api/quiz');
    const json = await res.json();
    state.quizData = json.questions;
  } catch {
    state.quizData = [
      { id: 1, question: 'What language did we learn together?', options: ['Spanish', 'Japanese', 'Tagalog', 'French'], answer: 2, explanation: 'Yes! We learned Tagalog together — one of my favorite memories! 🇵🇭' },
      { id: 2, question: 'What time were most of our best conversations?', options: ['Morning', 'Afternoon', 'Late night', 'Evening'], answer: 2, explanation: 'Those late-night chats were the most magical moments! 🌙' },
      { id: 3, question: 'What do I appreciate most about you?', options: ['Your humor', 'Your kindness', 'Your honesty', 'All of the above'], answer: 3, explanation: 'Everything about you is something to appreciate! ❤️' },
      { id: 4, question: 'How did this surprise make you feel?', options: ['Happy', 'Emotional', 'Loved', 'All of the above'], answer: 3, explanation: 'You deserve to feel all of that and so much more! 🌟' },
    ];
  }

  function renderQuestion() {
    const q = state.quizData[state.quizIndex];
    if (!q) return;

    progressEl.textContent = `Question ${state.quizIndex + 1} of ${state.quizData.length}`;
    questionEl.textContent = q.question;
    explanationEl.classList.add('hidden');
    nextBtn.classList.add('hidden');

    optionsEl.innerHTML = '';
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.textContent = opt;
      btn.setAttribute('aria-label', `Option: ${opt}`);
      btn.addEventListener('click', () => selectOption(i, btn));
      optionsEl.appendChild(btn);
    });
  }

  function selectOption(idx, btn) {
    const q = state.quizData[state.quizIndex];
    // Disable all options
    optionsEl.querySelectorAll('.quiz-option').forEach((b, i) => {
      b.disabled = true;
      b.classList.add(i === q.answer ? 'correct' : 'incorrect');
    });

    // Highlight selected
    if (idx === q.answer) {
      state.quizScore++;
      btn.classList.remove('incorrect');
      btn.classList.add('correct');
    } else {
      btn.classList.add('incorrect');
      // Highlight correct answer
      optionsEl.querySelectorAll('.quiz-option')[q.answer].classList.add('correct');
    }

    explanationEl.textContent = q.explanation;
    explanationEl.classList.remove('hidden');
    nextBtn.classList.remove('hidden');
  }

  nextBtn.addEventListener('click', () => {
    state.quizIndex++;
    if (state.quizIndex >= state.quizData.length) {
      showQuizResult();
    } else {
      renderQuestion();
    }
  });

  function showQuizResult() {
    questionWrap.classList.add('hidden');
    resultWrap.classList.remove('hidden');

    const pct = Math.round((state.quizScore / state.quizData.length) * 100);
    scoreEl.textContent = `${state.quizScore}/${state.quizData.length}`;

    let msg;
    if (pct === 100) msg = 'Perfect score! You know me so well 💖';
    else if (pct >= 75) msg = 'Impressive! You truly paid attention 🌟';
    else if (pct >= 50) msg = 'Not bad! There\'s always more to discover ✨';
    else msg = 'We need to talk more! 😊💬';

    scoreMsgEl.textContent = msg;
    spawnClickHearts(scoreEl, 8);
  }

  restartBtn.addEventListener('click', () => {
    state.quizIndex = 0;
    state.quizScore = 0;
    resultWrap.classList.add('hidden');
    questionWrap.classList.remove('hidden');
    renderQuestion();
  });

  renderQuestion();
}

/* — Feature 4: Click-anywhere hearts toggle — */
function initHeartsFeature() {
  const btn = document.getElementById('btn-hearts');
  if (!btn) return;

  btn.addEventListener('click', () => {
    state.heartsActive = !state.heartsActive;
    btn.textContent = state.heartsActive ? 'Stop Hearts 💔' : 'Release Hearts 💕';
    showToast(state.heartsActive ? 'Click anywhere for hearts! 💖' : 'Hearts stopped 💔');
  });
}

/* Global click → hearts */
function initGlobalClickHearts() {
  const layer = document.getElementById('click-hearts-layer');
  if (!layer) return;

  document.addEventListener('click', (e) => {
    if (!state.heartsActive) return;
    // Skip buttons and links
    if (e.target.closest('button, a, input, .music-player')) return;
    createClickHeart(layer, e.clientX, e.clientY);
  });
}

function createClickHeart(layer, x, y) {
  const EMOJIS = ['❤️', '💖', '💗', '💓', '💕', '🌸', '✨', '💫'];
  const count = randInt(2, 5);

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'click-heart';
    el.textContent = randItem(EMOJIS);
    el.style.left = `${x + rand(-20, 20)}px`;
    el.style.top = `${y + rand(-10, 10)}px`;
    el.style.setProperty('--rot', `${rand(-30, 30)}deg`);
    el.style.fontSize = `${rand(1, 2)}rem`;
    el.style.animationDelay = `${rand(0, 0.3)}s`;
    layer.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }
}

/** Spawn hearts around a specific element */
function spawnClickHearts(el, count = 5) {
  const layer = document.getElementById('click-hearts-layer');
  if (!el || !layer) return;
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  createClickHeart(layer, cx, cy, count);
}

/* ═══════════════════════════════════════════════════════════════════════
   11. BIRTHDAY LETTER — DATE
═══════════════════════════════════════════════════════════════════════ */
function initLetter() {
  const dateEl = document.getElementById('letter-date');
  if (!dateEl) return;

  const now = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  dateEl.textContent = now.toLocaleDateString('en-US', options);
}

/* ═══════════════════════════════════════════════════════════════════════
   12. MUSIC PLAYER
═══════════════════════════════════════════════════════════════════════ */
function initMusicPlayer() {
  const audio = document.getElementById('bg-audio');
  const playBtn = document.getElementById('btn-play');
  const prevBtn = document.getElementById('btn-prev');
  const nextBtn = document.getElementById('btn-next');
  const progressBar = document.getElementById('music-progress');
  const volumeBar = document.getElementById('music-volume');
  const currentTimeEl = document.getElementById('music-current-time');
  const totalTimeEl = document.getElementById('music-total-time');

  if (!audio || !playBtn) return;

  // Set initial volume
  audio.volume = 0.6;

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function updatePlayBtn() {
    playBtn.textContent = state.musicPlaying ? '⏸' : '▶';
    playBtn.setAttribute('aria-label', state.musicPlaying ? 'Pause music' : 'Play music');
  }

  playBtn.addEventListener('click', () => {
    if (state.musicPlaying) {
      audio.pause();
      state.musicPlaying = false;
    } else {
      audio.play().then(() => {
        state.musicPlaying = true;
        updatePlayBtn();
      }).catch(() => {
        showToast('public\assets\gr0za-birthday-happy-birthday-503371.mp3');
      });
    }
    updatePlayBtn();
  });

  // Progress bar update
  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    progressBar.value = pct;
    currentTimeEl.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener('loadedmetadata', () => {
    totalTimeEl.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('ended', () => {
    state.musicPlaying = false;
    updatePlayBtn();
    progressBar.value = 0;
    currentTimeEl.textContent = '0:00';
  });

  // Seek
  progressBar.addEventListener('input', () => {
    if (!audio.duration) return;
    audio.currentTime = (progressBar.value / 100) * audio.duration;
  });

  // Volume
  volumeBar.addEventListener('input', () => {
    audio.volume = volumeBar.value / 100;
  });

  // Prev/Next — just restart or toggle (single track)
  prevBtn.addEventListener('click', () => {
    audio.currentTime = 0;
  });

  nextBtn.addEventListener('click', () => {
    audio.currentTime = 0;
    audio.play().catch(() => { });
    state.musicPlaying = true;
    updatePlayBtn();
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   13. FINAL SURPRISE — GIFT BOX + CONFETTI
═══════════════════════════════════════════════════════════════════════ */
function initGiftBox() {
  const giftBox = document.getElementById('gift-box');
  const finalMsg = document.getElementById('final-message');
  const confettiCanvas = document.getElementById('confetti-canvas');
  if (!giftBox) return;

  function openGift() {
    if (state.giftOpened) return;
    state.giftOpened = true;

    // Animate the lid
    giftBox.classList.add('opened');
    giftBox.setAttribute('aria-expanded', 'true');

    // Show confetti canvas
    if (confettiCanvas) {
      confettiCanvas.style.display = 'block';
      startConfetti(confettiCanvas);
    }

    // Show final message after delay
    setTimeout(() => {
      if (finalMsg) {
        finalMsg.classList.remove('hidden');
        // Spawn celebration hearts
        for (let i = 0; i < 20; i++) {
          setTimeout(() => {
            const layer = document.getElementById('click-hearts-layer');
            if (layer) {
              createClickHeart(
                layer,
                rand(window.innerWidth * 0.2, window.innerWidth * 0.8),
                rand(window.innerHeight * 0.3, window.innerHeight * 0.7)
              );
            }
          }, i * 120);
        }
      }
    }, 800);

    showToast('Happy Birthday! 🎉💖');
  }

  giftBox.addEventListener('click', openGift);
  giftBox.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openGift(); }
  });
}

/* ─── Confetti Engine ─── */
function startConfetti(canvas) {
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const COLORS = [
    '#ff6eb4', '#ffd97d', '#a855f7', '#60dfcd',
    '#ff9de2', '#ffe066', '#c77dff', '#ff6b6b',
    '#06d6a0', '#118ab2',
  ];

  const SHAPES = ['rect', 'circle', 'ribbon'];

  const pieces = Array.from({ length: 180 }, () => ({
    x: rand(0, canvas.width),
    y: rand(-canvas.height * 0.3, 0),
    vx: rand(-3, 3),
    vy: rand(3, 8),
    width: rand(8, 18),
    height: rand(4, 10),
    color: randItem(COLORS),
    shape: randItem(SHAPES),
    rotation: rand(0, Math.PI * 2),
    rotSpeed: rand(-0.1, 0.1),
    alpha: 1,
    life: 0,
    maxLife: rand(120, 240),
  }));

  let fireworks = [];
  spawnFirework();
  setTimeout(spawnFirework, 800);
  setTimeout(spawnFirework, 1600);

  function spawnFirework() {
    const x = rand(canvas.width * 0.2, canvas.width * 0.8);
    const y = rand(canvas.height * 0.1, canvas.height * 0.5);
    const color = randItem(COLORS);
    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * Math.PI * 2;
      const speed = rand(3, 10);
      fireworks.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        alpha: 1,
        r: rand(2, 5),
        life: 0,
        maxLife: rand(40, 80),
        tail: [],
      });
    }
  }

  let animId;
  let frame = 0;

  function drawConfettiPiece(p) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);

    if (p.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, p.width / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.shape === 'ribbon') {
      ctx.beginPath();
      ctx.ellipse(0, 0, p.width / 2, p.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
    }
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;

    // Confetti pieces
    pieces.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // gravity
      p.vx *= 0.99;
      p.rotation += p.rotSpeed;
      p.life++;
      if (p.y > canvas.height * 0.9) p.alpha -= 0.02;
      if (p.alpha > 0) drawConfettiPiece(p);
    });

    // Firework particles
    fireworks = fireworks.filter((fw) => {
      fw.tail.push({ x: fw.x, y: fw.y });
      if (fw.tail.length > 6) fw.tail.shift();

      fw.x += fw.vx;
      fw.y += fw.vy;
      fw.vy += 0.15;
      fw.vx *= 0.97;
      fw.life++;
      fw.alpha = 1 - fw.life / fw.maxLife;

      if (fw.alpha <= 0) return false;

      // Draw tail
      fw.tail.forEach((pt, i) => {
        ctx.save();
        ctx.globalAlpha = fw.alpha * (i / fw.tail.length) * 0.5;
        ctx.fillStyle = fw.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, fw.r * (i / fw.tail.length), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      ctx.save();
      ctx.globalAlpha = fw.alpha;
      ctx.fillStyle = fw.color;
      ctx.shadowColor = fw.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(fw.x, fw.y, fw.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      return true;
    });

    // Spawn new fireworks periodically
    if (frame === 120) spawnFirework();
    if (frame === 200) spawnFirework();

    // Stop after all fade
    const alive = pieces.some((p) => p.alpha > 0);
    const fwAlive = fireworks.length > 0;

    if (alive || fwAlive || frame < 260) {
      animId = requestAnimationFrame(animate);
    } else {
      canvas.style.display = 'none';
      cancelAnimationFrame(animId);
    }
  }

  animId = requestAnimationFrame(animate);
}

/* ═══════════════════════════════════════════════════════════════════════
   14. PARALLAX on SCROLL
═══════════════════════════════════════════════════════════════════════ */
function initParallax() {
  const moon = document.querySelector('.moon-glow');
  const heroParticles = document.getElementById('hero-particles');

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      if (moon) moon.style.transform = `translateY(${scrollY * 0.25}px)`;
      if (heroParticles) heroParticles.style.transform = `translateY(${scrollY * 0.15}px)`;
      ticking = false;
    });
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   15. SMOOTH SCROLL FOR CTA
═══════════════════════════════════════════════════════════════════════ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Back to top
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   16. BACKGROUND AMBIENT ORBS (section decoration)
═══════════════════════════════════════════════════════════════════════ */
function initAmbientOrbs() {
  const sections = ['memories', 'fun', 'surprise'];
  const orbs = [
    { color: 'rgba(255,110,180,0.04)', size: 500, x: -150, y: 100 },
    { color: 'rgba(168,85,247,0.04)', size: 400, x: '80%', y: '60%' },
    { color: 'rgba(255,217,125,0.03)', size: 350, x: '50%', y: -100 },
  ];

  sections.forEach((id) => {
    const section = document.getElementById(id);
    if (!section) return;
    orbs.forEach((orb, i) => {
      const el = document.createElement('div');
      el.style.cssText = `
        position:absolute;
        width:${orb.size}px;
        height:${orb.size}px;
        border-radius:50%;
        background:radial-gradient(circle,${orb.color} 0%,transparent 70%);
        left:${typeof orb.x === 'number' ? orb.x + 'px' : orb.x};
        top:${typeof orb.y === 'number' ? orb.y + 'px' : orb.y};
        pointer-events:none;
        z-index:0;
        animation:orbFloat ${8 + i * 2}s ease-in-out infinite alternate;
        animation-delay:${i * 1.5}s;
      `;
      section.appendChild(el);
    });
  });

  // Inject keyframes
  if (!document.getElementById('orb-keyframes')) {
    const style = document.createElement('style');
    style.id = 'orb-keyframes';
    style.textContent = `
      @keyframes orbFloat {
        from { transform: translate(0,0) scale(1); }
        to   { transform: translate(20px,30px) scale(1.05); }
      }
    `;
    document.head.appendChild(style);
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   17. SECTION EYEBROW TYPING EFFECT
═══════════════════════════════════════════════════════════════════════ */
function initTypingEffects() {
  const eyebrows = document.querySelectorAll('.section-eyebrow');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const text = el.textContent;
          el.textContent = '';
          el.style.opacity = '1';
          let i = 0;
          const interval = setInterval(() => {
            el.textContent += text[i];
            i++;
            if (i >= text.length) clearInterval(interval);
          }, 50);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  eyebrows.forEach((el) => {
    el.style.opacity = '0';
    observer.observe(el);
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   18. CURSOR SPARKLE TRAIL
═══════════════════════════════════════════════════════════════════════ */
function initCursorTrail() {
  const layer = document.getElementById('click-hearts-layer');
  if (!layer) return;

  const TRAIL_EMOJIS = ['✦', '✧', '·', '⋆', '✨'];
  let lastTime = 0;

  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastTime < 80) return; // throttle
    lastTime = now;

    if (Math.random() > 0.6) return; // sparse

    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed;
      left:${e.clientX}px;
      top:${e.clientY}px;
      font-size:${rand(0.6, 1)}rem;
      color:${Math.random() > 0.5 ? 'var(--clr-pink)' : 'var(--clr-gold)'};
      pointer-events:none;
      z-index:700;
      animation:cursorTrailFade 0.8s ease-out forwards;
      transform:translate(-50%,-50%);
      user-select:none;
    `;
    el.textContent = randItem(TRAIL_EMOJIS);
    layer.appendChild(el);
    setTimeout(() => el.remove(), 900);
  });

  if (!document.getElementById('cursor-trail-kf')) {
    const style = document.createElement('style');
    style.id = 'cursor-trail-kf';
    style.textContent = `
      @keyframes cursorTrailFade {
        from { opacity:0.9; transform:translate(-50%,-50%) scale(1); }
        to   { opacity:0;   transform:translate(-50%,-70%) scale(0.4); }
      }
    `;
    document.head.appendChild(style);
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   19. WELCOME TOAST
═══════════════════════════════════════════════════════════════════════ */
function initWelcomeToast() {
  setTimeout(() => {
    showToast('🎂 Happy Birthday! Your surprise is ready…');
  }, 3000);
}


/* ═══════════════════════════════════════════════════════════════════════
   19b. INTERACTIVE CAKE CUTTING ANIMATION
═══════════════════════════════════════════════════════════════════════ */
function initCakeAnimation() {
  const cakeWrapper = document.getElementById('cake-wrapper');
  const candleWrapper = document.getElementById('candle-wrapper');
  const cakeHint = document.getElementById('cake-hint');
  const overlay = document.getElementById('cake-slice-overlay');
  const closeBtn = document.getElementById('btn-close-slice');
  const confettiCanvas = document.getElementById('confetti-canvas');

  if (!cakeWrapper || !candleWrapper || !cakeHint || !overlay) return;

  let candleBlown = false;
  let cakeCut = false;

  // Blow candle
  candleWrapper.addEventListener('click', (e) => {
    e.stopPropagation();
    blowCandle();
  });

  function blowCandle() {
    if (candleBlown) return;
    candleBlown = true;
    candleWrapper.classList.add('blown');
    cakeHint.textContent = "🎂 Tap the cake to cut a slice!";
    cakeHint.style.color = "var(--clr-pink-light)";
    showToast("🕯️ You blew the candle! Make a wish... 💖");
    spawnClickHearts(candleWrapper, 10);
  }

  // Cut cake
  cakeWrapper.addEventListener('click', () => {
    if (!candleBlown) {
      blowCandle();
      return;
    }
    if (cakeCut) return;
    cakeCut = true;
    cakeWrapper.classList.add('cut');
    
    // Show slice overlay & start confetti after brief delay
    setTimeout(() => {
      overlay.classList.remove('hidden');
      if (confettiCanvas) {
        confettiCanvas.style.display = 'block';
        startConfetti(confettiCanvas);
      }
    }, 600);

    showToast("🍰 Here is a slice of cake for you, Yana! ❤️");
    spawnClickHearts(cakeWrapper, 15);
  });

  // Reset after closed
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      overlay.classList.add('hidden');
      
      setTimeout(() => {
        candleBlown = false;
        cakeCut = false;
        candleWrapper.classList.remove('blown');
        cakeWrapper.classList.remove('cut');
        cakeHint.textContent = "🕯️ Tap the candle to blow it out first!";
        cakeHint.style.color = "var(--clr-text-secondary)";
      }, 500);
    });
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   20. INIT ALL
═══════════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Initialise canvas and particles immediately (before loader finishes)
  initStarfield();
  initHeroParticles();

  // Loader controls everything else
  initLoader();

  // Features that don't need to wait for loader
  initSmoothScroll();
  initScrollReveal();
  initTimeline();
  initGallery();
  initFlipCards();
  initAwesomeButton();
  initComplimentGenerator();
  initQuiz();
  initHeartsFeature();
  initGlobalClickHearts();
  initLetter();
  initCakeAnimation();
  initMusicPlayer();
  initGiftBox();
  initParallax();
  initAmbientOrbs();
  initTypingEffects();
  initCursorTrail();
  initWelcomeToast();

  // Window resize: rebuild confetti canvas dimensions if needed
  window.addEventListener('resize', debounce(() => {
    const confettiCanvas = document.getElementById('confetti-canvas');
    if (confettiCanvas && confettiCanvas.style.display === 'block') {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    }
  }, 300));
});
