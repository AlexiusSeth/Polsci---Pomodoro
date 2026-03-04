/* ============================================================
   THE DIPLOMAT'S POMODORO — app.js
   Personalized for [Name] · Political Science Scholar

   PERSISTENCE (localStorage keys):
     dp_sessions_today   — work sessions completed today (number)
     dp_minutes_total    — total focused minutes all time (number)
     dp_last_study_date  — last date a session was completed (YYYY-MM-DD)
     dp_tasks            — task list (JSON array)
   ============================================================ */

'use strict';

/* ── Personalization ──────────────────────────────────────── */
const NAME = 'Monica'; // <-- REPLACE with your name for a personalized experience

/* ── Storage Keys ─────────────────────────────────────────── */
const KEYS = {
  sessionsToday : 'dp_sessions_today',
  minutesTotal  : 'dp_minutes_total',
  lastStudyDate : 'dp_last_study_date',
  tasks         : 'dp_tasks',
};

/* ── Timer Configuration ──────────────────────────────────── */
const MODES = {
  work:  { duration: 25 * 60, label: 'Focus Time',   seal: '⚜ Commence Session',  isBreak: false },
  short: { duration:  5 * 60, label: 'Short Recess', seal: '⚜ Brief Adjournment', isBreak: true  },
  long:  { duration: 15 * 60, label: 'Long Recess',  seal: '⚜ Extended Recess',   isBreak: true  },
};

const CIRCUMFERENCE = 2 * Math.PI * 110;

/* ── Quotes ───────────────────────────────────────────────── */
/* ── Political Science Quotes ─────────────────────────────── */
const QUOTES = [
  { text: "The most courageous act is still to think for yourself. Aloud.",                                   author: "Coco Chanel"            },
  { text: "Power is not only what you have, but what the enemy thinks you have.",                             author: "Saul Alinsky"           },
  { text: "To be prepared is half the victory.",                                                              author: "Miguel de Cervantes"    },
  { text: "In politics, nothing happens by accident. If it happened, you can bet it was planned that way.",   author: "Franklin D. Roosevelt"  },
  { text: "Educating the mind without educating the heart is no education at all.",                           author: "Aristotle"              },
  { text: "Power concedes nothing without a demand. It never did and it never will.",                         author: "Frederick Douglass"     },
  { text: "The function of freedom is to free someone else.",                                                 author: "Toni Morrison"          },
  { text: "Not everything that is faced can be changed, but nothing can be changed until it is faced.",       author: "James Baldwin"          },
  { text: "Injustice anywhere is a threat to justice everywhere.",                                            author: "Martin Luther King Jr." },
  { text: "We are the ones we have been waiting for.",                                                        author: "June Jordan"            },
  { text: "The most common way people give up their power is by thinking they don't have any.",               author: "Alice Walker"           },
  { text: "One child, one teacher, one book, one pen can change the world.",                                  author: "Malala Yousafzai"       },
  { text: "If liberty means anything at all, it means the right to tell people what they do not want to hear.", author: "George Orwell"        },
  { text: "Nearly all men can stand adversity, but if you want to test a man's character, give him power.",   author: "Abraham Lincoln"        },
  { text: "In the long run, the most unpleasant truth is a safer companion than a pleasant falsehood.",       author: "Theodore Roosevelt"     },
];

/* ── Legal Maxims ─────────────────────────────────────────────
   Each maxim has:
     latin       — the original Latin phrase
     translation — plain English meaning
     origin      — source / legal tradition
   ─────────────────────────────────────────────────────────── */
