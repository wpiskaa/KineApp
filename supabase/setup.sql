-- =====================================================================
-- Kine Klub — skema database + aturan akses (Row Level Security)
-- Jalankan sekali di Supabase Dashboard → SQL Editor → New query → Run
-- =====================================================================

create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text not null unique check (username ~ '^[a-z0-9._]{3,20}$'),
  name       text not null check (char_length(name) between 1 and 40),
  div        text not null check (div in ('BPH','MEDIA','APRESIASI','ASSET','PRODUKSI','HUMAS','PSDM')),
  role       text not null check (role in ('anggota','wakadiv','kadiv')),
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.events (
  id               uuid primary key default gen_random_uuid(),
  title            text not null check (char_length(title) between 1 and 80),
  div              text not null check (div in ('BPH','MEDIA','APRESIASI','ASSET','PRODUKSI','HUMAS','PSDM')),
  type             text not null default 'Rapat',
  event_date       date not null,
  start_time       text not null default '',
  end_time         text not null default '',
  loc              text not null default '',
  description      text not null default '',
  created_by       uuid references auth.users(id) on delete set null,
  created_by_label text not null default '',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index events_date_idx on public.events (event_date);

-- Fungsi bantu (security definer agar tidak terjadi rekursi RLS)
create or replace function public.is_active() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and active);
$$;

create or replace function public.is_bph() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles
                 where id = auth.uid() and active and div = 'BPH' and role in ('kadiv','wakadiv'));
$$;

-- Divisi milik Kadiv/Wakadiv yang sedang login (null jika bukan pimpinan divisi / nonaktif)
create or replace function public.leader_div() returns text
language sql stable security definer set search_path = '' as $$
  select div from public.profiles
  where id = auth.uid() and active and role in ('kadiv','wakadiv');
$$;

alter table public.profiles enable row level security;
alter table public.events   enable row level security;

-- PROFIL: baca profil sendiri; BPH membaca/mengubah semua. (Pembuatan akun lewat Edge Function.)
create policy "profiles_select" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_bph());
create policy "profiles_insert" on public.profiles for insert to authenticated
  with check (public.is_bph());
create policy "profiles_update" on public.profiles for update to authenticated
  using (public.is_bph()) with check (public.is_bph());
create policy "profiles_delete" on public.profiles for delete to authenticated
  using (public.is_bph());

-- AGENDA: semua anggota aktif membaca; tulis hanya BPH (semua divisi) atau Kadiv/Wakadiv (divisinya saja)
create policy "events_select" on public.events for select to authenticated
  using (public.is_active());
create policy "events_insert" on public.events for insert to authenticated
  with check (public.is_bph() or public.leader_div() = div);
create policy "events_update" on public.events for update to authenticated
  using      (public.is_bph() or public.leader_div() = div)
  with check (public.is_bph() or public.leader_div() = div);
create policy "events_delete" on public.events for delete to authenticated
  using (public.is_bph() or public.leader_div() = div);

-- Realtime: kirim perubahan ke semua perangkat yang sedang terbuka
alter publication supabase_realtime add table public.events, public.profiles;
