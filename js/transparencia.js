// ============================================================
// ARQUIVO: transparencia.js
// DESCRIÇÃO: Controla os dados e gráficos financeiros da página
//            de transparência. Todos os dados são simulados em
//            JavaScript — a ONG pode substituir facilmente.
// DEPENDÊNCIAS: main.js (toast notifications)
// ÚLTIMA ATUALIZAÇÃO: 2025
//
// ÍNDICE DE FUNÇÕES:
//   - renderResumo(periodo)        → Atualiza cards receita/despesa/saldo
//   - renderGraficoBarras(dados)   → Desenha barras horizontais CSS
//   - renderGraficoPizza(dados)    → Aplica conic-gradient no círculo
//   - renderTabela(dados)          → Preenche tabela de movimentações
//   - filtrarTabela(categoria)     → Filtra linhas por categoria
//   - selecionarPeriodo(id)        → Atualiza todos os componentes
//   - animarBarras()               → Dispara animação ao entrar viewport
//   - imprimirRelatorio()          → Prepara e dispara window.print()
//   - initTransparencia()          → Inicializa a página
// ============================================================

'use strict';

// ============================================================
// DADOS FINANCEIROS — Objeto com dados por período
// Para atualizar: edite os valores abaixo. A interface se
// ajusta automaticamente.
//
// Estrutura:
//   periodo → string identificadora
//   label   → texto exibido no botão de seleção
//   resumo  → { recebido, gasto, saldo }
//   gastos  → array de { categoria, valor, percentual }
//   receitas → array de { fonte, valor, percentual, cor }
//   movimentacoes → array de { data, descricao, categoria,
//                               entrada, saida, saldo }
// ============================================================

