'use strict';

let _cacheFichas = [];
let _cacheVoluntarios = [];
let _cacheMensagens = [];

function renderAdminState(container, title, text = '') {
  SafeDOM.clear(container);
  const card = SafeDOM.el('div', { className: 'admin-vazio' }, [
    SafeDOM.el('p', { className: 'admin-vazio__titulo', text: title }),
    text ? SafeDOM.el('p', { className: 'admin-vazio__texto', text }) : null
  ]);
  container.appendChild(card);
}

function createActionButton(label, className, handler, attrs = {}) {
  return SafeDOM.el('button', {
    className,
    text: label,
    attrs: { type: 'button', ...attrs },
    listeners: { click: handler }
  });
}

function createTableShell(totalLabel, searchPlaceholder, searchHandler, tableId, headers) {
  const wrapper = SafeDOM.el('div', { className: 'admin-tabela-wrapper' });
  const header = SafeDOM.el('div', { className: 'admin-tabela-header' }, [
    SafeDOM.el('span', { className: 'admin-tabela-header__titulo', text: totalLabel })
  ]);

  if (searchPlaceholder) {
    const actions = SafeDOM.el('div', { className: 'admin-tabela-header__acoes' });
    const input = SafeDOM.el('input', {
      className: 'admin-busca',
      attrs: {
        type: 'text',
        placeholder: searchPlaceholder,
        'aria-label': searchPlaceholder
      }
    });
    input.addEventListener('input', (event) => searchHandler(event.target.value));
    actions.appendChild(input);
    header.appendChild(actions);
  }

  const scrollWrap = SafeDOM.el('div');
  scrollWrap.style.overflowX = 'auto';

  const table = SafeDOM.el('table', { className: 'admin-tabela', attrs: { id: tableId } });
  const thead = SafeDOM.el('thead');
  const headRow = SafeDOM.el('tr');
  headers.forEach((headerLabel) => {
    headRow.appendChild(SafeDOM.el('th', { text: headerLabel }));
  });
  thead.appendChild(headRow);
  table.appendChild(thead);
  table.appendChild(SafeDOM.el('tbody'));
  scrollWrap.appendChild(table);

  wrapper.appendChild(header);
  wrapper.appendChild(scrollWrap);
  return { wrapper, tableBody: table.querySelector('tbody') };
}

function createStatusBadge(text, extraClass) {
  return SafeDOM.el('span', {
    className: `status-badge ${extraClass || ''}`.trim(),
    text
  });
}

function applySearchFilter(tableSelector, term) {
  const normalized = SafeDOM.toStringValue(term).toLowerCase().trim();
  document.querySelectorAll(`${tableSelector} tbody tr`).forEach((row) => {
    const haystack = row.dataset.search || '';
    row.style.display = haystack.includes(normalized) ? '' : 'none';
  });
}

function createDetailCard(title, actions = []) {
  const card = SafeDOM.el('div', { className: 'detalhe-card' });
  const header = SafeDOM.el('div', { className: 'detalhe-card__header' }, [
    SafeDOM.el('h3', { text: title })
  ]);

  if (actions.length) {
    const actionWrap = SafeDOM.el('div');
    actionWrap.style.display = 'flex';
    actionWrap.style.gap = '0.5rem';
    actionWrap.style.flexWrap = 'wrap';
    actions.forEach((action) => actionWrap.appendChild(action));
    header.appendChild(actionWrap);
  }

  card.appendChild(header);
  return card;
}

function appendDetailFields(card, fields) {
  fields.forEach(([label, value]) => {
    const text = SafeDOM.toStringValue(value).trim();
    if (!text) return;
    const row = SafeDOM.el('div', { className: 'detalhe-campo' }, [
      SafeDOM.el('span', { className: 'detalhe-campo__label', text: label }),
      SafeDOM.el('span', { className: 'detalhe-campo__valor', text })
    ]);
    card.appendChild(row);
  });
}

async function carregarListaFichas() {
  const container = document.getElementById('conteudo-fichas');
  if (!container) return;

  renderAdminState(container, 'Carregando fichas...');

  try {
    _cacheFichas = await buscarFichasAdocao();
    if (_cacheFichas.length === 0) {
      renderAdminState(container, 'Nenhuma ficha recebida ainda', 'Quando alguém preencher a ficha de adoção no site, aparecerá aqui.');
      return;
    }
    renderTabelaFichas(_cacheFichas);
  } catch (erro) {
    console.error('Erro ao carregar fichas:', erro);
    renderAdminState(container, 'Erro ao carregar fichas.');
  }
}

