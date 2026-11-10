# HULK: SMASH CITY — GDD completo de evolução v3.0

**Tipo:** Game Design Document (GDD) + auditoria estática + plano de implementação + plano de QA  
**Data:** 10 de novembro de 2026  
**Projeto:** [Jogo publicado](https://jogoiarexx-blip.github.io/Hulk-Smash/) | [Repositório GitHub](https://github.com/jogoiarexx-blip/Hulk-Smash)  
**Base técnica examinada:** arquivos da branch `main`, com identificação v2.0 no `index.html` e em `src/game.js`.  
**Estado deste documento:** especificação de melhorias; **não** significa que estas novidades já foram programadas, testadas ou publicadas.

---

## 0. LEIA PRIMEIRO — regra de preservação do jogo

**Não reconstruir o projeto do zero.** Conservar a estrutura de Three.js, o arquivo `assets/models/hulk.glb`, a malha, a textura, os ossos, os clipes originais, as animações aditivas, a física de colisão, o áudio OGG e as seis missões existentes. Trabalhar por atualizações incrementais e regressões automatizadas.

O produto atual é um **protótipo de fã com personagem/marca Hulk**. Sua licença de modelo 3D (atribuída no repositório a shreyhaldkar0, CC BY 4.0) não transfere direitos sobre o personagem/marca. Manter créditos e a observação de projeto não oficial. Para distribuição comercial, negociar direitos ou substituir a propriedade intelectual por protagonista original.

### 0.1. Escopo da auditoria e limites

- **Inspecionado:** HTML da página publicada, árvore do repositório, arquivos técnicos e diversos módulos de regras, movimento, combate, animação, áudio, campanha e testes.
- **Constatado na página pública consultada:** textos identificando **v1.5** e comandos básicos; o código `main` identifica **v2.0** e oferece mais controles. **Verificar publicação/cache antes de concluir qual build um jogador recebe.**
- **Constatado nos arquivos v2.0:** campanha de seis capítulos; combos de três golpes; golpe duplo; agarrar e lançar tanque/drone; deformação progressiva de carros; fragmentos estruturais com colisão simplificada; minimapa; atualização adaptativa de resolução.
- **Declarado pelo relatório `TESTES-E-LIMITACOES-v2.0.md`:** 25 testes automatizados aprovados no ambiente de desenvolvimento, mas navegador Chromium/WebGL bloqueado; a alegação não equivale a uma partida real certificada. O arquivo `TESTES-v2.0.log` citado pelo relatório não apareceu na árvore consultada.
- **Não executado nesta auditoria:** gameplay ao vivo com GPU, benchmark de FPS, certificação de seis missões completas ou captura de vídeo. Não atribuir esses resultados a este documento.

### 0.2. Metas da v3.0

1. Fazer todo comando parecer poderoso **sem sensação de atraso ou animação travada**.
2. Criar **uma cidade semiaberta viva** com identidade visual, setores e eventos.
3. Ampliar o combate para 12+ movimentos úteis e inimigos com ataques legíveis.
4. Tornar a destruição **localizada, progressiva e fisicamente plausível** para um jogo arcade.
5. Transformar as seis missões atuais em base de uma **campanha de 12 missões**, mantendo as originais.
6. Acrescentar save, progressão, desbloqueios, chefe final, créditos e pós-jogo.
7. Preservar execução em GitHub Pages e desempenho escalável no PC; suporte a controle, e depois mobile como alvo separado.

---

## 1. IDENTIDADE DO JOGO

| Campo | Definição |
|---|---|
| Nome atual | **HULK: SMASH CITY** |
| Gênero | Ação 3D em terceira pessoa, destruição urbana, combate arcade e aventura por missões |
| Plataforma prioritária | Navegador desktop / GitHub Pages |
| Plataformas posteriores | PWA com cache offline, controle USB/Bluetooth, Android e executável local |
| Câmera | Terceira pessoa, livre, zoom variável, assistida para combate e escalada |
| Estrutura | Cidade semiaberta com 4 distritos conectados, missões e eventos secundários |
| Loop principal | Explorar → detectar ameaça → lutar/destruir → proteger objetivo → ganhar XP → desbloquear poder → enfrentar ameaça maior |
| Fantasia central | Ser uma força gigantesca que salta prédios, intercepta veículos, derruba defesas militares e protege pessoas |
| Diretriz | A destruição deve ter peso, consequências claras e opções táticas, não só partículas |

### 1.1. Pilares de design

**Poder:** os golpes empurram, amassam, quebram e alteram o cenário.  
**Mobilidade:** correr, saltar, escalar e atravessar a cidade devem ser tão divertidos quanto lutar.  
**Escolha:** inimigos e objetivos estimulam alternância entre socos, lançamentos, ataques aéreos e proteção.  
**Leitura:** o jogador entende onde atacar, o que está acontecendo e por que sofreu dano.  
**Performance:** destruição impressionante visualmente com física simplificada, orçamento fixo de objetos e LOD.

### 1.2. Loop de 30 segundos

1. O radar aponta um comboio militar a 150 m.
2. O jogador carrega um superpulo, aterrissa sobre um carro blindado e inicia um combo.
3. Um drone prepara disparo: o jogador usa palmada de choque para interrompê-lo.
4. O jogador agarra um tanque, lança em um transmissor e abre caminho.
5. Pontos, fúria e XP surgem em feedback breve; a intensidade militar aumenta.
6. O objetivo concluído dá prêmio e acesso ao próximo confronto.

### 1.3. Progressão de uma sessão

- **3 minutos:** aprender três movimentos e derrubar a primeira barreira.
- **10 minutos:** encontrar inimigos com padrões diferentes e selecionar uma melhoria.
- **25 minutos:** enfrentar um minichefe e usar estratégias específicas.
- **1–3 horas:** completar um ato, abrir distrito e ganhar habilidade transformadora.
- **Campanha total planejada:** 12 missões com intervalos de exploração e tarefas opcionais, duração a ser calibrada em playtests — nunca apresentada como já existente.

---

## 2. AUDITORIA DO ESTADO ATUAL

### 2.1. Inventário funcional verificado em código

| Subsistema | Evidência em `main` v2.0 | Status |
|---|---|---|
| Deslocamento | WASD, corrida, gravidade, colisão deslizante | Existe em código |
| Superpulo | Carregamento de 1,65 s, impulso progressivo, pouso em telhado | Existe em código |
| Escalada | Contato com fachada, deslocamento lateral, salto de parede | Existe em código |
| Socos | Corrente de 3 golpes, multiplicadores, buffering de entrada | Existe em código |
| Golpe duplo | Comando `V`, impacto forte e recarga | Existe em código |
| Impacto sísmico | Comando `Q`, impacto terrestre e ataque aéreo | Existe em código |
| Palmada trovejante | Comando `X`, cone frontal e neutralização de projéteis | Existe em código |
| Agarrar carros | Comando `E`, carregar e arremessar | Existe em código |
| Agarrar inimigos | Comando `G`, tanques e drones | Existe em código |
| Fúria | `R` com barra a partir de 85%, duração de 12 s | Existe em código |
| Cenário | Quarteirões, prédios com fachadas, árvores, ruas, postes | Existe em código |
| Danos em carros | Funções de amassamento de teto/porta/capô | Existe em código |
| Prédios | Rachaduras em 3 patamares e colapso em seções | Existe em código |
| Oponentes | Tanques, drones e chefe-tanque modificado | Existe em código |
| Objetivos | 6 classes de missões no `src/campaign.mjs` | Existe em código |
| Interface | HUD, barra de vida/fúria, minimapa, menu/pausa, áudio | Existe em código |
| Trilha/sons | Arquivos OGG locais; carregador de som no `src/audio.js` | Existe em código |
| Save/continue | Não foram encontrados `localStorage`/IndexedDB ou tela de capítulos | **A desenvolver** |
| Gamepad | Entrada predominante por teclado/mouse | **A desenvolver** |
| Telas touch | Sem controles virtuais correspondentes no HTML estudado | **A desenvolver** |
| Animações importadas novas | Relatório diz que novos movimentos são poses em ossos, sem novos BVH/FBX | **A desenvolver** |
| IA sofisticada | Aproximação, disparos e steering local simplificado | **A desenvolver** |

### 2.2. Pontos de atenção concretos no código

**P0-01 — Versão publicada vs. repositório.** Verificar se o Pages entrega `index.html` e módulos v2.0. Atualizar cabeçalho, query strings ou deploy sem criar dois estados conflitantes.

**P0-02 — Escala do chefe sobrescrita.** Em `startMission`, o boss recebe `boss.group.scale.setScalar(1.40)`; em `updateEnemies`, a escala dos inimigos é redefinida continuamente para `1` ou `1.08`. Corrigir usando `baseScale`, multiplicando apenas o pulso de reação. A escala original do chefe não pode se perder.

**P0-03 — Chefe agarrável sem regra exclusiva.** `grabEligible()` trata o chefe como tanque comum, sem checar `boss`/escudo. O fluxo de lançamento executa dano fatal no alvo arremessado. Bloquear agarrão de chefe pesado, ou permitir apenas após atordoamento e desativação dos geradores, com dano balanceado. Cobrir com teste.

**P0-04 — Impacto e animação precisam de ponto único de sincronização.** No ataque sísmico terrestre a área é atingida imediatamente na chamada de `slam()`, enquanto a pose dura mais tempo. Criar `hitEvent` no frame de contato para que tela/áudio/dano aconteçam juntos; evitar dano duplicado.

**P0-05 — Ausência de checkpoints.** A derrota aciona tela de fim e reinício geral; o jogador não tem salvamento de capítulo/upgrade. Criar persistência versionada e continuar a fase atual sem apagar progressão.

**P1-01 — Cidade procedimental sem distritos bem identificados.** A malha de ruas e edifícios é semelhante entre quarteirões. Separar estilos de bairro, pontos de interesse, silhuetas e rotas.

**P1-02 — IA pouco variada.** A maior parte das unidades aproxima-se do alvo e atira; faltam estados de telegraph, cobertura, flanqueamento, recuo, coordenação e reconhecimento.

**P1-03 — Física cara em escala.** Há várias varreduras por arrays de edifícios, veículos, inimigos e seções estruturais por quadro. Adotar grade espacial e listas próximas para manter o custo estável.

**P1-04 — `src/game.js` monolítico.** Arquivo com aproximadamente 97 kB e 1.646 linhas examinadas. Refatorar gradualmente, mantendo APIs e testes.

**P1-05 — Dependência do CDN do Three.js.** O HTML usa importmap de `cdn.jsdelivr.net` para Three.js 0.186.1. O jogo não é plenamente offline até disponibilizar dependências locais e service worker corretamente versionado.

**P2-01 — Customização e acessibilidade.** Faltam rebinding completo, gamepad, opção de reduzir tremor e flashes, modo daltonismo e controle touch.

### 2.3. Notas de maturidade estimadas (não são benchmark)

Escala subjetiva para orientar prioridade: 0 = inexistente, 10 = pronto para lançamento, **estimada exclusivamente pela auditoria de código/documentação**.

| Área | Base v2.0 estimada | Meta v3.0 | Critério de evolução |
|---|---:|---:|---|
| Movimentação | 7,0 | 9,0 | fluidez, colisões e sensação de peso |
| Combate | 6,5 | 9,0 | variedade, feedback e balanceamento |
| Animações | 6,0 | 9,0 | transições, IK, contato e sem clipping |
| Poderes | 7,0 | 9,0 | sinergia e utilidade real |
| Destruição | 6,5 | 9,0 | danos localizados e persistência |
| IA inimiga | 4,0 | 8,5 | padrões e respostas contextualizadas |
| Chefes | 3,5 | 9,0 | identidade e fases distintas |
| Cenário/arte | 6,0 | 9,0 | bairros reconhecíveis e LOD |
| Campanha | 6,0 | 9,0 | narrativa, 12 missões, conclusão |
| HUD/menus | 6,5 | 9,0 | clareza e opções |
| Save/progressão | 1,0 | 9,0 | continuar/reiniciar sem perda |
| Otimização | 6,0 | 9,0 | perfis e metas por hardware |
| QA/release | 4,0 | 9,0 | teste real, repetição e CI |

---

## 3. CONTROLES DEFINITIVOS

### 3.1. Teclado/mouse — manter comandos existentes

| Entrada | Ação | Observação |
|---|---|---|
| `W A S D` | Mover | Direção relativa à câmera |
| `Shift` | Corrida | aceleração com inércia curta |
| `Espaço` segurar/soltar | Carregar e executar superpulo | se agarrado à parede: salto de parede |
| `C` + direção | Agarrar e escalar fachada | apenas superfície válida |
| `F` / clique esquerdo | Combo de socos | contexto: execução no ar/objeto |
| `Q` | Pancada no chão / mergulho aéreo | sincronizar impacto |
| `X` | Palmada trovejante | cone frontal, cancela tiros leves |
| `E` | Levantar/lançar carro ou objeto | contextual |
| `G` | Agarrar/lançar inimigo | alvo válido, exclusão de chefes protegidos |
| `V` | Golpe duplo | dano pesado |
| `R` | Fúria | depende da barra |
| Botão direito + mover mouse | Girar câmera | sensibilidade ajustável |
| Roda do mouse | Zoom | 3 distâncias predefinidas opcionais |
| `Esc / P` | Pausa | mantém estado estável |
| `Tab` (novo) | Roda de poderes | não conflita com comandos já existentes |
| `1–4` (novo) | Habilidades equipadas | até quatro atalhos |
| `M` | Mudo | preservar |

**Regra:** novas entradas não podem remover `F`, `Q`, `X`, `G`, `V` ou `E` sem migração e atualização do tutorial.

### 3.2. Controle Xbox/PlayStation (fase P2)

- Analógico esquerdo: movimento; direito: câmera.
- A / ×: pular (segurar para carregar); B / ○: agarrar/escalar quando contextual.
- X / □: ataque leve; Y / △: golpe pesado / contextual.
- RB / R1: agarrar/lançar; LB / L1: roda de poderes.
- RT / R2: poder selecionado; LT / L2: mirar ou travar alvo temporariamente.
- L3: correr; R3: centralizar câmera; Menu/Options: pausa.
- Criar perfis alternativos e permitir remapeamento; ícones devem refletir o controle detectado.

### 3.3. Touch (depois da versão desktop estabilizada)

Joystick esquerdo, câmera por arraste na metade direita, salto com pressionamento prolongado, botões grandes de ataque/poder/agarrar, menu radial e alvos de toque amplos. HUD com safe areas e escala própria; **não** adaptar simplesmente por CSS o layout de desktop.

---

## 4. MOVIMENTAÇÃO E FÍSICA DO PERSONAGEM

### 4.1. Estados de locomoção

`Idle → StartWalk → Walk → Run → Sprint → Brake → Turn180 → JumpCharge → JumpRise → Apex → Fall → LandSoft/LandHeavy → Recover`.

Estados especiais: `ClimbEnter`, `ClimbIdle`, `ClimbUp`, `ClimbSide`, `WallJump`, `RoofVault`, `AirDash`, `AirSlam`, `Stunned`, `GrabCarry`.

### 4.2. Melhorias obrigatórias

1. **Aceleração e desaceleração:** aumentar velocidade com curva curta; personagem pesado, mas resposta imediata aos comandos.
2. **Giro do tronco antes dos pés:** rotação parcial do torso e depois dos quadris, sem deslizar no chão.
3. **Corrida de impacto:** cada pisada pesada recebe som, poeira e microvibração, respeitando opção de reduzir movimento.
4. **Superpulo calculável:** mostrar arco/força em barra discreta; carregar na parede não pode criar impulso indevido.
5. **Superpulo direcionável:** correção moderada da trajetória no ar, sem parecer voo livre.
6. **Pousos por altura:** abaixo de limiar, aterrissagem breve; acima dele, onda de poeira e fissura decorativa.
7. **Escalada com contato:** mãos e pés apoiados no mesmo plano da fachada (IK com limites); transição animada ao atingir o telhado.
8. **Colisão contínua:** ray/shape casts para impedir atravessar prédios/veículos em saltos longos.
9. **Câmera segura:** recuar ou aproximar diante de paredes, com fade temporário dos objetos ocultadores.
10. **Passo em obstáculos baixos:** degraus de calçada não podem travar personagem enorme.

### 4.3. Regras físicas sugeridas

- Atualização de gameplay em passo fixo de **1/60 s** com acumulador e até 4 subpassos; renderização interpolada.
- Gravidade e dimensões coerentes com os valores existentes; **calibrar**, não trocar números globalmente sem teste.
- Implementar prioridade de colisão: chão/telhado → paredes → sólidos grandes → veículos → fragmentos ativos.
- Em queda longa, câmera acompanha com atraso controlado; evitar saltos de câmera.
- Sem dano por queda ao protagonista, se essa for a fantasia escolhida; queda deve causar dano ao cenário, não ao jogador.
- Hitbox do avatar separada do esqueleto e imune a alterações cosméticas de escala.

---

## 5. SISTEMA DE COMBATE 3.0

### 5.1. Regras centrais

- Ataque só aplica dano no **evento de contato** (hit frame), não no início da animação.
- `Wind-up` legível → janela ativa → recuperação → cancelamento limitado.
- Fila de comando de 100–180 ms para combos, sem golpe automático inesperado.
- Alvos próximos priorizados por direção, distância, visibilidade e missão ativa.
- Inimigos grandes têm armadura/estabilidade; inimigos leves recebem knockback mais longo.
- Colisão do punho com paredes e carros; nunca acertar adversário através de edifício sólido.
- Evitar câmera travada: assistência leve, lock-on opcional para chefes.
- Visual de acerto: faísca/poeira, som encorpado, parada breve de impacto (hit-stop 25–55 ms), recuo e reação distinta.

### 5.2. Catálogo de ataques

| Golpe | Entrada | Função tática | Implantação |
|---|---|---|---|
| Soco direito/esquerdo | `F` | alcance curto, combo | preservar |
| Soco titânico | 3º golpe de `F` | quebra guarda e encerra cadeia | aperfeiçoar |
| Golpe duplo | `V` | dano concentrado | preservar |
| Palmada trovejante | `X` | dispersão frontal e projéteis | preservar |
| Impacto sísmico | `Q` no solo | dano radial e interrupção | preservar |
| Mergulho esmagador | `Q` no ar | choque ao aterrissar | preservar |
| Arremesso de carro | `E`, depois `E` | dano de área / alvo distante | preservar |
| Arremesso de inimigo | `G`, depois `G` | usar alvo como projétil | preservar, ajustar boss |
| Pisão demolidor | poder 1 | atinge solo, destrói barricadas | novo |
| Investida brutal | poder 2 | avança, empurra e abre corredor | novo |
| Agarrão e esmagamento | poder 3 | lança inimigo ao solo em sequência | novo |
| Cotovelada giratória | poder 4 | afasta inimigos nas costas | novo |
| Martelo aéreo | salto + golpe pesado | esmaga blindagem superior | novo |
| Explosão de fúria | `R` ativo + poder | variante poderosa, custo alto | novo |
| Arrancar poste | `E` contextual | arma temporária corpo a corpo | novo |
| Devolver míssil | agarrar com janela indicada | contra-ataque de habilidade | novo |

### 5.3. Combos exemplares

- **Combo A:** soco direito → soco esquerdo → soco titânico; final joga alvo leve contra obstáculo.
- **Combo B:** soco → golpe duplo → impacto no chão; rompe formação inimiga, exige cooldown.
- **Combo C:** arremessar carro → superpulo → mergulho esmagador; destruição combinada.
- **Combo D:** agarrar inimigo → usar contra veículo → lançamento; dano por massa/velocidade.
- **Combo E:** palmada → correr → investida; dispersar drones e eliminar alvo terrestre.

### 5.4. Dano e equilíbrio (valores iniciais de projeto, não dados atuais)

| Classe de ataque | Dano relativo | Foco |
|---|---:|---|
| Soco rápido | 1,0× | continuidade |
| Soco final | 1,8× | explosão de dano |
| Duplo | 2,1× | armadura |
| Ataque de área | 1,2× por alvo | multidão/controle |
| Impacto aéreo | 1,5–2,5× conforme altura | risco/recompensa |
| Arremesso de carro | 2,0× + colisão | alcance e cenário |
| Investida | 1,5× + knockback | mobilidade ofensiva |

Resistências por tipo: blindados reduzem socos comuns e são vulneráveis a impactos por cima; drones resistem a pancadas terrestres mas são vulneráveis à palmada. Não usar invulnerabilidade arbitrária sem feedback visual.

### 5.5. Janelas e proteção contra exploits

- Cada ataque tem `attackId`; alvo recebe no máximo um acerto por evento, salvo golpes multi-hit explicitamente definidos.
- Não acumular vida pela destruição de objetos infinitamente recriados.
- A ameaça do chefe protegido não pode ser anulada pelo agarrão comum.
- A fúria não deve permitir invencibilidade total sem contrapartida; versão sugerida: **redução de 70% do dano**, resistência a stagger e ganho de dano, com opção de dificuldade.
- Cancelamento defensivo durante recovery só para ataques leves; golpes pesados ficam comprometidos.

---

## 6. SISTEMA DE PODERES E FÚRIA

### 6.1. Recursos

**Vida:** 0–100; perde por projéteis, colisões e ataques de chefes; recuperação limitada por objetivos e derrotas.  
**Fúria:** 0–100; acumulada por combos, destruição e dano recebido. Ativar `R` a partir de 85; mantém os 12 s atuais inicialmente.  
**Cooldown:** individual de cada habilidade; mostrado no HUD.  
**Pontos de evolução:** ganhos por missões/desafios e usados na árvore de habilidades.  
**Energia gama secundária:** *opcional para uma expansão posterior*; evitar uma segunda barra sem necessidade real.

### 6.2. Matriz de poderes novos

| Poder | Efeito | Custo/recarga inicial | Desbloqueio |
|---|---|---|---|
| Pisão sísmico | cone curto de fissuras no chão | 7 s | missão 2 |
| Investida brutal | atravessa barricadas leves, esmaga carros | 9 s | missão 3 |
| Punhos de aço | 2 socos de ruptura de blindagem | 12 s | missão 4 |
| Salto meteoro | maior alcance aéreo e explosão de impacto | 14 s | missão 5 |
| Onda de choque circular | empurra projéteis/inimigos em 360° | 16 s | missão 6 |
| Arrancada aérea | corrige salto para alvo visível | 8 s | missão 7 |
| Martelo esmagador | agarrão que cria cratera superficial | 12 s | missão 8 |
| Rugido intimidante | interrompe drones/soldados próximos | 18 s | missão 9 |
| Desvio de míssil | devolução manual com janela de execução | 10 s | missão 10 |
| Colosso enfurecido | finalizador especial da fúria | 1 uso/fúria | missão 11 |

**Aviso de implementação:** números são parâmetros iniciais para playtest. O jogo deve manter `powers.config` externo ou objeto central de dados, e testes devem checar limites, não valores espalhados entre arquivos.

### 6.3. Árvore de habilidades

**Ramo BRUTALIDADE:** dano de socos → quebra de armadura → combos aéreos → finalizador devastador.  
**Ramo MOBILIDADE:** carregamento mais rápido → parede/telhado mais fluido → controle aéreo → salto meteoro.  
**Ramo RESISTÊNCIA:** reduzir knockback → regeneração limitada → proteção contra explosivos → pele de titânio.  
**Ramo DESTRUIÇÃO:** levantar objetos maiores → aumentar dano ambiental → fragmentos como armas → reação em cadeia.

Cada upgrade tem: ID persistente, nível máximo, custo, pré-requisito, descrição, efeito numérico, ícone e teste. Máximo de 3 níveis para passivos; poderes especiais recebem apenas variações táticas.

---

## 7. ANIMAÇÕES — ESPECIFICAÇÃO COMPLETA

### 7.1. Preservar o GLB original

Os documentos do repositório descrevem **108 juntas/ossos**, **dois clipes originais** e uma camada de animação procedural/aditiva sobre o modelo enviado. O objetivo não é substituir o modelo nem perder seu rig, e sim melhorar o animador e, quando houver clipes licenciados, fazer retarget controlado.

Pipeline recomendado: `GLTFLoader → Skeleton mapping → AnimationMixer base → Pose layers → IK contato → Ajuste de dedos → Render`. Nunca usar dois módulos alterando a mesma rotação de osso sem ordem definida.

### 7.2. Biblioteca-alvo de movimentos

| Categoria | Animações previstas | Critério visual |
|---|---|---|
| Neutro | idle tenso, respiração, olhar, rugido curto | tronco vivo, sem tremedeira |
| Locomoção | iniciar andar, andar, correr, sprint, frear, curva 90°, curva 180° | pés não patinam |
| Saltos | preparar, impulsionar, subir, ápice, cair, aterrissar leve/pesado | antecipação e peso |
| Escalada | fixar mãos, escalar para cima, lateral, parar, saltar para trás, subir no telhado | mãos e pés na superfície |
| Combate leve | soco D, soco E, 3º golpe, recuo, recuperar guarda | hit no contato |
| Combate pesado | duplo, pisão, martelo, cotovelo, investida, esmagamento | sensação de massa |
| Poder | palmada, impacto sísmico, rugido, choque circular, ativar fúria | efeitos no momento correto |
| Agarrão | iniciar pegada, pegar carro, segurar carro, levantar tanque, segurar tanque, arremessar, recuperação | objeto preso à mão/peito |
| Reação | dano leve, dano pesado, stagger frontal/lateral, levantar | sem snap de pose |
| Cinema | entrada de missão, olhar para ameaça, vitória, derrota | sem perda de controle inesperada |

Total mínimo sugerido: **35 estados distintos**, produzidos por clipes licenciados, keyframes próprios ou poses aditivas, não necessariamente 35 arquivos separados.

### 7.3. Regras técnicas do animador

1. Usar **máquina de estados hierárquica** com prioridade explícita: morte/erro → golpe especial → agarrão → escalada → ar → movimento → idle.
2. Aplicar crossfade de 0,10–0,25 s (valores por transição); movimentos pesados podem exigir saída prolongada.
3. Definir `animEvent` com `attackStart`, `hit`, `footstep`, `grabAttach`, `throwRelease`, `land`, `end`.
4. IK das mãos deve acompanhar a parede sem alongar braços nem torcer cotovelos além do limite do rig.
5. IK dos pés deve corrigir apoio em calçadas e telhados; desligar IK quando no ar.
6. Preservar orientação de modelo e `avatarFlip()` apenas como ferramenta de diagnóstico; fixar orientação padrão depois da validação.
7. Quando o FPS cai, não acelerar nem desacelerar artificialmente a animação.
8. Nenhum ataque que possui cooldown pode reiniciar pose inadvertidamente a cada quadro.
9. Manter testes de pose sem NaN e adicionar snapshots numéricos de ossos-chave.
10. Validar em câmera frontal, costas, perfil e vista aérea para detectar deformação.

### 7.4. Checklist de qualidade de animação

- [ ] Pés não atravessam asfalto/telhado.
- [ ] Mãos fecham antes de agarrar veículo.
- [ ] Veículo acompanha mão sem teleporte.
- [ ] Corpo inclina antes de saltar.
- [ ] Braços convergem realmente na palmada.
- [ ] Explosão e dano ocorrem no contato, não no início.
- [ ] Nenhum ombro gira 360° inesperadamente.
- [ ] Hulk não muda de escala ao receber dano.
- [ ] Boss preserva escala e orientação.
- [ ] Redução de velocidade no jogo não deforma blending.

---

## 8. DESTRUIÇÃO DE CENÁRIOS 3.0

### 8.1. Sistema de dano localizado

Cada edifício recebe regiões: fachada norte/sul/leste/oeste; base; estrutura intermediária; teto. Registrar impacto com posição, normal, força e tipo.

**Estágios visuais:** 0 íntegro → 1 rachaduras e pó → 2 janelas/placas quebradas → 3 suporte crítico → 4 colapso por seções.

Evitar a regra de 'perder HP e desaparecer inteiro' sem prévia. Usar máscara de dano ou decal procedimental apenas perto dos impactos; fragmentos pré-definidos substituem a região destruída.

### 8.2. Classes de objetos

| Classe | Reação esperada | Persistência |
|---|---|---|
| Janelas | estilhaço leve, som, shader de vidro quebrado | durante missão |
| Portas/grades | dobrar/soltar após golpes | durante missão |
| Fachadas | rachaduras locais, poeira | durante missão |
| Muros baixos | fragmentos pequenos e abertura real | durante missão |
| Prédios | colapso em blocos, poeira e entulho sólido | até descarte por distância/tempo |
| Carros | capô amassado, portas tortas, pneus, fogo leve | durante missão |
| Caminhões | blindagem e eixos separados, carga cai | durante missão |
| Postes | dobram, faíscas, eventualmente podem ser usados como arma | durante missão |
| Pontes | apenas segmentos predefinidos, não física global | em missões específicas |
| Tanques | lagartas/torre danificadas, explosão final | durante combate |

### 8.3. Colapso eficiente

- Preservar o kernel atual `towerSections`/`advanceStructuralBody` como base.
- Montar prédio com **peças grandes prefraturadas** e usar simulação simplificada apenas no raio visível do jogador.
- Após assentamento, converter destroço móvel em geometria estática; manter alguns blocos sólidos.
- Pool de fragmentos, poeira e faíscas, com TTL e limite por qualidade.
- Gerar impacto de projéteis/carros via varredura contínua para evitar atravessar objeto.
- Dano em cadeia limitado em quantidade por tick, evitando loops explosivos.
- Nunca manter milhares de rigid bodies dinâmicos para toda a cidade.
- Persistir o **estado lógico** de edifício destruído, não a posição completa de cada partícula.

### 8.4. Consequência de destruição

**Nível de ameaça militar** sobe ao atacar bases, derrubar torres ou romper barricadas; **bônus de proteção** sobe ao impedir dano ao abrigo e concluir objetivos. A fantasia é um Hulk destrutivo, mas a campanha valoriza proteger civis; não recompensar agressão a pessoas vulneráveis.

---

## 9. INIMIGOS E INTELIGÊNCIA ARTIFICIAL

### 9.1. Elenco-alvo

| Inimigo | Vida relativa | Ataques | Fraqueza | Papel |
|---|---:|---|---|---|
| Soldado básico | baixa | fuzil, retirada | área/choque | aprendizado |
| Soldado pesado | média | rajada e escudo | ataque aéreo | controle de rua |
| Lançador de foguetes | baixa | míssil telegrafado | devolver projétil | punição a parada |
| Unidade de captura | média | cabo de contenção | palmada/interromper | restringe movimento |
| Drone leve | baixa | laser | palmada | flanco aéreo |
| Drone interceptador | média | mergulho, rajada | golpe aéreo | pressão vertical |
| Tanque básico | alta | canhão, atropelamento | ataque por cima | blindado de rua |
| Tanque de cerco | muito alta | tiro pesado, minas | traseira e agarrões contextuais | minichefe |
| Helicóptero | alta | metralhadora, míssil | salto e arremesso | antiaéreo |
| Exoesqueleto militar | alta | socos, pulso elétrico | agarrão após stagger | rival corpo a corpo |
| Robô anti-gama | muito alta | escudo, área, agarrão | destruir gerador | elite |
| Artilharia fixa | média | disparo carregado | destruir base | objetivo espacial |

Todos os novos inimigos exigem modelos próprios ou geometria provisória claramente indicada; não chamar uma caixa escalada de 'helicóptero final'.

### 9.2. FSM recomendada

`Patrol → Investigate → Alert → Approach/KeepDistance/Flank → Telegraph → Attack → Recover → Stunned → Retreat/Destroyed`.

**Soldados:** buscam cobertura, se afastam de explosões, comunicam chegada de veículos.  
**Tanques:** apontam torre independente do casco, recuam se muito perto, usam linha de visão.  
**Drones:** orbitam em altitude, mantêm distância, mergulham quando jogador não está olhando.  
**Helicópteros:** entram por trajeto previsível, pairam, saem em emergência e deixam janela para arremesso.

### 9.3. Leitura dos ataques

- Luz vermelha/laser de mira indica tiro forte em até 1 s.
- Animação de preparar arma indica janela para interromper.
- Som distinto para míssil, pulso elétrico e projétil básico.
- Área de perigo no chão só para ataques críticos (não poluir HUD).
- Inimigo deve alternar tática quando jogador repete o mesmo combo.

### 9.4. Diretor dinâmico de combate

Orçamento de ameaça por setor e missão. Exemplo: patrulha 4 pontos; tanque 7; drone 3; helicóptero 10. A composição sobe gradualmente e mantém máximo simultâneo por plataforma. **Nada de spawn infinito colado ao jogador**; unidades aparecem em locais visíveis e plausíveis (cruzamento, base, borda do bairro), com sinalização antes de entrar.

---

## 10. CHEFES — DESIGN COMPLETO

### 10.1. Chefe 1 — Colosso de Aço (aperfeiçoar o atual)

**Arena:** cruzamento com emissor norte e sul. **Etapas:**

1. Tanque protegido: escudos ligados; dano frontal quase inútil. HUD mostra `ESCUDOS 0/2`.
2. Jogador destrói 2 geradores com ataques, carros ou golpes aéreos.
3. Chefe perde barreira e passa a disparar salvas, avançar com esteira e mirar o solo.
4. Ao chegar a 25% de vida, torre gira mais rápido mas abre a traseira após tiros pesados.
5. Finalização opcional: salto sobre torre e esmagamento do canhão.

**Falhas proibidas:** chefe encolher depois do spawn; agarrão comum ignorar escudo; ataques sem aviso; câmera atravessar veículo; boss sumir sem explosão/feedback.

### 10.2. Chefe 2 — Sentinela do Viaduto

Robô de captura com corrente magnética e ataques de agarrão. Fase 1: lança cabos; fase 2: quebra suportes; fase 3: alterna ataques curtos e raios; vulnerável após investida fracassada. Arena deve oferecer carros como munição.

### 10.3. Chefe 3 — Falcão de Guerra

Helicóptero gigante com dois módulos de mísseis, varredura horizontal, lança-drones e retirada temporária. Jogador usa superpulo e arremessos. Nunca exigir precisão impossível da câmera.

### 10.4. Chefe 4 — Titã Anti-Gama

Exoesqueleto alto com escudo frontal, pancada terrestre, onda de choque circular e 2 fases de carga. Vence-se por esquiva, quebra de pernas/geradores e contra-ataque contextual.

### 10.5. Chefe final — Ômega: Protocolo de Contenção

Máquina experimental numa usina desativada. **Três fases distintas**:

- F1: destruir 3 baterias externas enquanto desvia de disparos de longo alcance.
- F2: usar carros/blocos para expor o núcleo; teto e paredes colapsam em eventos roteirizados.
- F3: chefe persegue em área parcialmente destruída; golpes são mais rápidos, mas há pausas telegráficas; final exige sequência aprendida de salto + palmada + impacto.

Após vitória: cinemática curta, escape antes do colapso e tela real de encerramento/créditos. Não finalizar só com modal genérico.

---

## 11. CIDADE SEMIABERTA — MAPA E ARTE

### 11.1. Quatro distritos

| Distrito | Visual | Ameaças | Mecânica contextual |
|---|---|---|---|
| Centro Financeiro | prédios altos, letreiros, cruzamentos | drones, torres, tanque | escalada e salto entre telhados |
| Zona Industrial | fábricas, tubulações, contêineres | máquinas, blindados | objetos pesados e explosões de cadeia |
| Bairro Residencial | casas baixas, parques, escola/abrigo | patrulhas e capturas | defesa e proteção |
| Porto Militar / Usina | guindastes, navios, silos, instalação elétrica | elite, helicópteros, chefes | puzzles simples de destruição |

**Continuidade:** ao mudar de distrito, usar corredores/ruas/viadutos reais; portas de carga, pontes ou cutscenes curtas podem mascarar carregamento de assets sem travamento.

### 11.2. Melhorias visuais prioritárias

- PBR estilizado e coerente (materiais de concreto, asfalto, metal, vidro); sem tentar fotorealismo pesado.
- Calçadas, sarjetas, bueiros, faixas e sinais corretamente alinhados à rua.
- Prédios com variedade de fachadas, letreiros, sacadas, ar-condicionados e desgaste.
- Veículos com formas identificáveis; janelas, rodas, cabine, carroceria e luzes.
- Efeitos de pneus, poeira, fumaça e pequenas faíscas só próximos do jogador.
- Céu com variação de hora por missão: manhã, tarde dourada, noite e clima nublado.
- Luz volumétrica falsificada por sprites/partículas; sombras dinâmicas apenas em área prioritária.
- Marcação de distância e marcos visuais para o jogador se orientar sem depender só do minimapa.
- Água animada de custo baixo no porto; objetos distantes com LOD e impostores.

### 11.3. Câmera cinematográfica controlável

Três modos: **padrão** (aventura); **combate** (um pouco mais próxima, alvos visíveis); **colosso** (mais baixa para mostrar tamanho e impacto). Evitar transições intrusivas, respeitar bloqueio da câmera, impedir clipping no teto e oferecer opção de desligar tremor.

---

## 12. CAMPANHA NARRATIVA — 12 MISSÕES

**Premissa proposta:** após um incidente de energia gama, uma força militar ativa o **Protocolo Ômega** para controlar a cidade. O protagonista tenta quebrar o cerco, impedir um desastre de reator e proteger áreas de evacuação. Novos capítulos expandem os seis já implementados, sem apagar seu conteúdo.

### ATO I — DESPERTAR (1–4)

| Nº | Missão | Objetivo principal | Evento / mecânica | Condição de conclusão |
|---|---|---|---|---|
| 01 | **Sinal na Cidade** (existente) | Derrubar 3 bloqueadores | tutorial de soco e radar | 3/3 bloqueadores |
| 02 | **Comboio Blindado** (existente) | Parar 3 transportes móveis | agarrar/lancar carros | 3/3 transportes |
| 03 | **Último Abrigo** (existente) | Proteger evacuação durante 28 s | impedir projéteis no abrigo | temporizador e integridade > 0 |
| 04 | **Caçada nos Telhados** (existente) | Desativar 3 repetidores | escalada, superpulo e captura de 2 s | 3/3 repetidores |

**Cutscene de abertura:** 25–40 s; panorâmica do centro, sirenes, comunicação militar e personagem chegando. Intro deve poder ser pulada.  
**Fim do ato:** mensagem revela que os repetidores apenas guiavam uma defesa mais pesada.

### ATO II — CONTENÇÃO (5–8)

| Nº | Missão | Objetivo principal | Evento / mecânica | Condição de conclusão |
|---|---|---|---|---|
| 05 | **O Colosso de Aço** (existente) | Destruir 2 escudos e chefe-tanque | boss multifase | escudos desligados + chefe vencido |
| 06 | **Núcleo de Sobrecarga** (existente) | Destruir 3 capacitores + núcleo em 160 s | corrida contra o tempo | núcleo destruído antes do limite |
| 07 | **Caos no Viaduto** (nova) | Abrir caminho e derrotar a Sentinela | pontes fraturadas, investida | travessia aberta + boss vencido |
| 08 | **Céus Hostis** (nova) | Derrubar 2 helicópteros e interceptar comando aéreo | contra-ataques aéreos | alvos destruídos + zona segura |

**Transição narrativa:** o reator foi neutralizado, mas o comando por trás do cerco continua ativo.  
**Fim do ato:** surge o local da usina principal e o equipamento Anti-Gama.

### ATO III — PROTOCOLO ÔMEGA (9–12)

| Nº | Missão | Objetivo principal | Evento / mecânica | Condição de conclusão |
|---|---|---|---|---|
| 09 | **Linha de Evacuação** (nova) | Abrir 3 rotas e escoltar transportes | proteção dinâmica sem destruir aliado | transporte-chave alcança saída |
| 10 | **Titã Anti-Gama** (nova) | Desativar 2 torres e derrotar exoesqueleto | contragolpes e escalada na arena | chefe vencido |
| 11 | **A Última Fortaleza** (nova) | Invadir complexo e desligar rede | combate pesado, 4 objetivos variáveis | portas do núcleo liberadas |
| 12 | **O Fim do Protocolo** (nova) | Vencer Ômega em 3 fases e escapar | todas habilidades combinadas | chefe + extração + cutscene final |

### 12.1. Conteúdo secundário

- **Intervenção urbana:** neutralizar patrulha antes que dispare contra abrigo (recompensa XP/vida).
- **Caça ao comboio:** alcançar três caminhões sem derrubar prédios protegidos.
- **Desafio de destruição:** destruir estrutura militar em tempo-limite, pontuação arcade.
- **Travessia de telhados:** rota de mobilidade e cronômetro.
- **Proteção de antena:** eliminar drones sem danificar o equipamento.
- **Treinamento gama:** arenas de movimentos e combos para desbloquear medalhas.

Cada atividade tem `id`, condição objetiva, limite opcional, recompensa, cooldown de repetição e status de save. Ao concluir, não respawna infinitamente para gerar XP.

### 12.2. Dificuldades

- **Fácil:** mais HP e janela maior de contra-ataque; menos densidade de inimigos.
- **Normal:** balanço de referência.
- **Difícil:** inimigos mais coordenados, sem aumento absurdo de vida.
- **Destruição Livre:** modo pós-campanha sem timers e com reinício do bairro.

---

## 13. PROGRESSÃO, SAVE, CONTINUAÇÃO E RECOMPENSAS

### 13.1. Progressão

XP por missão, proteção, objetivos bônus e combos variados. Recompensas equilibradas: medalhas bronze/prata/ouro por tempo, dano evitado e variedade de movimentos. **Não travar o progresso da campanha atrás de ranking.**

### 13.2. Save local versionado

Contrato sugerido:

```json
{
  "schemaVersion": 3,
  "slot": 1,
  "updatedAt": "2026-11-10T00:00:00.000Z",
  "campaign": {"highestUnlocked": 1, "currentMission": 1, "completed": []},
  "player": {"level": 1, "xp": 0, "skillPoints": 0, "unlocks": []},
  "settings": {"quality": "auto", "music": true, "sound": true, "shake": 0.6},
  "stats": {"kills": 0, "buildingsDestroyed": 0, "bestCombo": 0}
}
```

*Exemplo de esquema, não save exportado do jogo atual.* Usar IndexedDB ou localStorage com tratamento de erro, cópia de segurança e migração por versão. Salvar ao terminar missão e ao comprar habilidade; salvar durante missão apenas checkpoints seguros. Permitir **exportar/importar JSON**, resetar slot com confirmação e recuperar de save corrompido sem tela preta.

### 13.3. Derrota e reinício

Menu: `CONTINUAR DO CHECKPOINT`, `REINICIAR MISSÃO`, `VOLTAR AO MENU`. Ao reiniciar missão, reconstruir objetivos, prédios e inimigos do snapshot sem duplicar eventos, materiais ou áudio. Preservar upgrades comprados. Se save inválido, oferecer nova campanha sem apagar arquivo automaticamente.

---

## 14. MENUS, HUD, UX E ACESSIBILIDADE

### 14.1. Menu principal

Câmera orbitando personagem com cidade ao fundo (LOD baixo, loop leve), logo, `Continuar`, `Nova campanha`, `Selecionar missão`, `Destruição livre`, `Treinamento`, `Opções`, `Créditos`. Botões com estado hover/focus/gamepad, sem depender exclusivamente de mouse.

### 14.2. HUD durante jogo

- Superior esquerdo: vida, fúria e indicador compacto de ataque especial.
- Centro superior: título da missão, objetivo atual e progresso.
- Superior direito: minimapa com ícones de ameaça, aliados e objetivos.
- Próximo ao personagem: combo, dano e sinal de carregamento do pulo.
- Inferior direito: quatro habilidades equipadas e cooldowns; ícones de dispositivo correto.
- Avisos para telegraphs: fora do centro do campo de visão, sem cobrir o personagem.
- Em boss: barra grande com nome, escudo, fases e janela de vulnerabilidade.

### 14.3. Opções

Gráficos (baixo/médio/alto/automático), resolução, sombras, efeitos, limite de FPS, distância de visão, volume geral/música/efeitos, invert eixo Y, sensibilidade da câmera, vibração, tremor de câmera, intensidade de flashes, velocidade de texto, fonte ampliada e legendas de efeitos críticos.

### 14.4. Cenas e encerramento

- Abertura com título e incidente urbano.
- Briefing de missão de 10–20 s, pulável.
- Entrada cinematográfica de cada chefe, pulável e sem impedir carregamento.
- Encerramento com vitória, resgate e destruição de usina; créditos completos de arte, modelo e som.
- Pós-créditos libera `Destruição Livre` e desafios avançados.

---

## 15. ÁUDIO E TRILHA SONORA

### 15.1. Situação atual

O repositório já inclui `assets/audio/*.ogg` (`music`, `ambience`, `punch`, `slam`, `roar`, `throw`, `collapse` etc.) e `src/audio.js` com Web Audio API, volume, mute, música e fallback opcional. **Preservar OGG real**: não trocar os efeitos por bipes sintéticos sem justificativa.

### 15.2. Plano de áudio

| Situação | Música / efeito | Regras |
|---|---|---|
| Menu | tema grave, tenso e energético | loop sem click, volume baixo |
| Exploração | ambiente de cidade, vento, sirenes distantes | mix por distância |
| Patrulha | percussão leve | transição suave |
| Combate | batidas mais fortes e cordas tensas | camadas sem reiniciar música |
| Chefe | tema específico por fase | transição em tempo musical |
| Superpulo | impulso, vento, pouso com graves | intensidade por altura |
| Destruição | estilhaço/metal/concreto, subgrave | variação por material |
| Vitória | fanfarra curta | ducking da trilha |
| Derrota | som grave e silêncio breve | sem loop bugado |

**Implementação:** roteamento `Master / Music / SFX / Ambience / UI`, pooling de fontes, limite de sons simultâneos, reprodução 3D para explosões distantes e `ducking` durante falas/briefing. Respeitar autoplay: iniciar AudioContext no clique `Jogar`. Normalizar volumes por categoria. Exigir licença e créditos para qualquer nova trilha.

---

## 16. OTIMIZAÇÃO DE THREE.JS — METAS E TÉCNICAS

### 16.1. Metas (a medir em equipamento real)

| Perfil | Meta de FPS | Orçamento/frame | Prioridade |
|---|---:|---:|---|
| PC médio com GPU dedicada | 60 | 16,7 ms | gráficos alto/médio |
| Notebook com GPU integrada | 30 estáveis | 33,3 ms | médio/baixo |
| Android intermediário (futuro) | 30 estáveis | 33,3 ms | baixo/touch |

Metas de projeto, **não medições obtidas**. Registrar p50/p95 de tempo de frame, chamadas de desenho, triângulos, memória JS, objetos ativos e tempo de carregamento.

### 16.2. Estratégia

1. **LOD em 3 níveis:** personagem/inimigo próximo completos; média distância reduz polígonos/materiais; fundo usa low poly/impostor.
2. **InstancedMesh:** postes, janelas, árvores e peças urbanas repetidas. Usar matrizes individuais; manter instâncias destrutíveis como entidades especiais quando próximas.
3. **Grade espacial:** hash 2D por células de 16–32 m para consultas de prédio, carro, projétil e área de ataque.
4. **Pooling:** explosões, poeira, projéteis, indicadores, fragmentos pequenos e sons.
5. **Sombras:** uma luz solar principal, resolução por preset; reduzir castShadow de objetos distantes.
6. **Texturas:** atlas por distrito, mipmaps, formatos WebP/KTX2 quando suportados; evitar criar uma textura por prédio único.
7. **Cenário em chunks:** carregar malhas por distrito com antecedência e descarregar as distantes sem quebrar missão/save.
8. **GLB:** manter modelo do jogador e usar cópias simplificadas apenas se necessário para cutscenes/visualizações.
9. **Física:** rigid bodies aproximados apenas no raio próximo; destroços distantes tornam-se estáticos.
10. **Render adaptativo:** preservar sistema atual e melhorar histerese para que resolução não oscile a cada amostra.
11. **Sem garbage collection por frame:** minimizar `new Vector3()`, novas geometrias e materiais no loop.
12. **Acessibilidade de performance:** limitar efeitos cosméticos sem afetar colisão, dano ou IA.

### 16.3. Orçamentos iniciais de projeto

- Partículas visíveis: 80/140/220 (baixo/médio/alto), ajustáveis.
- Fragmentos físicos ativos: 25/55/100; estáticos separados.
- Luzes com sombras: 1 no nível médio; efeitos de iluminação local sem sombra.
- Inimigos simultâneos: 6/10/15, de acordo com dispositivo.
- Máximo de texturas 4K: zero no perfil baixo; preferir atlas 1K/2K quando possível.
- Simulação de IA distante: 2–5 Hz, interpolação visual; perto, 10–30 Hz conforme necessidade.

**Os números acima são limites de planejamento, sujeitos a medição.**

### 16.4. Offline e deploy

O HTML atual importa Three.js 0.186.1 via CDN. Para PWA/offline verdadeiro: armazenar arquivos JS necessários sob `vendor/`, fixar versões, atualizar importmap, configurar `manifest.webmanifest` e `service-worker.js`, versionar cache, permitir atualização automática segura e testar sem rede após a primeira instalação. GitHub Pages continua servindo o jogo normalmente online.

---

## 17. ARQUITETURA ALVO — EVOLUIR SEM QUEBRAR

### 17.1. Estrutura sugerida

```text
Hulk-Smash/
├── index.html
├── manifest.webmanifest                 # fase offline
├── service-worker.js                    # fase offline
├── assets/
│   ├── audio/                           # OGG existentes, preservar
│   ├── models/hulk.glb                  # preservar arquivo original
│   ├── models/enemies/                  # novos modelos validados
│   ├── textures/                        # atlas e decalques
│   └── ui/                              # ícones WebP/SVG próprios
├── src/
│   ├── main.js                          # bootstrap, cena, loop
│   ├── game.js                          # fachada/compatibilidade temporária
│   ├── core/                            # clock, eventos, estado, saves
│   ├── player/                          # movimento, estados, input
│   ├── combat/                          # ataques, acertos, agarrões
│   ├── powers/                          # habilidades e balanceamento
│   ├── animation/                       # mixer, IK, animação de evento
│   ├── ai/                              # estados, percepção, comportamento
│   ├── world/                           # distritos, streaming, destruição
│   ├── missions/                        # diretor e dados das 12 missões
│   ├── ui/                              # HUD, minimapa, menu, opções
│   ├── audio.js                         # preservar e ampliar
│   ├── physics.mjs                      # preservar como kernel
│   ├── structural.mjs                   # preservar como kernel
│   ├── avatar.js                        # preservar carregador
│   └── style.css
├── tests/
│   ├── unit/                            # regras puras
│   ├── integration/                     # gameplay e progressão
│   ├── browser/                         # WebGL automatizado
│   └── performance/                     # budgets
├── docs/
│   ├── HULK_SMASH_CITY_GDD_COMPLETO_EXPANSAO_v3_0.md
│   ├── CHANGELOG.md
│   └── QA-MATRIX.md
└── package.json                         # scripts de teste/build
```

Não mover todos os arquivos em um único commit. Criar módulos por fatias mantendo caminhos e testes antigos; deixar os existentes funcionando até a migração de cada responsabilidade.

### 17.2. Interfaces de sistema

```js
// Pseudocontratos sugeridos — não são APIs existentes.
AttackSystem.request({ actorId, moveId, targetId, inputTime });
AttackSystem.onHitFrame({ attackId, origin, direction, hitbox });
DamageSystem.apply({ targetId, amount, kind, impulse, sourceId });
DestructionSystem.hit({ objectId, point, normal, impulse, type });
MissionDirector.onEvent({ type, actorId, targetId, value });
SaveManager.commit({ slot, checkpoint, player, campaign });
```

Eventos essenciais: `ATTACK_HIT`, `OBJECT_DAMAGED`, `OBJECT_DESTROYED`, `ENEMY_STUNNED`, `ENEMY_DEFEATED`, `CIVILIAN_RESCUED`, `MISSION_OBJECTIVE_CHANGED`, `MISSION_COMPLETED`, `CHECKPOINT_REACHED`.

### 17.3. Configuração por dados

Separar das rotinas: `powers.config.mjs`, `enemies.config.mjs`, `missions.config.mjs`, `render-quality.config.mjs`. Valores de dano/cooldown, parâmetros de IA e objetivos devem ser testáveis e auditáveis sem procurar números por `game.js`.

---

## 18. PLANO DE IMPLEMENTAÇÃO POR PRIORIDADE

### FASE P0 — estabilidade e consistência do jogo atual

- [ ] Auditar se Pages está servindo v2.0 e mostrar versão no menu.
- [ ] Corrigir escala do chefe no `updateEnemies` usando `baseScale`.
- [ ] Proibir agarrar boss protegido (ou regra específica pós-escudo).
- [ ] Sincronizar dano de `slam()` à animação.
- [ ] Reproduzir os 6 objetivos reais no navegador com WebGL.
- [ ] Confirmar menus, sons, HUD, câmera e 2 partidas consecutivas sem reiniciar a aba.
- [ ] Instrumentar `window.__HULK_DIAGNOSTICS` com identificador de build, missão, FPS e erros.
- [ ] Testar tela de erro e fallback do GLB.

**Aceite P0:** seis fases completáveis do começo ao fim, sem travamentos, sem bypass do boss, sem perdas de controles; resultados com vídeos/logs e hardware identificados.

### FASE P1 — combate, animações e sensação de peso

- [ ] Implementar eventos de hit frame em golpes principais.
- [ ] Melhorar transições das pernas, quadril, braços e dedos.
- [ ] Corrigir mãos/pés em escalada e objeto agarrado.
- [ ] Criar reações de dano por direção e peso.
- [ ] Introduzir pisão e investida, com testes.
- [ ] Melhorar telegraphs dos tanques/drones e primeiros 2 inimigos novos.
- [ ] Colocar HUD de cooldown, armadura e boss.

**Aceite P1:** nenhum dano antes do contato, nenhuma deformação grave do personagem, combo e agarrão verificáveis por teste visual.

### FASE P2 — cidade, destruição, campanha e save

- [ ] Setorizar os bairros com marcos visuais e pools de objetos.
- [ ] Inserir dano localizado e novos tipos de destruição.
- [ ] Adicionar 4 novas missões (07–10) mantendo 01–06.
- [ ] Criar 2 chefes específicos com arenas e mecânicas reais.
- [ ] Implementar save/checkpoint e menu de capítulos.
- [ ] Adicionar progressão de habilidades e treinamento.
- [ ] Implementar Gamepad API, botões e ícones adaptativos.

**Aceite P2:** sair e voltar ao jogo preserva evolução; 10 missões completas; sem regressão de física e desempenho.

### FASE P3 — campanha final e lançamento

- [ ] Missões 11 e 12, chefe Ômega e escape.
- [ ] Intro, cutscenes, encerramento e créditos.
- [ ] Trilha dinâmica e sons por material, áudio licenciado.
- [ ] Polimento de menu/HUD/efeitos; opções de acessibilidade.
- [ ] PWA offline com Three.js local, testes de atualização.
- [ ] Otimização em 3 perfis e relatório de performance.
- [ ] Teste de campanha completa em desktop + regressão automatizada.

**Aceite P3:** 12 missões vencíveis em sequência, derrota/reinício/save sem falhas, qualidade gráfica configurável e build reproduzível.

---

## 19. PLANO DE TESTES E CERTIFICAÇÃO

### 19.1. Testes unitários

- `chargedJumpSpeed`, `landingHeight`, `findClimbWall`: saltos e telhados.
- `moveCircleSlide`/`segmentAABB2D`: colisões em alta velocidade e cantos.
- `heavyHitCrossed` e eventos: dano uma vez por hit frame.
- `grabEligible`: impedir boss protegido, morto ou fora do alcance.
- `impactKnockback`: resistência por classe, sem NaN.
- `dentPose`: deformação progressiva consistente.
- `towerSections`/`advanceStructuralBody`: queda e limite de corpos.
- `chapterComplete`: seis missões antigas e seis novas.
- `SaveManager`: migração, corrupto, perda de quota, import/export.
- `QualityManager`: mudança de perfil durante cena com FX ativos.

### 19.2. Fluxos end-to-end essenciais

| ID | Cenário | Aprovação |
|---|---|---|
| E2E-01 | Abrir no GitHub Pages | sem erro de import/GLB |
| E2E-02 | Clicar iniciar e andar 60 s | nenhum freeze, câmera estável |
| E2E-03 | Usar cada comando | dano/pose/cooldown corretos |
| E2E-04 | Escalar 3 prédios e saltar | sem atravessar parede |
| E2E-05 | Agarrar e arremessar carro | objeto segue mão e colide |
| E2E-06 | Agarrar tanque comum | funciona, sem teleporte |
| E2E-07 | Tentar agarrar chefe com escudo | ação negada/feedback claro |
| E2E-08 | Destruir 10 prédios | sem explosão de memória/FPS |
| E2E-09 | Concluir as missões 01–06 | objetivos reais verificáveis |
| E2E-10 | Morrer na missão 05 e continuar | checkpoint correto |
| E2E-11 | Completar a campanha 12/12 | cinema e créditos corretos |
| E2E-12 | Reiniciar jogo 3 vezes | sem objetos duplicados |
| E2E-13 | Desativar som, música, mudar volume | ajustes persistem |
| E2E-14 | Perder WebGL e recarregar | mensagem útil/recuperação |
| E2E-15 | Instalar PWA e desconectar rede | inicia offline após cache |
| E2E-16 | Controle Xbox/PS | todos botões funcionam |
| E2E-17 | 30 minutos combatendo | sem crescimento anormal de heap |
| E2E-18 | Testar 1280×720, 1920×1080, ultrawide | HUD e câmera sem corte |

### 19.3. Relatório obrigatório por versão

`data/hora`, `commit SHA`, navegador, sistema, GPU, resolução, missão, tempo jogado, FPS médio/p95 frame, chamadas de desenho, número máximo de corpos, logs, screenshots, vídeos, casos reproduzidos, casos declarados e pendências. **Nunca** usar “jogo zerado/validado” apenas porque testes unitários passaram.

### 19.4. Procedimento de CI recomendado

```bash
# Necessário adicionar package.json e instalar ambiente de desenvolvimento.
node --check src/game.js
node --check src/avatar.js
node --test tests/*.test.mjs tests/*.test.cjs
# Segunda etapa: Playwright/Chromium em máquina CI com WebGL disponível.
# Terceira etapa: smoke test de GitHub Pages após publicação.
```

O comando acima indica caminho para QA e **não** é registro de teste executado nesta auditoria.

---

## 20. POLÍTICA DE RELEASE E GITHUB PAGES

- Branch de trabalho por mudança; commits pequenos e descrição de impacto.
- Preservar `assets/models/hulk.glb` e OGG; verificar integridade e créditos.
- Empacotar somente arquivos necessários, sem dumps temporários ou logs gigantes.
- Atualizar versão do HTML, imports com cache bust consistente e changelog.
- CI unitário obrigatório antes de publicar.
- Depois da publicação, rodar smoke test real e comparar a versão servida no Pages com a versão esperada.
- Regressão manual das fases 1, 3, 5 e 6 em toda alteração estrutural.
- GDD fica em `docs/`, atualizado conforme os recursos forem implementados.

### 20.1. Definição de pronto

Uma funcionalidade só recebe status **IMPLEMENTADA** se houver código integrado e teste unitário pertinente; **VALIDADA** requer também teste real em navegador/controle; **PUBLICADA** requer confirmação do GitHub Pages. Essas três situações não são equivalentes.

### 20.2. Regra de desenvolvimento nas próximas interações

Ao receber **“próxima”**, trabalhar no item aberto de maior prioridade: primeiro P0, depois P1, P2 e P3; revisar o estado atual do repositório antes de editar; preservar conquistas anteriores; entregar lista concreta de arquivos modificados, evidências de testes, impactos em outras missões e pendências.

---

## 21. BACKLOG INICIAL DE TAREFAS ATÔMICAS

| Ordem | ID | Mudança | Arquivos de partida | Verificação |
|---|---|---|---|---|
| 1 | HSC-001 | Publicação Pages v2.0 consistente | `index.html`, deployment | ler versão no site |
| 2 | HSC-002 | Boss retém escala base | `src/game.js` | simular 100 frames e reação |
| 3 | HSC-003 | Proteção contra agarrão indevido do boss | `src/combat.mjs`, `src/game.js` | teste de boss escudado |
| 4 | HSC-004 | Dano de impacto no hit frame | `src/game.js`, `src/avatar-poses.mjs` | frame exato, 1 hit |
| 5 | HSC-005 | Certificar seis missões originais | `tests/`, logs | campanha rodada |
| 6 | HSC-006 | Save/checkpoint básico | `src/core/save*`, UI | recarregar na mesma fase |
| 7 | HSC-007 | Primeira melhoria de IK de escalada | `src/avatar.js`, `src/contact-ik.mjs` | mãos na fachada |
| 8 | HSC-008 | Investida/pisão com recarga | `src/powers/`, combate | interrupção de alvo |
| 9 | HSC-009 | Grid espacial de colisão | `src/physics.mjs`, mundo | p95 não piora |
| 10 | HSC-010 | Minichefe e inimigos variados | `src/ai/`, `src/missions/` | telegraphs/derrota |
| 11 | HSC-011 | Quatro distritos e LOD | `src/world/`, assets | travessia sem pop grave |
| 12 | HSC-012 | Missões 07–10 | `src/campaign.mjs`, diretor | objetivos completos |
| 13 | HSC-013 | Controles gamepad | `src/player/input*`, HUD | Xbox/PS testados |
| 14 | HSC-014 | Missões 11–12 e final | campanha, chefes, cinema | finalização certificada |
| 15 | HSC-015 | Offline e perfis de qualidade | `vendor/`, SW, configuração | teste desconectado |

---

## 22. REFERÊNCIAS INTERNAS EXAMINADAS

- [`index.html`](https://github.com/jogoiarexx-blip/Hulk-Smash/blob/main/index.html): menu, controles, importmap e versão.
- [`src/game.js`](https://github.com/jogoiarexx-blip/Hulk-Smash/blob/main/src/game.js): cenário, combate, IA, diretor, HUD, inicialização e loop.
- [`src/powers.mjs`](https://github.com/jogoiarexx-blip/Hulk-Smash/blob/main/src/powers.mjs): superpulo, parede, telhado e palmada.
- [`src/combat.mjs`](https://github.com/jogoiarexx-blip/Hulk-Smash/blob/main/src/combat.mjs): agarrão, arremesso, knockback.
- [`src/campaign.mjs`](https://github.com/jogoiarexx-blip/Hulk-Smash/blob/main/src/campaign.mjs): seis missões e regras de conclusão.
- [`src/avatar.js`](https://github.com/jogoiarexx-blip/Hulk-Smash/blob/main/src/avatar.js): carregamento GLB, mixer, IK e atualização do esqueleto.
- [`src/avatar-poses.mjs`](https://github.com/jogoiarexx-blip/Hulk-Smash/blob/main/src/avatar-poses.mjs): curvas de pose e estados.
- [`src/physics.mjs`](https://github.com/jogoiarexx-blip/Hulk-Smash/blob/main/src/physics.mjs): geometria de colisão.
- [`src/structural.mjs`](https://github.com/jogoiarexx-blip/Hulk-Smash/blob/main/src/structural.mjs): fragmentação e colisão dos destroços.
- [`src/deformation.mjs`](https://github.com/jogoiarexx-blip/Hulk-Smash/blob/main/src/deformation.mjs): amassamento de veículos.
- [`src/audio.js`](https://github.com/jogoiarexx-blip/Hulk-Smash/blob/main/src/audio.js): motor de som.
- [`TESTES-E-LIMITACOES-v2.0.md`](https://github.com/jogoiarexx-blip/Hulk-Smash/blob/main/TESTES-E-LIMITACOES-v2.0.md): limitações declaradas de validação.
- [`CREDITOS-MODELO.txt`](https://github.com/jogoiarexx-blip/Hulk-Smash/blob/main/CREDITOS-MODELO.txt): licença/atribuição do modelo GLB.

---

## 23. CONCLUSÃO DE DIREÇÃO

**A melhor próxima versão não deve aumentar o mapa ou adicionar dezenas de golpes antes de consolidar o que já existe.** O caminho recomendado é: publicar corretamente a build atual, corrigir as duas inconsistências concretas de chefe, alinhar dano e animação, certificar as seis fases, salvar progresso e **só então** abrir novos distritos, inimigos, poderes e missões.

**Resultado almejado:** HULK: SMASH CITY como uma aventura 3D completa, com grande sensação de força, cidade reativa, cinco chefes principais, doze missões, evolução de habilidades, menu e créditos, alta rejogabilidade e performance configurável — sem abandonar a base atual de Three.js e do modelo GLB.