const DADOS_FINANCEIROS = {
  '2025-1': {
    label: '1º Semestre 2025',
    resumo: {
      recebido: 28450.00,
      gasto: 24890.00,
      saldo: 3560.00
    },
    gastos: [
      { categoria: 'Alimentação', valor: 8200, percentual: 33 },
      { categoria: 'Atend. Veterinário', valor: 7100, percentual: 28 },
      { categoria: 'Medicamentos', valor: 4500, percentual: 18 },
      { categoria: 'Resgates / Transporte', valor: 2800, percentual: 11 },
      { categoria: 'Manutenção do Abrigo', valor: 1490, percentual: 6 },
      { categoria: 'Campanhas / Comunicação', valor: 800, percentual: 3 }
    ],
    receitas: [
      { fonte: 'Doações Avulsas', valor: 12802, percentual: 45, cor: '#E87722' },
      { fonte: 'Associados Mensais', valor: 7112, percentual: 25, cor: '#8B5E3C' },
      { fonte: 'Apadrinhos', valor: 5690, percentual: 20, cor: '#4A8F5C' },
      { fonte: 'Loja Solidária', valor: 2845, percentual: 10, cor: '#C9611A' }
    ],
    movimentacoes: [
      { data: '02/01/2025', descricao: 'Doação — Ana S.', categoria: 'Doação', entrada: 200.00, saida: 0, saldo: 1760.00 },
      { data: '05/01/2025', descricao: 'Compra de ração (500kg)', categoria: 'Alimentação', entrada: 0, saida: 1850.00, saldo: -90.00 },
      { data: '10/01/2025', descricao: 'Associado mensal — Carlos M.', categoria: 'Associado', entrada: 50.00, saida: 0, saldo: -40.00 },
      { data: '15/01/2025', descricao: 'Consulta veterinária — Thor', categoria: 'Veterinário', entrada: 0, saida: 350.00, saldo: -390.00 },
      { data: '20/01/2025', descricao: 'Doação via PIX — Família Lima', categoria: 'Doação', entrada: 500.00, saida: 0, saldo: 110.00 },
      { data: '02/02/2025', descricao: 'Vacinas (lote mensal)', categoria: 'Medicamentos', entrada: 0, saida: 780.00, saldo: -670.00 },
      { data: '10/02/2025', descricao: 'Apadrinhamento — Roberto e Maria', categoria: 'Apadrinhamento', entrada: 200.00, saida: 0, saldo: -470.00 },
      { data: '15/02/2025', descricao: 'Resgate — combustível e transporte', categoria: 'Transporte', entrada: 0, saida: 180.00, saldo: -650.00 },
      { data: '20/02/2025', descricao: 'Loja Solidária — vendas fevereiro', categoria: 'Loja Solidária', entrada: 420.00, saida: 0, saldo: -230.00 },
      { data: '01/03/2025', descricao: 'Doação corporativa — Pet Shop Amigo', categoria: 'Doação', entrada: 1500.00, saida: 0, saldo: 1270.00 },
      { data: '10/03/2025', descricao: 'Compra de ração (500kg)', categoria: 'Alimentação', entrada: 0, saida: 1850.00, saldo: -580.00 },
      { data: '15/03/2025', descricao: 'Cirurgia de emergência — Bento', categoria: 'Veterinário', entrada: 0, saida: 2200.00, saldo: -2780.00 },
      { data: '20/03/2025', descricao: 'Campanha de arrecadação online', categoria: 'Doação', entrada: 3500.00, saida: 0, saldo: 720.00 },
      { data: '01/04/2025', descricao: 'Manutenção — conserto de canis', categoria: 'Manutenção', entrada: 0, saida: 890.00, saldo: -170.00 },
      { data: '15/04/2025', descricao: 'Doações diversas PIX', categoria: 'Doação', entrada: 3730.00, saida: 0, saldo: 3560.00 }
    ]
  },
  '2024-2': {
    label: '2º Semestre 2024',
    resumo: {
      recebido: 24200.00,
      gasto: 22800.00,
      saldo: 1400.00
    },
    gastos: [
      { categoria: 'Alimentação', valor: 7500, percentual: 33 },
      { categoria: 'Atend. Veterinário', valor: 6400, percentual: 28 },
      { categoria: 'Medicamentos', valor: 4100, percentual: 18 },
      { categoria: 'Resgates / Transporte', valor: 2500, percentual: 11 },
      { categoria: 'Manutenção do Abrigo', valor: 1400, percentual: 6 },
      { categoria: 'Campanhas / Comunicação', valor: 900, percentual: 4 }
    ],
    receitas: [
      { fonte: 'Doações Avulsas', valor: 10890, percentual: 45, cor: '#E87722' },
      { fonte: 'Associados Mensais', valor: 6050, percentual: 25, cor: '#8B5E3C' },
      { fonte: 'Apadrinhos', valor: 4840, percentual: 20, cor: '#4A8F5C' },
      { fonte: 'Loja Solidária', valor: 2420, percentual: 10, cor: '#C9611A' }
    ],
    movimentacoes: [
      { data: '01/07/2024', descricao: 'Compra de ração (400kg)', categoria: 'Alimentação', entrada: 0, saida: 1600.00, saldo: -200.00 },
      { data: '05/07/2024', descricao: 'Doação — Thiago P.', categoria: 'Doação', entrada: 300.00, saida: 0, saldo: 100.00 },
      { data: '10/07/2024', descricao: 'Vacinas trimestrais', categoria: 'Medicamentos', entrada: 0, saida: 950.00, saldo: -850.00 },
      { data: '15/07/2024', descricao: 'Apadrinhamento — 3 padrinhos', categoria: 'Apadrinhamento', entrada: 600.00, saida: 0, saldo: -250.00 },
      { data: '01/08/2024', descricao: 'Feira de adoção — arrecadação', categoria: 'Doação', entrada: 2800.00, saida: 0, saldo: 2550.00 },
      { data: '10/08/2024', descricao: 'Atendimento veterinário mensal', categoria: 'Veterinário', entrada: 0, saida: 1200.00, saldo: 1350.00 },
      { data: '01/09/2024', descricao: 'Loja Solidária — vendas agosto', categoria: 'Loja Solidária', entrada: 580.00, saida: 0, saldo: 1930.00 },
      { data: '15/09/2024', descricao: 'Compra de ração (400kg)', categoria: 'Alimentação', entrada: 0, saida: 1600.00, saldo: 330.00 },
      { data: '01/10/2024', descricao: 'Doação corporativa', categoria: 'Doação', entrada: 2000.00, saida: 0, saldo: 2330.00 },
      { data: '15/10/2024', descricao: 'Resgate — combustível', categoria: 'Transporte', entrada: 0, saida: 250.00, saldo: 2080.00 },
      { data: '01/11/2024', descricao: 'Medicamentos — vermífugos', categoria: 'Medicamentos', entrada: 0, saida: 680.00, saldo: 1400.00 }
    ]
  },
  '2023': {
    label: 'Ano 2023',
    resumo: {
      recebido: 42000.00,
      gasto: 39500.00,
      saldo: 2500.00
    },
    gastos: [
      { categoria: 'Alimentação', valor: 13000, percentual: 33 },
      { categoria: 'Atend. Veterinário', valor: 11000, percentual: 28 },
      { categoria: 'Medicamentos', valor: 7100, percentual: 18 },
      { categoria: 'Resgates / Transporte', valor: 4350, percentual: 11 },
      { categoria: 'Manutenção do Abrigo', valor: 2400, percentual: 6 },
      { categoria: 'Campanhas / Comunicação', valor: 1650, percentual: 4 }
    ],
    receitas: [
      { fonte: 'Doações Avulsas', valor: 18900, percentual: 45, cor: '#E87722' },
      { fonte: 'Associados Mensais', valor: 10500, percentual: 25, cor: '#8B5E3C' },
      { fonte: 'Apadrinhos', valor: 8400, percentual: 20, cor: '#4A8F5C' },
      { fonte: 'Loja Solidária', valor: 4200, percentual: 10, cor: '#C9611A' }
    ],
    movimentacoes: [
      { data: '15/01/2023', descricao: 'Doações de janeiro', categoria: 'Doação', entrada: 3200.00, saida: 0, saldo: 3200.00 },
      { data: '01/02/2023', descricao: 'Compra de ração trimestral', categoria: 'Alimentação', entrada: 0, saida: 4500.00, saldo: -1300.00 },
      { data: '01/04/2023', descricao: 'Campanha de Páscoa', categoria: 'Doação', entrada: 5600.00, saida: 0, saldo: 4300.00 },
      { data: '15/05/2023', descricao: 'Vacinas anuais (lote)', categoria: 'Medicamentos', entrada: 0, saida: 3200.00, saldo: 1100.00 },
      { data: '01/07/2023', descricao: 'Doações do semestre', categoria: 'Doação', entrada: 8500.00, saida: 0, saldo: 9600.00 },
      { data: '01/08/2023', descricao: 'Reforma parcial do abrigo', categoria: 'Manutenção', entrada: 0, saida: 2400.00, saldo: 7200.00 },
      { data: '01/10/2023', descricao: 'Campanha online de arrecadação', categoria: 'Doação', entrada: 6800.00, saida: 0, saldo: 14000.00 },
      { data: '15/11/2023', descricao: 'Atendimento veterinário anual', categoria: 'Veterinário', entrada: 0, saida: 11000.00, saldo: 3000.00 },
      { data: '20/12/2023', descricao: 'Loja Solidária — vendas do ano', categoria: 'Loja Solidária', entrada: 4200.00, saida: 0, saldo: 7200.00 },
      { data: '31/12/2023', descricao: 'Despesas operacionais dez', categoria: 'Transporte', entrada: 0, saida: 4700.00, saldo: 2500.00 }
    ]
  }
};

