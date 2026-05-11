// ============================================================
// ARQUIVO: admin.js
// DESCRIÇÃO: Lógica principal do painel administrativo.
//            Controla autenticação (login/logout), navegação
//            entre seções, dashboard com estatísticas e
//            estrutura base para todos os módulos.
// DEPENDÊNCIAS: firebase-config.js (Firebase + funções auxiliares)
// ÚLTIMA ATUALIZAÇÃO: 2025
//
// ÍNDICE DE FUNÇÕES:
//   - initAdmin()              → Inicializa o painel
//   - initAuth()               → Controla login/logout/estado
//   - mostrarLogin()           → Exibe tela de login
//   - mostrarPainel()          → Exibe o painel admin
//   - handleLogin()            → Processa tentativa de login
//   - handleLogout()           → Processa logout
//   - handleRecuperarSenha()   → Envia email de recuperação
//   - initNavegacao()          → Navegação entre seções (sidebar)
//   - navegarPara(secao)       → Muda a seção ativa
//   - carregarDashboard()      → Busca e exibe estatísticas
//   - carregarAtividades()     → Lista atividades recentes
//   - initHamburgerAdmin()     → Menu mobile do admin
//   - mostrarToastAdmin(m,t)   → Toast notification no admin
//   - confirmarAcao(t,m,cb)    → Modal de confirmação
// ============================================================

'use strict';

// Admin sanitize helpers — uses DOMPurify for defense-in-depth
// Public form data (fichas, voluntários, mensagens) can contain malicious HTML
function _as(str) {
  if (!str || typeof str !== 'string') return str || '';
  if (typeof DOMPurify !== 'undefined') {
    return DOMPurify.sanitize(str, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  }
  const el = document.createElement('div');
  el.textContent = str;
  return el.innerHTML;
}
function _au(url) {
  if (!url || typeof url !== 'string') return '';
  const t = url.trim().toLowerCase();
  if (t.startsWith('http://') || t.startsWith('https://') || t.startsWith('data:image/')) {
    return typeof DOMPurify !== 'undefined'
      ? DOMPurify.sanitize(url.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
      : url.trim();
  }
  return '';
}

// ============================================================
// INICIALIZAÇÃO DO PAINEL
// ============================================================

/**
 * Inicializa o painel administrativo.
 * Configura autenticação, navegação e eventos.
 * @returns {void}
 */
function initAdmin() {
  // Inicializa autenticação (observa estado de login)
  initAuth();

  // Configura navegação da sidebar
  initNavegacao();

  // Configura menu hamburguer mobile
  initHamburgerAdmin();

  // Configura botões de login
  const btnLogin = document.getElementById('btn-login');
  if (btnLogin) {
    btnLogin.addEventListener('click', handleLogin);
  }

  // Login ao pressionar Enter nos campos
  const campoSenha = document.getElementById('login-senha');
  const campoEmail = document.getElementById('login-email');
  if (campoSenha) {
    campoSenha.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleLogin();
    });
  }
  if (campoEmail) {
    campoEmail.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') document.getElementById('login-senha')?.focus();
    });
  }

  // Botão recuperar senha
  const btnRecuperar = document.getElementById('btn-recuperar-senha');
  if (btnRecuperar) {
    btnRecuperar.addEventListener('click', handleRecuperarSenha);
  }

  // Botão logout
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', handleLogout);
  }

  // Configura modal de confirmação
  const modalCancelar = document.getElementById('modal-cancelar');
  if (modalCancelar) {
    modalCancelar.addEventListener('click', () => {
      document.getElementById('modal-confirmacao')?.classList.remove('ativo');
    });
  }

  document.querySelectorAll('[data-admin-nav]').forEach((element) => {
    const secao = element.dataset.adminNav;
    if (!secao) return;

    const triggerNavigation = () => navegarPara(secao);
    element.addEventListener('click', triggerNavigation);
    element.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        triggerNavigation();
      }
    });
  });

  const btnNovaFoto = document.getElementById('btn-nova-foto');
  if (btnNovaFoto) btnNovaFoto.addEventListener('click', () => abrirFormGaleria());

  const btnNovoDepoimento = document.getElementById('btn-novo-depoimento');
  if (btnNovoDepoimento) btnNovoDepoimento.addEventListener('click', () => abrirFormDepoimento());
}

