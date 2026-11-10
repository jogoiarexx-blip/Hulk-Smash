# Hulk Smash City v2.4 — checkpoints, gamepad e IA

Atualizado em 10/11/2026. O arquivo original `assets/models/hulk.glb`, os sistemas de destruição e as seis missões permanecem preservados.

## Salvamento local automático
- O jogo cria um **checkpoint ao concluir uma missão**, antes de começar a próxima. Só salva a fase que será iniciada, vida, fúria, pontuação e contadores.
- O botão **CONTINUAR CAMPANHA** restaura o checkpoint no mesmo navegador/dispositivo; objetos da nova fase são regenerados para evitar objetivos incompletos ou inimigos duplicados.
- **NOVA CAMPANHA** remove o checkpoint anterior. Ao morrer, o botão de reinício usa o checkpoint, se existir.
- Ao terminar as seis missões, o checkpoint é limpo para permitir nova campanha.
- Armazenamento local pode estar bloqueado em modo privado ou permissões restritas: o jogo continua funcionando, mas sem persistência. Não há salvamento em nuvem nem salvamento instantâneo dentro de uma fase.

## Controle Xbox/PlayStation
- Analógico esquerdo = movimento proporcional; analógico direito = câmera.
- **A / ✕** = carregar e soltar pulo; **X / □** soco; **B / ○** agarrar; **Y / △** pegar/lançar carro.
- **LB / L1** palmada; **RB / R1** impacto; **LT / L2** esmagar tanque; **RT / R2** arremesso giratório.
- **View / Share** golpe duplo; **Start / Options** pausar/continuar (no menu inicia ou continua campanha); **L3** correr; **R3** fúria; **direcional para cima + analógico** escalar.
- Navegadores exigem o layout **standard** da API Gamepad. Compatibilidade e vibração variam conforme navegador/driver. Teclado e mouse seguem operacionais.

## Inimigos táticos
- Tanques se aproximam quando longe, tentam manter distância útil de tiro e contornam lateralmente em distância média.
- Drones orbitam/flanqueiam e recuam quando o Hulk chega muito perto. IA continua respeitando atordoamento.
- Defesa do abrigo preserva prioridade do alvo e não obriga recuo dos tanques que estão atacando o abrigo.
- Disparos deixam de atravessar prédios intactos: linha de visão checada antes de criar projétil. Recargas usam pequenos intervalos de tentativa quando obstruídas.
- Apenas orientação e movimento foram alterados; quantidade de inimigos e condições de vitória não foram modificadas.

## QA
Novos módulos puros: `src/progress.mjs`, `src/gamepad.mjs`, `src/enemy-ai.mjs`.
Novos testes: `tests/progression-gamepad-ai-v24.test.mjs` e `tests/integration-v24.test.mjs`.
A execução automatizada via Node 22 precisa passar integralmente antes de classificar a versão como validada. Teste manual no navegador com controle físico e WebGL segue pendente.
