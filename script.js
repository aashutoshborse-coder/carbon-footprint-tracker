/**
 * EcoTrack AI – script.js
 * Carbon Footprint Awareness Platform
 * All data persisted via localStorage
 */

'use strict';

/* ═══════════════════════════════════════════════
   CONSTANTS & CONFIG
   ═══════════════════════════════════════════════ */

const STORAGE_KEYS = {
  THEME:      'ecotrack_theme',
  SCORE:      'ecotrack_score',
  POINTS:     'ecotrack_points',
  STREAK:     'ecotrack_streak',
  COMPLETED:  'ecotrack_challenges_completed',
  LAST_DATE:  'ecotrack_last_date',
  CHALLENGE_DONE: 'ecotrack_challenge_done',
  WEEKLY:     'ecotrack_weekly',
  CO2_SAVED:  'ecotrack_co2_saved',
};

/** Emission factors (kg CO₂/year) */
const EMISSIONS = {
  transport: { car: 2400, bike: 100, public: 600, walk: 0 },
  electricity: { low: 400, medium: 900, high: 1600 },
  food: { vegetarian: 1000, mixed: 1700, nonveg: 2500 },
  plastic: { low: 50, medium: 150, high: 300 },
};

/** Daily eco challenges pool */
const CHALLENGES = [
  { text: 'Avoid all single-use plastic items today', icon: 'ph-recycle', points: 25 },
  { text: 'Walk or cycle instead of driving today', icon: 'ph-bicycle', points: 30 },
  { text: 'Plant one tree or support a reforestation project', icon: 'ph-tree', points: 50 },
  { text: 'Carry a reusable water bottle all day', icon: 'ph-bottle-water', points: 20 },
  { text: 'Turn off all unused lights and unplug chargers', icon: 'ph-lightning', points: 20 },
  { text: 'Eat a fully plant-based meal today', icon: 'ph-leaf', points: 25 },
  { text: 'Take a cold (or cooler) shower to save energy', icon: 'ph-shower', points: 15 },
  { text: 'Sort and recycle all your waste correctly today', icon: 'ph-trash', points: 20 },
  { text: 'Use public transport for all journeys today', icon: 'ph-bus', points: 30 },
  { text: 'Air-dry your clothes instead of using a dryer', icon: 'ph-wind', points: 15 },
  { text: 'Meal prep to reduce food waste this week', icon: 'ph-cooking-pot', points: 25 },
  { text: 'Take a 5-minute shorter shower than usual', icon: 'ph-drop', points: 15 },
  { text: 'Shop at a local farmers market or zero-waste store', icon: 'ph-storefront', points: 30 },
  { text: 'Use a cloth bag for all shopping today', icon: 'ph-bag', points: 20 },
  { text: 'Offset your carbon by donating to a climate fund', icon: 'ph-hand-heart', points: 40 },
];

/** AI Recommendation banks by score level */
const RECOMMENDATIONS = {
  excellent: [
    { icon: 'ph-thumbs-up', text: 'Excellent! Keep using public transport or cycling.' },
    { icon: 'ph-leaf', text: 'Continue your plant-based diet – you are an eco champion!' },
    { icon: 'ph-star', text: 'Share your green habits with friends and family to inspire others.' },
    { icon: 'ph-tree', text: 'Consider supporting local tree-planting or reforestation initiatives.' },
    { icon: 'ph-solar-panel', text: 'Explore community solar programs to further reduce grid dependency.' },
  ],
  good: [
    { icon: 'ph-lightbulb', text: 'Try to reduce electricity usage by switching to LED lighting throughout.' },
    { icon: 'ph-bottle-water', text: 'Use a reusable bottle – it replaces hundreds of plastic bottles per year.' },
    { icon: 'ph-leaf', text: 'Add more plant-based meals to your weekly menu to lower food emissions.' },
    { icon: 'ph-bicycle', text: 'Swap one car trip per week for cycling or walking – every trip counts.' },
    { icon: 'ph-recycle', text: 'Improve your recycling habits for paper, plastic, glass, and metal.' },
  ],
  moderate: [
    { icon: 'ph-lightning', text: 'Switch to a green energy tariff or install solar panels at home.' },
    { icon: 'ph-airplane', text: 'Consider alternatives to flying – trains emit ~10× less CO₂ per km.' },
    { icon: 'ph-hamburger', text: 'Reducing meat consumption by 50% could cut your food emissions in half.' },
    { icon: 'ph-shopping-bag', text: 'Buy second-hand clothing and electronics to reduce manufacturing emissions.' },
    { icon: 'ph-bus', text: 'Use public transport or carpool for your daily commute.' },
    { icon: 'ph-thermometer', text: 'Lower your home thermostat by 1–2°C to significantly reduce heating bills.' },
  ],
  high: [
    { icon: 'ph-warning', text: 'Urgent: Avoid unnecessary flights – aviation is a top personal emitter.' },
    { icon: 'ph-solar-panel', text: 'Switch to renewable energy immediately – this is the single biggest impact.' },
    { icon: 'ph-recycle', text: 'Dramatically reduce single-use plastic and non-recyclable packaging.' },
    { icon: 'ph-tree', text: 'Plant 10+ trees this year to begin offsetting your current footprint.' },
    { icon: 'ph-bicycle', text: 'Replace short car trips with bicycles or e-scooters wherever possible.' },
    { icon: 'ph-leaf', text: 'Transition to a predominantly vegetarian or vegan diet as soon as possible.' },
    { icon: 'ph-house', text: 'Insulate your home properly to reduce heating and cooling energy needs.' },
  ],
};

