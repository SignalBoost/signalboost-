-- Secure the primary application's admin-membership table so the secondary
-- partner-write broker can authorize the signed-in primary Supabase user
-- without relying on a Vercel service-role secret.

alter table public.admins enable row level security;

revoke all privileges on table public.admins from anon;
revoke insert, update, delete, truncate, references, trigger on table public.admins from authenticated;
grant select on table public.admins to authenticated;

drop policy if exists "admin_members_read_own_membership" on public.admins;
create policy "admin_members_read_own_membership"
on public.admins
for select
to authenticated
using (member_id = auth.uid());
