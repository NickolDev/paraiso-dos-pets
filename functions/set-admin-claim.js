'use strict';

// Script one-time: define admin:true para o usuário admin
// Uso: node set-admin-claim.js SEU_EMAIL@AQUI.COM

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const email = process.argv[2];

if (!email) {
  console.error('Uso: node set-admin-claim.js SEU_EMAIL@AQUI.COM');
  process.exit(1);
}

admin.auth().getUserByEmail(email)
  .then(user => {
    return admin.auth().setCustomUserClaims(user.uid, { admin: true })
      .then(() => {
        console.log(`✅ admin:true definido para ${email} (uid: ${user.uid})`);
        console.log('Faça logout e login novamente no painel para ativar.');
        process.exit(0);
      });
  })
  .catch(err => {
    console.error('Erro:', err.message);
    process.exit(1);
  });
