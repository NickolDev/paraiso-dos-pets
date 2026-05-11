'use strict';

const DADOS_FINANCEIROS = {};
let periodoAtual = '2025-1';

function renderResumo(periodo) {
  const dados = DADOS_FINANCEIROS[periodo];
  if (!dados) return;

  document.getElementById('valor-recebido')?.replaceChildren(document.createTextNode(formatarMoeda(dados.resumo.recebido)));
  document.getElementById('valor-gasto')?.replaceChildren(document.createTextNode(formatarMoeda(dados.resumo.gasto)));
  document.getElementById('valor-saldo')?.replaceChildren(document.createTextNode(formatarMoeda(dados.resumo.saldo)));
}

function renderGraficoBarras(periodo) {
  const dados = DADOS_FINANCEIROS[periodo];
  const container = document.getElementById('grafico-barras');
  if (!dados || !container) return;

  SafeDOM.clear(container);
  dados.gastos.forEach((item) => {
    const fill = SafeDOM.el('div', { className: 'barra-item__fill', dataset: { largura: item.percentual } }, [
      SafeDOM.el('span', { text: `${item.percentual}%` })
    ]);
    fill.style.width = '0%';

    const row = SafeDOM.el('div', { className: 'barra-item' }, [
      SafeDOM.el('span', { className: 'barra-item__label', text: item.categoria || 'Sem categoria' }),
      SafeDOM.el('div', { className: 'barra-item__track' }, [fill]),
      SafeDOM.el('span', { className: 'barra-item__valor', text: formatarMoeda(item.valor || 0) })
    ]);
    container.appendChild(row);
  });

  setTimeout(animarBarras, 100);
}

function renderGraficoPizza(periodo) {
  const dados = DADOS_FINANCEIROS[periodo];
  const pizza = document.getElementById('grafico-pizza');
  const legenda = document.getElementById('grafico-pizza-legenda');
  if (!dados || !pizza || !legenda) return;

  let acumulado = 0;
  const partes = [];
  dados.receitas.forEach((item) => {
    const inicio = acumulado;
    acumulado += item.percentual;
    partes.push(`${item.cor} ${inicio}% ${acumulado}%`);
  });
  pizza.style.background = `conic-gradient(${partes.join(', ')})`;

  SafeDOM.clear(legenda);
  dados.receitas.forEach((item) => {
    const color = SafeDOM.el('span', { className: 'legenda-item__cor' });
    color.style.backgroundColor = item.cor;
    legenda.appendChild(SafeDOM.el('div', { className: 'legenda-item' }, [
      color,
      SafeDOM.el('span', { className: 'legenda-item__texto', text: item.fonte || 'Fonte' }),
      SafeDOM.el('span', { className: 'legenda-item__valor', text: `${item.percentual}%` })
    ]));
  });
}

function renderTabela(periodo) {
  const dados = DADOS_FINANCEIROS[periodo];
  const tbody = document.getElementById('tabela-body');
  if (!dados || !tbody) return;
  preencherTabela(tbody, dados.movimentacoes || []);
}

function preencherTabela(tbody, movimentacoes) {
  SafeDOM.clear(tbody);
  movimentacoes.forEach((mov) => {
    const tr = SafeDOM.el('tr');
    tr.appendChild(SafeDOM.el('td', { text: mov.data || '' }));
    tr.appendChild(SafeDOM.el('td', { text: mov.descricao || '' }));
    tr.appendChild(SafeDOM.el('td', {}, [
      SafeDOM.el('span', { className: 'badge badge--categoria', text: mov.categoria || 'Sem categoria' })
    ]));
    tr.appendChild(SafeDOM.el('td', {
      className: mov.entrada > 0 ? 'valor-entrada' : '',
      text: mov.entrada > 0 ? formatarMoeda(mov.entrada) : '—'
    }));
    tr.appendChild(SafeDOM.el('td', {
      className: mov.saida > 0 ? 'valor-saida' : '',
      text: mov.saida > 0 ? formatarMoeda(mov.saida) : '—'
    }));
    const saldo = SafeDOM.el('td', { text: formatarMoeda(mov.saldo || 0) });
    saldo.style.fontWeight = '700';
    tr.appendChild(saldo);
    tbody.appendChild(tr);
  });
}

