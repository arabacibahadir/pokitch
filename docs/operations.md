# Pokitch operations

## Release order

Database and application changes use an expand/deploy/contract sequence:

1. Back up the database and record current row counts for `accounts`,
   `active_pokes`, `collections`, and `trades`.
2. Apply all files in `supabase/migrations` to a Supabase development branch.
3. Run `npx supabase test db` and
   `supabase/verification/secure_transfers.sql` against that branch.
4. Confirm `private.migration_rejects` contains only reviewed legacy records.
5. Deploy the web application and worker together. The worker depends on the
   new atomic game RPCs.
6. Verify `/`, `/collections`, one authenticated gift/trade journey, one Twitch
   attack, one catch, and the worker `/health` endpoint.
7. Review Supabase security/performance advisors and Postgres/API logs before
   promoting the same migration set to production.

Do not deploy the new worker before the game RPC migration. Do not apply the
RLS migration without the preceding policies and RPC migrations.

## Rollback boundaries

- Before application deployment, restore the database backup or revert the
  development branch if migration verification fails.
- After the new worker has processed catches, prefer a forward fix. Reverting
  ownership columns would discard immutable Twitch IDs written by the worker.
- The migrations quarantine rejected legacy trades in
  `private.migration_rejects`; they do not silently discard their payloads.
- Stop or roll back both web and worker containers together when an RPC contract
  changes.

## Required checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
npx supabase db reset
npx supabase test db
```

The last two commands require a running Docker daemon. Production is not a
substitute for local migration tests.

## Runtime monitoring

- Web health: HTTP 200 from `/`.
- Worker health: HTTP 200 from `:3001/health`, including `connected: true` and a
  nonzero channel count when accounts exist.
- Alert on repeated RPC failures, reconnect loops, or worker health failures.
- Track API 4xx errors for malformed filters and RPC authorization failures.
- Track Postgres statement latency for collection reads and atomic game RPCs.
- Periodically review unresolved rows where `collections.owner_twitch_id is
  null`; these remain visible archive records but cannot be transferred.

## Secrets

`SUPABASE_SECRET_KEY`, `TWITCH_BOT_OAUTH`, and `TWITCH_BOT_USERNAME` are
server-only. Never expose them with a `NEXT_PUBLIC_` prefix or include them in
client bundles, logs, screenshots, or support output.
