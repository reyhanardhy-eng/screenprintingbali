-- Security fix: the initial schema left pricing tables writable by anyone
-- holding the public anon key (no login required), via direct REST calls to
-- Supabase, bypassing the /admin app entirely. Run this once in the
-- Supabase SQL editor against the live project to close that off.

drop policy if exists "temp anon write products" on products;
drop policy if exists "temp anon write fabrics" on fabrics;
drop policy if exists "temp anon write cuts" on cuts;
drop policy if exists "temp anon write bag_sizes" on bag_sizes;
drop policy if exists "temp anon write print_methods" on print_methods;
drop policy if exists "temp anon write design_sizes" on design_sizes;

create policy "auth write products" on products for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth write fabrics" on fabrics for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth write cuts" on cuts for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth write bag_sizes" on bag_sizes for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth write print_methods" on print_methods for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth write design_sizes" on design_sizes for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
