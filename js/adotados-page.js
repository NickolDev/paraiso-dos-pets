'use strict';

const ADOTADOS_FALLBACK = '../images/logo-300.png';

function renderAdotadosMensagem(grid, title, text = '', actionHref = '', actionText = '') {
  SafeDOM.clear(grid);
  const empty = SafeDOM.el('div');
  empty.style.textAlign = 'center';
  empty.style.gridColumn = '1 / -1';
  empty.style.padding = '3rem 1rem';
  empty.appendChild(SafeDOM.el('svg', {
    attrs: { viewBox: '0 0 24 24', width: '64', height: '64', 'aria-hidden': 'true' },
    html: '<path d="M16.5 3C14.76 3 13.09 3.81 12 5.09 10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3z"/>'
  }));
  empty.querySelector('svg').style.fill = 'var(--cor-cinza-claro)';
  empty.querySelector('svg').style.marginBottom = '1rem';
  empty.appendChild(SafeDOM.el('h3', { text: title }));
  empty.querySelector('h3').style.color = 'var(--cor-texto)';
  empty.querySelector('h3').style.marginBottom = '0.5rem';
  if (text) {
    const msg = SafeDOM.el('p', { text });
    msg.style.color = 'var(--cor-cinza-medio)';
    empty.appendChild(msg);
  }
  if (actionHref && actionText) {
    const link = SafeDOM.el('a', {
      className: 'btn btn--primario',
      text: actionText,
      attrs: { href: actionHref }
    });
    link.style.marginTop = '1.5rem';
    empty.appendChild(link);
  }
  grid.appendChild(empty);
}

function createAdotadoCard(animal) {
  const card = SafeDOM.el('div', { className: 'card-animal' });
  card.style.position = 'relative';

  const badge = SafeDOM.el('div', { className: 'card-animal__badge', text: '❤ Adotado' });
  badge.style.background = 'var(--cor-info)';
  badge.style.color = '#fff';
  badge.style.position = 'absolute';
  badge.style.top = '0.75rem';
  badge.style.left = '0.75rem';
  badge.style.zIndex = '2';
  badge.style.padding = '0.2rem 0.8rem';
  badge.style.borderRadius = '50px';
  badge.style.fontSize = '0.75rem';
  badge.style.fontWeight = '700';
  card.appendChild(badge);

  const fotoWrapper = SafeDOM.el('div', { className: 'card-animal__foto-wrapper' });
  const foto = SafeDOM.el('img', { className: 'card-animal__foto', attrs: { alt: animal.nome || 'Animal adotado', loading: 'lazy' } });
  SafeDOM.setImageSource(foto, animal.foto, { fallback: ADOTADOS_FALLBACK, allowRelative: true });
  fotoWrapper.appendChild(foto);
  card.appendChild(fotoWrapper);

  const conteudo = SafeDOM.el('div', { className: 'card-animal__conteudo' });
  conteudo.appendChild(SafeDOM.el('h3', { className: 'card-animal__nome', text: animal.nome || 'Sem nome' }));
  const info = SafeDOM.el('div', { className: 'card-animal__info' });
  [animal.idade, animal.porte, animal.sexo].filter(Boolean).forEach((item, index, list) => {
    info.appendChild(SafeDOM.el('span', { text: item }));
    if (index < list.length - 1) info.appendChild(document.createTextNode(' · '));
  });
  conteudo.appendChild(info);

  if (animal.descricao) {
    const descricao = SafeDOM.el('p', { className: 'card-animal__descricao', text: animal.descricao });
    descricao.style.marginTop = '0.5rem';
    descricao.style.fontSize = '0.85rem';
    descricao.style.color = 'var(--cor-cinza-medio)';
    descricao.style.webkitLineClamp = '3';
    descricao.style.display = '-webkit-box';
    descricao.style.webkitBoxOrient = 'vertical';
    descricao.style.overflow = 'hidden';
    conteudo.appendChild(descricao);
  }

  if (animal.historico) {
    const historico = SafeDOM.el('p', {
      text: `🏠 ${animal.historico.length > 100 ? `${animal.historico.substring(0, 100)}...` : animal.historico}`
    });
    historico.style.marginTop = '0.5rem';
    historico.style.fontSize = '0.8rem';
    historico.style.color = 'var(--cor-primaria)';
    historico.style.fontWeight = '600';
    conteudo.appendChild(historico);
  }

  card.appendChild(conteudo);
  return card;
}

document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('grid-adotados');
  const contador = document.getElementById('contador-adotados');
  if (!grid) return;

  if (typeof db === 'undefined' || typeof firebaseConfig === 'undefined' || firebaseConfig.apiKey === 'SUA_API_KEY_AQUI') {
    renderAdotadosMensagem(grid, 'Histórias de adoção em breve', 'Estamos preparando esta galeria com os animais que já encontraram um lar.');
    if (contador) contador.textContent = '❤';
    return;
  }

  try {
    const snapshot = await db.collection('animais')
      .where('status', '==', 'Adotado')
      .orderBy('atualizadoEm', 'desc')
      .get();
    const adotados = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    if (contador) contador.textContent = adotados.length;
    if (adotados.length === 0) {
      renderAdotadosMensagem(grid, 'Nenhum animal adotado ainda', 'Quando nossos pets encontrarem um lar, suas histórias aparecerão aqui.', 'adote.html', 'Ver animais disponíveis');
      return;
    }

    SafeDOM.clear(grid);
    adotados.forEach((animal) => grid.appendChild(createAdotadoCard(animal)));
  } catch (erro) {
    console.error('Erro ao carregar adotados:', erro);
    SafeDOM.clear(grid);
    const msg = SafeDOM.el('p', { text: 'Erro ao carregar. Tente novamente mais tarde.' });
    msg.style.textAlign = 'center';
    msg.style.color = 'var(--cor-cinza-medio)';
    msg.style.gridColumn = '1 / -1';
    msg.style.padding = '2rem';
    grid.appendChild(msg);
  }
});
