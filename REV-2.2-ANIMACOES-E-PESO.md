# Hulk Smash City — REV 2.2: animações e sensação de peso

Data: 10/11/2026. Continuidade v2.1 sem alterar o arquivo original `assets/models/hulk.glb`.

## Melhorias implementadas
- Corrida reforçada: amplitude, peso de passada, balanço dos braços, joelhos, quadris, inclinação do corpo e mãos mais contraídas.
- Socos direcionais: antecipação, torção do tronco, contrarrotação do quadril, inclinação lateral e projeção durante o golpe.
- Levantamento de inimigos: postura de apoio com quadril abaixado, tronco inclinado e braços progressivamente erguidos.
- Aterrissagem: amortecimento proporcional à altura da queda, impacto na postura e poeira na chegada.
- Escalada para telhados recebe pouso mais suave; correção IK evita que os pés resistam à flexão do corpo.
- Corrida rápida gera impacto leve de câmera e partícula de poeira cadenciada com o passo.

## Arquivos atualizados
`src/avatar-poses.mjs`, `src/avatar.js`, `src/game.js`, `index.html`.

## Validação e limitações
`tests/animation-v22.test.mjs`: testes de caminhada/corrida, socos simétricos, levantamento, queda e transições de 720 quadros.
Testes Node 22 no GitHub Actions. **Não substituem validação visual em navegador real com WebGL/GPU**, nem prova de conclusão da campanha.

## Próxima etapa
Ampliar golpes contextuais e reação a colisões, configurar suporte completo a controles e preservar progresso entre sessões.
