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
    b.setAttribute('aria-label', lang === 'en' ? 'Türkçeye geç' : 'Switch to English');
  });
  var menu = document.querySelector('.nav-toggle');
  if (menu) menu.setAttribute('aria-label', lang === 'en' ? 'Menu' : 'Menü');
  var navigation = document.querySelector('nav');
  if (navigation) navigation.setAttribute('aria-label', lang === 'en' ? 'Main navigation' : 'Ana gezinme');
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

/* Dar ekranda menu dugmesi. Baglantilar 900 px altinda gizlenir, dugme onlari acar ve kapatir. */
function menuDugmesi() {
  var nav = document.querySelector('nav');
  var ul = nav && nav.querySelector('.nav-links');
  if (!ul || nav.querySelector('.nav-toggle')) return;
  var b = document.createElement('button');
  b.type = 'button';
  b.className = 'nav-toggle';
  b.setAttribute('aria-label', 'Menü');
  b.setAttribute('aria-expanded', 'false');
  ul.id = ul.id || 'main-nav';
  b.setAttribute('aria-controls', ul.id);
  b.textContent = '☰';
  b.addEventListener('click', function () {
    var acik = ul.classList.toggle('acik');
    b.setAttribute('aria-expanded', acik ? 'true' : 'false');
  });
  function closeMenu() { ul.classList.remove('acik'); b.setAttribute('aria-expanded', 'false'); }
  ul.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && ul.classList.contains('acik')) { closeMenu(); b.focus(); }
  });
  document.addEventListener('click', function (e) { if (!nav.contains(e.target)) closeMenu(); });
  window.addEventListener('resize', function () { if (window.innerWidth > 1080) closeMenu(); });
  nav.insertBefore(b, nav.querySelector('.lang-btn'));
}

document.addEventListener('DOMContentLoaded', function () { menuDugmesi(); initLang(); fadeIn(); });

/* Current page/section in the shared menu; independent of research state. */
(function(){
 'use strict';
 function init(){
  var nav=document.querySelector('nav');if(!nav)return;
  var links=Array.from(nav.querySelectorAll('.nav-links a'));
  function path(url){return url.pathname.replace(/index\.html$/,'').replace(/\/$/,'')||'/';}
  var current=path(new URL(location.href));
  function mark(link,value){links.forEach(function(a){if(a===link)a.setAttribute('aria-current',value);else a.removeAttribute('aria-current');});}
  var page=current==='/ikiz'?'/ikiz':(/^\/(arsiv|kararlar|kampanyalar)$/.test(current)?'/arsiv':null);
  if(page){var selected=links.find(function(a){return path(new URL(a.href))===page;});if(selected)mark(selected,current===page?'page':'location');return;}
  var sections=links.map(function(a){var u=new URL(a.href);return {link:a,section:current===path(u)&&u.hash?document.getElementById(u.hash.slice(1)):null};}).filter(function(x){return x.section;});
  if(!sections.length)return;
  var queued=false;
  function update(){
   queued=false;
   var line=nav.querySelector('.nav-logo').getBoundingClientRect().bottom+70,selected=sections[0];
   sections.forEach(function(x){if(x.section.getBoundingClientRect().top<=line)selected=x;});
   if(window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-8)selected=sections[sections.length-1];
   mark(selected.link,'location');
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(update);}}
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);window.addEventListener('hashchange',schedule);document.addEventListener('langchange',schedule);
  update();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
}());
