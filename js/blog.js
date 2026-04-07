// ============================================================
// ARQUIVO: blog.js
// DESCRIÇÃO: Controla os posts do blog — renderização de cards,
//            filtros por categoria, busca, paginação e post
//            individual. Os dados de posts também são usados na
//            Home para renderizar os 3 mais recentes.
// DEPENDÊNCIAS: main.js (toast notifications)
// ÚLTIMA ATUALIZAÇÃO: 2025
//
// ÍNDICE DE FUNÇÕES:
//   - renderPosts(lista)          → Renderiza cards de posts
//   - filtrarPorCategoria(cat)    → Filtra posts por categoria
//   - buscarPosts(termo)          → Busca em tempo real
//   - renderPaginacao(total)      → Cria botões de paginação
//   - carregarPost()              → Lê ?id= da URL e renderiza
//   - initProgressBar()           → Barra de progresso de leitura
//   - renderRelacionados(id)      → Posts da mesma categoria
//   - compartilhar(tipo)          → WhatsApp ou copiar link
//   - initBlog()                  → Inicializa a página de blog
// ============================================================

'use strict';

// ============================================================
// DADOS DOS POSTS — Array com 10 objetos
// Cada objeto representa um artigo do blog.
// Para adicionar ou editar posts, altere este array.
//
// Estrutura de cada objeto:
//   id            → Identificador único (número)
//   titulo        → Título do post (string)
//   resumo        → Resumo curto para o card (string, ~150 chars)
//   conteudo      → Conteúdo completo em HTML (string)
//   categoria     → Categoria do post (string)
//   data          → Data de publicação (string, formato DD/MM/AAAA)
//   tempoLeitura  → Tempo estimado de leitura (string)
//   imagem        → URL da imagem de destaque
// ============================================================