// ============================================================
// AUTENTICAÇÃO — Login, Logout, Estado
// ============================================================

/**
 * Observa o estado de autenticação do Firebase.
 * Se logado → mostra o painel. Se não → mostra o login.
 * Chamado automaticamente na inicialização.
 * @returns {void}
 */
function initAuth() {
  observarAuth((usuario) => {
    if (usuario) {
      // Usuário está logado — mostra o painel
      mostrarPainel(usuario);
    } else {
      // Não está logado — mostra o login
      mostrarLogin();
    }
  });
}

/**
 * Exibe a tela de login e esconde o painel.
 * @returns {void}
 */
function mostrarLogin() {
  const telaLogin = document.getElementById('tela-login');
  const painelAdmin = document.getElementById('painel-admin');

  if (telaLogin) telaLogin.style.display = 'flex';
  if (painelAdmin) painelAdmin.style.display = 'none';

  // Limpa campos de login
  const campoEmail = document.getElementById('login-email');
  const campoSenha = document.getElementById('login-senha');
  if (campoEmail) campoEmail.value = '';
  if (campoSenha) campoSenha.value = '';

  // Esconde mensagem de erro
  const loginErro = document.getElementById('login-erro');
  if (loginErro) loginErro.classList.remove('visivel');
}

/**
 * Exibe o painel admin e esconde o login.
 * Atualiza as informações do usuário na sidebar.
 * @param {Object} usuario - Dados do usuário logado (Firebase Auth)
 * @returns {void}
 */
function mostrarPainel(usuario) {
  const telaLogin = document.getElementById('tela-login');
  const painelAdmin = document.getElementById('painel-admin');

  if (telaLogin) telaLogin.style.display = 'none';
  if (painelAdmin) painelAdmin.style.display = 'flex';

  // Atualiza info do usuário na sidebar
  const nomeEl = document.getElementById('user-nome');
  const emailEl = document.getElementById('user-email');
  const avatarEl = document.getElementById('user-avatar');

  if (nomeEl) nomeEl.textContent = usuario.displayName || 'Administrador';
  if (emailEl) emailEl.textContent = usuario.email || '';
  if (avatarEl) {
    // Usa a primeira letra do email como avatar
    const inicial = (usuario.email || 'A').charAt(0).toUpperCase();
    avatarEl.textContent = inicial;
  }

  // Carrega os dados do dashboard
  carregarDashboard();
}

/**
 * Processa a tentativa de login.
 * Valida os campos, faz a autenticação e mostra erros se houver.
 * @returns {void}
 */
async function handleLogin() {
  const emailInput = document.getElementById('login-email');
  const senhaInput = document.getElementById('login-senha');
  const erroEl = document.getElementById('login-erro');
  const btnLogin = document.getElementById('btn-login');

  const email = emailInput?.value.trim();
  const senha = senhaInput?.value;

  // Validação básica
  if (!email || !senha) {
    if (erroEl) {
      erroEl.textContent = 'Preencha o e-mail e a senha.';
      erroEl.classList.add('visivel');
    }
    return;
  }

  // Mostra loading no botão
  if (btnLogin) btnLogin.classList.add('btn-loading');

  try {
    // Tenta fazer login via Firebase
    await fazerLogin(email, senha);
    // Se chegou aqui, login foi bem-sucedido
    // O observarAuth() vai chamar mostrarPainel() automaticamente
  } catch (erro) {
    // Mostra erro amigável
    if (erroEl) {
      erroEl.textContent = erro.message || 'Erro ao processar. Tente novamente.';
      erroEl.classList.add('visivel');
    }
    // Limpa o campo de senha
    if (senhaInput) senhaInput.value = '';
  } finally {
    // Remove loading do botão
    if (btnLogin) btnLogin.classList.remove('btn-loading');
  }
}

