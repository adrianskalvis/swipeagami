// Inline SVG marks. Original drawings: a folded-corner square in ink and seal red.
export const mark = (size = 72) => `<svg width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
<path d="M10 10h44v44H10z" fill="#f5f1e8" stroke="#1b1b1b" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M54 10v28L26 10z" fill="#c0392b" stroke="#1b1b1b" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M26 10l28 28" stroke="#1b1b1b" stroke-width="2.4" stroke-dasharray="4 3" stroke-linecap="round"/>
</svg>`;

export const settingsIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true">
<path d="M4 7h16M4 12h16M4 17h16"/><circle cx="9" cy="7" r="1.8" fill="#f5f1e8"/><circle cx="15" cy="12" r="1.8" fill="#f5f1e8"/><circle cx="8" cy="17" r="1.8" fill="#f5f1e8"/></svg>`;

export const lockIcon = `<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.1" aria-hidden="true"><rect x="2" y="5.5" width="8" height="5.5" rx="1"/><path d="M4 5.5V4a2 2 0 0 1 4 0v1.5"/></svg>`;

export const stamp = (cls = '') => `<svg class="${cls}" viewBox="0 0 40 40" aria-label="Folded">
<rect x="3" y="3" width="34" height="34" rx="4" fill="#c0392b" opacity="0.92"/>
<path d="M11 24l6-6 5 5 7-9" fill="none" stroke="#f5f1e8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export const shareIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8"/></svg>`;

export const closeIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`;

export const backIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>`;

export const hand = `<svg class="swipehint" viewBox="0 0 120 60" aria-hidden="true">
<path d="M22 30h76" stroke="#1b1b1b" stroke-width="1" stroke-dasharray="2 4" opacity="0.5"/>
<g class="hand"><path d="M58 44c-7 0-12-5-12-12V18a3 3 0 0 1 6 0v9h2V11a3 3 0 0 1 6 0v16h2V14a3 3 0 0 1 6 0v13h2v-8a3 3 0 0 1 6 0v12c0 7-5 13-12 13z" fill="#f5f1e8" stroke="#1b1b1b" stroke-width="1.6" stroke-linejoin="round"/></g>
</svg>`;
