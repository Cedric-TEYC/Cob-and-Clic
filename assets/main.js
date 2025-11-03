/* ====== MENU HAMBURGER ====== */
(function(){
  const btn = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if(!btn || !nav) return;

  function closeOnOutside(e){
    if(!nav.contains(e.target) && !btn.contains(e.target)){
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded','false');
      document.removeEventListener('click', closeOnOutside);
    }
  }

  btn.addEventListener('click', ()=>{
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if(open){ setTimeout(()=>document.addEventListener('click', closeOnOutside), 0); }
  });
})();

/* ====== PLANNER (si présent) ====== */
(function(){
  const timeSel = document.getElementById('planner_time');
  if (timeSel){
    const times = [];
    for (let h=8; h<=20; h++){ times.push(`${String(h).padStart(2,'0')}:00`, `${String(h).padStart(2,'0')}:30`); }
    timeSel.innerHTML = times.map(t=>`<option value="${t}">${t}</option>`).join('');
  }
  const root = document.getElementById('planner');
  if(!root) return;
  const profileSel = root.querySelector('[name="planner_profile"]');
  const dateInp = document.getElementById('planner_date');
  const urgentChk = root.querySelector('[name="planner_urgent"]');
  const rateEl = document.getElementById('planner_rate');
  const noteEl = document.getElementById('planner_note');
  const hiddenIso = root.querySelector('[name="planner_datetime"]');

  function compute(){
    const profile = profileSel.value;
    const timeStr = document.getElementById('planner_time').value;
    const dateStr = dateInp.value;
    if(!dateStr || !timeStr){ rateEl.textContent='—'; noteEl.textContent='Sélectionnez date et heure.'; return; }

    let base = (profile==='particulier')?70:90; let label=(profile==='particulier')?'TTC':'HT';
    const [hh] = timeStr.split(':').map(Number);
    const date = new Date(`${dateStr}T${timeStr}:00`); hiddenIso.value = date.toISOString();

    let maj=0; if(hh>=20 && hh<23) maj=0.25; else if(hh>=23 || hh<6) maj=0.50; else if(hh>=6 && hh<8) maj=0.25;
    const urg = urgentChk.checked?0.25:0;
    const price = base*(1+maj+urg);
    rateEl.textContent = `${price.toFixed(2)} € / h ${label}`;
    const notes=[]; if(maj===0.25 && hh>=20 && hh<23) notes.push('+25% soir 20–23');
    if(maj===0.50 || (hh>=23 || hh<6)) notes.push('+50% nuit 23–06');
    if(maj===0.25 && hh>=6 && hh<8) notes.push('+25% matin 06–08');
    if(urg) notes.push('+25% urgence'); if(!notes.length) notes.push('Créneau standard'); noteEl.textContent=notes.join(' · ');
  }
  ['change','input'].forEach(ev=>root.addEventListener(ev,e=>{
    if(e.target.matches('#planner_time,[name="planner_profile"],#planner_date,[name="planner_urgent"]')) compute();
  }));
  const today = new Date().toISOString().split('T')[0]; if(dateInp) dateInp.value=today; compute();
})();

/* ====== FORMULAIRE (démo) ====== */
function handleContact(e){ e.preventDefault(); alert('Merci ! Nous vous recontactons sous 24 h pour confirmer votre créneau.'); }
