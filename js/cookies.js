'use strict';

const COOKIE_STORAGE_KEY = 'cookies_preferencia';

function verificarPreferencia() {
  let preferencia = null;
  try {
    preferencia = localStorage.getItem(COOKIE_STORAGE_KEY);
  } catch (e) {
    preferencia = null;
  }

  if (!preferencia) {
    setTimeout(exibirBanner, 1000);
  }
}

function exibirBanner() {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;
  banner.classList.add('visivel');
}

function salvarPreferencia(tipo) {
  const preferencia = {
    tipo,
    data: new Date().toISOString()
  };

  try {
    localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(preferencia));
    localStorage.setItem('cookies-consentimento', tipo);
  } catch (e) {
    // localStorage pode falhar em navegacao privada; o site continua normal.
  }

  document.dispatchEvent(new CustomEvent('cookies-atualizados', { detail: preferencia }));
  ocultarBanner();
}

function aceitarTodos() {
  salvarPreferencia('todos');
}

function aceitarEssenciais() {
  salvarPreferencia('essenciais');
}

function ocultarBanner() {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;
  banner.classList.remove('visivel');
}

document.addEventListener('DOMContentLoaded', () => {
  verificarPreferencia();

  const btnAceitarTodos = document.getElementById('cookie-aceitar-todos');
  const btnAceitarEssenciais = document.getElementById('cookie-aceitar-essenciais');

  if (btnAceitarTodos) {
    btnAceitarTodos.addEventListener('click', aceitarTodos);
  }

  if (btnAceitarEssenciais) {
    btnAceitarEssenciais.addEventListener('click', aceitarEssenciais);
  }
});
