// ============================================================
// ARQUIVO: contato.js
// DESCRIÇÃO: Controla o formulário de contato — validação em
//            tempo real, feedback visual e envio simulado.
// DEPENDÊNCIAS: main.js (toast notifications)
// ÚLTIMA ATUALIZAÇÃO: 2025
//
// ÍNDICE DE FUNÇÕES:
//   - initFormContato()       → Inicializa validações
//   - validarCampo(campo)     → Valida um campo individual
//   - validarEmail(email)     → Regex de validação de email
//   - validarTelefone(tel)    → Validação de formato
//   - mostrarErro(campo, msg) → Exibe mensagem de erro inline
//   - limparErro(campo)       → Remove estado de erro
//   - verificarFormValido()   → Verifica se todo o form está ok
//   - enviarFormulario(e)     → Simula envio com loading e feedback
//   - initContato()           → Inicializa a página
// ============================================================

'use strict';

// ============================================================
// INICIALIZAÇÃO DA PÁGINA DE CONTATO
// ============================================================

/**
 * Inicializa a página de contato e o formulário.
 * @returns {void}
 */
function initContato() {
  const form = document.getElementById('form-contato');
  if (!form) return;

  // Validação em tempo real em cada campo
  const campos = form.querySelectorAll('.campo-input, .campo-select, .campo-textarea');
  campos.forEach(campo => {
    // Valida ao perder o foco
    campo.addEventListener('blur', () => {
      validarCampoContato(campo);
      verificarFormValido();
    });

    // Remove erro ao começar a digitar
    campo.addEventListener('input', () => {
      if (campo.classList.contains('erro')) {
        limparErroContato(campo);
      }
      verificarFormValido();
    });
  });

  // Contador de caracteres da mensagem
  const mensagem = document.getElementById('contato-mensagem');
  const contador = document.getElementById('contador-mensagem');
  if (mensagem && contador) {
    mensagem.addEventListener('input', () => {
      const len = mensagem.value.length;
      contador.textContent = `${len} caractere${len !== 1 ? 's' : ''}`;
      contador.style.color = len >= 20 ? 'var(--cor-verde)' : 'var(--cor-cinza-medio)';
    });
  }

  // Máscara de telefone
  const telefone = document.getElementById('contato-telefone');
  if (telefone) {
    telefone.addEventListener('input', () => {
      let valor = telefone.value.replace(/\D/g, '');
      if (valor.length > 11) valor = valor.slice(0, 11);
      if (valor.length > 6) {
        valor = valor.replace(/(\d{2})(\d{5})(\d{1,4})/, '($1) $2-$3');
      } else if (valor.length > 2) {
        valor = valor.replace(/(\d{2})(\d{1,5})/, '($1) $2');
      } else if (valor.length > 0) {
        valor = valor.replace(/(\d{1,2})/, '($1');
      }
      telefone.value = valor;
    });
  }

  // Checkbox de política
  const checkbox = document.getElementById('contato-politica');
  if (checkbox) {
    checkbox.addEventListener('change', verificarFormValido);
  }

  // Envio do formulário
  const btnEnviar = document.getElementById('btn-enviar-contato');
  if (btnEnviar) {
    btnEnviar.addEventListener('click', enviarFormulario);
  }

  // Desabilita botão inicialmente
  verificarFormValido();
}

// ============================================================
// VALIDAÇÃO DE CAMPO INDIVIDUAL
// ============================================================

/**
 * Valida um campo individual do formulário de contato.
 * @param {HTMLElement} campo - O elemento input/select/textarea
 * @returns {boolean} true se válido
 */
function validarCampoContato(campo) {
  const valor = campo.value.trim();
  const tipo = campo.type;
  const id = campo.id;

  // Campo obrigatório vazio
  if (campo.hasAttribute('required') && !valor) {
    mostrarErroContato(campo, 'Este campo é obrigatório.');
    return false;
  }

  // Validação de email
  if (id === 'contato-email' && valor) {
    if (!validarEmail(valor)) {
      mostrarErroContato(campo, 'Digite um e-mail válido.');
      return false;
    }
  }

  // Validação de telefone
  if (id === 'contato-telefone' && valor) {
    if (!validarTelefone(valor)) {
      mostrarErroContato(campo, 'Digite um telefone válido com DDD.');
      return false;
    }
  }

  // Mensagem com mínimo de caracteres
  if (id === 'contato-mensagem' && valor && valor.length < 20) {
    mostrarErroContato(campo, 'A mensagem deve ter pelo menos 20 caracteres.');
    return false;
  }

  // Select vazio (valor padrão "")
  if (campo.tagName === 'SELECT' && campo.hasAttribute('required') && !valor) {
    mostrarErroContato(campo, 'Selecione uma opção.');
    return false;
  }

  // Válido
  limparErroContato(campo);
  if (valor) campo.classList.add('valido');
  return true;
}