/**
 * Processa o logout do usuário.
 * @returns {void}
 */
async function handleLogout() {
  try {
    await fazerLogout();
    // O observarAuth() vai chamar mostrarLogin() automaticamente
  } catch (erro) {
    mostrarToastAdmin('Erro ao sair. Tente novamente.', 'erro');
  }
}

/**
 * Envia email de recuperação de senha.
 * @returns {void}
 */
async function handleRecuperarSenha() {
  const emailInput = document.getElementById('login-email');
  const erroEl = document.getElementById('login-erro');
  const email = emailInput?.value.trim();

  if (!email) {
    if (erroEl) {
      erroEl.textContent = 'Digite seu e-mail no campo acima para recuperar a senha.';
      erroEl.classList.add('visivel');
    }
    return;
  }

  try {
    await recuperarSenha(email);
    if (erroEl) {
      erroEl.textContent = '✅ Email de recuperação enviado! Verifique sua caixa de entrada.';
      erroEl.classList.add('visivel');
      erroEl.style.color = 'var(--cor-verde)';
    }
  } catch (erro) {
    if (erroEl) {
      erroEl.textContent = erro.message || 'Erro ao processar. Tente novamente.';
      erroEl.classList.add('visivel');
      erroEl.style.color = '';
    }
  }
}

// ============================================================
// NAVEGAÇÃO — Sidebar e seções
// ============================================================

/**
 * Configura a navegação entre seções via sidebar.
 * Cada botão da sidebar tem um data-secao que corresponde
 * ao ID da seção a ser exibida.
 * @returns {void}
 */
function initNavegacao() {
  const links = document.querySelectorAll('.sidebar__link');

  links.forEach(link => {
    link.addEventListener('click', () => {
      const secao = link.dataset.secao;
      if (secao) navegarPara(secao);

      // Fecha sidebar no mobile
      const sidebar = document.getElementById('admin-sidebar');
      if (sidebar && window.innerWidth <= 1023) {
        sidebar.classList.remove('ativo');
      }
    });
  });
}

// Mapeamento de seções para títulos do header
const TITULOS_SECAO = {
  dashboard:      'Dashboard',
  animais:        'Gerenciar Animais',
  fichas:         'Fichas de Adoção',
  voluntarios:    'Voluntários Cadastrados',
  mensagens:      'Mensagens de Contato',
  blog:           'Gerenciar Blog',
  galeria:        'Galeria de Fotos',
  depoimentos:    'Depoimentos de Adotantes',
  transparencia:  'Transparência Financeira',
  configuracoes:  'Configurações do Site'
};

/**
 * Navega para uma seção do painel admin.
 * Ativa a seção correspondente e atualiza sidebar e header.
 * @param {string} secao - Nome da seção (ex: 'dashboard', 'animais')
 * @returns {void}
 */
function navegarPara(secao) {
  // Desativa todas as seções
  document.querySelectorAll('.admin-secao').forEach(s => s.classList.remove('ativo'));

  // Ativa a seção selecionada
  const secaoEl = document.getElementById(`secao-${secao}`);
  if (secaoEl) secaoEl.classList.add('ativo');

  // Atualiza link ativo na sidebar
  document.querySelectorAll('.sidebar__link').forEach(link => {
    link.classList.toggle('ativo', link.dataset.secao === secao);
  });

  // Atualiza título no header
  const tituloEl = document.getElementById('admin-titulo-pagina');
  if (tituloEl) tituloEl.textContent = TITULOS_SECAO[secao] || 'Painel Admin';

  // Carrega dados da seção (se necessário)
  carregarSecao(secao);

  // Scroll ao topo
  window.scrollTo(0, 0);
}

/**
 * Carrega os dados específicos de uma seção.
 * Chamado quando o usuário navega para a seção.
 * @param {string} secao - Nome da seção
 * @returns {void}
 */
