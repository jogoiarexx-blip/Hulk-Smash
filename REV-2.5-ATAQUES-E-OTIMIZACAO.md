# Hulk Smash City — REV 2.5: padrões de ataque, alertas e otimização

Data: 10 de novembro de 2026. Mantidas as seis missões, o GLB original e os checkpoints.

## Combate
- Tanques comuns alternam tiro de canhão e salva dupla; drones alternam pulso, leque triplo e dardo rápido. O chefe alterna barragem tripla e tiro de cerco.
- Antes de disparar, os inimigos exibem uma marca temporária no solo do alvo, além do indicador visual de perigo no HUD. A preparação respeita tempo de reação e atordoamento.
- Tiros somente são criados após a janela de preparação, se há linha de visão e capacidade de projéteis; disparos triplos usam dano reduzido por projétil.
- O aviso de trajetória também mede a proximidade de projéteis realmente em movimento; proteção por paredes, pausas e limite de projéteis existentes preservados.

## Otimização visual
- Partículas descartadas passam por **pool de objetos** com máximo de 72 meshes reutilizáveis. Materiais individuais são reconfigurados, evitando criar/destruir dezenas de materiais durante grandes explosões.
- Limite total de partículas mantido em 170; quando esgotado, uma partícula antiga é reconfigurada sem gerar outra malha.
- Efeitos distantes são progressivamente reduzidos quando há muitas partículas, preservando os próximos ao jogador.
- Geometria dos anéis de impacto é compartilhada e não descartada individualmente. A física e os danos continuam sendo processados independentemente da densidade visual.

## Testes
`tests/attack-fx-v25.test.mjs` cobre padrões e volumes de disparo, normalização, alertas, orçamento de partículas e integração.
A suíte Node do GitHub Actions é necessária, e a validação visual e de FPS no navegador WebGL ainda será necessária.