function renderTabelaFichas(lista) {
  const container = document.getElementById('conteudo-fichas');
  if (!container) return;

  SafeDOM.clear(container);
  const { wrapper, tableBody } = createTableShell(
    `${lista.length} ficha${lista.length !== 1 ? 's' : ''} recebida${lista.length !== 1 ? 's' : ''}`,
    'Buscar por nome...',
    filtrarFichasAdmin,
    'tabela-fichas-admin',
    ['Nome', 'E-mail', 'WhatsApp', 'Animal', 'Data', 'Status', 'Ações']
  );

  lista.forEach((ficha) => {
    const row = SafeDOM.el('tr', {
      dataset: {
        search: SafeDOM.toStringValue(ficha.nomeCompleto || ficha['nome-completo']).toLowerCase()
      }
    });
    const nome = SafeDOM.toStringValue(ficha.nomeCompleto || ficha['nome-completo'] || '—');
    const status = ficha.status || 'Pendente';

    row.appendChild(SafeDOM.el('td', {}, [SafeDOM.el('strong', { text: nome })]));
    row.appendChild(SafeDOM.el('td', { text: ficha.email || '—' }));
    row.appendChild(SafeDOM.el('td', { text: ficha.whatsapp || '—' }));
    row.appendChild(SafeDOM.el('td', { text: ficha.animalInteresse || ficha['animal-interesse'] || 'Sem preferência' }));
    row.appendChild(SafeDOM.el('td', { text: formatarData(ficha.criadoEm) }));

    const statusCell = SafeDOM.el('td');
    const select = SafeDOM.el('select', { className: 'admin-campo-select', attrs: { 'aria-label': `Status de ${nome}` } });
    ['Pendente', 'Em Análise', 'Aprovada', 'Recusada'].forEach((optionValue) => {
      const option = SafeDOM.el('option', { text: optionValue, attrs: { value: optionValue } });
      option.selected = optionValue === status;
      select.appendChild(option);
    });
    select.addEventListener('change', () => mudarStatusFichaAdmin(ficha.id, select.value));
    statusCell.appendChild(select);
    row.appendChild(statusCell);

    const actions = SafeDOM.el('td');
    const actionsWrap = SafeDOM.el('div', { className: 'admin-tabela__acoes' });
    actionsWrap.appendChild(createActionButton('Ver', 'btn-acao btn-acao--ver', () => verDetalheFicha(ficha.id)));
    actions.appendChild(actionsWrap);
    row.appendChild(actions);

    tableBody.appendChild(row);
  });

  container.appendChild(wrapper);
}

async function verDetalheFicha(id) {
  const container = document.getElementById('conteudo-fichas');
  if (!container) return;

  let ficha = _cacheFichas.find((item) => item.id === id);
  if (!ficha) {
    try {
      const doc = await db.collection(COLECOES.FICHAS_ADOCAO).doc(id).get();
      if (doc.exists) ficha = { id: doc.id, ...doc.data() };
    } catch (erro) {
      console.error('Erro ao buscar ficha:', erro);
    }
  }

  if (!ficha) {
    mostrarToastAdmin('Ficha não encontrada.', 'erro');
    return;
  }

  SafeDOM.clear(container);
  const nome = ficha.nomeCompleto || ficha['nome-completo'] || 'Sem nome';
  const card = createDetailCard(`Ficha de Adoção — ${nome}`, [
    createActionButton('Aprovar', 'btn--salvar', async () => {
      await mudarStatusFichaAdmin(id, 'Aprovada');
      voltarParaListaFichas();
    }),
    createActionButton('Recusar', 'btn--confirmar-remover', async () => {
      await mudarStatusFichaAdmin(id, 'Recusada');
      voltarParaListaFichas();
    }),
    createActionButton('Voltar', 'btn--cancelar', voltarParaListaFichas)
  ]);

  appendDetailFields(card, [
    ['Nome completo', ficha.nomeCompleto || ficha['nome-completo']],
    ['CPF', ficha.cpf],
    ['Data de nascimento', ficha.nascimento],
    ['E-mail', ficha.email],
    ['WhatsApp', ficha.whatsapp],
    ['Cidade', ficha.cidade],
    ['Estado', ficha.estado],
    ['Endereço', ficha.endereco],
    ['Tipo de moradia', ficha.tipoMoradia || ficha['tipo-moradia']],
    ['Tem quintal', ficha.quintal],
    ['Crianças menores de 10', ficha.criancas],
    ['Outros animais', ficha.outrosAnimais || ficha['outros-animais']],
    ['Descrição dos outros animais', ficha.outrosAnimaisDesc || ficha['outros-animais-desc']],
    ['Moradia', ficha.tipoMoradiaPosse || ficha['tipo-moradia-posse']],
    ['Proprietário permite pets', ficha.proprietarioPermite],
    ['Moradores na residência', ficha.qtdMoradores || ficha['qtd-moradores']],
    ['Alergia a animais', ficha.alergia],
    ['Animal de interesse', ficha.animalInteresse || ficha['animal-interesse'] || 'Sem preferência'],
    ['Motivação', ficha.motivacaoAdocao || ficha['motivacao-adocao']],
    ['Experiência com pets', ficha.experienciaPet || ficha['experiencia-pet']],
    ['O que faz ao viajar', ficha.viagemPet || ficha['viagem-pet']],
    ['Data do envio', formatarTimestamp(ficha.criadoEm)],
    ['Status atual', ficha.status]
  ]);

  container.appendChild(card);
}

