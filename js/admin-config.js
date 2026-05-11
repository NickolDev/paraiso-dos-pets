'use strict';

let periodoAdminAtual = '2025-1';
let gastosTemp = [];

function adminConfigState(containerId, title, text = '', iconPath = '') {
  const container = document.getElementById(containerId);
  if (!container) return;

  SafeDOM.clear(container);
  const vazio = SafeDOM.el('div', { className: 'admin-vazio' });
  if (iconPath) {
    vazio.appendChild(SafeDOM.el('svg', {
      attrs: { viewBox: '0 0 24 24', 'aria-hidden': 'true' },
      html: `<path d="${iconPath}"/>`
    }));
  }
  vazio.appendChild(SafeDOM.el('p', { className: 'admin-vazio__titulo', text: title }));
  if (text) vazio.appendChild(SafeDOM.el('p', { className: 'admin-vazio__texto', text }));
  container.appendChild(vazio);
}

function createConfigField(label, control, options = {}) {
  const { id, help } = options;
  const group = SafeDOM.el('div', { className: 'admin-campo-grupo' });
  group.appendChild(SafeDOM.el('label', {
    className: 'admin-campo-label',
    attrs: id ? { for: id } : undefined,
    text: label
  }));
  group.appendChild(control);
  if (help) {
    const helpNode = SafeDOM.el('small');
    helpNode.style.color = 'var(--cor-cinza-medio)';
    helpNode.style.fontSize = '0.75rem';
    helpNode.style.display = 'block';
    helpNode.style.marginTop = '0.3rem';
    if (Array.isArray(help)) {
      SafeDOM.append(helpNode, help);
    } else {
      helpNode.textContent = help;
    }
    group.appendChild(helpNode);
  }
  return group;
}

function createSectionTitle(text) {
  const title = SafeDOM.el('h4', { text });
  title.style.margin = '1.5rem 0 1rem';
  title.style.color = 'var(--cor-secundaria)';
  title.style.paddingBottom = '0.5rem';
  title.style.borderBottom = '2px solid var(--cor-bege-medio)';
  return title;
}

function createInput(id, type, value = '', placeholder = '') {
  return SafeDOM.el('input', {
    className: 'admin-campo-input',
    attrs: { id, type, placeholder },
    value
  });
}

function createNumberInput(id, value, options = {}) {
  return SafeDOM.el('input', {
    className: 'admin-campo-input',
    attrs: {
      id,
      type: 'number',
      min: options.min !== undefined ? String(options.min) : undefined,
      max: options.max !== undefined ? String(options.max) : undefined,
      step: options.step !== undefined ? String(options.step) : undefined,
      placeholder: options.placeholder || ''
    },
    value
  });
}

function createFormLine(columns = '') {
  const line = SafeDOM.el('div', { className: 'admin-campos-linha' });
  if (columns) line.style.gridTemplateColumns = columns;
  return line;
}

async function carregarTransparenciaAdmin() {
  adminConfigState(
    'conteudo-transparencia',
    'Carregando dados financeiros...',
    '',
    'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z'
  );

  try {
    const periodos = await buscarTodosTransparencia();
    if (periodos.length === 0) {
      adminConfigState(
        'conteudo-transparencia',
        'Nenhum dado financeiro cadastrado',
        'Cadastre um período manualmente ou importe os dados iniciais.',
        'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z'
      );
      return;
    }

    renderSeletorTransparencia(periodos, document.getElementById('conteudo-transparencia'));
  } catch (erro) {
    console.error('Erro ao carregar transparência:', erro);
    adminConfigState('conteudo-transparencia', 'Erro ao carregar.');
  }
}

