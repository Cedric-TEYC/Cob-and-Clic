/* ====== MENU HAMBURGER ====== */
(function () {
  const btn = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (!btn || !nav) return;

  function closeOnOutside(e) {
    if (!nav.contains(e.target) && !btn.contains(e.target)) {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.removeEventListener('click', closeOnOutside);
    }
  }

  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) setTimeout(() => document.addEventListener('click', closeOnOutside), 0);
  });
})();

/* ====== PLANNER (créneaux 24h/24, pas 30 min) ====== */
(function () {
  const root = document.getElementById('planner');
  const timeSel = document.getElementById('planner_time');
  const dateInp = document.getElementById('planner_date');
  if (!root || !timeSel || !dateInp) return;

  const profileSel = root.querySelector('[name="planner_profile"]');
  const urgentChk  = root.querySelector('[name="planner_urgent"]');
  const rateEl     = document.getElementById('planner_rate');
  const noteEl     = document.getElementById('planner_note');
  const hiddenIso  = root.querySelector('[name="planner_datetime"]');

  // Génère toutes les demi-heures 00:00 → 23:30
  function buildTimes() {
    const opts = [];
    for (let h = 0; h < 24; h++) {
      const H = String(h).padStart(2, '0');
      opts.push(`${H}:00`, `${H}:30`);
    }
    timeSel.innerHTML = opts.map(t => `<option value="${t}">${t}</option>`).join('');
  }

  // Sélectionne la prochaine demi-heure à partir de l’heure actuelle
  function selectNextHalfHour() {
    const now = new Date();
    const minutes = now.getMinutes();
    const nextMinutes = minutes < 30 ? '30' : '00';
    const nextHour = minutes < 30 ? now.getHours() : (now.getHours() + 1) % 24;
    const val = `${String(nextHour).padStart(2, '0')}:${nextMinutes}`;
    if ([...timeSel.options].some(o => o.value === val)) timeSel.value = val;
  }

  function compute() {
    const profile = profileSel.value;
    const timeStr = timeSel.value;
    const dateStr = dateInp.value;

    if (!dateStr || !timeStr) {
      rateEl.textContent = '—';
      noteEl.textContent = 'Sélectionnez date et heure.';
      return;
    }

    let base = (profile === 'particulier') ? 70 : 90;
    let label = (profile === 'particulier') ? 'TTC' : 'HT';

    const [hh, mm] = timeStr.split(':').map(Number);
    const date = new Date(`${dateStr}T${timeStr}:00`);
    hiddenIso.value = date.toISOString();

    // Majoration : 20–23 => +25%, 23–06 => +50%, 06–08 => +25%, sinon 0
    let maj = 0;
    if (hh >= 20 && hh < 23) maj = 0.25;
    else if (hh >= 23 || hh < 6) maj = 0.50;
    else if (hh >= 6 && hh < 8) maj = 0.25;

    const urg = urgentChk.checked ? 0.25 : 0;
    const price = base * (1 + maj + urg);
    rateEl.textContent = `${price.toFixed(2)} € / h ${label}`;

    const notes = [];
    if (maj === 0.25 && hh >= 20 && hh < 23) notes.push('+25% soir 20–23');
    if (maj === 0.50 || (hh >= 23 || hh < 6)) notes.push('+50% nuit 23–06');
    if (maj === 0.25 && hh >= 6 && hh < 8) notes.push('+25% matin 06–08');
    if (urg) notes.push('+25% urgence');
    if (!notes.length) notes.push('Créneau standard');
    noteEl.textContent = notes.join(' · ');
  }

  // Init
  buildTimes();
  // Date par défaut = aujourd’hui
  dateInp.value = new Date().toISOString().split('T')[0];
  // Heure par défaut = prochaine demi-heure
  selectNextHalfHour();
  compute();

  // Listeners
  root.addEventListener('change', (e) => {
    if (e.target.matches('#planner_time,[name="planner_profile"],#planner_date,[name="planner_urgent"]')) compute();
  });
  root.addEventListener('input', (e) => {
    if (e.target.matches('#planner_time,[name="planner_profile"],#planner_date,[name="planner_urgent"]')) compute();
  });
})();

/* ====== FORMULAIRE (démo) ====== */
function handleContact(e) {
  e.preventDefault();
  alert('Merci ! Nous vous recontactons sous 24 h pour confirmer votre demande.');
}