async function carregarSecao(secao) {
  switch (secao) {
    case 'dashboard':
      carregarDashboard();
      break;
    case 'animais':
      if (typeof carregarListaAnimais === 'function') carregarListaAnimais();
      break;
    case 'fichas':
      if (typeof carregarListaFichas === 'function') carregarListaFichas();
      break;
    case 'voluntarios':
      if (typeof carregarListaVoluntarios === 'function') carregarListaVoluntarios();
      break;
    case 'mensagens':
      if (typeof carregarListaMensagens === 'function') carregarListaMensagens();
      break;
    case 'blog':
      if (typeof carregarListaPosts === 'function') carregarListaPosts();
      break;
    case 'galeria':
      if (typeof carregarGaleriaAdmin === 'function') carregarGaleriaAdmin();
      break;
    case 'depoimentos':
      if (typeof carregarDepoimentosAdmin === 'function') carregarDepoimentosAdmin();
      break;
    case 'transparencia':
      if (typeof carregarTransparenciaAdmin === 'function') carregarTransparenciaAdmin();
      break;
    case 'configuracoes':
      if (typeof carregarConfiguracoesAdmin === 'function') carregarConfiguracoesAdmin();
      break;
  }
}

// ============================================================
// DASHBOARD — Estatísticas e atividades recentes
// ============================================================

/**
 * Carrega as estatísticas do dashboard.
 * Busca contagens no Firestore e atualiza os cards.
 * @returns {void}
 */
async function carregarDashboard() {
  try {
    // Busca contagens em paralelo para velocidade
    const [animais, fichasPendentes, mensagensNaoLidas, voluntarios] = await Promise.all([
      contarDocumentos(COLECOES.ANIMAIS),
      contarDocumentos(COLECOES.FICHAS_ADOCAO, 'status', 'Pendente'),
      contarDocumentos(COLECOES.MENSAGENS, 'lido', false),
      contarDocumentos(COLECOES.VOLUNTARIOS)
    ]);

    // Atualiza os cards do dashboard
    atualizarDashCard('dash-animais', animais);
    atualizarDashCard('dash-fichas', fichasPendentes);
    atualizarDashCard('dash-mensagens', mensagensNaoLidas);
    atualizarDashCard('dash-voluntarios', voluntarios);

    // Atualiza badges na sidebar
    atualizarBadge('badge-animais', animais);
    atualizarBadge('badge-fichas', fichasPendentes);
    atualizarBadge('badge-mensagens', mensagensNaoLidas);
    atualizarBadge('badge-voluntarios', voluntarios);

    // Carrega atividades recentes
    carregarAtividades();

  } catch (erro) {
    console.error('Erro ao carregar dashboard:', erro);
  }
}

/**
 * Atualiza o valor numérico de um card do dashboard.
 * Remove a classe de loading e exibe o número.
 * @param {string} id - ID do elemento
 * @param {number} valor - Valor a exibir
 */
function atualizarDashCard(id, valor) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = valor;
    el.classList.remove('carregando');
  }
}

/**
 * Atualiza um badge numérico na sidebar.
 * Mostra o badge se valor > 0, esconde se 0.
 * @param {string} id - ID do badge
 * @param {number} valor - Valor numérico
 */
function atualizarBadge(id, valor) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = valor;
    el.style.display = valor > 0 ? 'inline' : 'none';
  }
}

/**
 * Carrega as atividades recentes para o dashboard.
 * Busca as últimas fichas, mensagens e voluntários.
 * @returns {void}
 */
