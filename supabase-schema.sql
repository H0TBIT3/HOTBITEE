create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade
);

alter table public.admin_users enable row level security;

drop policy if exists "Admins can read their own membership" on public.admin_users;
create policy "Admins can read their own membership"
  on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.is_hotbite_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_hotbite_admin() from public;
grant execute on function public.is_hotbite_admin() to authenticated;

create table if not exists public.inventory_availability (
  product_id text primary key,
  is_available boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.inventory_availability enable row level security;

drop policy if exists "Anyone can read inventory availability" on public.inventory_availability;
create policy "Anyone can read inventory availability"
  on public.inventory_availability for select to anon, authenticated
  using (true);

drop policy if exists "Admins can insert inventory availability" on public.inventory_availability;
create policy "Admins can insert inventory availability"
  on public.inventory_availability for insert to authenticated
  with check ((select public.is_hotbite_admin()));

drop policy if exists "Admins can update inventory availability" on public.inventory_availability;
create policy "Admins can update inventory availability"
  on public.inventory_availability for update to authenticated
  using ((select public.is_hotbite_admin()))
  with check ((select public.is_hotbite_admin()));

drop policy if exists "Admins can delete inventory availability" on public.inventory_availability;
create policy "Admins can delete inventory availability"
  on public.inventory_availability for delete to authenticated
  using ((select public.is_hotbite_admin()));

create table if not exists public.sales (
  id text primary key default gen_random_uuid()::text,
  sale_date date not null,
  detail varchar(120) not null default '',
  amount_cop integer not null check (amount_cop > 0),
  created_at timestamptz not null default now()
);

alter table public.sales enable row level security;

drop policy if exists "Admins can read sales" on public.sales;
create policy "Admins can read sales"
  on public.sales for select to authenticated
  using ((select public.is_hotbite_admin()));

drop policy if exists "Admins can insert sales" on public.sales;
create policy "Admins can insert sales"
  on public.sales for insert to authenticated
  with check ((select public.is_hotbite_admin()));

drop policy if exists "Admins can delete sales" on public.sales;
create policy "Admins can delete sales"
  on public.sales for delete to authenticated
  using ((select public.is_hotbite_admin()));

grant usage on schema public to anon, authenticated;
grant select on public.inventory_availability to anon, authenticated;
grant insert, update, delete on public.inventory_availability to authenticated;
grant select, insert, delete on public.sales to authenticated;
grant select on public.admin_users to authenticated;

alter table public.inventory_availability replica identity full;
alter table public.sales replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'inventory_availability'
  ) then
    execute 'alter publication supabase_realtime add table public.inventory_availability';
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'sales'
  ) then
    execute 'alter publication supabase_realtime add table public.sales';
  end if;
end
$$;
