# Member Module

## Scope

- Member profile
- Contact information
- Member page
- Profile reading and saving
- Logged-in member identity

## Known Data

Primary tables currently involved:

- `member_profiles`
- `user_contacts`

Always verify the actual schema and code before modifying them.

## Identity Rule

- Member data must be connected to the authenticated LINE user.
- Do not create duplicate member identities.
- Do not use editable profile fields as the identity key.
- Do not change primary keys without approval.

## Read Flow

1. Confirm authenticated session
2. Resolve current member identity
3. Read `member_profiles`
4. Read `user_contacts` only when required
5. Render the member page

## Save Flow

1. Validate input
2. Confirm authenticated member
3. Update only intended fields
4. Check Supabase response and errors
5. Refresh the displayed data once

## Performance Rules

- Avoid repeated profile requests.
- Avoid fetch loops caused by `useEffect` dependencies.
- Reuse a stable Supabase client.
- Do not refetch after every input change.
- Save only after an explicit user action.
- Do not load wallet or coffee data unless the page needs it.

## Investigation Order

1. Input `value`
2. Input `onChange`
3. Save handler
4. Supabase update query
5. Update filters
6. Returned error
7. Reload or refetch logic
8. Browser network requests

## Forbidden

- Do not redesign authentication.
- Do not create a replacement member table.
- Do not silently overwrite existing fields.
- Do not disable security controls as a shortcut.
- Do not refactor unrelated member-page UI.

## Completion Check

- Existing data loads
- Inputs can be edited
- Save updates the correct member
- Reload shows the saved values
- No repeated requests
- No unrelated data is changed