/* ═══════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════ */
const state = {
  theme: localStorage.getItem(STORAGE_KEYS.THEME) || 'dark',
  score: parseInt(localStorage.getItem(STORAGE_KEYS.SCORE) || '0'),
  points: parseInt(localStorage.getItem(STORAGE_KEYS.POINTS) || '0'),
  streak: parseInt(localStorage.getItem(STORAGE_KEYS.STREAK) || '0'),
  completed: parseInt(localStorage.getItem(STORAGE_KEYS.COMPLETED) || '0'),
  co2Saved: parseFloat(localStorage.getItem(STORAGE_KEYS.CO2_SAVED) || '0'),
  challengeDone: false,
  currentChallenge: null,
  weekly: JSON.parse(localStorage.getItem(STORAGE_KEYS.WEEKLY) || 'null'),
  chart: null,
};

/* ═══════════════════════════════════════════════
   DOM REFERENCES
   ═══════════════════════════════════════════════ */
const $ = id => document.getElementById(id);

const DOM = {
  html:           document.documentElement,
  navbar:         $('navbar'),
  themeToggle:    $('themeToggle'),
  hamburger:      $('hamburger'),
  mobileMenu:     $('mobileMenu'),
  backToTop:      $('backToTop'),
  toastContainer: $('toastContainer'),

  // Calculator
  calcForm:          $('calcForm'),
  flightsSlider:     $('flights'),
  flightsValue:      $('flightsValue'),
  householdSlider:   $('household'),
  householdValue:    $('householdValue'),
  resultPlaceholder: $('resultPlaceholder'),
  scoreCard:         $('scoreCard'),
  scoreCircle:       $('scoreCircle'),
  scoreNumber:       $('scoreNumber'),
  scoreLevel:        $('scoreLevel'),
  scoreDesc:         $('scoreDesc'),
  metricCo2:         $('metricCo2'),
  metricTrees:       $('metricTrees'),
  recommendations:   $('recommendations'),
  recList:           $('recList'),

  // Challenge
  challengeText:   $('challengeText'),
  challengeIcon:   $('challengeIcon'),
  challengePoints: $('challengePoints'),
  completeBtn:     $('completeBtn'),
  completeBtnText: $('completeBtnText'),
  newChallengeBtn: $('newChallengeBtn'),
  greenPoints:     $('greenPoints'),
  pointsFill:      $('pointsFill'),
  streakCount:     $('streakCount'),
  completedCount:  $('completedCount'),

  // Dashboard
  kpiScore:      $('kpiScore'),
  kpiPoints:     $('kpiPoints'),
  kpiChallenges: $('kpiChallenges'),
  kpiCo2:        $('kpiCo2'),
  weeklyChart:   $('weeklyChart'),

  // Contact
  contactForm:    $('contactForm'),
  contactSuccess: $('contactSuccess'),

  // Newsletter
  newsletterForm:    $('newsletterForm'),
  newsletterSuccess: $('newsletterSuccess'),
};