function renderSeletorTransparencia(periodos, container) {
  if (!container) return;

  const periodosOrdenados = [...periodos].sort((a, b) => (b.id || '').localeCompare(a.id || ''));
  if (!periodosOrdenados.find((item) => item.id === periodoAdminAtual)) {
    periodoAdminAtual = periodosOrdenados[0]?.id || '2025-1';
  }

  const atual = periodosOrdenados.find((item) => item.id === periodoAdminAtual);

  SafeDOM.clear(container);

  const selector = SafeDOM.el('div');
  selector.style.display = 'flex';
  selector.style.gap = '0.5rem';
  selector.style.flexWrap = 'wrap';
  selector.style.marginBottom = '1.5rem';

  periodosOrdenados.forEach((periodo) => {
    const button = SafeDOM.el('button', {
      className: `status-badge ${periodo.id === periodoAdminAtual ? 'status-badge--disponivel' : 'status-badge--rascunho'}`,
      text: periodo.label || periodo.id,
      attrs: { type: 'button' },
      listeners: {
        click: () => {
          periodoAdminAtual = periodo.id;
          carregarTransparenciaAdmin();
        }
      }
    });
    button.style.cursor = 'pointer';
    button.style.border = 'none';
    button.style.fontFamily = 'var(--fonte-corpo)';
    button.style.padding = '0.4rem 1rem';
    button.style.fontSize = '0.85rem';
    selector.appendChild(button);
  });

  const formContainer = SafeDOM.el('div', { attrs: { id: 'form-transparencia-container' } });
  container.appendChild(selector);
  container.appendChild(formContainer);

  if (atual) renderFormTransparencia(atual);
}

function renderFormTransparencia(dados) {
  const container = document.getElementById('form-transparencia-container');
  if (!container) return;

  gastosTemp = Array.isArray(dados.gastos)
    ? dados.gastos.map((gasto) => ({ ...gasto }))
    : [];

  const resumo = dados.resumo || { recebido: 0, gasto: 0, saldo: 0 };

  SafeDOM.clear(container);
  const card = SafeDOM.el('div', { className: 'admin-form-card' });
  card.style.maxWidth = '800px';
  card.appendChild(SafeDOM.el('h3', {
    className: 'admin-form-card__titulo',
    text: `Editar: ${dados.label || periodoAdminAtual}`
  }));

  const form = SafeDOM.el('form', { attrs: { id: 'form-transparencia-admin' } });
  form.addEventListener('submit', (event) => event.preventDefault());

  form.appendChild(createConfigField('Nome do período', createInput('trans-label', 'text', dados.label || '', 'Ex: 1º Semestre 2025'), { id: 'trans-label' }));

  const resumoTitulo = SafeDOM.el('h4', { text: 'Resumo Financeiro' });
  resumoTitulo.style.margin = '1.5rem 0 0.75rem';
  resumoTitulo.style.color = 'var(--cor-secundaria)';
  form.appendChild(resumoTitulo);

  const resumoLine = createFormLine('1fr 1fr 1fr');
  resumoLine.appendChild(createConfigField('Total Recebido (R$)', createNumberInput('trans-recebido', resumo.recebido, { min: 0, step: '0.01', placeholder: '0.00' }), { id: 'trans-recebido' }));
  resumoLine.appendChild(createConfigField('Total Gasto (R$)', createNumberInput('trans-gasto', resumo.gasto, { min: 0, step: '0.01', placeholder: '0.00' }), { id: 'trans-gasto' }));
  resumoLine.appendChild(createConfigField('Saldo (R$)', createNumberInput('trans-saldo', resumo.saldo, { step: '0.01', placeholder: '0.00' }), { id: 'trans-saldo' }));
  form.appendChild(resumoLine);

  const gastosHeader = SafeDOM.el('div');
  gastosHeader.style.display = 'flex';
  gastosHeader.style.alignItems = 'center';
  gastosHeader.style.gap = '0.75rem';
  gastosHeader.style.margin = '1.5rem 0 0.75rem';
  gastosHeader.appendChild(SafeDOM.el('h4', { text: 'Gastos por Categoria' }));
  const addGastoButton = SafeDOM.el('button', {
    className: 'btn--adicionar',
    attrs: { type: 'button' },
    listeners: { click: adicionarLinhaGasto }
  }, [
    SafeDOM.el('svg', {
      attrs: { viewBox: '0 0 24 24', 'aria-hidden': 'true' },
      html: '<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>'
    }),
    document.createTextNode(' Adicionar')
  ]);
  addGastoButton.style.fontSize = '0.75rem';
  addGastoButton.style.padding = '0.3rem 0.8rem';
  gastosHeader.appendChild(addGastoButton);
  form.appendChild(gastosHeader);

  form.appendChild(SafeDOM.el('div', { attrs: { id: 'lista-gastos-admin' } }));
  refreshListaGastos();

  form.appendChild(createSectionTitle('Fontes de Receita (%)'));
  const receitasLine1 = createFormLine();
  receitasLine1.appendChild(createConfigField('Doações Avulsas (%)', createNumberInput('receita-doacoes-avulsas', getReceitaPercentual(dados, 'Doações Avulsas'), {
    min: 0, max: 100
  }), { id: 'receita-doacoes-avulsas' }));
  receitasLine1.lastChild.querySelector('input').dataset.fonte = 'Doações Avulsas';
  receitasLine1.lastChild.querySelector('input').dataset.cor = '#00B4B4';
  receitasLine1.appendChild(createConfigField('Associados Mensais (%)', createNumberInput('receita-associados-mensais', getReceitaPercentual(dados, 'Associados Mensais'), {
    min: 0, max: 100
  }), { id: 'receita-associados-mensais' }));
  receitasLine1.lastChild.querySelector('input').dataset.fonte = 'Associados Mensais';
  receitasLine1.lastChild.querySelector('input').dataset.cor = '#3FBADD';
  form.appendChild(receitasLine1);

  const receitasLine2 = createFormLine();
  receitasLine2.appendChild(createConfigField('Apadrinhos (%)', createNumberInput('receita-apadrinhos', getReceitaPercentual(dados, 'Apadrinhos'), {
    min: 0, max: 100
  }), { id: 'receita-apadrinhos' }));
  receitasLine2.lastChild.querySelector('input').dataset.fonte = 'Apadrinhos';
  receitasLine2.lastChild.querySelector('input').dataset.cor = '#0ACC95';
  receitasLine2.appendChild(createConfigField('Loja Solidária (%)', createNumberInput('receita-loja-solidaria', getReceitaPercentual(dados, 'Loja Solidária'), {
    min: 0, max: 100
  }), { id: 'receita-loja-solidaria' }));
  receitasLine2.lastChild.querySelector('input').dataset.fonte = 'Loja Solidária';
  receitasLine2.lastChild.querySelector('input').dataset.cor = '#0A61C2';
  form.appendChild(receitasLine2);

  form.appendChild(SafeDOM.el('div', { className: 'admin-form-acoes' }, [
    SafeDOM.el('button', {
      className: 'btn--salvar',
      text: 'Salvar Dados Financeiros',
      attrs: { id: 'btn-salvar-transparencia', type: 'button' },
      listeners: { click: salvarTransparenciaAdmin }
    })
  ]));

  card.appendChild(form);
  container.appendChild(card);
}