const MAXIMS = [
  { latin: "Audi alteram partem",          translation: "Hear the other side.",                                          origin: "Natural Justice / Roman Law"      },
  { latin: "Ignorantia juris non excusat", translation: "Ignorance of the law is no excuse.",                            origin: "Common Law"                       },
  { latin: "Fiat justitia ruat caelum",    translation: "Let justice be done, though the heavens fall.",                 origin: "Roman Legal Maxim"                },
  { latin: "Nemo judex in causa sua",      translation: "No one should be a judge in their own case.",                   origin: "Natural Justice / Roman Law"      },
  { latin: "Actus reus non facit reum nisi mens sit rea", translation: "An act does not make a person guilty unless the mind is also guilty.", origin: "Criminal Law" },
  { latin: "In dubio pro reo",             translation: "When in doubt, favor the accused.",                              origin: "Criminal Law / Roman Law"         },
  { latin: "Pacta sunt servanda",          translation: "Agreements must be kept.",                                       origin: "International Law / Roman Law"    },
  { latin: "Nemo dat quod non habet",      translation: "No one can give what they do not have.",                         origin: "Property Law / Roman Law"         },
  { latin: "Ubi jus ibi remedium",         translation: "Where there is a right, there is a remedy.",                    origin: "Common Law"                       },
  { latin: "Ex injuria jus non oritur",    translation: "Rights cannot arise from wrongful acts.",                        origin: "International Law"                },
  { latin: "Dura lex sed lex",             translation: "The law is harsh, but it is the law.",                           origin: "Roman Law"                        },
  { latin: "Salus populi suprema lex esto",translation: "The welfare of the people shall be the supreme law.",            origin: "Cicero / Roman Law"               },
  { latin: "Nullum crimen sine lege",      translation: "No crime without a law.",                                        origin: "Criminal Law / Enlightenment"     },
  { latin: "Habeas corpus",                translation: "You shall have the body — a protection against unlawful detention.", origin: "Common Law / Magna Carta"    },
  { latin: "Nulla poena sine lege",        translation: "No punishment without a law.",                                   origin: "Criminal Law"                     },
  { latin: "Equality before the law",      translation: "All persons and entities are subject to the same laws.",         origin: "Rule of Law Doctrine"             },
  { latin: "Summum jus summa injuria",     translation: "Extreme law is extreme injustice.",                              origin: "Cicero, De Officiis"              },
  { latin: "Iura novit curia",             translation: "The court knows the law.",                                       origin: "Civil Law Tradition"              },
];

/**
 * Build a unified pool by merging QUOTES and MAXIMS.
 * Maxims get a special `isMaxim: true` flag so the renderer
 * can display them differently (Latin + translation + origin).
 */
const ALL_QUOTES = [
  ...QUOTES.map(q => ({ ...q, isMaxim: false })),
  ...MAXIMS.map(m => ({ ...m, isMaxim: true  })),
];

const WELCOME_QUOTES = [
  `"Good morning, ${NAME}. The world is shaped by those who show up — and you're here."`,
  `"Every great political theorist started exactly where you are now, ${NAME}."`,
  `"Today's study session is tomorrow's policy, ${NAME}. Let's begin."`,
  `"History remembers those who prepared, ${NAME}. Your moment is being forged right now."`,
  `"The pen is mightier than the sword — and yours is about to do great work, ${NAME}."`,
];

/* ══════════════════════════════════════════════════════════
   STORAGE HELPERS
   ══════════════════════════════════════════════════════════ */

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function lsGet(key, fallback = null) {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? JSON.parse(val) : fallback;
  } catch { return fallback; }
}

function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

/* ── Load persisted state ─────────────────────────────────── */
function loadState() {
  const today    = todayStr();
  const lastDate = lsGet(KEYS.lastStudyDate, null);

  // Sessions today — reset if it's a new calendar day
  sessionsToday = (lastDate === today) ? lsGet(KEYS.sessionsToday, 0) : 0;

  // Total minutes — cumulative all-time, never resets
  minutesTotal = lsGet(KEYS.minutesTotal, 0);

  // Tasks — restored as-is (user clears manually)
  tasks = lsGet(KEYS.tasks, []);
}

function saveState() {
  lsSet(KEYS.sessionsToday, sessionsToday);
  lsSet(KEYS.minutesTotal,  minutesTotal);
  lsSet(KEYS.lastStudyDate, todayStr());
}

function saveTasks() {
  lsSet(KEYS.tasks, tasks);
}

/* ══════════════════════════════════════════════════════════
   STATE
   ══════════════════════════════════════════════════════════ */

let currentMode      = 'work';
let timeLeft         = MODES.work.duration;
let totalTime        = MODES.work.duration;
let isRunning        = false;
let intervalId       = null;
let usedQuoteIndices = [];
let sessionsCycle    = 0;

// Persisted
let sessionsToday = 0;
let minutesTotal  = 0;
let tasks         = [];

/* ── Derived stat: tasks done today (computed from tasks array) */
function tasksDoneCount() {
  return tasks.filter(t => t.done).length;
}

