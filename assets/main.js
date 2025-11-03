
// Simple router for profile CTA
function selectProfile(type){
  if(type === 'particulier'){ window.location.href = 'particuliers.html'; }
  if(type === 'professionnel'){ window.location.href = 'professionnels.html'; }
  if(type === 'collectivite'){ window.location.href = 'collectivites.html'; }
}

// Form handler (placeholder)
function handleContact(e){
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());
  alert('Merci ! Votre message est prêt à être envoyé. (Formulaire en mode démonstration)');
}
