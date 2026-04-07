// ============================================================
// ARQUIVO: adote.js
// DESCRIÇÃO: Controla os animais disponíveis para adoção —
//            renderização de cards, filtros, favoritos e lightbox.
//            Os dados de animais também são usados na Home
//            para renderizar os 3 animais em destaque.
// DEPENDÊNCIAS: main.js (toast notifications)
// ÚLTIMA ATUALIZAÇÃO: 2025
//
// ÍNDICE DE FUNÇÕES:
//   - renderAnimais(lista)      → Renderiza cards no grid
//   - filtrarAnimais()          → Aplica filtros combinados
//   - criarCard(animal)         → Cria elemento HTML de um card
//   - abrirLightbox(id)         → Abre modal com info completa
//   - fecharLightbox()          → Fecha o modal
//   - toggleFavorito(id)        → Adiciona/remove dos favoritos
//   - carregarFavoritos()       → Recupera favoritos do localStorage
//   - atualizarContadorFav()    → Atualiza badge de favoritos
//   - renderFavoritos()         → Exibe lista de favoritos
//   - initAdote()               → Inicializa a página de adoção
// ============================================================

'use strict';

// ============================================================
// DADOS DOS ANIMAIS — Array com 12 objetos
// Cada objeto representa um cão disponível no abrigo.
// Para atualizar os animais, edite este array.
//
// Estrutura de cada objeto:
//   id          → Identificador único (número)
//   nome        → Nome do animal (string)
//   foto        → URL da foto (usar placedog.net durante dev)
//   idade       → Idade estimada (string, ex: "2 anos")
//   porte       → Porte: "Pequeno" | "Médio" | "Grande"
//   sexo        → Sexo: "Macho" | "Fêmea"
//   status      → Status: "Disponível" | "Reservado" | "Em Tratamento"
//   castrado    → Se é castrado (boolean)
//   vacinado    → Se está vacinado (boolean)
//   descricao   → Descrição curta do animal (string)
//   historico   → Como foi resgatado (string)
//   novo        → Se é novo no abrigo (boolean) — exibe badge
// ============================================================

