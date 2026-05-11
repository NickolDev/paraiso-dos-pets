'use strict';

// Tenta carregar o widget do Instagram
    // Se o iframe carregar com sucesso em 3s, esconde o fallback
    document.addEventListener('DOMContentLoaded', () => {
      const widget = document.getElementById('instagram-widget');
      const fallback = document.getElementById('instagram-fallback');
      if (!widget || !fallback) return;
      // A ONG deve trocar o src do iframe por um widget próprio em snapwidget.com
      // Se o src padrão não carregar, mantém o fallback visível
      widget.addEventListener('load', () => {
        try {
          // Se o widget carregou e tem conteúdo válido, mostra
          widget.style.display = 'block';
          fallback.style.display = 'none';
        } catch (e) { /* mantém fallback */ }
      });
      // Se não carregar em 5s, mantém o fallback
      setTimeout(() => {
        if (widget.style.display === 'none') {
          // Widget não carregou — fallback continua visível (comportamento padrão)
        }
      }, 5000);
    });