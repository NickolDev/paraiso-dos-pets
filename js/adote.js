'use strict';

const ANIMAIS = [
  {
    id: 'macho-01',
    nome: 'Thor',
    idade: '2 anos',
    porte: 'Grande',
    sexo: 'Macho',
    status: 'Disponível',
    foto: 'images/assets/cão_macho.png',
    vacinado: true,
    castrado: true,
    novo: true,
    descricao: 'Carinhoso, brincalhão e cheio de energia para acompanhar uma nova família.',
    historico: 'Foi resgatado em uma praça e hoje está pronto para ganhar um lar.'
  },
  {
    id: 'macho-02',
    nome: 'Chico',
    idade: '1 ano',
    porte: 'Médio',
    sexo: 'Macho',
    status: 'Disponível',
    foto: 'images/assets/cão_macho2.png',
    vacinado: true,
    castrado: true,
    novo: false,
    descricao: 'Dócil, esperto e adora receber carinho na barriga.',
    historico: 'Chegou ao abrigo ainda filhote e se adaptou muito bem com outros cães.'
  },
  {
    id: 'macho-03',
    nome: 'Bob',
    idade: '3 anos',
    porte: 'Médio',
    sexo: 'Macho',
    status: 'Disponível',
    foto: 'images/assets/cão_macho3.png',
    vacinado: true,
    castrado: true,
    novo: false,
    descricao: 'Companheiro tranquilo, ideal para quem busca um amigo fiel.',
    historico: 'Foi acolhido após ser encontrado perto de uma avenida movimentada.'
  },
  {
    id: 'macho-04',
    nome: 'Tobias',
    idade: '4 anos',
    porte: 'Grande',
    sexo: 'Macho',
    status: 'Disponível',
    foto: 'images/assets/cão_macho4.png',
    vacinado: true,
    castrado: true,
    novo: false,
    descricao: 'Protetor, calmo e muito obediente depois que cria confiança.',
    historico: 'Resgatado em situação de abandono, recebeu cuidados e se recuperou bem.'
  },
  {
    id: 'macho-05',
    nome: 'Paçoca',
    idade: '8 meses',
    porte: 'Pequeno',
    sexo: 'Macho',
    status: 'Disponível',
    foto: 'images/assets/cão_macho5.png',
    vacinado: true,
    castrado: false,
    novo: true,
    descricao: 'Filhote curioso, alegre e pronto para aprender com muito amor.',
    historico: 'Foi deixado próximo ao abrigo e está crescendo saudável.'
  },
  {
    id: 'macho-06',
    nome: 'Bento',
    idade: '5 anos',
    porte: 'Médio',
    sexo: 'Macho',
    status: 'Disponível',
    foto: 'images/assets/cão_macho6.png',
    vacinado: true,
    castrado: true,
    novo: false,
    descricao: 'Muito carinhoso, gosta de passeios leves e de ficar por perto.',
    historico: 'Chegou debilitado, recebeu tratamento e hoje está recuperado.'
  },
  {
    id: 'macho-07',
    nome: 'Nino',
    idade: '2 anos',
    porte: 'Pequeno',
    sexo: 'Macho',
    status: 'Disponível',
    foto: 'images/assets/cão_macho7.png',
    vacinado: true,
    castrado: true,
    novo: false,
    descricao: 'Pequeno no tamanho, enorme na vontade de brincar e fazer amizade.',
    historico: 'Foi resgatado durante uma campanha de atendimento no bairro.'
  },
  {
    id: 'macho-08',
    nome: 'Fred',
    idade: '6 anos',
    porte: 'Grande',
    sexo: 'Macho',
    status: 'Disponível',
    foto: 'images/assets/cão_macho8.png',
    vacinado: true,
    castrado: true,
    novo: false,
    descricao: 'Um grandão amoroso, tranquilo e muito grato por atenção.',
    historico: 'Vivia nas ruas há algum tempo antes de ser acolhido pela ONG.'
  },
  {
    id: 'macho-09',
    nome: 'Zeca',
    idade: '1 ano',
    porte: 'Médio',
    sexo: 'Macho',
    status: 'Disponível',
    foto: 'images/assets/cão_macho9.png',
    vacinado: true,
    castrado: false,
    novo: true,
    descricao: 'Ativo, simpático e ótimo para uma família que goste de brincar.',
    historico: 'Foi encontrado em uma feira de adoção e ficou sob cuidados da equipe.'
  },
  {
    id: 'macho-10',
    nome: 'Apolo',
    idade: '3 anos',
    porte: 'Grande',
    sexo: 'Macho',
    status: 'Disponível',
    foto: 'images/assets/cão_macho10.png',
    vacinado: true,
    castrado: true,
    novo: false,
    descricao: 'Forte, elegante e muito dócil com pessoas.',
    historico: 'Após o resgate, passou por avaliação veterinária e está saudável.'
  },
  {
    id: 'femea-01',
    nome: 'Mel',
    idade: '2 anos',
    porte: 'Médio',
    sexo: 'Fêmea',
    status: 'Disponível',
    foto: 'images/assets/cão_femea.png',
    vacinado: true,
    castrado: true,
    novo: true,
    descricao: 'Meiga, carinhosa e sempre pronta para ganhar colo.',
    historico: 'Foi resgatada com seus filhotes e agora espera sua própria família.'
  },
  {
    id: 'femea-02',
    nome: 'Nina',
    idade: '1 ano',
    porte: 'Pequeno',
    sexo: 'Fêmea',
    status: 'Disponível',
    foto: 'images/assets/cão_femea2.png',
    vacinado: true,
    castrado: true,
    novo: false,
    descricao: 'Delicada, alegre e muito companheira.',
    historico: 'Chegou assustada, mas ganhou confiança com carinho diário.'
  },
  {
    id: 'femea-03',
    nome: 'Luna',
    idade: '3 anos',
    porte: 'Grande',
    sexo: 'Fêmea',
    status: 'Disponível',
    foto: 'images/assets/cão_femea3.png',
    vacinado: true,
    castrado: true,
    novo: false,
    descricao: 'Tranquila, observadora e muito amorosa.',
    historico: 'Foi encontrada em um terreno e recebeu todos os cuidados necessários.'
  },
  {
    id: 'femea-04',
    nome: 'Amora',
    idade: '4 anos',
    porte: 'Médio',
    sexo: 'Fêmea',
    status: 'Disponível',
    foto: 'images/assets/cão_femea4.png',
    vacinado: true,
    castrado: true,
    novo: false,
    descricao: 'Doce, calma e perfeita para um lar cheio de afeto.',
    historico: 'Foi acolhida após uma denúncia de abandono.'
  },
  {
    id: 'femea-05',
    nome: 'Belinha',
    idade: '7 meses',
    porte: 'Pequeno',
    sexo: 'Fêmea',
    status: 'Disponível',
    foto: 'images/assets/cão_femea5.png',
    vacinado: true,
    castrado: false,
    novo: true,
    descricao: 'Filhote esperta, brincalhona e cheia de charme.',
    historico: 'Chegou bem pequena e está crescendo com acompanhamento veterinário.'
  },
  {
    id: 'femea-06',
    nome: 'Pipoca',
    idade: '2 anos',
    porte: 'Médio',
    sexo: 'Fêmea',
    status: 'Disponível',
    foto: 'images/assets/cão_femea6.png',
    vacinado: true,
    castrado: true,
    novo: false,
    descricao: 'Animada, sociável e apaixonada por passeios.',
    historico: 'Foi resgatada durante uma ação voluntária em Ribeirão Preto.'
  },
  {
    id: 'femea-07',
    nome: 'Maya',
    idade: '5 anos',
    porte: 'Grande',
    sexo: 'Fêmea',
    status: 'Disponível',
    foto: 'images/assets/cão_femea7.png',
    vacinado: true,
    castrado: true,
    novo: false,
    descricao: 'Serena, leal e muito carinhosa com quem se aproxima devagar.',
    historico: 'Recebeu tratamento no abrigo e hoje está pronta para adoção.'
  },
  {
    id: 'femea-08',
    nome: 'Sofia',
    idade: '1 ano',
    porte: 'Médio',
    sexo: 'Fêmea',
    status: 'Disponível',
    foto: 'images/assets/cão_femea8.png',
    vacinado: true,
    castrado: true,
    novo: false,
    descricao: 'Muito dócil, adora companhia e aprende comandos rapidamente.',
    historico: 'Foi acolhida por voluntários e encaminhada para adoção responsável.'
  },
  {
    id: 'femea-09',
    nome: 'Jade',
    idade: '3 anos',
    porte: 'Pequeno',
    sexo: 'Fêmea',
    status: 'Disponível',
    foto: 'images/assets/cão_femea9.png',
    vacinado: true,
    castrado: true,
    novo: false,
    descricao: 'Pequena, esperta e muito apegada depois que confia.',
    historico: 'Foi resgatada em uma área comercial e se recuperou muito bem.'
  },
  {
    id: 'femea-10',
    nome: 'Lola',
    idade: '4 anos',
    porte: 'Grande',
    sexo: 'Fêmea',
    status: 'Disponível',
    foto: 'images/assets/cão_femea10.png',
    vacinado: true,
    castrado: true,
    novo: false,
    descricao: 'Companheira, tranquila e pronta para uma segunda chance.',
    historico: 'Foi entregue ao abrigo por uma família que não podia mais cuidar dela.'
  }
];
const FAVORITOS_KEY = 'paraiso_favoritos';
const ADOTE_IMAGE_FALLBACK = '../images/logo-300.png';