async function carregarAtividades() {
  const container = document.getElementById('lista-atividades');
  if (!container) return;

  try {
    // Busca os últimos registros de cada tipo
    const [fichas, mensagens, voluntarios] = await Promise.all([
      buscarFichasAdocao(),
      buscarMensagens(),
      buscarVoluntarios()
    ]);

    // Combina e ordena por data (mais recente primeiro)
    const atividades = [];

    fichas.slice(0, 3).forEach(f => {
      atividades.push({
        tipo: 'ficha',
        destaque: f.nomeCompleto || f['nome-completo'] || 'Alguém',
        complemento: 'preencheu uma ficha de adoção',
        data: f.criadoEm,
        cor: 'var(--cor-verde)'
      });
    });

    mensagens.slice(0, 3).forEach(m => {
      atividades.push({
        tipo: 'mensagem',
        destaque: m.nome || 'Alguém',
        complemento: `enviou uma mensagem sobre "${m.assunto || 'Contato'}"`,
        data: m.criadoEm,
        cor: 'var(--cor-info)'
      });
    });

    voluntarios.slice(0, 3).forEach(v => {
      atividades.push({
        tipo: 'voluntario',
        destaque: v.nome || 'Alguém',
        complemento: 'se cadastrou como voluntário',
        data: v.criadoEm,
        cor: 'var(--cor-primaria)'
      });
    });

    // Ordena por data (mais recente primeiro)
    atividades.sort((a, b) => {
      const dataA = a.data?.toDate?.() || new Date(0);
      const dataB = b.data?.toDate?.() || new Date(0);
      return dataB - dataA;
    });

    const icones = {
      ficha: 'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z',
      mensagem: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z',
      voluntario: 'M16.5 3C14.76 3 13.09 3.81 12 5.09 10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3z'
    };

    SafeDOM.clear(container);

    // Renderiza (máximo 8 atividades)
    if (atividades.length === 0) {
      const empty = SafeDOM.el('div', { className: 'admin-vazio' }, [
        SafeDOM.el('svg', { attrs: { viewBox: '0 0 24 24', 'aria-hidden': 'true' }, html: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>' }),
        SafeDOM.el('p', { className: 'admin-vazio__titulo', text: 'Nenhuma atividade ainda' }),
        SafeDOM.el('p', { className: 'admin-vazio__texto', text: 'Quando alguém enviar uma ficha, mensagem ou se cadastrar como voluntário, aparecerá aqui.' })
      ]);
      container.appendChild(empty);
      return;
    }

    atividades.slice(0, 8).forEach((atividade) => {
      const iconWrapper = SafeDOM.el('div', { className: 'atividade-item__icone' }, [
        SafeDOM.el('svg', {
          attrs: { viewBox: '0 0 24 24', 'aria-hidden': 'true' },
          html: `<path d="${icones[atividade.tipo] || icones.ficha}"/>`
        })
      ]);
      iconWrapper.style.backgroundColor = atividade.cor;

      const text = SafeDOM.el('div', { className: 'atividade-item__texto' }, [
        SafeDOM.el('strong', { text: atividade.destaque }),
        document.createTextNode(` ${atividade.complemento}`)
      ]);

      const item = SafeDOM.el('div', { className: 'atividade-item' }, [
        iconWrapper,
        SafeDOM.el('div', {}, [
          text,
          SafeDOM.el('div', { className: 'atividade-item__tempo', text: formatarTimestamp(atividade.data) })
        ])
      ]);

      container.appendChild(item);
    });

  } catch (erro) {
    console.error('Erro ao carregar atividades:', erro);
    SafeDOM.clear(container);
    container.appendChild(SafeDOM.el('div', { className: 'admin-vazio' }, [
      SafeDOM.el('p', { className: 'admin-vazio__titulo', text: 'Erro ao carregar' }),
      SafeDOM.el('p', { className: 'admin-vazio__texto', text: 'Não foi possível buscar as atividades recentes.' })
    ]));
  }
}

// ============================================================
// HAMBURGER — Menu mobile do admin
// ============================================================

/**
 * Configura o botão hamburger para abrir/fechar a sidebar no mobile.
 * @returns {void}
 */
function initHamburgerAdmin() {
  const hamburger = document.getElementById('admin-hamburger');
  const sidebar = document.getElementById('admin-sidebar');

  if (hamburger && sidebar) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('ativo');
    });

    // Fecha ao clicar fora da sidebar no mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 1023 &&
          !sidebar.contains(e.target) &&
          !hamburger.contains(e.target) &&
          sidebar.classList.contains('ativo')) {
        sidebar.classList.remove('ativo');
      }
    });
  }
}

