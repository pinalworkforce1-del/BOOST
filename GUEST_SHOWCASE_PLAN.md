# Pinal BOOST — Guest Showcase implementation plan

Branch: `feature/guest-showcase-2026` (production remains untouched).

## Safety contract
- Guest sessions require no authentication.
- Do not use a query parameter as authorization for Supabase operations.
- Do not alter production Row-Level Security, coach assignments, certificates, or enrollment transfers.
- Guest actions must not write the production BOOST participant record, browser keys shared with production, or cloud mirror.
- Guest browser state must use dedicated namespaced keys or in-memory state, and should offer Reset Demo.
- Progression remains completely unchanged on normal participant routes.
- Direct entry into each module must be tested before exposing a shareable guest link.

## Integration status
This repository currently contains standalone **Module 1 Discover**, not the unified BOOST home map. Do not treat its index.html as the canonical full BOOST journey.

Before implementing full guest routing, locate the production Pinal BOOST journey shell containing Discover, Validate, Career Mobility, Decide, Career Investment, Industry Experiences, Financial Habits and AI & You. Modify only an isolated guest entry on that shell (and validate each downstream module) rather than bypassing guards on index.html.

## Guest acceptance tests
1. Anonymous user can enter guest map.
2. All showcase destinations visible and independently navigable.
3. No normal participant login or prerequisite behavior changes.
4. No writes to Supabase participants, progress, coaches, or TalentSync.
5. No real certificates awarded and no actual coach/participant reports generated from guest identity.
6. Guest-to-participant transition requires normal authentication and does not transfer demo state.
