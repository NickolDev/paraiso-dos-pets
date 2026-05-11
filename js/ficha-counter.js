'use strict';

document.addEventListener('DOMContentLoaded', () => {
      const motivacao = document.getElementById('motivacao-adocao');
      const contador = document.getElementById('contador-motivacao');
      if (motivacao && contador) {
        motivacao.addEventListener('input', () => {
          const len = motivacao.value.trim().length;
          contador.textContent = `${len} / 50 caracteres mínimos`;
          contador.style.color = len >= 50 ? 'var(--cor-verde)' : 'var(--cor-cinza-medio)';
        });
      }
    });