// Período selecionado atualmente
let periodoAtual = '2025-1';

// ============================================================
// RENDERIZAR RESUMO — Cards de receita, despesa e saldo
// ============================================================

/**
 * Atualiza os 3 cards de resumo financeiro com os dados do período.
 * @param {string} periodo - Chave do período em DADOS_FINANCEIROS
 * @returns {void}
 */
function renderResumo(periodo) {
  const dados = DADOS_FINANCEIROS[periodo];
  if (!dados) return;

  const elRecebido = document.getElementById('valor-recebido');
  const elGasto = document.getElementById('valor-gasto');
  const elSaldo = document.getElementById('valor-saldo');

  if (elRecebido) elRecebido.textContent = formatarMoeda(dados.resumo.recebido);
  if (elGasto) elGasto.textContent = formatarMoeda(dados.resumo.gasto);
  if (elSaldo) elSaldo.textContent = formatarMoeda(dados.resumo.saldo);
}

// ============================================================
// GRÁFICO DE BARRAS — Gastos por categoria (CSS puro)
// ============================================================

/**
 * Renderiza as barras horizontais de gastos por categoria.
 * As barras são <div>s com largura proporcional ao percentual.
 * @param {string} periodo - Chave do período
 * @returns {void}
 */
function renderGraficoBarras(periodo) {
  const dados = DADOS_FINANCEIROS[periodo];
  if (!dados) return;

  const container = document.getElementById('grafico-barras');
  if (!container) return;

  container.innerHTML = '';

  dados.gastos.forEach(item => {
    const row = document.createElement('div');
    row.classList.add('barra-item');

    row.innerHTML = `
      <span class="barra-item__label">${item.categoria}</span>
      <div class="barra-item__track">
        <div class="barra-item__fill" data-largura="${item.percentual}" style="width:0%">
          <span>${item.percentual}%</span>
        </div>
      </div>
      <span class="barra-item__valor">${formatarMoeda(item.valor)}</span>
    `;

    container.appendChild(row);
  });

  // Anima as barras após um breve delay (para que o DOM já esteja pronto)
  setTimeout(animarBarras, 100);
}

