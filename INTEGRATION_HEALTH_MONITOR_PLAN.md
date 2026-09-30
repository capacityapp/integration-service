# Integration health monitor — MVP implementation plan

## Outcome and repository split
- **capacity-services:** authenticated delivery receipts, scheduled detection of stopped feeds and missing daily utilisation coverage, tenant-local incidents and examples, explicit access permissions, and summary-only email to the tenant's approved contacts.
- **capacity-webapp-v2:** an admin incident list and detail view with deliberately loaded example users; separate bootstrap with no analytics, replay, or external error reporting.
- **integration-service:** bounded SQL/HTTP operations, propagated failures, no overlapping scheduled runs, per-record API result validation, and an explicit daily utilisation contract. Existing weekly integrations must opt into a daily query; dates cannot be inferred from weekly totals.
- All branches are `codex/integration-health-monitor`; deploy backend schema/API before frontend and connector. No deployment is part of these PRs.

## Scope
1. NO_DELIVERY: a configured feed has no qualifying successful delivery within its agreed maximum silence interval, including startup grace. An empty delta is only healthy when explicitly permitted. Failed/partial requests are recorded and do not reset the successful-delivery clock.
2. UTILISATION_DATE_GAP: raw daily rows fail the configured minimum distinct-user coverage on expected business dates after the tenant's timezone, closing lag, cutoff and holidays. Received zero hours are valid rows, never classified as missing. Evaluate the recent 90 days plus all unresolved missing dates, so a newer date cannot hide an earlier gap. A numeric minimum must be set during onboarding; sparse/event-only feeds must not enable this daily completeness rule.
3. One active incident per feed/rule; acknowledge without resolving. Recovery requires the underlying condition to clear. Opening and recovery events use a tenant-local outbox. No reminder spam in MVP.
4. Evidence is bounded to ten recurring, active users, with detection-time facts for the affected period. Absence/secondment/occasional use are not diagnosed from missing rows. Evidence indicates missing vs received rows, including received zero hours. No raw integration payloads are retained.

## Privacy and permissions — release gates
- Tenant identity comes from the authenticated request/database context or validated regional tenant worker, never a payload tenant ID.
- Separate VIEW_INTEGRATION_HEALTH, VIEW_INTEGRATION_HEALTH_EXAMPLES and MANAGE_INTEGRATION_HEALTH permissions. An explicit operator role is provisioned; nobody receives it automatically, including existing root admins.
- Examples stay in the tenant database, accessible only through authenticated no-store endpoints; list responses and notification records contain no names, identifiers or individual hours.
- Email resolves approved exact recipients from the current tenant configuration at send time, with an explicit matching organisation binding. No generic operations mailbox, CC/BCC or sender fallback. No examples, names, clients, matters, SQL, source errors or query payloads in email.
- Sensitive UI starts without the normal app's telemetry. Full-page navigation enters/leaves it; no public incident links or exports. Examples are not persisted in browser storage. API/schema errors shown as fixed messages.
- No AI, external incident platform or additional analytics in this MVP. Existing infrastructure alarms report monitor failures with safe codes.

## Configuration and operations
Capacity configures enabled feeds, accepted empty/delta semantics, maximum silence interval, coverage start, minimum daily population, local timezone, business weekdays, holidays and data closing deadline. Start disabled. Confirm the export contract with the client once; no ongoing dashboard work required from them. Separately approve exact organisation email contacts. Pilot with email disabled, exercise the September-style gap, then enable notifications. Schema and permission migration precede workers and API instrumentation. Configuration is server-managed in MVP.

## Delivery reliability
Use regional per-tenant scheduled workers every 15 minutes and transaction/advisory locks for incident/outbox changes. Retain delivery metadata and resolved evidence for 90 days. Outbox events carry IDs and safe summary fields only. Re-check incident and policy before sending. SES cannot provide exactly-once delivery across a process crash: ambiguous sends are held for operator review rather than blindly re-sent. Show notification status in the GUI. Do not claim a refreshed report merely because raw data has recovered.

## Validation and rollout
Test no-traffic startup, rejected/partial/empty batches, valid empty delta, old-date replay, missing intermediate dates, single-row false recovery, zero hours, weekend/holiday/DST/deadline handling, repeated workers, incident recovery, missing/revoked/mismatched recipients, example permissions and tenant isolation. Connector tests cover SQL and HTTP failure, per-record failures in HTTP 200, cancellation and overlapping runs. Frontend checks include gated loading, fixed errors and a telemetry-free dependency boundary. Run each repository's required checks; record actual results in the PR. Roll back by disabling monitor/email configuration; preserve incidents for investigation.


## Integration container implementation and compatibility

The current source supports client-supplied SQL queries, not a centrally known
export schedule. This change adds per-stage safe completion/failure logs, isolated
SQL pools, a 30-second connection timeout, 120-second SQL/HTTP timeouts, a 10-minute
stage bound and a per-process schedule overlap guard. Stream listeners are
installed before query execution, errors reject the awaited operation, and paused
streams cancel when the batch fails. Completion awaits the final nonempty batch.
Independent export chains settle before the guard is released.

HTTP writes do not follow redirects or retry automatically. Every nonempty API
result body must contain exactly one saved result per submitted record; HTTP 200
with a row error is a failure. REQUIRE_BATCH_RESULTS=true also rejects legacy
empty successful responses. No source values or raw driver/HTTP exceptions are
written to the new stage logs.

HISTORIC_UTILISATION_FORMAT=daily selects /integration/utilisation/historic.
The configured query must supply actual daily `day`, `availableHours`,
`utilisedHours` and `email` or `employeeId` fields. The default legacy_weekly
retains the old endpoint for older deployed backends. Current backend deployments
must explicitly switch to a daily query; this change never invents daily values
from weekly totals. The existing OOO source contract is unchanged.

The receiver monitor does not depend on upgrading this container. Rich source
run/stage receipt reporting and empty-delta heartbeat support are follow-up work.
Use one scheduled replica per source organisation. Keep monitoring disabled for
infrequent delta-only sources unless a periodic snapshot/heartbeat contract is
established. Upgrade and verify in staging before publishing a new container;
these PRs do not build or publish Docker images to a registry.