const ANIMAIS = [
  {
    id: 1,
    nome: "Thor",
    foto: "https://placedog.net/400/300?r=5",
    idade: "2 anos",
    porte: "Grande",
    sexo: "Macho",
    status: "Disponível",
    castrado: true,
    vacinado: true,
    descricao: "Thor é um cão dócil e brincalhão que adora crianças. Apesar do nome forte, é um verdadeiro gigante gentil que só quer carinho.",
    historico: "Resgatado em fevereiro de 2025 nas ruas do centro de Ribeirão Preto. Estava desnutrido e com sinais de maus-tratos.",
    novo: true
  },
  {
    id: 2,
    nome: "Luna",
    foto: "https://placedog.net/400/300?r=6",
    idade: "1 ano",
    porte: "Médio",
    sexo: "Fêmea",
    status: "Disponível",
    castrado: true,
    vacinado: true,
    descricao: "Luna é meiga e tranquila. Adora ficar no colo e se dá bem com outros cães. Ideal para apartamentos.",
    historico: "Encontrada abandonada em uma caixa de papelão próxima à rodoviária de Ribeirão Preto em janeiro de 2025.",
    novo: true
  },
  {
    id: 3,
    nome: "Caramelo",
    foto: "https://placedog.net/400/300?r=7",
    idade: "4 anos",
    porte: "Médio",
    sexo: "Macho",
    status: "Disponível",
    castrado: true,
    vacinado: true,
    descricao: "Caramelo é o típico vira-lata caramelo brasileiro: leal, protetor e muito companheiro. Se dá bem com todos.",
    historico: "Resgatado de uma situação de acumulação em 2023. Passou por tratamento e está totalmente recuperado.",
    novo: false
  },
  {
    id: 4,
    nome: "Mel",
    foto: "https://placedog.net/400/300?r=8",
    idade: "3 anos",
    porte: "Pequeno",
    sexo: "Fêmea",
    status: "Disponível",
    castrado: true,
    vacinado: true,
    descricao: "Mel é pequena, mas tem uma personalidade enorme! Muito esperta e carinhosa. Adora brincar de buscar bolinha.",
    historico: "Entregue por uma família que não podia mais cuidar dela em dezembro de 2024.",
    novo: false
  },
  {
    id: 5,
    nome: "Pipoca",
    foto: "https://placedog.net/400/300?r=9",
    idade: "6 meses",
    porte: "Pequeno",
    sexo: "Fêmea",
    status: "Disponível",
    castrado: false,
    vacinado: true,
    descricao: "Pipoca é filhote e cheia de energia! Pula de alegria toda vez que vê alguém. Perfeita para famílias ativas.",
    historico: "Nasceu no abrigo. Sua mãe, a Pretinha, foi resgatada grávida em outubro de 2024.",
    novo: true
  },
  {
    id: 6,
    nome: "Rex",
    foto: "https://placedog.net/400/300?r=10",
    idade: "5 anos",
    porte: "Grande",
    sexo: "Macho",
    status: "Reservado",
    castrado: true,
    vacinado: true,
    descricao: "Rex é forte e protetor. Já está reservado para uma família que o conheceu na última feira de adoção.",
    historico: "Resgatado de um terreno baldio na zona norte de Ribeirão Preto em 2022.",
    novo: false
  },
  {
    id: 7,
    nome: "Nina",
    foto: "https://placedog.net/400/300?r=11",
    idade: "2 anos",
    porte: "Médio",
    sexo: "Fêmea",
    status: "Disponível",
    castrado: true,
    vacinado: true,
    descricao: "Nina é super sociável e adora passear. Caminha na guia como uma profissional e se dá bem com outros cães.",
    historico: "Encontrada vagando pela rodovia SP-322 em março de 2024. Voluntários a resgataram com segurança.",
    novo: false
  },
  {
    id: 8,
    nome: "Bento",
    foto: "https://placedog.net/400/300?r=12",
    idade: "7 anos",
    porte: "Grande",
    sexo: "Macho",
    status: "Em Tratamento",
    castrado: true,
    vacinado: true,
    descricao: "Bento é um senhor cão muito calmo e amoroso. Está em tratamento para uma lesão na pata, mas se recupera bem.",
    historico: "Resgatado após denúncia de maus-tratos em 2023. Passou por cirurgia e segue em recuperação.",
    novo: false
  },
  {
    id: 9,
    nome: "Estrela",
    foto: "https://placedog.net/400/300?r=13",
    idade: "1 ano",
    porte: "Pequeno",
    sexo: "Fêmea",
    status: "Disponível",
    castrado: false,
    vacinado: true,
    descricao: "Estrela é tímida no início, mas quando confia em você, não sai mais do seu lado. Precisa de paciência e amor.",
    historico: "Encontrada escondida debaixo de um carro durante uma tempestade em novembro de 2024.",
    novo: false
  },
  {
    id: 10,
    nome: "Bolt",
    foto: "https://placedog.net/400/300?r=14",
    idade: "3 anos",
    porte: "Médio",
    sexo: "Macho",
    status: "Disponível",
    castrado: true,
    vacinado: true,
    descricao: "Bolt é rápido, energético e muito inteligente. Aprende truques com facilidade. Ideal para quem gosta de atividades ao ar livre.",
    historico: "Resgatado de uma situação de abandono em um condomínio em construção em setembro de 2024.",
    novo: false
  },
  {
    id: 11,
    nome: "Flora",
    foto: "https://placedog.net/400/300?r=15",
    idade: "8 anos",
    porte: "Médio",
    sexo: "Fêmea",
    status: "Disponível",
    castrado: true,
    vacinado: true,
    descricao: "Flora é uma senhora tranquila que adora deitar ao sol. Perfeita para quem busca companhia calma e amorosa.",
    historico: "Sua tutora faleceu e a família não quis ficar com ela. Chegou ao abrigo em julho de 2024.",
    novo: false
  },
  {
    id: 12,
    nome: "Zeus",
    foto: "https://placedog.net/400/300?r=16",
    idade: "4 anos",
    porte: "Grande",
    sexo: "Macho",
    status: "Disponível",
    castrado: true,
    vacinado: true,
    descricao: "Zeus é imponente, mas com coração de manteiga. Adora receber cafuné na barriga e é muito obediente.",
    historico: "Resgatado de uma corrente em um quintal abandonado em abril de 2024. Hoje é puro amor.",
    novo: false
  }
];

// ============================================================
// CHAVE DO LOCALSTORAGE para favoritos
// ============================================================
const FAVORITOS_KEY = 'paraiso_favoritos';

