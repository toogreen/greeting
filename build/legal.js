// Shared by the privacy policy and terms pages: open in the language the card maker was using.
let language = (navigator.language || '').toLowerCase().startsWith('fr') ? 'fr' : 'en';
const requestedLanguage = new URLSearchParams(location.search).get('lang');
if (requestedLanguage === 'en' || requestedLanguage === 'fr') language = requestedLanguage;

function applyLanguage() {
  document.documentElement.lang = language;
  document.querySelectorAll('[data-lang]').forEach(element => { element.hidden = element.dataset.lang !== language; });
  document.querySelectorAll('[data-language]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.language === language));
  });
  // Keep the chosen language when moving between the legal pages.
  document.querySelectorAll('a[data-keep-lang]').forEach(link => {
    link.search = '?lang=' + language;
  });
  const heading = document.querySelector(`article[data-lang="${language}"] h1`);
  if (heading) document.title = `${heading.textContent} · Cardly`;
}

document.addEventListener('DOMContentLoaded', () => {
  applyLanguage();
  document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => {
    language = button.dataset.language;
    history.replaceState(null, '', '?lang=' + language + location.hash);
    applyLanguage();
  }));
});
