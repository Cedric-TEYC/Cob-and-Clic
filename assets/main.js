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

// ============ TARIFICATION DYNAMIQUE ============
// Règles de base (€/h)
const BASE_RATE = {
  particulier: 70,          // TTC
  professionnel: 90,        // HT
  collectivite: 90          // HT
};

// Majoration selon créneau horaire
// 20:00–23:00  => +25%
// 23:00–06:00  => +50%
// 06:00–08:00  => +25%
// 08:00–20:00   => 0%
function timeMultiplier(dateObj) {
  if (!dateObj || isNaN(dateObj.getTime())) return 0;
  const h = dateObj.getHours();
  if (h >= 20 && h < 23) return 0.50;        // 20–23h
  if (h >= 23 || h < 6)  return 0.50;        // 23–6h
  if (h >= 6  && h < 8)  return 0.25;        // 6–8h
  return 0;
}

// Majoration urgence (si non planifiable / pas de regroupement possible)
function urgencyMultiplier(isUrgent){
  return isUrgent ? 0.25 : 0.0;
}

// Calcule le tarif final à l’heure selon profil, date/heure, urgence
function computeHourly(profile, isoDateStr, urgent){
  const base = BASE_RATE[profile] ?? 70;
  let dt = null;
  try { dt = isoDateStr ? new Date(isoDateStr) : null; } catch(e){ dt = null; }
  const mTime = timeMultiplier(dt);
  const mUrg  = urgencyMultiplier(urgent);
  const totalMult = 1 + mTime + mUrg; // on additionne les majorations
  return Math.round(base * totalMult);
}

// Branche le planificateur si présent sur la page
function initPricingPlanner(){
  const root = document.querySelector('#planner');
  if(!root) return;

  const profileEl = root.querySelector('[name="planner_profile"]');
  const dateEl    = root.querySelector('[name="planner_datetime"]');
  const urgentEl  = root.querySelector('[name="planner_urgent"]');
  const outRate   = root.querySelector('#planner_rate');
  const outNote   = root.querySelector('#planner_note');

  function refresh(){
    const profile = profileEl.value;
    const iso = dateEl.value;
    const urgent = urgentEl.checked;
    const rate = computeHourly(profile, iso, urgent);

    // Affichage TTC/HT en fonction du profil
    let suffix = (profile === 'particulier') ? '€ / h TTC' : '€ / h HT';
    outRate.textContent = `${rate} ${suffix}`;

    const dt = iso ? new Date(iso) : null;
    let details = [];
    const mU = urgencyMultiplier(urgent);

    if (mU > 0) details.push('+25% urgence');
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

  ['change','input'].forEach(evt=>{
    profileEl.addEventListener(evt, refresh);
    dateEl.addEventListener(evt, refresh);
    urgentEl.addEventListener(evt, refresh);
  });

  // Valeur par défaut = prochain créneau plein
  const now = new Date();
  now.setMinutes(0,0,0);
  now.setHours(now.getHours()+1);
  dateEl.value = now.toISOString().slice(0,16);
  refresh();
}

// Auto-init
document.addEventListener('DOMContentLoaded', initPricingPlanner);
