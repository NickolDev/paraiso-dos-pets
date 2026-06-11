// ============================================================
// ARQUIVO: main.js
// DESCRIÇÃO: Funcionalidades globais do site ONG Paraíso dos Pets.
//            Este arquivo é carregado em TODAS as páginas e controla
//            componentes compartilhados como header, menu, animações,
//            toast notifications e botões flutuantes.
// DEPENDÊNCIAS: Nenhuma (JavaScript puro)
// ÚLTIMA ATUALIZAÇÃO: 2025
//
// ÍNDICE DE FUNÇÕES:
//   - initHeader()           → Header fixo com classe .scrolled
//   - initHamburger()        → Menu mobile com overlay e animação
//   - initSmoothScroll()     → Scroll suave para âncoras internas
//   - initAnimateOnScroll()  → IntersectionObserver para fade-in
//   - initCounters()         → Contadores animados (0 → valor final)
//   - initCarrossel()        → Carrossel de histórias de adoção
//   - initBotaoTopo()        → Botão voltar ao topo
//   - initWhatsApp()         → Botão WhatsApp flutuante (delay 2s)
//   - showToast(msg, tipo)   → Sistema de toast notifications
//   - initSubmenus()         → Submenus desktop hover + mobile click
//   - initAll()              → Inicializa tudo no DOMContentLoaded
// ============================================================

'use strict';

// ============================================================
// HEADER FIXO — Adiciona classe .scrolled após 50px de scroll
// para aplicar backdrop-filter e sombra
// ============================================================

/**
 * Inicializa o comportamento do header fixo.
 * Após 50px de scroll, adiciona a classe .scrolled ao header
 * para alterar sua aparência (fundo sólido + sombra).
 * @returns {void}
 */
function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  // Verifica posição do scroll na carga da página (caso recarregue no meio)
  const checkScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  // Executa imediatamente e adiciona listener de scroll
  checkScroll();
  window.addEventListener('scroll', checkScroll, { passive: true });
}

// ============================================================
// MENU HAMBURGUER — Menu mobile com overlay e animação
// ============================================================

/**
 * Inicializa o menu hamburguer mobile.
 * Ao clicar no ícone: abre/fecha o menu com deslize lateral.
 * Ao clicar no overlay ou em um link: fecha o menu.
 * @returns {void}
 */
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navPrincipal = document.getElementById('nav-principal');
  const navOverlay = document.getElementById('nav-overlay');

  if (!hamburger || !navPrincipal) return;

  // Toggle do menu ao clicar no hamburguer
  hamburger.addEventListener('click', () => {
    const isAberto = hamburger.classList.contains('ativo');

    hamburger.classList.toggle('ativo');
    navPrincipal.classList.toggle('ativo');

    if (navOverlay) {
      navOverlay.classList.toggle('ativo');
    }

    // Atualiza acessibilidade
    hamburger.setAttribute('aria-expanded', !isAberto);

    // Trava o scroll do body quando o menu está aberto
    document.body.style.overflow = !isAberto ? 'hidden' : '';
  });

  // Fecha o menu ao clicar no overlay escuro
  if (navOverlay) {
    navOverlay.addEventListener('click', () => {
      fecharMenu();
    });
  }

  // Fecha o menu ao clicar em um link de navegação
  const navLinks = navPrincipal.querySelectorAll('.nav-link:not(.nav-link--submenu-trigger)');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      // Verifica se estamos no mobile (hamburguer visível)
      if (window.getComputedStyle(hamburger).display !== 'none') {
        fecharMenu();
      }
    });
  });

  // Fecha menu ao clicar em links do submenu no mobile
  const submenuLinks = navPrincipal.querySelectorAll('.submenu__link');
  submenuLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.getComputedStyle(hamburger).display !== 'none') {
        fecharMenu();
      }
    });
  });

  /**
   * Fecha o menu mobile e restaura o scroll do body
   */
  function fecharMenu() {
    hamburger.classList.remove('ativo');
    navPrincipal.classList.remove('ativo');
    if (navOverlay) navOverlay.classList.remove('ativo');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
}

// ============================================================
// SUBMENUS — Desktop: hover | Mobile: click para expandir
// ============================================================

/**
 * Inicializa os submenus dropdown.
 * No desktop (tela > 1023px): abrem no hover (CSS cuida disso).
 * No mobile: abrem/fecham no click do link pai.
 * @returns {void}
 */