const POSTS = [
  {
    id: 1,
    titulo: "O que seu pet está tentando te dizer? Aprenda a entender a linguagem dos animais",
    resumo: "Cachorros se comunicam o tempo todo — com o corpo, com os olhos, com o rabo. Aprenda a interpretar os sinais que seu pet envia todos os dias.",
    conteudo: `
      <h2>A comunicação silenciosa dos cães</h2>
      <p>Você já reparou que seu cachorro vira a cabeça para o lado quando você fala com ele? Ou que abaixa as orelhas quando tem medo? Cães se comunicam constantemente através da linguagem corporal, e aprender a interpretar esses sinais pode transformar a relação entre vocês.</p>

      <h3>O rabo conta muitas histórias</h3>
      <p>Um rabo abanando nem sempre significa felicidade. Quando o movimento é amplo e relaxado, sim, é alegria. Mas quando o rabo está alto e rígido, pode significar alerta ou dominância. Rabo entre as pernas? Medo ou submissão.</p>

      <h3>As orelhas são antenas emocionais</h3>
      <p>Orelhas eretas e voltadas para frente indicam atenção ou curiosidade. Orelhas para trás geralmente significam medo, ansiedade ou submissão. E quando estão relaxadas? Seu cão está tranquilo e confortável.</p>

      <h3>O olhar que fala</h3>
      <p>Um contato visual suave e prolongado entre cão e tutor libera oxitocina — o hormônio do amor — em ambos. Mas cuidado: um olhar fixo e intenso entre cães desconhecidos pode ser sinal de desafio.</p>

      <h3>Comportamentos que pedem atenção</h3>
      <p>Lamber excessivamente, bocejar fora de hora, e se sacudir sem estar molhado são sinais de estresse. Se seu cão apresenta esses comportamentos com frequência, pode ser hora de revisar a rotina dele ou consultar um veterinário comportamentalista.</p>

      <blockquote>Observar e entender seu pet não é apenas curiosidade — é um ato de amor e responsabilidade.</blockquote>

      <p>Na ONG Paraíso dos Pets, nossos voluntários aprendem a ler a linguagem dos cães para oferecer o melhor cuidado possível. Se você quer se aprofundar nesse tema, acompanhe nosso blog e nossas redes sociais!</p>
    `,
    categoria: "Cuidados",
    data: "24/06/2025",
    tempoLeitura: "5 min de leitura",
    imagem: "https://placedog.net/800/450?r=30"
  },
  {
    id: 2,
    titulo: "Não pode adotar? Veja 6 formas de ajudar um animal mesmo assim",
    resumo: "Adotar é maravilhoso, mas não é a única maneira de transformar a vida de um animal. Descubra 6 formas práticas de ajudar sem levar um pet para casa.",
    conteudo: `
      <h2>Ajudar vai muito além da adoção</h2>
      <p>Sabemos que nem todo mundo pode adotar um animal neste momento. Espaço, tempo, condições financeiras — são muitos fatores. Mas a boa notícia é que existem diversas formas de fazer a diferença na vida de um cão abandonado, mesmo sem levá-lo para casa.</p>

      <h3>1. Apadrinhe um pet</h3>
      <p>Com R$ 200 por mês, você cobre alimentação, vacinas e cuidados veterinários de um cão no abrigo. É como ter um afilhado de quatro patas — você recebe fotos e atualizações mensais.</p>

      <h3>2. Torne-se associado</h3>
      <p>Com R$ 50 por mês, você garante que o abrigo tenha recursos contínuos para manter seus mais de 130 cães alimentados e saudáveis.</p>

      <h3>3. Seja voluntário</h3>
      <p>Doe seu tempo! Ajude nos banhos, nos passeios, nas feirinhas de adoção ou nas campanhas de redes sociais. Toda ajuda conta.</p>

      <h3>4. Doe ração e suprimentos</h3>
      <p>Ração, remédios, cobertores, brinquedos — tudo é bem-vindo. Entre em contato pelo WhatsApp para combinar a entrega.</p>

      <h3>5. Compartilhe nas redes</h3>
      <p>Compartilhar uma foto, um post ou uma história de adoção pode alcançar a pessoa certa no momento certo. Isso não custa nada e pode mudar uma vida.</p>

      <h3>6. Compre na Loja Solidária</h3>
      <p>Toda a renda da Loja Solidária é revertida para o abrigo. Você leva um produto e alimenta um cão.</p>

      <blockquote>Não é preciso poder tudo para fazer algo. Cada gesto, por menor que pareça, é enorme para quem não tem voz.</blockquote>
    `,
    categoria: "Como Ajudar",
    data: "24/06/2025",
    tempoLeitura: "4 min de leitura",
    imagem: "https://placedog.net/800/450?r=31"
  },
  {
    id: 3,
    titulo: "Mitos e Verdades sobre Cachorros Resgatados",
    resumo: "Cães resgatados são agressivos? Não se adaptam? Descubra a verdade por trás dos mitos mais comuns sobre adoção de animais resgatados.",
    conteudo: `
      <h2>Quebrando preconceitos sobre cães resgatados</h2>
      <p>Muita gente ainda tem receio de adotar um cão resgatado. Medo de comportamento agressivo, de problemas de saúde ou de dificuldade de adaptação. Vamos separar o que é mito do que é verdade.</p>

      <h3>MITO: Cães resgatados são agressivos</h3>
      <p><strong>Verdade:</strong> A grande maioria dos cães resgatados é extremamente dócil e grata. Agressividade tem mais a ver com trauma e falta de socialização do que com origem. Com paciência e amor, a maioria se recupera completamente.</p>

      <h3>MITO: Não dá para saber o temperamento</h3>
      <p><strong>Verdade:</strong> Em abrigos sérios como o Paraíso dos Pets, cada animal é observado, avaliado e descrito. Conhecemos a personalidade de cada cão e ajudamos a encontrar o match perfeito.</p>

      <h3>VERDADE: Cães resgatados são muito gratos</h3>
      <p>Isso é real. Quem adota um cão resgatado frequentemente relata que o animal demonstra uma gratidão especial, como se soubesse que ganhou uma segunda chance.</p>

      <h3>MITO: Cães de raça são melhores</h3>
      <p><strong>Verdade:</strong> Vira-latas costumam ter menos problemas genéticos e são incrivelmente inteligentes e adaptáveis. E cada cão é único, independente de raça.</p>

      <h3>VERDADE: Adaptação leva tempo</h3>
      <p>Sim, qualquer cão em um novo lar precisa de um período de adaptação (geralmente 2 a 4 semanas). Tenha paciência, crie rotina e ofereça segurança.</p>

      <blockquote>Adotar é dar uma segunda chance. E quem adota, descobre que quem foi resgatado, no fim, foi você.</blockquote>
    `,
    categoria: "Adoção",
    data: "24/06/2025",
    tempoLeitura: "5 min de leitura",
    imagem: "https://placedog.net/800/450?r=32"
  },
  {
    id: 4,
    titulo: "Vai adotar um pet? 5 coisas que precisa saber antes de levar pra casa",
    resumo: "Adotar é um compromisso sério e maravilhoso. Antes de trazer seu novo amigo para casa, veja o que você precisa preparar para a chegada dele.",
    conteudo: `
      <h2>Prepare-se para a chegada do novo membro da família</h2>
      <p>A decisão de adotar é linda, mas requer planejamento. Um cão depende de você para tudo: comida, saúde, segurança e amor. Veja 5 coisas essenciais para preparar antes da adoção.</p>

      <h3>1. Prepare o espaço</h3>
      <p>O cão precisa de um cantinho só dele: uma caminha, potes de água e comida, e brinquedos. Se você mora em apartamento, certifique-se de que o espaço é seguro (janelas teladas, objetos perigosos fora de alcance).</p>

      <h3>2. Planeje o orçamento</h3>
      <p>Alimentação de qualidade, vacinas anuais, vermífugos, consultas veterinárias, banho e tosa — tudo tem custo. Faça as contas e garanta que consegue manter o cuidado de forma contínua.</p>

      <h3>3. Alinhe com a família</h3>
      <p>Todos que moram na casa devem concordar e estar dispostos a participar dos cuidados. Quem vai passear? Quem alimenta? Quem cuida quando alguém viajar?</p>

      <h3>4. Tenha paciência nos primeiros dias</h3>
      <p>O período de adaptação pode durar de 2 a 4 semanas. Não force interações. Deixe o cão explorar no ritmo dele. Crie uma rotina previsível de alimentação e passeios.</p>

      <h3>5. Leve ao veterinário na primeira semana</h3>
      <p>Mesmo que o cão venha vacinado e vermifugado, uma consulta inicial é fundamental para verificar a saúde geral e criar um histórico veterinário.</p>

      <blockquote>Adoção responsável é aquela que se prepara com amor antes mesmo de abrir a porta de casa.</blockquote>
    `,
    categoria: "Adoção",
    data: "24/06/2025",
    tempoLeitura: "4 min de leitura",
    imagem: "https://placedog.net/800/450?r=33"
  },
  {
    id: 5,
    titulo: "Por que adotar é um ato de amor (e responsabilidade)",
    resumo: "A história de como a adoção transformou a vida de famílias e animais em Ribeirão Preto. Um relato emocionante sobre segundas chances.",
    conteudo: `
      <h2>Cada adoção é uma história de transformação</h2>
      <p>No Paraíso dos Pets, já vimos mais de 500 adoções acontecerem. Cada uma delas é única, mas todas têm algo em comum: a transformação mútua. O cão ganha um lar, e a família ganha um amor incondicional.</p>

      <h3>A história da Luna e da Maria</h3>
      <p>Maria vivia sozinha desde que os filhos saíram de casa. Sentia falta de companhia. Quando conheceu a Luna em uma feira de adoção, foi amor à primeira vista. "Ela olhou pra mim e eu soube que era ela", conta Maria. Hoje, Luna é a companheira inseparável que Maria precisava.</p>

      <h3>A família Lima e o Thor</h3>
      <p>Os Lima tinham dois filhos pequenos e queriam um cão para crescer junto com eles. Thor, um cão de porte grande, parecia improvável. Mas bastou o primeiro encontro para perceber que ele era o gigante gentil perfeito para a família.</p>

      <h3>Carlos e o Bob</h3>
      <p>Carlos nunca teve um animal de estimação. Adotar o Bob foi sua primeira experiência. "Eu não sabia o que esperar, mas o Bob me ensinou a cuidar, a ter paciência e a amar de um jeito que eu não conhecia."</p>

      <blockquote>Adotar não é apenas salvar um animal. É descobrir uma forma de amor que só quem vive entende.</blockquote>

      <p>Se você sente que está pronto para essa experiência, visite nossa página de adoção e conheça os cãezinhos que esperam por uma família.</p>
    `,
    categoria: "Histórias",
    data: "24/06/2025",
    tempoLeitura: "5 min de leitura",
    imagem: "https://placedog.net/800/450?r=34"
  },
  {
    id: 6,
    titulo: "Educar também é um ato de amor",
    resumo: "Educação e socialização são fundamentais para o bem-estar do cão e a harmonia do lar. Saiba como começar de forma positiva e respeitosa.",
    conteudo: `
      <h2>Educação positiva: o caminho do respeito</h2>
      <p>Educar um cão não é sobre dominação ou castigo. É sobre comunicação, paciência e reforço positivo. Um cão bem educado é um cão feliz — e uma família tranquila.</p>

      <h3>Os primeiros comandos</h3>
      <p>Comece com o básico: "senta", "fica", "vem". Use petiscos como recompensa e mantenha as sessões curtas (5 a 10 minutos). Repita diariamente e celebre cada pequena conquista.</p>

      <h3>Socialização é fundamental</h3>
      <p>Exponha seu cão a diferentes ambientes, pessoas e outros animais desde cedo. Isso previne medos e agressividade no futuro. Passeios em parques são ótimos para isso.</p>

      <h3>Nunca use violência</h3>
      <p>Gritos, tapas e castigos físicos não educam — traumatizam. O cão não entende punição. Ele entende consequência: comportamento bom = recompensa. Comportamento indesejado = ignorar e redirecionar.</p>

      <h3>Busque ajuda profissional quando necessário</h3>
      <p>Se o cão apresenta comportamentos difíceis (agressividade, destruição, medo extremo), procure um adestrador ou veterinário comportamentalista. Não há vergonha em pedir ajuda.</p>

      <blockquote>Educar com amor constrói confiança. Confiança constrói uma relação para a vida toda.</blockquote>
    `,
    categoria: "Educação",
    data: "23/06/2025",
    tempoLeitura: "4 min de leitura",
    imagem: "https://placedog.net/800/450?r=35"
  },
  {
    id: 7,
    titulo: "Feira de Adoção — Agosto 2025: venha conhecer nossos pets",
    resumo: "A Feira de Adoção Paraíso dos Pets acontece em agosto de 2025 em Ribeirão Preto. Venha conhecer cãezinhos que estão prontos para encontrar um lar!",
    conteudo: `
      <h2>Feira de Adoção Paraíso dos Pets — Agosto 2025</h2>
      <p>Estamos preparando uma feira de adoção especial para agosto de 2025! Será um dia inteiro dedicado a conectar cães resgatados com famílias amorosas em Ribeirão Preto.</p>

      <h3>O que vai acontecer</h3>
      <p>Teremos cãezinhos de todos os portes e idades disponíveis para adoção. Cada animal estará vacinado, vermifugado e, quando possível, castrado. Nossos voluntários estarão presentes para apresentar cada pet e tirar todas as dúvidas.</p>

      <h3>Atividades do dia</h3>
      <p>Além das adoções, teremos orientação veterinária gratuita, oficina de brinquedos para pets, espaço kids e bazar solidário. A renda do bazar será 100% revertida para o abrigo.</p>

      <h3>Como participar</h3>
      <p>A entrada é gratuita. Basta comparecer com documento de identidade e comprovante de residência. Se quiser adotar, o processo será feito no local com preenchimento da ficha e entrevista.</p>

      <h3>Local e horário</h3>
      <p>O endereço exato será divulgado em nossas redes sociais uma semana antes do evento. Acompanhe nosso Instagram @ongparaisodospets para não perder nenhuma informação!</p>

      <blockquote>Salvar uma vida pode ser tão simples quanto aparecer em um sábado de manhã.</blockquote>
    `,
    categoria: "Eventos",
    data: "15/07/2025",
    tempoLeitura: "3 min de leitura",
    imagem: "https://placedog.net/800/450?r=36"
  },
  {
    id: 8,
    titulo: "Como a Loja Solidária sustenta o Paraíso dos Pets",
    resumo: "A Loja Solidária é um dos pilares financeiros da ONG. Entenda como funciona e como você pode ajudar comprando.",
    conteudo: `
      <h2>A Loja Solidária: comprar para ajudar</h2>
      <p>A Loja Solidária é uma das formas mais importantes de arrecadação da ONG Paraíso dos Pets. Toda a renda obtida com as vendas é revertida diretamente para alimentação, medicamentos e cuidados veterinários dos mais de 130 cães do abrigo.</p>

      <h3>O que vendemos</h3>
      <p>A loja oferece produtos como camisetas temáticas, canecas, adesivos, ecobags, chaveiros e itens artesanais produzidos por voluntários. Cada produto carrega o propósito da ONG.</p>

      <h3>Como funciona</h3>
      <p>As vendas acontecem pelo site loja.ongparaisodospets.org.br e também presencialmente em feiras e eventos. A entrega é feita pelos Correios para todo o Brasil ou por retirada em Ribeirão Preto.</p>

      <h3>O impacto real</h3>
      <p>Em 2024, a Loja Solidária arrecadou mais de R$ 12.000, o que representou 10% de toda a receita da ONG. Esse valor foi fundamental para cobrir emergências veterinárias e compras de ração nos meses mais difíceis.</p>

      <h3>Como ajudar</h3>
      <p>Além de comprar, você pode ajudar divulgando a loja nas redes sociais, comprando presentes solidários para amigos e família, ou até mesmo produzindo itens artesanais como voluntário.</p>

      <blockquote>Cada compra na Loja Solidária se transforma em comida, remédio e amor para um cão resgatado.</blockquote>
    `,
    categoria: "ONG",
    data: "10/07/2025",
    tempoLeitura: "4 min de leitura",
    imagem: "https://placedog.net/800/450?r=37"
  },
  {
    id: 9,
    titulo: "Relato: os primeiros 8 anos resgatando cães em Ribeirão Preto",
    resumo: "Uma jornada que começou com um cão e hoje abriga mais de 130. O fundador Luiz Moraes conta como tudo começou e onde queremos chegar.",
    conteudo: `
      <h2>De um cão a mais de 130: nossa história</h2>
      <p>Em 2017, Luiz Moraes viu um cão debilitado na beira de uma estrada nos arredores de Ribeirão Preto. Parou o carro, colocou o animal no banco de trás e levou ao veterinário. Esse foi o primeiro resgate. Não seria o último.</p>

      <h3>Os primeiros anos (2017-2019)</h3>
      <p>No começo, os resgates aconteciam de forma espontânea. Luiz cuidava dos cães em casa e pedia ajuda nas redes sociais para encontrar adotantes. Com o tempo, a demanda cresceu e ficou claro que era preciso organizar tudo.</p>

      <h3>A formalização (2020)</h3>
      <p>Em 2020, a ONG foi oficialmente registrada com CNPJ. Voluntários começaram a se juntar, doações passaram a ser organizadas e o abrigo ganhou estrutura. Foi um ano difícil — a pandemia trouxe mais abandonos e menos recursos — mas a comunidade se uniu.</p>

      <h3>Crescimento e desafios (2021-2023)</h3>
      <p>O número de cães no abrigo cresceu rapidamente. Em 2023, já eram mais de 100. Alimentar, vacinar e cuidar de tantos animais exigia cada vez mais recursos. A Loja Solidária e o programa de apadrinhar foram criados nesse período.</p>

      <h3>Hoje: mais de 130 vidas (2024-2025)</h3>
      <p>Hoje o Paraíso dos Pets abriga mais de 130 cães. Realizou mais de 500 adoções. Conta com cerca de 200 voluntários. E continua crescendo, com o sonho de construir um abrigo maior e mais equipado.</p>

      <blockquote>"Cada cão que resgatamos me lembra daquele primeiro, na beira da estrada. A diferença é que agora não estou sozinho." — Luiz Moraes, fundador.</blockquote>
    `,
    categoria: "Histórias",
    data: "01/07/2025",
    tempoLeitura: "6 min de leitura",
    imagem: "https://placedog.net/800/450?r=38"
  },
  {
    id: 10,
    titulo: "Lei de Maus-Tratos Animais no Brasil: o que mudou e como denunciar",
    resumo: "Entenda a legislação brasileira sobre maus-tratos a animais, as penas previstas e como fazer uma denúncia de forma segura e eficaz.",
    conteudo: `
      <h2>Proteção animal na lei brasileira</h2>
      <p>A legislação brasileira sobre maus-tratos animais evoluiu significativamente nos últimos anos. É fundamental que cidadãos conheçam seus direitos e saibam como agir diante de situações de crueldade.</p>

      <h3>A Lei Sansão (Lei 14.064/2020)</h3>
      <p>Sancionada em 2020, a Lei Sansão aumentou as penas para quem pratica maus-tratos contra cães e gatos. A pena pode chegar a 5 anos de reclusão, além de multa e proibição de guarda.</p>

      <h3>O que é considerado maus-tratos</h3>
      <p>Abandono, negligência, agressão, confinamento inadequado, falta de alimentação e água, exposição a condições climáticas extremas e qualquer prática que cause sofrimento desnecessário ao animal.</p>

      <h3>Como denunciar</h3>
      <p>Se presenciar maus-tratos, você pode:</p>
      <ul>
        <li>Ligar para a Polícia Militar (190) ou Polícia Civil</li>
        <li>Registrar um Boletim de Ocorrência online ou presencial</li>
        <li>Entrar em contato com a Vigilância Sanitária municipal</li>
        <li>Denunciar ao Ministério Público</li>
        <li>Contatar ONGs locais como a ONG Paraíso dos Pets</li>
      </ul>

      <h3>Dicas importantes</h3>
      <p>Sempre que possível, registre fotos e vídeos como evidência. Anote endereço, data e hora. Denúncias podem ser feitas de forma anônima. Não tente resgatar o animal sozinho em situações de risco.</p>

      <blockquote>Denunciar maus-tratos não é apenas um direito — é um dever de todos nós como sociedade.</blockquote>
    `,
    categoria: "Educação",
    data: "28/06/2025",
    tempoLeitura: "5 min de leitura",
    imagem: "https://placedog.net/800/450?r=39"
  }
];

