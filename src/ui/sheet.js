// Bottom sheet with a scrim. Returns a close function.
export function openSheet(root, build, { onClose } = {}) {
  const scrim = document.createElement('div');
  scrim.className = 'scrim';
  const sheet = document.createElement('div');
  sheet.className = 'sheet';
  sheet.setAttribute('role', 'dialog');
  sheet.innerHTML = '<div class="handle"></div>';
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    scrim.classList.remove('in');
    sheet.classList.remove('in');
    setTimeout(() => { scrim.remove(); sheet.remove(); }, 300);
    if (onClose) onClose();
  };
  scrim.addEventListener('click', close);
  build(sheet, close);
  root.appendChild(scrim);
  root.appendChild(sheet);
  requestAnimationFrame(() => { scrim.classList.add('in'); sheet.classList.add('in'); });
  return close;
}

export function button(text, cls, onClick) {
  const b = document.createElement('button');
  b.textContent = text;
  if (cls) b.className = cls;
  b.addEventListener('click', onClick);
  return b;
}