function initSubmenus() {
  const itensComSubmenu = document.querySelectorAll('.nav-item--submenu');

  itensComSubmenu.forEach(item => {
    const trigger = item.querySelector('.nav-link--submenu-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', (e) => {
      // No mobile, o submenu abre por click (não navega)
      const hamburger = document.getElementById('hamburger');
      if (hamburger && window.getComputedStyle(hamburger).display !== 'none') {
        e.preventDefault();
        item.classList.toggle('ativo');

        // Atualiza aria-expanded
        const isAberto = item.classList.contains('ativo');
        trigger.setAttribute('aria-expanded', isAberto);
      }
    });
  });

  // Fecha submenus ao clicar fora (desktop)
  document.addEventListener('click', (e) => {
    itensComSubmenu.forEach(item => {
      if (!item.contains(e.target)) {
        item.classList.remove('ativo');
        const trigger = item.querySelector('.nav-link--submenu-trigger');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

// ============================================================
// SCROLL SUAVE — Para âncoras internas (#secao)
// ============================================================

/**
 * Inicializa o scroll suave para links de âncora interna.
 * Links com href começando em "#" fazem scroll suave até o elemento.
 * @returns {void}
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return; // Ignora links vazios

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        // Calcula o offset do header fixo (aprox. 80px)
        const headerHeight = document.getElementById('header')?.offsetHeight || 80;
        const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ============================================================
// ANIMAÇÕES DE ENTRADA — IntersectionObserver para fade-in
// ============================================================

/**
 * Inicializa as animações de entrada ao scroll.
 * Elementos com atributo data-animate="fade-up" começam invisíveis
 * e ganham a classe .animado quando entram no viewport.
 * @returns {void}
 */
function initAnimateOnScroll() {
  const elementos = document.querySelectorAll('[data-animate]');
  if (elementos.length === 0) return;

  // Configuração do IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Adiciona a classe que dispara a animação
        entry.target.classList.add('animado');
        // Para de observar após animar (anima apenas uma vez)
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,       // viewport
    threshold: 0.15,  // 15% visível já dispara a animação
    rootMargin: '0px 0px -50px 0px' // Margem inferior para antecipar
  });

  // Observa cada elemento com data-animate
  elementos.forEach(el => observer.observe(el));
}

// ============================================================
// CONTADORES ANIMADOS — De 0 até o valor final em 2 segundos
// ============================================================

/**
 * Inicializa os contadores animados.
 * Elementos com classe .numero-item__valor e atributo data-valor
 * contam de 0 até o valor final quando entram no viewport.
 * @returns {void}
 */
function initCounters() {
  const contadores = document.querySelectorAll('.numero-item__valor');
  if (contadores.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const valorFinal = parseInt(el.getAttribute('data-valor'), 10);
        if (isNaN(valorFinal)) return;

        // Animação de contagem
        animarContador(el, 0, valorFinal, 2000);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  contadores.forEach(el => observer.observe(el));
}

/**
 * Anima um número de um valor inicial até o valor final.
 * Usa requestAnimationFrame para fluidez.
 * @param {HTMLElement} elemento - O elemento que exibirá o número
 * @param {number} inicio - Valor inicial (geralmente 0)
 * @param {number} fim - Valor final alvo
 * @param {number} duracao - Duração total da animação em ms
 * @returns {void}
 */
function animarContador(elemento, inicio, fim, duracao) {
  let tempoInicio = null;

  function step(timestamp) {
    if (!tempoInicio) tempoInicio = timestamp;
    const progresso = Math.min((timestamp - tempoInicio) / duracao, 1);

    // Easing: ease-out quad para desacelerar no final
    const easedProgress = 1 - Math.pow(1 - progresso, 3);
    const valorAtual = Math.floor(easedProgress * (fim - inicio) + inicio);

    elemento.textContent = valorAtual;

    if (progresso < 1) {
      requestAnimationFrame(step);
    } else {
      // Garante que o valor final seja exato
      elemento.textContent = fim;
    }
  }

  requestAnimationFrame(step);
}

// ============================================================
// CARROSSEL DE HISTÓRIAS — Automático com controles manuais
// ============================================================

/**
 * Inicializa o carrossel de histórias de adoção.
 * Funcionalidades: auto-play (5s), pausa no hover,
 * setas de navegação e dots indicadores.
 * @returns {void}
 */
function initCarrossel() {
  const carrossel = document.querySelector('.carrossel');
  if (!carrossel) return;

  const trilha = carrossel.querySelector('.carrossel__trilha');
  const slides = carrossel.querySelectorAll('.carrossel__slide');
  const setaEsq = carrossel.querySelector('.carrossel__seta--esq');
  const setaDir = carrossel.querySelector('.carrossel__seta--dir');
  const dotsContainer = carrossel.querySelector('.carrossel__dots');

  if (!trilha || slides.length === 0) return;

  let slideAtual = 0;
  let intervalo = null;
  const INTERVALO_AUTO = 5000; // 5 segundos entre slides

  // Cria dots se o container existir
  if (dotsContainer) {
    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.classList.add('carrossel__dot');
      dot.setAttribute('aria-label', `Ir para história ${index + 1}`);
      if (index === 0) dot.classList.add('ativo');
      dot.addEventListener('click', () => irParaSlide(index));
      dotsContainer.appendChild(dot);
    });
  }

  /**
   * Move o carrossel para o slide especificado
   * @param {number} index - Índice do slide (0-based)
   */
  function irParaSlide(index) {
    slideAtual = index;

    // Move a trilha via translateX
    trilha.style.transform = `translateX(-${slideAtual * 100}%)`;

    // Atualiza dots
    const dots = dotsContainer?.querySelectorAll('.carrossel__dot');
    if (dots) {
      dots.forEach((dot, i) => {
        dot.classList.toggle('ativo', i === slideAtual);
      });
    }
  }

  /**
   * Avança para o próximo slide (circular)
   */
  function proximoSlide() {
    irParaSlide((slideAtual + 1) % slides.length);
  }

  /**
   * Volta para o slide anterior (circular)
   */
  function slideAnterior() {
    irParaSlide((slideAtual - 1 + slides.length) % slides.length);
  }

  // Controles por setas
  if (setaDir) setaDir.addEventListener('click', () => { proximoSlide(); resetarAutoPlay(); });
  if (setaEsq) setaEsq.addEventListener('click', () => { slideAnterior(); resetarAutoPlay(); });

  // Auto-play
  function iniciarAutoPlay() {
    intervalo = setInterval(proximoSlide, INTERVALO_AUTO);
  }

  function pararAutoPlay() {
    clearInterval(intervalo);
  }

  function resetarAutoPlay() {
    pararAutoPlay();
    iniciarAutoPlay();
  }

  // Pausa no hover
  carrossel.addEventListener('mouseenter', pararAutoPlay);
  carrossel.addEventListener('mouseleave', iniciarAutoPlay);

  // Inicia o auto-play
  iniciarAutoPlay();
}

// ============================================================
// BOTÃO VOLTAR AO TOPO — Aparece após 400px de scroll
// ============================================================

/**
 * Inicializa o botão "Voltar ao Topo".
 * Aparece com transição suave após 400px de scroll.
 * Ao clicar, faz scroll suave até o topo da página.
 * @returns {void}
 */
function initBotaoTopo() {
  const btnTopo = document.getElementById('btn-topo');
  if (!btnTopo) return;

  // Mostra/oculta conforme posição do scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btnTopo.classList.add('visivel');
    } else {
      btnTopo.classList.remove('visivel');
    }
  }, { passive: true });

  // Scroll suave ao topo ao clicar
  btnTopo.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// ============================================================
// BOTÃO WHATSAPP FLUTUANTE — Aparece após 2 segundos
// ============================================================

/**
 * Inicializa o botão flutuante de WhatsApp com mensagem inteligente.
 * Detecta a página atual e monta uma mensagem contextualizada.
 * Ex: na página de um animal, menciona o nome dele na mensagem.
 * @returns {void}
 */
function initWhatsApp() {
  const btnWhatsApp = document.getElementById('btn-whatsapp');
  if (!btnWhatsApp) return;

  // Mostra o botão após 2 segundos
  setTimeout(() => {
    btnWhatsApp.classList.add('visivel');
  }, 2000);

  // Detecta a página atual para mensagem contextualizada
  const pagina = window.location.pathname.split('/').pop() || 'index.html';
  let mensagem = 'Olá! Vim pelo site da ONG Paraíso dos Pets e gostaria de mais informações.';

  switch (true) {
    case pagina === 'adote.html':
      mensagem = 'Olá! Estou no site e gostaria de saber sobre os animais disponíveis para adoção.';
      break;
    case pagina === 'doar.html':
      mensagem = 'Olá! Gostaria de saber mais sobre como posso ajudar a ONG com doações.';
      break;
    case pagina === 'voluntario.html':
      mensagem = 'Olá! Tenho interesse em ser voluntário(a) na ONG Paraíso dos Pets.';
      break;
    case pagina === 'ficha-adocao.html':
      // Tenta pegar o nome do animal da URL
      const params = new URLSearchParams(window.location.search);
      const animalId = params.get('animal');
      mensagem = animalId
        ? `Olá! Gostaria de saber mais sobre o processo de adoção. Estou preenchendo a ficha pelo site.`
        : 'Olá! Gostaria de saber mais sobre o processo de adoção.';
      break;
    case pagina === 'contato.html':
      mensagem = 'Olá! Entrei em contato pelo site e gostaria de falar com a equipe.';
      break;
  }

  // Atualiza o link do WhatsApp com a mensagem
  const urlBase = 'https://wa.me/5516999999999';
  btnWhatsApp.href = `${urlBase}?text=${encodeURIComponent(mensagem)}`;
}

/**
 * Abre o WhatsApp com mensagem sobre um animal específico.
 * Usado nos cards de animais (botão compartilhar → WhatsApp).
 * @param {string} nomeAnimal - Nome do animal
 * @param {string} url - URL do animal (para compartilhar)
 */
function whatsAppAnimal(nomeAnimal, url) {
  const mensagem = `Olá! Vi o(a) ${nomeAnimal} no site da ONG Paraíso dos Pets e gostaria de saber mais sobre ele(a)!`;
  window.open(`https://wa.me/5516999999999?text=${encodeURIComponent(mensagem)}`, '_blank');
}

// ============================================================
// TOAST NOTIFICATIONS — Sistema global de feedback visual
// ============================================================

/**
 * Exibe uma notificação toast no canto inferior esquerdo.
 * A notificação fecha automaticamente após 4 segundos ou ao clicar no X.
 *
 * @param {string} mensagem - Texto da notificação
 * @param {string} tipo - Tipo visual: 'sucesso' | 'erro' | 'aviso' | 'info'
 * @returns {void}
 *
 * @example
 * showToast('Mensagem enviada com sucesso!', 'sucesso');
 * showToast('Erro ao enviar formulário', 'erro');
 */
function showToast(mensagem, tipo = 'info') {
  // Garante que o container de toasts existe
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.classList.add('toast-container');
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }

  const icones = {
    sucesso: '✓',
    erro: '!',
    aviso: '⚠',
    info: 'i'
  };

  // Cria o elemento do toast
  const toast = document.createElement('div');
  toast.classList.add('toast', `toast--${tipo}`);
  const icone = document.createElement('span');
  icone.className = 'toast__icone';
  icone.textContent = icones[tipo] || icones.info;

  const texto = document.createElement('span');
  texto.className = 'toast__msg';
  texto.textContent = typeof SafeDOM !== 'undefined'
    ? SafeDOM.toStringValue(mensagem)
    : String(mensagem ?? '');

  const btnFechar = document.createElement('button');
  btnFechar.className = 'toast__fechar';
  btnFechar.setAttribute('aria-label', 'Fechar notificação');
  btnFechar.textContent = '×';

  const barra = document.createElement('div');
  barra.className = 'toast__barra';

  toast.appendChild(icone);
  toast.appendChild(texto);
  toast.appendChild(btnFechar);
  toast.appendChild(barra);

  // Adiciona ao container
  container.appendChild(toast);

  // Botão de fechar manual
  btnFechar.addEventListener('click', () => removerToast(toast));

  // Auto-fechar após 4 segundos
  setTimeout(() => removerToast(toast), 4000);
}