// ============================================================
// CONFIGURAÇÃO DE PAGINAÇÃO
// ============================================================
const POSTS_POR_PAGINA = 6;
let paginaAtual = 1;
let categoriaAtual = 'Todos';
let termoBusca = '';

// ============================================================
// RENDERIZAR POSTS — Cria e insere os cards no grid
// ============================================================

/**
 * Renderiza os cards de posts no grid da página de blog.
 * @param {Array} lista - Array de objetos de posts a exibir
 * @param {number} pagina - Número da página atual (1-based)
 * @returns {void}
 */
function renderPosts(lista, pagina = 1) {
  const container = document.getElementById('grid-posts');
  if (!container) return;

  // Calcula o slice da paginação
  const inicio = (pagina - 1) * POSTS_POR_PAGINA;
  const fim = inicio + POSTS_POR_PAGINA;
  const postsPage = lista.slice(inicio, fim);

  // Limpa o grid
  container.innerHTML = '';

  if (postsPage.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:var(--cor-cinza-medio);grid-column:1/-1;padding:2rem;">Nenhum post encontrado.</p>';
    return;
  }

  // Cria e adiciona cada card
  postsPage.forEach(post => {
    const card = document.createElement('div');
    card.classList.add('card-post');

    card.innerHTML = `
      <div class="card-post__imagem-wrapper">
        <img src="${post.imagem}" alt="${post.titulo}" class="card-post__imagem" loading="lazy">
      </div>
      <div class="card-post__corpo">
        <div class="card-post__meta">
          <span class="badge badge--categoria">${post.categoria}</span>
          <span>${post.data}</span>
          <span>•</span>
          <span>${post.tempoLeitura}</span>
        </div>
        <a href="post.html?id=${post.id}">
          <h3 class="card-post__titulo">${post.titulo}</h3>
        </a>
        <p class="card-post__resumo">${post.resumo}</p>
        <div class="card-post__footer">
          <a href="post.html?id=${post.id}" class="btn btn--primario btn--sm">Ler Mais</a>
          <div class="card-post__compartilhar">
            <button class="card-post__share-btn" onclick="compartilhar('whatsapp', ${post.id})" aria-label="Compartilhar no WhatsApp">
              <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
            </button>
            <button class="card-post__share-btn" onclick="compartilhar('copiar', ${post.id})" aria-label="Copiar link do post">
              <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  // Atualiza contador
  const contador = document.getElementById('blog-contador');
  if (contador) {
    contador.textContent = `${lista.length} post${lista.length !== 1 ? 's' : ''} encontrado${lista.length !== 1 ? 's' : ''}`;
  }

  // Renderiza paginação
  renderPaginacao(lista.length);
}

// ============================================================
// FILTRAR POR CATEGORIA
// ============================================================

/**
 * Filtra os posts pela categoria selecionada.
 * @param {string} categoria - Nome da categoria ou 'Todos'
 * @returns {void}
 */
function filtrarPorCategoria(categoria) {
  categoriaAtual = categoria;
  paginaAtual = 1;
  aplicarFiltros();
}

// ============================================================
// BUSCAR POSTS — Em tempo real por título e resumo
// ============================================================

/**
 * Filtra posts pelo termo de busca (case-insensitive).
 * Busca no título e no resumo.
 * @param {string} termo - Texto digitado no campo de busca
 * @returns {void}
 */
function buscarPosts(termo) {
  termoBusca = termo.toLowerCase().trim();
  paginaAtual = 1;
  aplicarFiltros();
}

/**
 * Aplica todos os filtros ativos (categoria + busca) e rerenderiza.
 * @returns {void}
 */
function aplicarFiltros() {
  let resultado = POSTS;

  // Filtro de categoria
  if (categoriaAtual !== 'Todos') {
    resultado = resultado.filter(p => p.categoria === categoriaAtual);
  }

  // Filtro de busca
  if (termoBusca) {
    resultado = resultado.filter(p =>
      p.titulo.toLowerCase().includes(termoBusca) ||
      p.resumo.toLowerCase().includes(termoBusca)
    );
  }

  renderPosts(resultado, paginaAtual);
}

// ============================================================
// PAGINAÇÃO — Botões numéricos
// ============================================================

/**
 * Renderiza os botões de paginação abaixo do grid de posts.
 * @param {number} total - Número total de posts filtrados
 * @returns {void}
 */
function renderPaginacao(total) {
  const container = document.getElementById('paginacao');
  if (!container) return;

  const totalPaginas = Math.ceil(total / POSTS_POR_PAGINA);
  container.innerHTML = '';

  if (totalPaginas <= 1) return;

  // Botão "Anterior"
  const btnAnterior = document.createElement('button');
  btnAnterior.classList.add('paginacao__btn');
  btnAnterior.textContent = '← Anterior';
  btnAnterior.disabled = paginaAtual === 1;
  btnAnterior.addEventListener('click', () => { paginaAtual--; aplicarFiltros(); scrollToGrid(); });
  container.appendChild(btnAnterior);

  // Botões numéricos
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.classList.add('paginacao__btn');
    if (i === paginaAtual) btn.classList.add('ativo');
    btn.textContent = i;
    btn.addEventListener('click', () => { paginaAtual = i; aplicarFiltros(); scrollToGrid(); });
    container.appendChild(btn);
  }

  // Botão "Próxima"
  const btnProxima = document.createElement('button');
  btnProxima.classList.add('paginacao__btn');
  btnProxima.textContent = 'Próxima →';
  btnProxima.disabled = paginaAtual === totalPaginas;
  btnProxima.addEventListener('click', () => { paginaAtual++; aplicarFiltros(); scrollToGrid(); });
  container.appendChild(btnProxima);
}

/**
 * Scroll suave até o topo do grid de posts ao mudar de página.
 */
function scrollToGrid() {
  const grid = document.getElementById('grid-posts');
  if (grid) {
    grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ============================================================
// POST INDIVIDUAL — Carrega e renderiza um post completo
// ============================================================

/**
 * Lê o parâmetro ?id= da URL e renderiza o post completo.
 * Usado exclusivamente na página post.html.
 * Se o ID for inválido, redireciona para 404.html.
 * @returns {void}
 */
function carregarPost() {
  const container = document.getElementById('post-conteudo');
  if (!container) return;

  // Lê o ID da URL
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'), 10);

  // Busca o post no array
  const post = POSTS.find(p => p.id === id);

  if (!post) {
    // Post não encontrado — redireciona para 404
    window.location.href = '../404.html';
    return;
  }

  // Atualiza o título da página
  document.title = `${post.titulo} | ONG Paraíso dos Pets`;

  // Preenche a imagem hero
  const heroImg = document.getElementById('post-hero-img');
  if (heroImg) heroImg.src = post.imagem;

  // Preenche breadcrumb
  const breadcrumbTitulo = document.getElementById('breadcrumb-titulo');
  if (breadcrumbTitulo) breadcrumbTitulo.textContent = post.titulo;

  // Preenche metadados
  const postCategoria = document.getElementById('post-categoria');
  if (postCategoria) postCategoria.textContent = post.categoria;

  const postData = document.getElementById('post-data');
  if (postData) postData.textContent = post.data;

  const postTempo = document.getElementById('post-tempo');
  if (postTempo) postTempo.textContent = post.tempoLeitura;

  // Preenche título
  const postTitulo = document.getElementById('post-titulo');
  if (postTitulo) postTitulo.textContent = post.titulo;

  // Preenche conteúdo
  const artigo = document.getElementById('post-artigo');
  if (artigo) artigo.innerHTML = post.conteudo;

  // Renderiza posts relacionados
  renderRelacionados(post);

  // Inicializa barra de progresso de leitura
  initProgressBar();
}

// ============================================================
// BARRA DE PROGRESSO DE LEITURA
// ============================================================

/**
 * Inicializa a barra de progresso de leitura no topo da página.
 * A barra avança conforme o scroll da página.
 * @returns {void}
 */
function initProgressBar() {
  const barra = document.getElementById('barra-progresso');
  if (!barra) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progresso = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    barra.style.width = `${progresso}%`;
  }, { passive: true });
}

// ============================================================
// POSTS RELACIONADOS — Mesma categoria
// ============================================================

/**
 * Renderiza até 3 posts da mesma categoria no final do artigo.
 * @param {Object} postAtual - O post atualmente exibido
 * @returns {void}
 */
function renderRelacionados(postAtual) {
  const container = document.getElementById('posts-relacionados');
  if (!container) return;

  const relacionados = POSTS
    .filter(p => p.categoria === postAtual.categoria && p.id !== postAtual.id)
    .slice(0, 3);

  if (relacionados.length === 0) {
    container.style.display = 'none';
    return;
  }

  const grid = container.querySelector('.grid-posts');
  if (!grid) return;

  grid.innerHTML = '';
  relacionados.forEach(post => {
    const card = document.createElement('div');
    card.classList.add('card-post');
    card.innerHTML = `
      <div class="card-post__imagem-wrapper">
        <img src="${post.imagem}" alt="${post.titulo}" class="card-post__imagem" loading="lazy">
      </div>
      <div class="card-post__corpo">
        <div class="card-post__meta">
          <span class="badge badge--categoria">${post.categoria}</span>
          <span>${post.data}</span>
        </div>
        <a href="post.html?id=${post.id}">
          <h3 class="card-post__titulo">${post.titulo}</h3>
        </a>
        <p class="card-post__resumo">${post.resumo}</p>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ============================================================
// COMPARTILHAR — WhatsApp ou copiar link
// ============================================================

/**
 * Compartilha um post via WhatsApp ou copia o link.
 * @param {string} tipo - 'whatsapp' ou 'copiar'
 * @param {number} id - ID do post a compartilhar
 * @returns {void}
 */
function compartilhar(tipo, id) {
  const post = POSTS.find(p => p.id === id);
  if (!post) return;

  const url = `${window.location.origin}/pages/post.html?id=${id}`;

  if (tipo === 'whatsapp') {
    const texto = encodeURIComponent(`${post.titulo} — Confira no blog da ONG Paraíso dos Pets: ${url}`);
    window.open(`https://wa.me/?text=${texto}`, '_blank');
  } else if (tipo === 'copiar') {
    navigator.clipboard.writeText(url).then(() => {
      if (typeof showToast === 'function') {
        showToast('Link copiado!', 'sucesso');
      }
    }).catch(() => {
      if (typeof showToast === 'function') {
        showToast('Não foi possível copiar o link', 'erro');
      }
    });
  }
}

// ============================================================
// INICIALIZAÇÃO — Página de blog (blog.html)
// ============================================================

/**
 * Inicializa a página de listagem de posts do blog.
 * Configura tabs de categoria, busca e renderiza os posts.
 * @returns {void}
 */
function initBlog() {
  const gridPosts = document.getElementById('grid-posts');
  if (!gridPosts) return;

  // Renderiza todos os posts inicialmente
  renderPosts(POSTS);

  // Configura tabs de categoria
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('ativo'));
      tab.classList.add('ativo');
      filtrarPorCategoria(tab.dataset.categoria || 'Todos');
    });
  });

  // Configura busca em tempo real
  const buscaInput = document.getElementById('busca-blog');
  if (buscaInput) {
    buscaInput.addEventListener('input', (e) => {
      buscarPosts(e.target.value);
    });
  }

  // Renderiza sidebar (posts recentes e categorias)
  renderSidebar();
}