function resolverFotoAnimal(animal) {
  const foto = animal?.foto || '';
  if (!foto || /^(https?:|data:|\/)/i.test(foto)) return foto;
  const emSubpastaPages = window.location.pathname.includes('/pages/');
  return emSubpastaPages && foto.startsWith('images/') ? `../${foto}` : foto;
}

function renderAnimais(lista) {
  const container = document.getElementById('grid-animais');
  if (!container) return;

  SafeDOM.clear(container);

  if (lista.length === 0) {
    const empty = SafeDOM.el('div');
    empty.style.textAlign = 'center';
    empty.style.gridColumn = '1 / -1';
    empty.style.padding = '3rem 1rem';

    const text = SafeDOM.el('p', { text: 'Nenhum animal encontrado com esses filtros.' });
    text.style.color = 'var(--cor-cinza-medio)';
    text.style.padding = '2rem';
    empty.appendChild(text);

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

function createAnimalDescricao(animal) {
  const descricao = animal.descricao || '';
  const wrap = SafeDOM.el('div', { className: 'card-animal__descricao-wrap' });
  wrap.appendChild(SafeDOM.el('p', { className: 'card-animal__descricao', text: descricao }));

  if (descricao.length > 95) {
    wrap.appendChild(SafeDOM.el('button', {
      className: 'card-animal__toggle-descricao',
      text: 'Ver mais',
      attrs: { type: 'button', 'aria-expanded': 'false' },
      listeners: {
        click: (event) => {
          event.stopPropagation();
          const expanded = wrap.classList.toggle('expandido');
          event.currentTarget.textContent = expanded ? 'Ver menos' : 'Ver mais';
          event.currentTarget.setAttribute('aria-expanded', String(expanded));
        }
      }
    }));
  }

  return wrap;
}

function createAnimalActions(animal, options = {}) {
  const hrefPrefix = options.hrefPrefix || '';
  const actions = SafeDOM.el('div', { className: 'card-animal__acoes' });

  actions.appendChild(SafeDOM.el('a', {
    className: 'btn btn--primario btn--sm card-animal__btn',
    text: 'Quero adotar',
    attrs: { href: `${hrefPrefix}ficha-adocao.html?animal=${encodeURIComponent(String(animal.id))}` }
  }));

  actions.appendChild(SafeDOM.el('button', {
    className: 'btn btn--sm card-animal__btn-compartilhar',
    attrs: { type: 'button', 'aria-label': `Compartilhar ${animal.nome || 'animal'}`, title: 'Compartilhar' },
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
  ]));

  return actions;
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
  SafeDOM.setImageSource(foto, resolverFotoAnimal(animal), { fallback: ADOTE_IMAGE_FALLBACK, allowRelative: true });
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

  info.appendChild(createAnimalDescricao(animal));
  info.appendChild(createAnimalActions(animal));
  card.appendChild(info);

  return card;
}

function filtrarAnimais() {
  const sexoAtivo = document.querySelector('[data-filtro="sexo"].ativo')?.dataset.valor || 'Todos';
  const busca = (document.getElementById('busca-animal')?.value || '').toLowerCase().trim();

  const resultado = ANIMAIS.filter((animal) => {
    if (sexoAtivo !== 'Todos' && animal.sexo !== sexoAtivo) return false;
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
  SafeDOM.setImageSource(image, resolverFotoAnimal(animal), { fallback: ADOTE_IMAGE_FALLBACK, allowRelative: true });
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
    SafeDOM.setImageSource(img, resolverFotoAnimal(animal), { fallback: ADOTE_IMAGE_FALLBACK, allowRelative: true });
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