// ============================================================
// GRÁFICO DE PIZZA — Fontes de receita (conic-gradient CSS)
// ============================================================

/**
 * Renderiza o gráfico de pizza usando conic-gradient CSS.
 * @param {string} periodo - Chave do período
 * @returns {void}
 */
function renderGraficoPizza(periodo) {
  const dados = DADOS_FINANCEIROS[periodo];
  if (!dados) return;

  const pizza = document.getElementById('grafico-pizza');
  const legenda = document.getElementById('grafico-pizza-legenda');

  if (!pizza || !legenda) return;

  // Monta o conic-gradient a partir dos percentuais
  let gradientParts = [];
  let acumulado = 0;

  dados.receitas.forEach(item => {
    const inicio = acumulado;
    acumulado += item.percentual;
    gradientParts.push(`${item.cor} ${inicio}% ${acumulado}%`);
  });

  pizza.style.background = `conic-gradient(${gradientParts.join(', ')})`;

  // Renderiza a legenda
  legenda.innerHTML = '';
  dados.receitas.forEach(item => {
    const el = document.createElement('div');
    el.classList.add('legenda-item');
    el.innerHTML = `
      <span class="legenda-item__cor" style="background-color:${item.cor};"></span>
      <span class="legenda-item__texto">${item.fonte}</span>
      <span class="legenda-item__valor">${item.percentual}%</span>
    `;
    legenda.appendChild(el);
  });
}

// ============================================================
// TABELA DE MOVIMENTAÇÕES — Preenchimento e filtro
// ============================================================

/**
 * Preenche a tabela de movimentações com os dados do período.
 * @param {string} periodo - Chave do período
 * @returns {void}
 */
function renderTabela(periodo) {
  const dados = DADOS_FINANCEIROS[periodo];
  if (!dados) return;

  const tbody = document.getElementById('tabela-body');
  if (!tbody) return;

  preencherTabela(tbody, dados.movimentacoes);
}

/**
 * Preenche o tbody da tabela com as movimentações fornecidas.
 * @param {HTMLElement} tbody - Elemento tbody da tabela
 * @param {Array} movimentacoes - Array de movimentações
 */
