create table if not exists reflections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  period_type text check (period_type in ('week', 'month')) not null,
  start_date date not null,
  end_date date not null,
  summary text,
  insights jsonb,
  metrics jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS policies
alter table reflections enable row level security;

create policy "Users can view their own reflections"
  on reflections for select
  using (auth.uid() = user_id);

create policy "Users can insert their own reflections"
  on reflections for insert
  with check (auth.uid() = user_id);