function filtrarTabela(categoria) {
  const dados = DADOS_FINANCEIROS[periodoAtual];
  const tbody = document.getElementById('tabela-body');
  if (!dados || !tbody) return;

  if (categoria === 'Todas') {
    preencherTabela(tbody, dados.movimentacoes || []);
    return;
  }

  preencherTabela(tbody, (dados.movimentacoes || []).filter((mov) => mov.categoria === categoria));
}

function selecionarPeriodo(periodo) {
  periodoAtual = periodo;
  document.querySelectorAll('.periodo-btn').forEach((button) => {
    button.classList.toggle('ativo', button.dataset.periodo === periodo);
  });

  renderResumo(periodo);
  renderGraficoBarras(periodo);
  renderGraficoPizza(periodo);
  renderTabela(periodo);
  const filtro = document.getElementById('filtro-tabela');
  if (filtro) filtro.value = 'Todas';
}

function animarBarras() {
  document.querySelectorAll('.barra-item__fill').forEach((barra) => {
    setTimeout(() => {
      barra.style.width = `${barra.dataset.largura || 0}%`;
    }, 50);
  });
}

function imprimirRelatorio() {
  const printData = document.getElementById('print-data');
  if (printData) printData.textContent = `Gerado em ${new Date().toLocaleDateString('pt-BR')}`;
  const printPeriodo = document.getElementById('print-periodo');
  if (printPeriodo) printPeriodo.textContent = DADOS_FINANCEIROS[periodoAtual]?.label || '';
  window.print();
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function renderEmptyTransparencia() {
  const resumoEl = document.getElementById('resumo-financeiro');
  const barrasEl = document.getElementById('grafico-barras');
  const pizzaEl = document.getElementById('grafico-pizza');
  const legendaEl = document.getElementById('grafico-pizza-legenda');
  const tabelaBody = document.getElementById('tabela-body');

  [resumoEl, barrasEl, pizzaEl, legendaEl].forEach((element) => {
    if (!element) return;
    SafeDOM.clear(element);
    const message = SafeDOM.el('div');
    message.style.textAlign = 'center';
    message.style.padding = '2rem';
    message.style.color = 'var(--cor-cinza-medio)';
    message.appendChild(SafeDOM.el('p', { text: 'Os dados financeiros serão publicados em breve.' }));
    element.appendChild(message);
  });

  if (tabelaBody) {
    SafeDOM.clear(tabelaBody);
    const row = SafeDOM.el('tr');
    const cell = SafeDOM.el('td', { text: 'Dados financeiros em breve.', attrs: { colspan: '6' } });
    cell.style.textAlign = 'center';
    cell.style.padding = '2rem';
    cell.style.color = 'var(--cor-cinza-medio)';
    row.appendChild(cell);
    tabelaBody.appendChild(row);
  }
}

function initTransparencia() {
  if (!document.getElementById('transparencia-page')) return;

  if (Object.keys(DADOS_FINANCEIROS).length === 0) {
    renderEmptyTransparencia();
    return;
  }

  document.querySelectorAll('.periodo-btn').forEach((button) => {
    button.addEventListener('click', () => selecionarPeriodo(button.dataset.periodo));
  });
  document.getElementById('filtro-tabela')?.addEventListener('change', (event) => filtrarTabela(event.target.value));
  document.getElementById('btn-imprimir')?.addEventListener('click', imprimirRelatorio);
  selecionarPeriodo(periodoAtual);
}

document.addEventListener('DOMContentLoaded', initTransparencia);
