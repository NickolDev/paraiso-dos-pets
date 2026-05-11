// ============================================================
// ARQUIVO: firebase-public.js
// DESCRIÇÃO: Ponte entre o site público e o Firebase.
//            Substitui dados estáticos por dados do Firestore.
//            Conecta formulários ao banco de dados.
//
//            SE Firebase configurado → busca do banco.
//            SE NÃO → mantém dados estáticos originais.
//
// DEPENDÊNCIAS: firebase-config.js (opcional),
//               adote.js, blog.js, transparencia.js, doar.js
// ÚLTIMA ATUALIZAÇÃO: 2025
//
// ÍNDICE DE FUNÇÕES:
//   - initFirebasePublico()       → Detecta e inicializa
//   - carregarAnimaisPublico()    → Substitui ANIMAIS
//   - carregarPostsPublico()      → Substitui POSTS
//   - carregarTransparenciaPubl() → Substitui dados financeiros
//   - carregarConfigPublico()     → Carrega config (meta, PIX)
//   - reRenderizarHome()          → Atualiza home
//   - reRenderizarAdote()         → Atualiza grid de animais
//   - reRenderizarBlog()          → Atualiza grid de posts
//   - reRenderizarTransparencia() → Atualiza gráficos/tabela
//   - reRenderizarDoar()          → Atualiza meta e PIX
//   - conectarFormularios()       → Formulários salvam no Firebase
//   - coletarDadosFicha()         → Coleta campos ficha adoção
//   - coletarDadosVoluntario()    → Coleta campos voluntário
//   - coletarDadosContato()       → Coleta campos contato
// ============================================================

'use strict';

// Flag: Firebase está disponível e configurado?
let firebaseDisponivel = false;

// Cache de configurações
let configPublica = null;

// ============================================================
// DETECÇÃO E INICIALIZAÇÃO
// ============================================================

/**
 * Verifica se Firebase está configurado. Se sim, busca dados.
 * Se não, site continua com arrays estáticos originais.
 */
function initFirebasePublico() {
  // Verifica se Firebase foi carregado
  if (typeof firebase === 'undefined' || typeof db === 'undefined') {
    console.log('🐾 Modo estático (sem Firebase).');
    return;
  }

  // Verifica se config foi preenchida
  if (typeof firebaseConfig !== 'undefined' && firebaseConfig.apiKey === 'SUA_API_KEY_AQUI') {
    console.log('🐾 Firebase não configurado — dados estáticos.');
    return;
  }

  firebaseDisponivel = true;
  console.log('🐾 Firebase conectado — carregando dados...');

  // Detecta página atual e carrega dados necessários
  const pagina = window.location.pathname.split('/').pop() || 'index.html';

  if (pagina === 'index.html' || pagina === '' || pagina === '/') {
    carregarAnimaisPublico().then(reRenderizarHome);
    carregarPostsPublico().then(reRenderizarHome);
    carregarConfigPublico();
    carregarBannerAviso();
    carregarDepoimentosPublico();
  } else if (pagina === 'adote.html') {
    carregarAnimaisPublico().then(reRenderizarAdote);
  } else if (pagina === 'blog.html') {
    carregarPostsPublico().then(reRenderizarBlog);
  } else if (pagina === 'post.html') {
    carregarPostsPublico().then(() => {
      if (typeof carregarPost === 'function') carregarPost();
    });
  } else if (pagina === 'transparencia.html') {
    carregarTransparenciaPublico();
  } else if (pagina === 'doar.html') {
    carregarConfigPublico().then(reRenderizarDoar);
  } else if (pagina === 'ficha-adocao.html') {
    carregarAnimaisPublico().then(() => {
      if (typeof carregarAnimais === 'function') carregarAnimais();
    });
  }
}

// ============================================================
// CARREGAR ANIMAIS
// ============================================================

