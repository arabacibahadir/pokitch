import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const migrationDirectory = resolve(process.cwd(), "supabase", "migrations");

function readMigration(name: string) {
  return readFileSync(resolve(migrationDirectory, name), "utf8").toLowerCase();
}

function readMigrationEndingWith(suffix: string) {
  const name = readdirSync(migrationDirectory).find((entry) =>
    entry.endsWith(suffix),
  );
  expect(name).toBeDefined();
  return readMigration(name!);
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

  it("removes active pokes from the unused Realtime publication", () => {
    const sql = readMigrationEndingWith("remove_active_pokes_realtime.sql");

    expect(sql).toContain(
      "alter publication supabase_realtime drop table public.active_pokes",
    );
  });

  it("surfaces combat events on the active encounter for the overlay", () => {
    const sql = readMigrationEndingWith("add_overlay_events.sql");

    for (const column of [
      "last_event_kind",
      "last_event_player",
      "last_event_damage",
      "last_event_at",
      "last_catch_poke",
      "last_catch_player",
      "last_catch_at",
    ]) {
      expect(sql).toContain(`add column if not exists ${column}`);
    }

    // Attacks write the latest event; hits carry damage, catches persist a catch.
    expect(sql).toContain("last_event_kind = 'hit'");
    expect(sql).toContain("last_event_kind = 'caught'");
    expect(sql).toContain("last_event_player = normalized_username");
    expect(sql).toContain("last_event_damage = p_damage");
    expect(sql).toContain("last_catch_poke = encounter.poke");
    expect(sql).toContain("last_catch_player = normalized_username");

    // The attack RPC returns the event so the worker can use it without a re-read.
    // The migration file is read lowercased, so the camelCase JSON keys are too.
    expect(sql).toContain("'lasteventkind', 'hit'");
    expect(sql).toContain("'lasteventkind', 'caught'");
    expect(sql).toContain("'lasteventplayer', normalized_username");
    expect(sql).toContain("'lastcatchpoke', encounter.poke");

    // Damage bounds stay unchanged.
    expect(sql).toContain("p_damage < 5");
    expect(sql).toContain("p_damage > 14");
  });
});
