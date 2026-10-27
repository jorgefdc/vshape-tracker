# Avatar humano 3D — protótipo isolado

## Estado
A versão pública V13 continua em `main`. Esta branch apenas prepara o adaptador de modelos GLB. **Nenhum novo modelo 3D foi adquirido, criado ou publicado.**

## Objetivo
Substituir a geometria corporal procedural por uma malha humana contínua, com topologia adequada, tons de pele e morph targets para medidas corporais. Manter a visualização Atual × Meta e rotação 360°.

## Pipeline
1. Criar ou selecionar um modelo humano legalmente utilizável em produto comercial (ex.: MakeHuman, conferindo licença do modelo, cabelo, roupas e texturas individualmente).
2. Refinar no Blender: proporções, topologia, UVs, materiais, ombros, junção pelve-pernas, mãos e pés.
3. Criar shape keys com nomes exatos: `shoulder_width`, `chest_size`, `waist_size`, `hip_width`, `arm_size`, `thigh_size`, `calf_size`.
4. Exportar GLB com morph targets. Otimizar tamanho e testar em celular.
5. Armazenar em `public/models/human-male.glb` e testar o adaptador `src/avatar/loadHumanModel.js`.
6. Calibrar a relação entre medidas em cm e shape keys usando malhas e medidas de referência. A conversão atual é provisória, não reconstrução anatômica validada.
7. Implementar modo experimental no app, com fallback para a V13. Só promover após validação visual e de desempenho.

## Critérios de aceitação
- Corpo contínuo sem emendas artificiais em ombros, quadris e pernas.
- Rotação completa e bom desempenho em celular.
- Medidas de ombro, peito, cintura, quadril, braço, coxa e panturrilha produzem mudanças coerentes.
- Pele, músculos e roupas com materiais corretos; sem anatomia vermelha projetada sobre pele.
- Comparação Atual × Meta com dois modelos e controle independente de medidas.
- Sem dependência de servidor pago.

## Arquivos adicionados
- `src/avatar/shapeMapping.js`: mapeamento inicial de medidas para morph targets.
- `src/avatar/loadHumanModel.js`: carregamento de GLB e aplicação dos morph targets.

Nenhum arquivo da V13 é modificado nesta etapa.
