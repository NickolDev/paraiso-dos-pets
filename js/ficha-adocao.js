// ============================================================
// ARQUIVO: ficha-adocao.js
// DESCRIÇÃO: Controla o formulário multi-etapas de interesse
//            em adoção da ONG Paraíso dos Pets. Inclui stepper,
//            validação por etapa, máscaras de CPF/telefone e
//            algoritmo real de validação de CPF.
// DEPENDÊNCIAS: main.js (toast notifications), adote.js (ANIMAIS)
// ÚLTIMA ATUALIZAÇÃO: 2025
//
// ÍNDICE DE FUNÇÕES:
//   - initStepper()           → Controla navegação entre etapas
//   - avancarEtapa()          → Valida e avança para próxima
//   - voltarEtapa()           → Retorna à etapa anterior
//   - validarEtapa(numero)    → Valida todos os campos da etapa
//   - validarCPF(cpf)         → Algoritmo real de validação de CPF
//   - aplicarMascara(campo)   → Máscara de CPF e telefone
//   - carregarAnimais()       → Preenche select com animais
//   - enviarFicha(e)          → Simulação de envio com feedback
//   - validarCampo(campo)     → Valida um campo individual
//   - mostrarErro(campo, msg) → Exibe erro inline
//   - limparErro(campo)       → Remove estado de erro
//   - initFichaAdocao()       → Inicializa a página
// ============================================================

'use strict';

// Etapa atual (1, 2 ou 3)
let etapaAtual = 1;
const TOTAL_ETAPAS = 3;

// ============================================================
// INICIALIZAÇÃO DA PÁGINA
// ============================================================

/**
 * Inicializa o formulário de ficha de adoção.
 * Configura o stepper, máscaras, validação e carrega animais.
 * @returns {void}
 */
function initFichaAdocao() {
  const form = document.getElementById('form-adocao');
  if (!form) return;

  // Configura botões de navegação
  const btnAvancar = document.getElementById('btn-avancar');
  const btnVoltar = document.getElementById('btn-voltar');
  const btnEnviar = document.getElementById('btn-enviar');

  if (btnAvancar) btnAvancar.addEventListener('click', avancarEtapa);
  if (btnVoltar) btnVoltar.addEventListener('click', voltarEtapa);
  if (btnEnviar) btnEnviar.addEventListener('click', enviarFicha);

  // Aplica máscaras em tempo real
  const campoCPF = document.getElementById('cpf');
  const campoWhatsApp = document.getElementById('whatsapp');

  if (campoCPF) {
    campoCPF.addEventListener('input', () => aplicarMascara(campoCPF, 'cpf'));
  }
  if (campoWhatsApp) {
    campoWhatsApp.addEventListener('input', () => aplicarMascara(campoWhatsApp, 'telefone'));
  }

  // Validação em tempo real: marca campos com borda verde/vermelha
  const campos = form.querySelectorAll('.campo-input, .campo-select, .campo-textarea');
  campos.forEach(campo => {
    campo.addEventListener('blur', () => validarCampo(campo));
    campo.addEventListener('input', () => {
      // Remove erro ao digitar
      if (campo.classList.contains('erro')) {
        limparErro(campo);
      }
    });
  });

  // Condicional: mostrar campo "pets" se responder "Sim" a outros animais
  const radioOutrosAnimais = document.querySelectorAll('input[name="outros-animais"]');
  radioOutrosAnimais.forEach(radio => {
    radio.addEventListener('change', () => {
      const campoDetalhe = document.getElementById('outros-animais-detalhe');
      if (campoDetalhe) {
        campoDetalhe.style.display = radio.value === 'sim' ? 'block' : 'none';
      }
    });
  });

  // Condicional: mostrar campo "proprietário permite pets?" se alugada
  const radioMoradia = document.querySelectorAll('input[name="tipo-moradia-posse"]');
  radioMoradia.forEach(radio => {
    radio.addEventListener('change', () => {
      const campoPermite = document.getElementById('proprietario-permite');
      if (campoPermite) {
        campoPermite.style.display = radio.value === 'alugada' ? 'block' : 'none';
      }
    });
  });

  // Carrega animais no select
  carregarAnimais();

  // Lê parâmetro ?animal=ID da URL para pré-selecionar
  const params = new URLSearchParams(window.location.search);
  const animalId = params.get('animal');
  if (animalId) {
    const select = document.getElementById('animal-interesse');
    if (select) select.value = animalId;
  }

  // Atualiza visual do stepper
  atualizarStepper();
}