// ============================================================
// RENDERIZAR ANIMAIS — Cria e insere os cards no grid
// ============================================================

/**
 * Renderiza os cards de animais no grid da página de adoção.
 * @param {Array} lista - Array de objetos de animais a exibir
 * @returns {void}
 */
function renderAnimais(lista) {
  const container = document.getElementById('grid-animais');
  if (!container) return;

  // Limpa o grid antes de renderizar
  container.innerHTML = '';

  if (lista.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:var(--cor-cinza-medio);grid-column:1/-1;padding:2rem;">Nenhum animal encontrado com esses filtros.</p>';
    return;
  }

  // Cria e adiciona cada card
  lista.forEach(animal => {
    container.appendChild(criarCard(animal));
  });

  // Atualiza contador de resultados
  const contador = document.getElementById('filtros-contador');
  if (contador) {
    contador.textContent = `Exibindo ${lista.length} de ${ANIMAIS.length} animais`;
  }
}

// ============================================================
// CRIAR CARD — Monta o HTML de um card de animal
// ============================================================

/**
 * Cria o elemento HTML completo de um card de animal.
 * Inclui: foto, badges, botão favorito, nome, detalhes,
 * ícones de status, descrição e botão de ação.
 * @param {Object} animal - Objeto com dados do animal
 * @returns {HTMLElement} Elemento div do card
 */
function criarCard(animal) {
  const card = document.createElement('div');
  card.classList.add('card-animal');
  card.setAttribute('data-id', animal.id);

  // Verifica se é favorito
  const favoritos = carregarFavoritos();
  const isFavorito = favoritos.includes(animal.id);

  // Classes de badge conforme status
  const statusClasse = {
    'Disponível': 'badge--disponivel',
    'Reservado': 'badge--reservado',
    'Em Tratamento': 'badge--tratamento'
  };

  card.innerHTML = `
    <!-- Área da foto com badges e botão favorito -->
    <div class="card-animal__foto-wrapper" onclick="abrirLightbox(${animal.id})">
      <img src="${animal.foto}" alt="${animal.nome}, cão ${animal.porte.toLowerCase()} de ${animal.idade}" class="card-animal__foto" loading="lazy">
      <div class="card-animal__badges">
        <span class="badge ${statusClasse[animal.status] || 'badge--disponivel'}">${animal.status}</span>
        ${animal.novo ? '<span class="badge badge--novo">Novo</span>' : ''}
      </div>
    </div>

    <!-- Botão de favoritar (coração) -->
    <button class="card-animal__favorito ${isFavorito ? 'ativo' : ''}" onclick="event.stopPropagation(); toggleFavorito(${animal.id})" aria-label="${isFavorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
      <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
    </button>

    <!-- Informações do animal -->
    <div class="card-animal__info">
      <h3 class="card-animal__nome">${animal.nome}</h3>
      <div class="card-animal__detalhes">
        <span class="card-animal__detalhe">${animal.idade}</span>
        <span class="card-animal__detalhe">•</span>
        <span class="card-animal__detalhe">${animal.porte}</span>
        <span class="card-animal__detalhe">•</span>
        <span class="card-animal__detalhe">${animal.sexo}</span>
      </div>
      <div class="card-animal__icones">
        ${animal.vacinado ? '<span class="card-animal__icone-info"><svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg> Vacinado</span>' : ''}
        ${animal.castrado ? '<span class="card-animal__icone-info"><svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg> Castrado</span>' : ''}
      </div>
      <p class="card-animal__descricao">${animal.descricao}</p>
      <a href="ficha-adocao.html?animal=${animal.id}" class="btn btn--primario btn--sm card-animal__btn">Quero adotar</a>
    </div>
  `;

  return card;
}

// ============================================================
// FILTRAR ANIMAIS — Combina porte + sexo + status + busca
// ============================================================

/**
 * Aplica todos os filtros ativos e rerenderiza o grid.
 * Lê os valores dos filtros diretamente dos botões ativos.
 * @returns {void}
 */