function preencherTabela(tbody, movimentacoes) {
  tbody.innerHTML = '';

  movimentacoes.forEach(mov => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${mov.data}</td>
      <td>${mov.descricao}</td>
      <td><span class="badge badge--categoria">${mov.categoria}</span></td>
      <td class="${mov.entrada > 0 ? 'valor-entrada' : ''}">${mov.entrada > 0 ? formatarMoeda(mov.entrada) : '—'}</td>
      <td class="${mov.saida > 0 ? 'valor-saida' : ''}">${mov.saida > 0 ? formatarMoeda(mov.saida) : '—'}</td>
      <td style="font-weight:700;">${formatarMoeda(mov.saldo)}</td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Filtra as linhas da tabela pela categoria selecionada.
 * @param {string} categoria - Nome da categoria ou 'Todas'
 * @returns {void}
 */
function filtrarTabela(categoria) {
  const dados = DADOS_FINANCEIROS[periodoAtual];
  if (!dados) return;

  const tbody = document.getElementById('tabela-body');
  if (!tbody) return;

  if (categoria === 'Todas') {
    preencherTabela(tbody, dados.movimentacoes);
  } else {
    const filtradas = dados.movimentacoes.filter(m => m.categoria === categoria);
    preencherTabela(tbody, filtradas);
  }
}

// ============================================================
// SELECIONAR PERÍODO — Atualiza todos os componentes
// ============================================================

/**
 * Seleciona um período e atualiza todos os gráficos e tabelas.
 * @param {string} periodo - Chave do período
 * @returns {void}
 */
function selecionarPeriodo(periodo) {
  periodoAtual = periodo;

  // Atualiza botões do seletor
  document.querySelectorAll('.periodo-btn').forEach(btn => {
    btn.classList.toggle('ativo', btn.dataset.periodo === periodo);
  });

  // Atualiza todos os componentes
  renderResumo(periodo);
  renderGraficoBarras(periodo);
  renderGraficoPizza(periodo);
  renderTabela(periodo);

  // Reseta o filtro da tabela
  const filtroSelect = document.getElementById('filtro-tabela');
  if (filtroSelect) filtroSelect.value = 'Todas';
}

// ============================================================
// ANIMAR BARRAS — Dispara animação de crescimento
// ============================================================

/**
 * Anima as barras do gráfico de gastos.
 * Usa IntersectionObserver para disparar ao entrar no viewport,
 * ou dispara imediatamente se já estiver visível.
 * @returns {void}
 */
function animarBarras() {
  const barras = document.querySelectorAll('.barra-item__fill');

  barras.forEach(barra => {
    const largura = barra.dataset.largura;
    // Usa um timeout curto para garantir a transição CSS
    setTimeout(() => {
      barra.style.width = `${largura}%`;
    }, 50);
  });
}

// ============================================================
// IMPRIMIR RELATÓRIO — Prepara e dispara window.print()
// ============================================================

/**
 * Preenche o cabeçalho de impressão e dispara a impressão.
 * @returns {void}
 */
function imprimirRelatorio() {
  // Preenche data no cabeçalho de impressão
  const printData = document.getElementById('print-data');
  if (printData) {
    printData.textContent = `Gerado em ${new Date().toLocaleDateString('pt-BR')}`;
  }

  // Preenche título do período
  const printPeriodo = document.getElementById('print-periodo');
  if (printPeriodo) {
    const dados = DADOS_FINANCEIROS[periodoAtual];
    printPeriodo.textContent = dados ? dados.label : '';
  }

  // Dispara impressão
  window.print();
}

// ============================================================
// UTILITÁRIO — Formatar valor em Reais
// ============================================================

/**
 * Formata um número como moeda brasileira (R$ X.XXX,XX).
 * @param {number} valor - Valor numérico
 * @returns {string} Valor formatado
 */
function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

// ============================================================
// INICIALIZAÇÃO — Página de transparência
// ============================================================

/**
 * Inicializa a página de transparência.
 * Configura seletores de período, filtros e renderiza dados.
 * @returns {void}
 */
function initTransparencia() {
  // Verifica se estamos na página de transparência
  const container = document.getElementById('transparencia-page');
  if (!container) return;

  // Configura botões de período
  document.querySelectorAll('.periodo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selecionarPeriodo(btn.dataset.periodo);
    });
  });

  // Configura filtro da tabela
  const filtroSelect = document.getElementById('filtro-tabela');
  if (filtroSelect) {
    filtroSelect.addEventListener('change', (e) => {
      filtrarTabela(e.target.value);
    });
  }

  // Configura botão de impressão
  const btnImprimir = document.getElementById('btn-imprimir');
  if (btnImprimir) {
    btnImprimir.addEventListener('click', imprimirRelatorio);
  }

  // Renderiza dados do período inicial
  selecionarPeriodo(periodoAtual);
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initTransparencia);

// ============================================================
// FIM DO ARQUIVO transparencia.js
// ============================================================
