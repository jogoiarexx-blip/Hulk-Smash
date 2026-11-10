# Hulk Smash City — REV 2.3: Combate contextual

**Data:** 10 de novembro de 2026. Base existente e arquivo `assets/models/hulk.glb` preservados.

## Recursos implementados
- **T — Esmagar tanque comum:** alcance frontal de 9,5 unidades e altura validada; animação de golpe pesado; dano no fotograma de contato, efeitos visuais/áudio e recarga de 4,5 segundos (2,6 em fúria). Não afeta chefes com escudo.
- **H — Arremesso giratório:** após agarrar um tanque ou drone com G e levantar completamente, o Hulk gira o alvo duas voltas e o lança com maior velocidade. Dano e raio do impacto aumentados, recarga de 5,4 segundos (3,1 em fúria).
- **Reações de impacto:** inclinação de corpo (pitch e roll) proporcional ao golpe, menor para blindados e maior para drones, sem eliminar o knockback ou stun atuais.
- **Animações:** novas poses `tank-crush` e `spin-throw` sobre o mesmo GLB, sem arquivos adicionais.
- **Interface:** dicas e indicadores de recarga T/H; G e E não gastam cooldown se o inimigo ainda não pode ser arremessado.

## Testes
`tests/attack-context-v23.test.mjs` valida alcance, exclusões, boss, giros, reações, fotogramas de contato (30/60/144 FPS), integridade das poses e ligação de HUD.
Suíte Node 22 executada automaticamente no GitHub Actions.

## Limitações
Ainda necessária validação visual no WebGL/GPU real, campanha completa, qualidade de câmera e performance em aparelhos mais fracos.
Próximo ciclo: salvamento, gamepad e expansão da IA.
