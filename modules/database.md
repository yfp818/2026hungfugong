# Database Module

## Scope

- Supabase tables
- Queries
- Migrations
- Relationships
- RLS and permissions
- Database performance

## Evidence Rule

Before changing the database, inspect:

1. Current schema
2. Existing migrations
3. Current queries
4. Data types
5. Constraints
6. RLS policies
7. Production impact

Never guess table names, columns, or types.

## Change Rules

- Prefer the smallest schema change.
- Do not rename or delete production columns without approval.
- Do not change primary keys without approval.
- Do not create duplicate sources of truth.
- Do not edit historical migrations after they have been applied.
- Create a new migration for every schema change.
- Include rollback or recovery notes for risky changes.

## Query Rules

- Select only required columns.
- Filter queries as early as possible.
- Avoid duplicate queries.
- Avoid fetching entire tables.
- Add limits to history and log queries.
- Use pagination for growing datasets.
- Avoid N+1 queries.
- Add indexes only after verifying the query pattern.
- Do not add indexes blindly.

## Write Rules

- Validate all input.
- Check Supabase errors.
- Use transactions or database functions for multi-step financial changes.
- Prevent duplicate submissions.
- Preserve audit records.
- Do not trust client-side authorization.

## Security Rules

- Review RLS before exposing a table to the browser.
- Members may access only authorized records.
- Admin operations require verified authorization.
- Service-role keys remain server-side.
- Never place secrets in public environment variables.
- Do not disable RLS merely to make a query work.

## Known Project Tables

Previously discussed tables include:

- `member_profiles`
- `user_contacts`
- `blessing_products`
- `coffee_subscriptions`
- `coffee_logs`

These names do not replace schema inspection.

## Required Report

For every database change, report:

- Migration file
- Tables affected
- Columns affected
- Data migration required
- RLS impact
- Query impact
- Rollback or recovery method
- Build or test result

## Completion Check

- Migration is valid
- Existing data is preserved
- Queries return expected records
- Unauthorized access is rejected
- No full-table fetch was introduced
- No duplicated source of truth was introduced