/* ── DOM References ───────────────────────────────────────── */
const $ = id => document.getElementById(id);
const els = {
  timerCard:      $('timerCard'),
  timerDisplay:   $('timerDisplay'),
  modeLabel:      $('modeLabel'),
  cardSealTop:    $('cardSealTop'),
  ringSvg:        $('ringSvg'),
  ringProg:       $('ringProg'),
  sessionDots:    $('sessionDots'),
  startBtn:       $('startBtn'),
  quoteText:      $('quoteText'),
  quoteAuthor:    $('quoteAuthor'),
  notification:   $('notification'),
  statSessions:   $('statSessions'),
  statMinutes:    $('statMinutes'),
  statTasksDone:  $('statTasksDone'),
  taskInput:      $('taskInput'),
  taskList:       $('taskList'),
  welcomeOverlay: $('welcomeOverlay'),
  welcomeQuote:   $('welcomeQuote'),
};

/* ══════════════════════════════════════════════════════════
   WELCOME SCREEN
   ══════════════════════════════════════════════════════════ */

function initWelcome() {
  const q = WELCOME_QUOTES[Math.floor(Math.random() * WELCOME_QUOTES.length)];
  els.welcomeQuote.textContent = q;
}

function dismissWelcome() {
  els.welcomeOverlay.classList.add('hidden');
  setTimeout(() => { if (els.welcomeOverlay) els.welcomeOverlay.style.display = 'none'; }, 450);
}

/* ══════════════════════════════════════════════════════════
   TIMER
   ══════════════════════════════════════════════════════════ */

function setMode(mode) {
  if (isRunning) return;
  currentMode = mode;
  timeLeft    = MODES[mode].duration;
  totalTime   = MODES[mode].duration;
  const isBreak = MODES[mode].isBreak;
  document.querySelectorAll('.mode-tab').forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
  // no color change on break — stays pink
  els.modeLabel.textContent   = MODES[mode].label;
  els.cardSealTop.textContent = MODES[mode].seal;
  updateDisplay();
  updateRing();
  showNextQuote();
}

function toggleTimer() { isRunning ? pauseTimer() : startTimer(); }

function startTimer() {
  isRunning = true;
  els.startBtn.textContent = 'Pause';
  els.ringSvg.classList.add('ticking');
  // color stays pink regardless of mode
  intervalId = setInterval(tick, 1000);
}

function pauseTimer() {
  clearInterval(intervalId);
  isRunning = false;
  els.startBtn.textContent = 'Resume';
  els.ringSvg.classList.remove('ticking');
}

function resetTimer() {
  clearInterval(intervalId);
  isRunning = false;
  els.ringSvg.classList.remove('ticking');
  els.startBtn.textContent = 'Begin';
  timeLeft = totalTime = MODES[currentMode].duration;
  updateDisplay();
  updateRing();
}

function skipSession() {
  clearInterval(intervalId);
  isRunning = false;
  els.ringSvg.classList.remove('ticking');
  onSessionComplete();
}

function tick() {
  if (timeLeft <= 0) { clearInterval(intervalId); isRunning = false; onSessionComplete(); return; }
  timeLeft--;
  updateDisplay();
  updateRing();
}

/* ── Session completion ───────────────────────────────────── */
function onSessionComplete() {
  els.ringSvg.classList.remove('ticking');
  els.startBtn.textContent = 'Begin';
  playChime();

  if (!MODES[currentMode].isBreak) {
    sessionsToday++;
    sessionsCycle++;
    minutesTotal += 25;
    saveState();
    updateStats();
    renderDots();
    showNotification(`✦ Well done, ${NAME}! Session complete.`);
    const nextMode = (sessionsCycle % 4 === 0) ? 'long' : 'short';
    setTimeout(() => setMode(nextMode), 900);
  } else {
    showNotification(`⚜ Recess over, ${NAME} — time to focus!`);
    setTimeout(() => setMode('work'), 900);
  }
}

function updateDisplay() {
  els.timerDisplay.textContent =
    `${String(Math.floor(timeLeft/60)).padStart(2,'0')}:${String(timeLeft%60).padStart(2,'0')}`;
}

function updateRing() {
  els.ringProg.style.strokeDashoffset = CIRCUMFERENCE * (1 - timeLeft / totalTime);
}

