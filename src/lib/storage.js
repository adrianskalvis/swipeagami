// Progress lives in localStorage. Every access is wrapped: the app works without storage.
const KEY = 'swipegami.v1';
const defaults = () => ({
  launched: false,
  completed: {},
  unlockedAll: false,
  lastStep: {},
  paper: null,
  installHintDone: false,
  swipeHintDone: false,
  lessonsSeen: {},
});
let cache = null;

export function load() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...defaults(), ...JSON.parse(raw) } : defaults();
  } catch {
    cache = defaults();
  }
  return cache;
}

export function save(patch) {
  const s = load();
  Object.assign(s, patch);
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage unavailable: keep in memory */ }
  return s;
}

export function reset() {
  const paper = load().paper;
  cache = { ...defaults(), launched: true, paper, installHintDone: load().installHintDone };
  try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch { /* ignore */ }
  return cache;
}

export function setLastStep(modelId, index) {
  const s = load();
  s.lastStep = { ...s.lastStep, [modelId]: index };
  save({ lastStep: s.lastStep });
}
export function markCompleted(modelId) {
  const s = load();
  if (s.completed[modelId]) return;
  save({ completed: { ...s.completed, [modelId]: Date.now() } });
}
export function markLessonSeen(level) {
  const s = load();
  save({ lessonsSeen: { ...s.lessonsSeen, [level]: true } });
}