async function mudarStatusFichaAdmin(id, status) {
  try {
    await atualizarStatusFicha(id, status);
    const ficha = _cacheFichas.find((item) => item.id === id);
    if (ficha) ficha.status = status;
    mostrarToastAdmin(`Status alterado para "${status}".`, 'sucesso');
    if (typeof carregarDashboard === 'function') carregarDashboard();
  } catch (erro) {
    console.error('Erro ao alterar ficha:', erro);
    mostrarToastAdmin('Erro ao alterar status.', 'erro');
  }
}

function voltarParaListaFichas() {
  renderTabelaFichas(_cacheFichas);
}

function filtrarFichasAdmin(termo) {
  applySearchFilter('#tabela-fichas-admin', termo);
}

async function carregarListaVoluntarios() {
  const container = document.getElementById('conteudo-voluntarios');
  if (!container) return;

  renderAdminState(container, 'Carregando voluntários...');

  try {
    _cacheVoluntarios = await buscarVoluntarios();
    if (_cacheVoluntarios.length === 0) {
      renderAdminState(container, 'Nenhum voluntário cadastrado ainda', 'Quando alguém se cadastrar como voluntário no site, aparecerá aqui.');
      return;
    }
    renderTabelaVoluntarios(_cacheVoluntarios);
  } catch (erro) {
    console.error('Erro ao carregar voluntários:', erro);
    renderAdminState(container, 'Erro ao carregar.');
  }
}

function renderTabelaVoluntarios(lista) {
  const container = document.getElementById('conteudo-voluntarios');
  if (!container) return;

  SafeDOM.clear(container);
  const { wrapper, tableBody } = createTableShell(
    `${lista.length} voluntário${lista.length !== 1 ? 's' : ''}`,
    'Buscar por nome...',
    filtrarVoluntariosAdmin,
    'tabela-voluntarios-admin',
    ['Nome', 'E-mail', 'WhatsApp', 'Cidade', 'Data', 'Status', 'Ações']
  );

  lista.forEach((vol) => {
    const nome = SafeDOM.toStringValue(vol.nome || '—');
    const status = vol.status || 'Novo';
    const statusClass = status === 'Novo'
      ? 'status-badge--novo'
      : status === 'Ativo'
        ? 'status-badge--disponivel'
        : 'status-badge--rascunho';

    const row = SafeDOM.el('tr', {
      dataset: { search: nome.toLowerCase() }
    });
    row.appendChild(SafeDOM.el('td', {}, [SafeDOM.el('strong', { text: nome })]));
    row.appendChild(SafeDOM.el('td', { text: vol.email || '—' }));
    row.appendChild(SafeDOM.el('td', { text: vol.whatsapp || '—' }));
    row.appendChild(SafeDOM.el('td', { text: vol.cidade || '—' }));
    row.appendChild(SafeDOM.el('td', { text: formatarData(vol.criadoEm) }));
    row.appendChild(SafeDOM.el('td', {}, [createStatusBadge(status, statusClass)]));

    const actions = SafeDOM.el('td');
    const actionsWrap = SafeDOM.el('div', { className: 'admin-tabela__acoes' });
    actionsWrap.appendChild(createActionButton('Ver', 'btn-acao btn-acao--ver', () => verDetalheVoluntario(vol.id)));
    actions.appendChild(actionsWrap);
    row.appendChild(actions);
    tableBody.appendChild(row);
  });

  container.appendChild(wrapper);
}

