/* LIMULUS-eVTOL — ortak betik. Dil degistirme ve veri yukleme. */

/* Betik yuklendiyse solup gelme kurallari devreye girsin. Yuklenmediyse
   .js sinifi hic eklenmez ve butun icerik dogrudan gorunur kalir. */
document.documentElement.classList.add('js');

function applyLang(lang) {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-tr]').forEach(function (el) {
    var v = lang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-tr');
    if (v !== null) el.innerHTML = v;
  });
  document.querySelectorAll('[data-tr-ph]').forEach(function (el) {
    var v = lang === 'en' ? el.getAttribute('data-en-ph') : el.getAttribute('data-tr-ph');
    if (v !== null) el.placeholder = v;
  });
  document.querySelectorAll('.lang-btn').forEach(function (b) {
    b.textContent = lang === 'en' ? 'TR' : 'EN';
  });
  try { localStorage.setItem('limulus-lang', lang); } catch (e) {}
  window.LANG = lang;
  document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
}

function toggleLang() { applyLang(window.LANG === 'en' ? 'tr' : 'en'); }

function initLang() {
  var saved = 'tr';
  try { saved = localStorage.getItem('limulus-lang') || 'tr'; } catch (e) {}
  applyLang(saved);
}

/* Turkce ondalik ayraci. Sayfada gecen her sayi virgulle yazilir. */
function sayi(x, basamak) {
  if (x === null || x === undefined) return '—';
  var s = (basamak === undefined) ? String(x) : Number(x).toFixed(basamak);
  return s.replace('.', ',');
}
function binlik(x) {
  if (x === null || x === undefined) return '—';
  return String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function hepsiniGoster() {
  document.querySelectorAll('.fade-in').forEach(function (el) { el.classList.add('visible'); });
}

function fadeIn() {
  var els = document.querySelectorAll('.fade-in');
  if (!('IntersectionObserver' in window)) { hepsiniGoster(); return; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function (el) { io.observe(el); });
  // Emniyet agi. Gozlemci herhangi bir nedenle tetiklenmezse icerik gizli kalmaz.
  setTimeout(hepsiniGoster, 3000);
}

async function veri(ad) {
  var kok = document.body.getAttribute('data-kok') || '';
  var r = await fetch(kok + 'data/' + ad);
  if (!r.ok) throw new Error(ad + ' okunamadi');
  return r.json();
}

document.addEventListener('DOMContentLoaded', function () { initLang(); fadeIn(); });
