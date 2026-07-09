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
