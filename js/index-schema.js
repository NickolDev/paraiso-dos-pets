'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const existing = document.getElementById('schema-org-ngo');
  if (existing) return;

  const schema = document.createElement('script');
  schema.id = 'schema-org-ngo';
  schema.type = 'application/ld+json';
  schema.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: 'ONG Paraíso dos Pets',
    description: 'ONG de proteção animal em Ribeirão Preto, SP. Resgate, cuidado e adoção de cães abandonados.',
    foundingDate: '2017',
    founder: { '@type': 'Person', name: 'Luiz Moraes' },
    email: 'contato@ongparaisodospets.org.br',
    url: 'https://ongparaisodospets.org.br',
    sameAs: [
      'https://www.instagram.com/ongparaisodospets',
      'https://www.youtube.com/@ONGParaísodosPets',
      'https://www.threads.com/@ongparaisodospets'
    ],
    areaServed: {
      '@type': 'City',
      name: 'Ribeirão Preto',
      containedInPlace: { '@type': 'State', name: 'São Paulo' }
    }
  });

  document.head.appendChild(schema);
});
