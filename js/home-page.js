'use strict';

const HOME_IMAGE_FALLBACK = 'images/logo-300.png';

function createHomeAnimalCard(animal) {
  const card = SafeDOM.el('div', { className: 'card-animal' });
  const statusClasse = {
    'Disponível': 'badge--disponivel',
    'Reservado': 'badge--reservado',
    'Em Tratamento': 'badge--tratamento'
  };

  const fotoWrapper = SafeDOM.el('div', { className: 'card-animal__foto-wrapper' });
  const foto = SafeDOM.el('img', {
    className: 'card-animal__foto',
    attrs: { alt: animal.nome || 'Animal em destaque', loading: 'lazy' }
  });
  SafeDOM.setImageSource(foto, animal.foto, { fallback: HOME_IMAGE_FALLBACK, allowRelative: true });
  fotoWrapper.appendChild(foto);
  fotoWrapper.appendChild(SafeDOM.el('div', { className: 'card-animal__badges' }, [
    SafeDOM.el('span', {
      className: `badge ${statusClasse[animal.status] || 'badge--disponivel'}`,
      text: animal.status || 'Disponível'
    }),
    animal.novo ? SafeDOM.el('span', { className: 'badge badge--novo', text: 'Novo' }) : null
  ]));
  card.appendChild(fotoWrapper);

  const info = SafeDOM.el('div', { className: 'card-animal__info' });
  info.appendChild(SafeDOM.el('h3', { className: 'card-animal__nome', text: animal.nome || 'Sem nome' }));
  const detalhes = SafeDOM.el('div', { className: 'card-animal__detalhes' });
  [animal.idade, '•', animal.porte, '•', animal.sexo].forEach((item) => {
    if (!item) return;
    detalhes.appendChild(SafeDOM.el('span', { className: 'card-animal__detalhe', text: item }));
  });
  info.appendChild(detalhes);

  const icones = SafeDOM.el('div', { className: 'card-animal__icones' });
  if (animal.vacinado) icones.appendChild(createAnimalFeature('Vacinado'));
  if (animal.castrado) icones.appendChild(createAnimalFeature('Castrado'));
  info.appendChild(icones);
  info.appendChild(SafeDOM.el('p', { className: 'card-animal__descricao', text: animal.descricao || '' }));
  info.appendChild(SafeDOM.el('a', {
    className: 'btn btn--primario btn--sm card-animal__btn',
    text: 'Quero adotar',
    attrs: { href: `pages/ficha-adocao.html?animal=${encodeURIComponent(String(animal.id))}` }
  }));
  card.appendChild(info);
  return card;
}

function createHomePostCard(post) {
  const card = SafeDOM.el('div', { className: 'card-post' });
  const imageWrapper = SafeDOM.el('div', { className: 'card-post__imagem-wrapper' }, [
    createBlogImage(post.imagem, post.titulo, 'card-post__imagem', HOME_IMAGE_FALLBACK)
  ]);
  card.appendChild(imageWrapper);

  const body = SafeDOM.el('div', { className: 'card-post__corpo' }, [
    SafeDOM.el('div', { className: 'card-post__meta' }, [
      SafeDOM.el('span', { className: 'badge badge--categoria', text: post.categoria || 'Sem categoria' }),
      SafeDOM.el('span', { text: post.data || '' }),
      SafeDOM.el('span', { text: '•' }),
      SafeDOM.el('span', { text: post.tempoLeitura || '' })
    ])
  ]);
  const href = `pages/post.html?id=${encodeURIComponent(String(post.id))}`;
  body.appendChild(SafeDOM.el('a', { attrs: { href } }, [
    SafeDOM.el('h3', { className: 'card-post__titulo', text: post.titulo || 'Sem título' })
  ]));
  body.appendChild(SafeDOM.el('p', { className: 'card-post__resumo', text: post.resumo || '' }));
  body.appendChild(SafeDOM.el('div', { className: 'card-post__footer' }, [
    SafeDOM.el('a', { className: 'btn btn--primario btn--sm', text: 'Ler Mais', attrs: { href } })
  ]));
  card.appendChild(body);
  return card;
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof ANIMAIS !== 'undefined') {
    const gridDestaque = document.getElementById('grid-animais-destaque');
    if (gridDestaque) {
      SafeDOM.clear(gridDestaque);
      const destaques = ANIMAIS.filter((animal) => animal.status === 'Disponível').slice(0, 3);
      if (destaques.length > 0) {
        destaques.forEach((animal) => gridDestaque.appendChild(createHomeAnimalCard(animal)));
      } else {
        const empty = SafeDOM.el('p', { text: 'Em breve nossos pets disponíveis para adoção aparecerão aqui.' });
        empty.style.textAlign = 'center';
        empty.style.color = 'var(--cor-cinza-medio)';
        empty.style.gridColumn = '1 / -1';
        empty.style.padding = '2rem';
        gridDestaque.appendChild(empty);
      }
    }
  }

  if (typeof POSTS !== 'undefined') {
    const gridPosts = document.getElementById('grid-posts-home');
    if (gridPosts) {
      SafeDOM.clear(gridPosts);
      const recentes = POSTS.slice(0, 3);
      if (recentes.length > 0) {
        recentes.forEach((post) => gridPosts.appendChild(createHomePostCard(post)));
      } else {
        const empty = SafeDOM.el('p', { text: 'Conteúdo do blog em breve.' });
        empty.style.textAlign = 'center';
        empty.style.color = 'var(--cor-cinza-medio)';
        empty.style.gridColumn = '1 / -1';
        empty.style.padding = '2rem';
        gridPosts.appendChild(empty);
      }
    }
  }
});

function criarCardAnimalHome(animal) {
  return createHomeAnimalCard(animal);
}

function criarCardPostHome(post) {
  return createHomePostCard(post);
}