// ============================================================
// TOAST — Notificações no admin
// ============================================================

/**
 * Exibe uma notificação toast no painel admin.
 * @param {string} mensagem - Texto da notificação
 * @param {string} tipo - Tipo: 'sucesso' | 'erro' | 'aviso' | 'info'
 */
function mostrarToastAdmin(mensagem, tipo = 'info') {
  // Reutiliza o showToast se disponível, senão cria simples
  if (typeof showToast === 'function') {
    showToast(mensagem, tipo);
    return;
  }

  // Implementação simples de toast para o admin
  let container = document.querySelector('.toast-container-admin');
  if (!container) {
    container = document.createElement('div');
    container.classList.add('toast-container-admin');
    container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column-reverse;gap:0.5rem;max-width:400px;';
    document.body.appendChild(container);
  }

  const cores = {
    sucesso: 'var(--cor-verde)',
    erro: 'var(--cor-erro)',
    aviso: 'var(--cor-aviso)',
    info: 'var(--cor-info)'
  };

  const toast = document.createElement('div');
  toast.style.cssText = `
    padding:1rem 1.5rem;background:var(--cor-branco);border-radius:8px;
    box-shadow:0 4px 20px rgba(0,0,0,0.15);font-size:0.9rem;font-weight:600;
    border-left:4px solid ${cores[tipo] || cores.info};
    animation:fadeIn 0.3s ease;
  `;
  toast.textContent = mensagem;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ============================================================
// MODAL DE CONFIRMAÇÃO — Para ações destrutivas
// ============================================================

// Callback da confirmação (armazenado temporariamente)
let _callbackConfirmacao = null;

/**
 * Exibe o modal de confirmação antes de uma ação destrutiva.
 * @param {string} titulo - Título do modal
 * @param {string} mensagem - Texto explicativo
 * @param {Function} callback - Função a executar se confirmar
 */
function confirmarAcao(titulo, mensagem, callback) {
  const modal = document.getElementById('modal-confirmacao');
  const tituloEl = document.getElementById('modal-titulo');
  const textoEl = document.getElementById('modal-texto');
  const btnConfirmar = document.getElementById('modal-confirmar');

  if (!modal) return;

  if (tituloEl) tituloEl.textContent = titulo;
  if (textoEl) textoEl.textContent = mensagem;

  // Salva o callback
  _callbackConfirmacao = callback;

  // Remove listener anterior e adiciona novo
  if (btnConfirmar) {
    const novoBotao = btnConfirmar.cloneNode(true);
    btnConfirmar.parentNode.replaceChild(novoBotao, btnConfirmar);
    novoBotao.id = 'modal-confirmar';
    novoBotao.addEventListener('click', () => {
      modal.classList.remove('ativo');
      if (_callbackConfirmacao) _callbackConfirmacao();
      _callbackConfirmacao = null;
    });
  }

  // Mostra o modal
  modal.classList.add('ativo');
}

// ============================================================
// SEGURANÇA — Timeout de inatividade (30 minutos)
// ============================================================

let _inactivityTimer = null;
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos

/**
 * Reseta o timer de inatividade.
 * Após 30 minutos sem ação, faz logout automático.
 */
function resetInactivityTimer() {
  if (_inactivityTimer) clearTimeout(_inactivityTimer);
  _inactivityTimer = setTimeout(() => {
    if (typeof auth !== 'undefined' && auth.currentUser) {
      handleLogout();
      mostrarToastAdmin('Sessão expirada por inatividade. Faça login novamente.', 'aviso');
    }
  }, SESSION_TIMEOUT_MS);
}

// Monitora atividade do usuário
['click', 'keypress', 'scroll', 'mousemove', 'touchstart'].forEach(evt => {
  document.addEventListener(evt, resetInactivityTimer, { passive: true });
});

// ============================================================
// INICIALIZAÇÃO — Executa quando o DOM estiver pronto
// ============================================================

document.addEventListener('DOMContentLoaded', initAdmin);

// ============================================================
// FIM DO ARQUIVO admin.js
// ============================================================
