// ============================================================
// ARQUIVO: doar.js
// DESCRIÇÃO: Controla a página de doações — seleção de valor,
//            mensagem motivacional, barra de meta, cópia de PIX
//            e interação com cards de valor.
// DEPENDÊNCIAS: main.js (toast notifications)
// ÚLTIMA ATUALIZAÇÃO: 2025
//
// ÍNDICE DE FUNÇÕES:
//   - initSelecaoValor()      → Gerencia seleção de cards de valor
//   - destacarCard(valor)     → Aplica estilo ao card selecionado
//   - atualizarCTA(valor)     → Atualiza texto do botão CTA
//   - atualizarMensagem(v)    → Mensagem motivacional por faixa
//   - ativarCampoLivre()      → Mostra input de valor personalizado
//   - animarMeta()            → Anima barra de progresso da meta
//   - copiarPix()             → Copia chave PIX + feedback visual
//   - initDoar()              → Inicializa a página
// ============================================================

'use strict';

// Valor selecionado atualmente (null = nenhum)
let valorSelecionado = null;

// ============================================================
// DADOS DA META MENSAL — Populados pelo Firebase via config.
// Para alterar, use o painel admin → Configurações → Meta Mensal.
// ============================================================
const META_MENSAL = {
  meta: 0,
  arrecadado: 0,
  mes: ''
};

// ============================================================
// MENSAGENS MOTIVACIONAIS — Uma para cada faixa de valor
// ============================================================
const MENSAGENS = {
  10:    'Com R$ 10, você alimenta um cão por 2 dias. Cada prato importa!',
  20:    'Com R$ 20, um cão come por uma semana inteira. Obrigado!',
  50:    'Com R$ 50, você cobre a vacinação anual de um cão. Proteção e amor!',
  100:   'Com R$ 100, você paga uma consulta veterinária de emergência. Você salva vidas!',
  200:   'Com R$ 200, você sustenta um cão inteiro por um mês. Você é um padrinho!',
  outro: 'Qualquer valor faz diferença. Obrigado por seu coração generoso!'
};

// ============================================================
// INICIALIZAÇÃO DA PÁGINA DE DOAÇÃO
// ============================================================

/**
 * Inicializa todos os componentes da página de doação.
 * @returns {void}
 */
function initDoar() {
  const paginaDoar = document.getElementById('doar-page');
  if (!paginaDoar) return;

  // Inicializa seleção de valor
  initSelecaoValor();

  // Anima barra de meta ao entrar no viewport
  animarMeta();

  // Configura botão de copiar PIX
  const btnPix = document.getElementById('btn-copiar-pix');
  if (btnPix) {
    btnPix.addEventListener('click', copiarPix);
  }

  // Inicializa link do Mercado Pago (sem valor inicial)
  atualizarLinkMercadoPago(null);

  // Configura campo de valor personalizado
  const campoLivre = document.getElementById('valor-livre-input');
  if (campoLivre) {
    campoLivre.addEventListener('input', () => {
      const val = parseFloat(campoLivre.value);
      if (!isNaN(val) && val > 0) {
        valorSelecionado = val;
        atualizarCTA(val);
        atualizarMensagem('outro');
      }
    });
  }
}

// ============================================================
// SELEÇÃO DE VALOR — Cards interativos
// ============================================================

/**
 * Configura os 6 cards de valor de doação.
 * Ao clicar, destaca o card e atualiza CTA e mensagem.
 * @returns {void}
 */
function initSelecaoValor() {
  const cards = document.querySelectorAll('.card-valor');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const valor = card.dataset.valor;

      // Remove seleção de todos os cards
      cards.forEach(c => c.classList.remove('selecionado'));

      // Seleciona o card clicado
      card.classList.add('selecionado');

      if (valor === 'outro') {
        // Mostra campo de valor personalizado
        ativarCampoLivre();
        valorSelecionado = null;
        atualizarCTA(null);
        atualizarMensagem('outro');
      } else {
        // Esconde campo de valor personalizado
        const campoLivre = document.getElementById('valor-personalizado');
        if (campoLivre) campoLivre.classList.remove('ativo');

        const val = parseFloat(valor);
        valorSelecionado = val;
        destacarCard(val);
        atualizarCTA(val);
        atualizarMensagem(val);
      }
    });
  });
}

/**
 * Aplica destaque visual ao card selecionado.
 * @param {number} valor - Valor do card
 */
function destacarCard(valor) {
  // O destaque é feito via classe CSS .selecionado
  // Esta função pode ser expandida para efeitos adicionais
}

/**
 * Atualiza o texto do botão CTA principal com o valor selecionado.
 * @param {number|null} valor - Valor selecionado (null para limpar)
 */
function atualizarCTA(valor) {
  const btn = document.getElementById('btn-cta-doar');
  const btnMP = document.getElementById('btn-mercadopago');

  if (btn) {
    if (valor && valor > 0) {
      btn.textContent = `Quero Doar R$ ${valor.toFixed(0)} →`;
      btn.classList.remove('btn--disabled');
    } else {
      btn.textContent = 'Selecione um valor acima →';
      btn.classList.add('btn--disabled');
    }
  }

  // Atualiza o link do Mercado Pago com o valor selecionado
  atualizarLinkMercadoPago(valor);
}

