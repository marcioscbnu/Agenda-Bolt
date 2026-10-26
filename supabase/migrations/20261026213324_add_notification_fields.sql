/*
# Adicionar campos de notificacao aos eventos

1. Modificacoes na tabela events
- notify (boolean, default false): indica se o cliente deve ser avisado do evento
- notify_minutes (int, default 15): minutos antes do evento para enviar o aviso
- notified (boolean, default false): marca se o aviso ja foi exibido (evita avisos duplicados)

2. Notas
- Todos os campos tem defaults para nao quebrar eventos existentes.
- notified e controlado pelo app: ao exibir o aviso, o app marca notified=true.
*/

ALTER TABLE events ADD COLUMN IF NOT EXISTS notify boolean NOT NULL DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS notify_minutes int NOT NULL DEFAULT 15;
ALTER TABLE events ADD COLUMN IF NOT EXISTS notified boolean NOT NULL DEFAULT false;
