// ============================================================
// ARQUIVO: app-check.js
// DESCRIÇÃO: Firebase App Check com reCAPTCHA Enterprise
//
// PROTEÇÃO: Impede que bots e scripts automatizados enviem
//           formulários diretamente para o Firestore.
//           Cada request precisa de um token válido do reCAPTCHA.
//           NÃO pode ser bypassado via Console do navegador.
//
// COMO CONFIGURAR:
//   1. Acesse https://console.firebase.google.com
//   2. Vá em App Check → Registrar app
//   3. Escolha "reCAPTCHA Enterprise" como provedor
//   4. Copie o SITE KEY gerado
//   5. Substitua 'SUA_RECAPTCHA_SITE_KEY_AQUI' abaixo
//   6. Em Firestore → App Check, clique "Enforce" para cada coleção
//
// IMPORTANTE:
//   A enforcement real do App Check para Firestore/Storage deve ser
//   ativada no Firebase Console. Este arquivo apenas obtém o token no cliente.
//
// ============================================================

'use strict';

/**
 * Inicializa o Firebase App Check.
 * Deve ser chamado APÓS firebase.initializeApp() em firebase-config.js.
 * O App Check intercepta automaticamente todas as requests ao Firestore.
 */
function initAppCheck() {
  // Verifica se o Firebase e App Check estão disponíveis
  if (typeof firebase === 'undefined' || !firebase.appCheck) {
    console.warn('App Check: Firebase ou SDK de App Check não carregado.');
    return;
  }

  const metaSiteKey = document.querySelector('meta[name="firebase-app-check-site-key"]')?.content || '';
  const RECAPTCHA_SITE_KEY =
    window.APP_CHECK_SITE_KEY ||
    (typeof firebaseConfig !== 'undefined' ? firebaseConfig.appCheckSiteKey : '') ||
    metaSiteKey ||
    'SUA_RECAPTCHA_SITE_KEY_AQUI';

  // Se a chave não foi configurada, não inicializa (mas avisa)
  if (RECAPTCHA_SITE_KEY === 'SUA_RECAPTCHA_SITE_KEY_AQUI') {
    console.warn(
      'App Check: Site key não configurada. ' +
      'Configure em js/app-check.js seguindo as instruções do arquivo.'
    );
    return;
  }

  try {
    const appCheck = firebase.appCheck();

    // Configura o provedor reCAPTCHA Enterprise
    appCheck.activate(
      new firebase.appCheck.ReCaptchaEnterpriseProvider(RECAPTCHA_SITE_KEY),
      /* isTokenAutoRefreshEnabled= */ true
    );

    console.log('✅ App Check ativado com reCAPTCHA Enterprise');
  } catch (erro) {
    console.error('App Check: Erro ao inicializar:', erro);
  }
}

// Auto-inicializa quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAppCheck);
} else {
  initAppCheck();
}