/**
 * Atualiza o link do Mercado Pago com o valor selecionado.
 * Usa o link de doação configurado nas Configurações do admin,
 * ou um link padrão genérico de fallback.
 * @param {number|null} valor - Valor da doação
 */
function atualizarLinkMercadoPago(valor) {
  const btnMP = document.getElementById('btn-mercadopago');
  if (!btnMP) return;

  // Link do Mercado Pago vindo das configurações (Firebase)
  // ou fallback para link genérico (ONG cria na conta MP deles)
  const linkConfigurado = (typeof configPublica !== 'undefined' && configPublica?.mercadoPagoLink)
    ? SafeDOM.safeURL(configPublica.mercadoPagoLink, { allowRelative: false })
    : null;

  if (linkConfigurado) {
    // Se há link configurado, redireciona direto para ele
    // (a ONG cria um link de doação no Mercado Pago e cola no admin)
    btnMP.href = linkConfigurado;
    btnMP.target = '_blank';
    btnMP.rel = 'noopener noreferrer';
  } else {
    // Sem link configurado — redireciona para WhatsApp com o valor
    const msg = valor && valor > 0
      ? `Olá! Quero fazer uma doação de R$ ${valor.toFixed(2)} via cartão/boleto. Como devo proceder?`
      : `Olá! Quero fazer uma doação via cartão de crédito ou boleto. Como devo proceder?`;
    btnMP.href = `https://wa.me/5516999999999?text=${encodeURIComponent(msg)}`;
    btnMP.target = '_blank';
    btnMP.rel = 'noopener noreferrer';
  }
}

/**
 * Atualiza a mensagem motivacional conforme o valor.
 * @param {number|string} valor - Valor numérico ou 'outro'
 */
function atualizarMensagem(valor) {
  const el = document.getElementById('mensagem-motivacional');
  if (!el) return;

  el.textContent = MENSAGENS[valor] || MENSAGENS['outro'];

  // Animação de fade
  el.style.opacity = '0';
  el.style.transform = 'translateY(5px)';
  setTimeout(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  }, 50);
}

/**
 * Mostra o campo de valor personalizado.
 */
function ativarCampoLivre() {
  const container = document.getElementById('valor-personalizado');
  if (container) {
    container.classList.add('ativo');
    const input = container.querySelector('input');
    if (input) input.focus();
  }
}

// ============================================================
// BARRA DE PROGRESSO DA META MENSAL
// ============================================================

/**
 * Anima a barra de progresso da meta mensal ao entrar no viewport.
 * @returns {void}
 */
function animarMeta() {
  const fill = document.getElementById('meta-fill');
  const percentEl = document.getElementById('meta-porcentagem');
  const metaLabel = document.getElementById('meta-label');
  const arrecadadoLabel = document.getElementById('meta-arrecadado');

  if (!fill) return;

  // Se a meta não foi configurada, mostra mensagem apropriada
  if (!META_MENSAL.meta || META_MENSAL.meta === 0) {
    if (metaLabel) metaLabel.textContent = 'Meta mensal será definida em breve';
    if (arrecadadoLabel) arrecadadoLabel.textContent = '';
    if (percentEl) percentEl.textContent = '';
    return;
  }

  const percentual = Math.min((META_MENSAL.arrecadado / META_MENSAL.meta) * 100, 100);

  // Preenche labels
  if (metaLabel) metaLabel.textContent = `Meta de ${META_MENSAL.mes}: R$ ${META_MENSAL.meta.toLocaleString('pt-BR')}`;
  if (arrecadadoLabel) arrecadadoLabel.textContent = `Arrecadado: R$ ${META_MENSAL.arrecadado.toLocaleString('pt-BR')}`;
  if (percentEl) percentEl.textContent = `${percentual.toFixed(0)}% da meta alcançada`;

  // Anima a barra com IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          fill.style.width = `${percentual}%`;
        }, 300);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  observer.observe(fill.parentElement);
}

// ============================================================
// COPIAR PIX — Copia chave e dá feedback
// ============================================================

/**
 * Copia a chave PIX para a área de transferência e mostra feedback.
 * @returns {void}
 */
function copiarPix() {
  const chave = 'contato@ongparaisodospets.org.br';

  navigator.clipboard.writeText(chave).then(() => {
    // Feedback visual no botão
    const btn = document.getElementById('btn-copiar-pix');
    if (btn) {
      const textoOriginal = btn.dataset.originalText || btn.textContent || 'Copiar chave PIX';
      btn.dataset.originalText = textoOriginal;
      btn.textContent = '✅ Copiado!';
      btn.style.backgroundColor = 'var(--cor-verde)';
      btn.style.color = 'var(--cor-branco)';

      setTimeout(() => {
        btn.textContent = textoOriginal;
        btn.style.backgroundColor = '';
        btn.style.color = '';
      }, 3000);
    }

    // Toast de confirmação
    if (typeof showToast === 'function') {
      showToast('Chave PIX copiada para a área de transferência!', 'sucesso');
    }
  }).catch(() => {
    if (typeof showToast === 'function') {
      showToast('Não foi possível copiar. Copie manualmente: contato@ongparaisodospets.org.br', 'aviso');
    }
  });
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initDoar);

// ============================================================
// FIM DO ARQUIVO doar.js
// ============================================================
