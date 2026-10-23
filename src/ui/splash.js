import { mark } from './icons.js';
import { reducedMotion } from '../lib/env.js';

// First launch: name, then one line, then on to the paper picker.
export function renderSplash(root, { onDone }) {
  root.innerHTML = '';
  const s = document.createElement('div');
  s.className = 'screen splash fade-in';
  s.innerHTML = `${mark(72)}<div class="name">Swipegami</div><div class="line">Let’s fold your first swan.</div>`;
  root.appendChild(s);
  const quick = reducedMotion();
  let done = false;
  const finish = () => { if (done) return; done = true; onDone(); };
  setTimeout(() => s.querySelector('.line').classList.add('in'), quick ? 50 : 700);
  setTimeout(finish, quick ? 1200 : 2400);
  s.addEventListener('click', finish);
}