// ============================================================
// STEPPER — Navegação entre etapas
// ============================================================

/**
 * Atualiza o visual do stepper (números, textos e linhas).
 * Marca etapa atual como ativa e anteriores como concluídas.
 * @returns {void}
 */
function atualizarStepper() {
  for (let i = 1; i <= TOTAL_ETAPAS; i++) {
    const item = document.getElementById(`stepper-item-${i}`);
    const linha = document.getElementById(`stepper-linha-${i}`);
    const painel = document.getElementById(`etapa-${i}`);

    if (item) {
      item.classList.remove('ativo', 'concluido');
      if (i === etapaAtual) item.classList.add('ativo');
      if (i < etapaAtual) item.classList.add('concluido');
    }

    if (linha) {
      linha.classList.toggle('ativo', i < etapaAtual);
    }

    if (painel) {
      painel.classList.toggle('ativo', i === etapaAtual);
    }
  }

  // Atualiza visibilidade dos botões de navegação
  const btnVoltar = document.getElementById('btn-voltar');
  const btnAvancar = document.getElementById('btn-avancar');
  const btnEnviar = document.getElementById('btn-enviar');

  if (btnVoltar) btnVoltar.style.display = etapaAtual > 1 ? 'inline-flex' : 'none';
  if (btnAvancar) btnAvancar.style.display = etapaAtual < TOTAL_ETAPAS ? 'inline-flex' : 'none';
  if (btnEnviar) btnEnviar.style.display = etapaAtual === TOTAL_ETAPAS ? 'inline-flex' : 'none';
}

/**
 * Valida a etapa atual e avança para a próxima.
 * @returns {void}
 */
