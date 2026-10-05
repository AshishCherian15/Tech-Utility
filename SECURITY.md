# Security Policy

**Last reviewed:** 2026-10-04

## Overview

Ash-Tech is a **private personal tool** — it is not a public multi-tenant SaaS. Access is restricted to the owner and accounts the owner provisions.

## Supported Versions

This project is currently pre-release. Only the `main` branch is maintained.

| Version | Supported |
|---------|-----------|
| `main` (latest) | ✅ |
| Older commits | ❌ |

## Security Model

### Authentication & Authorization
- Login via **Google / GitHub OAuth or provisioned email/password accounts** — public sign-up is disabled
- Email/password users can request password-recovery links; configure the Supabase email provider and callback redirect allow-list before relying on this flow
- Provisioned password accounts are currently marked email-confirmed by the owner-only admin route; no independent verification email is sent
- Session inactivity/maximum lifetime is controlled by Supabase Auth settings and must be configured and verified there
- App-level login, recovery, and AI rate limiting is not configured; set Supabase Auth limits and provider billing alerts, and add distributed limits before broader access
- Supabase Auth supports TOTP, but the application does not currently complete or enforce an MFA challenge during sign-in
- Every data API route re-validates the Supabase session **server-side** before touching data
- User IDs are **never trusted from the client** — always read from the verified server session
- Owner/permanent/temporary role, enablement, account type, and expiration are stored in trusted `app_metadata`; temporary accounts require a valid expiry, enforced by both Next.js Proxy and database RLS
- Account creation, enable/disable, and bounded renewal of expired temporary accounts are restricted to the configured owner email and use the server-only Supabase service role key; the management UI is hidden from invited users
- Signed-in users can permanently delete their own account; the server removes files in their private Storage folder before deleting the Auth user, which cascades the application's database rows

### Row Level Security (RLS)
- The schema enables RLS on all five application tables
- Policies require the row `user_id` to match `auth.uid()` and the account to have an explicitly provisioned, enabled role; entry category references and child-row entry references must belong to the same user
- During setup, the existing owner Auth user must be assigned the trusted `owner` role in `app_metadata` using the documented Supabase SQL setup step; `ASH_OWNER_EMAIL` only authorizes the application proxy and does not bypass database RLS
- The configured Supabase project previously returned `PGRST205` for `public.entries`; source policies are not evidence that the schema has been applied or verified in the target project
- There are no unauthenticated read paths, not even for the dashboard

### AI Autofill Safety
- Server-configured AI keys never enter the client bundle. User-provided Groq/Gemini keys are stored in browser local storage and sent to the authenticated autofill endpoint when used; avoid saving them on shared or untrusted devices.
- Autofill inputs are schema-validated, and generated fields are type-checked and size-bounded before being returned
- AI-drafted content is **never auto-saved** — it only pre-fills a review form that the owner must explicitly submit
- The system prompt forbids the model from inventing URLs or fabricating facts not in the input

### Secret Management
- `SUPABASE_SERVICE_ROLE_KEY`, `ASH_OWNER_EMAIL`, and optional server-side AI keys belong only in deployment secrets and a git-ignored `.env.local`
- The only key in the client bundle is `NEXT_PUBLIC_SUPABASE_ANON_KEY`, which is constrained entirely by RLS
- Optional user-supplied AI keys are stored in browser local storage and are readable by same-origin JavaScript; use server-managed keys or avoid saving keys on shared devices

### File Storage
- The schema configures the `entry-images` Supabase Storage bucket as **private**
- Access is via signed URLs only — no public bucket read
- Storage CORS must be configured in the Supabase project settings; it is not set by the SQL schema
- Verify bucket privacy, MIME/size limits, and owner-path policies in the actual Supabase project before launch

### HTTP Security Headers
All responses include:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Content Security Policy restricting scripts, connections, images, and framing
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security` in production only

## Reporting a Vulnerability

Please report suspected vulnerabilities privately to the maintainer. If GitHub
Private Vulnerability Reporting or Security Advisories are enabled for this
repository, use that channel. Otherwise, contact the maintainer through a private
channel. Do not include exploit details, credentials, or personal data in a public
issue.

This is a personal project with best-effort response; there is no guaranteed response
time or service-level agreement. Coordinate public disclosure with the maintainer
after a fix or mitigation is available.

## Security Incident Response

If an account, credential, database, or uploaded file may be exposed:

1. Contain the incident: disable affected accounts or integrations, revoke exposed sessions/tokens, and restrict the affected service without deleting evidence.
2. Preserve relevant provider and application logs, timestamps, affected resource identifiers, and a concise action timeline in a private location. Do not copy passwords, API keys, or user content into public issues or chat.
3. Rotate affected credentials from a trusted device, update deployment secrets, and verify that the old credentials no longer work. For exposed Git history, treat the credential as compromised even if it was later removed; coordinate any history rewrite with collaborators.
4. Identify the affected accounts, data types, access window, and likely impact using provider audit logs and database/storage records. Record what is known, what remains uncertain, and containment actions.
5. Restore from a verified backup only after closing the access path; verify database and private object-storage recovery and preserve the original evidence.
6. Contact the hosting/database providers and affected users as appropriate. Determine notification duties and deadlines with qualified counsel for the users' and controller's jurisdictions; this checklist does not replace that legal assessment.
7. After containment, document root cause and follow-up controls, then verify recovery and monitor for renewed access.

Before broader launch, assign an incident owner and private contact channel, identify where provider audit logs and backups are accessed, and rehearse this checklist in staging.

## What Is Out of Scope

- Public-facing unauthenticated endpoints — there are none in V1
- Multi-tenant data isolation — there is only one owner in V1
- DDoS resilience and application-level rate limiting — no rate limiter is configured; hosting-plan protections have not been verified
