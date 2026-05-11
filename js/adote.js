'use strict';

const ANIMAIS = [];
const FAVORITOS_KEY = 'paraiso_favoritos';
const ADOTE_IMAGE_FALLBACK = '../images/logo-300.png';

function renderAnimais(lista) {
  const container = document.getElementById('grid-animais');
  if (!container) return;

  SafeDOM.clear(container);

  if (lista.length === 0) {
    const empty = SafeDOM.el('div');
    empty.style.textAlign = 'center';
    empty.style.gridColumn = '1 / -1';
    empty.style.padding = '3rem 1rem';

    if (ANIMAIS.length === 0) {
      empty.appendChild(SafeDOM.el('svg', {
        attrs: { viewBox: '0 0 24 24', width: '64', height: '64', 'aria-hidden': 'true' },
        html: '<path d="M4.5 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm15 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm-7-3a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>'
      }));
      empty.querySelector('svg').style.fill = 'var(--cor-cinza-claro)';
      empty.querySelector('svg').style.marginBottom = '1rem';
      empty.appendChild(SafeDOM.el('h3', { text: 'Em breve nossos pets estarão aqui' }));
      empty.querySelector('h3').style.color = 'var(--cor-texto)';
      empty.querySelector('h3').style.marginBottom = '0.5rem';
      const message = SafeDOM.el('p', {
        text: 'Estamos preparando tudo para você conhecer nossos animais disponíveis para adoção. Enquanto isso, entre em contato pelo WhatsApp!'
      });
      message.style.color = 'var(--cor-cinza-medio)';
      empty.appendChild(message);
      const contactLink = SafeDOM.el('a', {
        className: 'btn btn--primario',
        text: 'Falar pelo WhatsApp',
        attrs: {
          href: 'https://wa.me/5516999999999?text=Ol%C3%A1!%20Gostaria%20de%20saber%20sobre%20animais%20dispon%C3%ADveis%20para%20ado%C3%A7%C3%A3o.',
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      });
      contactLink.style.marginTop = '1.5rem';
      contactLink.style.display = 'inline-flex';
      empty.appendChild(contactLink);
    } else {
      const text = SafeDOM.el('p', { text: 'Nenhum animal encontrado com esses filtros.' });
      text.style.color = 'var(--cor-cinza-medio)';
      text.style.padding = '2rem';
      empty.appendChild(text);
    }

    container.appendChild(empty);
    return;
  }

  lista.forEach((animal) => {
    container.appendChild(criarCard(animal));
  });

  const contador = document.getElementById('filtros-contador');
  if (contador) contador.textContent = `Exibindo ${lista.length} de ${ANIMAIS.length} animais`;
}

function createAnimalStatusBadge(status) {
  const statusClasse = {
    'Disponível': 'badge--disponivel',
    'Reservado': 'badge--reservado',
    'Em Tratamento': 'badge--tratamento'
  };
  return SafeDOM.el('span', {
    className: `badge ${statusClasse[status] || 'badge--disponivel'}`,
    text: status || 'Disponível'
  });
}

function createAnimalFeature(text) {
  return SafeDOM.el('span', { className: 'card-animal__icone-info' }, [
    SafeDOM.el('svg', {
      attrs: { viewBox: '0 0 24 24', 'aria-hidden': 'true' },
      html: '<path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>'
    }),
    document.createTextNode(` ${text}`)
  ]);
}

function criarCard(animal) {
  const favoritos = carregarFavoritos();
  const isFavorito = favoritos.includes(animal.id);
  const card = SafeDOM.el('div', { className: 'card-animal', attrs: { 'data-id': String(animal.id) } });

  const fotoWrapper = SafeDOM.el('div', {
    className: 'card-animal__foto-wrapper',
    listeners: { click: () => abrirLightbox(animal.id) }
  });
  const foto = SafeDOM.el('img', {
    className: 'card-animal__foto',
    attrs: { alt: animal.nome || 'Animal para adoção', loading: 'lazy' }
  });
  SafeDOM.setImageSource(foto, animal.foto, { fallback: ADOTE_IMAGE_FALLBACK, allowRelative: true });
  fotoWrapper.appendChild(foto);

  const badges = SafeDOM.el('div', { className: 'card-animal__badges' }, [
    createAnimalStatusBadge(animal.status),
    animal.novo ? SafeDOM.el('span', { className: 'badge badge--novo', text: 'Novo' }) : null
  ]);
  fotoWrapper.appendChild(badges);
  card.appendChild(fotoWrapper);

  const favoriteButton = SafeDOM.el('button', {
    className: `card-animal__favorito ${isFavorito ? 'ativo' : ''}`,
    attrs: {
      type: 'button',
      'aria-label': isFavorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'
    },
    listeners: {
      click: (event) => {
        event.stopPropagation();
        toggleFavorito(animal.id);
      }
    },
    html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>'
  });
  card.appendChild(favoriteButton);

  const info = SafeDOM.el('div', { className: 'card-animal__info' });
  info.appendChild(SafeDOM.el('h3', { className: 'card-animal__nome', text: animal.nome || 'Sem nome' }));

  const detalhes = SafeDOM.el('div', { className: 'card-animal__detalhes' });
  [animal.idade, '•', animal.porte, '•', animal.sexo].forEach((item, index) => {
    if (!item) return;
    detalhes.appendChild(SafeDOM.el('span', {
      className: 'card-animal__detalhe',
      text: item
    }));
  });
  info.appendChild(detalhes);

  const icones = SafeDOM.el('div', { className: 'card-animal__icones' }, [
    animal.vacinado ? createAnimalFeature('Vacinado') : null,
    animal.castrado ? createAnimalFeature('Castrado') : null
  ]);
  info.appendChild(icones);

  info.appendChild(SafeDOM.el('p', { className: 'card-animal__descricao', text: animal.descricao || '' }));

  const actions = SafeDOM.el('div');
  actions.style.display = 'flex';
  actions.style.gap = '0.5rem';
  actions.style.alignItems = 'center';
  actions.style.flexWrap = 'wrap';

  actions.appendChild(SafeDOM.el('a', {
    className: 'btn btn--primario btn--sm card-animal__btn',
    text: 'Quero adotar',
    attrs: { href: `ficha-adocao.html?animal=${encodeURIComponent(String(animal.id))}` }
  }));

  const shareButton = SafeDOM.el('button', {
    className: 'btn btn--sm card-animal__btn-compartilhar',
    attrs: { type: 'button', 'aria-label': 'Compartilhar', title: 'Compartilhar' },
    listeners: {
      click: (event) => {
        event.stopPropagation();
        compartilharAnimal(animal.nome || 'Animal', animal.id);
      }
    }
  }, [
    SafeDOM.el('svg', {
      attrs: { viewBox: '0 0 24 24', 'aria-hidden': 'true' },
      html: '<path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>'
    }),
    document.createTextNode(' Compartilhar')
  ]);
  shareButton.style.padding = '0.5rem 0.75rem';
  shareButton.style.background = 'var(--cor-bege)';
  shareButton.style.border = '2px solid var(--cor-cinza-claro)';
  shareButton.style.borderRadius = '50px';
  shareButton.style.cursor = 'pointer';
  shareButton.style.display = 'flex';
  shareButton.style.alignItems = 'center';
  shareButton.style.gap = '0.3rem';
  shareButton.style.fontSize = '0.8rem';
  shareButton.style.fontWeight = '600';
  shareButton.style.color = 'var(--cor-cinza-medio)';
  actions.appendChild(shareButton);

  info.appendChild(actions);
  card.appendChild(info);

  return card;
}

function filtrarAnimais() {
  const porteAtivo = document.querySelector('[data-filtro="porte"].ativo')?.dataset.valor || 'Todos';
  const sexoAtivo = document.querySelector('[data-filtro="sexo"].ativo')?.dataset.valor || 'Todos';
  const statusAtivo = document.querySelector('[data-filtro="status"].ativo')?.dataset.valor || 'Todos';
  const busca = (document.getElementById('busca-animal')?.value || '').toLowerCase().trim();

  const resultado = ANIMAIS.filter((animal) => {
    if (porteAtivo !== 'Todos' && animal.porte !== porteAtivo) return false;
    if (sexoAtivo !== 'Todos' && animal.sexo !== sexoAtivo) return false;
    if (statusAtivo !== 'Todos' && animal.status !== statusAtivo) return false;
    if (busca && !SafeDOM.toStringValue(animal.nome).toLowerCase().includes(busca)) return false;
    return true;
  });

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

function abrirLightbox(id) {
  const animal = ANIMAIS.find((item) => item.id === id);
  if (!animal) return;

  const lightbox = document.getElementById('lightbox');
  const conteudo = lightbox?.querySelector('.lightbox__conteudo');
  if (!lightbox || !conteudo) return;

  SafeDOM.clear(conteudo);

  const closeButton = SafeDOM.el('button', {
    className: 'lightbox__fechar',
    attrs: { type: 'button', 'aria-label': 'Fechar' },
    listeners: { click: fecharLightbox },
    html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>'
  });
  conteudo.appendChild(closeButton);

  const image = SafeDOM.el('img', {
    className: 'lightbox__imagem',
    attrs: { alt: animal.nome || 'Animal para adoção' }
  });
  SafeDOM.setImageSource(image, animal.foto, { fallback: ADOTE_IMAGE_FALLBACK, allowRelative: true });
  conteudo.appendChild(image);

  const info = SafeDOM.el('div', { className: 'lightbox__info' });
  const badgeRow = SafeDOM.el('div');
  badgeRow.style.display = 'flex';
  badgeRow.style.gap = '0.5rem';
  badgeRow.style.marginBottom = '0.75rem';
  badgeRow.appendChild(createAnimalStatusBadge(animal.status));
  if (animal.novo) badgeRow.appendChild(SafeDOM.el('span', { className: 'badge badge--novo', text: 'Novo' }));
  info.appendChild(badgeRow);
  info.appendChild(SafeDOM.el('h2', { className: 'lightbox__nome', text: animal.nome || 'Sem nome' }));

  const meta = SafeDOM.el('div', { className: 'lightbox__meta' });
  [animal.idade, '•', `Porte ${animal.porte || 'não informado'}`, '•', animal.sexo, '•', animal.castrado ? 'Castrado' : 'Não castrado', '•', animal.vacinado ? 'Vacinado' : 'Vacinação pendente']
    .forEach((item) => meta.appendChild(SafeDOM.el('span', { text: item })));
  info.appendChild(meta);

  info.appendChild(SafeDOM.el('p', { className: 'lightbox__descricao', text: animal.descricao || '' }));
  const historico = SafeDOM.el('div', { className: 'lightbox__historico' }, [
    SafeDOM.el('strong', { text: 'Histórico de resgate:' }),
    document.createTextNode(` ${animal.historico || 'Não informado.'}`)
  ]);
  info.appendChild(historico);
  info.appendChild(SafeDOM.el('a', {
    className: 'btn btn--primario',
    text: `🐾 Quero adotar ${animal.nome || 'este pet'}`,
    attrs: { href: `ficha-adocao.html?animal=${encodeURIComponent(String(animal.id))}` }
  }));
  info.lastChild.style.width = '100%';
  info.lastChild.style.justifyContent = 'center';
  conteudo.appendChild(info);

  lightbox.classList.add('ativo');
  document.body.style.overflow = 'hidden';
  conteudo.focus();
}

function fecharLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  lightbox.classList.remove('ativo');
  document.body.style.overflow = '';
}

function toggleFavorito(id) {
  const favoritos = carregarFavoritos();
  const index = favoritos.indexOf(id);

  if (index > -1) {
    favoritos.splice(index, 1);
    if (typeof showToast === 'function') showToast('Removido dos favoritos', 'info');
  } else {
    favoritos.push(id);
    if (typeof showToast === 'function') showToast('Adicionado aos favoritos!', 'sucesso');
  }

  try {
    localStorage.setItem(FAVORITOS_KEY, JSON.stringify(favoritos));
  } catch (erro) {
    console.warn('Não foi possível salvar favoritos:', erro);
  }

  const button = document.querySelector(`.card-animal[data-id="${id}"] .card-animal__favorito`);
  if (button) {
    button.classList.toggle('ativo', favoritos.includes(id));
    button.setAttribute('aria-label', favoritos.includes(id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
  }

  atualizarContadorFav();
  renderFavoritos();
}

function carregarFavoritos() {
  try {
    const dados = localStorage.getItem(FAVORITOS_KEY);
    return dados ? JSON.parse(dados) : [];
  } catch (erro) {
    return [];
  }
}

function atualizarContadorFav() {
  const badge = document.getElementById('fav-count');
  if (!badge) return;
  const favoritos = carregarFavoritos();
  badge.textContent = favoritos.length;
  badge.style.display = favoritos.length > 0 ? 'inline-flex' : 'none';
}

function renderFavoritos() {
  const secao = document.getElementById('favoritos-secao');
  const grid = secao?.querySelector('.favoritos-secao__grid');
  if (!secao || !grid) return;

  const favoritos = carregarFavoritos();
  if (favoritos.length === 0) {
    secao.classList.remove('ativo');
    SafeDOM.clear(grid);
    return;
  }

  secao.classList.add('ativo');
  SafeDOM.clear(grid);

  ANIMAIS.filter((animal) => favoritos.includes(animal.id)).forEach((animal) => {
    const item = SafeDOM.el('div');
    item.style.display = 'flex';
    item.style.alignItems = 'center';
    item.style.gap = '0.5rem';
    item.style.padding = '0.5rem';
    item.style.background = 'var(--cor-branco)';
    item.style.borderRadius = 'var(--raio-sm)';

    const img = SafeDOM.el('img', {
      attrs: { alt: animal.nome || 'Animal favorito' }
    });
    img.style.width = '50px';
    img.style.height = '50px';
    img.style.borderRadius = 'var(--raio-sm)';
    img.style.objectFit = 'cover';
    SafeDOM.setImageSource(img, animal.foto, { fallback: ADOTE_IMAGE_FALLBACK, allowRelative: true });
    item.appendChild(img);

    const textWrap = SafeDOM.el('div', {}, [
      SafeDOM.el('strong', { text: animal.nome || 'Sem nome' }),
      SafeDOM.el('p', { text: `${animal.porte || 'Porte'} • ${animal.sexo || 'Sexo'}` })
    ]);
    textWrap.querySelector('strong').style.fontSize = 'var(--tamanho-sm)';
    textWrap.querySelector('p').style.fontSize = 'var(--tamanho-xs)';
    textWrap.querySelector('p').style.color = 'var(--cor-cinza-medio)';
    textWrap.querySelector('p').style.margin = '0';
    item.appendChild(textWrap);

    grid.appendChild(item);
  });
}

function initAdote() {
  const gridPrincipal = document.getElementById('grid-animais');
  if (!gridPrincipal) return;

  renderAnimais(ANIMAIS);

  document.querySelectorAll('.filtro-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const grupo = button.dataset.filtro;
      document.querySelectorAll(`[data-filtro="${grupo}"]`).forEach((item) => item.classList.remove('ativo'));
      button.classList.add('ativo');
      filtrarAnimais();
    });
  });

  document.getElementById('busca-animal')?.addEventListener('input', filtrarAnimais);
  atualizarContadorFav();
  renderFavoritos();

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') fecharLightbox();
  });

  document.querySelector('#lightbox .lightbox__overlay')?.addEventListener('click', fecharLightbox);
}

