'use strict';

document.addEventListener('DOMContentLoaded', () => {
      // Lê o ID do post da URL
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      // Botão compartilhar WhatsApp
      const btnWA = document.getElementById('btn-compartilhar-whatsapp');
      if (btnWA) {
        btnWA.addEventListener('click', () => compartilhar('whatsapp', id));
      }
      // Botão copiar link
      const btnCopiar = document.getElementById('btn-copiar-link');
      if (btnCopiar) {
        btnCopiar.addEventListener('click', () => compartilhar('copiar', id));
      }
    });