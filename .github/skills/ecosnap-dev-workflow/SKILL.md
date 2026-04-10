---
name: ecosnap-dev-workflow
description: 'Plan and implement EcoSnap full-stack changes (FastAPI backend + React frontend), then validate with focused checks. Use for new features, bug fixes, API contract updates, or UI behavior changes in this repository.'
argument-hint: 'Describe the feature or bug, expected behavior, and files/modules involved'
user-invocable: true
---

# EcoSnap Development Workflow

## When to Use
- Add a new feature that touches backend and frontend.
- Fix bugs where API and UI behavior must stay aligned.
- Update schema or response payloads and propagate changes safely.
- Make targeted changes and verify them quickly before handing off.

## Inputs to Collect First
- Exact user-visible behavior expected after the change.
- Scope boundaries: what must change and what must not change.
- Affected backend modules under `backend/app/`.
- Affected frontend modules under `frontend/src/`.
- Validation target: lint, type-check, endpoint smoke test, or UI flow.

## Procedure
1. Confirm the change target.
2. Inspect likely files in `backend/app/routes/`, `backend/app/services/`, `backend/app/schemas/`, and related frontend pages/components/services.
3. Implement backend changes first when API contract changes are required.
4. Update frontend API calls and UI state handling to match backend behavior.
5. Keep changes minimal and avoid unrelated refactors.
6. Run focused verification for touched areas.
7. Summarize results, including any remaining risks or follow-up tasks.

## Backend Checklist
- Ensure request/response schema updates are reflected in `backend/app/schemas/`.
- Keep route logic thin; place business logic in `backend/app/services/`.
- Check auth constraints for protected routes.
- Prefer explicit error handling with actionable messages.

## Frontend Checklist
- Keep API calls centralized in `frontend/src/services/api.ts` unless there is a strong reason not to.
- Ensure loading, success, and error states are visible in the UI.
- Preserve existing component structure and styling patterns unless the task requests redesign.
- Verify TypeScript compatibility for new response shapes.

## Validation
- Backend: run targeted startup or route-level checks.
- Frontend: run lint/type-check for changed modules.
- End-to-end sanity: perform one happy path for the modified flow.

## References
- [Repository setup notes](./references/repo-checks.md)
