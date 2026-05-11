'use strict';

let animalEditandoId = null;
let fotoArquivo = null;
let fotoRemovida = false;
let _animaisAdminCache = [];

const ADMIN_ANIMAL_FALLBACK = 'images/logo-300.png';
const ADMIN_STATUS_OPTIONS = ['Disponível', 'Reservado', 'Em Tratamento', 'Adotado'];

function adminAnimalState(title, text = '', iconPath = '') {
  const container = document.getElementById('conteudo-animais');
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

function createAnimalTableShell(totalLabel) {
  const wrapper = SafeDOM.el('div', { className: 'admin-tabela-wrapper' });
  const header = SafeDOM.el('div', { className: 'admin-tabela-header' }, [
    SafeDOM.el('span', { className: 'admin-tabela-header__titulo', text: totalLabel })
  ]);

  const actions = SafeDOM.el('div', { className: 'admin-tabela-header__acoes' });
  const search = SafeDOM.el('input', {
    className: 'admin-busca',
    attrs: {
      type: 'text',
      placeholder: 'Buscar por nome...',
      'aria-label': 'Buscar animal'
    }
  });
  search.addEventListener('input', (event) => filtrarAnimaisAdmin(event.target.value));
  actions.appendChild(search);
  header.appendChild(actions);

  const scroll = SafeDOM.el('div');
  scroll.style.overflowX = 'auto';

  const table = SafeDOM.el('table', { className: 'admin-tabela', attrs: { id: 'tabela-animais-admin' } });
  const headRow = SafeDOM.el('tr');
  ['Foto', 'Nome', 'Idade', 'Porte', 'Sexo', 'Status', 'Ações'].forEach((label) => {
    headRow.appendChild(SafeDOM.el('th', { text: label }));
  });
  table.appendChild(SafeDOM.el('thead', {}, [headRow]));
  table.appendChild(SafeDOM.el('tbody'));
  scroll.appendChild(table);

  wrapper.appendChild(header);
  wrapper.appendChild(scroll);
  return { wrapper, tbody: table.querySelector('tbody') };
}

function createAnimalField(label, control, options = {}) {
  const { id, required = false } = options;
  const group = SafeDOM.el('div', { className: 'admin-campo-grupo' });
  const labelEl = SafeDOM.el('label', {
    className: 'admin-campo-label',
    attrs: id ? { for: id } : undefined
  }, [
    document.createTextNode(label),
    required ? SafeDOM.el('span', { className: 'obrigatorio', text: ' *' }) : null
  ]);
  group.appendChild(labelEl);
  group.appendChild(control);
  return group;
}

function createAnimalCheckbox(id, text, checked = false) {
  return SafeDOM.el('label', {
    listeners: {}
  }, [
    SafeDOM.el('input', {
      attrs: { id, type: 'checkbox' },
      checked
    }),
    document.createTextNode(` ${text}`)
  ]);
}

function renderAnimalUpload(currentFoto = '') {
  const wrapper = SafeDOM.el('div', { className: 'admin-campo-grupo' });
  wrapper.appendChild(SafeDOM.el('label', { className: 'admin-campo-label', text: 'Foto do animal' }));

  const uploadButton = SafeDOM.el('button', {
    className: 'upload-area',
    attrs: { id: 'upload-area-animal', type: 'button' }
  }, [
    SafeDOM.el('div', {
      className: 'upload-area__icone',
      html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z"/></svg>'
    }),
    SafeDOM.el('p', { className: 'upload-area__texto' }, [
      document.createTextNode('Clique para escolher uma foto. '),
      SafeDOM.el('strong', { text: 'JPG, PNG ou WebP — máximo 5MB' })
    ])
  ]);

  const input = SafeDOM.el('input', {
    attrs: { id: 'input-foto-animal', type: 'file', accept: 'image/*' }
  });
  input.style.display = 'none';
  input.addEventListener('change', handleUploadFoto);
  uploadButton.addEventListener('click', () => input.click());

  const preview = SafeDOM.el('div', { className: 'upload-preview', attrs: { id: 'preview-foto-animal' } });
  const previewImg = SafeDOM.el('img', { attrs: { id: 'preview-img-animal', alt: 'Preview da foto do animal' } });
  const removeBtn = SafeDOM.el('button', {
    className: 'upload-preview__remover',
    text: '×',
    attrs: { type: 'button', 'aria-label': 'Remover foto' },
    listeners: { click: removerFotoPreview }
  });
  preview.appendChild(previewImg);
  preview.appendChild(removeBtn);

  wrapper.appendChild(uploadButton);
  wrapper.appendChild(input);
  wrapper.appendChild(preview);

  if (currentFoto) {
    SafeDOM.setImageSource(previewImg, currentFoto, { fallback: ADMIN_ANIMAL_FALLBACK, allowRelative: true });
    preview.classList.add('ativo');
  }

  return wrapper;
}

async function carregarListaAnimais() {
  adminAnimalState(
    'Carregando animais...',
    '',
    'M4.5 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm15 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm-7-3a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z'
  );

  try {
    _animaisAdminCache = await buscarAnimais(false);
    if (_animaisAdminCache.length === 0) {
      adminAnimalState(
        'Nenhum animal cadastrado',
        'Clique em "Novo Animal" para começar.',
        'M4.5 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z'
      );
      return;
    }
    renderTabelaAnimais(_animaisAdminCache);
  } catch (erro) {
    console.error('Erro ao carregar animais:', erro);
    adminAnimalState('Erro ao carregar', 'Não foi possível buscar os animais. Verifique sua conexão.');
  }
}

function renderTabelaAnimais(lista) {
  const container = document.getElementById('conteudo-animais');
  if (!container) return;

  SafeDOM.clear(container);
  const { wrapper, tbody } = createAnimalTableShell(
    `${lista.length} animal${lista.length !== 1 ? 'is' : ''} cadastrado${lista.length !== 1 ? 's' : ''}`
  );

  lista.forEach((animal) => {
    const nome = SafeDOM.toStringValue(animal.nome || '—');
    const row = SafeDOM.el('tr', {
      dataset: {
        nome: nome.toLowerCase(),
        search: `${nome} ${SafeDOM.toStringValue(animal.status)} ${SafeDOM.toStringValue(animal.porte)}`.toLowerCase()
      }
    });

    const fotoCell = SafeDOM.el('td');
    const foto = SafeDOM.el('img', {
      className: 'admin-tabela__foto',
      attrs: { alt: nome }
    });
    SafeDOM.setImageSource(foto, animal.foto, { fallback: ADMIN_ANIMAL_FALLBACK, allowRelative: true });
    fotoCell.appendChild(foto);
    row.appendChild(fotoCell);

    const nomeCell = SafeDOM.el('td', {}, [SafeDOM.el('strong', { text: nome })]);
    if (animal.novo) {
      const badge = SafeDOM.el('span', { className: 'status-badge status-badge--novo', text: 'Novo' });
      badge.style.marginLeft = '0.4rem';
      nomeCell.appendChild(badge);
    }
    row.appendChild(nomeCell);
    row.appendChild(SafeDOM.el('td', { text: animal.idade || '—' }));
    row.appendChild(SafeDOM.el('td', { text: animal.porte || '—' }));
    row.appendChild(SafeDOM.el('td', { text: animal.sexo || '—' }));

    const statusCell = SafeDOM.el('td');
    const select = SafeDOM.el('select', {
      className: 'admin-campo-select',
      attrs: { 'aria-label': `Mudar status de ${nome}` }
    });
    select.style.padding = '0.3rem 2rem 0.3rem 0.5rem';
    select.style.fontSize = '0.8rem';
    select.style.width = 'auto';
    select.style.minWidth = '130px';
    ADMIN_STATUS_OPTIONS.forEach((status) => {
      const option = SafeDOM.el('option', { text: status, attrs: { value: status } });
      option.selected = status === animal.status;
      select.appendChild(option);
    });
    select.addEventListener('change', () => mudarStatusAnimal(animal.id, select.value));
    statusCell.appendChild(select);
    row.appendChild(statusCell);

    const actions = SafeDOM.el('td');
    const actionsWrap = SafeDOM.el('div', { className: 'admin-tabela__acoes' });
    actionsWrap.appendChild(SafeDOM.el('button', {
      className: 'btn-acao btn-acao--editar',
      attrs: { type: 'button', title: 'Editar', 'aria-label': `Editar ${nome}` },
      html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',
      listeners: { click: () => abrirFormAnimal(animal.id) }
    }));
    actionsWrap.appendChild(SafeDOM.el('button', {
      className: 'btn-acao btn-acao--remover',
      attrs: { type: 'button', title: 'Remover', 'aria-label': `Remover ${nome}` },
      html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
      listeners: { click: () => removerAnimalAdmin(animal.id, nome) }
    }));
    actions.appendChild(actionsWrap);
    row.appendChild(actions);

    tbody.appendChild(row);
  });

  container.appendChild(wrapper);
}

function filtrarAnimaisAdmin(termo) {
  const query = SafeDOM.toStringValue(termo).toLowerCase().trim();
  document.querySelectorAll('#tabela-animais-admin tbody tr').forEach((linha) => {
    linha.style.display = (linha.dataset.search || '').includes(query) ? '' : 'none';
  });
}

async function abrirFormAnimal(id = null) {
  const container = document.getElementById('conteudo-animais');
  if (!container) return;

  animalEditandoId = id;
  fotoArquivo = null;
  fotoRemovida = false;

  let animal = {
    nome: '',
    foto: '',
    idade: '',
    porte: 'Médio',
    sexo: 'Macho',
    status: 'Disponível',
    castrado: false,
    vacinado: false,
    novo: false,
    descricao: '',
    historico: ''
  };

  if (id) {
    const dados = await buscarAnimalPorId(id);
    if (dados) animal = { ...animal, ...dados };
  }

  SafeDOM.clear(container);
  const card = SafeDOM.el('div', { className: 'admin-form-card' });
  card.appendChild(SafeDOM.el('h3', {
    className: 'admin-form-card__titulo',
    text: id ? `Editar Animal: ${animal.nome || 'Sem nome'}` : 'Cadastrar Novo Animal'
  }));

  const form = SafeDOM.el('form', { attrs: { id: 'form-animal-admin' } });
  form.addEventListener('submit', (event) => event.preventDefault());

  form.appendChild(renderAnimalUpload(animal.foto || ''));

  const linha1 = SafeDOM.el('div', { className: 'admin-campos-linha' });
  linha1.appendChild(createAnimalField('Nome', SafeDOM.el('input', {
    className: 'admin-campo-input',
    attrs: { id: 'animal-nome', type: 'text', required: 'required', placeholder: 'Nome do animal' },
    value: animal.nome || ''
  }), { id: 'animal-nome', required: true }));
  linha1.appendChild(createAnimalField('Idade', SafeDOM.el('input', {
    className: 'admin-campo-input',
    attrs: { id: 'animal-idade', type: 'text', required: 'required', placeholder: 'Ex: 2 anos, 6 meses' },
    value: animal.idade || ''
  }), { id: 'animal-idade', required: true }));
  form.appendChild(linha1);

  const linha2 = SafeDOM.el('div', { className: 'admin-campos-linha' });
  const porte = SafeDOM.el('select', { className: 'admin-campo-select', attrs: { id: 'animal-porte' } });
  ['Pequeno', 'Médio', 'Grande'].forEach((item) => {
    const option = SafeDOM.el('option', { text: item, attrs: { value: item } });
    option.selected = animal.porte === item;
    porte.appendChild(option);
  });
  linha2.appendChild(createAnimalField('Porte', porte, { id: 'animal-porte', required: true }));

  const sexo = SafeDOM.el('select', { className: 'admin-campo-select', attrs: { id: 'animal-sexo' } });
  ['Macho', 'Fêmea'].forEach((item) => {
    const option = SafeDOM.el('option', { text: item, attrs: { value: item } });
    option.selected = animal.sexo === item;
    sexo.appendChild(option);
  });
  linha2.appendChild(createAnimalField('Sexo', sexo, { id: 'animal-sexo', required: true }));
  form.appendChild(linha2);

  const status = SafeDOM.el('select', { className: 'admin-campo-select', attrs: { id: 'animal-status' } });
  ADMIN_STATUS_OPTIONS.forEach((item) => {
    const option = SafeDOM.el('option', { text: item, attrs: { value: item } });
    option.selected = animal.status === item;
    status.appendChild(option);
  });
  form.appendChild(createAnimalField('Status', status, { id: 'animal-status' }));

  const condicoes = SafeDOM.el('div', { className: 'admin-campo-grupo' });
  condicoes.appendChild(SafeDOM.el('label', { className: 'admin-campo-label', text: 'Condições' }));
  const checkWrap = SafeDOM.el('div');
  checkWrap.style.display = 'flex';
  checkWrap.style.gap = '1.5rem';
  checkWrap.style.flexWrap = 'wrap';
  checkWrap.style.marginTop = '0.25rem';
  [
    createAnimalCheckbox('animal-castrado', 'Castrado', animal.castrado),
    createAnimalCheckbox('animal-vacinado', 'Vacinado', animal.vacinado),
    createAnimalCheckbox('animal-novo', 'Novo no abrigo', animal.novo)
  ].forEach((label) => {
    label.style.display = 'flex';
    label.style.alignItems = 'center';
    label.style.gap = '0.4rem';
    label.style.cursor = 'pointer';
    label.style.fontSize = '0.9rem';
    checkWrap.appendChild(label);
  });
  condicoes.appendChild(checkWrap);
  form.appendChild(condicoes);

  form.appendChild(createAnimalField('Descrição', SafeDOM.el('textarea', {
    className: 'admin-campo-textarea',
    attrs: { id: 'animal-descricao', rows: '3', required: 'required', placeholder: 'Descreva o temperamento e características do animal...' },
    value: animal.descricao || ''
  }), { id: 'animal-descricao', required: true }));

  form.appendChild(createAnimalField('Histórico de resgate', SafeDOM.el('textarea', {
    className: 'admin-campo-textarea',
    attrs: { id: 'animal-historico', rows: '3', placeholder: 'Como e quando o animal foi resgatado...' },
    value: animal.historico || ''
  }), { id: 'animal-historico' }));

  const actions = SafeDOM.el('div', { className: 'admin-form-acoes' }, [
    SafeDOM.el('button', {
      className: 'btn--salvar',
      text: id ? 'Salvar Alterações' : 'Cadastrar Animal',
      attrs: { id: 'btn-salvar-animal', type: 'button' },
      listeners: { click: salvarAnimalForm }
    }),
    SafeDOM.el('button', {
      className: 'btn--cancelar',
      text: 'Cancelar',
      attrs: { type: 'button' },
      listeners: { click: voltarParaLista }
    })
  ]);
  form.appendChild(actions);

  card.appendChild(form);
  container.appendChild(card);
  window.scrollTo(0, 0);
}

function handleUploadFoto(event) {
  const arquivo = event.target.files?.[0];
  if (!arquivo) return;

  if (!arquivo.type.startsWith('image/')) {
    mostrarToastAdmin('Selecione um arquivo de imagem (JPG, PNG ou WebP).', 'erro');
    event.target.value = '';
    return;
  }

  if (arquivo.size > 5 * 1024 * 1024) {
    mostrarToastAdmin('A imagem deve ter no máximo 5MB.', 'erro');
    event.target.value = '';
    return;
  }

  fotoArquivo = arquivo;
  fotoRemovida = false;

  const reader = new FileReader();
  reader.onload = (loadEvent) => {
    const preview = document.getElementById('preview-foto-animal');
    const previewImg = document.getElementById('preview-img-animal');
    if (preview && previewImg) {
      previewImg.src = loadEvent.target?.result || '';
      preview.classList.add('ativo');
    }
  };
  reader.readAsDataURL(arquivo);
}

function removerFotoPreview() {
  fotoArquivo = null;
  fotoRemovida = true;

  const preview = document.getElementById('preview-foto-animal');
  const previewImg = document.getElementById('preview-img-animal');
  const inputFoto = document.getElementById('input-foto-animal');

  if (preview) preview.classList.remove('ativo');
  if (previewImg) previewImg.removeAttribute('src');
  if (inputFoto) inputFoto.value = '';
}

async function salvarAnimalForm() {
  const nome = document.getElementById('animal-nome')?.value.trim();
  const idade = document.getElementById('animal-idade')?.value.trim();
  const porte = document.getElementById('animal-porte')?.value;
  const sexo = document.getElementById('animal-sexo')?.value;
  const status = document.getElementById('animal-status')?.value;
  const castrado = document.getElementById('animal-castrado')?.checked || false;
  const vacinado = document.getElementById('animal-vacinado')?.checked || false;
  const novo = document.getElementById('animal-novo')?.checked || false;
  const descricao = document.getElementById('animal-descricao')?.value.trim();
  const historico = document.getElementById('animal-historico')?.value.trim();

  if (!nome) {
    mostrarToastAdmin('O nome do animal é obrigatório.', 'erro');
    return;
  }
  if (!idade) {
    mostrarToastAdmin('A idade do animal é obrigatória.', 'erro');
    return;
  }
  if (!descricao) {
    mostrarToastAdmin('A descrição do animal é obrigatória.', 'erro');
    return;
  }

  const btnSalvar = document.getElementById('btn-salvar-animal');
  if (btnSalvar) {
    btnSalvar.classList.add('btn-loading');
    btnSalvar.disabled = true;
  }

  try {
    const dados = {
      nome,
      idade,
      porte,
      sexo,
      status,
      castrado,
      vacinado,
      novo,
      descricao,
      historico
    };

    if (fotoArquivo) {
      const urlFoto = await uploadImagem(fotoArquivo, 'animais');
      if (!urlFoto) {
        mostrarToastAdmin('Erro ao enviar a foto. Tente novamente.', 'erro');
        return;
      }
      dados.foto = urlFoto;
    } else if (animalEditandoId && !fotoRemovida) {
      const atual = await buscarAnimalPorId(animalEditandoId);
      if (atual?.foto) dados.foto = atual.foto;
    } else if (fotoRemovida) {
      dados.foto = '';
    }

    const idSalvo = await salvarAnimal(dados, animalEditandoId);
    if (!idSalvo) {
      mostrarToastAdmin('Erro ao salvar. Tente novamente.', 'erro');
      return;
    }

    mostrarToastAdmin(
      animalEditandoId ? `${nome} atualizado com sucesso!` : `${nome} cadastrado com sucesso!`,
      'sucesso'
    );
    voltarParaLista();
  } catch (erro) {
    console.error('Erro ao salvar animal:', erro);
    mostrarToastAdmin('Erro inesperado ao salvar. Tente novamente.', 'erro');
  } finally {
    if (btnSalvar) {
      btnSalvar.classList.remove('btn-loading');
      btnSalvar.disabled = false;
    }
  }
}

async function mudarStatusAnimal(id, novoStatus) {
  try {
    await salvarAnimal({ status: novoStatus }, id);
    const item = _animaisAdminCache.find((animal) => animal.id === id);
    if (item) item.status = novoStatus;
    mostrarToastAdmin(`Status alterado para "${novoStatus}".`, 'sucesso');
    if (typeof carregarDashboard === 'function') carregarDashboard();
  } catch (erro) {
    console.error('Erro ao mudar status:', erro);
    mostrarToastAdmin('Erro ao alterar status. Tente novamente.', 'erro');
  }
}

function removerAnimalAdmin(id, nome) {
  confirmarAcao(
    `Remover ${nome}?`,
    `Tem certeza que deseja remover ${nome} do sistema? Essa ação não pode ser desfeita.`,
    async () => {
      try {
        const animal = await buscarAnimalPorId(id);
        const removido = await removerAnimal(id);
        if (!removido) {
          mostrarToastAdmin('Erro ao remover. Tente novamente.', 'erro');
          return;
        }

        if (animal?.foto && !animal.foto.includes('logo-300')) {
          await removerImagem(animal.foto).catch(() => {});
        }

        _animaisAdminCache = _animaisAdminCache.filter((item) => item.id !== id);
        mostrarToastAdmin(`${nome} removido com sucesso.`, 'sucesso');
        carregarListaAnimais();
        if (typeof carregarDashboard === 'function') carregarDashboard();
      } catch (erro) {
        console.error('Erro ao remover animal:', erro);
        mostrarToastAdmin('Erro inesperado. Tente novamente.', 'erro');
      }
    }
  );
}

function voltarParaLista() {
  animalEditandoId = null;
  fotoArquivo = null;
  fotoRemovida = false;
  carregarListaAnimais();
}

document.addEventListener('DOMContentLoaded', () => {
  const btnNovo = document.getElementById('btn-novo-animal');
  if (btnNovo) btnNovo.addEventListener('click', () => abrirFormAnimal());
});
