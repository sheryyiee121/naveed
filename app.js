/* Blaster TV UK shared interactive helpers: FAQ accordion, savings calculator,
   channel finder, speed check, setup quiz, mobile menu, Lenis smooth scroll. */
(function () {
  'use strict';

  /* Lenis smooth scroll */
  if (typeof Lenis === 'function') {
    window.lenis = new Lenis({
      autoRaf: true,
      autoToggle: true,
      anchors: true,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
      duration: 1.15
    });
  }

  /* Mobile menu */
  (function () {
    var t = document.querySelector('.nav-toggle');
    if (!t) return;
    function close() {
      document.body.classList.remove('nav-open');
      t.setAttribute('aria-expanded', 'false');
      if (window.lenis) window.lenis.start();
    }
    t.addEventListener('click', function (e) {
      e.stopPropagation();
      var o = document.body.classList.toggle('nav-open');
      t.setAttribute('aria-expanded', String(o));
      if (window.lenis) {
        if (o) window.lenis.stop();
        else window.lenis.start();
      }
    });
    document.querySelectorAll('.navlinks a').forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    document.addEventListener('click', function (e) { if (!e.target.closest('header.site')) close(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) close(); });
  })();

  /* Movie carousels — keep moving even while the cursor sits on a card */
  var movieRails = [];
  document.querySelectorAll('.movie-rail').forEach(function (rail, index) {
    var track = rail.querySelector('.movie-track');
    if (!track) return;
    if (!track.dataset.looped) {
      track.dataset.looped = '1';
      track.innerHTML += track.innerHTML;
    }
    movieRails.push({
      track: track,
      x: 0,
      dir: index % 2 === 0 ? 1 : -1
    });
  });
  document.querySelectorAll('.rail-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var rail = document.getElementById('rail-' + btn.getAttribute('data-rail'));
      if (!rail) return;
      movieRails.forEach(function (item) {
        if (item.track.parentElement === rail) item.dir = Number(btn.getAttribute('data-dir')) || 1;
      });
    });
  });
  (function tick() {
    movieRails.forEach(function (item) {
      var w = item.track.scrollWidth / 2;
      if (w < 8) return;
      item.x += 0.75 * item.dir;
      if (item.x >= w) item.x -= w;
      if (item.x < 0) item.x += w;
      item.track.style.transform = 'translate3d(' + (-item.x) + 'px,0,0)';
    });
    requestAnimationFrame(tick);
  })();

  /* FAQ accordion */
  function bindFaq() {
    document.querySelectorAll('.faq-q').forEach(function (button) {
      if (button.dataset.bound) return;
      button.dataset.bound = '1';
      button.addEventListener('click', function () {
        var item = button.closest('.faq-item');
        var open = !item.classList.contains('open');
        item.parentElement.querySelectorAll('.faq-item').forEach(function (other) {
          other.classList.remove('open');
          other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
        });
        if (open) {
          item.classList.add('open');
          button.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }
  bindFaq();

  /* Savings calculator (home page) */
  var spend = document.getElementById('spend');
  if (spend) {
    function updateSavings() {
      var monthly = Number(spend.value);
      var annual = Math.max(0, Math.round(monthly * 12 - 69.99));
      document.getElementById('spendValue').textContent = monthly;
      document.getElementById('savingValue').textContent = annual.toLocaleString('en-GB');
      document.getElementById('monthlySaving').textContent = Math.max(0, Math.round(monthly - (69.99 / 12)));
    }
    spend.addEventListener('input', updateSavings);
    updateSavings();
  }

  /* Channel finder (home / channels pages) */
  var search = document.getElementById('channelSearch');
  var empty = document.getElementById('channelEmpty');
  if (search) {
    var channels = [].slice.call(document.querySelectorAll('.channel'));
    function filterChannels() {
      var q = search.value.trim().toLowerCase(), count = 0;
      channels.forEach(function (channel) {
        var match = !q || channel.dataset.name.indexOf(q) !== -1;
        channel.classList.toggle('hidden', !match);
        if (match) count++;
      });
      if (empty) empty.classList.toggle('show', count === 0);
    }
    search.addEventListener('input', filterChannels);
    var searchBtn = document.getElementById('channelSearchButton');
    if (searchBtn) searchBtn.addEventListener('click', filterChannels);
  }

  /* Speed check (home page) */
  var speedInput = document.getElementById('speedInput');
  var speedResult = document.getElementById('speedResult');
  if (speedInput && speedResult) {
    function checkSpeed() {
      var s = Number(speedInput.value);
      speedResult.textContent = !s || s < 1 ? 'Enter the download speed shown by your broadband test first.'
        : s < 10 ? 'This may struggle with steady HD. Try a wired connection or speak to your broadband provider.'
        : s < 25 ? 'Good for HD on one screen. 4K may need more headroom.'
        : s < 50 ? 'Great — you have enough headroom for 4K on a stable connection.'
        : 'Plenty of room for 4K and a busy household, provided your Wi-Fi stays stable.';
    }
    document.getElementById('speedButton').addEventListener('click', checkSpeed);
    speedInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') checkSpeed(); });
  }

  /* Setup quiz (home page) */
  var quizQuestion = document.getElementById('quizQuestion');
  var quizOptions = document.getElementById('quizOptions');
  if (quizQuestion && quizOptions) {
    var questions = [
      { text: 'What will you watch on most?', options: ['Firestick', 'Smart TV', 'Phone or tablet', 'Laptop'] },
      { text: 'What matters most at home?', options: ['Live sport', 'Films & series', 'Kids TV', 'A bit of everything'] },
      { text: 'How many people usually watch?', options: ['Just me', 'Two of us', 'The whole family', 'It changes'] }
    ];
    var answers = [], step = 0;
    var progress = [].slice.call(document.querySelectorAll('.quiz-progress span'));
    function esc(v) {
      return String(v).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }
    function renderQuiz() {
      if (step >= questions.length) {
        quizQuestion.textContent = 'Your easiest route: guided setup';
        quizOptions.innerHTML = '<div class="tool-result" style="grid-column:1/-1;margin:0">Start with the 24-hour trial on <strong>'
          + esc(answers[0] || 'your device') + '</strong>. We’ll help tailor the setup for <strong>'
          + esc((answers[2] || 'your home').toLowerCase()) + '</strong>.</div>'
          + '<button class="quiz-option" id="quizRestart" type="button">Start again</button>';
        document.getElementById('quizRestart').addEventListener('click', function () { answers = []; step = 0; renderQuiz(); });
        progress.forEach(function (x) { x.classList.add('active'); });
        return;
      }
      quizQuestion.textContent = questions[step].text;
      quizOptions.innerHTML = '';
      questions[step].options.forEach(function (option) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'quiz-option';
        b.textContent = option;
        b.addEventListener('click', function () { answers.push(option); step++; renderQuiz(); });
        quizOptions.appendChild(b);
      });
      progress.forEach(function (x, i) { x.classList.toggle('active', i <= step); });
    }
    renderQuiz();
  }
})();
