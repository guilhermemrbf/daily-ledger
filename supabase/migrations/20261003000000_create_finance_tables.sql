create extension if not exists pgcrypto;

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_cents bigint not null check (amount_cents > 0),
  description text,
  category text not null default 'Outros',
  transaction_date date not null,
  transaction_time time not null default localtime,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists expenses_user_date_idx
  on public.expenses (user_id, transaction_date desc, transaction_time desc);

create table if not exists public.daily_closings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  closing_date date not null,
  profit_cents bigint not null check (profit_cents >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daily_closings_user_date_unique unique (user_id, closing_date)
);

create index if not exists daily_closings_user_date_idx
  on public.daily_closings (user_id, closing_date desc);

alter table public.expenses enable row level security;
alter table public.daily_closings enable row level security;

drop policy if exists "Users manage their own expenses" on public.expenses;
create policy "Users manage their own expenses"
  on public.expenses for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage their own daily closings" on public.daily_closings;
create policy "Users manage their own daily closings"
  on public.daily_closings for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.expenses to authenticated;
grant select, insert, update, delete on public.daily_closings to authenticated;
