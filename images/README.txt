============================================================
PASTA: /images/
DESCRIÇÃO: Imagens do site ONG Paraíso dos Pets
============================================================

INSTRUÇÕES PARA SUBSTITUIR PLACEHOLDERS:

Durante o desenvolvimento, todas as imagens de animais utilizam
o serviço placedog.net como placeholder. Para colocar o site
em produção, substitua as URLs de placeholder por fotos reais.

FORMATO ATUAL DOS PLACEHOLDERS:
  https://placedog.net/LARGURA/ALTURA?r=NUMERO

  Exemplo: https://placedog.net/600/400?r=1
  (Altere o número após ?r= para variar a foto)

COMO SUBSTITUIR:
1. Tire fotos de alta qualidade dos animais do abrigo
2. Redimensione para os tamanhos recomendados:
   - Hero: 1920x900px
   - Cards de animais: 400x300px
   - Posts do blog: 800x450px
   - Equipe: 300x300px (quadrado)
   - Carrossel: 200x200px (quadrado)
3. Salve os arquivos nesta pasta (/images/)
4. Atualize as referências no HTML e JavaScript

TAMANHOS RECOMENDADOS:
  - hero-home.jpg         → 1920 x 900px  (banner da home)
  - hero-adote.jpg        → 1920 x 600px  (banner da pág. adote)
  - hero-missao.jpg       → 1920 x 600px  (banner da pág. missão)
  - hero-doar.jpg         → 1920 x 600px  (banner da pág. doar)
  - animal-NOME.jpg       → 400 x 300px   (card do animal)
  - blog-post-ID.jpg      → 800 x 450px   (imagem de destaque)
  - equipe-NOME.jpg       → 300 x 300px   (foto de membro)
  - carrossel-N.jpg       → 200 x 200px   (foto de adotante)

DICAS DE OTIMIZAÇÃO:
  - Use formato WebP para melhor compressão (com fallback JPG)
  - Comprima as imagens antes de subir (TinyPNG, Squoosh)
  - Mantenha cada imagem abaixo de 200KB se possível
  - Use nomes descritivos sem acentos ou espaços

============================================================
