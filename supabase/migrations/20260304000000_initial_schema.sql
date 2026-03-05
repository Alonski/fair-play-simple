-- Household (just one row for you two)
create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Our Home',
  created_at timestamptz default now()
);

-- Profiles (links auth users to household)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  household_id uuid references households(id),
  partner_slot text check (partner_slot in ('partner-a', 'partner-b')),
  display_name text not null default '',
  created_at timestamptz default now()
);

-- Cards (the main synced data)
create table cards (
  id text primary key,
  household_id uuid not null references households(id) on delete cascade,
  category text not null,
  title jsonb not null,
  description jsonb not null,
  details jsonb not null default '{}',
  holder text,
  status text not null default 'unassigned',
  metadata jsonb not null default '{}',
  history jsonb default '[]',
  updated_at timestamptz default now(),
  updated_by uuid references auth.users(id)
);

-- Game state (one row per household)
create table game_state (
  household_id uuid primary key references households(id) on delete cascade,
  deal_mode text default 'random',
  partner_a_name text default 'Partner A',
  partner_b_name text default 'Partner B',
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- RLS policies
alter table households enable row level security;
alter table profiles enable row level security;
alter table cards enable row level security;
alter table game_state enable row level security;

create policy "Users can view own household" on households for select
  using (id in (select household_id from profiles where id = auth.uid()));

create policy "Users can view household profiles" on profiles for select
  using (household_id in (select household_id from profiles where id = auth.uid()));

create policy "Users can update own profile" on profiles for update
  using (id = auth.uid());

create policy "Users can insert own profile" on profiles for insert
  with check (id = auth.uid());

create policy "Household cards - select" on cards for select
  using (household_id in (select household_id from profiles where id = auth.uid()));

create policy "Household cards - insert" on cards for insert
  with check (household_id in (select household_id from profiles where id = auth.uid()));

create policy "Household cards - update" on cards for update
  using (household_id in (select household_id from profiles where id = auth.uid()));

create policy "Household cards - delete" on cards for delete
  using (household_id in (select household_id from profiles where id = auth.uid()));

create policy "Household game_state - select" on game_state for select
  using (household_id in (select household_id from profiles where id = auth.uid()));

create policy "Household game_state - update" on game_state for update
  using (household_id in (select household_id from profiles where id = auth.uid()));

create policy "Household game_state - insert" on game_state for insert
  with check (household_id in (select household_id from profiles where id = auth.uid()));

-- Insert the one household
insert into households (name) values ('Our Home');

-- Enable realtime for cards and game_state
alter publication supabase_realtime add table cards;
alter publication supabase_realtime add table game_state;