function renderGastoRow(gasto, index) {
  const row = SafeDOM.el('div', { dataset: { gastoIndex: index } });
  row.style.display = 'grid';
  row.style.gridTemplateColumns = '1fr 120px 80px 32px';
  row.style.gap = '0.5rem';
  row.style.alignItems = 'end';
  row.style.marginBottom = '0.5rem';

  const categoria = createConfigField(
    index === 0 ? 'Categoria' : '',
    createInput(`gasto-categoria-${index}`, 'text', gasto.categoria || '', 'Ex: Alimentação'),
    { id: `gasto-categoria-${index}` }
  );
  categoria.style.margin = '0';
  categoria.querySelector('input').style.padding = '0.5rem 0.75rem';
  categoria.querySelector('input').style.fontSize = '0.85rem';
  categoria.querySelector('input').addEventListener('input', (event) => {
    gastosTemp[index].categoria = event.target.value;
  });

  const valor = createConfigField(
    index === 0 ? 'Valor (R$)' : '',
    createNumberInput(`gasto-valor-${index}`, gasto.valor || 0, { step: '0.01', min: 0 }),
    { id: `gasto-valor-${index}` }
  );
  valor.style.margin = '0';
  valor.querySelector('input').style.padding = '0.5rem 0.75rem';
  valor.querySelector('input').style.fontSize = '0.85rem';
  valor.querySelector('input').addEventListener('input', (event) => {
    gastosTemp[index].valor = parseFloat(event.target.value) || 0;
  });

  const percentual = createConfigField(
    index === 0 ? '%' : '',
    createNumberInput(`gasto-percentual-${index}`, gasto.percentual || 0, { min: 0, max: 100 }),
    { id: `gasto-percentual-${index}` }
  );
  percentual.style.margin = '0';
  percentual.querySelector('input').style.padding = '0.5rem 0.75rem';
  percentual.querySelector('input').style.fontSize = '0.85rem';
  percentual.querySelector('input').addEventListener('input', (event) => {
    gastosTemp[index].percentual = parseInt(event.target.value, 10) || 0;
  });

  const remove = SafeDOM.el('button', {
    className: 'btn-acao btn-acao--remover',
    attrs: { type: 'button', title: 'Remover linha' },
    listeners: { click: () => removerLinhaGasto(index) },
    html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>'
  });
  if (index === 0) remove.style.marginTop = '1.2rem';

  row.appendChild(categoria);
  row.appendChild(valor);
  row.appendChild(percentual);
  row.appendChild(remove);
  return row;
}

