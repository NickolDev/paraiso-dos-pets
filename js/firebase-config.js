// ============================================================
// ARQUIVO: firebase-config.js
// DESCRIÇÃO: Configuração e inicialização do Firebase para o
//            site da ONG Paraíso dos Pets. Este arquivo é
//            carregado em TODAS as páginas que precisam de
//            dados do banco (site público + painel admin).
//
// SERVIÇOS UTILIZADOS:
//   - Firestore  → Banco de dados (animais, posts, fichas, etc.)
//   - Auth       → Autenticação (login do admin)
//   - Storage    → Armazenamento de fotos dos animais
//
// COMO CONFIGURAR:
//   1. Crie um projeto no Firebase Console (console.firebase.google.com)
//   2. Copie as credenciais do seu projeto
//   3. Substitua os valores em firebaseConfig abaixo
//   4. Veja o arquivo FIREBASE-SETUP.txt para instruções detalhadas
//
// ÚLTIMA ATUALIZAÇÃO: 2025
// ============================================================

'use strict';

// ============================================================
// CONFIGURAÇÃO DO FIREBASE — SUBSTITUA PELOS SEUS DADOS
//
// Estes valores são encontrados no Firebase Console:
//   Projeto → Configurações → Configuração do SDK
//
// ⚠️  IMPORTANTE: Estas credenciais são PÚBLICAS por design.
//     A segurança do Firebase NÃO depende de esconder estas
//     chaves — ela é feita pelas Security Rules do Firestore
//     e pelas regras de autenticação. Pode deixar no código.
// ============================================================

const firebaseConfig = {

  apiKey: "AIzaSyCvMgH5I9RCvWUwOkPgZLRwf7-AsMw_sIA",
  authDomain: "paraiso-dos-pets-a5a08.firebaseapp.com",
  projectId: "paraiso-dos-pets-a5a08",
  storageBucket: "paraiso-dos-pets-a5a08.firebasestorage.app",
  messagingSenderId: "158247605744",
  appId: "1:158247605744:web:5e8f7986c6bbf818577935",
  measurementId: "G-1D9CDVEHB5"

};





// ============================================================
// INICIALIZAÇÃO DO FIREBASE
// Os SDKs são carregados via CDN no HTML antes deste arquivo.
// Usamos o modo "compat" para compatibilidade com script tags.
// ============================================================

// Inicializa o app Firebase
firebase.initializeApp(firebaseConfig);

// Referências aos serviços compartilhados
const db = typeof firebase.firestore === 'function' ? firebase.firestore() : null;
let auth = null;
let storage = null;

function registerAdminFirebaseServices(services = {}) {
  auth = services.authService || null;
  storage = services.storageService || null;
}

window.registerAdminFirebaseServices = registerAdminFirebaseServices;

// ============================================================
// CONFIGURAÇÃO DO FIRESTORE — Habilita cache offline
// Permite que o site funcione mesmo com conexão instável
// ============================================================

if (db && typeof db.enablePersistence === 'function') {
  db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firebase: persistência offline disponível apenas em uma aba.');
    } else if (err.code === 'unimplemented') {
      console.warn('Firebase: navegador não suporta persistência offline.');
    }
  });
}

// ============================================================
// NOMES DAS COLEÇÕES NO FIRESTORE
// Centralizados aqui para facilitar manutenção.
// Se precisar renomear uma coleção, mude apenas aqui.
// ============================================================

const COLECOES = {
  ANIMAIS:        'animais',        // Dados dos animais para adoção
  POSTS:          'posts',          // Posts do blog
  FICHAS_ADOCAO:  'fichas_adocao',  // Fichas de interesse em adoção
  VOLUNTARIOS:    'voluntarios',    // Cadastros de voluntários
  MENSAGENS:      'mensagens',      // Mensagens de contato
  TRANSPARENCIA:  'transparencia',  // Dados financeiros
  CONFIGURACOES:  'configuracoes',  // Configurações gerais do site
  DOADORES:       'doadores',       // Mural de doadores
  GALERIA:        'galeria',        // Fotos da galeria do abrigo
  DEPOIMENTOS:    'depoimentos'     // Depoimentos de adotantes
};

