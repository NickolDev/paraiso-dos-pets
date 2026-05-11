'use strict';

// ============================================================
// ARQUIVO: functions/index.js
// DESCRIÇÃO: Cloud Functions da ONG Paraíso dos Pets.
//
// FUNÇÃO: setAdminOnCreate
//   Disparada automaticamente sempre que um novo usuário é
//   criado no Firebase Authentication.
//
//   Se o email do novo usuário estiver no documento
//   configuracoes/admins (campo "emails"), a custom claim
//   "admin: true" é definida automaticamente via Admin SDK.
//
// FLUXO DE CONFIGURAÇÃO:
//   1. No Firebase Console → Firestore, crie o documento:
//      Coleção: configuracoes
//      Documento: admins
//      Campo: emails (array) → ["seuemail@ong.com.br"]
//   2. Faça deploy: firebase deploy --only functions
//   3. No Authentication, crie o usuário admin
//   4. Esta function dispara e define admin: true
//   5. Usuário faz login — já tem acesso total ao admin
//
// PARA ADICIONAR MAIS ADMINS DEPOIS:
//   Adicione o novo email ao array "emails" em
//   configuracoes/admins (via Firebase Console ou painel admin)
//   e crie o usuário no Authentication. A function cuidará
//   do resto automaticamente.
// ============================================================

const functions = require('firebase-functions');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp();

// ============================================================
// setAdminOnCreate — Concede custom claim ao criar usuário
// ============================================================
exports.setAdminOnCreate = functions.auth.user().onCreate(async (user) => {
  if (!user.email) {
    functions.logger.warn('setAdminOnCreate: usuário sem email, ignorando.');
    return null;
  }

  try {
    const db = getFirestore();
    const doc = await db.collection('configuracoes').doc('admins').get();

    if (!doc.exists) {
      functions.logger.info('setAdminOnCreate: documento configuracoes/admins não encontrado.');
      return null;
    }

    const emails = doc.data().emails;

    if (!Array.isArray(emails)) {
      functions.logger.warn('setAdminOnCreate: campo "emails" inválido ou ausente.');
      return null;
    }

    if (emails.includes(user.email)) {
      await getAuth().setCustomUserClaims(user.uid, { admin: true });
      functions.logger.info(`setAdminOnCreate: admin: true concedido para ${user.email}`);
    } else {
      functions.logger.info(`setAdminOnCreate: ${user.email} não está na lista de admins.`);
    }

    return null;
  } catch (err) {
    functions.logger.error('setAdminOnCreate: erro:', err);
    return null;
  }
});
