'use strict';

(function initFirebaseAdminLayer(global) {
  if (typeof firebase === 'undefined') return;

  const adminServices = {
    authService: typeof firebase.auth === 'function' ? firebase.auth() : null,
    storageService: typeof firebase.storage === 'function' ? firebase.storage() : null
  };

  if (typeof global.registerAdminFirebaseServices === 'function') {
    global.registerAdminFirebaseServices(adminServices);
  }

  const { authService, storageService } = adminServices;

  async function uploadImagem(arquivo, pasta = 'animais') {
    if (typeof verificarAdmin === 'function' && !verificarAdmin()) return null;
    if (!storageService) return null;
    try {
      const nomeSeguro = arquivo.name.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 100);
      const nomeUnico = `${pasta}/${Date.now()}_${nomeSeguro}`;
      const ref = storageService.ref(nomeUnico);
      const snapshot = await ref.put(arquivo);
      return await snapshot.ref.getDownloadURL();
    } catch (erro) {
      console.error('Erro ao fazer upload:', erro);
      return null;
    }
  }

  async function removerImagem(url) {
    if (typeof verificarAdmin === 'function' && !verificarAdmin()) return false;
    if (!storageService) return false;
    try {
      const ref = storageService.refFromURL(url);
      await ref.delete();
      return true;
    } catch (erro) {
      console.error('Erro ao remover imagem:', erro);
      return false;
    }
  }

  async function fazerLogin(email, senha) {
    if (!authService) {
      throw new Error('Autenticação Firebase não está disponível nesta página.');
    }
    try {
      const resultado = await authService.signInWithEmailAndPassword(email, senha);
      await resultado.user.getIdToken(true);
      return resultado.user;
    } catch (erro) {
      console.error('Erro ao fazer login:', erro);
      const mensagens = {
        'auth/user-not-found': 'E-mail não encontrado. Verifique e tente novamente.',
        'auth/wrong-password': 'Senha incorreta. Verifique e tente novamente.',
        'auth/invalid-email': 'E-mail inválido. Verifique o formato.',
        'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
        'auth/invalid-credential': 'E-mail ou senha incorretos. Verifique e tente novamente.'
      };
      throw new Error(mensagens[erro.code] || 'Erro ao fazer login. Tente novamente.');
    }
  }

  async function fazerLogout() {
    if (!authService) return;
    try {
      await authService.signOut();
    } catch (erro) {
      console.error('Erro ao fazer logout:', erro);
    }
  }

  async function recuperarSenha(email) {
    if (!authService) {
      throw new Error('Autenticação Firebase não está disponível nesta página.');
    }
    try {
      await authService.sendPasswordResetEmail(email);
      return true;
    } catch (erro) {
      console.error('Erro ao enviar email de recuperação:', erro);
      throw new Error('Não foi possível enviar o email. Verifique o endereço.');
    }
  }

  function observarAuth(callback) {
    if (!authService) {
      callback(null);
      return;
    }
    authService.onAuthStateChanged(callback);
  }

  function usuarioAtual() {
    return authService ? authService.currentUser : null;
  }

  global.uploadImagem = uploadImagem;
  global.removerImagem = removerImagem;
  global.fazerLogin = fazerLogin;
  global.fazerLogout = fazerLogout;
  global.recuperarSenha = recuperarSenha;
  global.observarAuth = observarAuth;
  global.usuarioAtual = usuarioAtual;
})(window);
