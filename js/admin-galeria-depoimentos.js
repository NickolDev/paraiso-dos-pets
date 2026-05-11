'use strict';

let depoimentoEditandoId = null;
let fotoDepoimentoArquivo = null;
let fotoDepoimentoRemovida = false;

const ADMIN_MEDIA_FALLBACK = 'images/logo-300.png';
const GALERIA_CATEGORIAS = ['abrigo', 'animais', 'equipe', 'eventos'];

function adminMediaState(containerId, title, text = '', iconPath = '') {
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

function createMediaField(label, control, options = {}) {
  const { id, required = false } = options;
  const group = SafeDOM.el('div', { className: 'admin-campo-grupo' });
  group.appendChild(SafeDOM.el('label', {
    className: 'admin-campo-label',
    attrs: id ? { for: id } : undefined
  }, [
    document.createTextNode(label),
    required ? SafeDOM.el('span', { className: 'obrigatorio', text: ' *' }) : null
  ]));
  group.appendChild(control);
  return group;
}

function renderUploadBlock({ inputId, previewId, previewImageId, buttonText, onChange, onRemove, initialUrl = '' }) {
  const wrapper = SafeDOM.el('div', { className: 'admin-campo-grupo' });
  const trigger = SafeDOM.el('button', {
    className: 'upload-area',
    attrs: { type: 'button' }
  }, [
    SafeDOM.el('div', {
      className: 'upload-area__icone',
      html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z"/></svg>'
    }),
    SafeDOM.el('p', { className: 'upload-area__texto', text: buttonText })
  ]);

  const input = SafeDOM.el('input', { attrs: { id: inputId, type: 'file', accept: 'image/*' } });
  input.style.display = 'none';
  input.addEventListener('change', onChange);
  trigger.addEventListener('click', () => input.click());

  const preview = SafeDOM.el('div', { className: 'upload-preview', attrs: { id: previewId } });
  const previewImage = SafeDOM.el('img', { attrs: { id: previewImageId, alt: 'Preview da imagem' } });
  const removeButton = SafeDOM.el('button', {
    className: 'upload-preview__remover',
    text: '×',
    attrs: { type: 'button', 'aria-label': 'Remover foto' },
    listeners: { click: onRemove }
  });
  preview.appendChild(previewImage);
  preview.appendChild(removeButton);

  if (initialUrl) {
    SafeDOM.setImageSource(previewImage, initialUrl, { fallback: ADMIN_MEDIA_FALLBACK, allowRelative: true });
    preview.classList.add('ativo');
  }

  wrapper.appendChild(trigger);
  wrapper.appendChild(input);
  wrapper.appendChild(preview);
  return wrapper;
}

async function carregarGaleriaAdmin() {
  adminMediaState('conteudo-galeria', 'Carregando galeria...');

  try {
    const snapshot = await db.collection(COLECOES?.GALERIA || 'galeria').orderBy('criadoEm', 'desc').get();
    const fotos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    if (fotos.length === 0) {
      adminMediaState(
        'conteudo-galeria',
        'Nenhuma foto na galeria',
        'Clique em "Nova Foto" para adicionar a primeira imagem.',
        'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'
      );
      return;
    }

    const container = document.getElementById('conteudo-galeria');
    if (!container) return;
    SafeDOM.clear(container);

    const wrapper = SafeDOM.el('div', { className: 'admin-tabela-wrapper' });
    wrapper.appendChild(SafeDOM.el('div', { className: 'admin-tabela-header' }, [
      SafeDOM.el('span', { className: 'admin-tabela-header__titulo', text: `${fotos.length} foto${fotos.length !== 1 ? 's' : ''}` })
    ]));

    const scroll = SafeDOM.el('div');
    scroll.style.overflowX = 'auto';
    const table = SafeDOM.el('table', { className: 'admin-tabela' });
    const headRow = SafeDOM.el('tr');
    ['Foto', 'Legenda', 'Categoria', 'Ações'].forEach((label) => headRow.appendChild(SafeDOM.el('th', { text: label })));
    table.appendChild(SafeDOM.el('thead', {}, [headRow]));
    const tbody = SafeDOM.el('tbody');

    fotos.forEach((foto) => {
      const row = SafeDOM.el('tr');
      const imageCell = SafeDOM.el('td');
      const image = SafeDOM.el('img', { className: 'admin-tabela__foto', attrs: { alt: foto.legenda || 'Foto da galeria' } });
      image.style.width = '80px';
      image.style.height = '60px';
      SafeDOM.setImageSource(image, foto.url, { fallback: ADMIN_MEDIA_FALLBACK, allowRelative: true });
      imageCell.appendChild(image);
      row.appendChild(imageCell);

      row.appendChild(SafeDOM.el('td', { text: foto.legenda || '—' }));
      const catBadge = SafeDOM.el('span', { className: 'status-badge status-badge--pendente', text: foto.categoria || 'abrigo' });
      catBadge.style.background = 'var(--cor-bege-medio)';
      catBadge.style.color = 'var(--cor-secundaria)';
      row.appendChild(SafeDOM.el('td', {}, [catBadge]));

      const actions = SafeDOM.el('td');
      actions.appendChild(SafeDOM.el('button', {
        className: 'btn-acao btn-acao--remover',
        attrs: { type: 'button', title: 'Remover foto' },
        html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
        listeners: { click: () => removerFotoGaleria(foto.id, foto.url || '') }
      }));
      row.appendChild(actions);
      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    scroll.appendChild(table);
    wrapper.appendChild(scroll);
    container.appendChild(wrapper);
  } catch (erro) {
    console.error('Erro galeria admin:', erro);
    adminMediaState('conteudo-galeria', 'Erro ao carregar.');
  }
}

function abrirFormGaleria() {
  const container = document.getElementById('conteudo-galeria');
  if (!container) return;

  SafeDOM.clear(container);
  const card = SafeDOM.el('div', { className: 'admin-form-card' });
  card.appendChild(SafeDOM.el('h3', { className: 'admin-form-card__titulo', text: 'Adicionar Foto à Galeria' }));

  const form = SafeDOM.el('form');
  form.addEventListener('submit', (event) => event.preventDefault());
  form.appendChild(createMediaField('Foto', renderUploadBlock({
    inputId: 'input-foto-galeria',
    previewId: 'preview-galeria',
    previewImageId: 'preview-img-galeria',
    buttonText: 'Clique para escolher uma foto — máximo 5MB',
    onChange: previewFotoGaleria,
    onRemove: limparPreviewGaleria
  }), { required: true }));

  form.appendChild(createMediaField('Legenda', createMediaTextInput('galeria-legenda', 'Descrição da foto'), { id: 'galeria-legenda' }));

  const categoria = SafeDOM.el('select', { className: 'admin-campo-select', attrs: { id: 'galeria-categoria' } });
  GALERIA_CATEGORIAS.forEach((item) => {
    categoria.appendChild(SafeDOM.el('option', { text: item.charAt(0).toUpperCase() + item.slice(1), attrs: { value: item } }));
  });
  form.appendChild(createMediaField('Categoria', categoria, { id: 'galeria-categoria' }));

  form.appendChild(SafeDOM.el('div', { className: 'admin-form-acoes' }, [
    SafeDOM.el('button', {
      className: 'btn--salvar',
      text: 'Adicionar Foto',
      attrs: { id: 'btn-salvar-galeria', type: 'button' },
      listeners: { click: salvarFotoGaleria }
    }),
    SafeDOM.el('button', {
      className: 'btn--cancelar',
      text: 'Cancelar',
      attrs: { type: 'button' },
      listeners: { click: carregarGaleriaAdmin }
    })
  ]));

  card.appendChild(form);
  container.appendChild(card);
}

function createMediaTextInput(id, placeholder, value = '') {
  return SafeDOM.el('input', {
    className: 'admin-campo-input',
    attrs: { id, type: 'text', placeholder },
    value
  });
}

function previewFotoGaleria(event) {
  const arquivo = event.target.files?.[0];
  if (!arquivo || !arquivo.type.startsWith('image/')) return;
  if (arquivo.size > 5 * 1024 * 1024) {
    mostrarToastAdmin('A imagem deve ter no máximo 5MB.', 'erro');
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (loadEvent) => {
    const preview = document.getElementById('preview-galeria');
    const previewImg = document.getElementById('preview-img-galeria');
    if (preview && previewImg) {
      previewImg.src = loadEvent.target?.result || '';
      preview.classList.add('ativo');
    }
  };
  reader.readAsDataURL(arquivo);
}

function limparPreviewGaleria() {
  const preview = document.getElementById('preview-galeria');
  const previewImg = document.getElementById('preview-img-galeria');
  const input = document.getElementById('input-foto-galeria');
  if (preview) preview.classList.remove('ativo');
  if (previewImg) previewImg.removeAttribute('src');
  if (input) input.value = '';
}

async function salvarFotoGaleria() {
  const input = document.getElementById('input-foto-galeria');
  const legenda = document.getElementById('galeria-legenda')?.value.trim() || '';
  const categoria = document.getElementById('galeria-categoria')?.value || 'abrigo';

  if (!input?.files?.[0]) {
    mostrarToastAdmin('Selecione uma foto.', 'erro');
    return;
  }

  const btn = document.getElementById('btn-salvar-galeria');
  if (btn) {
    btn.classList.add('btn-loading');
    btn.disabled = true;
  }

  if (!verificarAdmin()) return;

  try {
    const url = await uploadImagem(input.files[0], 'galeria');
    if (!url) {
      mostrarToastAdmin('Erro no upload.', 'erro');
      return;
    }

    await db.collection(COLECOES?.GALERIA || 'galeria').add({
      url,
      legenda,
      categoria,
      criadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });

    mostrarToastAdmin('Foto adicionada à galeria!', 'sucesso');
    carregarGaleriaAdmin();
  } catch (erro) {
    console.error('Erro ao salvar foto da galeria:', erro);
    mostrarToastAdmin('Erro ao salvar.', 'erro');
  } finally {
    if (btn) {
      btn.classList.remove('btn-loading');
      btn.disabled = false;
    }
  }
}

async function removerFotoGaleria(id, url) {
  confirmarAcao('Remover foto?', 'A foto será removida permanentemente da galeria.', async () => {
    try {
      if (!verificarAdmin()) return;
      await db.collection(COLECOES?.GALERIA || 'galeria').doc(id).delete();
      if (url && !url.includes('logo-300')) await removerImagem(url).catch(() => {});
      mostrarToastAdmin('Foto removida.', 'sucesso');
      carregarGaleriaAdmin();
    } catch (erro) {
      console.error('Erro ao remover foto:', erro);
      mostrarToastAdmin('Erro ao remover.', 'erro');
    }
  });
}

async function carregarDepoimentosAdmin() {
  adminMediaState('conteudo-depoimentos', 'Carregando depoimentos...');

  try {
    const snapshot = await db.collection(COLECOES?.DEPOIMENTOS || 'depoimentos').orderBy('criadoEm', 'desc').get();
    const deps = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    if (deps.length === 0) {
      adminMediaState(
        'conteudo-depoimentos',
        'Nenhum depoimento cadastrado',
        'Clique em "Novo Depoimento" para adicionar o primeiro.',
        'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z'
      );
      return;
    }

    const container = document.getElementById('conteudo-depoimentos');
    if (!container) return;
    SafeDOM.clear(container);

    const wrapper = SafeDOM.el('div', { className: 'admin-tabela-wrapper' });
    wrapper.appendChild(SafeDOM.el('div', { className: 'admin-tabela-header' }, [
      SafeDOM.el('span', { className: 'admin-tabela-header__titulo', text: `${deps.length} depoimento${deps.length !== 1 ? 's' : ''}` })
    ]));

    const scroll = SafeDOM.el('div');
    scroll.style.overflowX = 'auto';
    const table = SafeDOM.el('table', { className: 'admin-tabela' });
    const headRow = SafeDOM.el('tr');
    ['Foto', 'Autor', 'Depoimento', 'Ações'].forEach((label) => headRow.appendChild(SafeDOM.el('th', { text: label })));
    table.appendChild(SafeDOM.el('thead', {}, [headRow]));
    const tbody = SafeDOM.el('tbody');

    deps.forEach((dep) => {
      const row = SafeDOM.el('tr');
      const imageCell = SafeDOM.el('td');
      const image = SafeDOM.el('img', {
        className: 'admin-tabela__foto',
        attrs: { alt: dep.autor || 'Depoimento' }
      });
      image.style.borderRadius = '50%';
      image.style.width = '48px';
      image.style.height = '48px';
      SafeDOM.setImageSource(image, dep.foto || ADMIN_MEDIA_FALLBACK, {
        fallback: ADMIN_MEDIA_FALLBACK,
        allowRelative: true
      });
      imageCell.appendChild(image);
      row.appendChild(imageCell);

      const authorCell = SafeDOM.el('td');
      authorCell.appendChild(SafeDOM.el('strong', { text: dep.autor || '—' }));
      if (dep.data) {
        const small = SafeDOM.el('small', { text: dep.data });
        small.style.color = 'var(--cor-cinza-medio)';
        small.style.display = 'block';
        authorCell.appendChild(small);
      }
      row.appendChild(authorCell);

      const textCell = SafeDOM.el('td');
      const text = SafeDOM.el('p', { text: dep.texto || '' });
      text.style.webkitLineClamp = '2';
      text.style.display = '-webkit-box';
      text.style.webkitBoxOrient = 'vertical';
      text.style.overflow = 'hidden';
      text.style.fontSize = '0.85rem';
      textCell.style.maxWidth = '300px';
      textCell.appendChild(text);
      row.appendChild(textCell);

      const actions = SafeDOM.el('td');
      const wrap = SafeDOM.el('div', { className: 'admin-tabela__acoes' });
      wrap.appendChild(SafeDOM.el('button', {
        className: 'btn-acao btn-acao--editar',
        attrs: { type: 'button', title: 'Editar depoimento' },
        html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',
        listeners: { click: () => abrirFormDepoimento(dep.id) }
      }));
      wrap.appendChild(SafeDOM.el('button', {
        className: 'btn-acao btn-acao--remover',
        attrs: { type: 'button', title: 'Remover depoimento' },
        html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
        listeners: { click: () => removerDepoimento(dep.id, dep.foto || '') }
      }));
      actions.appendChild(wrap);
      row.appendChild(actions);

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    scroll.appendChild(table);
    wrapper.appendChild(scroll);
    container.appendChild(wrapper);
  } catch (erro) {
    console.error('Erro depoimentos admin:', erro);
    adminMediaState('conteudo-depoimentos', 'Erro ao carregar.');
  }
}

async function abrirFormDepoimento(id = null) {
  const container = document.getElementById('conteudo-depoimentos');
  if (!container) return;

  depoimentoEditandoId = id;
  fotoDepoimentoArquivo = null;
  fotoDepoimentoRemovida = false;

  let dep = { autor: '', texto: '', foto: '', data: '', animal: '' };
  if (id) {
    try {
      const doc = await db.collection(COLECOES?.DEPOIMENTOS || 'depoimentos').doc(id).get();
      if (doc.exists) dep = { ...dep, ...doc.data() };
    } catch (erro) {
      console.error('Erro ao buscar depoimento:', erro);
    }
  }

  SafeDOM.clear(container);
  const card = SafeDOM.el('div', { className: 'admin-form-card' });
  card.style.maxWidth = '700px';
  card.appendChild(SafeDOM.el('h3', {
    className: 'admin-form-card__titulo',
    text: id ? 'Editar Depoimento' : 'Novo Depoimento'
  }));

  const form = SafeDOM.el('form');
  form.addEventListener('submit', (event) => event.preventDefault());

  form.appendChild(createMediaField('Foto do adotante ou do pet', renderUploadBlock({
    inputId: 'input-foto-dep',
    previewId: 'preview-dep',
    previewImageId: 'preview-img-dep',
    buttonText: 'Foto circular que aparece no carrossel',
    onChange: previewFotoDep,
    onRemove: limparPreviewDep,
    initialUrl: dep.foto || ''
  })));

  const line = SafeDOM.el('div', { className: 'admin-campos-linha' });
  line.appendChild(createMediaField('Nome do autor', createMediaTextInput('dep-autor', 'Ex: Maria Silva — Ribeirão Preto', dep.autor || ''), { id: 'dep-autor', required: true }));
  line.appendChild(createMediaField('Data / Período', createMediaTextInput('dep-data', 'Ex: Adoção em janeiro/2025', dep.data || ''), { id: 'dep-data' }));
  form.appendChild(line);
  form.appendChild(createMediaField('Nome do animal adotado', createMediaTextInput('dep-animal', 'Ex: Bob', dep.animal || ''), { id: 'dep-animal' }));
  form.appendChild(createMediaField('Depoimento', SafeDOM.el('textarea', {
    className: 'admin-campo-textarea',
    attrs: { id: 'dep-texto', rows: '4', required: 'required', placeholder: 'O que a pessoa disse sobre a experiência de adoção...' },
    value: dep.texto || ''
  }), { id: 'dep-texto', required: true }));

  form.appendChild(SafeDOM.el('div', { className: 'admin-form-acoes' }, [
    SafeDOM.el('button', {
      className: 'btn--salvar',
      text: id ? 'Salvar' : 'Adicionar',
      attrs: { id: 'btn-salvar-dep', type: 'button' },
      listeners: { click: salvarDepoimento }
    }),
    SafeDOM.el('button', {
      className: 'btn--cancelar',
      text: 'Cancelar',
      attrs: { type: 'button' },
      listeners: { click: carregarDepoimentosAdmin }
    })
  ]));

  card.appendChild(form);
  container.appendChild(card);
}

function previewFotoDep(event) {
  const arquivo = event.target.files?.[0];
  if (!arquivo || !arquivo.type.startsWith('image/')) return;
  if (arquivo.size > 5 * 1024 * 1024) {
    mostrarToastAdmin('A imagem deve ter no máximo 5MB.', 'erro');
    event.target.value = '';
    return;
  }

  fotoDepoimentoArquivo = arquivo;
  fotoDepoimentoRemovida = false;
  const reader = new FileReader();
  reader.onload = (loadEvent) => {
    const preview = document.getElementById('preview-dep');
    const img = document.getElementById('preview-img-dep');
    if (preview && img) {
      img.src = loadEvent.target?.result || '';
      preview.classList.add('ativo');
    }
  };
  reader.readAsDataURL(arquivo);
}

function limparPreviewDep() {
  fotoDepoimentoArquivo = null;
  fotoDepoimentoRemovida = true;
  const preview = document.getElementById('preview-dep');
  const img = document.getElementById('preview-img-dep');
  const input = document.getElementById('input-foto-dep');
  if (preview) preview.classList.remove('ativo');
  if (img) img.removeAttribute('src');
  if (input) input.value = '';
}

async function salvarDepoimento() {
  const autor = document.getElementById('dep-autor')?.value.trim();
  const texto = document.getElementById('dep-texto')?.value.trim();
  const data = document.getElementById('dep-data')?.value.trim() || '';
  const animal = document.getElementById('dep-animal')?.value.trim() || '';

  if (!autor || !texto) {
    mostrarToastAdmin('Autor e depoimento são obrigatórios.', 'erro');
    return;
  }

  const btn = document.getElementById('btn-salvar-dep');
  if (btn) {
    btn.classList.add('btn-loading');
    btn.disabled = true;
  }

  if (!verificarAdmin()) return;

  try {
    const dados = {
      autor,
      texto,
      data,
      animal,
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (fotoDepoimentoArquivo) {
      const url = await uploadImagem(fotoDepoimentoArquivo, 'depoimentos');
      if (url) dados.foto = url;
    } else if (depoimentoEditandoId && !fotoDepoimentoRemovida) {
      const atual = await db.collection(COLECOES?.DEPOIMENTOS || 'depoimentos').doc(depoimentoEditandoId).get();
      if (atual.exists && atual.data().foto) dados.foto = atual.data().foto;
    } else if (fotoDepoimentoRemovida) {
      dados.foto = '';
    }

    if (depoimentoEditandoId) {
      await db.collection(COLECOES?.DEPOIMENTOS || 'depoimentos').doc(depoimentoEditandoId).update(dados);
    } else {
      dados.criadoEm = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection(COLECOES?.DEPOIMENTOS || 'depoimentos').add(dados);
    }

    mostrarToastAdmin(depoimentoEditandoId ? 'Depoimento atualizado!' : 'Depoimento adicionado!', 'sucesso');
    carregarDepoimentosAdmin();
  } catch (erro) {
    console.error('Erro ao salvar depoimento:', erro);
    mostrarToastAdmin('Erro ao salvar.', 'erro');
  } finally {
    if (btn) {
      btn.classList.remove('btn-loading');
      btn.disabled = false;
    }
  }
}

async function removerDepoimento(id, fotoUrl) {
  confirmarAcao('Remover depoimento?', 'O depoimento será apagado permanentemente.', async () => {
    try {
      if (!verificarAdmin()) return;
      await db.collection(COLECOES?.DEPOIMENTOS || 'depoimentos').doc(id).delete();
      if (fotoUrl && !fotoUrl.includes('logo-300')) await removerImagem(fotoUrl).catch(() => {});
      mostrarToastAdmin('Depoimento removido.', 'sucesso');
      carregarDepoimentosAdmin();
    } catch (erro) {
      console.error('Erro ao remover depoimento:', erro);
      mostrarToastAdmin('Erro ao remover.', 'erro');
    }
  });
}