// ============================================================
// FUNÇÕES AUXILIARES — ANIMAIS
// ============================================================

/**
 * Busca todos os animais do banco de dados.
 * @param {boolean} apenasPublicos - Se true, retorna apenas Disponível/Reservado/Em Tratamento
 * @returns {Promise<Array>} Array de objetos de animais
 */
async function buscarAnimais(apenasPublicos = true) {
  try {
    let query = db.collection(COLECOES.ANIMAIS).orderBy('criadoEm', 'desc');

    // No site público, não mostra animais adotados
    if (apenasPublicos) {
      query = query.where('status', 'in', ['Disponível', 'Reservado', 'Em Tratamento']);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (erro) {
    console.error('Erro ao buscar animais:', erro);
    return [];
  }
}

/**
 * Busca um animal específico pelo ID.
 * @param {string} id - ID do documento no Firestore
 * @returns {Promise<Object|null>} Dados do animal ou null
 */
async function buscarAnimalPorId(id) {
  try {
    const doc = await db.collection(COLECOES.ANIMAIS).doc(id).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (erro) {
    console.error('Erro ao buscar animal:', erro);
    return null;
  }
}

/**
 * Verifica se o usuário está autenticado (admin).
 * Dupla proteção: além das Firestore Rules, o código JS também verifica.
 * @returns {boolean} true se autenticado
 */
function verificarAdmin() {
  if (!auth || !auth.currentUser) {
    console.error('❌ Ação bloqueada: usuário não autenticado.');
    return false;
  }
  return true;
}

/**
 * Salva um novo animal ou atualiza um existente.
 * @param {Object} dados - Dados do animal
 * @param {string|null} id - ID do animal (null para novo)
 * @returns {Promise<string|null>} ID do documento salvo ou null
 */
async function salvarAnimal(dados, id = null) {
  if (!verificarAdmin()) return null;
  try {
    // Adiciona timestamp
    dados.atualizadoEm = firebase.firestore.FieldValue.serverTimestamp();

    if (id) {
      // Atualiza animal existente
      await db.collection(COLECOES.ANIMAIS).doc(id).update(dados);
      return id;
    } else {
      // Cria novo animal
      dados.criadoEm = firebase.firestore.FieldValue.serverTimestamp();
      const docRef = await db.collection(COLECOES.ANIMAIS).add(dados);
      return docRef.id;
    }
  } catch (erro) {
    console.error('Erro ao salvar animal:', erro);
    return null;
  }
}

/**
 * Remove um animal do banco de dados.
 * @param {string} id - ID do documento
 * @returns {Promise<boolean>} true se removido com sucesso
 */
async function removerAnimal(id) {
  if (!verificarAdmin()) return false;
  try {
    await db.collection(COLECOES.ANIMAIS).doc(id).delete();
    return true;
  } catch (erro) {
    console.error('Erro ao remover animal:', erro);
    return false;
  }
}

// ============================================================
// FUNÇÕES AUXILIARES — POSTS DO BLOG
// ============================================================

/**
 * Busca todos os posts do blog.
 * @param {boolean} apenasPublicados - Se true, retorna apenas posts publicados
 * @returns {Promise<Array>} Array de posts
 */
async function buscarPosts(apenasPublicados = true) {
  try {
    let query = db.collection(COLECOES.POSTS).orderBy('data', 'desc');

    if (apenasPublicados) {
      query = query.where('publicado', '==', true);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (erro) {
    console.error('Erro ao buscar posts:', erro);
    return [];
  }
}

/**
 * Busca um post específico pelo ID.
 * @param {string} id - ID do documento
 * @returns {Promise<Object|null>} Dados do post ou null
 */
async function buscarPostPorId(id) {
  try {
    const doc = await db.collection(COLECOES.POSTS).doc(id).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (erro) {
    console.error('Erro ao buscar post:', erro);
    return null;
  }
}

/**
 * Salva um novo post ou atualiza um existente.
 * @param {Object} dados - Dados do post
 * @param {string|null} id - ID do post (null para novo)
 * @returns {Promise<string|null>} ID do documento ou null
 */
async function salvarPost(dados, id = null) {
  if (!verificarAdmin()) return null;
  try {
    dados.atualizadoEm = firebase.firestore.FieldValue.serverTimestamp();

    if (id) {
      await db.collection(COLECOES.POSTS).doc(id).update(dados);
      return id;
    } else {
      dados.criadoEm = firebase.firestore.FieldValue.serverTimestamp();
      const docRef = await db.collection(COLECOES.POSTS).add(dados);
      return docRef.id;
    }
  } catch (erro) {
    console.error('Erro ao salvar post:', erro);
    return null;
  }
}

/**
 * Remove um post do banco de dados.
 * @param {string} id - ID do documento
 * @returns {Promise<boolean>}
 */
async function removerPost(id) {
  if (!verificarAdmin()) return false;
  try {
    await db.collection(COLECOES.POSTS).doc(id).delete();
    return true;
  } catch (erro) {
    console.error('Erro ao remover post:', erro);
    return false;
  }
}

// ============================================================
// FUNÇÕES AUXILIARES — FORMULÁRIOS (Fichas, Voluntários, Mensagens)
// ============================================================

/**
 * Salva uma ficha de adoção no banco de dados.
 * @param {Object} dados - Dados da ficha preenchida
 * @returns {Promise<string|null>} ID do documento ou null
 */
async function salvarFichaAdocao(dados) {
  try {
    // Whitelist de campos aceitos (anti-injection)
    const camposPermitidos = ['nomeCompleto','cpf','nascimento','email','whatsapp','cidade','estado',
      'endereco','tipoMoradia','quintal','criancas','outrosAnimais','outrosAnimaisDesc',
      'tipoMoradiaPosse','proprietarioPermite','qtdMoradores','alergia',
      'animalInteresse','motivacaoAdocao','experienciaPet','viagemPet'];
    const dadosLimpos = {};
    for (const campo of camposPermitidos) {
      if (dados[campo] !== undefined) {
        dadosLimpos[campo] = typeof dados[campo] === 'string'
          ? dados[campo].substring(0, 1000) : dados[campo];
      }
    }
    dadosLimpos.criadoEm = firebase.firestore.FieldValue.serverTimestamp();
    dadosLimpos.status = 'Pendente';
    dadosLimpos.lido = false;
    const docRef = await db.collection(COLECOES.FICHAS_ADOCAO).add(dadosLimpos);
    return docRef.id;
  } catch (erro) {
    console.error('Erro ao salvar ficha de adoção:', erro);
    return null;
  }
}

/**
 * Busca todas as fichas de adoção.
 * @returns {Promise<Array>}
 */
async function buscarFichasAdocao() {
  try {
    const snapshot = await db.collection(COLECOES.FICHAS_ADOCAO)
      .orderBy('criadoEm', 'desc')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (erro) {
    console.error('Erro ao buscar fichas:', erro);
    return [];
  }
}

/**
 * Atualiza o status de uma ficha de adoção.
 * @param {string} id - ID da ficha
 * @param {string} status - Novo status (Pendente/Em Análise/Aprovada/Recusada)
 * @returns {Promise<boolean>}
 */
async function atualizarStatusFicha(id, status) {
  if (!verificarAdmin()) return false;
  try {
    await db.collection(COLECOES.FICHAS_ADOCAO).doc(id).update({
      status: status,
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });
    return true;
  } catch (erro) {
    console.error('Erro ao atualizar ficha:', erro);
    return false;
  }
}

/**
 * Salva um cadastro de voluntário.
 * @param {Object} dados - Dados do formulário
 * @returns {Promise<string|null>}
 */
async function salvarVoluntario(dados) {
  try {
    // Whitelist de campos aceitos (anti-injection)
    const camposPermitidos = ['nome','email','whatsapp','cidade','dias','turnos',
      'habilidades','habilidadeOutro','motivacao','comoConheceu'];
    const dadosLimpos = {};
    for (const campo of camposPermitidos) {
      if (dados[campo] !== undefined) {
        if (typeof dados[campo] === 'string') {
          dadosLimpos[campo] = dados[campo].substring(0, 1000);
        } else if (Array.isArray(dados[campo])) {
          dadosLimpos[campo] = dados[campo].map(v => typeof v === 'string' ? v.substring(0, 200) : v).slice(0, 20);
        } else {
          dadosLimpos[campo] = dados[campo];
        }
      }
    }
    dadosLimpos.criadoEm = firebase.firestore.FieldValue.serverTimestamp();
    dadosLimpos.status = 'Novo';
    dadosLimpos.lido = false;
    const docRef = await db.collection(COLECOES.VOLUNTARIOS).add(dadosLimpos);
    return docRef.id;
  } catch (erro) {
    console.error('Erro ao salvar voluntário:', erro);
    return null;
  }
}

/**
 * Busca todos os cadastros de voluntários.
 * @returns {Promise<Array>}
 */
async function buscarVoluntarios() {
  try {
    const snapshot = await db.collection(COLECOES.VOLUNTARIOS)
      .orderBy('criadoEm', 'desc')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (erro) {
    console.error('Erro ao buscar voluntários:', erro);
    return [];
  }
}

/**
 * Salva uma mensagem de contato.
 * @param {Object} dados - Dados do formulário
 * @returns {Promise<string|null>}
 */
async function salvarMensagem(dados) {
  try {
    const camposPermitidos = ['nome','email','telefone','assunto','mensagem'];
    const dadosLimpos = {};
    for (const campo of camposPermitidos) {
      if (dados[campo] !== undefined) {
        dadosLimpos[campo] = typeof dados[campo] === 'string'
          ? dados[campo].substring(0, 2000) : dados[campo];
      }
    }
    dadosLimpos.criadoEm = firebase.firestore.FieldValue.serverTimestamp();
    dadosLimpos.status = 'Não lida';
    dadosLimpos.lido = false;
    const docRef = await db.collection(COLECOES.MENSAGENS).add(dadosLimpos);
    return docRef.id;
  } catch (erro) {
    console.error('Erro ao salvar mensagem:', erro);
    return null;
  }
}

/**
 * Busca todas as mensagens de contato.
 * @returns {Promise<Array>}
 */
async function buscarMensagens() {
  try {
    const snapshot = await db.collection(COLECOES.MENSAGENS)
      .orderBy('criadoEm', 'desc')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (erro) {
    console.error('Erro ao buscar mensagens:', erro);
    return [];
  }
}

/**
 * Marca uma mensagem como lida/respondida.
 * @param {string} id - ID da mensagem
 * @param {string} status - Novo status
 * @returns {Promise<boolean>}
 */
async function atualizarStatusMensagem(id, status) {
  if (!verificarAdmin()) return false;
  try {
    await db.collection(COLECOES.MENSAGENS).doc(id).update({
      status: status,
      lido: true,
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });
    return true;
  } catch (erro) {
    console.error('Erro ao atualizar mensagem:', erro);
    return false;
  }
}

// ============================================================
// FUNÇÕES AUXILIARES — TRANSPARÊNCIA FINANCEIRA
// ============================================================

/**
 * Busca os dados financeiros de um período.
 * @param {string} periodo - ID do período (ex: '2025-1')
 * @returns {Promise<Object|null>}
 */
async function buscarTransparencia(periodo) {
  try {
    const doc = await db.collection(COLECOES.TRANSPARENCIA).doc(periodo).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (erro) {
    console.error('Erro ao buscar transparência:', erro);
    return null;
  }
}

/**
 * Busca todos os períodos de transparência.
 * @returns {Promise<Array>}
 */
async function buscarTodosTransparencia() {
  try {
    const snapshot = await db.collection(COLECOES.TRANSPARENCIA).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (erro) {
    console.error('Erro ao buscar transparência:', erro);
    return [];
  }
}

/**
 * Salva dados de transparência para um período.
 * @param {string} periodo - ID do período
 * @param {Object} dados - Dados financeiros
 * @returns {Promise<boolean>}
 */
async function salvarTransparencia(periodo, dados) {
  if (!verificarAdmin()) return false;
  try {
    dados.atualizadoEm = firebase.firestore.FieldValue.serverTimestamp();
    await db.collection(COLECOES.TRANSPARENCIA).doc(periodo).set(dados, { merge: true });
    return true;
  } catch (erro) {
    console.error('Erro ao salvar transparência:', erro);
    return false;
  }
}

// ============================================================
// FUNÇÕES AUXILIARES — CONFIGURAÇÕES DO SITE
// ============================================================

/**
 * Busca as configurações gerais do site.
 * @returns {Promise<Object>} Configurações ou objeto vazio
 */
async function buscarConfiguracoes() {
  try {
    const doc = await db.collection(COLECOES.CONFIGURACOES).doc('geral').get();
    if (doc.exists) {
      return doc.data();
    }
    return {};
  } catch (erro) {
    console.error('Erro ao buscar configurações:', erro);
    return {};
  }
}

/**
 * Salva configurações gerais do site.
 * @param {Object} dados - Dados de configuração
 * @returns {Promise<boolean>}
 */
async function salvarConfiguracoes(dados) {
  if (!verificarAdmin()) return false;
  try {
    dados.atualizadoEm = firebase.firestore.FieldValue.serverTimestamp();
    await db.collection(COLECOES.CONFIGURACOES).doc('geral').set(dados, { merge: true });
    return true;
  } catch (erro) {
    console.error('Erro ao salvar configurações:', erro);
    return false;
  }
}

// ============================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================

/**
 * Formata um Timestamp do Firestore para string legível.
 * @param {Object} timestamp - Timestamp do Firestore
 * @returns {string} Data formatada (ex: "24/06/2025 às 14:30")
 */
function formatarTimestamp(timestamp) {
  if (!timestamp || !timestamp.toDate) return '—';
  const data = timestamp.toDate();
  return data.toLocaleDateString('pt-BR') + ' às ' +
         data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Formata um Timestamp para data curta.
 * @param {Object} timestamp - Timestamp do Firestore
 * @returns {string} Data formatada (ex: "24/06/2025")
 */
function formatarData(timestamp) {
  if (!timestamp || !timestamp.toDate) return '—';
  return timestamp.toDate().toLocaleDateString('pt-BR');
}

/**
 * Conta documentos em uma coleção com filtro opcional.
 * @param {string} colecao - Nome da coleção
 * @param {string} campo - Campo para filtrar (opcional)
 * @param {*} valor - Valor do filtro (opcional)
 * @returns {Promise<number>}
 */
async function contarDocumentos(colecao, campo = null, valor = null) {
  try {
    let query = db.collection(colecao);
    if (campo && valor !== null) {
      query = query.where(campo, '==', valor);
    }
    const snapshot = await query.get();
    return snapshot.size;
  } catch (erro) {
    console.error('Erro ao contar documentos:', erro);
    return 0;
  }
}

// ============================================================
// LOG — Mensagem de confirmação no console
// ============================================================

console.log('%c🐾 Firebase conectado — ONG Paraíso dos Pets',
  'color: #00B4B4; font-weight: bold; font-size: 14px;');

// ============================================================
// FIM DO ARQUIVO firebase-config.js
// ============================================================
