// Kopieer-remming op beschermde lespagina's (body.beschermd).
// Bewust een rem, geen absolute blokkade: de echte bescherming is server-side
// (paywall + watermerk); dit ontmoedigt casual kopiëren.
(function () {
  if (!document.body.classList.contains('beschermd')) return;
  var wrap = document.querySelector('.les-wrap');
  if (!wrap) return;
  ['copy', 'cut', 'dragstart'].forEach(function (ev) {
    wrap.addEventListener(ev, function (e) { e.preventDefault(); });
  });
  wrap.addEventListener('contextmenu', function (e) { e.preventDefault(); });
})();

// Op een telefoon is de volledige cursusroute te lang vóór de lesinhoud.
// Houd de navigatie daarom dicht bij laden; op groter scherm blijft hij open.
(function () {
  var box = document.querySelector('.toc .cn-box');
  if (!box || !window.matchMedia) return;
  var compact = window.matchMedia('(max-width: 820px)');
  function syncCourseNav() {
    if (compact.matches) box.removeAttribute('open');
    else box.setAttribute('open', '');
  }
  syncCourseNav();
  if (compact.addEventListener) compact.addEventListener('change', syncCourseNav);
  else if (compact.addListener) compact.addListener(syncCourseNav);
})();

// Scrollspy: markeer in de cursusnavigatie het onderdeel dat nu in beeld is.
(function () {
  var links = document.querySelectorAll('.coursenav .cn-parts a[data-spy]');
  if (!links.length || !('IntersectionObserver' in window)) return;
  var map = {};
  links.forEach(function (a) { map[a.getAttribute('data-spy')] = a; });
  var arts = document.querySelectorAll('.les-wrap article[id]');
  if (!arts.length) return;
  var zichtbaar = {};
  var cur = null;
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { zichtbaar[e.target.id] = e.isIntersecting; });
    var eerste = null;
    for (var i = 0; i < arts.length; i++) { if (zichtbaar[arts[i].id]) { eerste = arts[i].id; break; } }
    if (eerste && map[eerste] && cur !== eerste) {
      if (cur && map[cur]) map[cur].classList.remove('spy-now');
      map[eerste].classList.add('spy-now');
      map[eerste].setAttribute('aria-current', 'true');
      if (cur && map[cur]) map[cur].removeAttribute('aria-current');
      cur = eerste;
    }
  }, { rootMargin: '-15% 0px -75% 0px', threshold: 0 });
  arts.forEach(function (el) { obs.observe(el); });
})();