function filtrarAnimais() {
  // Lê o filtro ativo de cada grupo
  const porteAtivo = document.querySelector('[data-filtro="porte"].ativo')?.dataset.valor || 'Todos';
  const sexoAtivo = document.querySelector('[data-filtro="sexo"].ativo')?.dataset.valor || 'Todos';
  const statusAtivo = document.querySelector('[data-filtro="status"].ativo')?.dataset.valor || 'Todos';
  const buscaInput = document.getElementById('busca-animal');
  const busca = buscaInput ? buscaInput.value.toLowerCase().trim() : '';

  // Filtra o array de animais
  let resultado = ANIMAIS.filter(animal => {
    // Filtro de porte
    if (porteAtivo !== 'Todos' && animal.porte !== porteAtivo) return false;
    // Filtro de sexo
    if (sexoAtivo !== 'Todos' && animal.sexo !== sexoAtivo) return false;
    // Filtro de status
    if (statusAtivo !== 'Todos' && animal.status !== statusAtivo) return false;
    // Filtro de busca por nome
    if (busca && !animal.nome.toLowerCase().includes(busca)) return false;
    return true;
  });

  // Rerenderiza com animação
  const grid = document.getElementById('grid-animais');
  if (grid) {
    grid.style.opacity = '0';
    grid.style.transform = 'translateY(10px)';
    setTimeout(() => {
      renderAnimais(resultado);
      grid.style.opacity = '1';
      grid.style.transform = 'translateY(0)';
    }, 200);
  }
}

// ============================================================
// LIGHTBOX — Modal com foto ampliada e info completa
// ============================================================

/**
 * Abre o lightbox com todas as informações de um animal.
 * @param {number} id - ID do animal para exibir
 * @returns {void}
 */
function abrirLightbox(id) {
  const animal = ANIMAIS.find(a => a.id === id);
  if (!animal) return;

  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  // Preenche o conteúdo do lightbox
  const conteudo = lightbox.querySelector('.lightbox__conteudo');
  if (!conteudo) return;

  const statusClasse = {
    'Disponível': 'badge--disponivel',
    'Reservado': 'badge--reservado',
    'Em Tratamento': 'badge--tratamento'
  };

  conteudo.innerHTML = `
    <button class="lightbox__fechar" onclick="fecharLightbox()" aria-label="Fechar">
      <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
    </button>
    <img src="${animal.foto}" alt="${animal.nome}" class="lightbox__imagem">
    <div class="lightbox__info">
      <div style="display:flex;gap:0.5rem;margin-bottom:0.75rem;">
        <span class="badge ${statusClasse[animal.status]}">${animal.status}</span>
        ${animal.novo ? '<span class="badge badge--novo">Novo</span>' : ''}
      </div>
      <h2 class="lightbox__nome">${animal.nome}</h2>
      <div class="lightbox__meta">
        <span>${animal.idade}</span>
        <span>•</span>
        <span>Porte ${animal.porte}</span>
        <span>•</span>
        <span>${animal.sexo}</span>
        <span>•</span>
        <span>${animal.castrado ? 'Castrado' : 'Não castrado'}</span>
        <span>•</span>
        <span>${animal.vacinado ? 'Vacinado' : 'Vacinação pendente'}</span>
      </div>
      <p class="lightbox__descricao">${animal.descricao}</p>
      <div class="lightbox__historico">
        <strong>Histórico de resgate:</strong> ${animal.historico}
      </div>
      <a href="ficha-adocao.html?animal=${animal.id}" class="btn btn--primario" style="width:100%;justify-content:center;">
        🐾 Quero adotar ${animal.nome}
      </a>
    </div>
  `;

  // Exibe o lightbox
  lightbox.classList.add('ativo');
  document.body.style.overflow = 'hidden';

  // Foco preso no modal (acessibilidade)
  conteudo.focus();
}

/**
 * Fecha o lightbox e restaura o scroll.
 * @returns {void}
 */
function fecharLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  lightbox.classList.remove('ativo');
  document.body.style.overflow = '';
}

// ============================================================
// FAVORITOS — Salva/remove no localStorage
// ============================================================

/**
 * Alterna o estado de favorito de um animal.
 * Se já é favorito, remove; se não é, adiciona.
 * @param {number} id - ID do animal
 * @returns {void}
 */
