document.documentElement.classList.add('enhanced');

(() => {
  'use strict';

  ['expedition.css', 'final-flow.css'].forEach(file => {
    if (!document.querySelector(`link[href='./${file}']`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `./${file}`;
      document.head.append(link);
    }
  });

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const pick = list => list[Math.floor(Math.random() * list.length)];
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const format = value => Number(value || 0).toLocaleString();
  const storageKey = 'aquanaut-demo-v3';
  const legacyKeys = ['aquanaut-demo-v2', 'aquanaut-demo-v1'];

  const ranks = [
    { name: 'Drifter', xp: 0 },
    { name: 'Diver', xp: 500 },
    { name: 'Seeker', xp: 1500 },
    { name: 'Guardian', xp: 4000 },
    { name: 'Aquanaut', xp: 10000 }
  ];

  const checkpoints = [
    { depth: 100, xp: 20 },
    { depth: 250, xp: 35 },
    { depth: 500, xp: 55 },
    { depth: 750, xp: 75 },
    { depth: 1000, xp: 100 },
    { depth: 1500, xp: 150 },
    { depth: 2000, xp: 225 },
    { depth: 2500, xp: 325 },
    { depth: 3000, xp: 500 },
    { depth: 3400, xp: 650 }
  ];

  const artifacts = [
    { name: 'Coral Coin', rarity: 'Common', symbol: '◈', lore: 'A trade piece recovered near the first gate.' },
    { name: 'Rusted Sextant', rarity: 'Common', symbol: '⌁', lore: 'Its etched horizon still aligns with the surface.' },
    { name: 'Ocean Charm', rarity: 'Common', symbol: '◇', lore: 'Worn smooth by generations of temple pilgrims.' },
    { name: 'Pearl Fragment', rarity: 'Common', symbol: '◌', lore: 'A sliver from a pearl too large to carry.' },
    { name: 'Navigator Compass', rarity: 'Rare', symbol: '⌖', lore: 'Its needle turns toward sealed chambers.' },
    { name: 'Temple Key', rarity: 'Rare', symbol: '†', lore: 'Cut for a door that no longer stands.' },
    { name: 'Siren Pendant', rarity: 'Rare', symbol: '♪', lore: 'A quiet melody follows it through the water.' },
    { name: 'Golden Conch', rarity: 'Rare', symbol: '◔', lore: 'It carries the echo of a ceremonial horn.' },
    { name: 'Leviathan Scale', rarity: 'Epic', symbol: '◩', lore: 'Too large to belong to any known creature.' },
    { name: 'Oracle Pearl', rarity: 'Epic', symbol: '●', lore: 'Its surface clouds before danger approaches.' },
    { name: 'Deepsea Crown', rarity: 'Epic', symbol: '♜', lore: 'Made for a ruler who never saw daylight.' },
    { name: 'Guardian Seal', rarity: 'Epic', symbol: '✦', lore: 'The mark of an order erased from every wall.' },
    { name: 'Trident Shard', rarity: 'Legendary', symbol: '♆', lore: 'Warm despite three thousand years below.' },
    { name: 'Crown of Tides', rarity: 'Legendary', symbol: '♛', lore: 'The current bends around its broken points.' },
    { name: 'Poseidon Fragment', rarity: 'Legendary', symbol: '◆', lore: 'A piece of something once mistaken for a god.' },
    { name: 'Heart of Atlantis', rarity: 'Legendary', symbol: '♥', lore: 'It beats once when brought near the throne.' },
    { name: 'Eye of Atlantis', rarity: 'Mythic', symbol: '◉', lore: 'The relic appears to be observing you.' },
    { name: 'Eternal Trident', rarity: 'Mythic', symbol: 'Ψ', lore: 'No corrosion marks its impossible metal.' },
    { name: 'Crown of Poseidon', rarity: 'Mythic', symbol: '♚', lore: 'The last crown named in the city archives.' },
    { name: 'The First Pearl', rarity: 'Mythic', symbol: '◎', lore: 'Older than the ruins built around it.' }
  ];

  const rarityBonus = { Common: 100, Rare: 300, Epic: 750, Legendary: 2000, Mythic: 5000 };
  const rarityXP = { Common: 1, Rare: 2, Epic: 3, Legendary: 4, Mythic: 5 };
  const rarityClass = { Common: 'common', Rare: 'rare', Epic: 'epic', Legendary: 'legendary', Mythic: 'mythic' };

  const regions = [
    { name: 'Surface Camp', min: 0, max: 0, rank: 'Drifter', text: 'The safe expedition hub for records, missions and recovered relics.' },
    { name: 'Coral Gate', min: 100, max: 500, rank: 'Drifter', text: 'Bright coral ruins form the first entrance into Atlantis.' },
    { name: 'Sunken Temple', min: 500, max: 1200, rank: 'Diver', text: 'Golden sanctuaries conceal pressure traps and sealed routes.' },
    { name: 'Whale Trench', min: 1200, max: 2000, rank: 'Seeker', text: 'A dark canyon crossed by silhouettes larger than the ruins.' },
    { name: 'The Abyss', min: 2000, max: 3000, rank: 'Guardian', text: 'Nearly black water lit by unfamiliar creatures and fractured relics.' },
    { name: 'Throne of Atlantis', min: 3000, max: 3400, rank: 'Aquanaut', text: 'The royal city waits below the last surviving columns.' }
  ];

  const todayKey = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const weekKey = () => {
    const date = new Date();
    const day = date.getDay() || 7;
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - day + 1);
    return date.toISOString().slice(0, 10);
  };

  const freshDaily = () => ({ date: todayKey(), dives: 0, successful: 0, bestDepth: 0, artifacts: 0, safeReturns: 0 });
  const freshState = () => ({
    xp: 0,
    bestDepth: 0,
    highestDiveScore: 0,
    totalDives: 0,
    successfulDives: 0,
    deepestSafeReturn: 0,
    lowOxygenReturns: 0,
    perfectDives: 0,
    streak: 0,
    lastPlayedDate: '',
    joinDate: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    artifacts: [],
    equippedId: '',
    claimedMissions: [],
    soundEnabled: false,
    introChoiceSeen: false,
    onboardingCompleted: false,
    firstDiveComplete: false,
    weeklyKey: weekKey(),
    weeklyBestDepth: 0,
    daily: freshDaily()
  });

  let recoveredState = false;

  function normalizeState(input) {
    const output = { ...freshState(), ...(input || {}) };
    output.totalDives = Number(input?.totalDives ?? input?.dives ?? 0);
    output.artifacts = Array.isArray(input?.artifacts) ? input.artifacts : [];
    output.claimedMissions = Array.isArray(input?.claimedMissions) ? input.claimedMissions : [];
    output.daily = input?.daily && typeof input.daily === 'object' ? { ...freshDaily(), ...input.daily } : freshDaily();
    if (output.daily.date !== todayKey()) output.daily = freshDaily();
    if (output.weeklyKey !== weekKey()) {
      output.weeklyKey = weekKey();
      output.weeklyBestDepth = 0;
    }
    return output;
  }

  function loadState() {
    try {
      let raw = localStorage.getItem(storageKey);
      if (!raw) {
        for (const key of legacyKeys) {
          raw = localStorage.getItem(key);
          if (raw) break;
        }
      }
      return raw ? normalizeState(JSON.parse(raw)) : freshState();
    } catch (_) {
      recoveredState = true;
      return freshState();
    }
  }

  let state = loadState();
  let dive = null;
  let audioContext = null;
  let missionCategory = 'Daily';
  let vaultFilter = 'All';
  let leaderboardMode = 'Global';
  let selectedArtifactId = '';
  let lastResultArtifacts = [];
  let onboardingStep = 0;

  function saveState() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch (_) {}
  }

  function currentRank(xp = state.xp) {
    return [...ranks].reverse().find(rank => xp >= rank.xp) || ranks[0];
  }

  function nextRank(xp = state.xp) {
    return ranks.find(rank => rank.xp > xp) || null;
  }

  function rankIndex(name) {
    return ranks.findIndex(rank => rank.name === name);
  }

  function rankUnlocked(name) {
    return rankIndex(currentRank().name) >= rankIndex(name);
  }

  function zoneForDepth(depth) {
    if (depth < 500) return 'Coral Gate';
    if (depth < 1200) return 'Sunken Temple';
    if (depth < 2000) return 'Whale Trench';
    if (depth < 3000) return 'The Abyss';
    return 'Throne of Atlantis';
  }

  function showDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  function closeDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.close === 'function' && dialog.open) dialog.close();
    else dialog.removeAttribute('open');
  }

  function tone(frequency = 300, duration = 0.1, type = 'sine') {
    if (!state.soundEnabled) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.035, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    } catch (_) {}
  }

  function toast(message) {
    let element = $('#aquanautToast');
    if (!element) {
      element = document.createElement('div');
      element.id = 'aquanautToast';
      element.className = 'toast';
      element.setAttribute('role', 'status');
      document.body.append(element);
    }
    element.textContent = message;
    element.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => element.classList.remove('show'), 2600);
  }

  function copyText(text, message = 'Copied to clipboard') {
    const fallback = () => {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.append(area);
      area.select();
      try { document.execCommand('copy'); toast(message); } catch (_) { toast('Copy unavailable'); }
      area.remove();
    };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(() => toast(message)).catch(fallback);
    else fallback();
  }

  async function shareText(title, text) {
    if (navigator.share) {
      try {
        await navigator.share({ title, text });
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
      }
    }
    copyText(text, 'Share text copied');
  }

  const missions = [
    { id: 'first-descent', category: 'Daily', name: 'First Descent', text: 'Complete one successful dive today.', target: 1, reward: 100, metric: s => s.daily.successful, region: 'Surface Camp' },
    { id: 'go-deeper', category: 'Daily', name: 'Go Deeper', text: 'Reach 750m today.', target: 750, reward: 150, metric: s => s.daily.bestDepth, region: 'Coral Gate' },
    { id: 'treasure-hunter', category: 'Daily', name: 'Treasure Hunter', text: 'Recover one artifact today.', target: 1, reward: 200, metric: s => s.daily.artifacts, region: 'Coral Gate' },
    { id: 'safe-return', category: 'Daily', name: 'Safe Return', text: 'Surface with at least 25% oxygen.', target: 1, reward: 100, metric: s => s.daily.safeReturns, region: 'Surface Camp' },
    { id: 'trench', category: 'Exploration', name: 'Into the Trench', text: 'Reach 1,500m.', target: 1500, reward: 300, metric: s => s.bestDepth, rank: 'Diver', region: 'Whale Trench' },
    { id: 'abyss', category: 'Exploration', name: 'Touch the Abyss', text: 'Reach 2,500m.', target: 2500, reward: 500, metric: s => s.bestDepth, rank: 'Seeker', region: 'The Abyss' },
    { id: 'atlantis', category: 'Exploration', name: 'Atlantis Found', text: 'Reach 3,000m.', target: 3000, reward: 750, metric: s => s.bestDepth, rank: 'Guardian', region: 'Throne of Atlantis' },
    { id: 'pressure', category: 'Skill', name: 'Pressure Control', text: 'Return safely from 1,000m with 25% oxygen.', target: 1000, reward: 250, metric: s => s.deepestSafeReturn, rank: 'Diver', region: 'Sunken Temple' },
    { id: 'survivor', category: 'Skill', name: 'Last Breath', text: 'Surface with less than 10% oxygen.', target: 1, reward: 300, metric: s => s.lowOxygenReturns, region: 'The Abyss' },
    { id: 'relics', category: 'Collection', name: 'Relic Hunter', text: 'Recover five artifacts.', target: 5, reward: 350, metric: s => s.artifacts.length, region: 'Surface Camp' },
    { id: 'rare', category: 'Collection', name: 'Rare Find', text: 'Recover a Rare artifact or better.', target: 1, reward: 250, metric: s => s.artifacts.filter(a => ['Rare', 'Epic', 'Legendary', 'Mythic'].includes(a.rarity)).length, region: 'Sunken Temple' },
    { id: 'legendary', category: 'Collection', name: 'Legendary Explorer', text: 'Recover a Legendary or Mythic artifact.', target: 1, reward: 800, metric: s => s.artifacts.filter(a => ['Legendary', 'Mythic'].includes(a.rarity)).length, rank: 'Seeker', region: 'The Abyss' },
    { id: 'witness', category: 'Community', name: 'Seven Day Witness', text: 'Maintain a seven-day exploration streak.', target: 7, reward: 500, metric: s => s.streak, region: 'Surface Camp' }
  ];

  function installUI() {
    const missionHeader = $('.missions-view .page-heading');
    if (missionHeader && !$('#missionTabs')) missionHeader.insertAdjacentHTML('afterend', `<div class='mission-toolbar'><div class='extension-tabs' id='missionTabs' aria-label='Mission categories'></div><div class='mission-feedback' id='missionFeedback' role='status'></div></div>`);

    const vaultHeader = $('.vault-view .page-heading');
    if (vaultHeader) {
      $('h1', vaultHeader).textContent = 'The Vault';
      $('p:last-child', vaultHeader).textContent = 'Every artifact tells a story of how deep you dared to go.';
      if (!$('#vaultTabs')) vaultHeader.insertAdjacentHTML('afterend', `<div class='extension-tabs' id='vaultTabs' aria-label='Artifact rarity filters'></div>`);
    }

    const leaderboardHeader = $('.leaderboard-view .page-heading');
    if (leaderboardHeader && !$('#leaderboardTabs')) leaderboardHeader.insertAdjacentHTML('afterend', `<div class='extension-tabs' id='leaderboardTabs' aria-label='Leaderboard views'></div><p class='leaderboard-note'>Demo opponents are fictional. Your highlighted row uses progress stored on this device.</p>`);

    const profile = $('.profile-view');
    if (profile && !$('#profileExtension')) $('#resetProgress').insertAdjacentHTML('beforebegin', `<div class='profile-extension' id='profileExtension'><div class='streak-panel' id='profileStreak'></div><div class='profile-facts' id='profileFacts'></div><div class='share-actions'><button id='shareProfile' type='button'>Share profile</button><button id='shareBestDive' type='button'>Share best dive</button></div><p class='kicker'>Achievements</p><div class='achievement-grid' id='achievementGrid'></div></div>`);

    const resultActions = $('.result-actions');
    if (resultActions && !$('#shareResult')) resultActions.insertAdjacentHTML('afterbegin', `<button class='primary-action button-action' id='shareResult' type='button'>Share result</button><button class='secondary-action button-action' id='copyResult' type='button'>Copy result</button><button class='secondary-action button-action' id='viewResultArtifact' type='button' hidden>View artifact</button>`);

    const journey = $('.journey-section');
    if (journey && !$('#weeklyPanel')) journey.insertAdjacentHTML('afterend', `<section class='local-stats' id='weeklyPanel'><div class='weekly-panel'><div><p class='kicker'>Weekly Deep Dive</p><h2>Set your mark before the current clears.</h2><p>Your deepest successful dive this week is compared with fictional demo challengers.</p><div class='weekly-rewards'><span>Limited badge concept</span><span>Profile frame concept</span><span>XP bonus concept</span></div></div><div><div class='weekly-countdown' id='weeklyCountdown'></div><p><strong id='weeklyBest'>0m</strong> local weekly best</p></div></div></section>`);

    document.body.insertAdjacentHTML('beforeend', `
      <dialog class='onboarding-dialog' id='onboardingDialog'>
        <div class='onboarding-inner'>
          <div class='onboarding-step is-active'><p class='kicker'>Welcome, Explorer</p><h2>Atlantis has been lost for centuries.</h2><p>Now the gates are open.</p></div>
          <div class='onboarding-step'><p class='kicker'>Dive</p><h2>Choose how deep to go.</h2><p>Every checkpoint adds loot and consumes oxygen.</p></div>
          <div class='onboarding-step'><p class='kicker'>Survive</p><h2>Surface before oxygen reaches zero.</h2><p>Only a safe return secures current XP and artifacts.</p></div>
          <div class='onboarding-step'><p class='kicker'>Rise</p><h2>Build your expedition record.</h2><p>Earn XP, collect artifacts and climb the demo standings.</p></div>
          <div class='onboarding-index' id='onboardingIndex' aria-label='Onboarding progress'></div>
          <div class='onboarding-controls'><button class='skip-onboarding' id='skipOnboarding' type='button'>Skip</button><button id='nextOnboarding' type='button'>Continue</button></div>
        </div>
      </dialog>
      <dialog class='artifact-dialog' id='artifactDialog'><div class='artifact-dialog-inner' id='artifactDialogContent'></div></dialog>
      <dialog class='relic-reveal' id='relicReveal'><div class='relic-current' aria-hidden='true'></div><p class='kicker'>Ancient relic discovered</p><div class='relic-reveal-symbol' id='relicRevealSymbol'></div><strong id='relicRevealRarity'></strong><h2 id='relicRevealName'></h2><p id='relicRevealDepth'></p><div><button id='secureRelic' type='button'>Add to vault</button><button id='continueRelic' type='button'>Continue dive</button></div></dialog>
      <dialog class='rank-dialog' id='rankDialog'><div class='rank-dialog-inner'><p class='kicker'>Rank up</p><div class='rank-trident' aria-hidden='true'>♆</div><h2 id='rankDialogTitle'></h2><p>The deeper ruins have opened to you.</p><button id='rankDialogClose' type='button'>Continue expedition</button></div></dialog>
    `);

    const wallet = $('#walletDialog');
    if (wallet) {
      $('.kicker', wallet).textContent = 'Choose your descent';
      $('h2', wallet).textContent = 'Enter as a Demo Explorer.';
      $('p:not(.kicker)', wallet).textContent = 'The full game is playable without a wallet. No wallet adapter is configured in this build.';
      $('#continueDemo').textContent = 'Play Demo';
      $('#continueDemo').insertAdjacentHTML('beforebegin', `<button class='wallet-unavailable' type='button' disabled>Wallet connection unavailable</button>`);
    }

    const finalLink = $('.final-call .primary-action');
    if (finalLink) finalLink.textContent = 'Start your dive';
    const footer = $('footer');
    if (footer && !$('#ecosystemFooter')) footer.insertAdjacentHTML('beforeend', `<p id='ecosystemFooter'>$NAUT • Built for the Aqua ecosystem</p>`);
  }

  function route() {
    const routes = ['home', 'map', 'dive', 'missions', 'artifacts', 'leaderboard', 'profile', 'naut', 'how-to-play'];
    const requested = location.hash.slice(1) || 'home';
    const target = routes.includes(requested) ? requested : 'home';
    $$('.view').forEach(view => view.classList.toggle('is-active', view.dataset.route === target));
    $$('.desktop-nav a').forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${target}`));
    closeMenu();
    if (target === 'map') renderMap();
    if (target === 'missions') renderMissions();
    if (target === 'artifacts') renderArtifacts();
    if (target === 'leaderboard') renderLeaderboard();
    if (target === 'profile') renderProfile();
    if (target === 'dive' && !dive) resetDiveScreen();
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  function openMenu() {
    const menu = $('#mobileMenu');
    menu.hidden = false;
    $('#menuButton').setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    const menu = $('#mobileMenu');
    if (!menu) return;
    menu.hidden = true;
    $('#menuButton')?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  function requestEntry(event) {
    if (state.introChoiceSeen) return;
    event.preventDefault();
    showDialog($('#walletDialog'));
  }

  function continueDemo() {
    state.introChoiceSeen = true;
    saveState();
    closeDialog($('#walletDialog'));
    if (!state.onboardingCompleted) startOnboarding();
    else location.hash = 'map';
  }

  function startOnboarding() {
    onboardingStep = 0;
    renderOnboarding();
    showDialog($('#onboardingDialog'));
  }

  function renderOnboarding() {
    const steps = $$('.onboarding-step');
    steps.forEach((step, index) => step.classList.toggle('is-active', index === onboardingStep));
    $('#onboardingIndex').innerHTML = steps.map((_, index) => `<span class='${index === onboardingStep ? 'active' : ''}'><span class='sr-only'>Step ${index + 1}</span></span>`).join('');
    $('#nextOnboarding').textContent = onboardingStep === steps.length - 1 ? 'Enter Atlantis' : 'Continue';
  }

  function finishOnboarding() {
    state.onboardingCompleted = true;
    saveState();
    closeDialog($('#onboardingDialog'));
    location.hash = 'map';
    setTimeout(() => toast('Coral Gate is open. Start with Treasure Dive.'), 450);
  }

  function updateUI() {
    const rank = currentRank();
    const equipped = state.artifacts.find(item => item.id === state.equippedId);
    $$('[data-stat="dives"]').forEach(element => element.textContent = format(state.totalDives));
    $$('[data-stat="artifacts"]').forEach(element => element.textContent = format(state.artifacts.length));
    $$('[data-stat="depth"]').forEach(element => element.textContent = format(state.bestDepth));
    $$('[data-profile="rank"]').forEach(element => element.textContent = rank.name);
    $$('[data-profile="xp"]').forEach(element => element.textContent = format(state.xp));
    $$('[data-profile="bestDepth"]').forEach(element => element.textContent = format(state.bestDepth));
    $$('[data-profile="streak"]').forEach(element => element.textContent = state.streak);
    $$('[data-profile="equipped"]').forEach(element => element.textContent = equipped?.name || 'None');

    const next = nextRank();
    if ($('#rankProgressBar')) {
      if (next) {
        const percentage = ((state.xp - rank.xp) / (next.xp - rank.xp)) * 100;
        $('#rankProgressBar').style.width = `${clamp(percentage, 0, 100)}%`;
        $('#rankProgressText').textContent = `${format(state.xp)} / ${format(next.xp)} XP. ${format(next.xp - state.xp)} XP until ${next.name}.`;
      } else {
        $('#rankProgressBar').style.width = '100%';
        $('#rankProgressText').textContent = `${format(state.xp)} XP. Highest explorer rank reached.`;
      }
    }

    $$('.rank-path li').forEach((item, index) => {
      item.classList.toggle('current', ranks[index].name === rank.name);
      item.classList.toggle('is-earned', state.xp >= ranks[index].xp);
      const label = $('small', item);
      if (label) label.textContent = `${format(ranks[index].xp)} XP`;
    });

    $('#soundToggle')?.setAttribute('aria-pressed', String(state.soundEnabled));
    $('#soundToggle')?.setAttribute('aria-label', state.soundEnabled ? 'Turn sound off' : 'Turn sound on');
    if ($('#weeklyBest')) $('#weeklyBest').textContent = `${format(state.weeklyBestDepth)}m`;
    renderToken();
  }

  function regionCompletion(region) {
    if (region.name === 'Surface Camp') return 100;
    if (state.bestDepth < region.min) return 0;
    return Math.round(clamp((state.bestDepth - region.min) / Math.max(1, region.max - region.min), 0, 1) * 100);
  }

  function renderMap() {
    const container = $('#mapRegions');
    if (!container) return;
    container.innerHTML = regions.map((region, index) => {
      const unlocked = rankUnlocked(region.rank);
      const completion = regionCompletion(region);
      const count = region.name === 'Surface Camp' ? state.artifacts.length : state.artifacts.filter(item => zoneForDepth(item.depth) === region.name).length;
      const available = missions.filter(mission => mission.region === region.name && missionStatus(mission) !== 'Claimed').length;
      const firstGate = index === 1 && !state.firstDiveComplete;
      return `<article class='map-region ${unlocked ? '' : 'is-locked'} ${firstGate ? 'guided-region' : ''}'>
        <details ${index < 2 || completion > 0 ? 'open' : ''}>
          <summary><h2>${region.name}</h2><span>${completion}%</span></summary>
          <p>${region.text}</p>
          <div class='map-region-progress' aria-label='${completion}% complete'><span style='width:${completion}%'></span></div>
          <div class='map-region-data'>
            <div><span>Depth</span><strong>${region.max ? `${format(region.min)} - ${format(region.max)}m` : '0m'}</strong></div>
            <div><span>Required rank</span><strong>${region.rank}</strong></div>
            <div><span>Artifacts found</span><strong>${count}</strong></div>
            <div><span>Available missions</span><strong>${available}</strong></div>
          </div>
          ${unlocked ? `<div class='map-hub-links'>${region.name === 'Surface Camp' ? `<a href='#profile'>Profile</a><a href='#missions'>Missions</a><a href='#leaderboard'>Leaderboard</a><a href='#naut'>Token portal</a>` : ''}<a class='${firstGate ? 'guided-dive-link' : ''}' href='#dive'>${firstGate ? 'Begin at Coral Gate' : 'Start expedition'}</a></div>` : `<p class='map-region-lock'>Reach ${region.rank} rank to open this route.</p>`}
        </details>
      </article>`;
    }).join('');
  }

  function missionClaimKey(mission) {
    return mission.category === 'Daily' ? `${mission.id}:${todayKey()}` : mission.id;
  }

  function missionStatus(mission) {
    if (mission.rank && !rankUnlocked(mission.rank)) return 'Locked';
    if (state.claimedMissions.includes(missionClaimKey(mission))) return 'Claimed';
    const value = mission.metric(state);
    if (value >= mission.target) return 'Complete';
    return value > 0 ? 'In Progress' : 'Available';
  }

  function renderMissions() {
    const categories = ['Daily', 'Exploration', 'Skill', 'Collection', 'Community'];
    $('#missionTabs').innerHTML = categories.map(category => `<button type='button' data-mission-category='${category}' aria-pressed='${missionCategory === category}'>${category}</button>`).join('');
    const list = $('#missionList');
    list.innerHTML = missions.filter(mission => mission.category === missionCategory).map(mission => {
      const status = missionStatus(mission);
      const progress = Math.min(mission.target, mission.metric(state));
      const percent = progress / mission.target * 100;
      return `<article class='mission ${status.toLowerCase().replaceAll(' ', '-')} ${status === 'Complete' ? 'completed' : ''}'>
        <div><span class='mission-state'>${status}</span><h2>${mission.name}</h2><p>${mission.text}</p>${status === 'Locked' ? `<p>Requires ${mission.rank} rank.</p>` : ''}<div class='mission-meta'><span>${format(progress)} / ${format(mission.target)}</span><span>+${format(mission.reward)} XP</span></div><div class='meter'><span style='width:${percent}%'></span></div></div>
        <button type='button' data-claim='${mission.id}' ${status !== 'Complete' ? 'disabled' : ''}>${status === 'Complete' ? 'Claim mission XP' : status === 'Claimed' ? 'XP claimed' : status}</button>
      </article>`;
    }).join('');
  }

  function claimMission(id) {
    const mission = missions.find(item => item.id === id);
    if (!mission || missionStatus(mission) !== 'Complete') return;
    const previousRank = currentRank().name;
    state.claimedMissions.push(missionClaimKey(mission));
    state.xp += mission.reward;
    saveState();
    updateUI();
    renderMissions();
    $('#missionFeedback').textContent = `${mission.name} secured. +${format(mission.reward)} XP.`;
    tone(620, 0.18, 'triangle');
    if (currentRank().name !== previousRank) showRankUp(currentRank().name);
  }

  function uniqueArtifacts() {
    const map = new Map();
    state.artifacts.forEach(item => map.set(item.name, item));
    return [...map.values()];
  }

  function renderArtifacts() {
    const filters = ['All', 'Common', 'Rare', 'Epic', 'Legendary', 'Mythic'];
    $('#vaultTabs').innerHTML = filters.map(filter => `<button type='button' data-vault-filter='${filter}' aria-pressed='${vaultFilter === filter}'>${filter}</button>`).join('');
    const recovered = uniqueArtifacts();
    $('#vaultCount').innerHTML = `<span class='vault-collection-count'>${recovered.length} / ${artifacts.length}</span>`;
    $('#vaultEquipped').textContent = state.artifacts.find(item => item.id === state.equippedId)?.name || 'None';
    const entries = artifacts.filter(item => vaultFilter === 'All' || item.rarity === vaultFilter);
    $('#artifactGrid').innerHTML = entries.map(entry => {
      const artifact = recovered.find(item => item.name === entry.name);
      if (!artifact) return `<article class='artifact-card ${rarityClass[entry.rarity]} is-undiscovered'><span class='artifact-symbol'>?</span><small>${entry.rarity}</small><h2>Undiscovered relic</h2><p>A silhouette remains in the archive.</p></article>`;
      const equipped = artifact.id === state.equippedId;
      return `<article class='artifact-card ${rarityClass[artifact.rarity]} ${equipped ? 'equipped' : ''}'><span class='artifact-symbol'>${artifact.symbol}</span><small>${artifact.rarity}</small><h2>${artifact.name}</h2><p>${artifact.lore}</p><div class='artifact-details'><span>Found ${artifact.date}</span><span>${format(artifact.depth)}m deep</span><span>Expedition bonus</span><span>+${artifact.bonus}% surfaced XP</span></div><button type='button' data-view-artifact='${artifact.id}'>${equipped ? 'View equipped artifact' : 'View artifact'}</button></article>`;
    }).join('');
  }

  function openArtifact(id) {
    const artifact = state.artifacts.find(item => item.id === id);
    if (!artifact) return;
    selectedArtifactId = id;
    const equipped = artifact.id === state.equippedId;
    $('#artifactDialogContent').innerHTML = `<div class='artifact-dialog-symbol ${rarityClass[artifact.rarity]}'>${artifact.symbol}</div><p class='kicker'>${artifact.rarity} artifact</p><h2>${artifact.name}</h2><p>${artifact.lore}</p><dl><div><dt>Discovered at</dt><dd>${format(artifact.depth)}m</dd></div><div><dt>Discovery date</dt><dd>${artifact.date}</dd></div><div><dt>Dive XP bonus</dt><dd>+${artifact.bonus}%</dd></div><div><dt>Equipped</dt><dd>${equipped ? 'Yes' : 'No'}</dd></div></dl><div class='artifact-dialog-actions'><button class='equip-primary' id='modalEquipArtifact' type='button'>${equipped ? 'Unequip artifact' : 'Equip artifact'}</button><button id='modalCloseArtifact' type='button'>Close vault record</button></div>`;
    showDialog($('#artifactDialog'));
  }

  function toggleArtifact() {
    if (!selectedArtifactId) return;
    state.equippedId = state.equippedId === selectedArtifactId ? '' : selectedArtifactId;
    saveState();
    closeDialog($('#artifactDialog'));
    updateUI();
    renderArtifacts();
    tone(430, 0.12, 'triangle');
  }

  const demoPlayers = [
    { name: 'DeepCurrent', rank: 'Aquanaut', score: 14280, depth: 3400, artifacts: 18, weekly: 3200 },
    { name: 'PoseidonKid', rank: 'Guardian', score: 11940, depth: 3100, artifacts: 14, weekly: 3000 },
    { name: 'CoralRunner', rank: 'Guardian', score: 9870, depth: 2860, artifacts: 12, weekly: 2500 },
    { name: 'TrenchWalker', rank: 'Seeker', score: 7740, depth: 2320, artifacts: 9, weekly: 2000 },
    { name: 'AquaGhost', rank: 'Seeker', score: 6810, depth: 2100, artifacts: 8, weekly: 1900 },
    { name: 'Nautilus', rank: 'Diver', score: 4980, depth: 1750, artifacts: 6, weekly: 1600 },
    { name: 'VoidDiver', rank: 'Diver', score: 3890, depth: 1400, artifacts: 5, weekly: 1200 },
    { name: 'PearlHunter', rank: 'Diver', score: 3150, depth: 1150, artifacts: 7, weekly: 900 },
    { name: 'BlueAbyss', rank: 'Drifter', score: 1640, depth: 720, artifacts: 3, weekly: 650 },
    { name: 'Tideborn', rank: 'Drifter', score: 920, depth: 430, artifacts: 1, weekly: 430 }
  ];

  function leaderboardPlayers() {
    return [...demoPlayers, { name: 'Local Aquanaut', rank: currentRank().name, score: state.highestDiveScore, depth: state.bestDepth, artifacts: state.artifacts.length, weekly: state.weeklyBestDepth, player: true }];
  }

  function playerPosition(metric = 'score') {
    const sorted = leaderboardPlayers().sort((a, b) => b[metric] - a[metric]);
    return sorted.findIndex(item => item.player) + 1;
  }

  function renderLeaderboard() {
    const modes = ['Global', 'Deepest Dive', 'Highest Score', 'Artifacts', 'Weekly'];
    $('#leaderboardTabs').innerHTML = modes.map(mode => `<button type='button' data-leaderboard-mode='${mode}' aria-pressed='${leaderboardMode === mode}'>${mode}</button>`).join('');
    const metric = leaderboardMode === 'Deepest Dive' ? 'depth' : leaderboardMode === 'Artifacts' ? 'artifacts' : leaderboardMode === 'Weekly' ? 'weekly' : 'score';
    const players = leaderboardPlayers().sort((a, b) => b[metric] - a[metric]);
    $('#leaderboardList').innerHTML = players.map((player, index) => {
      const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`;
      const primary = metric === 'artifacts' ? `${player.artifacts} relics` : ['depth', 'weekly'].includes(metric) ? `${format(player[metric])}m` : `${format(player.score)} pts`;
      return `<li class='${player.player ? 'player' : ''} ${index < 3 ? 'podium' : ''}'><strong><span class='leaderboard-medal'>${medal}</span>${player.name}${player.player ? ` <small class='player-pin'>You</small>` : ''}</strong><span>${player.rank}</span><span>${format(player.depth)}m</span><span>${primary}</span></li>`;
    }).join('');
  }

  function achievements() {
    return [
      { name: 'First Breath', symbol: '◌', text: 'Complete your first successful dive.', unlocked: state.successfulDives >= 1 },
      { name: '500 Club', symbol: '↓', text: 'Reach 500m.', unlocked: state.bestDepth >= 500 },
      { name: 'Into the Deep', symbol: '▽', text: 'Reach 1,000m.', unlocked: state.bestDepth >= 1000 },
      { name: 'Trench Walker', symbol: '◢', text: 'Reach 1,500m.', unlocked: state.bestDepth >= 1500 },
      { name: 'Abyss Walker', symbol: '◆', text: 'Reach 2,500m.', unlocked: state.bestDepth >= 2500 },
      { name: 'Atlantis Found', symbol: '♆', text: 'Reach 3,000m.', unlocked: state.bestDepth >= 3000 },
      { name: 'Relic Hunter', symbol: '◈', text: 'Collect 10 artifacts.', unlocked: state.artifacts.length >= 10 },
      { name: 'Legendary Find', symbol: '✦', text: 'Recover a Legendary artifact.', unlocked: state.artifacts.some(item => ['Legendary', 'Mythic'].includes(item.rarity)) },
      { name: 'Survivor', symbol: '○', text: 'Surface with less than 10% oxygen.', unlocked: state.lowOxygenReturns > 0 },
      { name: 'Perfect Dive', symbol: '◎', text: 'Return from 1,000m with at least 50% oxygen.', unlocked: state.perfectDives > 0 }
    ];
  }

  function renderProfile() {
    const equipped = state.artifacts.find(item => item.id === state.equippedId);
    $('#profileFacts').innerHTML = `<div><span>Level</span><strong>${rankIndex(currentRank().name) + 1}</strong></div><div><span>Successful dives</span><strong>${format(state.successfulDives)}</strong></div><div><span>Highest dive score</span><strong>${format(state.highestDiveScore)}</strong></div><div><span>Joined</span><strong>${state.joinDate}</strong></div><div><span>Explorer identity</span><strong>Demo Explorer</strong></div><div><span>Wallet</span><strong>Not connected</strong></div><div><span>Equipped artifact</span><strong>${equipped?.name || 'None'}</strong></div><div><span>Weekly best</span><strong>${format(state.weeklyBestDepth)}m</strong></div>`;
    $('#profileStreak').innerHTML = `<p class='kicker'>Daily exploration</p><h2>🔥 ${state.streak} day streak</h2><p>Consecutive exploration days add a capped score bonus and a small artifact chance boost.</p><div class='streak-days'>${Array.from({ length: 7 }, (_, index) => `<div class='streak-day ${index < Math.min(state.streak, 7) ? 'complete' : ''} ${index === 6 ? 'gift' : ''}'><span>Day ${index + 1}<strong>${index < Math.min(state.streak, 7) ? index === 6 ? '🎁' : '✓' : '○'}</strong></span></div>`).join('')}</div>`;
    $('#achievementGrid').innerHTML = achievements().map(item => `<article class='achievement ${item.unlocked ? '' : 'locked'}'><span aria-hidden='true'>${item.symbol}</span><h3>${item.name}</h3><p>${item.unlocked ? 'Unlocked' : item.text}</p></article>`).join('');
  }

  function renderToken() {
    const address = String(window.AQUA_CONFIG?.TOKEN_CA || '').trim();
    $('#tokenAddress').textContent = address || 'Not launched yet';
    $('#copyToken').textContent = address ? 'Copy address' : 'Not launched yet';
    $('#copyToken').disabled = !address;
  }

  function nextCheckpoint() {
    return checkpoints.find(point => point.depth > dive.depth) || { depth: dive.depth + 500, xp: 700 };
  }

  function oxygenCost(depth) {
    if (!state.firstDiveComplete) {
      if (depth <= 100) return 5;
      if (depth <= 250) return 7;
      if (depth <= 500) return 10;
      if (depth <= 750) return 13;
    }
    if (depth <= 500) return randomInt(5, 10);
    if (depth <= 1200) return randomInt(8, 15);
    if (depth <= 2000) return randomInt(12, 22);
    return randomInt(15, 28);
  }

  function artifactRarity(depth) {
    const roll = Math.random() * 100;
    const depthBoost = Math.min(18, depth / 180) + Math.min(7, state.streak) * 0.25;
    if (roll < 0.3 + depthBoost * 0.1) return 'Mythic';
    if (roll < 2 + depthBoost * 0.35) return 'Legendary';
    if (roll < 8 + depthBoost * 0.8) return 'Epic';
    if (roll < 30 + depthBoost * 1.25) return 'Rare';
    return 'Common';
  }

  function createArtifact(depth, forcedRarity = '') {
    const rarity = forcedRarity || artifactRarity(depth);
    const source = artifacts.filter(item => item.rarity === rarity);
    const base = pick(source);
    return { ...base, id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, depth, date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }), bonus: rarityXP[rarity] };
  }

  function resetDiveScreen() {
    $('#diveEntry').hidden = false;
    $('#diveGame').hidden = true;
    $('#diveResult').hidden = true;
    $('#encounterPanel').hidden = true;
    dive = null;
    updateUI();
  }

  function beginDive() {
    const button = $('#beginDive');
    button.disabled = true;
    button.textContent = 'Descending...';
    setTimeout(() => {
      dive = { status: 'diving', depth: 0, oxygen: 100, lootXP: 0, artifacts: [], encounters: 0 };
      $('#diveEntry').hidden = true;
      $('#diveResult').hidden = true;
      $('#diveGame').hidden = false;
      $('#encounterPanel').hidden = true;
      $('#expeditionLog').textContent = state.firstDiveComplete ? 'Your helmet seals. The water closes above you.' : 'Your first route is marked. Start with the safe treasure at 100m.';
      button.disabled = false;
      button.textContent = 'Begin dive';
      updateDiveUI();
      tone(180, 0.22);
    }, 450);
  }

  function updateDiveUI() {
    if (!dive) return;
    const next = nextCheckpoint();
    $('#gameDepth').textContent = `${format(dive.depth)}m`;
    $('#zoneName').textContent = zoneForDepth(dive.depth);
    $('#oxygenValue').textContent = `${Math.max(0, dive.oxygen)}%`;
    $('#oxygenBar').style.width = `${clamp(dive.oxygen, 0, 100)}%`;
    $('#lootXP').textContent = format(dive.lootXP);
    $('#lootArtifacts').textContent = dive.artifacts.length;
    $('#encounterCount').textContent = dive.encounters;
    $('#nextDepthLabel').textContent = !state.firstDiveComplete && next.depth === 100 ? 'Safe treasure at 100m' : !state.firstDiveComplete && next.depth === 500 ? 'A decision waits at 500m' : `Descend to ${format(next.depth)}m`;
    const oxygen = $('#oxygenBlock');
    oxygen.className = 'oxygen-block';
    if (dive.oxygen <= 15) oxygen.classList.add('critical');
    else if (dive.oxygen <= 30) oxygen.classList.add('urgent');
    else if (dive.oxygen <= 60) oxygen.classList.add('warning');
    const ratio = clamp(dive.depth / 3400, 0, 1);
    $('#diveScene').style.setProperty('--depth-light', `${Math.max(8, 45 - ratio * 35)}%`);
    $('#diveScene').style.setProperty('--dive-y', `${ratio * 150}px`);
  }

  function diveDeeper() {
    if (!dive || dive.status !== 'diving' || !$('#encounterPanel').hidden) return;
    const point = nextCheckpoint();
    const cost = oxygenCost(point.depth);
    dive.depth = point.depth;
    dive.oxygen -= cost;
    dive.lootXP += point.xp;

    let message = `You reach ${format(point.depth)}m, recover ${point.xp} XP and spend ${cost}% oxygen.`;

    if (!state.firstDiveComplete && point.depth === 100) {
      dive.lootXP += 50;
      const relic = createArtifact(100, 'Common');
      dive.artifacts.push(relic);
      message = `Safe treasure recovered. ${relic.name} and 70 XP are unbanked until you surface.`;
      toast(`Common relic found: ${relic.name}`);
      tone(560, 0.2, 'triangle');
    } else if (!state.firstDiveComplete && point.depth === 250) {
      dive.lootXP += 20;
      message = 'A marked supply cache adds 55 XP. The route remains stable.';
    }

    $('#expeditionLog').textContent = message;
    updateDiveUI();

    if (dive.oxygen <= 0) {
      failDive();
      return;
    }

    if (!state.firstDiveComplete && point.depth === 500) {
      setTimeout(showGuidedDecision, 250);
      return;
    }

    if (!state.firstDiveComplete && point.depth === 750) {
      setTimeout(showGuidedEncounter, 250);
      return;
    }

    const treasureChance = 0.07 + Math.min(0.18, point.depth / 17000) + Math.min(7, state.streak) * 0.005;
    if (Math.random() < treasureChance) {
      const relic = createArtifact(point.depth);
      dive.artifacts.push(relic);
      $('#expeditionLog').textContent = `${relic.rarity} discovery: ${relic.name}. Surface to secure it.`;
      if (['Epic', 'Legendary', 'Mythic'].includes(relic.rarity)) showRelicReveal(relic);
      else toast(`${relic.rarity} relic found: ${relic.name}`);
      tone(relic.rarity === 'Mythic' ? 850 : 620, 0.3, 'triangle');
    } else if (point.depth >= 750 && Math.random() < 0.3) {
      setTimeout(showRandomEncounter, 250);
    } else {
      tone(Math.max(90, 300 - point.depth / 20), 0.1);
    }
  }

  function showEncounter(title, symbol, text, actions) {
    dive.status = 'encounter';
    dive.encounters += 1;
    $('#encounterTitle').textContent = title;
    $('#encounterSymbol').textContent = symbol;
    $('#encounterText').textContent = text;
    const container = $('#encounterActions');
    container.innerHTML = '';
    actions.forEach(([label, handler]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.addEventListener('click', handler, { once: true });
      container.append(button);
    });
    $('#encounterPanel').hidden = false;
    container.querySelector('button')?.focus();
  }

  function showGuidedDecision() {
    showEncounter('Cracked Archive', '▣', 'A marked chamber offers extra records, but opening it costs a little oxygen.', [
      ['Search the chamber', () => {
        dive.oxygen -= 4;
        dive.lootXP += 80;
        finishEncounter('The archive yields 80 XP. You spend 4% oxygen opening it.');
      }],
      ['Take the safe route', () => finishEncounter('You leave the chamber sealed and preserve your oxygen.')]
    ]);
  }

  function showGuidedEncounter() {
    showEncounter('Hidden Air Pocket', '○', 'The route opens into a dry temple chamber.', [
      ['Restore oxygen', () => {
        dive.oxygen = Math.min(100, dive.oxygen + 15);
        finishEncounter('The air pocket restores 15% oxygen. The deeper route is now open.');
      }],
      ['Surface with current loot', surfaceDive]
    ]);
  }

  function showRandomEncounter() {
    const encounters = [
      ['Ancient Chest', '▣', 'A sealed chest rests between two collapsed statues.', [
        ['Open chest', () => {
          if (Math.random() < 0.65) {
            const relic = createArtifact(dive.depth);
            dive.artifacts.push(relic);
            finishEncounter(`${relic.rarity} discovery: ${relic.name}.`);
            if (['Epic', 'Legendary', 'Mythic'].includes(relic.rarity)) setTimeout(() => showRelicReveal(relic), 150);
          } else {
            dive.oxygen -= 9;
            finishEncounter('A silt trap ruptures. You lose 9% oxygen.');
          }
        }],
        ['Ignore it', () => finishEncounter('You leave the seal untouched.')]
      ]],
      ['Strong Current', '≈', 'A violent current cuts across the route.', [
        ['Push through', () => {
          const cost = randomInt(10, 18);
          const reward = randomInt(80, 150);
          dive.oxygen -= cost;
          dive.lootXP += reward;
          finishEncounter(`You recover ${reward} XP and lose ${cost}% oxygen.`);
        }],
        ['Surface now', surfaceDive]
      ]],
      ['Sunken Shrine', '✦', 'A forgotten shrine emits a pulse through the stone.', [
        ['Touch the relic', () => {
          if (Math.random() < 0.7) {
            const reward = randomInt(100, 190);
            dive.lootXP += reward;
            finishEncounter(`The shrine reveals an inscription worth ${reward} XP.`);
          } else {
            dive.oxygen -= 8;
            finishEncounter('The chamber seals briefly. You lose 8% oxygen.');
          }
        }],
        ['Keep moving', () => finishEncounter('You mark the shrine and continue.')]
      ]],
      ['Leviathan Shadow', '◢', 'A silhouette larger than the temple crosses the light.', [
        ['Hide', () => {
          dive.oxygen -= 7;
          finishEncounter('The shadow passes. Hiding costs 7% oxygen.');
        }],
        ['Follow it deeper', () => {
          const cost = randomInt(14, 22);
          const reward = randomInt(180, 320);
          dive.oxygen -= cost;
          dive.lootXP += reward;
          finishEncounter(`The trail yields ${reward} XP and costs ${cost}% oxygen.`);
        }]
      ]],
      ['Air Pocket', '○', 'A tilted archive holds a thin pocket of ancient air.', [
        ['Restore oxygen', () => {
          const amount = randomInt(10, 25);
          dive.oxygen = Math.min(100, dive.oxygen + amount);
          finishEncounter(`You restore ${amount}% oxygen.`);
        }]
      ]]
    ];
    showEncounter(...pick(encounters));
  }

  function finishEncounter(message) {
    $('#encounterPanel').hidden = true;
    $('#expeditionLog').textContent = message;
    dive.status = 'diving';
    if (dive.oxygen <= 0) failDive();
    else {
      updateDiveUI();
      $('#diveDeeper').focus();
    }
  }

  function showRelicReveal(relic) {
    dive.status = 'reveal';
    $('#relicReveal').className = `relic-reveal ${rarityClass[relic.rarity]}`;
    $('#relicRevealSymbol').textContent = relic.symbol;
    $('#relicRevealRarity').textContent = relic.rarity;
    $('#relicRevealName').textContent = relic.name;
    $('#relicRevealDepth').textContent = `Found at ${format(relic.depth)}m. Surface now to secure it, or continue deeper.`;
    showDialog($('#relicReveal'));
  }

  function continueAfterRelic() {
    closeDialog($('#relicReveal'));
    if (dive) dive.status = 'diving';
    $('#diveDeeper').focus();
  }

  function updateStreak() {
    const key = todayKey();
    if (state.lastPlayedDate === key) return;
    const date = new Date();
    date.setDate(date.getDate() - 1);
    const yesterday = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    state.streak = state.lastPlayedDate === yesterday ? state.streak + 1 : 1;
    state.lastPlayedDate = key;
  }

  function calculateScore(bankedXP) {
    const artifactScore = dive.artifacts.reduce((total, item) => total + rarityBonus[item.rarity], 0);
    const base = dive.depth + bankedXP * 4 + Math.max(0, dive.oxygen) * 10 + artifactScore;
    const streakMultiplier = 1 + Math.min(state.streak, 7) * 0.02;
    return {
      total: Math.round(base * streakMultiplier),
      depth: dive.depth,
      loot: bankedXP * 4,
      oxygen: Math.max(0, dive.oxygen) * 10,
      artifacts: artifactScore,
      multiplier: streakMultiplier
    };
  }

  function completedMissionNames(before) {
    return missions.filter(mission => before.get(mission.id) !== 'Complete' && missionStatus(mission) === 'Complete').map(mission => mission.name);
  }

  function surfaceDive() {
    if (!dive || !['diving', 'encounter', 'reveal'].includes(dive.status)) return;
    closeDialog($('#relicReveal'));
    $('#encounterPanel').hidden = true;
    dive.status = 'surfaced';
    const previousRank = currentRank().name;
    const previousDepth = state.bestDepth;
    const firstSuccess = state.successfulDives === 0;
    const missionBefore = new Map(missions.map(mission => [mission.id, missionStatus(mission)]));
    const equipped = state.artifacts.find(item => item.id === state.equippedId);
    const bonus = equipped ? Math.round(dive.lootXP * equipped.bonus / 100) : 0;
    const bankedXP = dive.lootXP + bonus;

    updateStreak();
    const score = calculateScore(bankedXP);
    state.totalDives += 1;
    state.successfulDives += 1;
    state.xp += bankedXP;
    state.bestDepth = Math.max(state.bestDepth, dive.depth);
    state.deepestSafeReturn = Math.max(state.deepestSafeReturn, dive.depth);
    state.highestDiveScore = Math.max(state.highestDiveScore, score.total);
    state.weeklyBestDepth = Math.max(state.weeklyBestDepth, dive.depth);
    state.daily.dives += 1;
    state.daily.successful += 1;
    state.daily.bestDepth = Math.max(state.daily.bestDepth, dive.depth);
    state.daily.artifacts += dive.artifacts.length;
    if (dive.oxygen >= 25) state.daily.safeReturns += 1;
    if (dive.oxygen > 0 && dive.oxygen < 10) state.lowOxygenReturns += 1;
    if (dive.depth >= 1000 && dive.oxygen >= 50) state.perfectDives += 1;
    state.artifacts.push(...dive.artifacts);
    state.firstDiveComplete = true;
    lastResultArtifacts = [...dive.artifacts];
    saveState();

    const newRank = currentRank().name;
    const newRecord = dive.depth > previousDepth;
    const completed = completedMissionNames(missionBefore);
    const placement = playerPosition('score');
    const bestRarity = [...dive.artifacts].sort((a, b) => rarityBonus[b.rarity] - rarityBonus[a.rarity])[0];
    const celebrations = [];
    if (firstSuccess) celebrations.push(`<span>First successful dive</span>`);
    if (newRecord) celebrations.push(`<span>New depth record: ${format(dive.depth)}m</span>`);
    if (bestRarity && ['Epic', 'Legendary', 'Mythic'].includes(bestRarity.rarity)) celebrations.push(`<span>${bestRarity.rarity} relic secured</span>`);
    if (newRank !== previousRank) celebrations.push(`<span>Rank up: ${newRank}</span>`);
    if (completed.length) celebrations.push(`<span>${completed.length} mission${completed.length === 1 ? '' : 's'} completed</span>`);
    if (placement <= 3) celebrations.push(`<span>Demo leaderboard milestone: #${placement}</span>`);
    if ([3, 7, 14, 30].includes(state.streak)) celebrations.push(`<span>${state.streak} day streak milestone</span>`);

    $('#diveGame').hidden = true;
    $('#diveResult').hidden = false;
    $('#resultKicker').textContent = firstSuccess ? 'First expedition complete' : newRecord ? 'New depth record' : 'Dive complete';
    $('#resultTitle').textContent = firstSuccess ? 'Atlantis knows your name.' : 'Loot secured.';
    $('#resultText').textContent = newRecord && previousDepth ? `You went ${format(dive.depth - previousDepth)}m deeper than your previous record.` : `You surfaced safely from ${format(dive.depth)}m.`;
    $('#resultHaul').innerHTML = `<div><span>Depth</span><strong>${format(dive.depth)}m</strong></div><div><span>Banked XP</span><strong>${format(bankedXP)}</strong></div><div><span>Artifacts</span><strong>${dive.artifacts.length}</strong></div><div><span>Oxygen remaining</span><strong>${Math.max(0, dive.oxygen)}%</strong></div><div><span>Explorer rank</span><strong>${newRank}</strong></div><div><span>Demo position</span><strong>#${placement}</strong></div><div class='score-card result-score'><span>Dive score</span><strong>${format(score.total)}</strong><div class='score-breakdown'><div><span>Depth</span><b>${format(score.depth)}</b></div><div><span>Loot</span><b>${format(score.loot)}</b></div><div><span>Oxygen</span><b>${format(score.oxygen)}</b></div><div><span>Relics</span><b>${format(score.artifacts)}</b></div></div></div>${celebrations.length ? `<div class='result-celebrations'>${celebrations.join('')}</div>` : ''}`;
    $('#viewResultArtifact').hidden = !dive.artifacts.length;
    if (dive.artifacts.length) $('#viewResultArtifact').dataset.artifactId = dive.artifacts[0].id;
    updateUI();
    tone(680, 0.3, 'triangle');
    if (newRank !== previousRank) setTimeout(() => showRankUp(newRank), 650);
  }

  function failDive() {
    dive.status = 'failed';
    state.totalDives += 1;
    state.bestDepth = Math.max(state.bestDepth, dive.depth);
    state.daily.dives += 1;
    state.daily.bestDepth = Math.max(state.daily.bestDepth, dive.depth);
    saveState();
    $('#encounterPanel').hidden = true;
    $('#diveGame').hidden = true;
    $('#diveResult').hidden = false;
    $('#resultKicker').textContent = 'Dive failed';
    $('#resultTitle').textContent = 'The abyss claimed your loot.';
    $('#resultText').textContent = 'You pushed too deep and lost the unbanked rewards from this dive. Permanent progress remains safe.';
    $('#resultHaul').innerHTML = `<div><span>Depth reached</span><strong>${format(dive.depth)}m</strong></div><div><span>Loot lost</span><strong>${format(dive.lootXP)} XP</strong></div><div><span>Relics lost</span><strong>${dive.artifacts.length}</strong></div><div><span>Permanent XP</span><strong>${format(state.xp)}</strong></div>`;
    $('#shareResult').hidden = true;
    $('#copyResult').hidden = true;
    $('#viewResultArtifact').hidden = true;
    updateUI();
    tone(100, 0.35, 'sawtooth');
  }

  function diveAgain() {
    $('#shareResult').hidden = false;
    $('#copyResult').hidden = false;
    resetDiveScreen();
    beginDive();
  }

  function resultShareText() {
    if (!dive || dive.status !== 'surfaced') return '';
    const best = [...lastResultArtifacts].sort((a, b) => rarityBonus[b.rarity] - rarityBonus[a.rarity])[0];
    const score = calculateScore(dive.lootXP + (state.artifacts.find(item => item.id === state.equippedId) ? Math.round(dive.lootXP * state.artifacts.find(item => item.id === state.equippedId).bonus / 100) : 0));
    return `I survived ${format(dive.depth)}m below Atlantis 🌊\n\n💎 ${format(dive.lootXP)} XP\n🏺 ${best ? `${best.rarity} Artifact` : 'No artifact'}\n🔱 ${currentRank().name}\n🏆 Dive Score: ${format(score.total)}\n\nCan you dive deeper?\n\nAQUANAUT powered by $NAUT on Aqua`;
  }

  function showRankUp(rank) {
    $('#rankDialogTitle').textContent = `You are now a ${rank}`;
    showDialog($('#rankDialog'));
    tone(760, 0.35, 'triangle');
  }

  function countdown() {
    const now = new Date();
    const end = new Date(now);
    const day = now.getDay() || 7;
    end.setDate(now.getDate() + (8 - day));
    end.setHours(0, 0, 0, 0);
    const difference = Math.max(0, end - now);
    const days = Math.floor(difference / 86400000);
    const hours = Math.floor(difference / 3600000) % 24;
    const minutes = Math.floor(difference / 60000) % 60;
    const seconds = Math.floor(difference / 1000) % 60;
    if ($('#weeklyCountdown')) $('#weeklyCountdown').innerHTML = [['Days', days], ['Hours', hours], ['Minutes', minutes], ['Seconds', seconds]].map(([label, value]) => `<div><strong>${String(value).padStart(2, '0')}</strong><span>${label}</span></div>`).join('');
  }

  function resetProgress() {
    state = freshState();
    saveState();
    closeDialog($('#resetDialog'));
    updateUI();
    renderProfile();
    toast('Local demo progress reset');
  }

  function bindEvents() {
    addEventListener('hashchange', route);
    $('#menuButton')?.addEventListener('click', openMenu);
    $('#menuClose')?.addEventListener('click', closeMenu);
    $$('#mobileMenu a').forEach(link => link.addEventListener('click', closeMenu));

    $$('.home-view a[href="#map"], .enter-button[href="#map"]').forEach(link => link.addEventListener('click', requestEntry));
    $('#walletButton')?.addEventListener('click', () => showDialog($('#walletDialog')));
    $('#walletClose')?.addEventListener('click', () => closeDialog($('#walletDialog')));
    $('#continueDemo')?.addEventListener('click', continueDemo);

    $('#nextOnboarding')?.addEventListener('click', () => {
      if (onboardingStep >= $$('.onboarding-step').length - 1) finishOnboarding();
      else { onboardingStep += 1; renderOnboarding(); }
    });
    $('#skipOnboarding')?.addEventListener('click', finishOnboarding);

    $('#soundToggle')?.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      saveState();
      updateUI();
      tone(420, 0.1, 'triangle');
    });

    $('#beginDive')?.addEventListener('click', beginDive);
    $('#diveDeeper')?.addEventListener('click', diveDeeper);
    $('#surfaceDive')?.addEventListener('click', surfaceDive);
    $('#diveAgain')?.addEventListener('click', diveAgain);
    $('#secureRelic')?.addEventListener('click', surfaceDive);
    $('#continueRelic')?.addEventListener('click', continueAfterRelic);
    $('#rankDialogClose')?.addEventListener('click', () => closeDialog($('#rankDialog')));

    $('#copyToken')?.addEventListener('click', () => {
      const address = String(window.AQUA_CONFIG?.TOKEN_CA || '').trim();
      if (address) copyText(address, '$NAUT address copied');
    });

    $('#shareResult')?.addEventListener('click', () => shareText('AQUANAUT dive result', resultShareText()));
    $('#copyResult')?.addEventListener('click', () => copyText(resultShareText(), 'Dive result copied'));
    $('#viewResultArtifact')?.addEventListener('click', event => openArtifact(event.currentTarget.dataset.artifactId));

    $('#shareProfile')?.addEventListener('click', () => shareText('AQUANAUT profile', `Local Aquanaut | ${currentRank().name} | ${format(state.xp)} XP | Best depth ${format(state.bestDepth)}m | ${state.artifacts.length} artifacts`));
    $('#shareBestDive')?.addEventListener('click', () => shareText('AQUANAUT best dive', `My best AQUANAUT depth is ${format(state.bestDepth)}m with a high score of ${format(state.highestDiveScore)}. Can you dive deeper?`));

    $('#resetProgress')?.addEventListener('click', () => showDialog($('#resetDialog')));
    $('#cancelReset')?.addEventListener('click', () => closeDialog($('#resetDialog')));
    $('#confirmReset')?.addEventListener('click', resetProgress);

    document.addEventListener('click', event => {
      const missionTab = event.target.closest('[data-mission-category]');
      if (missionTab) { missionCategory = missionTab.dataset.missionCategory; renderMissions(); return; }
      const claim = event.target.closest('[data-claim]');
      if (claim) { claimMission(claim.dataset.claim); return; }
      const vaultTab = event.target.closest('[data-vault-filter]');
      if (vaultTab) { vaultFilter = vaultTab.dataset.vaultFilter; renderArtifacts(); return; }
      const artifact = event.target.closest('[data-view-artifact]');
      if (artifact) { openArtifact(artifact.dataset.viewArtifact); return; }
      const leaderboardTab = event.target.closest('[data-leaderboard-mode]');
      if (leaderboardTab) { leaderboardMode = leaderboardTab.dataset.leaderboardMode; renderLeaderboard(); }
    });

    $('#artifactDialog')?.addEventListener('click', event => {
      if (event.target.id === 'modalEquipArtifact') toggleArtifact();
      if (event.target.id === 'modalCloseArtifact') closeDialog($('#artifactDialog'));
    });

    [$('#walletDialog'), $('#onboardingDialog'), $('#artifactDialog'), $('#rankDialog'), $('#relicReveal')].forEach(dialog => dialog?.addEventListener('click', event => {
      if (event.target === dialog && dialog.id !== 'relicReveal') closeDialog(dialog);
    }));
  }

  installUI();
  bindEvents();
  updateUI();
  route();
  countdown();
  setInterval(countdown, 1000);
  if (recoveredState) setTimeout(() => toast('Local expedition data was reset after a storage error.'), 400);
})();
