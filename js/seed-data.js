// ============================================================
// ARQUIVO: seed-data.js
// DESCRIÇÃO: Script de configuração inicial do banco de dados.
//            Roda UMA VEZ para criar as configurações básicas
//            no Firebase Firestore.
//
// COMO USAR:
//   1. Configure o Firebase (siga o FIREBASE-SETUP.txt)
//   2. Faça login no admin (admin.html)
//   3. Abra o Console do navegador (F12 → Console)
//   4. Execute: popularBancoDeDados()
//   5. Aguarde a mensagem de sucesso
//   6. NÃO execute novamente (vai duplicar os dados)
//
// NOTA: Este script NÃO cadastra animais nem posts fictícios.
//       Use o painel admin para cadastrar dados reais.
//
// DEPENDÊNCIAS: firebase-config.js
// ÚLTIMA ATUALIZAÇÃO: 2025
// ============================================================

'use strict';

/**
 * Configura o banco de dados Firebase com dados iniciais.
 * Cria: configurações da ONG e estrutura de transparência.
 * Animais, posts, fichas, voluntários e mensagens devem
 * ser cadastrados pelo painel admin com dados reais.
 * @returns {Promise<void>}
 */
async function popularBancoDeDados() {

  if (!auth.currentUser) {
    console.error('❌ Faça login no admin.html primeiro.');
    return;
  }

  console.log('🐾 Configurando banco de dados...');
  console.log('');

  // ============================================================
  // 1. CONFIGURAÇÕES GERAIS DA ONG
  // ============================================================

  console.log('📦 Salvando configurações da ONG...');

  await db.collection(COLECOES.CONFIGURACOES).doc('geral').set({
    nomeOng: 'ONG Paraíso dos Pets',
    fundador: 'Luiz Moraes',
    cidade: 'Ribeirão Preto',
    estado: 'SP',
    email: 'contato@ongparaisodospets.org.br',
    whatsapp: '5516999999999',
    instagram: '@ongparaisodospets',
    youtube: '@ONGParaísodosPets',
    threads: '@ongparaisodospets',
    cnpj: 'XX.XXX.XXX/0001-XX',
    chavePix: 'contato@ongparaisodospets.org.br',
    valorApadrinhar: 200,
    valorAssociar: 50,
    mercadoPagoLink: '',
    horarioSemana: 'Segunda a Sexta: 9h – 18h',
    horarioSabado: 'Sábado: 9h – 13h',
    metaMensal: 0,
    arrecadadoMensal: 0,
    mesMeta: '',
    criadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });

  console.log('  ✅ Configurações salvas');

  // ============================================================
  // 2. ESTRUTURA DE TRANSPARÊNCIA (vazia, para ser preenchida)
  // ============================================================

  console.log('📦 Criando estrutura de transparência...');

  await db.collection(COLECOES.TRANSPARENCIA).doc('2025-1').set({
    label: '1º Semestre 2025',
    resumo: { recebido: 0, gasto: 0, saldo: 0 },
    gastos: [],
    receitas: [
      { fonte: 'Doações Avulsas', percentual: 0, cor: '#00B4B4' },
      { fonte: 'Associados Mensais', percentual: 0, cor: '#3FBADD' },
      { fonte: 'Apadrinhos', percentual: 0, cor: '#0ACC95' },
      { fonte: 'Loja Solidária', percentual: 0, cor: '#0A61C2' }
    ],
    criadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });

  console.log('  ✅ Estrutura de transparência criada');

  // ============================================================
  // CONCLUSÃO
  // ============================================================

  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  🎉 Banco de dados configurado com sucesso!      ║');
  console.log('║                                                   ║');
  console.log('║  ✅ Configurações da ONG salvas                  ║');
  console.log('║  ✅ Estrutura de transparência criada             ║');
  console.log('║                                                   ║');
  console.log('║  📋 Próximos passos:                              ║');
  console.log('║     1. Vá em Animais → Novo Animal               ║');
  console.log('║     2. Cadastre os animais reais com fotos        ║');
  console.log('║     3. Vá em Blog → Novo Post                    ║');
  console.log('║     4. Escreva o primeiro artigo                  ║');
  console.log('║     5. Vá em Configurações → Meta Mensal          ║');
  console.log('║     6. Vá em Transparência → Preencha dados       ║');
  console.log('║                                                   ║');
  console.log('║  ⚠️  NÃO execute esta função novamente!          ║');
  console.log('╚══════════════════════════════════════════════════╝');
}

// ============================================================
// FIM DO ARQUIVO seed-data.js
// ============================================================
