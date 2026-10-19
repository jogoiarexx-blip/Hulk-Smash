# Validação técnica — HULK v2.0

- Sintaxe JS/MJS: aprovada.
- Testes automatizados com Node 22: **25 casos passaram** (ver TESTES-v2.0.log).
- Integridade original do GLB: SHA-256 idêntico ao arquivo enviado.
- HTTP local: index, script, campanha, GLB e OGG 200.
- Browser Chromium automatizado: falhou em abrir `http://127.0.0.1:8784/` com `net::ERR_BLOCKED_BY_ADMINISTRATOR`. Renderização e partida WebGL reais não validadas.
- Física das missões: colisões simplificadas; caminhões usam geometria de volumes, boss reutiliza o tanque 3D com escudo modular.
- Criação de clipes BVH/FBX não realizada; novas poses são aditivas e calculadas a cada frame nos ossos originais.

## Novos objetivos
1. Destruir 3 transmissores físicos sinalizados no radar.
2. Interceptar 3 caminhões blindados em movimento, que retornam às avenidas.
3. Defender o abrigo por 28 segundos, próximos do objetivo; projéteis inimigos causam danos reais.
4. Escalar para 3 telhados e ficar 2 segundos ao lado dos repetidores.
5. Destruir 2 emissores de escudo e derrotar o comandante (HP 780).
6. Destruir 3 capacitores e o núcleo dentro de 160 segundos.
