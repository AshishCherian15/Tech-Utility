# Security Policy

## Overview

Ash-Tech is a **private personal tool** — it is not a public multi-tenant SaaS. Access is intentionally restricted to a single owner (with optional future invite-only guests).

## Supported Versions

This project is currently pre-release (Phase 1–2). Only the `main` branch is maintained.

| Version | Supported |
|---------|-----------|
| `main` (latest) | ✅ |
| Older commits | ❌ |

## Security Model

### Authentication & Authorization
- Login via **Google / GitHub OAuth only** — no public sign-up, no password storage
- Optional **TOTP 2FA** via Supabase Auth
- Every API route re-validates the Supabase session **server-side** before touching data
- User IDs are **never trusted from the client** — always read from the verified server session

### Row Level Security (RLS)
- **Every table** has RLS enabled
- All policies are `owner-only`: a row is readable/writable only by the user whose `user_id` matches `auth.uid()`
- There are no unauthenticated read paths, not even for the dashboard

### AI Autofill Safety
- The AI API key **never reaches the client bundle**
- Autofill output is validated against a strict schema with `zod` before being returned
- AI-drafted content is **never auto-saved** — it only pre-fills a review form that the owner must explicitly submit
- The system prompt forbids the model from inventing URLs or fabricating facts not in the input

### Secret Management
- `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` exist only in Vercel Environment Variables and a git-ignored `.env.local`
- The only key in the client bundle is `NEXT_PUBLIC_SUPABASE_ANON_KEY`, which is constrained entirely by RLS

### File Storage
- Screenshots are stored in a **private** Supabase Storage bucket
- Access is via signed URLs only — no public bucket read
- CORS is limited to the app's own domain

### HTTP Security Headers
All responses include:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

## Reporting a Vulnerability

Since this is a private personal project, please report issues directly:

1. **Email**: Open a GitHub Issue marked `[SECURITY]` or contact the owner directly
2. **Do not** publicly disclose a vulnerability before it is addressed
3. Expected response time: best effort (personal project, not a company)

## What Is Out of Scope

- Public-facing unauthenticated endpoints — there are none in V1
- Multi-tenant data isolation — there is only one owner in V1
- DDoS resilience — Vercel Hobby plan limits handle this
