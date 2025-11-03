/* Planner: créneaux à la demi-heure + majorations + affichage tarif */
(function(){
  const timeSel = document.getElementById('planner_time');
  if (timeSel){
    // Remplir 00 et 30 seulement
    const times = [];
    for (let h=8; h<=20; h++){ // base planning 08:00 -> 20:00 (modulable)
      times.push(`${String(h).padStart(2,'0')}:00`, `${String(h).padStart(2,'0')}:30`);
    }
    timeSel.innerHTML = times.map(t=>`<option value="${t}">${t}</option>`).join('');
  }

  const root = document.getElementById('planner');
  if(!root) return;

  const profileSel = root.querySelector('[name="planner_profile"]');
  const dateInp    = document.getElementById('planner_date');
  const urgentChk  = root.querySelector('[name="planner_urgent"]');
  const rateEl     = document.getElementById('planner_rate');
  const noteEl     = document.getElementById('planner_note');
  const hiddenIso  = root.querySelector('[name="planner_datetime"]');

  function compute(){
    const profile = profileSel.value;
    const dateStr = dateInp.value;
    const timeStr = timeSel.value;

    if(!dateStr || !timeStr){
      rateEl.textContent = '—';
      noteEl.textContent = 'Sélectionnez date et heure.';
      return;
    }

    // Base tarifs
    let base = (profile === 'particulier') ? 70 : 90; // €/h
    let baseLabel = (profile === 'particulier') ? 'TTC' : 'HT';

    // Créneau choisi
    const [hh, mm] = timeStr.split(':').map(Number);
    const date = new Date(dateStr + 'T' + timeStr + ':00');
    hiddenIso.value = date.toISOString();

    // Majoration horaire
    let majoration = 0;
    if (hh >= 20 && hh < 23) majoration = 0.25;      // 20:00–23:00
    else if (hh >= 23 || hh < 6) majoration = 0.50;  // 23:00–06:00
    else if (hh >= 6 && hh < 8) majoration = 0.25;   // 06:00–08:00

    // Majoration urgence (si non regroupable)
    const urgence = urgentChk.checked ? 0.25 : 0;

    const price = base * (1 + majoration + urgence);

    rateEl.textContent = `${price.toFixed(2)} € / h ${baseLabel}`;
    let notes = [];
    if (majoration === 0.25 && hh >= 20 && hh < 23) notes.push('+25% soir (20h–23h)');
    if (majoration === 0.50 || (hh >= 23 || hh < 6)) notes.push('+50% nuit (23h–06h)');
    if (majoration === 0.25 && hh >= 6 && hh < 8) notes.push('+25% matin (06h–08h)');
    if (urgence) notes.push('+25% urgence (non regroupable)');
    if (!notes.length) notes.push('Créneau standard');
    noteEl.textContent = notes.join(' · ');
  }

  ['change','input'].forEach(ev=>{
    root.addEventListener(ev, (e)=>{
      if (e.target.matches('#planner_time,[name="planner_profile"],#planner_date,[name="planner_urgent"]')) compute();
    });
  });

  // Init date du jour
  const today = new Date().toISOString().split('T')[0];
  if (dateInp) dateInp.value = today;
  compute();
})();

/* Form contact (simulation) */
function handleContact(e){
  e.preventDefault();
  alert('Merci ! Nous vous recontactons sous 24 h pour confirmer votre créneau.');
}