async function carregarAnimaisPublico() {
  if (!firebaseDisponivel) return;
  try {
    const lista = await buscarAnimais(true);
    if (lista.length > 0 && typeof ANIMAIS !== 'undefined') {
      ANIMAIS.length = 0;
      lista.forEach(a => ANIMAIS.push(a));
      console.log(`  ✅ ${lista.length} animais do Firebase`);
    }
  } catch (e) {
    console.warn('  ⚠️ Erro animais, usando estáticos:', e);
  }
}

// ============================================================
// CARREGAR POSTS
// ============================================================

async function carregarPostsPublico() {
  if (!firebaseDisponivel) return;
  try {
    const lista = await buscarPosts(true);
    if (lista.length > 0 && typeof POSTS !== 'undefined') {
      POSTS.length = 0;
      lista.forEach(p => POSTS.push(p));
      console.log(`  ✅ ${lista.length} posts do Firebase`);
    }
  } catch (e) {
    console.warn('  ⚠️ Erro posts, usando estáticos:', e);
  }
}

// ============================================================
// CARREGAR TRANSPARÊNCIA
// ============================================================

async function carregarTransparenciaPublico() {
  if (!firebaseDisponivel) return;
  try {
    const periodos = await buscarTodosTransparencia();
    if (periodos.length > 0 && typeof DADOS_FINANCEIROS !== 'undefined') {
      Object.keys(DADOS_FINANCEIROS).forEach(k => delete DADOS_FINANCEIROS[k]);
      periodos.forEach(p => { DADOS_FINANCEIROS[p.id] = p; });
      console.log(`  ✅ ${periodos.length} períodos do Firebase`);
      reRenderizarTransparencia();
    }
  } catch (e) {
    console.warn('  ⚠️ Erro transparência, usando estáticos:', e);
  }
}

// ============================================================
// CARREGAR CONFIGURAÇÕES
// ============================================================

async function carregarConfigPublico() {
  if (!firebaseDisponivel) return;
  try {
    configPublica = await buscarConfiguracoes();
    if (configPublica && Object.keys(configPublica).length > 0) {
      console.log('  ✅ Configurações do Firebase');
    }
  } catch (e) {
    console.warn('  ⚠️ Erro configurações:', e);
  }
}

// ============================================================
// RE-RENDERIZAR — HOME
// ============================================================

function reRenderizarHome() {
  // Animais em destaque
  if (typeof ANIMAIS !== 'undefined') {
    const grid = document.getElementById('grid-animais-destaque');
    if (grid && typeof criarCardAnimalHome === 'function') {
      SafeDOM.clear(grid);
      ANIMAIS.filter(a => a.status === 'Disponível').slice(0, 3)
        .forEach(a => grid.appendChild(criarCardAnimalHome(a)));
    }
  }

  // Posts recentes
  if (typeof POSTS !== 'undefined') {
    const grid = document.getElementById('grid-posts-home');
    if (grid && typeof criarCardPostHome === 'function') {
      SafeDOM.clear(grid);
      POSTS.slice(0, 3).forEach(p => grid.appendChild(criarCardPostHome(p)));
    }
  }
}

// ============================================================
// RE-RENDERIZAR — ADOTE
// ============================================================

function reRenderizarAdote() {
  if (typeof ANIMAIS !== 'undefined' && typeof renderAnimais === 'function') {
    const grid = document.getElementById('grid-animais');
    if (grid) {
      renderAnimais(ANIMAIS);
      if (typeof atualizarContadorFav === 'function') atualizarContadorFav();
      if (typeof renderFavoritos === 'function') renderFavoritos();
    }
  }
}

// ============================================================
// RE-RENDERIZAR — BLOG
// ============================================================

function reRenderizarBlog() {
  if (typeof POSTS !== 'undefined' && typeof renderPosts === 'function') {
    const grid = document.getElementById('grid-posts');
    if (grid) {
      renderPosts(POSTS);
      if (typeof renderSidebar === 'function') renderSidebar();
    }
  }
}

