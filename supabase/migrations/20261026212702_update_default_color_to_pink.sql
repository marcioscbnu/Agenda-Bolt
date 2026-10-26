/*
# Alterar cor padrao dos eventos para pink

1. Modificacoes
- Altera o default da coluna `color` de 'blue' para 'pink'.
- Atualiza eventos existentes com cor 'blue' para 'pink'.
*/

ALTER TABLE events ALTER COLUMN color SET DEFAULT 'pink';

UPDATE events SET color = 'pink' WHERE color = 'blue';
