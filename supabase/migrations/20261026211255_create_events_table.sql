/*
# Agenda de Compromissos - Tabela de Eventos

1. Novas Tabelas
- `events`
  - `id` (uuid, primary key)
  - `user_id` (uuid, dono do evento, referencia auth.users, default auth.uid())
  - `title` (text, titulo do compromisso)
  - `description` (text, descricao opcional)
  - `date` (date, data do evento)
  - `start_time` (time, horario de inicio)
  - `end_time` (time, horario de termino, opcional)
  - `location` (text, local, opcional)
  - `color` (text, cor para destaque no calendario, default blue)
  - `created_at` (timestamptz)

2. Seguranca
- RLS habilitado na tabela events.
- GRANT CRUD somente para authenticated (app exige login).
- 4 policies (select/insert/update/delete) com checagem de propriedade via auth.uid().
- user_id tem DEFAULT auth.uid() para que inserts sem user_id funcionem.
*/

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  date date NOT NULL,
  start_time time,
  end_time time,
  location text,
  color text NOT NULL DEFAULT 'blue',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON events TO authenticated;

DROP POLICY IF EXISTS "select_own_events" ON events;
CREATE POLICY "select_own_events" ON events FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_events" ON events;
CREATE POLICY "insert_own_events" ON events FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_events" ON events;
CREATE POLICY "update_own_events" ON events FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_events" ON events;
CREATE POLICY "delete_own_events" ON events FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS events_user_id_idx ON events(user_id);
CREATE INDEX IF NOT EXISTS events_date_idx ON events(date);
