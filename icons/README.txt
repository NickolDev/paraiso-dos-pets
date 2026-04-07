============================================================
PASTA: /icons/
DESCRIÇÃO: Documentação dos ícones SVG utilizados no site
           ONG Paraíso dos Pets
============================================================

NOTA IMPORTANTE:
Todos os ícones do site são SVGs INLINE embutidos diretamente
no HTML. Não utilizamos nenhuma biblioteca externa de ícones
(Font Awesome, Material Icons, etc.).

Isso garante:
  - Zero dependência externa
  - Carregamento instantâneo
  - Controle total de cor e tamanho via CSS
  - Funcionamento offline (file://)

============================================================
LISTA DE ÍCONES UTILIZADOS NO SITE:
============================================================

NAVEGAÇÃO E INTERFACE:
  - Patinha (paw)           → Logo, marcadores de timeline
  - Hamburguer (3 linhas)   → Menu mobile
  - X (close)               → Fechar modal, menu, toast
  - Seta para baixo         → Dropdown, scroll indicator
  - Seta para cima          → Botão voltar ao topo
  - Seta para esquerda      → Carrossel anterior
  - Seta para direita       → Carrossel próximo
  - Busca (lupa)            → Campo de busca

AÇÕES:
  - Coração                 → Favoritar, doar
  - Coração com patinha     → Apadrinhar
  - Duas mãos               → Voluntariar
  - Estrela/emblema         → Associar-se
  - Aperto de mão           → Parcerias
  - Compartilhar            → Botão de compartilhar
  - Copiar (clipboard)      → Copiar chave PIX
  - Impressora              → Imprimir relatório

REDES SOCIAIS:
  - WhatsApp                → Botão flutuante + links
  - Instagram               → Links e cards de rede
  - YouTube                 → Links e cards de rede
  - Threads                 → Links e cards de rede

STATUS:
  - Check (checkmark)       → Vacinado, castrado, sucesso
  - Aviso (triângulo)       → Toast de aviso
  - Info (i em círculo)     → Toast informativo
  - Erro (x em círculo)     → Toast de erro

TRANSPARÊNCIA:
  - Seta para cima (trend)  → Receita
  - Seta para baixo (trend) → Despesa
  - Banco                   → Saldo
  - Arquivo/documento       → Downloads de documentos

OUTROS:
  - Mapa (pin)              → Localização
  - Relógio                 → Horário de atendimento
  - Email (envelope)        → Contato por email
  - Telefone                → Contato por telefone
  - Calendário              → Datas de posts/eventos

============================================================
COMO ADICIONAR NOVOS ÍCONES:
============================================================

1. Encontre um SVG licenciado (ex: Heroicons, Feather Icons)
2. Copie apenas o conteúdo da tag <svg>
3. Insira diretamente no HTML onde necessário
4. Use classes CSS para controlar tamanho e cor:

   Exemplo:
   <svg class="icone" viewBox="0 0 24 24" aria-hidden="true">
     <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
              2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
              C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42
              22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
   </svg>

5. Para ícones decorativos, adicione aria-hidden="true"
6. Para ícones com significado, adicione aria-label="Descrição"

============================================================