/* ═══════════════════════════════════════════════
   THEME MANAGEMENT
   ═══════════════════════════════════════════════ */

function applyTheme(theme) {
  DOM.html.setAttribute('data-theme', theme);
  state.theme = theme;
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
  updateChartColors();
}

function toggleTheme() {
  applyTheme(state.theme === 'dark' ? 'light' : 'dark');
}

/* ═══════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════ */

function handleNavScroll() {
  const scrolled = window.scrollY > 60;
  DOM.navbar.classList.toggle('scrolled', scrolled);
  DOM.backToTop.classList.toggle('visible', window.scrollY > 400);
}

function updateActiveNavLink() {
  const sections = ['home', 'howitworks', 'calculator', 'dashboard', 'tips', 'about', 'contact'];
  const scrollPos = window.scrollY + 100;

  sections.forEach(id => {
    const el = document.getElementById(id);
    const navLink = document.getElementById(`nav-${id}`);
    if (!el || !navLink) return;

    const top = el.offsetTop;
    const bottom = top + el.offsetHeight;

    if (scrollPos >= top && scrollPos < bottom) {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      navLink.classList.add('active');
    }
  });
}

function toggleMobileMenu() {
  const isOpen = DOM.hamburger.classList.toggle('open');
  DOM.hamburger.setAttribute('aria-expanded', isOpen);
  DOM.mobileMenu.classList.toggle('open', isOpen);
}

function closeMobileMenu() {
  DOM.hamburger.classList.remove('open');
  DOM.hamburger.setAttribute('aria-expanded', 'false');
  DOM.mobileMenu.classList.remove('open');
}

/* ═══════════════════════════════════════════════
   HERO COUNTERS
   ═══════════════════════════════════════════════ */

function animateCounter(el, target, duration = 1800) {
  if (!el) return;
  const start = performance.now();
  const startVal = 0;

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
    el.textContent = Math.floor(startVal + (target - startVal) * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target.toLocaleString();
  }

  requestAnimationFrame(update);
}

function initHeroCounters() {
  document.querySelectorAll('.stat-number[data-target]').forEach(el => {
    animateCounter(el, parseInt(el.dataset.target));
  });
}

/* ═══════════════════════════════════════════════
   CARBON CALCULATOR
   ═══════════════════════════════════════════════ */

/**
 * Compute eco score (0–100) and annual CO₂ in tonnes.
 * Lower emissions → higher score.
 */
function computeScore(formData) {
  const transport   = EMISSIONS.transport[formData.transport]   || 600;
  const electricity = EMISSIONS.electricity[formData.electricity] || 900;
  const food        = EMISSIONS.food[formData.food]             || 1700;
  const plastic     = EMISSIONS.plastic[formData.plastic]       || 150;
  const flights     = (parseInt(formData.flights) || 0) * 800;
  const household   = parseInt(formData.household) || 3;

  // Total annual kg CO₂
  const totalKg = (transport + electricity + food + plastic + flights) / household;
  const totalTonnes = totalKg / 1000;

  // World average ~4T/yr, below 2T = excellent
  // Score: 100 at 0T, 0 at 10T+
  const rawScore = Math.max(0, Math.min(100, 100 - (totalTonnes / 10) * 100));
  const score = Math.round(rawScore);

  return { score, totalKg, totalTonnes: parseFloat(totalTonnes.toFixed(2)) };
}

function getScoreLevel(score) {
  if (score >= 80) return { label: '🌿 Excellent',   cls: 'excellent', desc: 'You are a true eco-champion! Your carbon footprint is well below average.', recs: 'excellent' };
  if (score >= 60) return { label: '✅ Good',         cls: 'good',      desc: 'You are doing well! A few tweaks can push you to excellent territory.',   recs: 'good' };
  if (score >= 40) return { label: '⚠️ Moderate',    cls: 'moderate',  desc: 'Your footprint is around the global average. Time to make some changes.',   recs: 'moderate' };
  return                  { label: '🔴 High Impact',  cls: 'high',      desc: 'Your carbon footprint is significantly above average. Action needed now.',  recs: 'high' };
}

function animateScoreRing(score) {
  const circumference = 2 * Math.PI * 75; // r=75
  const offset = circumference - (score / 100) * circumference;
  DOM.scoreCircle.style.strokeDashoffset = offset;
}

