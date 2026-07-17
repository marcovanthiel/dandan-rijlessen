// Progressieve verrijking: examentimer, flashcards met NL-audio, kopieerknop,
// PWA-registratie. Alles werkt óók zonder dit script (formulieren + lijsten).
(function () {
  // --- taalkeuzelijsten (header en footer): kiezen = herladen in die taal
  document.querySelectorAll('select.taalwissel').forEach(function (sel) {
    sel.addEventListener('change', function () {
      window.location.href = '/?taal=' + encodeURIComponent(sel.value);
    });
  });

  // --- hamburger (mobiel): klapt de hoofdnavigatie open en dicht
  var burger = document.querySelector('.navburger');
  var sitenav = burger && document.getElementById(burger.getAttribute('aria-controls'));
  if (burger && sitenav) {
    burger.addEventListener('click', function () {
      var open = sitenav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    sitenav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        sitenav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sitenav.classList.contains('open')) {
        sitenav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        burger.focus();
      }
    });
  }

  // --- examentimer: telt af naar data-deadline en levert dan het formulier in
  var timer = document.getElementById('timer');
  if (timer && timer.dataset.deadline) {
    var form = document.getElementById('vraagform');
    function tik() {
      var rest = Math.max(0, Math.floor((new Date(timer.dataset.deadline) - Date.now()) / 1000));
      var m = Math.floor(rest / 60), s = rest % 60;
      timer.textContent = '⏱ ' + m + ':' + (s < 10 ? '0' : '') + s;
      if (rest <= 120) timer.classList.add('bijna');
      if (rest <= 0) { if (form) form.submit(); return; }
      setTimeout(tik, 1000);
    }
    tik();
  }

  // --- flashcards: klik = omdraaien; audioknop spreekt de NL-term uit
  var kanSpreken = 'speechSynthesis' in window;
  document.querySelectorAll('.flashcard').forEach(function (fc) {
    fc.addEventListener('click', function (e) {
      var opAudio = e.target.classList && e.target.classList.contains('fc-audio');
      if (opAudio && kanSpreken) {
        var u = new SpeechSynthesisUtterance(fc.dataset.nl);
        u.lang = 'nl-NL'; u.rate = 0.85;
        speechSynthesis.cancel(); speechSynthesis.speak(u);
        e.stopPropagation(); return;
      }
      var open = fc.getAttribute('aria-expanded') === 'true';
      fc.setAttribute('aria-expanded', open ? 'false' : 'true');
      fc.classList.toggle('is-om', !open);
    });
    if (!kanSpreken) { var a = fc.querySelector('.fc-audio'); if (a) a.style.display = 'none'; }
  });

  // --- kopieerknop (referral-link)
  document.querySelectorAll('[data-kopieer]').forEach(function (k) {
    k.addEventListener('click', function () {
      if (navigator.clipboard) navigator.clipboard.writeText(k.dataset.kopieer).then(function () {
        k.classList.add('is-ok'); setTimeout(function () { k.classList.remove('is-ok'); }, 1500);
      });
    });
  });

  // --- deelbare resultaatkaart (Web Share API waar beschikbaar)
  var deel = document.querySelector('.deelbaar');
  if (deel && navigator.share) {
    deel.style.cursor = 'pointer';
    deel.addEventListener('click', function () {
      navigator.share({ title: 'Dandan Drive', text: deel.textContent.trim(), url: 'https://dandandrive.nl/' }).catch(function () {});
    });
  }

  // --- PWA: service worker (cachet alleen assets/schil, nooit lescontent)
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(function () {});
})();
