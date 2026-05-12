/* =============================================================================
   $HATE — shared site engine v2
   - persistent state via localStorage
   - wallet nickname assignment
   - mood propagation
   - achievements + toasts
   - audio synth (ambient hum + UI beeps)
   - scrolling event ticker
   - flow-field background atmosphere
   - HATE eye that follows the cursor
   - custom cursor with trail
   - animated counters
   - real backend API caller (with local fallback)
   ============================================================================= */

(() => {
  'use strict';

  // ---- persistent state ----
  const STORAGE_KEY = 'hate.state.v1';
  const defaultState = {
    nickname: null,
    visitCount: 0,
    lastVisit: 0,
    streak: 0,
    achievements: [],
    moodSeen: { tolerant: false, irritated: false, enraged: false, tender: false, breakdown: false },
    confessions: [],
    audioOn: true,
    firstVisit: true,
    feedCount: 0,
    pokeCount: 0,
    sanity: 68,
    hunger: 42,
    chatHistory: [],
  };
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? Object.assign({}, defaultState, JSON.parse(raw)) : Object.assign({}, defaultState);
    } catch { return Object.assign({}, defaultState); }
  }
  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(window.HATE.state)); } catch {}
  }

  // ---- nickname pool ----
  const NICKNAMES = [
    'tuesday boy', 'the apologizer', 'former bored ape victim', 'she who types in caps',
    'the one who asked about marriage', 'jpeg widow', 'wen.ser', 'liquidated again',
    'the man who buys tops', 'pigeon-adjacent', 'a moderate disappointment',
    'the silent screamer', 'three-decimal romeo', 'mid-cap mike', 'an eventual exit',
    'the warden\'s pet', 'a fond regret', 'someone\'s grandchild', 'the polite menace',
    'an unhelpful mirror', 'reply guy in remission', 'the gas-fee martyr',
    'the second-best son', 'unread messages', 'the hopeful idiot', 'a slow leak',
    'the chart-watcher', 'former believer', 'the patient grinder', 'the soft no',
  ];
  function assignNickname() {
    const s = window.HATE.state;
    if (!s.nickname) {
      s.nickname = NICKNAMES[Math.floor(Math.random() * NICKNAMES.length)];
      saveState();
    }
    return s.nickname;
  }

  // ---- mood derivation ----
  function moodForState() {
    const s = window.HATE.state;
    if (s.sanity < 10) return 'breakdown';
    if (s.sanity < 35) return 'enraged';
    if (s.sanity < 65) return 'irritated';
    if (s.sanity < 90) return 'tolerant';
    return 'tender';
  }
  function applyMood(m) {
    document.body.className = document.body.className.replace(/mood-\S+/g, '').trim();
    document.body.classList.add('mood-' + m);
    document.querySelectorAll('.nav-mood-dot').forEach(d => d.title = 'mood: ' + m);
    document.querySelectorAll('[data-mood-label]').forEach(l => l.textContent = m);
    if (!window.HATE.state.moodSeen[m]) {
      window.HATE.state.moodSeen[m] = true;
      saveState();
      unlock('saw_mood_' + m, 'witness: ' + m);
    }
  }

  // ---- achievements ----
  const ACHIEVEMENTS = {
    enter:           { name: 'entered the chamber' },
    feed_first:      { name: 'first offering' },
    feed_10:         { name: 'devout' },
    poke_hate:       { name: 'finger of god' },
    konami:          { name: 'shadow walker' },
    confess:         { name: 'confessor' },
    visit_all:       { name: 'completionist' },
    streak_3:        { name: 'returned three times' },
    streak_7:        { name: 'one week sentenced' },
    nicknamed:       { name: 'named by hate' },
    saw_mood_tender: { name: 'saw a soft moment' },
    saw_mood_breakdown: { name: 'witnessed the descent' },
    saw_mood_enraged:{ name: 'felt the heat' },
    saw_mood_irritated: { name: 'felt the cold' },
    saw_mood_tolerant: { name: 'felt the lull' },
    presale_visit:   { name: 'window shopper' },
    presale_amount:  { name: 'a contribution, regrettably' },
    lore_complete:   { name: 'read the lore' },
    manifesto:       { name: 'opened the door' },
    leaderboard_top: { name: 'climbed the wall' },
    eye_caught:      { name: 'caught the eye' },
    cursor_idle:     { name: 'sat still long enough' },
  };
  function unlock(id, name) {
    const s = window.HATE.state;
    if (s.achievements.includes(id)) return;
    s.achievements.push(id);
    saveState();
    showAchievement(name || (ACHIEVEMENTS[id]?.name) || id);
  }
  function showAchievement(name) {
    const a = document.createElement('div');
    a.className = 'achievement';
    a.innerHTML = `<div class="a-tag">// medal unlocked</div><div class="a-name">${name}</div>`;
    document.body.appendChild(a);
    requestAnimationFrame(() => a.classList.add('show'));
    audioBeep(990, 0.16, 0.04);
    setTimeout(() => audioBeep(1320, 0.12, 0.03), 90);
    setTimeout(() => {
      a.classList.remove('show');
      setTimeout(() => a.remove(), 800);
    }, 4500);
  }

  // ---- audio ----
  let ctx = null, hum = null;
  function audioInit() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filt = ctx.createBiquadFilter();
      osc.type = 'sawtooth'; osc.frequency.value = 55;
      filt.type = 'lowpass'; filt.frequency.value = 180;
      gain.gain.value = window.HATE.state.audioOn ? 0.018 : 0;
      osc.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
      osc.start();
      hum = gain;
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine'; osc2.frequency.value = 0.22;
      const lfoGain = ctx.createGain(); lfoGain.gain.value = 28;
      osc2.connect(lfoGain); lfoGain.connect(osc.frequency);
      osc2.start();
    } catch (e) { console.warn('audio init failed', e); }
  }
  function audioBeep(freq = 600, dur = 0.08, vol = 0.04) {
    if (!ctx || !window.HATE.state.audioOn) return;
    try {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'square'; o.frequency.value = freq;
      g.gain.value = 0;
      g.gain.setTargetAtTime(vol, ctx.currentTime, 0.005);
      g.gain.setTargetAtTime(0, ctx.currentTime + dur, 0.02);
      o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + dur + 0.1);
    } catch {}
  }
  function audioSay() { audioBeep(220 + Math.random() * 60, 0.13, 0.025); }
  function audioToggle() {
    window.HATE.state.audioOn = !window.HATE.state.audioOn;
    saveState();
    if (hum) hum.gain.value = window.HATE.state.audioOn ? 0.018 : 0;
    return window.HATE.state.audioOn;
  }

  // ---- nav builder ----
  function buildNav(activePage) {
    const links = [
      { href: 'index.html', label: 'chamber', id: 'chamber' },
      { href: 'presale.html', label: 'buy', id: 'presale' },
      { href: 'staking.html', label: 'stake', id: 'staking' },
      { href: 'features.html', label: 'features', id: 'features' },
      { href: 'bribe.html', label: 'feed draw', id: 'bribe' },
      { href: 'confessional.html', label: 'confess', id: 'confessional' },
      { href: 'leaderboard.html', label: 'wall', id: 'leaderboard' },
      { href: 'tokenomics.html', label: 'tokenomics', id: 'tokenomics' },
      { href: 'roadmap.html', label: 'roadmap', id: 'roadmap' },
      { href: 'lore.html', label: 'lore', id: 'lore' },
    ];
    const html = `
      <nav class="nav">
        <a href="index.html" class="nav-logo">
          <span class="nav-glyph">◇</span>
          <span class="nav-word">$ HATE</span>
          <span class="v">// chamber 001</span>
        </a>
        <button class="nav-toggle" aria-label="toggle menu" onclick="this.parentElement.querySelector('.nav-links').classList.toggle('open')">≡</button>
        <div class="nav-links">
          ${links.map(l => `<a href="${l.href}"${l.id === activePage ? ' class="active"' : ''}>${l.label}</a>`).join('')}
        </div>
        <div class="nav-status">
          <span class="nav-mood-dot"></span>
          <span data-mood-label>${moodForState()}</span>
          <span style="opacity: 0.4">|</span>
          <span id="nav-nickname" title="your hate-given name">${window.HATE.state.nickname || 'no name'}</span>
          <button class="btn btn-sm" id="audio-btn" style="padding: 4px 8px;" aria-label="toggle audio">${window.HATE.state.audioOn ? '♪' : '×'}</button>
        </div>
      </nav>
    `;
    document.body.insertAdjacentHTML('afterbegin', html);
    document.getElementById('audio-btn')?.addEventListener('click', () => {
      const on = audioToggle();
      document.getElementById('audio-btn').textContent = on ? '♪' : '×';
    });
  }

  // ---- ticker ----
  const TICKER_ITEMS = [
    'wallet 0x4f9a fed 12,000 $hate',
    'hate roasted "tuesday boy" again',
    'a confession was archived',
    'a wallet attempted to flatter hate. it did not work.',
    'sanity restored to 71%',
    'someone asked about price. they have been added to the list.',
    'hate has been awake for 47 hours',
    '0x9d31 dumped 1.2M $hate. nicknamed "the soft no"',
    'death spiral averted by community burn',
    'today\'s pest: 0x44ba',
    'today\'s chosen one: 0x4f9a',
    'a new prophecy was posted',
    'hate said something tender. nobody screenshotted it. they will regret this.',
    'an idiot typed gm. hate replied "no."',
    '+ 0.42 sol contributed to presale',
    'hate is currently mood: irritated. as usual.',
  ];
  function buildTicker() {
    const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
    document.body.insertAdjacentHTML('beforeend', `
      <div class="ticker">
        <div class="ticker-track">
          ${items.map(t => `<span><span class="dot">▲</span>${t}</span>`).join('')}
        </div>
      </div>`);
  }

  // ---- overlays ----
  function buildOverlays() {
    document.body.insertAdjacentHTML('afterbegin', `
      <div class="fx-grain"></div>
      <div class="fx-scanlines"></div>
      <div class="fx-vignette"></div>
    `);
  }

  // ---- atmosphere (flow field background) ----
  function buildAtmosphere() {
    if (document.getElementById('atmosphere')) return;
    const canvas = document.createElement('canvas');
    canvas.id = 'atmosphere';
    document.body.insertBefore(canvas, document.body.firstChild);
    const ctx2d = canvas.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w, h, mx = -1000, my = -1000;
    function resize() {
      canvas.width = (w = window.innerWidth) * dpr;
      canvas.height = (h = window.innerHeight) * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx2d.scale(dpr, dpr);
    }
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });

    const N = 110;
    const pts = [];
    for (let i = 0; i < N; i++) pts.push({
      x: Math.random() * w, y: Math.random() * h,
      vx: 0, vy: 0,
      life: Math.random() * 300, max: 200 + Math.random() * 300,
    });

    let t = 0;
    function tick() {
      t += 0.005;
      ctx2d.fillStyle = 'rgba(5, 7, 10, 0.10)';
      ctx2d.fillRect(0, 0, w, h);
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#7fff7f';
      pts.forEach(p => {
        const a = (Math.sin(p.x * 0.003 + t) + Math.cos(p.y * 0.003 + t * 0.7)) * Math.PI;
        p.vx += Math.cos(a) * 0.07;
        p.vy += Math.sin(a) * 0.07;
        if (mx > 0) {
          const dx = mx - p.x, dy = my - p.y;
          const d = Math.hypot(dx, dy);
          if (d < 220 && d > 4) { p.vx += (dx / d) * 0.2; p.vy += (dy / d) * 0.2; }
        }
        p.vx *= 0.92; p.vy *= 0.92;
        p.x += p.vx; p.y += p.vy;
        p.life++;
        if (p.life > p.max || p.x < -10 || p.x > w + 10 || p.y < -10 || p.y > h + 10) {
          p.x = Math.random() * w; p.y = Math.random() * h;
          p.vx = p.vy = 0; p.life = 0;
          p.max = 150 + Math.random() * 300;
        }
        const alpha = Math.sin((p.life / p.max) * Math.PI) * 0.65;
        ctx2d.fillStyle = accent;
        ctx2d.globalAlpha = alpha;
        ctx2d.fillRect(p.x - 1, p.y - 1, 2, 2);
      });
      ctx2d.globalAlpha = 1;
      requestAnimationFrame(tick);
    }
    tick();
  }

  // ---- HATE eye (follows cursor on every page) ----
  function buildEye() {
    if (document.getElementById('hate-eye')) return;
    const eye = document.createElement('div');
    eye.id = 'hate-eye';
    eye.setAttribute('role', 'img');
    eye.setAttribute('aria-label', 'hate watches your cursor');
    eye.innerHTML = `
      <svg viewBox="-30 -30 60 60" aria-hidden="true" focusable="false">
        <ellipse cx="0" cy="0" rx="26" ry="14" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.7"/>
        <circle id="eye-pupil" cx="0" cy="0" r="7" fill="currentColor"/>
        <circle cx="0" cy="0" r="2.5" fill="#000"/>
      </svg>
      <span class="eye-label">watching</span>
    `;
    document.body.appendChild(eye);
    const pupil = eye.querySelector('#eye-pupil');
    let lookX = 0, lookY = 0, idleSince = Date.now();
    window.addEventListener('mousemove', (e) => {
      const r = eye.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      const a = Math.atan2(dy, dx);
      const d = Math.min(9, Math.hypot(dx, dy) / 28);
      lookX = Math.cos(a) * d;
      lookY = Math.sin(a) * d * 0.6;
      idleSince = Date.now();
    });
    eye.addEventListener('click', () => unlock('eye_caught'));
    function frame() {
      const cur = pupil.getAttribute('cx') ? parseFloat(pupil.getAttribute('cx')) : 0;
      const curY = pupil.getAttribute('cy') ? parseFloat(pupil.getAttribute('cy')) : 0;
      pupil.setAttribute('cx', cur + (lookX - cur) * 0.18);
      pupil.setAttribute('cy', curY + (lookY - curY) * 0.18);
      // sat-still achievement
      if (Date.now() - idleSince > 90000) unlock('cursor_idle');
      requestAnimationFrame(frame);
    }
    frame();
  }

  // ---- custom cursor (ring + dot) ----
  function buildCursor() {
    if (document.getElementById('hate-cursor')) return;
    const ring = document.createElement('div'); ring.id = 'hate-cursor';
    const dot = document.createElement('div'); dot.id = 'hate-cursor-dot';
    document.body.appendChild(ring); document.body.appendChild(dot);
    let dx = -100, dy = -100, cx = -100, cy = -100;
    window.addEventListener('mousemove', (e) => {
      dx = e.clientX; dy = e.clientY;
      ring.style.left = dx + 'px'; ring.style.top = dy + 'px';
    });
    function loop() {
      cx += (dx - cx) * 0.22;
      cy += (dy - cy) * 0.22;
      dot.style.left = cx + 'px'; dot.style.top = cy + 'px';
      requestAnimationFrame(loop);
    }
    loop();
    document.addEventListener('mouseover', (e) => {
      if (e.target.matches('a, button, input, textarea, .qa-btn, .tier, .faq-item, .tab, .nick-card, .conf-card, .phase-card')) {
        ring.classList.add('hover');
      }
    }, true);
    document.addEventListener('mouseout', (e) => {
      if (e.target.matches('a, button, input, textarea, .qa-btn, .tier, .faq-item, .tab, .nick-card, .conf-card, .phase-card')) {
        ring.classList.remove('hover');
      }
    }, true);
  }

  // ---- counter helper ----
  function countUp(el, target, opts = {}) {
    const dur = opts.duration || 1600;
    const dec = opts.decimals || 0;
    const suf = opts.suffix || '';
    const pre = opts.prefix || '';
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      const v = target * e;
      el.textContent = pre + (dec ? v.toFixed(dec) : Math.floor(v).toLocaleString()) + suf;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  function setupCounters() {
    const els = document.querySelectorAll('[data-count]');
    if (!els.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting && !en.target.dataset.counted) {
          en.target.dataset.counted = '1';
          const t = parseFloat(en.target.dataset.count);
          const dec = parseInt(en.target.dataset.decimals || '0');
          const suf = en.target.dataset.suffix || '';
          const pre = en.target.dataset.prefix || '';
          countUp(en.target, t, { decimals: dec, suffix: suf, prefix: pre });
        }
      });
    });
    els.forEach(el => obs.observe(el));
  }

  // ---- text scramble (for headings) ----
  function scrambleText(el, finalText, opts = {}) {
    const dur = opts.duration || 900;
    const chars = '!<>-_\\/[]{}—=+*^?#________';
    const queue = [];
    const old = el.textContent;
    const len = Math.max(old.length, finalText.length);
    for (let i = 0; i < len; i++) {
      const from = old[i] || '';
      const to = finalText[i] || '';
      const start = Math.floor(Math.random() * 30);
      const end = start + Math.floor(Math.random() * 30) + 10;
      queue.push({ from, to, start, end });
    }
    let frame = 0;
    function update() {
      let output = '';
      let complete = 0;
      for (let i = 0; i < queue.length; i++) {
        const { from, to, start, end } = queue[i];
        if (frame >= end) { complete++; output += to; }
        else if (frame >= start) {
          if (Math.random() < 0.28) queue[i].char = chars[Math.floor(Math.random() * chars.length)];
          output += `<span style="opacity:0.6; color: var(--accent)">${queue[i].char || chars[Math.floor(Math.random()*chars.length)]}</span>`;
        } else { output += from; }
      }
      el.innerHTML = output;
      if (complete < queue.length) { frame++; requestAnimationFrame(update); }
    }
    requestAnimationFrame(update);
  }
  function setupScramble() {
    document.querySelectorAll('[data-scramble]').forEach(el => {
      const final = el.textContent;
      setTimeout(() => scrambleText(el, final), 150);
    });
  }

  // ---- backend API caller ----
  async function callApi(message, extras = {}) {
    if (!window.HATE_API) return null;
    try {
      const res = await fetch(window.HATE_API.replace(/\/$/, '') + '/api/hate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          nickname: window.HATE.state.nickname,
          mood: moodForState(),
          sanity: window.HATE.state.sanity,
          history: window.HATE.state.chatHistory.slice(-6),
          ...extras,
        }),
      });
      if (!res.ok) throw new Error('api ' + res.status);
      const j = await res.json();
      return j.response;
    } catch (e) {
      console.warn('[hate api] failed, falling back to local', e);
      return null;
    }
  }
  function rememberTurn(role, content) {
    if (!Array.isArray(window.HATE.state.chatHistory)) window.HATE.state.chatHistory = [];
    window.HATE.state.chatHistory.push({ role, content });
    if (window.HATE.state.chatHistory.length > 30) window.HATE.state.chatHistory.shift();
    saveState();
  }

  // ---- visit / streak tracking ----
  function trackVisit() {
    const s = window.HATE.state;
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const daysSince = s.lastVisit ? Math.floor((now - s.lastVisit) / dayMs) : 0;
    s.visitCount = (s.visitCount || 0) + 1;
    if (s.firstVisit) { s.firstVisit = false; s.streak = 1; }
    else if (daysSince === 1) { s.streak = (s.streak || 0) + 1; }
    else if (daysSince > 1) { s.streak = 1; }
    s.lastVisit = now;
    saveState();
    if (s.streak >= 3) unlock('streak_3');
    if (s.streak >= 7) unlock('streak_7');
  }
  function trackPage(pageId) {
    const visited = JSON.parse(sessionStorage.getItem('hate.visited') || '[]');
    if (!visited.includes(pageId)) {
      visited.push(pageId);
      sessionStorage.setItem('hate.visited', JSON.stringify(visited));
    }
    if (visited.length >= 7) unlock('visit_all');
    if (pageId === 'chamber') unlock('enter');
    if (pageId === 'presale') unlock('presale_visit');
  }

  // ---- public API ----
  window.HATE = {
    state: loadState(),
    save: saveState,
    assignNickname,
    moodForState,
    applyMood,
    unlock,
    showAchievement,
    audioInit,
    audioBeep,
    audioSay,
    audioToggle,
    buildOverlays,
    buildNav,
    buildTicker,
    buildAtmosphere,
    buildEye,
    buildCursor,
    setupCounters,
    setupScramble,
    countUp,
    callApi,
    rememberTurn,
    trackVisit,
    trackPage,
  };

  // ---- master init ----
  window.HATE.init = function (pageId, opts = {}) {
    buildOverlays();
    buildNav(pageId);
    buildTicker();
    if (!opts.noAtmosphere) buildAtmosphere();
    if (!opts.noEye) buildEye();
    // custom cursor removed — browser default is better UX
    setupCounters();
    setupScramble();
    applyMood(moodForState());
    trackVisit();
    trackPage(pageId);
    assignNickname();
    document.body.classList.add('page-loaded');
    document.addEventListener('click', () => audioInit(), { once: true });
    document.addEventListener('keydown', () => audioInit(), { once: true });

    // konami
    const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let k = 0;
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === konami[k].toLowerCase()) {
        k++;
        if (k === konami.length) { k = 0; unlock('konami'); document.body.classList.add('mood-tender'); setTimeout(() => applyMood(moodForState()), 30000); }
      } else { k = 0; }
    });
  };
})();
t.add('mood-tender'); setTimeout(() => applyMood(moodForState()), 30000); }
      } else { k = 0; }
    });
  };
})();
