/* =========================================================================
   Evolutekna Holding — comportamenti dell'interfaccia
   ========================================================================= */
(function () {
  'use strict';

  /* ----------------------------- menu mobile ---------------------------- */
  var toggle = document.querySelector('.navtoggle');
  var nav = document.getElementById('nav');

  if (toggle && nav) {
    var closeNav = function () {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Apri il menu');
    };
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) closeNav();
    });
  }

  /* ------------- lieve movimento degli elementi al cursore --------------- */
  var floats = document.querySelectorAll('[data-float]');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (floats.length && !reduced) {
    var last = 0;
    document.addEventListener('mousemove', function (e) {
      var now = Date.now();
      if (now - last < 16) return;
      last = now;
      var mx = (e.clientX / window.innerWidth) * 2 - 1;
      var my = (e.clientY / window.innerHeight) * 2 - 1;
      for (var i = 0; i < floats.length; i++) {
        var el = floats[i];
        var d = parseFloat(el.getAttribute('data-float')) || 10;
        el.style.setProperty('--fx', (mx * d).toFixed(2) + 'px');
        el.style.setProperty('--fy', (my * d * 0.6).toFixed(2) + 'px');
      }
    }, { passive: true });
  }

  /* ------------------------------ torna su ------------------------------ */
  var toTop = document.querySelector('.totop');
  if (toTop) {
    var sync = function () {
      toTop.classList.toggle('is-visible', window.scrollY > 600);
    };
    sync();
    window.addEventListener('scroll', sync, { passive: true });
  }

  /* ----------------------------- fisarmonica ---------------------------- */
  document.querySelectorAll('.acc__head').forEach(function (head) {
    head.addEventListener('click', function () {
      var item = head.parentElement;
      var open = item.classList.contains('is-open');
      document.querySelectorAll('.acc__item').forEach(function (i) {
        i.classList.remove('is-open');
        i.querySelector('.acc__head').setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        item.classList.add('is-open');
        head.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* =======================================================================
     CONSENSO AI COOKIE

     Allo stato attuale il sito non installa cookie di statistica né di
     marketing: carattere tipografico, immagini e script sono serviti dal
     dominio stesso. L'unico dato memorizzato è la scelta espressa qui, che
     resta nel browser dell'utente.

     Il meccanismo è comunque completo e pronto: uno script di statistica
     aggiunto in futuro va scritto così e parte solo dopo il consenso.

         <script type="text/plain" data-cookie="statistici"> ... <\/script>
     ======================================================================= */

  var CHIAVE = 'evolutekna_cookie_consent';
  var VERSIONE = 1;
  var DURATA_GIORNI = 365;

  var CATEGORIE = [
    {
      id: 'necessari',
      nome: 'Strumenti necessari',
      desc: 'Servono al funzionamento del sito e alla memoria della scelta espressa in questo pannello. Non possono essere disattivati e non profilano l’utente.',
      bloccato: true
    },
    {
      id: 'statistici',
      nome: 'Statistica',
      desc: 'Strumenti di misurazione delle visite in forma aggregata. Nessuno strumento di questa categoria è attualmente installato sul sito.',
      bloccato: false
    },
    {
      id: 'marketing',
      nome: 'Marketing e profilazione',
      desc: 'Strumenti usati per proporre contenuti pubblicitari personalizzati. Nessuno strumento di questa categoria è attualmente installato sul sito.',
      bloccato: false
    }
  ];

  function leggi() {
    try {
      var raw = window.localStorage.getItem(CHIAVE);
      if (!raw) return null;
      var dato = JSON.parse(raw);
      if (!dato || dato.v !== VERSIONE) return null;
      var scaduto = (Date.now() - new Date(dato.ts).getTime()) > DURATA_GIORNI * 86400000;
      return scaduto ? null : dato;
    } catch (e) {
      return null;
    }
  }

  function salva(scelte) {
    var dato = {
      v: VERSIONE,
      ts: new Date().toISOString(),
      statistici: !!scelte.statistici,
      marketing: !!scelte.marketing
    };
    try {
      window.localStorage.setItem(CHIAVE, JSON.stringify(dato));
    } catch (e) { /* spazio non disponibile: la scelta vale per la sessione */ }
    applica(dato);
    return dato;
  }

  // Attiva gli script messi in attesa per le categorie consentite.
  function applica(dato) {
    document.querySelectorAll('script[type="text/plain"][data-cookie]').forEach(function (vecchio) {
      var categoria = vecchio.getAttribute('data-cookie');
      if (!dato[categoria]) return;
      var nuovo = document.createElement('script');
      for (var i = 0; i < vecchio.attributes.length; i++) {
        var a = vecchio.attributes[i];
        if (a.name !== 'type' && a.name !== 'data-cookie') nuovo.setAttribute(a.name, a.value);
      }
      nuovo.text = vecchio.text;
      vecchio.parentNode.replaceChild(nuovo, vecchio);
    });

    document.dispatchEvent(new CustomEvent('evolutekna:consenso', { detail: dato }));
  }

  /* ------------------------------ interfaccia --------------------------- */
  var barra, finestra, interruttori = {};

  function creaBarra() {
    barra = document.createElement('aside');
    barra.className = 'cookiebar';
    barra.setAttribute('role', 'region');
    barra.setAttribute('aria-label', 'Informativa sui cookie');
    barra.innerHTML =
      '<div class="cookiebar__in">' +
        '<div class="cookiebar__text">' +
          '<strong>Rispettiamo la tua privacy</strong>' +
          'Questo sito usa solo strumenti tecnici necessari al suo funzionamento e non installa ' +
          'cookie di statistica o di profilazione. Puoi comunque scegliere cosa autorizzare. ' +
          'Maggiori informazioni nella <a href="cookie-policy.html">Cookie policy</a> e nella ' +
          '<a href="privacy-policy.html">Privacy policy</a>.' +
        '</div>' +
        '<div class="cookiebar__actions">' +
          '<button type="button" class="ckbtn ckbtn--more" data-ck="preferenze">Preferenze</button>' +
          '<button type="button" class="ckbtn ckbtn--reject" data-ck="rifiuta">Rifiuta</button>' +
          '<button type="button" class="ckbtn ckbtn--accept" data-ck="accetta">Accetta tutti</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(barra);

    barra.addEventListener('click', function (e) {
      var azione = e.target.getAttribute && e.target.getAttribute('data-ck');
      if (azione === 'accetta') { salva({ statistici: true, marketing: true }); chiudiBarra(); }
      if (azione === 'rifiuta') { salva({ statistici: false, marketing: false }); chiudiBarra(); }
      if (azione === 'preferenze') { apriFinestra(); }
    });
  }

  function apriBarra() {
    if (!barra) creaBarra();
    window.setTimeout(function () { barra.classList.add('is-open'); }, 60);
  }

  function chiudiBarra() {
    if (barra) barra.classList.remove('is-open');
  }

  function creaFinestra() {
    finestra = document.createElement('div');
    finestra.className = 'ckmodal';
    finestra.setAttribute('role', 'dialog');
    finestra.setAttribute('aria-modal', 'true');
    finestra.setAttribute('aria-label', 'Preferenze sui cookie');

    var gruppi = CATEGORIE.map(function (c) {
      return '<div class="ckgroup">' +
          '<div class="ckgroup__head">' +
            '<span class="ckgroup__name">' + c.nome + '</span>' +
            (c.bloccato
              ? '<span class="ckgroup__state">Sempre attivi</span>'
              : '<span class="cksw" role="switch" tabindex="0" aria-checked="false" data-cat="' + c.id + '" aria-label="' + c.nome + '"></span>') +
          '</div>' +
          '<p class="ckgroup__desc">' + c.desc + '</p>' +
        '</div>';
    }).join('');

    finestra.innerHTML =
      '<div class="ckmodal__bg" data-ck="chiudi"></div>' +
      '<div class="ckmodal__box">' +
        '<h2>Preferenze sui cookie</h2>' +
        '<p>Scegli quali categorie di strumenti autorizzare. Puoi cambiare idea in ogni momento ' +
        'dal collegamento presente nel piè di pagina.</p>' +
        gruppi +
        '<div class="ckmodal__actions">' +
          '<button type="button" class="ckbtn ckbtn--reject" data-ck="rifiuta">Rifiuta tutti</button>' +
          '<button type="button" class="ckbtn ckbtn--save" data-ck="salva">Salva le scelte</button>' +
          '<button type="button" class="ckbtn ckbtn--accept" data-ck="accetta">Accetta tutti</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(finestra);

    finestra.querySelectorAll('.cksw').forEach(function (sw) {
      interruttori[sw.getAttribute('data-cat')] = sw;
      var commuta = function () {
        sw.setAttribute('aria-checked', sw.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
      };
      sw.addEventListener('click', commuta);
      sw.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); commuta(); }
      });
    });

    finestra.addEventListener('click', function (e) {
      var azione = e.target.getAttribute && e.target.getAttribute('data-ck');
      if (!azione) return;
      if (azione === 'chiudi') { chiudiFinestra(); }
      if (azione === 'accetta') { salva({ statistici: true, marketing: true }); chiudiFinestra(); chiudiBarra(); }
      if (azione === 'rifiuta') { salva({ statistici: false, marketing: false }); chiudiFinestra(); chiudiBarra(); }
      if (azione === 'salva') {
        salva({
          statistici: interruttori.statistici && interruttori.statistici.getAttribute('aria-checked') === 'true',
          marketing: interruttori.marketing && interruttori.marketing.getAttribute('aria-checked') === 'true'
        });
        chiudiFinestra();
        chiudiBarra();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') chiudiFinestra();
    });
  }

  function apriFinestra() {
    if (!finestra) creaFinestra();
    var dato = leggi() || { statistici: false, marketing: false };
    Object.keys(interruttori).forEach(function (cat) {
      interruttori[cat].setAttribute('aria-checked', dato[cat] ? 'true' : 'false');
    });
    finestra.classList.add('is-open');
  }

  function chiudiFinestra() {
    if (finestra) finestra.classList.remove('is-open');
  }

  /* ------------------------------- avvio -------------------------------- */
  var scelta = leggi();

  if (scelta) {
    applica(scelta);
  } else {
    apriBarra();
  }

  document.querySelectorAll('.js-cookie-prefs').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      apriFinestra();
    });
  });

  // Punto di accesso per interventi futuri.
  window.EvolutekaCookie = {
    apri: apriFinestra,
    stato: leggi,
    azzera: function () {
      try { window.localStorage.removeItem(CHIAVE); } catch (e) {}
      apriBarra();
    }
  };
})();