function renderScore(score, totalKg, totalTonnes) {
  // Hide placeholder, show score card
  DOM.resultPlaceholder.hidden = true;
  DOM.scoreCard.hidden = false;
  DOM.recommendations.hidden = false;

  const level = getScoreLevel(score);

  // Animate number
  animateCounter(DOM.scoreNumber, score, 1500);

  // Animate ring
  setTimeout(() => animateScoreRing(score), 100);

  // Labels
  DOM.scoreLevel.textContent = level.label;
  DOM.scoreDesc.textContent  = level.desc;

  // Metrics
  DOM.metricCo2.textContent   = totalTonnes.toFixed(1);
  DOM.metricTrees.textContent = Math.ceil(totalKg / 21);

  // Recommendations
  const recs = RECOMMENDATIONS[level.recs];
  DOM.recList.innerHTML = '';
  recs.forEach((rec, i) => {
    const div = document.createElement('div');
    div.className = 'rec-item';
    div.style.animationDelay = `${i * 0.08}s`;
    div.innerHTML = `<i class="ph ${rec.icon}"></i><span>${rec.text}</span>`;
    DOM.recList.appendChild(div);
  });

  // Save to state
  state.score = score;
  state.co2Saved = Math.max(state.co2Saved, totalTonnes > 4 ? 0 : (4 - totalTonnes) * 1000);
  localStorage.setItem(STORAGE_KEYS.SCORE, score);
  localStorage.setItem(STORAGE_KEYS.CO2_SAVED, state.co2Saved);

  // Update dashboard
  updateDashboard();
  updateWeeklyData(score);

  showToast(`Eco Score calculated: ${score}/100 — ${level.label}`, 'success');
}

