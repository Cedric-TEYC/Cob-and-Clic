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

/* ====== PLANNER (créneaux 24/24, no past) ====== */
(function () {
  const root = document.getElementById('planner');
  if (!root) return;

  const profileSel = root.querySelector('[name="planner_profile"]');
  const dateInp    = document.getElementById('planner_date');
  const timeSel    = document.getElementById('planner_time');
  const urgentChk  = root.querySelector('[name="planner_urgent"]');
  const rateEl     = document.getElementById('planner_rate');
  const noteEl     = document.getElementById('planner_note');
  const hiddenIso  = root.querySelector('[name="planner_datetime"]');

  // Helpers temps locaux
  const pad = (n) => String(n).padStart(2, '0');
  const todayStr = () => new Date().toISOString().split('T')[0];

  function getNextHalfHour(now = new Date()) {
    const n = new Date(now);
    n.setSeconds(0, 0);
    const m = n.getMinutes();
    if (m < 30) n.setMinutes(30);
    else { n.setMinutes(0); n.setHours(n.getHours() + 1); }
    return n;
  }

  // Construit les options d'heures à partir d'une borne min incluse (Date)
  function buildTimesForDate(dateStrVal) {
    const now = new Date();
    const tStr = todayStr();
    let startH = 0, startM = 0;

    if (dateStrVal === tStr) {
      const next = getNextHalfHour(now);
      // Si la prochaine demi-heure passe au lendemain, on force le lendemain
      const nextDateStr = next.toISOString().split('T')[0];
      if (nextDateStr !== tStr) {
        const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
        dateInp.value = tomorrow.toISOString().split('T')[0];
        startH = 0; startM = 0; // et on proposera toute la journée
      } else {
        startH = next.getHours(); startM = next.getMinutes();
      }
    }

    const opts = [];
    for (let h = startH; h < 24; h++) {
      let minutes = (h === startH) ? (startM === 30 ? [30] : (startM === 0 ? [0, 30] : [0, 30])) : [0, 30];
      for (const m of minutes) {
        opts.push(`${pad(h)}:${pad(m)}`);
      }
    }
    timeSel.innerHTML = opts.map(t => `<option value="${t}">${t}</option>`).join('');
    if (opts.length) timeSel.value = opts[0];
  }

  function compute() {
    const dateStrVal = dateInp.value;
    const timeStrVal = timeSel.value;
    if (!dateStrVal || !timeStrVal) {
      rateEl.textContent = '—';
      noteEl.textContent = 'Sélectionnez date et heure.';
      return;
    }

    // Sécurité : si l’utilisateur a réussi à garder une heure passée, on recalcule la liste
    if (dateStrVal === todayStr()) {
      const [hSel, mSel] = timeStrVal.split(':').map(Number);
      const now = new Date();
      const selected = new Date(`${dateStrVal}T${timeStrVal}:00`);
      if (selected <= now) {
        buildTimesForDate(dateStrVal);
      }
    }

    let base = (profileSel.value === 'particulier') ? 70 : 90;
    const label = (profileSel.value === 'particulier') ? 'TTC' : 'HT';

    const [hh] = timeStrVal.split(':').map(Number);
    const chosen = new Date(`${dateStrVal}T${timeStrVal}:00`);
    hiddenIso.value = chosen.toISOString();

    // Majoration horaire
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

  // Init : date min = aujourd’hui, valeur par défaut = aujourd’hui
  const t0 = todayStr();
  dateInp.min = t0;
  dateInp.value = t0;
  buildTimesForDate(dateInp.value);
  compute();

  // Listeners
  dateInp.addEventListener('change', () => { buildTimesForDate(dateInp.value); compute(); });
  timeSel.addEventListener('change', compute);
  profileSel.addEventListener('change', compute);
  urgentChk.addEventListener('change', compute);
})();

/* ====== FORMULAIRE (démo) ====== */
function handleContact(e) {
  e.preventDefault();
  alert('Merci ! Nous vous recontactons sous 24 h pour confirmer votre demande.');
}
