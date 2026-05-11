// ============================================================
// ARQUIVO: email-notificacao.js
// DESCRIÇÃO: Integração com EmailJS para enviar notificações
//            por email automaticamente quando formulários são
//            preenchidos no site (ficha de adoção, voluntário,
//            contato). A ONG recebe o email na hora.
//
// COMO CONFIGURAR O EMAILJS:
//   1. Acesse https://www.emailjs.com
//   2. Crie uma conta gratuita (200 emails/mês grátis)
//   3. Conecte seu email (Gmail da ONG)
//   4. Crie 3 templates (instruções abaixo)
//   5. Copie os IDs e cole nas variáveis abaixo
//   6. Pronto! Os emails serão enviados automaticamente.
//
// TEMPLATES NECESSÁRIOS NO EMAILJS:
//
//   Template 1: "nova_ficha_adocao"
//     Assunto: Nova ficha de adoção — {{nome}}
//     Corpo:
//       Uma nova ficha de adoção foi recebida!
//       Nome: {{nome}}
//       Email: {{email}}
//       WhatsApp: {{whatsapp}}
//       Animal de interesse: {{animal}}
//       Data: {{data}}
//       Acesse o painel admin para ver os detalhes completos.
//
//   Template 2: "novo_voluntario"
//     Assunto: Novo voluntário cadastrado — {{nome}}
//     Corpo:
//       Um novo voluntário se cadastrou!
//       Nome: {{nome}}
//       Email: {{email}}
//       WhatsApp: {{whatsapp}}
//       Habilidades: {{habilidades}}
//       Data: {{data}}
//       Acesse o painel admin para ver os detalhes completos.
//
//   Template 3: "nova_mensagem"
//     Assunto: Nova mensagem de contato — {{assunto}}
//     Corpo:
//       Uma nova mensagem foi recebida!
//       Nome: {{nome}}
//       Email: {{email}}
//       Assunto: {{assunto}}
//       Mensagem: {{mensagem}}
//       Data: {{data}}
//       Acesse o painel admin para responder.
//
// DEPENDÊNCIAS: EmailJS SDK (carregado via CDN no HTML)
// ÚLTIMA ATUALIZAÇÃO: 2025
// ============================================================

'use strict';

// ============================================================
// CONFIGURAÇÃO DO EMAILJS — SUBSTITUA PELOS SEUS IDs
//
// Encontre esses valores no painel do EmailJS:
//   Service ID: EmailJS → Email Services → seu serviço
//   Template IDs: EmailJS → Email Templates → cada template
//   Public Key: EmailJS → Account → API Keys → Public Key
// ============================================================

const EMAIL_CONFIG = {
  // Chave pública do EmailJS (Account → API Keys)
  publicKey: 'SUA_PUBLIC_KEY_AQUI',    // Ex: 'a1B2c3D4e5F6g7H8i'

  // ID do serviço de email (Email Services)
  serviceId: 'SEU_SERVICE_ID_AQUI',    // Ex: 'service_paraiso'

  // IDs dos templates de email (Email Templates)
  templateFicha:     'SEU_TEMPLATE_FICHA_AQUI',      // Ex: 'template_ficha'
  templateVoluntario: 'SEU_TEMPLATE_VOLUNTARIO_AQUI', // Ex: 'template_voluntario'
  templateMensagem:  'SEU_TEMPLATE_MENSAGEM_AQUI'     // Ex: 'template_mensagem'
};

// Flag: EmailJS está configurado?
let emailJSDisponivel = false;

// ============================================================
// INICIALIZAÇÃO DO EMAILJS
// ============================================================

/**
 * Inicializa o EmailJS com a chave pública.
 * Chamado automaticamente quando o DOM carrega.
 */
function initEmailJS() {
  // Verifica se o SDK do EmailJS foi carregado
  if (typeof emailjs === 'undefined') {
    console.log('📧 EmailJS não carregado — emails desativados.');
    return;
  }

  // Verifica se a config foi preenchida
  if (EMAIL_CONFIG.publicKey === 'SUA_PUBLIC_KEY_AQUI') {
    console.log('📧 EmailJS não configurado — emails desativados.');
    return;
  }

  // Inicializa o SDK
  emailjs.init(EMAIL_CONFIG.publicKey);
  emailJSDisponivel = true;
  console.log('📧 EmailJS ativado — notificações por email habilitadas.');
}

// ============================================================
// ENVIAR NOTIFICAÇÃO — FICHA DE ADOÇÃO
// ============================================================

/**
 * Envia email notificando a ONG sobre nova ficha de adoção.
 * @param {Object} dados - Dados da ficha preenchida
 * @returns {Promise<boolean>} true se enviou com sucesso
 */
async function notificarFichaAdocao(dados) {
  if (!emailJSDisponivel) return false;

  try {
    const parametros = {
      nome:    dados.nomeCompleto || dados['nome-completo'] || 'Não informado',
      email:   dados.email || 'Não informado',
      whatsapp: dados.whatsapp || 'Não informado',
      animal:  dados.animalInteresse || dados['animal-interesse'] || 'Sem preferência',
      cidade:  dados.cidade || 'Não informada',
      moradia: dados.tipoMoradia || dados['tipo-moradia'] || 'Não informado',
      data:    new Date().toLocaleString('pt-BR')
    };

    await emailjs.send(
      EMAIL_CONFIG.serviceId,
      EMAIL_CONFIG.templateFicha,
      parametros
    );

    console.log('📧 Email de ficha de adoção enviado com sucesso.');
    return true;
  } catch (erro) {
    console.warn('📧 Erro ao enviar email da ficha:', erro);
    // Não impede o funcionamento — o formulário já salvou no Firebase
    return false;
  }
}