async function verDetalheVoluntario(id) {
  const container = document.getElementById('conteudo-voluntarios');
  if (!container) return;

  let vol = _cacheVoluntarios.find((item) => item.id === id);
  if (!vol) {
    try {
      const doc = await db.collection(COLECOES.VOLUNTARIOS).doc(id).get();
      if (doc.exists) vol = { id: doc.id, ...doc.data() };
    } catch (erro) {
      console.error('Erro ao buscar voluntário:', erro);
    }
  }

  if (!vol) {
    mostrarToastAdmin('Voluntário não encontrado.', 'erro');
    return;
  }

  SafeDOM.clear(container);
  const whatsAppLink = SafeDOM.whatsappHref(`55${SafeDOM.normalizePhone(vol.whatsapp)}`);
  const actions = [];
  if (whatsAppLink) {
    actions.push(SafeDOM.el('a', {
      className: 'btn--salvar',
      text: 'WhatsApp',
      attrs: { href: whatsAppLink, target: '_blank', rel: 'noopener noreferrer' }
    }));
  }
  actions.push(createActionButton('Voltar', 'btn--cancelar', carregarListaVoluntarios));

  const card = createDetailCard(`Voluntário — ${vol.nome || 'Sem nome'}`, actions);

  appendDetailFields(card, [
    ['Nome completo', vol.nome],
    ['E-mail', vol.email],
    ['WhatsApp', vol.whatsapp],
    ['Cidade / Bairro', vol.cidade],
    ['Dias disponíveis', Array.isArray(vol.dias) ? vol.dias.join(', ') : vol.dias],
    ['Turnos disponíveis', Array.isArray(vol.turnos) ? vol.turnos.join(', ') : vol.turnos],
    ['Habilidades', Array.isArray(vol.habilidades) ? vol.habilidades.join(', ') : vol.habilidades],
    ['Outra habilidade', vol.habilidadeOutro],
    ['Motivação', vol.motivacao],
    ['Como conheceu a ONG', vol.comoConheceu || vol['como-conheceu']],
    ['Data do cadastro', formatarTimestamp(vol.criadoEm)],
    ['Status', vol.status]
  ]);

  container.appendChild(card);
}

function filtrarVoluntariosAdmin(termo) {
  applySearchFilter('#tabela-voluntarios-admin', termo);
}

async function carregarListaMensagens() {
  const container = document.getElementById('conteudo-mensagens');
  if (!container) return;

  renderAdminState(container, 'Carregando mensagens...');

  try {
    _cacheMensagens = await buscarMensagens();
    if (_cacheMensagens.length === 0) {
      renderAdminState(container, 'Nenhuma mensagem recebida ainda', 'Quando alguém enviar uma mensagem pelo formulário de contato, aparecerá aqui.');
      return;
    }
    renderTabelaMensagens(_cacheMensagens);
  } catch (erro) {
    console.error('Erro ao carregar mensagens:', erro);
    renderAdminState(container, 'Erro ao carregar.');
  }
}

function renderTabelaMensagens(lista) {
  const container = document.getElementById('conteudo-mensagens');
  if (!container) return;

  SafeDOM.clear(container);
  const { wrapper, tableBody } = createTableShell(
    `${lista.length} mensage${lista.length !== 1 ? 'ns' : 'm'}`,
    'Buscar por nome ou assunto...',
    filtrarMensagensAdmin,
    'tabela-mensagens-admin',
    ['', 'Nome', 'Assunto', 'E-mail', 'Data', 'Status', 'Ações']
  );

  lista.forEach((msg) => {
    const nome = SafeDOM.toStringValue(msg.nome || '—');
    const assunto = SafeDOM.toStringValue(msg.assunto || '—');
    const lida = Boolean(msg.lido);
    const status = msg.status || 'Não lida';

    const row = SafeDOM.el('tr', {
      dataset: { search: `${nome.toLowerCase()} ${assunto.toLowerCase()}` }
    });
    if (!lida) row.style.fontWeight = '700';

    const unreadCell = SafeDOM.el('td');
    if (!lida) {
      const dot = SafeDOM.el('span', { attrs: { 'aria-hidden': 'true' } });
      dot.style.display = 'inline-block';
      dot.style.width = '8px';
      dot.style.height = '8px';
      dot.style.borderRadius = '50%';
      dot.style.background = 'var(--cor-erro)';
      unreadCell.appendChild(dot);
    }
    row.appendChild(unreadCell);
    row.appendChild(SafeDOM.el('td', { text: nome }));
    row.appendChild(SafeDOM.el('td', { text: assunto }));
    row.appendChild(SafeDOM.el('td', { text: msg.email || '—' }));
    row.appendChild(SafeDOM.el('td', { text: formatarData(msg.criadoEm) }));
    row.appendChild(SafeDOM.el('td', {}, [
      createStatusBadge(status, lida ? 'status-badge--lida' : 'status-badge--naolida')
    ]));

    const actions = SafeDOM.el('td');
    const actionsWrap = SafeDOM.el('div', { className: 'admin-tabela__acoes' });
    actionsWrap.appendChild(createActionButton('Ver', 'btn-acao btn-acao--ver', () => verDetalheMensagem(msg.id)));
    actions.appendChild(actionsWrap);
    row.appendChild(actions);

    tableBody.appendChild(row);
  });

  container.appendChild(wrapper);
}

