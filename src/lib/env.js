// Platform checks. No permissions, no network.
export const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
export const isStandalone = () => window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const base = import.meta.env.BASE_URL;