/**
 * Remove um toast com animação de saída
 * @param {HTMLElement} toast - O elemento toast a ser removido
 */
function removerToast(toast) {
  if (!toast || !toast.parentNode) return;

  // Animação de saída
  toast.style.opacity = '0';
  toast.style.transform = 'translateX(-100%)';
  toast.style.transition = 'all 0.3s ease';

  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
}

// ============================================================
// INICIALIZAÇÃO GLOBAL — Executa tudo ao carregar o DOM
// ============================================================

/**
 * Função principal que inicializa todos os componentes globais.
 * Chamada automaticamente quando o DOM estiver pronto.
 * @returns {void}
 */
function initAll() {
  initHeader();
  initHamburger();
  initSubmenus();
  initAccordions();
  initDismissButtons();
  initCopyButtons();
  initScrollButtons();
  initToastTriggers();
  initSmoothScroll();
  initAnimateOnScroll();
  initCounters();
  initCarrossel();
  initBotaoTopo();
  initWhatsApp();
}

// Aguarda o DOM estar completamente carregado
document.addEventListener('DOMContentLoaded', initAll);

function initAccordions() {
  document.querySelectorAll('.accordion__header').forEach((header) => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion__item');
      if (!item) return;
      item.classList.toggle('ativo');
      header.setAttribute('aria-expanded', item.classList.contains('ativo') ? 'true' : 'false');
    });
  });
}

function initDismissButtons() {
  document.querySelectorAll('[data-dismiss-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = document.querySelector(button.dataset.dismissTarget);
      if (target) target.style.display = 'none';
    });
  });
}

function initCopyButtons() {
  document.querySelectorAll('[data-copy-text]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copyText || '');
        showToast(button.dataset.copySuccess || 'Conteúdo copiado!', 'sucesso');
      } catch (error) {
        showToast('Não foi possível copiar.', 'erro');
      }
    });
  });
}

function initScrollButtons() {
  document.querySelectorAll('[data-scroll-target]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const target = document.querySelector(button.dataset.scrollTarget);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

function initToastTriggers() {
  document.querySelectorAll('[data-toast-message]').forEach((element) => {
    element.addEventListener('click', (event) => {
      event.preventDefault();
      showToast(element.dataset.toastMessage || '', element.dataset.toastType || 'info');
    });
  });
}

// ============================================================
// FIM DO ARQUIVO main.js
// ============================================================
