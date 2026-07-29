# Coffee Module

## Scope

- Coffee stored cups
- Coffee subscription
- Remaining quota
- Redemption records
- Expiration
- Daily redemption limits

## Product Rules

Stored cups:

- Planned package: 30 cups
- Planned validity: 2 months
- Daily use may be unlimited
- Confirm current business settings before implementation

Monthly subscription:

- Planned validity: 1 month
- Planned limit: 1 cup per day
- Confirm current business settings before implementation

Do not hard-code business rules in multiple files.

## Known Data

Tables previously involved include:

- `coffee_subscriptions`
- `coffee_logs`

Known fields previously discussed include:

- `remaining_quota`
- `amount`

Verify actual schema before modifying code.

## Source of Truth

- Subscription record stores the current entitlement.
- Coffee log records each redemption or adjustment.
- Remaining quota must agree with valid log operations.
- Expired plans cannot be redeemed.

## Redemption Flow

1. Authenticate member
2. Load active coffee entitlement
3. Check start and expiration dates
4. Check remaining quota
5. Check daily limit when applicable
6. Deduct the correct amount
7. Create one redemption log
8. Return updated quota

Use an atomic database operation when available.

## Protection Rules

- Prevent double redemption from repeated clicks.
- Prevent redemption after expiration.
- Prevent quota below zero.
- Use server-side validation.
- Do not trust client-displayed quota.
- Do not allow members to edit coffee logs.

## Performance Rules

- Query only active subscriptions.
- Avoid loading complete redemption history by default.
- Load recent logs with a limit.
- Do not poll quota continuously.
- Refresh once after a successful redemption.

## Completion Check

- Active plan is displayed
- Expired plan is rejected
- Remaining quota is correct
- Daily limit works
- One redemption creates one log
- Repeated clicks do not double deduct
- Unauthorized redemption is rejected