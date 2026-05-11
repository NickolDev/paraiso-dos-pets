'use strict';

const POSTS = [];
const POSTS_POR_PAGINA = 6;
const BLOG_IMAGE_FALLBACK = '../images/logo-300.png';

let paginaAtual = 1;
let categoriaAtual = 'Todos';
let termoBusca = '';

function createBlogImage(src, alt, className, fallback = BLOG_IMAGE_FALLBACK) {
  const image = SafeDOM.el('img', {
    className,
    attrs: { alt: alt || 'Imagem do post', loading: 'lazy' }
  });
  SafeDOM.setImageSource(image, src, { fallback, allowRelative: true });
  return image;
}

function createShareButton(label, ariaLabel, path, handler) {
  return SafeDOM.el('button', {
    className: 'card-post__share-btn',
    attrs: { type: 'button', 'aria-label': ariaLabel },
    listeners: { click: handler },
    html: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`
  });
}

function createPostCard(post, baseHref = 'post.html') {
  const card = SafeDOM.el('div', { className: 'card-post' });

  const imageWrapper = SafeDOM.el('div', { className: 'card-post__imagem-wrapper' }, [
    createBlogImage(post.imagem, post.titulo, 'card-post__imagem')
  ]);
  card.appendChild(imageWrapper);

  const body = SafeDOM.el('div', { className: 'card-post__corpo' });
  const meta = SafeDOM.el('div', { className: 'card-post__meta' }, [
    SafeDOM.el('span', { className: 'badge badge--categoria', text: post.categoria || 'Sem categoria' }),
    SafeDOM.el('span', { text: post.data || '' }),
    SafeDOM.el('span', { text: '•' }),
    SafeDOM.el('span', { text: post.tempoLeitura || '' })
  ]);
  body.appendChild(meta);

  const href = `${baseHref}?id=${encodeURIComponent(String(post.id))}`;
  const link = SafeDOM.el('a', { attrs: { href } }, [
    SafeDOM.el('h3', { className: 'card-post__titulo', text: post.titulo || 'Sem título' })
  ]);
  body.appendChild(link);
  body.appendChild(SafeDOM.el('p', { className: 'card-post__resumo', text: post.resumo || '' }));

  const footer = SafeDOM.el('div', { className: 'card-post__footer' }, [
    SafeDOM.el('a', { className: 'btn btn--primario btn--sm', text: 'Ler Mais', attrs: { href } })
  ]);

  const shareWrap = SafeDOM.el('div', { className: 'card-post__compartilhar' }, [
    createShareButton(
      'WhatsApp',
      'Compartilhar no WhatsApp',
      'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z',
      () => compartilhar('whatsapp', post.id)
    ),
    createShareButton(
      'Copiar',
      'Copiar link do post',
      'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z',
      () => compartilhar('copiar', post.id)
    )
  ]);
  footer.appendChild(shareWrap);
  body.appendChild(footer);
  card.appendChild(body);
  return card;
}

function renderPosts(lista, pagina = 1) {
  const container = document.getElementById('grid-posts');
  if (!container) return;

  const inicio = (pagina - 1) * POSTS_POR_PAGINA;
  const postsPage = lista.slice(inicio, inicio + POSTS_POR_PAGINA);

  SafeDOM.clear(container);

  if (postsPage.length === 0) {
    const empty = SafeDOM.el('div');
    empty.style.textAlign = 'center';
    empty.style.gridColumn = '1 / -1';
    empty.style.padding = '3rem 1rem';

    if (POSTS.length === 0) {
      empty.appendChild(SafeDOM.el('svg', {
        attrs: { viewBox: '0 0 24 24', width: '64', height: '64', 'aria-hidden': 'true' },
        html: '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>'
      }));
      empty.querySelector('svg').style.fill = 'var(--cor-cinza-claro)';
      empty.querySelector('svg').style.marginBottom = '1rem';
      empty.appendChild(SafeDOM.el('h3', { text: 'Conteúdo em breve' }));
      empty.querySelector('h3').style.color = 'var(--cor-texto)';
      empty.querySelector('h3').style.marginBottom = '0.5rem';
      const msg = SafeDOM.el('p', {
        text: 'Estamos preparando artigos sobre cuidados com pets, dicas de adoção e novidades da ONG. Acompanhe nossas redes sociais para ficar por dentro!'
      });
      msg.style.color = 'var(--cor-cinza-medio)';
      empty.appendChild(msg);
    } else {
      const msg = SafeDOM.el('p', { text: 'Nenhum post encontrado.' });
      msg.style.color = 'var(--cor-cinza-medio)';
      msg.style.padding = '2rem';
      empty.appendChild(msg);
    }

    container.appendChild(empty);
    return;
  }

  postsPage.forEach((post) => container.appendChild(createPostCard(post)));

  const contador = document.getElementById('blog-contador');
  if (contador) {
    contador.textContent = `${lista.length} post${lista.length !== 1 ? 's' : ''} encontrado${lista.length !== 1 ? 's' : ''}`;
  }

  renderPaginacao(lista.length);
}

function filtrarPorCategoria(categoria) {
  categoriaAtual = categoria;
  paginaAtual = 1;
  aplicarFiltros();
}

function buscarPosts(termo) {
  termoBusca = SafeDOM.toStringValue(termo).toLowerCase().trim();
  paginaAtual = 1;
  aplicarFiltros();
}

function aplicarFiltros() {
  let resultado = POSTS;

  if (categoriaAtual !== 'Todos') {
    resultado = resultado.filter((post) => post.categoria === categoriaAtual);
  }

  if (termoBusca) {
    resultado = resultado.filter((post) =>
      SafeDOM.toStringValue(post.titulo).toLowerCase().includes(termoBusca) ||
      SafeDOM.toStringValue(post.resumo).toLowerCase().includes(termoBusca)
    );
  }

  renderPosts(resultado, paginaAtual);
}

function renderPaginacao(total) {
  const container = document.getElementById('paginacao');
  if (!container) return;

  const totalPaginas = Math.ceil(total / POSTS_POR_PAGINA);
  SafeDOM.clear(container);
  if (totalPaginas <= 1) return;

  const previous = SafeDOM.el('button', {
    className: 'paginacao__btn',
    text: '← Anterior',
    disabled: paginaAtual === 1,
    attrs: { type: 'button' },
    listeners: {
      click: () => {
        paginaAtual -= 1;
        aplicarFiltros();
        scrollToGrid();
      }
    }
  });
  container.appendChild(previous);

  for (let i = 1; i <= totalPaginas; i += 1) {
    const button = SafeDOM.el('button', {
      className: `paginacao__btn ${i === paginaAtual ? 'ativo' : ''}`.trim(),
      text: i,
      attrs: { type: 'button' },
      listeners: {
        click: () => {
          paginaAtual = i;
          aplicarFiltros();
          scrollToGrid();
        }
      }
    });
    container.appendChild(button);
  }

  const next = SafeDOM.el('button', {
    className: 'paginacao__btn',
    text: 'Próxima →',
    disabled: paginaAtual === totalPaginas,
    attrs: { type: 'button' },
    listeners: {
      click: () => {
        paginaAtual += 1;
        aplicarFiltros();
        scrollToGrid();
      }
    }
  });
  container.appendChild(next);
}

function scrollToGrid() {
  document.getElementById('grid-posts')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function carregarPost() {
  const container = document.getElementById('post-conteudo');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const idParam = params.get('id');
  const post = POSTS.find((item) => String(item.id) === String(idParam));

  if (!post) {
    window.location.href = '../404.html';
    return;
  }

  document.title = `${post.titulo} | ONG Paraíso dos Pets`;

  const heroImg = document.getElementById('post-hero-img');
  if (heroImg) SafeDOM.setImageSource(heroImg, post.imagem, { fallback: BLOG_IMAGE_FALLBACK, allowRelative: true });
  document.getElementById('breadcrumb-titulo')?.replaceChildren(document.createTextNode(post.titulo || ''));
  document.getElementById('post-categoria')?.replaceChildren(document.createTextNode(post.categoria || ''));
  document.getElementById('post-data')?.replaceChildren(document.createTextNode(post.data || ''));
  document.getElementById('post-tempo')?.replaceChildren(document.createTextNode(post.tempoLeitura || ''));
  document.getElementById('post-titulo')?.replaceChildren(document.createTextNode(post.titulo || ''));

  const artigo = document.getElementById('post-artigo');
  if (artigo) {
    artigo.innerHTML = typeof sanitizeHTML === 'function' ? sanitizeHTML(post.conteudo || '') : (post.conteudo || '');
  }

  renderRelacionados(post);
  initProgressBar();
}

function initProgressBar() {
  const barra = document.getElementById('barra-progresso');
  if (!barra) return;

  window.addEventListener('scroll', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progresso = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    barra.style.width = `${progresso}%`;
  }, { passive: true });
}

function renderRelacionados(postAtual) {
  const container = document.getElementById('posts-relacionados');
  const grid = container?.querySelector('.grid-posts');
  if (!container || !grid) return;

  const relacionados = POSTS
    .filter((post) => post.categoria === postAtual.categoria && post.id !== postAtual.id)
    .slice(0, 3);

  if (relacionados.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = '';
  SafeDOM.clear(grid);
  relacionados.forEach((post) => grid.appendChild(createPostCard(post)));
}

function compartilhar(tipo, id) {
  const post = POSTS.find((item) => String(item.id) === String(id));
  if (!post) return;

  const url = `${window.location.origin}/pages/post.html?id=${encodeURIComponent(String(id))}`;

  if (tipo === 'whatsapp') {
    const texto = encodeURIComponent(`${post.titulo} — Confira no blog da ONG Paraíso dos Pets: ${url}`);
    window.open(`https://wa.me/?text=${texto}`, '_blank', 'noopener');
    return;
  }

  if (tipo === 'copiar') {
    navigator.clipboard.writeText(url).then(() => {
      if (typeof showToast === 'function') showToast('Link copiado!', 'sucesso');
    }).catch(() => {
      if (typeof showToast === 'function') showToast('Não foi possível copiar o link', 'erro');
    });
  }
}

function initBlog() {
  const gridPosts = document.getElementById('grid-posts');
  if (!gridPosts) return;

  renderPosts(POSTS);

  document.querySelectorAll('.tab-btn').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach((item) => item.classList.remove('ativo'));
      tab.classList.add('ativo');
      filtrarPorCategoria(tab.dataset.categoria || 'Todos');
    });
  });

  document.getElementById('busca-blog')?.addEventListener('input', (event) => buscarPosts(event.target.value));
  renderSidebar();
}

