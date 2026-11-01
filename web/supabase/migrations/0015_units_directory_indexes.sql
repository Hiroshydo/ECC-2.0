create index if not exists memberships_congregation_role_idx
  on public.memberships (congregation_id, role);