/**
 * Renderiza os widgets da sidebar do blog.
 * @returns {void}
 */
function renderSidebar() {
  // Posts recentes
  const recentesContainer = document.getElementById('sidebar-recentes');
  if (recentesContainer) {
    const recentes = POSTS.slice(0, 5);
    recentesContainer.innerHTML = '';
    recentes.forEach(post => {
      const item = document.createElement('a');
      item.classList.add('sidebar-post');
      item.href = `post.html?id=${post.id}`;
      item.innerHTML = `
        <img src="${post.imagem}" alt="${post.titulo}" class="sidebar-post__thumb">
        <div>
          <p class="sidebar-post__titulo">${post.titulo}</p>
          <span class="sidebar-post__data">${post.data}</span>
        </div>
      `;
      recentesContainer.appendChild(item);
    });
  }

  // Categorias com contagem
  const categoriasContainer = document.getElementById('sidebar-categorias');
  if (categoriasContainer) {
    // Conta posts por categoria
    const contagem = {};
    POSTS.forEach(p => {
      contagem[p.categoria] = (contagem[p.categoria] || 0) + 1;
    });

    categoriasContainer.innerHTML = '';
    Object.entries(contagem).forEach(([cat, count]) => {
      const item = document.createElement('div');
      item.classList.add('sidebar-categoria');
      item.innerHTML = `
        <span>${cat}</span>
        <span class="sidebar-categoria__count">${count}</span>
      `;
      item.addEventListener('click', () => {
        // Atualiza a tab ativa e filtra
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(t => {
          t.classList.toggle('ativo', t.dataset.categoria === cat);
        });
        filtrarPorCategoria(cat);
        scrollToGrid();
      });
      categoriasContainer.appendChild(item);
    });
  }
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  initBlog();
  carregarPost(); // Só executa se #post-conteudo existir (post.html)
});

// ============================================================
// FIM DO ARQUIVO blog.js
// ============================================================