function renderSidebar() {
  const recentesContainer = document.getElementById('sidebar-recentes');
  if (recentesContainer) {
    SafeDOM.clear(recentesContainer);
    POSTS.slice(0, 5).forEach((post) => {
      const item = SafeDOM.el('a', {
        className: 'sidebar-post',
        attrs: { href: `post.html?id=${encodeURIComponent(String(post.id))}` }
      }, [
        createBlogImage(post.imagem, post.titulo, 'sidebar-post__thumb'),
        SafeDOM.el('div', {}, [
          SafeDOM.el('p', { className: 'sidebar-post__titulo', text: post.titulo || 'Sem título' }),
          SafeDOM.el('span', { className: 'sidebar-post__data', text: post.data || '' })
        ])
      ]);
      recentesContainer.appendChild(item);
    });
  }

  const categoriasContainer = document.getElementById('sidebar-categorias');
  if (categoriasContainer) {
    const contagem = {};
    POSTS.forEach((post) => {
      const categoria = post.categoria || 'Sem categoria';
      contagem[categoria] = (contagem[categoria] || 0) + 1;
    });

    SafeDOM.clear(categoriasContainer);
    Object.entries(contagem).forEach(([categoria, count]) => {
      const item = SafeDOM.el('button', {
        className: 'sidebar-categoria',
        attrs: { type: 'button' },
        listeners: {
          click: () => {
            document.querySelectorAll('.tab-btn').forEach((tab) => {
              tab.classList.toggle('ativo', tab.dataset.categoria === categoria);
            });
            filtrarPorCategoria(categoria);
            scrollToGrid();
          }
        }
      }, [
        SafeDOM.el('span', { text: categoria }),
        SafeDOM.el('span', { className: 'sidebar-categoria__count', text: count })
      ]);
      item.style.background = 'none';
      item.style.border = 'none';
      item.style.padding = '0';
      item.style.width = '100%';
      item.style.textAlign = 'left';
      item.style.cursor = 'pointer';
      categoriasContainer.appendChild(item);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initBlog();
  carregarPost();
});
