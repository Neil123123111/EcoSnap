# Repository Checks

Use these quick commands from the workspace root:

```bash
# Backend dependencies
pip install -r backend/requirements.txt

# Frontend dependencies
cd frontend && npm install

# Frontend lint/type-check
npm run lint
npm run build
```

If the task is backend-only, validate startup and the changed endpoint path.
If the task is frontend-only, validate the user flow and browser console errors.