function refreshListaGastos() {
  const container = document.getElementById('lista-gastos-admin');
  if (!container) return;

  SafeDOM.clear(container);
  if (gastosTemp.length === 0) {
    const empty = SafeDOM.el('p', { text: 'Nenhum gasto cadastrado. Clique em "Adicionar" acima.' });
    empty.style.color = 'var(--cor-cinza-medio)';
    empty.style.fontSize = '0.85rem';
    container.appendChild(empty);
    return;
  }

  gastosTemp.forEach((gasto, index) => {
    container.appendChild(renderGastoRow(gasto, index));
  });
}

function adicionarLinhaGasto() {
  gastosTemp.push({ categoria: '', valor: 0, percentual: 0 });
  refreshListaGastos();
}

function removerLinhaGasto(index) {
  gastosTemp.splice(index, 1);
  refreshListaGastos();
}

function getReceitaPercentual(dados, fonte) {
  if (!Array.isArray(dados.receitas)) return 0;
  const item = dados.receitas.find((receita) => receita.fonte === fonte);
  return item ? item.percentual : 0;
}

async function salvarTransparenciaAdmin() {
  const label = document.getElementById('trans-label')?.value.trim();
  const recebido = parseFloat(document.getElementById('trans-recebido')?.value) || 0;
  const gasto = parseFloat(document.getElementById('trans-gasto')?.value) || 0;
  const saldo = parseFloat(document.getElementById('trans-saldo')?.value) || 0;

  const receitaInputs = document.querySelectorAll('#form-transparencia-admin input[data-fonte]');
  const receitas = Array.from(receitaInputs).map((input) => ({
    fonte: input.dataset.fonte,
    percentual: parseInt(input.value, 10) || 0,
    cor: input.dataset.cor
  }));

  const gastosLimpos = gastosTemp
    .map((gasto) => ({
      categoria: SafeDOM.toStringValue(gasto.categoria).trim(),
      valor: Number(gasto.valor) || 0,
      percentual: parseInt(gasto.percentual, 10) || 0
    }))
    .filter((gasto) => gasto.categoria && gasto.valor > 0);

  const btnSalvar = document.getElementById('btn-salvar-transparencia');
  if (btnSalvar) {
    btnSalvar.classList.add('btn-loading');
    btnSalvar.disabled = true;
  }

  try {
    const sucesso = await salvarTransparencia(periodoAdminAtual, {
      label,
      resumo: { recebido, gasto, saldo },
      gastos: gastosLimpos,
      receitas
    });

    mostrarToastAdmin(sucesso ? 'Dados financeiros salvos com sucesso!' : 'Erro ao salvar.', sucesso ? 'sucesso' : 'erro');
  } catch (erro) {
    console.error('Erro ao salvar transparência:', erro);
    mostrarToastAdmin('Erro inesperado.', 'erro');
  } finally {
    if (btnSalvar) {
      btnSalvar.classList.remove('btn-loading');
      btnSalvar.disabled = false;
    }
  }
}

async function carregarConfiguracoesAdmin() {
  adminConfigState(
    'conteudo-configuracoes',
    'Carregando configurações...',
    '',
    'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58z'
  );

  try {
    const config = await buscarConfiguracoes();
    let banner = {};
    try {
      const bannerDoc = await db.collection(COLECOES.CONFIGURACOES).doc('banner').get();
      if (bannerDoc.exists) banner = bannerDoc.data();
    } catch (erro) {
      console.warn('Banner opcional indisponível:', erro);
    }

    renderFormConfiguracoes(config || {}, banner || {});
  } catch (erro) {
    console.error('Erro ao carregar configurações:', erro);
    adminConfigState('conteudo-configuracoes', 'Erro ao carregar.');
  }
}