function avancarEtapa() {
  if (validarEtapa(etapaAtual)) {
    etapaAtual++;
    atualizarStepper();
    // Scroll suave ao topo do formulário
    document.getElementById('form-adocao')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Retorna à etapa anterior sem validar.
 * @returns {void}
 */
function voltarEtapa() {
  if (etapaAtual > 1) {
    etapaAtual--;
    atualizarStepper();
    document.getElementById('form-adocao')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ============================================================
// VALIDAÇÃO POR ETAPA
// ============================================================

/**
 * Valida todos os campos obrigatórios da etapa especificada.
 * @param {number} numero - Número da etapa (1, 2 ou 3)
 * @returns {boolean} true se todos os campos são válidos
 */
function validarEtapa(numero) {
  const painel = document.getElementById(`etapa-${numero}`);
  if (!painel) return true;

  let valido = true;
  const camposObrigatorios = painel.querySelectorAll('[required]');

  camposObrigatorios.forEach(campo => {
    if (!validarCampo(campo)) {
      valido = false;
    }
  });

  // Validações específicas por etapa
  if (numero === 1) {
    // Validar CPF
    const cpfCampo = document.getElementById('cpf');
    if (cpfCampo && cpfCampo.value.trim()) {
      const cpfLimpo = cpfCampo.value.replace(/\D/g, '');
      if (!validarCPF(cpfLimpo)) {
        mostrarErro(cpfCampo, 'CPF inválido. Verifique os números digitados.');
        valido = false;
      }
    }

    // Validar idade mínima (18 anos)
    const nascimento = document.getElementById('nascimento');
    if (nascimento && nascimento.value) {
      const dataNasc = new Date(nascimento.value);
      const hoje = new Date();
      let idade = hoje.getFullYear() - dataNasc.getFullYear();
      const mesAtual = hoje.getMonth() - dataNasc.getMonth();
      if (mesAtual < 0 || (mesAtual === 0 && hoje.getDate() < dataNasc.getDate())) {
        idade--;
      }
      if (idade < 18) {
        mostrarErro(nascimento, 'É necessário ter pelo menos 18 anos para adotar.');
        valido = false;
      }
    }
  }

  if (numero === 3) {
    // Validar textarea mínima
    const motivacao = document.getElementById('motivacao-adocao');
    if (motivacao && motivacao.value.trim().length < 50) {
      mostrarErro(motivacao, 'Por favor, escreva pelo menos 50 caracteres explicando por que deseja adotar.');
      valido = false;
    }

    // Validar checkboxes de concordância
    const termos = document.getElementById('aceite-termos');
    if (termos && !termos.checked) {
      mostrarErro(termos, 'Você precisa concordar com o Termo de Adoção Responsável.');
      valido = false;
    }

    const whatsappAuth = document.getElementById('aceite-whatsapp');
    if (whatsappAuth && !whatsappAuth.checked) {
      mostrarErro(whatsappAuth, 'Você precisa autorizar o contato por WhatsApp.');
      valido = false;
    }
  }

  if (!valido && typeof showToast === 'function') {
    showToast('Por favor, corrija os campos destacados em vermelho.', 'erro');
  }

  return valido;
}

// ============================================================
// VALIDAÇÃO DE CAMPO INDIVIDUAL
// ============================================================

/**
 * Valida um campo individual e mostra/limpa o estado visual.
 * @param {HTMLElement} campo - O elemento input/select/textarea
 * @returns {boolean} true se o campo é válido
 */
function validarCampo(campo) {
  const valor = campo.value.trim();
  const tipo = campo.type;
  const nome = campo.name || campo.id;

  // Campos obrigatórios vazios
  if (campo.hasAttribute('required') && !valor && tipo !== 'checkbox') {
    mostrarErro(campo, 'Este campo é obrigatório.');
    return false;
  }

  // Checkbox obrigatório
  if (tipo === 'checkbox' && campo.hasAttribute('required') && !campo.checked) {
    mostrarErro(campo, 'Este campo é obrigatório.');
    return false;
  }

  // Validação de e-mail
  if (tipo === 'email' && valor) {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(valor)) {
      mostrarErro(campo, 'Digite um e-mail válido.');
      return false;
    }
  }

  // Validação de telefone (mínimo 14 caracteres com máscara)
  if (nome === 'whatsapp' && valor && valor.length < 14) {
    mostrarErro(campo, 'Digite um número de WhatsApp válido.');
    return false;
  }

  // Se passou em tudo, marca como válido
  limparErro(campo);
  if (valor || (tipo === 'checkbox' && campo.checked)) {
    campo.classList.add('valido');
  }

  return true;
}

// ============================================================
// MOSTRAR/LIMPAR ERRO
// ============================================================

/**
 * Exibe mensagem de erro abaixo do campo.
 * @param {HTMLElement} campo - O campo com erro
 * @param {string} msg - Mensagem de erro a exibir
 */
function mostrarErro(campo, msg) {
  campo.classList.remove('valido');
  campo.classList.add('erro');

  // Busca ou cria o elemento de mensagem de erro
  let erroEl = campo.parentElement.querySelector('.campo-erro');
  if (!erroEl) {
    erroEl = document.createElement('span');
    erroEl.classList.add('campo-erro');
    campo.parentElement.appendChild(erroEl);
  }
  erroEl.textContent = msg;
  erroEl.classList.add('visivel');
}

/**
 * Remove o estado de erro de um campo.
 * @param {HTMLElement} campo - O campo a limpar
 */
function limparErro(campo) {
  campo.classList.remove('erro');
  const erroEl = campo.parentElement.querySelector('.campo-erro');
  if (erroEl) {
    erroEl.classList.remove('visivel');
    erroEl.textContent = '';
  }
}

// ============================================================
// VALIDAÇÃO DE CPF — Algoritmo real brasileiro
// ============================================================

/**
 * Valida um CPF usando o algoritmo oficial da Receita Federal.
 * Verifica os dois dígitos verificadores.
 * @param {string} cpf - CPF com apenas números (11 dígitos)
 * @returns {boolean} true se o CPF é matematicamente válido
 */
function validarCPF(cpf) {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/\D/g, '');

  // Deve ter exatamente 11 dígitos
  if (cpf.length !== 11) return false;

  // Rejeita CPFs com todos os dígitos iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Calcula o primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;

  // Calcula o segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;

  return true;
}

// ============================================================
// MÁSCARAS DE INPUT — CPF e Telefone em tempo real
// ============================================================

/**
 * Aplica máscara de formatação ao valor de um campo.
 * @param {HTMLElement} campo - O campo de input
 * @param {string} tipo - Tipo de máscara: 'cpf' ou 'telefone'
 */
function aplicarMascara(campo, tipo) {
  let valor = campo.value.replace(/\D/g, ''); // Remove tudo que não é número

  if (tipo === 'cpf') {
    // Máscara: XXX.XXX.XXX-XX
    if (valor.length > 11) valor = valor.slice(0, 11);
    if (valor.length > 9) {
      valor = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (valor.length > 6) {
      valor = valor.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (valor.length > 3) {
      valor = valor.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
  }

  if (tipo === 'telefone') {
    // Máscara: (XX) XXXXX-XXXX
    if (valor.length > 11) valor = valor.slice(0, 11);
    if (valor.length > 6) {
      valor = valor.replace(/(\d{2})(\d{5})(\d{1,4})/, '($1) $2-$3');
    } else if (valor.length > 2) {
      valor = valor.replace(/(\d{2})(\d{1,5})/, '($1) $2');
    } else if (valor.length > 0) {
      valor = valor.replace(/(\d{1,2})/, '($1');
    }
  }

  campo.value = valor;
}

// ============================================================
// CARREGAR ANIMAIS — Preenche o select com opções
// ============================================================

/**
 * Preenche o select de "Animal de interesse" com os animais
 * disponíveis no array ANIMAIS (de adote.js).
 * @returns {void}
 */
function carregarAnimais() {
  const select = document.getElementById('animal-interesse');
  if (!select) return;

  // Verifica se ANIMAIS está disponível (adote.js carregado)
  if (typeof ANIMAIS === 'undefined') return;

  // Adiciona cada animal como opção
  ANIMAIS.forEach(animal => {
    const option = document.createElement('option');
    option.value = animal.id;
    option.textContent = `${animal.nome} — ${animal.porte}, ${animal.idade}, ${animal.sexo}`;
    select.appendChild(option);
  });
}

// ============================================================
// ENVIAR FICHA — Simulação de envio com feedback
// ============================================================

/**
 * Simula o envio do formulário com loading spinner e toast.
 * @param {Event} e - Evento de click
 */
function enviarFicha(e) {
  if (e) e.preventDefault();

  // Valida a última etapa
  if (!validarEtapa(TOTAL_ETAPAS)) return;

  const btnEnviar = document.getElementById('btn-enviar');
  if (!btnEnviar) return;

  // Mostra spinner de loading
  btnEnviar.classList.add('btn-loading');
  btnEnviar.disabled = true;

  // Simula tempo de processamento (2 segundos)
  setTimeout(() => {
    btnEnviar.classList.remove('btn-loading');
    btnEnviar.disabled = false;

    // Esconde o formulário e mostra mensagem de sucesso
    const form = document.getElementById('form-adocao');
    const sucesso = document.getElementById('mensagem-sucesso');

    if (form) form.style.display = 'none';
    if (sucesso) sucesso.style.display = 'block';

    // Toast de sucesso
    if (typeof showToast === 'function') {
      showToast('Ficha enviada com sucesso! Entraremos em contato em até 48h.', 'sucesso');
    }

    // Scroll suave para a mensagem de sucesso
    if (sucesso) sucesso.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 2000);
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initFichaAdocao);

// ============================================================
// FIM DO ARQUIVO ficha-adocao.js
// ============================================================
