'use strict';

let fotosGaleria = [];
const GALERIA_FALLBACK = '../images/logo-300.png';
const GALERIA_LOCAL = [
  {
    id: 'foto1',
    url: '../images/assets/foto1.jpg',
    legenda: 'Momentos de cuidado no Paraiso dos Pets',
    categoria: 'abrigo'
  },
  {
    id: 'foto2',
    url: '../images/assets/foto2.jpg',
    legenda: 'Animais recebendo carinho da equipe',
    categoria: 'animais'
  },
  {
    id: 'foto3',
    url: '../images/assets/foto3.jpg',
    legenda: 'Voluntarios ajudando na rotina da ONG',
    categoria: 'voluntarios'
  }
];

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

  fotosGaleria = GALERIA_LOCAL;
  renderGaleria(fotosGaleria);
});
