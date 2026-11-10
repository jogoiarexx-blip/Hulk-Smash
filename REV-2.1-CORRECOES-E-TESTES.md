# Hulk Smash City — atualização v2.1

Data: 10/11/2026. Base preservada: campanha v2.0, áudio e arquivo original `assets/models/hulk.glb`.

## Implementado
- Escala do chefe fixa em 1,4× inclusive durante a reação a impactos.
- Chefe não pode ser agarrado e arremessado como um tanque comum.
- Escudo do chefe impede dano até a destruição dos dois emissores.
- Golpe no chão: dano sincronizado à pose; salto de impacto: dano na aterrissagem.
- Socos que acertam recebem resposta audiovisual mais forte do que golpes no vazio.
- Identificação visual v2.1 e cache busting dos scripts principais.

## Verificação
- Adicionados testes automatizados de regressão em `tests/boss-impact-v21.test.mjs`.
- Falta executar a campanha completa num navegador WebGL com GPU, checar FPS e verificar a propagação do GitHub Pages.
- O projeto permanece um fan-game e exige atenção aos direitos de propriedade intelectual dos personagens e marcas.

## Próxima etapa sugerida
Transições de animação mais refinadas, salvamento de campanha, novos inimigos e suporte a gamepads.