// ============================================================
// ENVIAR NOTIFICAÇÃO — VOLUNTÁRIO
// ============================================================

/**
 * Envia email notificando a ONG sobre novo voluntário.
 * @param {Object} dados - Dados do cadastro
 * @returns {Promise<boolean>}
 */
async function notificarVoluntario(dados) {
  if (!emailJSDisponivel) return false;

  try {
    const habilidades = Array.isArray(dados.habilidades)
      ? dados.habilidades.join(', ')
      : (dados.habilidades || 'Não informadas');

    const dias = Array.isArray(dados.dias)
      ? dados.dias.join(', ')
      : (dados.dias || 'Não informados');

    const parametros = {
      nome:        dados.nome || 'Não informado',
      email:       dados.email || 'Não informado',
      whatsapp:    dados.whatsapp || 'Não informado',
      cidade:      dados.cidade || 'Não informada',
      habilidades: habilidades,
      dias:        dias,
      data:        new Date().toLocaleString('pt-BR')
    };

    await emailjs.send(
      EMAIL_CONFIG.serviceId,
      EMAIL_CONFIG.templateVoluntario,
      parametros
    );

    console.log('📧 Email de voluntário enviado com sucesso.');
    return true;
  } catch (erro) {
    console.warn('📧 Erro ao enviar email do voluntário:', erro);
    return false;
  }
}

// ============================================================
// ENVIAR NOTIFICAÇÃO — MENSAGEM DE CONTATO
// ============================================================

/**
 * Envia email notificando a ONG sobre nova mensagem de contato.
 * @param {Object} dados - Dados da mensagem
 * @returns {Promise<boolean>}
 */
async function notificarMensagem(dados) {
  if (!emailJSDisponivel) return false;

  try {
    const parametros = {
      nome:     dados.nome || 'Visitante',
      email:    dados.email || 'Não informado',
      telefone: dados.telefone || 'Não informado',
      assunto:  dados.assunto || 'Sem assunto',
      mensagem: dados.mensagem || '(vazio)',
      data:     new Date().toLocaleString('pt-BR')
    };

    await emailjs.send(
      EMAIL_CONFIG.serviceId,
      EMAIL_CONFIG.templateMensagem,
      parametros
    );

    console.log('📧 Email de mensagem enviado com sucesso.');
    return true;
  } catch (erro) {
    console.warn('📧 Erro ao enviar email da mensagem:', erro);
    return false;
  }
}

// ============================================================
// INTEGRAÇÃO COM firebase-public.js
//
// Este bloco intercepta os salvamentos do Firebase e dispara
// as notificações por email. Os emails são enviados EM PARALELO
// com o salvamento — se o email falhar, o dado já foi salvo
// no Firebase e a ONG pode ver no painel admin.
// ============================================================

/**
 * Conecta as notificações de email aos formulários.
 * Sobrescreve as funções de salvamento para incluir envio de email.
 */
function conectarNotificacoesEmail() {
  if (!emailJSDisponivel) return;

  // Guarda as referências originais das funções de salvamento
  const salvarFichaOriginal = (typeof salvarFichaAdocao === 'function') ? salvarFichaAdocao : null;
  const salvarVoluntarioOriginal = (typeof salvarVoluntario === 'function') ? salvarVoluntario : null;
  const salvarMensagemOriginal = (typeof salvarMensagem === 'function') ? salvarMensagem : null;

  // Sobrescreve salvarFichaAdocao para incluir notificação
  if (salvarFichaOriginal) {
    window.salvarFichaAdocao = async function(dados) {
      // Salva no Firebase (prioridade)
      const id = await salvarFichaOriginal(dados);

      // Se salvou, envia email (em paralelo, não bloqueia)
      if (id) {
        notificarFichaAdocao(dados).catch(() => {});
      }

      return id;
    };
  }

  // Sobrescreve salvarVoluntario
  if (salvarVoluntarioOriginal) {
    window.salvarVoluntario = async function(dados) {
      const id = await salvarVoluntarioOriginal(dados);
      if (id) {
        notificarVoluntario(dados).catch(() => {});
      }
      return id;
    };
  }

  // Sobrescreve salvarMensagem
  if (salvarMensagemOriginal) {
    window.salvarMensagem = async function(dados) {
      const id = await salvarMensagemOriginal(dados);
      if (id) {
        notificarMensagem(dados).catch(() => {});
      }
      return id;
    };
  }

  console.log('📧 Notificações por email conectadas aos formulários.');
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Delay para garantir que firebase-public.js já carregou
  setTimeout(() => {
    initEmailJS();
    conectarNotificacoesEmail();
  }, 200);
});

// ============================================================
// FIM DO ARQUIVO email-notificacao.js
// ============================================================