function renderDots() {
  const filled = sessionsCycle % 4;
  els.sessionDots.innerHTML = Array.from({length:4},(_,i) =>
    `<div class="dot${i < filled ? ' filled' : ''}"></div>`
  ).join('');
}

function updateStats() {
  els.statSessions.textContent  = sessionsToday;
  els.statMinutes.textContent   = minutesTotal;
  els.statTasksDone.textContent = tasksDoneCount();
}

/* ══════════════════════════════════════════════════════════
   QUOTES
   ══════════════════════════════════════════════════════════ */

function showNextQuote() {
  if (usedQuoteIndices.length >= ALL_QUOTES.length) usedQuoteIndices = [];
  let idx;
  do { idx = Math.floor(Math.random() * ALL_QUOTES.length); } while (usedQuoteIndices.includes(idx));
  usedQuoteIndices.push(idx);

  const q = ALL_QUOTES[idx];

  els.quoteText.style.opacity = els.quoteAuthor.style.opacity = '0';

  setTimeout(() => {
    if (q.isMaxim) {
      // Legal maxim: Latin (italic) + translation + origin
      els.quoteText.innerHTML =
        `<em>${q.latin}</em>` +
        `<span class="maxim-translation"> — "${q.translation}"</span>`;
      els.quoteAuthor.textContent = `⚖ ${q.origin}`;
    } else {
      // Regular political quote
      els.quoteText.innerHTML = `"${q.text}"`;
      els.quoteAuthor.textContent = `— ${q.author}`;
    }
    els.quoteText.style.opacity = els.quoteAuthor.style.opacity = '1';
  }, 300);
}

/* ══════════════════════════════════════════════════════════
   NOTIFICATION
   ══════════════════════════════════════════════════════════ */

function showNotification(message) {
  els.notification.textContent = message;
  els.notification.classList.add('show');
  setTimeout(() => els.notification.classList.remove('show'), 3200);
}

/* ══════════════════════════════════════════════════════════
   CHIME
   ══════════════════════════════════════════════════════════ */

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.28;
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
      osc.start(t); osc.stop(t + 0.75);
    });
  } catch(e) { console.warn('Audio unavailable:', e.message); }
}

/* ══════════════════════════════════════════════════════════
   TASKS
   ══════════════════════════════════════════════════════════ */

function addTask() {
  const input = els.taskInput;
  const text  = input.value.trim();
  if (!text) return;
  tasks.push({ id: Date.now(), text, done: false });
  input.value = '';
  input.focus();
  saveTasks();
  renderTasks();
  updateStats(); // tasks done count may change
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.done = !task.done;
    saveTasks();
    renderTasks();
    updateStats(); // update tasks done count live
  }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
  updateStats();
}

function renderTasks() {
  if (tasks.length === 0) {
    els.taskList.innerHTML = `<li class="task-empty">Add your study tasks above, ${NAME}…</li>`;
    return;
  }
  els.taskList.innerHTML = tasks.map(task => `
    <li class="task-item">
      <div class="task-check${task.done?' done':''}" onclick="toggleTask(${task.id})" title="${task.done?'Mark incomplete':'Mark complete'}"></div>
      <span class="task-text${task.done?' done':''}">${escapeHtml(task.text)}</span>
      <button class="task-delete" onclick="deleteTask(${task.id})" title="Remove task">✕</button>
    </li>`).join('');
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

/* ══════════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS
   ══════════════════════════════════════════════════════════ */

document.addEventListener('keydown', e => {
  if (document.activeElement === els.taskInput) return;
  switch (e.code) {
    case 'Space':  e.preventDefault(); toggleTimer(); break;
    case 'KeyR':   if (!isRunning) resetTimer();      break;
    case 'KeyS':   skipSession();                     break;
    case 'Digit1': setMode('work');                   break;
    case 'Digit2': setMode('short');                  break;
    case 'Digit3': setMode('long');                   break;
  }
});

/* ══════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════ */

function init() {
  loadState();
  initWelcome();
  renderDots();
  showNextQuote();
  renderTasks();
  updateDisplay();
  updateRing();
  updateStats();
  console.log(
    `%c⚜ Diplomat's Pomodoro loaded for ${NAME}\n` +
    `   Today: ${sessionsToday} sessions | Total: ${minutesTotal} min | Tasks done: ${tasksDoneCount()}`,
    'color:#e991b0;font-family:serif;font-size:13px;'
  );
}

init();