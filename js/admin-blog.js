'use strict';

let postEditandoId = null;
let fotoPostArquivo = null;
let fotoPostRemovida = false;
let _postsAdminCache = [];

const CATEGORIAS_BLOG = [
  'Cuidados',
  'Adoção',
  'Como Ajudar',
  'Histórias',
  'Eventos',
  'Educação',
  'ONG'
];

const ADMIN_POST_FALLBACK = 'images/logo-300.png';

function adminBlogState(title, text = '', iconPath = '') {
  const container = document.getElementById('conteudo-blog');
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

function createBlogField(label, control, options = {}) {
  const { id, required = false, help } = options;
  const group = SafeDOM.el('div', { className: 'admin-campo-grupo' });
  const labelNode = SafeDOM.el('label', {
    className: 'admin-campo-label',
    attrs: id ? { for: id } : undefined
  }, [
    document.createTextNode(label),
    required ? SafeDOM.el('span', { className: 'obrigatorio', text: ' *' }) : null
  ]);
  group.appendChild(labelNode);
  group.appendChild(control);
  if (help) {
    const helpText = SafeDOM.el('small', { text: help });
    helpText.style.color = 'var(--cor-cinza-medio)';
    helpText.style.fontSize = '0.75rem';
    helpText.style.display = 'block';
    helpText.style.marginTop = '0.3rem';
    group.appendChild(helpText);
  }
  return group;
}

function createBlogTableShell(totalLabel) {
  const wrapper = SafeDOM.el('div', { className: 'admin-tabela-wrapper' });
  const header = SafeDOM.el('div', { className: 'admin-tabela-header' }, [
    SafeDOM.el('span', { className: 'admin-tabela-header__titulo', text: totalLabel })
  ]);
  const actions = SafeDOM.el('div', { className: 'admin-tabela-header__acoes' });
  const search = SafeDOM.el('input', {
    className: 'admin-busca',
    attrs: {
      type: 'text',
      placeholder: 'Buscar por título...',
      'aria-label': 'Buscar post'
    }
  });
  search.addEventListener('input', (event) => filtrarPostsAdmin(event.target.value));
  actions.appendChild(search);
  header.appendChild(actions);

  const scroll = SafeDOM.el('div');
  scroll.style.overflowX = 'auto';
  const table = SafeDOM.el('table', { className: 'admin-tabela', attrs: { id: 'tabela-posts-admin' } });
  const headRow = SafeDOM.el('tr');
  ['Imagem', 'Título', 'Categoria', 'Data', 'Status', 'Ações'].forEach((label) => {
    headRow.appendChild(SafeDOM.el('th', { text: label }));
  });
  table.appendChild(SafeDOM.el('thead', {}, [headRow]));
  table.appendChild(SafeDOM.el('tbody'));
  scroll.appendChild(table);

  wrapper.appendChild(header);
  wrapper.appendChild(scroll);
  return { wrapper, tbody: table.querySelector('tbody') };
}

function renderBlogUpload(currentImage = '') {
  const wrapper = SafeDOM.el('div', { className: 'admin-campo-grupo' });
  wrapper.appendChild(SafeDOM.el('label', { className: 'admin-campo-label', text: 'Imagem de destaque' }));

  const trigger = SafeDOM.el('button', {
    className: 'upload-area',
    attrs: { id: 'upload-area-post', type: 'button' }
  }, [
    SafeDOM.el('div', {
      className: 'upload-area__icone',
      html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z"/></svg>'
    }),
    SafeDOM.el('p', { className: 'upload-area__texto' }, [
      document.createTextNode('Clique para escolher uma imagem. '),
      SafeDOM.el('strong', { text: 'JPG, PNG ou WebP — máximo 5MB' })
    ])
  ]);

  const input = SafeDOM.el('input', {
    attrs: { id: 'input-foto-post', type: 'file', accept: 'image/*' }
  });
  input.style.display = 'none';
  input.addEventListener('change', handleUploadFotoPost);
  trigger.addEventListener('click', () => input.click());

  const preview = SafeDOM.el('div', { className: 'upload-preview', attrs: { id: 'preview-foto-post' } });
  const img = SafeDOM.el('img', { attrs: { id: 'preview-img-post', alt: 'Preview da imagem do post' } });
  const removeBtn = SafeDOM.el('button', {
    className: 'upload-preview__remover',
    text: '×',
    attrs: { type: 'button', 'aria-label': 'Remover imagem' },
    listeners: { click: removerFotoPreviewPost }
  });
  preview.appendChild(img);
  preview.appendChild(removeBtn);

  if (currentImage) {
    SafeDOM.setImageSource(img, currentImage, { fallback: ADMIN_POST_FALLBACK, allowRelative: true });
    preview.classList.add('ativo');
  }

  wrapper.appendChild(trigger);
  wrapper.appendChild(input);
  wrapper.appendChild(preview);
  return wrapper;
}

async function carregarListaPosts() {
  adminBlogState('Carregando posts...');

  try {
    _postsAdminCache = await buscarPosts(false);
    if (_postsAdminCache.length === 0) {
      adminBlogState(
        'Nenhum post cadastrado',
        'Clique em "Novo Post" para criar o primeiro artigo do blog.',
        'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z'
      );
      return;
    }

    renderTabelaPosts(_postsAdminCache);
  } catch (erro) {
    console.error('Erro ao carregar posts:', erro);
    adminBlogState('Erro ao carregar posts.');
  }
}

function renderTabelaPosts(lista) {
  const container = document.getElementById('conteudo-blog');
  if (!container) return;

  SafeDOM.clear(container);
  const { wrapper, tbody } = createBlogTableShell(`${lista.length} post${lista.length !== 1 ? 's' : ''}`);

  lista.forEach((post) => {
    const titulo = SafeDOM.toStringValue(post.titulo || 'Sem título');
    const categoria = SafeDOM.toStringValue(post.categoria || '—');
    const data = SafeDOM.toStringValue(post.data || formatarData(post.criadoEm));
    const publicado = post.publicado !== false;

    const row = SafeDOM.el('tr', {
      dataset: { titulo: titulo.toLowerCase(), search: `${titulo} ${categoria}`.toLowerCase() }
    });

    const imageCell = SafeDOM.el('td');
    const image = SafeDOM.el('img', { className: 'admin-tabela__foto', attrs: { alt: titulo } });
    SafeDOM.setImageSource(image, post.imagem, { fallback: ADMIN_POST_FALLBACK, allowRelative: true });
    imageCell.appendChild(image);
    row.appendChild(imageCell);

    const titleCell = SafeDOM.el('td', {}, [SafeDOM.el('strong', { text: titulo })]);
    titleCell.style.maxWidth = '300px';
    row.appendChild(titleCell);

    const catBadge = SafeDOM.el('span', {
      className: 'status-badge status-badge--pendente',
      text: categoria
    });
    catBadge.style.background = 'var(--cor-bege-medio)';
    catBadge.style.color = 'var(--cor-secundaria)';
    row.appendChild(SafeDOM.el('td', {}, [catBadge]));

    const dataCell = SafeDOM.el('td', { text: data });
    dataCell.style.whiteSpace = 'nowrap';
    row.appendChild(dataCell);

    const statusButton = SafeDOM.el('button', {
      className: `status-badge ${publicado ? 'status-badge--publicado' : 'status-badge--rascunho'}`,
      text: publicado ? 'Publicado' : 'Rascunho',
      attrs: {
        type: 'button',
        title: publicado ? 'Clique para despublicar' : 'Clique para publicar',
        'aria-label': publicado ? 'Despublicar post' : 'Publicar post'
      },
      listeners: { click: () => togglePublicacao(post.id, !publicado) }
    });
    statusButton.style.cursor = 'pointer';
    statusButton.style.border = 'none';
    statusButton.style.fontFamily = 'var(--fonte-corpo)';
    row.appendChild(SafeDOM.el('td', {}, [statusButton]));

    const actions = SafeDOM.el('td');
    const wrap = SafeDOM.el('div', { className: 'admin-tabela__acoes' });
    wrap.appendChild(SafeDOM.el('button', {
      className: 'btn-acao btn-acao--editar',
      attrs: { type: 'button', title: 'Editar post', 'aria-label': `Editar ${titulo}` },
      html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',
      listeners: { click: () => abrirFormPost(post.id) }
    }));
    wrap.appendChild(SafeDOM.el('button', {
      className: 'btn-acao btn-acao--remover',
      attrs: { type: 'button', title: 'Remover post', 'aria-label': `Remover ${titulo}` },
      html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
      listeners: { click: () => removerPostAdmin(post.id, titulo.substring(0, 60)) }
    }));
    actions.appendChild(wrap);
    row.appendChild(actions);

    tbody.appendChild(row);
  });

  container.appendChild(wrapper);
}

function filtrarPostsAdmin(termo) {
  const query = SafeDOM.toStringValue(termo).toLowerCase().trim();
  document.querySelectorAll('#tabela-posts-admin tbody tr').forEach((row) => {
    row.style.display = (row.dataset.search || '').includes(query) ? '' : 'none';
  });
}

async function abrirFormPost(id = null) {
  const container = document.getElementById('conteudo-blog');
  if (!container) return;

  postEditandoId = id;
  fotoPostArquivo = null;
  fotoPostRemovida = false;

  let post = {
    titulo: '',
    resumo: '',
    conteudo: '',
    categoria: 'Cuidados',
    data: new Date().toLocaleDateString('pt-BR'),
    tempoLeitura: '5 min de leitura',
    imagem: '',
    publicado: false
  };

  if (id) {
    const dados = await buscarPostPorId(id);
    if (dados) post = { ...post, ...dados };
  }

  SafeDOM.clear(container);
  const card = SafeDOM.el('div', { className: 'admin-form-card' });
  card.style.maxWidth = '800px';
  card.appendChild(SafeDOM.el('h3', {
    className: 'admin-form-card__titulo',
    text: id ? 'Editar Post' : 'Criar Novo Post'
  }));

  const form = SafeDOM.el('form', { attrs: { id: 'form-post-admin' } });
  form.addEventListener('submit', (event) => event.preventDefault());

  form.appendChild(createBlogField('Título', SafeDOM.el('input', {
    className: 'admin-campo-input',
    attrs: { id: 'post-titulo', type: 'text', required: 'required', placeholder: 'Título do artigo' },
    value: post.titulo || ''
  }), { id: 'post-titulo', required: true }));

  const line = SafeDOM.el('div', { className: 'admin-campos-linha' });
  const categoria = SafeDOM.el('select', { className: 'admin-campo-select', attrs: { id: 'post-categoria' } });
  CATEGORIAS_BLOG.forEach((item) => {
    const option = SafeDOM.el('option', { text: item, attrs: { value: item } });
    option.selected = post.categoria === item;
    categoria.appendChild(option);
  });
  line.appendChild(createBlogField('Categoria', categoria, { id: 'post-categoria', required: true }));
  line.appendChild(createBlogField('Data de publicação', SafeDOM.el('input', {
    className: 'admin-campo-input',
    attrs: { id: 'post-data', type: 'text', placeholder: 'DD/MM/AAAA' },
    value: post.data || ''
  }), { id: 'post-data' }));
  form.appendChild(line);

  form.appendChild(createBlogField('Tempo de leitura', SafeDOM.el('input', {
    className: 'admin-campo-input',
    attrs: { id: 'post-tempo', type: 'text', placeholder: 'Ex: 5 min de leitura' },
    value: post.tempoLeitura || ''
  }), { id: 'post-tempo' }));

  form.appendChild(renderBlogUpload(post.imagem || ''));

  form.appendChild(createBlogField('Resumo', SafeDOM.el('textarea', {
    className: 'admin-campo-textarea',
    attrs: { id: 'post-resumo', rows: '3', required: 'required', placeholder: 'Resumo curto que aparece no card do blog...' },
    value: post.resumo || ''
  }), {
    id: 'post-resumo',
    required: true,
    help: 'Aparece no card do blog e na listagem de posts.'
  }));

  form.appendChild(createBlogField('Conteúdo completo', SafeDOM.el('textarea', {
    className: 'admin-campo-textarea',
    attrs: { id: 'post-conteudo', rows: '12', required: 'required', placeholder: 'Conteúdo do artigo em HTML seguro.' },
    value: post.conteudo || ''
  }), {
    id: 'post-conteudo',
    required: true,
    help: 'Use HTML sem scripts. O conteúdo público é sanitizado antes da renderização.'
  }));

  const publishWrap = SafeDOM.el('div', { className: 'admin-campo-grupo' });
  const publishLabel = SafeDOM.el('label', {}, [
    SafeDOM.el('input', {
      attrs: { id: 'post-publicado', type: 'checkbox' },
      checked: post.publicado !== false
    }),
    document.createTextNode(' Publicar imediatamente')
  ]);
  publishLabel.style.display = 'flex';
  publishLabel.style.alignItems = 'center';
  publishLabel.style.gap = '0.5rem';
  publishLabel.style.cursor = 'pointer';
  publishLabel.style.fontSize = '0.95rem';
  publishWrap.appendChild(publishLabel);
  form.appendChild(publishWrap);

  form.appendChild(SafeDOM.el('div', { className: 'admin-form-acoes' }, [
    SafeDOM.el('button', {
      className: 'btn--salvar',
      text: id ? 'Salvar Alterações' : 'Criar Post',
      attrs: { id: 'btn-salvar-post', type: 'button' },
      listeners: { click: salvarPostForm }
    }),
    SafeDOM.el('button', {
      className: 'btn--cancelar',
      text: 'Cancelar',
      attrs: { type: 'button' },
      listeners: { click: voltarParaListaPosts }
    })
  ]));

  card.appendChild(form);
  container.appendChild(card);
  window.scrollTo(0, 0);
}

function handleUploadFotoPost(event) {
  const arquivo = event.target.files?.[0];
  if (!arquivo) return;

  if (!arquivo.type.startsWith('image/')) {
    mostrarToastAdmin('Selecione um arquivo de imagem.', 'erro');
    event.target.value = '';
    return;
  }

  if (arquivo.size > 5 * 1024 * 1024) {
    mostrarToastAdmin('A imagem deve ter no máximo 5MB.', 'erro');
    event.target.value = '';
    return;
  }

  fotoPostArquivo = arquivo;
  fotoPostRemovida = false;

  const reader = new FileReader();
  reader.onload = (loadEvent) => {
    const preview = document.getElementById('preview-foto-post');
    const previewImg = document.getElementById('preview-img-post');
    if (preview && previewImg) {
      previewImg.src = loadEvent.target?.result || '';
      preview.classList.add('ativo');
    }
  };
  reader.readAsDataURL(arquivo);
}

function removerFotoPreviewPost() {
  fotoPostArquivo = null;
  fotoPostRemovida = true;
  const preview = document.getElementById('preview-foto-post');
  const previewImg = document.getElementById('preview-img-post');
  const input = document.getElementById('input-foto-post');
  if (preview) preview.classList.remove('ativo');
  if (previewImg) previewImg.removeAttribute('src');
  if (input) input.value = '';
}

async function salvarPostForm() {
  const titulo = document.getElementById('post-titulo')?.value.trim();
  const categoria = document.getElementById('post-categoria')?.value;
  const data = document.getElementById('post-data')?.value.trim();
  const tempoLeitura = document.getElementById('post-tempo')?.value.trim();
  const resumo = document.getElementById('post-resumo')?.value.trim();
  const conteudo = document.getElementById('post-conteudo')?.value.trim();
  const publicado = document.getElementById('post-publicado')?.checked || false;

  if (!titulo) {
    mostrarToastAdmin('O título é obrigatório.', 'erro');
    return;
  }
  if (!resumo) {
    mostrarToastAdmin('O resumo é obrigatório.', 'erro');
    return;
  }
  if (!conteudo) {
    mostrarToastAdmin('O conteúdo é obrigatório.', 'erro');
    return;
  }

  const btnSalvar = document.getElementById('btn-salvar-post');
  if (btnSalvar) {
    btnSalvar.classList.add('btn-loading');
    btnSalvar.disabled = true;
  }

  try {
    const dados = { titulo, categoria, data, tempoLeitura, resumo, conteudo, publicado };

    if (fotoPostArquivo) {
      const urlFoto = await uploadImagem(fotoPostArquivo, 'blog');
      if (!urlFoto) {
        mostrarToastAdmin('Erro ao enviar a imagem.', 'erro');
        return;
      }
      dados.imagem = urlFoto;
    } else if (postEditandoId && !fotoPostRemovida) {
      const atual = await buscarPostPorId(postEditandoId);
      if (atual?.imagem) dados.imagem = atual.imagem;
    } else if (fotoPostRemovida) {
      dados.imagem = '';
    }

    const idSalvo = await salvarPost(dados, postEditandoId);
    if (!idSalvo) {
      mostrarToastAdmin('Erro ao salvar post.', 'erro');
      return;
    }

    mostrarToastAdmin(
      `Post ${postEditandoId ? 'atualizado' : 'criado'} ${publicado ? 'e publicado' : 'como rascunho'} com sucesso!`,
      'sucesso'
    );
    voltarParaListaPosts();
  } catch (erro) {
    console.error('Erro ao salvar post:', erro);
    mostrarToastAdmin('Erro inesperado ao salvar.', 'erro');
  } finally {
    if (btnSalvar) {
      btnSalvar.classList.remove('btn-loading');
      btnSalvar.disabled = false;
    }
  }
}

async function togglePublicacao(id, publicar) {
  try {
    await salvarPost({ publicado: publicar }, id);
    const post = _postsAdminCache.find((item) => item.id === id);
    if (post) post.publicado = publicar;
    mostrarToastAdmin(`Post ${publicar ? 'publicado' : 'movido para rascunhos'}.`, 'sucesso');
    carregarListaPosts();
  } catch (erro) {
    console.error('Erro ao alterar publicação:', erro);
    mostrarToastAdmin('Erro ao alterar publicação.', 'erro');
  }
}

function removerPostAdmin(id, titulo) {
  confirmarAcao(
    'Remover post?',
    `Tem certeza que deseja remover "${titulo}"? O post será apagado permanentemente do blog.`,
    async () => {
      try {
        const post = await buscarPostPorId(id);
        const removido = await removerPost(id);
        if (!removido) {
          mostrarToastAdmin('Erro ao remover post.', 'erro');
          return;
        }

        if (post?.imagem && !post.imagem.includes('logo-300')) {
          await removerImagem(post.imagem).catch(() => {});
        }

        _postsAdminCache = _postsAdminCache.filter((item) => item.id !== id);
        mostrarToastAdmin('Post removido com sucesso.', 'sucesso');
        carregarListaPosts();
      } catch (erro) {
        console.error('Erro ao remover post:', erro);
        mostrarToastAdmin('Erro inesperado.', 'erro');
      }
    }
  );
}

function voltarParaListaPosts() {
  postEditandoId = null;
  fotoPostArquivo = null;
  fotoPostRemovida = false;
  carregarListaPosts();
}

document.addEventListener('DOMContentLoaded', () => {
  const btnNovo = document.getElementById('btn-novo-post');
  if (btnNovo) btnNovo.addEventListener('click', () => abrirFormPost());
});
