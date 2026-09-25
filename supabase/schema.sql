-- À coller dans le SQL Editor du dashboard Supabase

create table public.taches (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titre text not null,
  colonne text not null check (colonne in ('À faire', 'En cours', 'Terminé')),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index taches_user_id_idx on public.taches (user_id);

-- Chaque utilisateur ne voit et ne modifie que ses propres tâches
alter table public.taches enable row level security;

create policy "Lire ses tâches" on public.taches for select
  to authenticated using ((select auth.uid()) = user_id);

create policy "Créer ses tâches" on public.taches for insert
  to authenticated with check ((select auth.uid()) = user_id);

create policy "Modifier ses tâches" on public.taches for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Supprimer ses tâches" on public.taches for delete
  to authenticated using ((select auth.uid()) = user_id);

-- Expose la table à l'API (les nouvelles tables ne le sont plus par défaut)
grant select, insert, update, delete on public.taches to authenticated;