// ============================================================
// RE-RENDERIZAR — TRANSPARÊNCIA
// ============================================================

function reRenderizarTransparencia() {
  if (typeof DADOS_FINANCEIROS === 'undefined') return;

  // Atualiza botões de período
  const selector = document.querySelector('.periodo-selector');
  if (selector) {
    SafeDOM.clear(selector);
    Object.keys(DADOS_FINANCEIROS).forEach(key => {
      const d = DADOS_FINANCEIROS[key];
      const btn = document.createElement('button');
      btn.className = 'filtro-btn periodo-btn';
      btn.dataset.periodo = key;
      btn.textContent = d.label || key;
      btn.addEventListener('click', () => {
        if (typeof selecionarPeriodo === 'function') selecionarPeriodo(key);
      });
      selector.appendChild(btn);
    });
    // Ativa o primeiro
    const primeiro = Object.keys(DADOS_FINANCEIROS)[0];
    if (primeiro && typeof selecionarPeriodo === 'function') selecionarPeriodo(primeiro);
  }
}

// ============================================================
// RE-RENDERIZAR — DOAR
// ============================================================

function reRenderizarDoar() {
  if (!configPublica) return;

  if (typeof META_MENSAL !== 'undefined') {
    if (configPublica.metaMensal) META_MENSAL.meta = configPublica.metaMensal;
    if (configPublica.arrecadadoMensal) META_MENSAL.arrecadado = configPublica.arrecadadoMensal;
    if (configPublica.mesMeta) META_MENSAL.mes = configPublica.mesMeta;
    if (typeof animarMeta === 'function') animarMeta();
  }

  // Atualiza chave PIX exibida
  if (configPublica.chavePix) {
    const elChave = document.querySelector('.pix-card__chave');
    const elDisplay = document.getElementById('pix-chave-display');
    if (elChave) elChave.textContent = configPublica.chavePix;
    if (elDisplay) elDisplay.textContent = configPublica.chavePix;
  }

  // Re-atualiza o link do Mercado Pago com a configuração carregada
  if (typeof atualizarLinkMercadoPago === 'function') {
    atualizarLinkMercadoPago(typeof valorSelecionado !== 'undefined' ? valorSelecionado : null);
  }
}

// ============================================================
// ANTI-SPAM — Rate limiting para formulários públicos
// ============================================================

const _formCooldowns = {};

/**
 * Verifica se um formulário pode ser enviado (anti-spam multi-camada).
 *
 * Camada 1: Cooldown em memória (60s) — previne cliques rápidos
 * Camada 2: Cooldown em sessionStorage — persiste entre recargas
 * Camada 3: Firebase App Check (se configurado e enforced no Console)
 *           adiciona um sinal extra ao backend
 *
 * Mesmo que um atacante bypass as camadas 1-2, a proteção real
 * depende das regras do backend e da enforcement de App Check fora do cliente.
 *
 * @param {string} formId - Identificador do formulário
 * @returns {boolean} true se pode enviar
 */
function podeEnviarForm(formId) {
  const agora = Date.now();
  const cooldown = 60000; // 60 segundos

  // Camada 1: Memory cooldown
  const ultimoMemoria = _formCooldowns[formId] || 0;
  if (agora - ultimoMemoria < cooldown) {
    const restante = Math.ceil((cooldown - (agora - ultimoMemoria)) / 1000);
    if (typeof showToast === 'function') {
      showToast('Aguarde ' + restante + ' segundos antes de enviar novamente.', 'aviso');
    }
    return false;
  }

  // Camada 2: SessionStorage cooldown (persiste entre recargas da página)
  try {
    const storageKey = '_formCooldown_' + formId;
    const ultimoStorage = parseInt(sessionStorage.getItem(storageKey) || '0', 10);
    if (agora - ultimoStorage < cooldown) {
      const restante = Math.ceil((cooldown - (agora - ultimoStorage)) / 1000);
      if (typeof showToast === 'function') {
        showToast('Aguarde ' + restante + ' segundos antes de enviar novamente.', 'aviso');
      }
      return false;
    }
    sessionStorage.setItem(storageKey, String(agora));
  } catch (e) {
    // sessionStorage indisponível (modo privado) — continua com camada 1
  }

  // Camada 3: App Check só ajuda quando a enforcement foi ligada
  // no Firebase Console. O cliente sozinho não é uma barreira.

  _formCooldowns[formId] = agora;
  return true;
}