async function verDetalheMensagem(id) {
  const container = document.getElementById('conteudo-mensagens');
  if (!container) return;

  let msg = _cacheMensagens.find((item) => item.id === id);
  if (!msg) {
    try {
      const doc = await db.collection(COLECOES.MENSAGENS).doc(id).get();
      if (doc.exists) msg = { id: doc.id, ...doc.data() };
    } catch (erro) {
      console.error('Erro ao buscar mensagem:', erro);
    }
  }

  if (!msg) {
    mostrarToastAdmin('Mensagem não encontrada.', 'erro');
    return;
  }

  if (!msg.lido) {
    await atualizarStatusMensagem(id, 'Lida');
    msg.lido = true;
    msg.status = 'Lida';
    if (typeof carregarDashboard === 'function') carregarDashboard();
  }

  SafeDOM.clear(container);

  const actions = [];
  const mailHref = SafeDOM.emailHref(msg.email);
  const whatsappLink = SafeDOM.whatsappHref(`55${SafeDOM.normalizePhone(msg.telefone)}`);
  if (mailHref) {
    actions.push(SafeDOM.el('a', {
      className: 'btn--salvar',
      text: 'Responder por e-mail',
      attrs: { href: mailHref }
    }));
  }
  if (whatsappLink) {
    actions.push(SafeDOM.el('a', {
      className: 'btn--salvar',
      text: 'WhatsApp',
      attrs: { href: whatsappLink, target: '_blank', rel: 'noopener noreferrer' }
    }));
  }
  actions.push(createActionButton('Marcar como respondida', 'btn--cancelar', () => marcarMensagemRespondida(id)));
  actions.push(createActionButton('Voltar', 'btn--cancelar', carregarListaMensagens));

  const card = createDetailCard(`Mensagem de ${msg.nome || 'visitante'}`, actions);

  appendDetailFields(card, [
    ['Nome', msg.nome],
    ['E-mail', msg.email],
    ['Telefone / WhatsApp', msg.telefone],
    ['Assunto', msg.assunto],
    ['Data do envio', formatarTimestamp(msg.criadoEm)],
    ['Status', msg.status || 'Lida']
  ]);

  const messageBox = SafeDOM.el('div');
  messageBox.style.marginTop = '1.5rem';
  messageBox.style.padding = '1.25rem';
  messageBox.style.background = 'var(--cor-bege)';
  messageBox.style.borderRadius = 'var(--raio-sm)';
  messageBox.style.borderLeft = '4px solid var(--cor-primaria)';
  messageBox.appendChild(SafeDOM.el('p', {
    text: 'Mensagem:',
    attrs: { 'aria-hidden': 'true' }
  }));
  messageBox.firstChild.style.fontSize = '0.8rem';
  messageBox.firstChild.style.fontWeight = '700';
  messageBox.firstChild.style.color = 'var(--cor-cinza-medio)';
  messageBox.firstChild.style.marginBottom = '0.5rem';
  messageBox.firstChild.style.textTransform = 'uppercase';
  messageBox.firstChild.style.letterSpacing = '0.5px';

  const content = SafeDOM.el('p', { text: msg.mensagem || '(sem conteúdo)' });
  content.style.fontSize = '0.95rem';
  content.style.lineHeight = '1.8';
  content.style.color = 'var(--cor-texto)';
  content.style.whiteSpace = 'pre-wrap';
  messageBox.appendChild(content);
  card.appendChild(messageBox);

  container.appendChild(card);
}

async function marcarMensagemRespondida(id) {
  try {
    await atualizarStatusMensagem(id, 'Respondida');
    const mensagem = _cacheMensagens.find((item) => item.id === id);
    if (mensagem) {
      mensagem.status = 'Respondida';
      mensagem.lido = true;
    }
    mostrarToastAdmin('Mensagem marcada como respondida.', 'sucesso');
    carregarListaMensagens();
    if (typeof carregarDashboard === 'function') carregarDashboard();
  } catch (erro) {
    console.error('Erro ao marcar mensagem como respondida:', erro);
    mostrarToastAdmin('Erro ao atualizar.', 'erro');
  }
}

function filtrarMensagensAdmin(termo) {
  applySearchFilter('#tabela-mensagens-admin', termo);
}
