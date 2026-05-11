// ============================================================
// ARQUIVO: voluntario.js
// DESCRIÇÃO: Controla o formulário de cadastro de voluntários
//            da ONG Paraíso dos Pets — validação, checkboxes
//            múltiplos e envio simulado.
// DEPENDÊNCIAS: main.js (toast notifications)
// ÚLTIMA ATUALIZAÇÃO: 2025
//
// ÍNDICE DE FUNÇÕES:
//   - initVoluntario()        → Inicializa a página
//   - validarFormVoluntario()  → Valida todos os campos
//   - validarCampoVol(campo)   → Valida campo individual
//   - mostrarErroVol(c, msg)   → Exibe erro inline
//   - limparErroVol(campo)     → Remove estado de erro
//   - enviarVoluntario(e)      → Simula envio com feedback
// ============================================================

'use strict';

// ============================================================
// INICIALIZAÇÃO
// ============================================================

/**
 * Inicializa o formulário de voluntário.
 * @returns {void}
 */
function initVoluntario() {
  const form = document.getElementById('form-voluntario');
  if (!form) return;

  // Validação em tempo real
  const campos = form.querySelectorAll('.campo-input, .campo-select, .campo-textarea');
  campos.forEach(campo => {
    campo.addEventListener('blur', () => validarCampoVol(campo));
    campo.addEventListener('input', () => {
      if (campo.classList.contains('erro')) limparErroVol(campo);
    });
  });

  // Máscara de telefone
  const telefone = document.getElementById('vol-whatsapp');
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

  // Mostrar campo "Outro" para habilidades
  const outroCheck = document.getElementById('hab-outro');
  const outroCampo = document.getElementById('hab-outro-campo');
  if (outroCheck && outroCampo) {
    outroCheck.addEventListener('change', () => {
      outroCampo.style.display = outroCheck.checked ? 'block' : 'none';
    });
  }

  // Contador de caracteres da motivação
  const motivacao = document.getElementById('vol-motivacao');
  const contador = document.getElementById('vol-motivacao-contador');
  if (motivacao && contador) {
    motivacao.addEventListener('input', () => {
      const len = motivacao.value.trim().length;
      contador.textContent = `${len} / 30 caracteres mínimos`;
      contador.style.color = len >= 30 ? 'var(--cor-verde)' : 'var(--cor-cinza-medio)';
    });
  }

  // Envio
  const btnEnviar = document.getElementById('btn-enviar-voluntario');
  if (btnEnviar) {
    btnEnviar.addEventListener('click', enviarVoluntario);
  }
}

// ============================================================
// VALIDAÇÃO DE CAMPO
// ============================================================

/**
 * Valida um campo individual do formulário de voluntário.
 * @param {HTMLElement} campo
 * @returns {boolean}
 */
function validarCampoVol(campo) {
  const valor = campo.value.trim();

  if (campo.hasAttribute('required') && !valor) {
    mostrarErroVol(campo, 'Este campo é obrigatório.');
    return false;
  }

  // Email
  if (campo.id === 'vol-email' && valor) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
      mostrarErroVol(campo, 'Digite um e-mail válido.');
      return false;
    }
  }

  // Telefone
  if (campo.id === 'vol-whatsapp' && valor) {
    if (valor.replace(/\D/g, '').length < 10) {
      mostrarErroVol(campo, 'Digite um número válido com DDD.');
      return false;
    }
  }

  // Motivação mínima
  if (campo.id === 'vol-motivacao' && valor && valor.length < 30) {
    mostrarErroVol(campo, 'Escreva pelo menos 30 caracteres.');
    return false;
  }

  limparErroVol(campo);
  if (valor) campo.classList.add('valido');
  return true;
}

/**
 * Exibe mensagem de erro inline.
 * @param {HTMLElement} campo
 * @param {string} msg
 */