function renderFormConfiguracoes(config, banner) {
  const container = document.getElementById('conteudo-configuracoes');
  if (!container) return;

  SafeDOM.clear(container);
  const card = SafeDOM.el('div', { className: 'admin-form-card' });
  card.style.maxWidth = '800px';
  card.appendChild(SafeDOM.el('h3', { className: 'admin-form-card__titulo', text: 'Configurações Gerais do Site' }));

  const intro = SafeDOM.el('p', { text: 'Altere os dados abaixo para atualizar as informações exibidas em todo o site.' });
  intro.style.color = 'var(--cor-cinza-medio)';
  intro.style.fontSize = '0.85rem';
  intro.style.marginBottom = '1.5rem';
  card.appendChild(intro);

  const form = SafeDOM.el('form', { attrs: { id: 'form-config-admin' } });
  form.addEventListener('submit', (event) => event.preventDefault());

  form.appendChild(createSectionTitle('Dados da ONG'));
  let line = createFormLine();
  line.appendChild(createConfigField('Nome da ONG', createInput('cfg-nome', 'text', config.nomeOng || 'ONG Paraíso dos Pets'), { id: 'cfg-nome' }));
  line.appendChild(createConfigField('Fundador', createInput('cfg-fundador', 'text', config.fundador || 'Luiz Moraes'), { id: 'cfg-fundador' }));
  form.appendChild(line);

  line = createFormLine();
  line.appendChild(createConfigField('Cidade', createInput('cfg-cidade', 'text', config.cidade || 'Ribeirão Preto'), { id: 'cfg-cidade' }));
  line.appendChild(createConfigField('Estado', createInput('cfg-estado', 'text', config.estado || 'SP'), { id: 'cfg-estado' }));
  form.appendChild(line);
  form.appendChild(createConfigField('CNPJ', createInput('cfg-cnpj', 'text', config.cnpj || 'XX.XXX.XXX/0001-XX', 'XX.XXX.XXX/0001-XX'), { id: 'cfg-cnpj' }));

  form.appendChild(createSectionTitle('Contato'));
  line = createFormLine();
  line.appendChild(createConfigField('E-mail', createInput('cfg-email', 'email', config.email || 'contato@ongparaisodospets.org.br'), { id: 'cfg-email' }));
  line.appendChild(createConfigField('WhatsApp (apenas números com DDI)', createInput('cfg-whatsapp', 'text', config.whatsapp || '5516999999999', '5516999999999'), { id: 'cfg-whatsapp' }));
  form.appendChild(line);

  form.appendChild(createSectionTitle('Redes Sociais'));
  line = createFormLine();
  line.appendChild(createConfigField('Instagram (com @)', createInput('cfg-instagram', 'text', config.instagram || '@ongparaisodospets'), { id: 'cfg-instagram' }));
  line.appendChild(createConfigField('YouTube', createInput('cfg-youtube', 'text', config.youtube || '@ONGParaísodosPets'), { id: 'cfg-youtube' }));
  form.appendChild(line);
  form.appendChild(createConfigField('Threads (com @)', createInput('cfg-threads', 'text', config.threads || '@ongparaisodospets'), { id: 'cfg-threads' }));

  form.appendChild(createSectionTitle('Doações e Pagamentos'));
  line = createFormLine();
  line.appendChild(createConfigField('Chave PIX', createInput('cfg-pix', 'text', config.chavePix || 'contato@ongparaisodospets.org.br'), { id: 'cfg-pix' }));
  line.appendChild(createConfigField('Valor de Apadrinhar (R$)', createNumberInput('cfg-apadrinhar', Number(config.valorApadrinhar) || 200, { min: 0 }), { id: 'cfg-apadrinhar' }));
  form.appendChild(line);

  line = createFormLine();
  line.appendChild(createConfigField('Valor de Associar-se (R$)', createNumberInput('cfg-associar', Number(config.valorAssociar) || 50, { min: 0 }), { id: 'cfg-associar' }));
  line.appendChild(SafeDOM.el('div', { className: 'admin-campo-grupo' }));
  form.appendChild(line);

  const mpHelp = [
    document.createTextNode('Use um link oficial de pagamento HTTPS. Se deixar em branco, o botão público redireciona para o WhatsApp. ')
  ];
  const mpLink = SafeDOM.el('a', {
    text: 'mercadopago.com.br/checkout-pro',
    attrs: {
      href: 'https://www.mercadopago.com.br/checkout-pro',
      target: '_blank',
      rel: 'noopener noreferrer'
    }
  });
  mpLink.style.color = 'var(--cor-primaria)';
  mpHelp.push(mpLink);
  form.appendChild(createConfigField('Link de Doação do Mercado Pago', createInput('cfg-mercadopago', 'url', config.mercadoPagoLink || '', 'https://mpago.li/...'), {
    id: 'cfg-mercadopago',
    help: mpHelp
  }));

  form.appendChild(createSectionTitle('Meta Mensal de Arrecadação'));
  line = createFormLine('1fr 1fr 1fr');
  line.appendChild(createConfigField('Meta (R$)', createNumberInput('cfg-meta', Number(config.metaMensal) || 15000, { min: 0 }), { id: 'cfg-meta' }));
  line.appendChild(createConfigField('Arrecadado (R$)', createNumberInput('cfg-arrecadado', Number(config.arrecadadoMensal) || 0, { min: 0 }), { id: 'cfg-arrecadado' }));
  line.appendChild(createConfigField('Mês de referência', createInput('cfg-mes-meta', 'text', config.mesMeta || '', 'Ex: julho/2025'), { id: 'cfg-mes-meta' }));
  form.appendChild(line);

  form.appendChild(createSectionTitle('Horário de Atendimento'));
  line = createFormLine();
  line.appendChild(createConfigField('Segunda a Sexta', createInput('cfg-horario-semana', 'text', config.horarioSemana || 'Segunda a Sexta: 9h – 18h'), { id: 'cfg-horario-semana' }));
  line.appendChild(createConfigField('Sábado', createInput('cfg-horario-sabado', 'text', config.horarioSabado || 'Sábado: 9h – 13h'), { id: 'cfg-horario-sabado' }));
  form.appendChild(line);

  form.appendChild(createSectionTitle('Google Analytics e SEO'));
  const gaHelp = [document.createTextNode('Informe o Measurement ID real no formato G-XXXXXXXXXX.')];
  form.appendChild(createConfigField('ID do Google Analytics (GA4)', createInput('cfg-ga-id', 'text', config.gaId || '', 'G-XXXXXXXXXX'), {
    id: 'cfg-ga-id',
    help: gaHelp
  }));

  form.appendChild(createSectionTitle('Banner de Aviso (Home)'));
  const bannerInfo = SafeDOM.el('p', { text: 'Exibe um banner colorido no topo da home para avisos importantes.' });
  bannerInfo.style.color = 'var(--cor-cinza-medio)';
  bannerInfo.style.fontSize = '0.8rem';
  bannerInfo.style.marginBottom = '1rem';
  form.appendChild(bannerInfo);

  const bannerToggleGroup = SafeDOM.el('div', { className: 'admin-campo-grupo' });
  const bannerToggle = SafeDOM.el('label', {}, [
    SafeDOM.el('input', {
      attrs: { id: 'cfg-banner-ativo', type: 'checkbox' },
      checked: banner.ativo || false
    }),
    document.createTextNode(' Banner ativo')
  ]);
  bannerToggle.style.display = 'flex';
  bannerToggle.style.alignItems = 'center';
  bannerToggle.style.gap = '0.5rem';
  bannerToggle.style.cursor = 'pointer';
  bannerToggle.style.fontSize = '0.95rem';
  bannerToggleGroup.appendChild(bannerToggle);
  form.appendChild(bannerToggleGroup);

  line = createFormLine();
  line.appendChild(createConfigField('Texto do aviso', createInput('cfg-banner-texto', 'text', banner.texto || '', 'Ex: Feira de Adoção dia 15/08 às 9h!'), { id: 'cfg-banner-texto' }));
  line.appendChild(createConfigField('Ícone (emoji)', createInput('cfg-banner-icone', 'text', banner.icone || '📢', '📢'), { id: 'cfg-banner-icone' }));
  line.lastChild.querySelector('input').style.maxWidth = '80px';
  form.appendChild(line);

  line = createFormLine();
  line.appendChild(createConfigField('Link (opcional)', createInput('cfg-banner-link', 'text', banner.link || '', 'https://...'), { id: 'cfg-banner-link' }));
  line.appendChild(createConfigField('Texto do link', createInput('cfg-banner-link-texto', 'text', banner.linkTexto || 'Saiba mais', 'Saiba mais'), { id: 'cfg-banner-link-texto' }));
  form.appendChild(line);

  form.appendChild(SafeDOM.el('div', { className: 'admin-form-acoes' }, [
    SafeDOM.el('button', {
      className: 'btn--salvar',
      text: 'Salvar Configurações',
      attrs: { id: 'btn-salvar-config', type: 'button' },
      listeners: { click: salvarConfiguracoesAdmin }
    })
  ]));

  card.appendChild(form);
  container.appendChild(card);
}

