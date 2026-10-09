# Security Policy

**Last reviewed:** 2026-10-10

## Overview

ByteShelf is now structured as a **public, reviewed technology library** with authenticated contributor, moderator, owner, and admin workflows. Public pages expose only published content. Drafts, pending entries, account settings, trash, user management, and admin tools remain protected by server-side checks and Supabase Row Level Security.

## Supported Versions

This project is currently pre-release. Only the `main` branch is maintained.

| Version | Supported |
|---------|-----------|
| `main` (latest) | ✅ |
| Older commits | ❌ |

## Security Model

### Authentication & Authorization
- Public visitors can browse published entries and public information pages without a session.
- Contributors authenticate through Supabase Auth and can draft or submit entries.
- Moderator/admin routes (`/admin`, `/review-queue`, `/users`) are protected by server-side role checks.
- Email/password users can request password-recovery links; configure the Supabase email provider and callback redirect allow-list before relying on this flow.
- Session inactivity/maximum lifetime is controlled by Supabase Auth settings and must be configured and verified there.
- App-level distributed rate limiting is not yet configured; set Supabase Auth limits and add shared-store limits before broad public launch.
- Supabase Auth supports TOTP, but the application does not currently complete or enforce an MFA challenge during sign-in.
- Every data API route re-validates the Supabase session **server-side** before touching private data.
- User IDs are **never trusted from the client** — always read from the verified server session.
- Owner account management uses trusted server-side credentials and must never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- Signed-in users can permanently delete their own account; the server removes files in their private Storage folder before deleting the Auth user, which cascades the application's database rows.

### Row Level Security (RLS)
- Apply `database/schema.sql`, `database/01-byteshelf-pivot.sql`, and `database/02-byteshelf-rls-update.sql` in order.
- The base schema enables RLS on the core application tables and private image bucket.
- The pivot migrations add `public.users`, moderation fields, reports, moderation actions, public published reads, author-owned draft management, and moderator/admin review access.
- Public unauthenticated reads must be limited to `PUBLISHED` entries and related public data.
- Source policies are not evidence that the schema has been applied or verified in the target Supabase project; verify policies in the deployed database.

### AI Autofill Safety
- Server-configured AI keys never enter the client bundle. User-provided Groq/Gemini keys are stored in browser local storage and sent to the authenticated autofill endpoint when used; avoid saving them on shared or untrusted devices.
- Autofill inputs are schema-validated, and generated fields are type-checked and size-bounded before being returned
- AI-drafted content is **never auto-saved** — it only pre-fills a review form that the owner must explicitly submit
- The system prompt forbids the model from inventing URLs or fabricating facts not in the input

### Secret Management
- `SUPABASE_SERVICE_ROLE_KEY`, `BYTESHELF_ADMIN_EMAIL`, and optional server-side AI keys belong only in deployment secrets and a git-ignored `.env.local`
- The only key in the client bundle is `NEXT_PUBLIC_SUPABASE_ANON_KEY`, which is constrained entirely by RLS
- Optional user-supplied AI keys are stored in browser local storage and are readable by same-origin JavaScript; use server-managed keys or avoid saving keys on shared devices
- Helper scripts must read project URL, owner email, and service role credentials from environment variables. Do not hardcode production secrets in scripts.
- If a real key was committed at any point in Git history, rotate it immediately. Treat it as compromised even if the current working tree no longer contains it.

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

### Public Compliance Pages
- Privacy, Terms, Cookies, Consent, Legal Notices, Data Retention, Accessibility, License Compliance, Status, and Bug Bounty pages exist as public routes.
- The cookie notice currently covers essential authentication cookies and browser storage only. Optional analytics/advertising cookies are not enabled.

## Known Gaps Before Production

- Distributed rate limiting is not yet implemented.
- MFA challenge enforcement is not complete.
- CAPTCHA/bot protection is not connected.
- Monitoring/error dashboards are not connected.
- Automated backups and disaster-recovery drills need setup.
- Contact/newsletter forms are informational until a backend provider is connected.

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

- DDoS resilience beyond hosting-provider protections
- Paid bug bounty rewards
- Live uptime guarantees
- Application-level distributed rate limiting until a shared-store limiter is added