function handleCalcSubmit(e) {
  e.preventDefault();
  const fd = new FormData(DOM.calcForm);

  const transport   = fd.get('transport');
  const electricity = fd.get('electricity');
  const food        = fd.get('food');
  const plastic     = fd.get('plastic');

  // Validate
  if (!transport || !electricity || !food || !plastic) {
    showToast('Please complete all sections before calculating.', 'error');
    return;
  }

  const formData = {
    transport, electricity, food, plastic,
    flights:   fd.get('flights'),
    household: fd.get('household'),
  };

  const { score, totalKg, totalTonnes } = computeScore(formData);
  renderScore(score, totalKg, totalTonnes);

  // Scroll to result on mobile
  if (window.innerWidth <= 1024) {
    setTimeout(() => {
      DOM.scoreCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  }
}

/* ═══════════════════════════════════════════════
   DAILY CHALLENGE
   ═══════════════════════════════════════════════ */

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getDailyChallenge() {
  // Generate consistent challenge per day using date as seed
  const today = getTodayDate();
  const seed  = today.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return CHALLENGES[seed % CHALLENGES.length];
}

function loadChallenge() {
  const challenge = getDailyChallenge();
  state.currentChallenge = challenge;

  DOM.challengeText.textContent   = challenge.text;
  DOM.challengePoints.textContent = `+${challenge.points} Points`;

  // Update icon
  DOM.challengeIcon.className = `ph ${challenge.icon}`;

  // Check if already completed today
  const lastDate = localStorage.getItem(STORAGE_KEYS.LAST_DATE);
  const done     = localStorage.getItem(STORAGE_KEYS.CHALLENGE_DONE) === 'true';
  state.challengeDone = done && lastDate === getTodayDate();

  updateChallengeUI();
}

function updateChallengeUI() {
  if (state.challengeDone) {
    DOM.completeBtn.classList.add('completed');
    DOM.completeBtn.setAttribute('aria-pressed', 'true');
    DOM.completeBtnText.textContent = '✓ Completed Today!';
  } else {
    DOM.completeBtn.classList.remove('completed');
    DOM.completeBtn.setAttribute('aria-pressed', 'false');
    DOM.completeBtnText.textContent = 'Mark as Completed';
  }
}

function completeChallenge() {
  if (state.challengeDone) {
    showToast("You've already completed today's challenge! Come back tomorrow.", 'info');
    return;
  }

  const today    = getTodayDate();
  const lastDate = localStorage.getItem(STORAGE_KEYS.LAST_DATE);
  const points   = state.currentChallenge?.points || 25;

  // Award points
  state.points += points;
  state.completed += 1;
  state.co2Saved += points * 0.5; // 0.5 kg CO₂ per point

  // Update streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);
  state.streak = (lastDate === yStr || lastDate === today) ? state.streak + 1 : 1;

  // Mark as done
  state.challengeDone = true;
  localStorage.setItem(STORAGE_KEYS.LAST_DATE, today);
  localStorage.setItem(STORAGE_KEYS.CHALLENGE_DONE, 'true');
  localStorage.setItem(STORAGE_KEYS.POINTS, state.points);
  localStorage.setItem(STORAGE_KEYS.STREAK, state.streak);
  localStorage.setItem(STORAGE_KEYS.COMPLETED, state.completed);
  localStorage.setItem(STORAGE_KEYS.CO2_SAVED, state.co2Saved);

  updateChallengeUI();
  renderSidebarStats();
  updateDashboard();

  showToast(`🎉 +${points} Green Points earned! Keep it up!`, 'success');
}

function renderSidebarStats() {
  // Green points
  DOM.greenPoints.textContent = state.points.toLocaleString();
  const pct = Math.min((state.points / 500) * 100, 100);
  DOM.pointsFill.style.width = `${pct}%`;

  // Streak
  DOM.streakCount.textContent = state.streak;

  // Completed
  DOM.completedCount.textContent = state.completed;
}

function getRandomChallenge() {
  const idx = Math.floor(Math.random() * CHALLENGES.length);
  const challenge = CHALLENGES[idx];
  state.currentChallenge = challenge;

  DOM.challengeText.textContent   = challenge.text;
  DOM.challengePoints.textContent = `+${challenge.points} Points`;
  DOM.challengeIcon.className     = `ph ${challenge.icon}`;

  state.challengeDone = false;
  updateChallengeUI();
  showToast('New challenge loaded! Good luck! 🌱', 'info');
}

/* ═══════════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════════ */

function updateDashboard() {
  animateCounter(DOM.kpiScore,      state.score);
  animateCounter(DOM.kpiPoints,     state.points);
  animateCounter(DOM.kpiChallenges, state.completed);
  animateCounter(DOM.kpiCo2,        Math.round(state.co2Saved));

  // Also update about section counters
  document.querySelectorAll('.about-stat-num').forEach(el => {
    animateCounter(el, parseInt(el.dataset.target || el.textContent));
  });
}

/* ═══════════════════════════════════════════════
   WEEKLY CHART
   ═══════════════════════════════════════════════ */

function initWeeklyData() {
  // Load or create default weekly data
  if (!state.weekly) {
    state.weekly = {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      scores: [45, 58, 67, 72],
      co2:    [25, 18, 12, 8],
    };
    localStorage.setItem(STORAGE_KEYS.WEEKLY, JSON.stringify(state.weekly));
  }
}

function updateWeeklyData(score) {
  if (!state.weekly) initWeeklyData();

  // Update the latest week's data
  const len = state.weekly.scores.length;
  state.weekly.scores[len - 1] = score;
  state.weekly.co2[len - 1]    = Math.round(state.co2Saved * 0.001);

  localStorage.setItem(STORAGE_KEYS.WEEKLY, JSON.stringify(state.weekly));
  if (state.chart) {
    state.chart.data.datasets[0].data = state.weekly.scores;
    state.chart.data.datasets[1].data = state.weekly.co2;
    state.chart.update('active');
  }
}

function getChartColors() {
  const isDark = state.theme === 'dark';
  return {
    gridColor:   isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    tickColor:   isDark ? 'rgba(240,253,244,0.5)'  : 'rgba(5,46,22,0.5)',
    tooltipBg:   isDark ? 'rgba(10,26,15,0.95)'    : 'rgba(255,255,255,0.95)',
    tooltipText: isDark ? '#f0fdf4'                 : '#052e16',
  };
}

function updateChartColors() {
  if (!state.chart) return;
  const c = getChartColors();
  state.chart.options.scales.x.grid.color = c.gridColor;
  state.chart.options.scales.y.grid.color = c.gridColor;
  state.chart.options.scales.x.ticks.color = c.tickColor;
  state.chart.options.scales.y.ticks.color = c.tickColor;
  state.chart.options.plugins.tooltip.backgroundColor = c.tooltipBg;
  state.chart.options.plugins.tooltip.titleColor = c.tooltipText;
  state.chart.options.plugins.tooltip.bodyColor  = c.tooltipText;
  state.chart.update('none');
}

function initChart() {
  if (!DOM.weeklyChart || !window.Chart) return;
  if (!state.weekly) initWeeklyData();

  const c = getChartColors();

  state.chart = new Chart(DOM.weeklyChart, {
    type: 'line',
    data: {
      labels: state.weekly.labels,
      datasets: [
        {
          label: 'Eco Score',
          data: state.weekly.scores,
          borderColor: '#4ade80',
          backgroundColor: 'rgba(74,222,128,0.08)',
          borderWidth: 2.5,
          pointBackgroundColor: '#4ade80',
          pointBorderColor: 'transparent',
          pointRadius: 6,
          pointHoverRadius: 8,
          tension: 0.45,
          fill: true,
        },
        {
          label: 'CO₂ Saved (kg)',
          data: state.weekly.co2,
          borderColor: '#60a5fa',
          backgroundColor: 'rgba(96,165,250,0.06)',
          borderWidth: 2.5,
          pointBackgroundColor: '#60a5fa',
          pointBorderColor: 'transparent',
          pointRadius: 6,
          pointHoverRadius: 8,
          tension: 0.45,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: c.tooltipBg,
          titleColor: c.tooltipText,
          bodyColor: c.tooltipText,
          borderColor: 'rgba(74,222,128,0.3)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 10,
          titleFont: { family: 'Outfit', weight: '700', size: 13 },
          bodyFont:  { family: 'Inter', size: 12 },
        },
      },
      scales: {
        x: {
          grid: { color: c.gridColor },
          ticks: { color: c.tickColor, font: { family: 'Inter', size: 11 } },
          border: { display: false },
        },
        y: {
          grid: { color: c.gridColor },
          ticks: { color: c.tickColor, font: { family: 'Inter', size: 11 } },
          border: { display: false },
          beginAtZero: true,
          max: 100,
        },
      },
      animation: { duration: 800, easing: 'easeInOutQuart' },
    },
  });
}

/* ═══════════════════════════════════════════════
   CONTACT FORM
   ═══════════════════════════════════════════════ */

function handleContactSubmit(e) {
  e.preventDefault();
  const name    = $('contactName')?.value.trim();
  const email   = $('contactEmail')?.value.trim();
  const subject = $('contactSubject')?.value.trim();
  const message = $('contactMessage')?.value.trim();

  if (!name || !email || !subject || !message) {
    showToast('Please fill in all fields.', 'error');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Please enter a valid email address.', 'error');
    return;
  }

  // Build mailto: body
  const body = `Name: ${name}\nFrom: ${email}\n\n${message}`;
  const mailtoLink = `mailto:aashutoshborse73@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // Open mail client
  window.location.href = mailtoLink;

  // Show success + reset after short delay
  setTimeout(() => {
    DOM.contactSuccess.hidden = false;
    DOM.contactForm.reset();
    showToast('Opening your email client... 💚', 'success');
    setTimeout(() => { DOM.contactSuccess.hidden = true; }, 5000);
  }, 400);
}

/* ═══════════════════════════════════════════════
   NEWSLETTER FORM
   ═══════════════════════════════════════════════ */

function handleNewsletterSubmit(e) {
  e.preventDefault();
  const email = $('newsletterEmail')?.value.trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Please enter a valid email address.', 'error');
    return;
  }

  DOM.newsletterSuccess.hidden = false;
  DOM.newsletterForm.reset();
  showToast('You\'re subscribed to EcoTrack AI updates! 🌱', 'success');
  setTimeout(() => { DOM.newsletterSuccess.hidden = true; }, 4000);
}

/* ═══════════════════════════════════════════════
   TOAST NOTIFICATIONS
   ═══════════════════════════════════════════════ */

function showToast(message, type = 'info', duration = 4000) {
  const icons = { success: 'ph-check-circle', error: 'ph-x-circle', info: 'ph-info' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `<i class="ph ${icons[type]}"></i><span>${message}</span>`;

  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ═══════════════════════════════════════════════
   INTERSECTION OBSERVER (Scroll Animations)
   ═══════════════════════════════════════════════ */

function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
  );

  // Only add fade-in to grid cards — NOT structural layout containers like .how-step
  const targets = [
    ...document.querySelectorAll('.tip-card'),
    ...document.querySelectorAll('.kpi-card'),
    ...document.querySelectorAll('.about-stat'),
    ...document.querySelectorAll('.contact-item'),
  ];

  targets.forEach((el, i) => {
    el.classList.add('fade-in-up');
    el.style.transitionDelay = `${(i % 4) * 0.08}s`;
    observer.observe(el);
  });

  // About stats counter trigger
  const aboutObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.about-stat-num[data-target]').forEach(el => {
            animateCounter(el, parseInt(el.dataset.target));
          });
          aboutObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  const aboutStats = document.querySelector('.about-stats-grid');
  if (aboutStats) aboutObserver.observe(aboutStats);
}

/* ═══════════════════════════════════════════════
   SLIDER INTERACTIONS
   ═══════════════════════════════════════════════ */

function initSliders() {
  // Flights
  if (DOM.flightsSlider && DOM.flightsValue) {
    DOM.flightsSlider.addEventListener('input', () => {
      const v = DOM.flightsSlider.value;
      DOM.flightsValue.textContent = `${v} flight${v === '1' ? '' : 's'}`;
      DOM.flightsSlider.setAttribute('aria-valuenow', v);
    });
  }

  // Household
  if (DOM.householdSlider && DOM.householdValue) {
    DOM.householdSlider.addEventListener('input', () => {
      const v = DOM.householdSlider.value;
      DOM.householdValue.textContent = `${v} ${v === '1' ? 'person' : 'people'}`;
      DOM.householdSlider.setAttribute('aria-valuenow', v);
    });
  }
}

/* ═══════════════════════════════════════════════
   SMOOTH SCROLL FOR NAV LINKS
   ═══════════════════════════════════════════════ */

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 80; // navbar height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ═══════════════════════════════════════════════
   BACK TO TOP
   ═══════════════════════════════════════════════ */

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ═══════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════ */

function init() {
  // Apply saved theme
  applyTheme(state.theme);

  // Theme toggle
  DOM.themeToggle?.addEventListener('click', toggleTheme);

  // Navbar
  window.addEventListener('scroll', () => {
    handleNavScroll();
    updateActiveNavLink();
  }, { passive: true });

  DOM.hamburger?.addEventListener('click', toggleMobileMenu);

  // Close mobile menu on outside click
  document.addEventListener('click', e => {
    if (DOM.mobileMenu.classList.contains('open') &&
        !DOM.mobileMenu.contains(e.target) &&
        !DOM.hamburger.contains(e.target)) {
      closeMobileMenu();
    }
  });

  // Back to top
  DOM.backToTop?.addEventListener('click', scrollToTop);

  // Calculator
  DOM.calcForm?.addEventListener('submit', handleCalcSubmit);
  initSliders();

  // Challenge
  loadChallenge();
  renderSidebarStats();
  DOM.completeBtn?.addEventListener('click', completeChallenge);
  DOM.newChallengeBtn?.addEventListener('click', getRandomChallenge);

  // Dashboard
  updateDashboard();
  initWeeklyData();

  // Chart (wait for Chart.js to load)
  if (window.Chart) {
    initChart();
  } else {
    document.querySelector('script[src*="chart.js"]')?.addEventListener('load', initChart);
    // Fallback: retry after delay
    setTimeout(initChart, 2000);
  }

  // Contact
  DOM.contactForm?.addEventListener('submit', handleContactSubmit);

  // Newsletter
  DOM.newsletterForm?.addEventListener('submit', handleNewsletterSubmit);

  // Scroll animations
  initScrollAnimations();

  // Smooth scroll
  initSmoothScroll();

  // Hero counters (with slight delay for paint)
  setTimeout(initHeroCounters, 500);

  // Initial nav state
  handleNavScroll();

  console.log(
    '%c🌿 EcoTrack AI Loaded',
    'color:#4ade80;font-family:Outfit,sans-serif;font-size:16px;font-weight:bold;background:#050f0a;padding:8px 16px;border-radius:8px;'
  );
}

// Bootstrap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
