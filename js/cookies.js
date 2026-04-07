// ============================================================
// ARQUIVO: cookies.js
// DESCRIÇÃO: Controla o banner de cookies (LGPD) do site
//            ONG Paraíso dos Pets. Exibe na primeira visita,
//            salva a preferência no localStorage e oculta
//            em visitas subsequentes.
// DEPENDÊNCIAS: Nenhuma
// ÚLTIMA ATUALIZAÇÃO: 2025
//
// ÍNDICE DE FUNÇÕES:
//   - verificarPreferencia() → Checa localStorage na carga
//   - exibirBanner()         → Mostra banner se sem preferência
//   - aceitarTodos()         → Salva aceitação e oculta banner
//   - aceitarEssenciais()    → Salva recusa e oculta banner
//   - ocultarBanner()        → Anima saída do banner
// ============================================================

'use strict';

// Nome da chave no localStorage para salvar a preferência
const COOKIE_STORAGE_KEY = 'cookies_preferencia';

// ============================================================
// VERIFICAR PREFERÊNCIA — Checa se já escolheu antes
// ============================================================

/**
 * Verifica se o usuário já fez uma escolha de cookies.
 * Se não houver preferência salva, exibe o banner.
 * Chamada automaticamente no DOMContentLoaded.
 * @returns {void}
 */
function verificarPreferencia() {
  const preferencia = localStorage.getItem(COOKIE_STORAGE_KEY);

  if (!preferencia) {
    // Sem preferência salva — exibir o banner após um breve delay
    setTimeout(exibirBanner, 1000);
  }
  // Se já tem preferência, não faz nada (banner permanece oculto)
}

// ============================================================
// EXIBIR BANNER — Mostra o banner de cookies
// ============================================================

/**
 * Exibe o banner de cookies com animação de slide-up.
 * Adiciona a classe .visivel que dispara a transição CSS.
 * @returns {void}
 */
function exibirBanner() {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;

  // Adiciona a classe que faz o banner surgir de baixo
  banner.classList.add('visivel');
}

// ============================================================
// ACEITAR TODOS — Salva aceitação completa
// ============================================================

/**
 * Salva a preferência de "aceitar todos" os cookies
 * no localStorage e oculta o banner com animação.
 * @returns {void}
 */
function aceitarTodos() {
  // Salva a preferência com timestamp
  const preferencia = {
    tipo: 'todos',
    data: new Date().toISOString()
  };

  localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(preferencia));
  ocultarBanner();
}

// ============================================================
// ACEITAR ESSENCIAIS — Salva apenas cookies essenciais
// ============================================================

/**
 * Salva a preferência de "apenas essenciais" no localStorage
 * e oculta o banner com animação.
 * @returns {void}
 */
function aceitarEssenciais() {
  // Salva a preferência com timestamp
  const preferencia = {
    tipo: 'essenciais',
    data: new Date().toISOString()
  };

  localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(preferencia));
  ocultarBanner();
}

// ============================================================
// OCULTAR BANNER — Anima a saída do banner
// ============================================================

/**
 * Anima a saída do banner de cookies para baixo
 * e remove a classe .visivel após a animação completar.
 * @returns {void}
 */
function ocultarBanner() {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;

  // Remove a classe visível — o CSS faz a transição de saída
  banner.classList.remove('visivel');
}

// ============================================================
// INICIALIZAÇÃO — Verifica preferência ao carregar a página
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  verificarPreferencia();

  // Conecta os botões do banner aos handlers
  const btnAceitarTodos = document.getElementById('cookie-aceitar-todos');
  const btnAceitarEssenciais = document.getElementById('cookie-aceitar-essenciais');

  if (btnAceitarTodos) {
    btnAceitarTodos.addEventListener('click', aceitarTodos);
  }

  if (btnAceitarEssenciais) {
    btnAceitarEssenciais.addEventListener('click', aceitarEssenciais);
  }
});

// ============================================================
// FIM DO ARQUIVO cookies.js
// ============================================================
