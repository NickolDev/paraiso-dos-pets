'use strict';

let fotosGaleria = [];
const GALERIA_FALLBACK = '../images/logo-300.png';

function renderGaleriaMensagem(grid, title, text = '') {
  SafeDOM.clear(grid);
  const empty = SafeDOM.el('div');
  empty.style.textAlign = 'center';
  empty.style.gridColumn = '1 / -1';
  empty.style.padding = '3rem 1rem';
  empty.appendChild(SafeDOM.el('svg', {
    attrs: { viewBox: '0 0 24 24', width: '64', height: '64', 'aria-hidden': 'true' },
    html: '<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>'
  }));
  empty.querySelector('svg').style.fill = 'var(--cor-cinza-claro)';
  empty.querySelector('svg').style.marginBottom = '1rem';
  empty.appendChild(SafeDOM.el('h3', { text: title }));
  empty.querySelector('h3').style.color = 'var(--cor-texto)';
  empty.querySelector('h3').style.marginBottom = '0.5rem';
  if (text) {
    const paragraph = SafeDOM.el('p', { text });
    paragraph.style.color = 'var(--cor-cinza-medio)';
    empty.appendChild(paragraph);
  }
  grid.appendChild(empty);
}

function renderGaleria(fotos) {
  const grid = document.getElementById('galeria-grid');
  if (!grid) return;

  SafeDOM.clear(grid);

  if (fotos.length === 0) {
    const empty = SafeDOM.el('p', { text: 'Nenhuma foto nesta categoria.' });
    empty.style.textAlign = 'center';
    empty.style.color = 'var(--cor-cinza-medio)';
    empty.style.gridColumn = '1 / -1';
    empty.style.padding = '2rem';
    grid.appendChild(empty);
    return;
  }

  fotos.forEach((foto) => {
    const item = SafeDOM.el('button', {
      className: 'galeria-item',
      attrs: { type: 'button' },
      dataset: {
        categoria: foto.categoria || 'abrigo'
      },
      listeners: {
        click: () => abrirLightboxGaleria(foto.url, foto.legenda || '')
      }
    });
    item.style.background = 'none';
    item.style.border = 'none';
    item.style.padding = '0';
    item.style.cursor = 'pointer';
    item.style.textAlign = 'inherit';
    const image = SafeDOM.el('img', {
      attrs: { alt: foto.legenda || 'Foto do abrigo', loading: 'lazy' }
    });
    SafeDOM.setImageSource(image, foto.url, { fallback: GALERIA_FALLBACK, allowRelative: true });
    item.appendChild(image);
    if (foto.legenda) {
      item.appendChild(SafeDOM.el('div', { className: 'galeria-item__legenda', text: foto.legenda }));
    }
    grid.appendChild(item);
  });
}

function filtrarGaleria(categoria) {
  document.querySelectorAll('.galeria-filtro-btn').forEach((button) => {
    button.classList.toggle('ativo', button.dataset.categoria === categoria);
  });

  if (categoria === 'todos') {
    renderGaleria(fotosGaleria);
    return;
  }

  renderGaleria(fotosGaleria.filter((foto) => (foto.categoria || 'abrigo') === categoria));
}

function abrirLightboxGaleria(url, legenda) {
  const lb = document.getElementById('galeria-lightbox');
  const img = document.getElementById('galeria-lightbox-img');
  const leg = document.getElementById('galeria-lightbox-legenda');
  if (!lb || !img) return;

  SafeDOM.setImageSource(img, url, { fallback: GALERIA_FALLBACK, allowRelative: true });
  if (leg) leg.textContent = legenda || '';
  lb.classList.add('ativo');
  document.body.style.overflow = 'hidden';
}

function fecharLightboxGaleria() {
  const lb = document.getElementById('galeria-lightbox');
  if (lb) lb.classList.remove('ativo');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('galeria-grid');
  if (!grid) return;

  document.querySelectorAll('.galeria-filtro-btn').forEach((button) => {
    button.addEventListener('click', () => filtrarGaleria(button.dataset.categoria || 'todos'));
  });

  document.getElementById('galeria-lightbox')?.addEventListener('click', (event) => {
    if (event.target.id === 'galeria-lightbox') fecharLightboxGaleria();
  });
  document.querySelector('.galeria-lightbox__fechar')?.addEventListener('click', fecharLightboxGaleria);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') fecharLightboxGaleria();
  });

  if (typeof db === 'undefined' || typeof firebaseConfig === 'undefined' || firebaseConfig.apiKey === 'SUA_API_KEY_AQUI') {
    renderGaleriaMensagem(grid, 'Galeria em breve', 'Estamos preparando fotos do nosso abrigo, dos animais e da equipe.');
    return;
  }

  try {
    const snapshot = await db.collection('galeria').orderBy('criadoEm', 'desc').get();
    fotosGaleria = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    if (fotosGaleria.length === 0) {
      renderGaleriaMensagem(grid, 'Galeria vazia', 'As fotos serão adicionadas pela equipe da ONG em breve.');
      return;
    }
    renderGaleria(fotosGaleria);
  } catch (erro) {
    console.error('Erro galeria:', erro);
    SafeDOM.clear(grid);
    const msg = SafeDOM.el('p', { text: 'Erro ao carregar galeria.' });
    msg.style.textAlign = 'center';
    msg.style.color = 'var(--cor-cinza-medio)';
    msg.style.gridColumn = '1 / -1';
    msg.style.padding = '2rem';
    grid.appendChild(msg);
  }
});
