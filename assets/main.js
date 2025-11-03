// --- Router boutons profil (page d'accueil) ---
function selectProfile(type){
  if(type === 'particulier'){ window.location.href = 'particuliers.html'; }
  if(type === 'professionnel'){ window.location.href = 'professionnels.html'; }
  if(type === 'collectivite'){ window.location.href = 'collectivites.html'; }
}

// --- Formulaire contact (démo) ---
function handleContact(e){
  e.preventDefault();
  alert("Merci ! Votre message est prêt à être envoyé. (Formulaire en mode démonstration)");
}

// ================== UTILITAIRES TEMPS ==================
function roundToNextHalfHour(d){
  if(!d || isNaN(d.getTime())) return null;
  const dt = new Date(d.getTime());
  dt.setSeconds(0,0);
  const m = dt.getMinutes();
  if (m === 0 || m === 30) return dt;
  if (m < 30) { dt.setMinutes(30); }
  else { dt.setHours(dt.getHours() + 1); dt.setMinutes(0); }
  return dt;
}
function toLocalInputValue(dt){
  const pad = n => String(n).padStart(2,'0');
  return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}
function parseLocalInput(value){ return value ? new Date(value) : null; }

// ============ TARIFICATION DYNAMIQUE (règles VALIDÉES) ============
// Base (€/h)
const BASE_RATE = { particulier: 70, professionnel: 90, collectivite: 90 };

// Majoration selon créneau horaire
// 20:00–23:00 => +25% ; 23:00–06:00 => +50% ; 06:00–08:00 => +25% ; sinon 0%
function timeMultiplier(dateObj){
  if (!dateObj || isNaN(dateObj.getTime())) return 0;
  const h = dateObj.getHours();
  if (h >= 20 && h < 23) return 0.25; // 20–23h
  if (h >= 23 || h < 6)  return 0.50; // 23–06h
  if (h >= 6  && h < 8)  return 0.25; // 06–08h
  return 0;
}

// Majoration urgence (si non planifiable / pas de regroupement possible)
function urgencyMultiplier(isUrgent){ return isUrgent ? 0.25 : 0.0; }

// Calcule le tarif final à l’heure selon profil, date/heure, urgence
function computeHourly(profile, dateObj, urgent){
  const base = BASE_RATE[profile] ?? 70;
  const totalMult = 1 + timeMultiplier(dateObj) + urgencyMultiplier(urgent);
  return Math.round(base * totalMult);
}

// ================== PLANIFICATEUR (UNIQUEMENT SUR LA PAGE CONTACT) ==================
function initPricingPlanner(){
  const root = document.querySelector('#planner');
  if(!root) return; // rien à faire si nous ne sommes pas sur la page Contact & réservations

  const profileEl = root.querySelector('[name="planner_profile"]');
  const dateEl    = root.querySelector('#planner_date');   // <input type="date">
  const timeEl    = root.querySelector('#planner_time');   // <select> demi-heures
  const hiddenISO = root.querySelector('[name="planner_datetime"]'); // input hidden ISO (YYYY-MM-DDTHH:mm)

  const urgentEl  = root.querySelector('[name="planner_urgent"]');
  const outRate   = root.querySelector('#planner_rate');
  const outNote   = root.querySelector('#planner_note');

  // Remplit la liste d'heures aux demi-heures (00:00 → 23:30)
  function fillTimeOptions(){
    if (!timeEl || timeEl.options.length) return;
    for(let h=0; h<24; h++){
      for(let m of [0,30]){
        const hh = String(h).padStart(2,'0');
        const mm = String(m).padStart(2,'0');
        const opt = document.createElement('option');
        opt.value = `${hh}:${mm}`;
        opt.textContent = `${hh}:${mm}`;
        timeEl.appendChild(opt);
      }
    }
  }

  // Construit un Date local à partir des deux champs
  function getSelectedDate(){
    if (!dateEl.value || !timeEl.value) return null;
    const iso = `${dateEl.value}T${timeEl.value}`;
    return parseLocalInput(iso);
  }

  // Met à jour l'input hidden ISO (utilisé pour calcul)
  function syncHidden(){
    const dt = getSelectedDate();
    hiddenISO.value = dt ? toLocalInputValue(dt) : '';
  }

  function refresh(){
    syncHidden();
    const dt = getSelectedDate();
    const profile = profileEl.value;
    const urgent  = urgentEl.checked;

    const rate = computeHourly(profile, dt, urgent);
    outRate.textContent = `${rate} ${profile === 'particulier' ? '€ / h TTC' : '€ / h HT'}`;

    let details = [];
    if (urgent) details.push('+25% urgence');
    if (dt){
      const h = dt.getHours();
      if (h >= 20 && h < 23) details.push('+25% (20h–23h)');
      else if (h >= 23 || h < 6) details.push('+50% (23h–06h)');
      else if (h >= 6 && h < 8) details.push('+25% (06h–08h)');
      else details.push('créneau standard');
    } else {
      details.push('créneau standard');
    }
    outNote.textContent = `Détail : ${details.join(' · ')}. Si planification groupée possible, la majoration “urgence” ne s’applique pas.`;
  }

  // Valeurs par défaut = prochain cran demi-heure
  function setDefaults(){
    const start = roundToNextHalfHour(new Date());
    const pad = n => String(n).padStart(2,'0');
    dateEl.value = `${start.getFullYear()}-${pad(start.getMonth()+1)}-${pad(start.getDate())}`;
    timeEl.value = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
    syncHidden();
  }

  // Listeners
  ['change','input','blur'].forEach(evt=>{
    profileEl.addEventListener(evt, refresh);
    dateEl.addEventListener(evt, refresh);
    timeEl.addEventListener(evt, refresh);
    urgentEl.addEventListener(evt, refresh);
  });

  fillTimeOptions();
  setDefaults();
  refresh();
}

document.addEventListener('DOMContentLoaded', initPricingPlanner);