document.addEventListener('DOMContentLoaded', initAdote);

function compartilharAnimal(nome, id) {
  const url = `${window.location.origin}${window.location.pathname}?destaque=${encodeURIComponent(String(id))}`;
  const texto = `Olha que lindo(a)! ${nome} está esperando por um lar na ONG Paraíso dos Pets. Conheça:`;

  if (navigator.share) {
    navigator.share({
      title: `${nome} — ONG Paraíso dos Pets`,
      text: texto,
      url
    }).catch(() => {});
    return;
  }

  const overlay = SafeDOM.el('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.background = 'rgba(0,0,0,0.5)';
  overlay.style.zIndex = '9999';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';

  const closeMenu = () => overlay.remove();
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeMenu();
  });

  const box = SafeDOM.el('div');
  box.style.background = '#fff';
  box.style.borderRadius = '16px';
  box.style.padding = '2rem';
  box.style.maxWidth = '320px';
  box.style.width = '90%';
  box.style.textAlign = 'center';
  box.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)';
  box.appendChild(SafeDOM.el('h3', { text: `Compartilhar ${nome}` }));
  box.querySelector('h3').style.marginBottom = '1rem';
  box.querySelector('h3').style.color = 'var(--cor-texto)';

  const actions = SafeDOM.el('div');
  actions.style.display = 'flex';
  actions.style.flexDirection = 'column';
  actions.style.gap = '0.75rem';

  const whatsappButton = SafeDOM.el('button', {
    text: 'WhatsApp',
    attrs: { type: 'button' },
    listeners: {
      click: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(`${texto} ${url}`)}`, '_blank', 'noopener');
        closeMenu();
      }
    }
  });
  whatsappButton.style.padding = '0.75rem';
  whatsappButton.style.borderRadius = '50px';
  whatsappButton.style.border = 'none';
  whatsappButton.style.background = '#25D366';
  whatsappButton.style.color = '#fff';
  whatsappButton.style.fontWeight = '700';
  whatsappButton.style.cursor = 'pointer';
  whatsappButton.style.fontSize = '0.9rem';
  whatsappButton.style.fontFamily = 'var(--fonte-corpo)';

  const copyButton = SafeDOM.el('button', {
    text: 'Copiar link',
    attrs: { type: 'button' },
    listeners: {
      click: async () => {
        try {
          await navigator.clipboard.writeText(url);
          if (typeof showToast === 'function') showToast('Link copiado!', 'sucesso');
        } catch (erro) {
          if (typeof showToast === 'function') showToast('Não foi possível copiar o link.', 'erro');
        }
        closeMenu();
      }
    }
  });
  copyButton.style.padding = '0.75rem';
  copyButton.style.borderRadius = '50px';
  copyButton.style.border = '2px solid var(--cor-cinza-claro)';
  copyButton.style.background = '#fff';
  copyButton.style.color = 'var(--cor-texto)';
  copyButton.style.fontWeight = '700';
  copyButton.style.cursor = 'pointer';
  copyButton.style.fontSize = '0.9rem';
  copyButton.style.fontFamily = 'var(--fonte-corpo)';

  const cancelButton = SafeDOM.el('button', {
    text: 'Cancelar',
    attrs: { type: 'button' },
    listeners: { click: closeMenu }
  });
  cancelButton.style.padding = '0.5rem';
  cancelButton.style.border = 'none';
  cancelButton.style.background = 'none';
  cancelButton.style.color = 'var(--cor-cinza-medio)';
  cancelButton.style.cursor = 'pointer';
  cancelButton.style.fontSize = '0.85rem';
  cancelButton.style.fontFamily = 'var(--fonte-corpo)';

  actions.appendChild(whatsappButton);
  actions.appendChild(copyButton);
  actions.appendChild(cancelButton);
  box.appendChild(actions);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}