// ============================================================
// VALIDAÇÕES ESPECÍFICAS
// ============================================================

/**
 * Valida formato de email.
 * @param {string} email - Endereço de email
 * @returns {boolean} true se formato válido
 */
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida formato de telefone brasileiro.
 * @param {string} tel - Telefone com máscara
 * @returns {boolean} true se formato válido
 */
function validarTelefone(tel) {
  // Remove caracteres não numéricos e verifica 10 ou 11 dígitos
  const numeros = tel.replace(/\D/g, '');
  return numeros.length >= 10 && numeros.length <= 11;
}

// ============================================================
// MOSTRAR/LIMPAR ERRO
// ============================================================

/**
 * Exibe mensagem de erro abaixo do campo.
 * @param {HTMLElement} campo - O campo com erro
 * @param {string} msg - Mensagem de erro
 */
function mostrarErroContato(campo, msg) {
  campo.classList.remove('valido');
  campo.classList.add('erro');

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
 * Remove o estado de erro.
 * @param {HTMLElement} campo
 */
function limparErroContato(campo) {
  campo.classList.remove('erro');
  const erroEl = campo.parentElement.querySelector('.campo-erro');
  if (erroEl) {
    erroEl.classList.remove('visivel');
    erroEl.textContent = '';
  }
}

// ============================================================
// VERIFICAR SE FORMULÁRIO ESTÁ VÁLIDO
// ============================================================

/**
 * Verifica se todos os campos obrigatórios estão preenchidos
 * e habilita/desabilita o botão de envio.
 * @returns {boolean}
 */
function verificarFormValido() {
  const form = document.getElementById('form-contato');
  const btn = document.getElementById('btn-enviar-contato');
  if (!form || !btn) return false;

  const nome = document.getElementById('contato-nome')?.value.trim();
  const email = document.getElementById('contato-email')?.value.trim();
  const telefone = document.getElementById('contato-telefone')?.value.trim();
  const assunto = document.getElementById('contato-assunto')?.value;
  const mensagem = document.getElementById('contato-mensagem')?.value.trim();
  const politica = document.getElementById('contato-politica')?.checked;

  const valido = nome && email && validarEmail(email) && telefone &&
                 assunto && mensagem && mensagem.length >= 20 && politica;

  btn.disabled = !valido;
  btn.classList.toggle('btn--disabled', !valido);

  return valido;
}

// ============================================================
// ENVIAR FORMULÁRIO — Simulação com feedback
// ============================================================

/**
 * Simula o envio do formulário com loading e toast.
 * @param {Event} e - Evento de click
 */
function enviarFormulario(e) {
  if (e) e.preventDefault();

  // Valida todos os campos primeiro
  const form = document.getElementById('form-contato');
  if (!form) return;

  let valido = true;
  const campos = form.querySelectorAll('[required]');
  campos.forEach(campo => {
    if (campo.type === 'checkbox') {
      if (!campo.checked) {
        mostrarErroContato(campo, 'Obrigatório.');
        valido = false;
      }
    } else if (!validarCampoContato(campo)) {
      valido = false;
    }
  });

  if (!valido) {
    if (typeof showToast === 'function') {
      showToast('Por favor, corrija os campos destacados.', 'erro');
    }
    return;
  }
  // Anti-spam: impede envio duplicado (60s cooldown)
  if (typeof podeEnviarForm === 'function' && !podeEnviarForm('contato-wpp')) return;

  // Redireciona para WhatsApp sem salvar dados em banco
  const nome = document.getElementById('contato-nome')?.value || '';
  const assunto = document.getElementById('contato-assunto')?.value || 'Contato pelo site';
  const mensagem = document.getElementById('contato-mensagem')?.value || '';

  const textoWpp = encodeURIComponent(
    `Olá! Meu nome é ${nome}.` +
    `\nAssunto: ${assunto}` +
    `\n\n${mensagem}` +
    `\n\n(Enviado pelo site ongparaisodospets.org.br)`
  );

  window.open(`https://wa.me/5516999999999?text=${textoWpp}`, '_blank');

  if (typeof showToast === 'function') {
    showToast('Redirecionando para o WhatsApp...', 'sucesso');
  }

  // Limpa o formulário
  form.reset();
  form.querySelectorAll('.valido').forEach(c => c.classList.remove('valido'));
  const contador = document.getElementById('contador-mensagem');
  if (contador) contador.textContent = '0 caracteres';
  verificarFormValido();
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initContato);

// ============================================================
// FIM DO ARQUIVO contato.js
// ============================================================