function mostrarErroVol(campo, msg) {
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
 * Remove estado de erro.
 * @param {HTMLElement} campo
 */
function limparErroVol(campo) {
  campo.classList.remove('erro');
  const erroEl = campo.parentElement.querySelector('.campo-erro');
  if (erroEl) {
    erroEl.classList.remove('visivel');
    erroEl.textContent = '';
  }
}

// ============================================================
// VALIDAÇÃO COMPLETA
// ============================================================

/**
 * Valida todos os campos obrigatórios do formulário.
 * @returns {boolean}
 */
function validarFormVoluntario() {
  const form = document.getElementById('form-voluntario');
  if (!form) return false;

  let valido = true;
  const obrigatorios = form.querySelectorAll('[required]');
  obrigatorios.forEach(campo => {
    if (campo.type === 'checkbox') {
      if (!campo.checked) {
        mostrarErroVol(campo, 'Obrigatório.');
        valido = false;
      }
    } else if (!validarCampoVol(campo)) {
      valido = false;
    }
  });

  // Verifica se pelo menos 1 dia foi selecionado
  const dias = form.querySelectorAll('input[name="dias[]"]:checked');
  if (dias.length === 0) {
    if (typeof showToast === 'function') {
      showToast('Selecione pelo menos um dia de disponibilidade.', 'aviso');
    }
    valido = false;
  }

  // Verifica se pelo menos 1 turno foi selecionado
  const turnos = form.querySelectorAll('input[name="turnos[]"]:checked');
  if (turnos.length === 0) {
    if (typeof showToast === 'function') {
      showToast('Selecione pelo menos um turno de disponibilidade.', 'aviso');
    }
    valido = false;
  }

  return valido;
}

// ============================================================
// ENVIAR FORMULÁRIO
// ============================================================

/**
 * Simula o envio do formulário de voluntário.
 * @param {Event} e
 */
function enviarVoluntario(e) {
  if (e) e.preventDefault();

  if (!validarFormVoluntario()) {
    if (typeof showToast === 'function') {
      showToast('Por favor, corrija os campos destacados.', 'erro');
    }
    return;
  }

  // Se Firebase está disponível, firebase-public.js já cuida do envio
  if (typeof firebaseDisponivel !== 'undefined' && firebaseDisponivel) return;

  // Anti-spam: impede envio duplicado (60s cooldown)
  if (typeof podeEnviarForm === 'function' && !podeEnviarForm('voluntario-wpp')) return;

  // Sem Firebase — redireciona para WhatsApp
  const nome = document.getElementById('vol-nome')?.value || '';

  const mensagem = encodeURIComponent(
    `Olá! Meu nome é ${nome} e gostaria de me cadastrar como voluntário na ONG Paraíso dos Pets.` +
    `\n\n(Enviado pelo site ongparaisodospets.org.br)`
  );

  // Mostra sucesso e redireciona
  const form = document.getElementById('form-voluntario');
  const sucesso = document.getElementById('voluntario-sucesso');
  if (form) form.style.display = 'none';
  if (sucesso) {
    SafeDOM.clear(sucesso);
    const wrapper = SafeDOM.el('div');
    wrapper.style.textAlign = 'center';
    wrapper.style.padding = '2rem';
    const title = SafeDOM.el('h2', { text: 'Obrigado pelo interesse!' });
    title.style.color = 'var(--cor-sucesso)';
    title.style.marginBottom = '1rem';
    wrapper.appendChild(title);
    const text = SafeDOM.el('p', {
      text: 'Para completar seu cadastro como voluntário, fale com nossa equipe pelo WhatsApp.'
    });
    text.style.marginBottom = '1.5rem';
    wrapper.appendChild(text);
    const link = SafeDOM.el('a', {
      className: 'btn btn--primario',
      text: 'Falar pelo WhatsApp',
      attrs: {
        href: `https://wa.me/5516999999999?text=${mensagem}`,
        target: '_blank',
        rel: 'noopener noreferrer'
      }
    });
    link.style.display = 'inline-flex';
    link.style.gap = '0.5rem';
    wrapper.appendChild(link);
    sucesso.appendChild(wrapper);
    sucesso.style.display = 'block';
    sucesso.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// Inicializa
document.addEventListener('DOMContentLoaded', initVoluntario);

// ============================================================
// FIM DO ARQUIVO voluntario.js
// ============================================================
