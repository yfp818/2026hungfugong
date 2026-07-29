# Wallet Module

## Scope

- Stored-value balance
- Balance display
- Top-up records
- Deduction records
- Transaction history
- Admin balance adjustments

## Source of Truth

- Transaction records are the audit source.
- Displayed balance must agree with completed transactions.
- Never update a balance without creating the required record.
- Verify the actual table and column names before modifying code.

## Transaction Rules

Every wallet change must include:

- Member identity
- Amount
- Transaction type
- Previous or resulting balance when supported
- Created time
- Operator or source when supported
- Reference ID when related to an order

## Amount Rules

- Top-up amount must be positive.
- Deduction amount must be positive.
- Do not permit a negative balance unless explicitly designed.
- Money calculations must use the database’s existing numeric format.
- Do not use floating-point assumptions without checking the schema.

## Write Flow

1. Authenticate the actor
2. Validate member and amount
3. Read or lock the required wallet state
4. Apply the balance change
5. Create the transaction record
6. Return the final balance
7. Refresh the UI once

Use a database transaction or existing atomic function when available.

## Performance Rules

- Do not recalculate the complete history on every page load.
- Load recent transactions with a limit.
- Add pagination when history becomes large.
- Avoid separate duplicate balance queries.
- Do not poll the wallet continuously.

## Security Rules

- Members may read only their own wallet.
- Members must not directly edit balances.
- Admin adjustments require authorization.
- Service-role credentials must never reach the browser.
- Do not bypass permission checks.

## Completion Check

- Correct balance is displayed
- Top-up creates one record
- Deduction creates one record
- Duplicate submission is prevented
- Insufficient balance is handled
- Unauthorized modification is rejected
- Transaction history matches balance changes