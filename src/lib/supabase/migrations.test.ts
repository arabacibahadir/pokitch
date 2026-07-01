import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const migrationDirectory = resolve(process.cwd(), "supabase", "migrations");

function readMigration(name: string) {
  return readFileSync(resolve(migrationDirectory, name), "utf8").toLowerCase();
}

describe("Supabase migration contracts", () => {
  it("snapshots ownership data before changing the production schema", () => {
    const sql = readMigration(
      "20260630203808_pre_security_rollout_backup_20260630.sql",
    );

    expect(sql).toContain("private.collections_pre_security_20260630");
    expect(sql).toContain("as table public.collections with data");
    expect(sql).toContain("revoke all on schema private");
  });

  it("can bootstrap the production-shaped public schema from an empty database", () => {
    const sql = readMigration("20260630204047_secure_transfers.sql");

    for (const table of ["accounts", "active_pokes", "collections", "trades"]) {
      expect(sql).toContain(`create table if not exists public.${table}`);
    }

    expect(sql).toContain("migration_rejects");
    expect(sql).not.toMatch(/delete from public\.trades t\s+where/);
    expect(sql).toContain("new.raw_app_meta_data->>'provider'");
    expect(sql).not.toMatch(/set\s+user_id\s*=\s*excluded\.user_id/);
  });

  it("defines atomic game operations around immutable Twitch identities", () => {
    const sql = readMigration("20260630204112_game_atomicity_and_identity.sql");

    expect(sql).toContain("owner_twitch_id");
    expect(sql).toContain("welcome_pack_claims");
    expect(sql).toContain("function public.ensure_active_poke");
    expect(sql).toContain("function public.process_poke_attack");
    expect(sql).toContain("function public.claim_welcome_pack");
    expect(sql).toContain("for update");
    expect(sql).toContain("to service_role");
  });

  it("reserves both sides of transfers and avoids collection-table fan-out", () => {
    const sql = readMigration(
      "20260630204138_stable_transfers_and_collection_reads.sql",
    );

    expect(sql).toContain("trade_reservations");
    expect(sql).toContain("sender_twitch_id");
    expect(sql).toContain("recipient_twitch_id");
    expect(sql).toContain("function public.list_collectors");
    expect(sql).toContain("p_recipient_twitch_id");
    expect(sql).toContain("set search_path = ''");
  });

  it("removes legacy write grants and public account reads", () => {
    const sql = readMigration("20260630204205_harden_rls_and_privileges.sql");

    expect(sql).toContain(
      'drop policy if exists "public accounts are viewable by everyone."',
    );
    expect(sql).toContain("revoke all on table public.accounts");
    expect(sql).toContain("revoke all on table public.active_pokes");
    expect(sql).toContain("revoke all on table public.collections");
    expect(sql).toContain("revoke all on table public.trades");
    expect(sql).toContain("grant select");
    expect(sql).toContain("function public.get_overlay_channel");
    expect(sql).toContain(
      "grant execute on function public.get_overlay_channel(uuid)",
    );
  });

  it("locks identity creation to Twitch and addresses database advisor findings", () => {
    const sql = readMigration("20260630204220_security_followup.sql");

    expect(sql).toContain("new.raw_app_meta_data->>'provider'");
    expect(sql).toContain("<> 'twitch'");
    expect(sql).toContain(
      "revoke execute on function public.handle_new_user()",
    );
    expect(sql).toContain(
      "alter table public.active_pokes enable row level security",
    );
    expect(sql).toContain(
      "alter table public.collections enable row level security",
    );
    expect(sql).toContain(
      "alter table public.trades enable row level security",
    );
    expect(sql).toContain("create index if not exists accounts_user_id_idx");
    expect(sql).toContain("using ((select auth.uid()) = user_id)");
  });

  it("covers foreign keys reported by the performance advisor", () => {
    const sql = readMigration("20260630204414_performance_followup.sql");

    expect(sql).toContain("trades_recipientpokeid_idx");
    expect(sql).toContain("welcome_pack_claims_collection_id_idx");
  });

  it("exposes read-only encounter events to Realtime", () => {
    const sql = readMigration("20260701185252_add_encounter_events.sql");

    expect(sql).toContain("create table public.encounter_events");
    expect(sql).toContain(
      "alter table public.encounter_events enable row level security",
    );
    expect(sql).toContain(
      "revoke all on table public.encounter_events from public, anon, authenticated",
    );
    expect(sql).toContain(
      "grant select on table public.encounter_events to anon, authenticated",
    );
    expect(sql).toContain(
      "alter publication supabase_realtime add table public.encounter_events",
    );
    expect(sql).toContain("encounter_events_created_at_idx");
  });
});