function toggleFavorito(id) {
  let favoritos = carregarFavoritos();

  const index = favoritos.indexOf(id);
  if (index > -1) {
    // Remove dos favoritos
    favoritos.splice(index, 1);
    if (typeof showToast === 'function') {
      showToast('Removido dos favoritos', 'info');
    }
  } else {
    // Adiciona aos favoritos
    favoritos.push(id);
    if (typeof showToast === 'function') {
      showToast('Adicionado aos favoritos!', 'sucesso');
    }
  }

  // Salva no localStorage
  localStorage.setItem(FAVORITOS_KEY, JSON.stringify(favoritos));

  // Atualiza visual do botão de coração
  const btn = document.querySelector(`.card-animal[data-id="${id}"] .card-animal__favorito`);
  if (btn) {
    btn.classList.toggle('ativo');
  }

  // Atualiza contador e seção de favoritos
  atualizarContadorFav();
  renderFavoritos();
}

/**
 * Recupera a lista de IDs favoritos do localStorage.
 * @returns {Array<number>} Array de IDs de animais favoritos
 */
function carregarFavoritos() {
  try {
    const dados = localStorage.getItem(FAVORITOS_KEY);
    return dados ? JSON.parse(dados) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Atualiza o badge de contagem de favoritos no header.
 * @returns {void}
 */
function atualizarContadorFav() {
  const badge = document.getElementById('fav-count');
  if (!badge) return;

  const favoritos = carregarFavoritos();
  badge.textContent = favoritos.length;
  badge.style.display = favoritos.length > 0 ? 'inline-flex' : 'none';
}

/**
 * Renderiza a seção colapsável de favoritos no topo do grid.
 * @returns {void}
 */
function renderFavoritos() {
  const secao = document.getElementById('favoritos-secao');
  if (!secao) return;

  const favoritos = carregarFavoritos();
  const grid = secao.querySelector('.favoritos-secao__grid');

  if (favoritos.length === 0) {
    secao.classList.remove('ativo');
    return;
  }

  secao.classList.add('ativo');

  if (grid) {
    grid.innerHTML = '';
    const animaisFav = ANIMAIS.filter(a => favoritos.includes(a.id));
    animaisFav.forEach(animal => {
      const mini = document.createElement('div');
      mini.style.cssText = 'display:flex;align-items:center;gap:0.5rem;padding:0.5rem;background:var(--cor-branco);border-radius:var(--raio-sm);';
      mini.innerHTML = `
        <img src="${animal.foto}" alt="${animal.nome}" style="width:50px;height:50px;border-radius:var(--raio-sm);object-fit:cover;">
        <div>
          <strong style="font-size:var(--tamanho-sm);">${animal.nome}</strong>
          <p style="font-size:var(--tamanho-xs);color:var(--cor-cinza-medio);margin:0;">${animal.porte} • ${animal.sexo}</p>
        </div>
      `;
      grid.appendChild(mini);
    });
  }
}

// ============================================================
// INICIALIZAÇÃO — Página de adoção (adote.html)
// ============================================================

/**
 * Inicializa a página de adoção completa.
 * Configura filtros, renderiza animais e carrega favoritos.
 * Executada apenas na página adote.html.
 * @returns {void}
 */
function initAdote() {
  // Verifica se estamos na página de adoção (grid principal existe)
  const gridPrincipal = document.getElementById('grid-animais');
  if (!gridPrincipal) return;

  // Renderiza todos os animais inicialmente
  renderAnimais(ANIMAIS);

  // Configura os botões de filtro
  const filtros = document.querySelectorAll('.filtro-btn');
  filtros.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove 'ativo' dos botões do mesmo grupo
      const grupo = btn.dataset.filtro;
      document.querySelectorAll(`[data-filtro="${grupo}"]`).forEach(b => b.classList.remove('ativo'));
      // Ativa o botão clicado
      btn.classList.add('ativo');
      // Reaplica filtros
      filtrarAnimais();
    });
  });

  // Configura busca por nome em tempo real
  const buscaInput = document.getElementById('busca-animal');
  if (buscaInput) {
    buscaInput.addEventListener('input', filtrarAnimais);
  }

  // Carrega favoritos e atualiza visual
  atualizarContadorFav();
  renderFavoritos();

  // Fecha lightbox com tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharLightbox();
  });

  // Fecha lightbox ao clicar no overlay
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    lightbox.querySelector('.lightbox__overlay')?.addEventListener('click', fecharLightbox);
  }
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initAdote);

// ============================================================
// FIM DO ARQUIVO adote.js
// ============================================================