// ============================================================
// CONECTAR FORMULÁRIOS AO FIREBASE
// ============================================================

/**
 * Intercepta o envio dos formulários públicos e salva no Firebase
 * em vez de apenas simular. Mantém o comportamento visual.
 */
function conectarFormularios() {
  if (!firebaseDisponivel) return;

  // --- FICHA DE ADOÇÃO ---
  const btnFicha = document.getElementById('btn-enviar');
  if (btnFicha && btnFicha.closest('#form-adocao')) {
    // Remove o listener original e adiciona o novo
    const novoBtnFicha = btnFicha.cloneNode(true);
    btnFicha.parentNode.replaceChild(novoBtnFicha, btnFicha);
    novoBtnFicha.id = 'btn-enviar';

    novoBtnFicha.addEventListener('click', async (e) => {
      e.preventDefault();
      if (typeof validarEtapa === 'function' && !validarEtapa(3)) return;
      if (!podeEnviarForm('ficha')) return;

      novoBtnFicha.classList.add('btn-loading');
      novoBtnFicha.disabled = true;

      try {
        const dados = coletarDadosFicha();
        const id = await salvarFichaAdocao(dados);
        if (id) {
          const form = document.getElementById('form-adocao');
          const sucesso = document.getElementById('mensagem-sucesso');
          if (form) form.style.display = 'none';
          if (sucesso) { sucesso.style.display = 'block'; sucesso.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
          if (typeof showToast === 'function') showToast('Ficha enviada com sucesso!', 'sucesso');
        }
      } catch (erro) {
        if (typeof showToast === 'function') showToast('Erro ao enviar. Tente novamente.', 'erro');
      } finally {
        novoBtnFicha.classList.remove('btn-loading');
        novoBtnFicha.disabled = false;
      }
    });
  }

  // --- VOLUNTÁRIO ---
  const btnVol = document.getElementById('btn-enviar-voluntario');
  if (btnVol) {
    const novoBtnVol = btnVol.cloneNode(true);
    btnVol.parentNode.replaceChild(novoBtnVol, btnVol);
    novoBtnVol.id = 'btn-enviar-voluntario';

    novoBtnVol.addEventListener('click', async (e) => {
      e.preventDefault();
      if (typeof validarFormVoluntario === 'function' && !validarFormVoluntario()) {
        if (typeof showToast === 'function') showToast('Corrija os campos.', 'erro');
        return;
      }
      if (!podeEnviarForm('voluntario')) return;

      novoBtnVol.classList.add('btn-loading');
      novoBtnVol.disabled = true;

      try {
        const dados = coletarDadosVoluntario();
        const id = await salvarVoluntario(dados);
        if (id) {
          const form = document.getElementById('form-voluntario');
          const sucesso = document.getElementById('voluntario-sucesso');
          if (form) form.style.display = 'none';
          if (sucesso) { sucesso.style.display = 'block'; sucesso.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
          if (typeof showToast === 'function') showToast('Cadastro enviado com sucesso!', 'sucesso');
        }
      } catch (erro) {
        if (typeof showToast === 'function') showToast('Erro ao enviar.', 'erro');
      } finally {
        novoBtnVol.classList.remove('btn-loading');
        novoBtnVol.disabled = false;
      }
    });
  }

  // --- CONTATO ---
  const btnContato = document.getElementById('btn-enviar-contato');
  if (btnContato) {
    const novoBtnContato = btnContato.cloneNode(true);
    btnContato.parentNode.replaceChild(novoBtnContato, btnContato);
    novoBtnContato.id = 'btn-enviar-contato';

    novoBtnContato.addEventListener('click', async (e) => {
      e.preventDefault();

      const form = document.getElementById('form-contato');
      if (!form) return;

      let valido = true;
      form.querySelectorAll('[required]').forEach(campo => {
        if (campo.type === 'checkbox' && !campo.checked) valido = false;
        else if (typeof validarCampoContato === 'function' && !validarCampoContato(campo)) valido = false;
      });

      if (!valido) {
        if (typeof showToast === 'function') showToast('Corrija os campos.', 'erro');
        return;
      }
      if (!podeEnviarForm('contato')) return;

      novoBtnContato.classList.add('btn-loading');
      novoBtnContato.disabled = true;

      try {
        const dados = coletarDadosContato();
        const id = await salvarMensagem(dados);
        if (id) {
          if (typeof showToast === 'function') showToast('Mensagem enviada com sucesso!', 'sucesso');
          form.reset();
          form.querySelectorAll('.valido').forEach(c => c.classList.remove('valido'));
          if (typeof verificarFormValido === 'function') verificarFormValido();
        }
      } catch (erro) {
        if (typeof showToast === 'function') showToast('Erro ao enviar.', 'erro');
      } finally {
        novoBtnContato.classList.remove('btn-loading');
        novoBtnContato.disabled = false;
      }
    });
  }
}

// ============================================================
// COLETAR DADOS DOS FORMULÁRIOS
// ============================================================

function coletarDadosFicha() {
  const v = (id) => document.getElementById(id)?.value?.trim() || '';
  const r = (name) => document.querySelector(`input[name="${name}"]:checked`)?.value || '';
  return {
    nomeCompleto: v('nome-completo'), cpf: v('cpf'), nascimento: v('nascimento'),
    email: v('email'), whatsapp: v('whatsapp'), cidade: v('cidade'), estado: v('estado'),
    endereco: v('endereco'), tipoMoradia: r('tipo-moradia'), quintal: r('quintal'),
    criancas: r('criancas'), outrosAnimais: r('outros-animais'),
    outrosAnimaisDesc: v('outros-animais-desc'), tipoMoradiaPosse: r('tipo-moradia-posse'),
    proprietarioPermite: r('proprietario-permite'), qtdMoradores: v('qtd-moradores'),
    alergia: r('alergia'), animalInteresse: v('animal-interesse'),
    motivacaoAdocao: v('motivacao-adocao'), experienciaPet: r('experiencia-pet'),
    viagemPet: v('viagem-pet')
  };
}

function coletarDadosVoluntario() {
  const v = (id) => document.getElementById(id)?.value?.trim() || '';
  const dias = []; document.querySelectorAll('input[name="dias[]"]:checked').forEach(cb => dias.push(cb.value));
  const turnos = []; document.querySelectorAll('input[name="turnos[]"]:checked').forEach(cb => turnos.push(cb.value));
  const habilidades = []; document.querySelectorAll('input[name="habilidades[]"]:checked').forEach(cb => habilidades.push(cb.value));
  return {
    nome: v('vol-nome'), email: v('vol-email'), whatsapp: v('vol-whatsapp'),
    cidade: v('vol-cidade'), dias, turnos, habilidades,
    habilidadeOutro: document.querySelector('input[name="habilidade-outro"]')?.value?.trim() || '',
    motivacao: v('vol-motivacao'), comoConheceu: v('vol-como-conheceu')
  };
}

function coletarDadosContato() {
  const v = (id) => document.getElementById(id)?.value?.trim() || '';
  return {
    nome: v('contato-nome'), email: v('contato-email'),
    telefone: v('contato-telefone'), assunto: v('contato-assunto'),
    mensagem: v('contato-mensagem')
  };
}

// ============================================================
// CARREGAR DEPOIMENTOS (Home — Carrossel)
// ============================================================

/**
 * Carrega depoimentos do Firebase e popula o carrossel na home.
 */
async function carregarDepoimentosPublico() {
  if (!firebaseDisponivel) return;

  try {
    const snapshot = await db.collection(typeof COLECOES !== 'undefined' ? COLECOES.DEPOIMENTOS : 'depoimentos').orderBy('criadoEm', 'desc').get();
    const deps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (deps.length === 0) return; // Mantém mensagem "em breve"

    const trilha = document.getElementById('carrossel-trilha');
    const vazio = document.getElementById('carrossel-vazio');
    if (!trilha) return;

    // Remove mensagem vazia
    if (vazio) vazio.remove();

    SafeDOM.clear(trilha);
    deps.forEach((dep) => {
      const slide = SafeDOM.el('div', { className: 'carrossel__slide' }, [
        SafeDOM.el('div', { className: 'carrossel__aspas', text: '"' })
      ]);

      if (dep.foto) {
        const foto = SafeDOM.el('img', {
          className: 'carrossel__foto',
          attrs: { alt: dep.animal || dep.autor || 'Depoimento' }
        });
        SafeDOM.setImageSource(foto, dep.foto, { fallback: 'images/logo-300.png', allowRelative: true });
        slide.appendChild(foto);
      }

      slide.appendChild(SafeDOM.el('p', { className: 'carrossel__texto', text: dep.texto || '' }));
      slide.appendChild(SafeDOM.el('p', { className: 'carrossel__autor', text: dep.autor || '' }));
      if (dep.data) {
        slide.appendChild(SafeDOM.el('p', { className: 'carrossel__data', text: dep.data }));
      }

      trilha.appendChild(slide);
    });

    // Re-inicializa o carrossel (recalcula slides)
    if (typeof initCarrossel === 'function') {
      setTimeout(initCarrossel, 100);
    }

    console.log(`  ✅ ${deps.length} depoimentos carregados`);
  } catch (e) {
    console.warn('  ⚠️ Erro ao carregar depoimentos:', e);
  }
}

// ============================================================
// CARREGAR BANNER DE AVISO (Home)
// ============================================================

/**
 * Carrega o banner de aviso/destaque do Firebase.
 * Coleção "configuracoes", documento "banner".
 * Campos: ativo (bool), texto (string), icone (string), link (string), linkTexto (string)
 */
async function carregarBannerAviso() {
  if (!firebaseDisponivel) return;

  try {
    const doc = await db.collection('configuracoes').doc('banner').get();
    if (!doc.exists) return;

    const dados = doc.data();
    if (!dados.ativo || !dados.texto) return;

    const bannerEl = document.getElementById('banner-aviso');
    const textoEl = document.getElementById('banner-aviso-texto');
    const iconeEl = document.getElementById('banner-aviso-icone');
    const linkEl = document.getElementById('banner-aviso-link');

    if (!bannerEl || !textoEl) return;

    textoEl.textContent = dados.texto;
    if (iconeEl && dados.icone) iconeEl.textContent = dados.icone;
    if (linkEl) {
      const safeLink = SafeDOM.safeURL(dados.link || '', { allowRelative: true, allowHash: true });
      if (safeLink) {
        linkEl.href = safeLink;
        linkEl.textContent = dados.linkTexto || 'Saiba mais';
        linkEl.style.display = 'inline';
      } else {
        linkEl.removeAttribute('href');
        linkEl.style.display = 'none';
      }
    }

    bannerEl.style.display = 'block';
    console.log('  ✅ Banner de aviso ativo');
  } catch (e) {
    // Silencioso — banner é opcional
  }
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initFirebasePublico();
    conectarFormularios();
  }, 100);
});

// ============================================================
// FIM DO ARQUIVO firebase-public.js
// ============================================================
