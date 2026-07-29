# Auth Module

## Scope

- LINE Login
- NextAuth session
- User identity
- Admin authorization
- Login and logout flow

## Current Architecture

- Authentication: NextAuth
- Provider: LINE
- Database: Supabase
- Admin access uses LINE User ID configuration

## Working Rules

- Read the actual authentication code before changing anything.
- Preserve the existing LINE login flow.
- Use the authenticated user ID as the identity source.
- Do not create a second authentication system.
- Do not assume Supabase Auth is being used.
- Do not expose secrets or environment variables.
- Do not change callback URLs without approval.
- Do not change production environment variables without approval.

## Admin Rules

- Admin identity is controlled by `ADMIN_LINE_USER_IDS`.
- Missing admin access may be an environment-variable issue.
- Verify configuration before modifying application code.
- Do not hard-code admin IDs into source code.

## Investigation Order

1. Login provider configuration
2. NextAuth callbacks
3. Session contents
4. User ID mapping
5. Authorization checks
6. Cloud Run environment variables

## Completion Check

- Login works
- Logout works
- Session contains the expected user identity
- Normal members cannot enter admin pages
- Admin access works
- No secret is exposed
- Existing users are not broken