async function salvarConfiguracoesAdmin() {
  const btnSalvar = document.getElementById('btn-salvar-config');
  if (btnSalvar) {
    btnSalvar.classList.add('btn-loading');
    btnSalvar.disabled = true;
  }

  try {
    const mercadoPagoLinkRaw = document.getElementById('cfg-mercadopago')?.value.trim() || '';
    const bannerLinkRaw = document.getElementById('cfg-banner-link')?.value.trim() || '';

    const mercadoPagoLink = mercadoPagoLinkRaw
      ? SafeDOM.safeURL(mercadoPagoLinkRaw, { allowRelative: false, allowHash: false })
      : '';
    const bannerLink = bannerLinkRaw
      ? SafeDOM.safeURL(bannerLinkRaw, { allowRelative: true, allowHash: true })
      : '';

    if (mercadoPagoLinkRaw && !mercadoPagoLink) {
      mostrarToastAdmin('O link do Mercado Pago deve ser uma URL segura (http/https).', 'erro');
      return;
    }

    if (bannerLinkRaw && !bannerLink) {
      mostrarToastAdmin('O link do banner deve ser uma URL segura ou um caminho relativo válido.', 'erro');
      return;
    }

    const dados = {
      nomeOng: document.getElementById('cfg-nome')?.value.trim() || '',
      fundador: document.getElementById('cfg-fundador')?.value.trim() || '',
      cidade: document.getElementById('cfg-cidade')?.value.trim() || '',
      estado: document.getElementById('cfg-estado')?.value.trim() || '',
      cnpj: document.getElementById('cfg-cnpj')?.value.trim() || '',
      email: document.getElementById('cfg-email')?.value.trim() || '',
      whatsapp: document.getElementById('cfg-whatsapp')?.value.trim() || '',
      instagram: document.getElementById('cfg-instagram')?.value.trim() || '',
      youtube: document.getElementById('cfg-youtube')?.value.trim() || '',
      threads: document.getElementById('cfg-threads')?.value.trim() || '',
      chavePix: document.getElementById('cfg-pix')?.value.trim() || '',
      valorApadrinhar: parseFloat(document.getElementById('cfg-apadrinhar')?.value) || 200,
      valorAssociar: parseFloat(document.getElementById('cfg-associar')?.value) || 50,
      mercadoPagoLink,
      metaMensal: parseFloat(document.getElementById('cfg-meta')?.value) || 0,
      arrecadadoMensal: parseFloat(document.getElementById('cfg-arrecadado')?.value) || 0,
      mesMeta: document.getElementById('cfg-mes-meta')?.value.trim() || '',
      horarioSemana: document.getElementById('cfg-horario-semana')?.value.trim() || '',
      horarioSabado: document.getElementById('cfg-horario-sabado')?.value.trim() || '',
      gaId: document.getElementById('cfg-ga-id')?.value.trim() || ''
    };

    const sucesso = await salvarConfiguracoes(dados);

    const bannerDados = {
      ativo: document.getElementById('cfg-banner-ativo')?.checked || false,
      texto: document.getElementById('cfg-banner-texto')?.value.trim() || '',
      icone: document.getElementById('cfg-banner-icone')?.value.trim() || '📢',
      link: bannerLink,
      linkTexto: document.getElementById('cfg-banner-link-texto')?.value.trim() || 'Saiba mais',
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (!verificarAdmin()) {
      mostrarToastAdmin('Faça login novamente.', 'erro');
      return;
    }

    await db.collection(COLECOES.CONFIGURACOES).doc('banner').set(bannerDados, { merge: true });
    mostrarToastAdmin(sucesso ? 'Configurações e banner salvos com sucesso!' : 'Erro ao salvar configurações.', sucesso ? 'sucesso' : 'erro');
  } catch (erro) {
    console.error('Erro ao salvar configurações:', erro);
    mostrarToastAdmin('Erro inesperado.', 'erro');
  } finally {
    if (btnSalvar) {
      btnSalvar.classList.remove('btn-loading');
      btnSalvar.disabled = false;
    }
  }
}
