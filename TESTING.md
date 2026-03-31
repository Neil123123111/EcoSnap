# ✅ EcoSnap - Testing Guide

Comprehensive testing guide for backend and frontend with examples and best practices.

---

## 📋 Testing Stack

### Backend
- **Framework**: pytest
- **Coverage**: pytest-cov
- **HTTP Testing**: httpx
- **Database**: SQLite in-memory for tests
- **Fixtures**: pytest fixtures for setup/teardown

### Frontend
- **Framework**: Vitest
- **Testing Library**: @testing-library/react
- **Component Testing**: React Testing Library
- **Coverage**: vitest coverage

---

## 🧪 Backend Testing

### Setup

```bash
cd backend
pip install pytest pytest-cov pytest-asyncio httpx
```

### Test Database Configuration

Create `backend/tests/conftest.py`:

```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base
from app.core.config import settings
from app.routes.dependencies import get_db
from app import main

# Use in-memory SQLite for tests
@pytest.fixture(scope="session")
def db_engine():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session(db_engine):
    connection = db_engine.connect()
    transaction = connection.begin()
    session = sessionmaker(autocommit=False, autoflush=False, bind=connection)()
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def test_app(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    main.app.dependency_overrides[get_db] = override_get_db
    yield main.app
    main.app.dependency_overrides.clear()

@pytest.fixture
def client(test_app):
    from fastapi.testclient import TestClient
    return TestClient(test_app)
```

### Authentication Tests

Create `backend/tests/test_auth.py`:

```python
import pytest
from app.core.security import hash_password, verify_password, create_access_token

class TestAuthentication:
    
    def test_hash_password(self):
        """Test password hashing"""
        password = "test123"
        hashed = hash_password(password)
        
        assert hashed != password
        assert verify_password(password, hashed)
        assert not verify_password("wrong_password", hashed)
    
    def test_create_access_token(self):
        """Test JWT token creation"""
        token = create_access_token(data={"sub": "user123"})
        
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0

class TestAuthRoutes:
    
    def test_register_user(self, client):
        """Test user registration"""
        response = client.post(
            "/auth/register",
            json={
                "email": "test@example.com",
                "username": "testuser",
                "password": "testpass123"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_register_duplicate_email(self, client):
        """Test registering with duplicate email"""
        # Register first user
        client.post(
            "/auth/register",
            json={
                "email": "test@example.com",
                "username": "user1",
                "password": "pass123"
            }
        )
        
        # Try to register with same email
        response = client.post(
            "/auth/register",
            json={
                "email": "test@example.com",
                "username": "user2",
                "password": "pass123"
            }
        )
        
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]
    
    def test_login_success(self, client):
        """Test successful login"""
        # Register user first
        client.post(
            "/auth/register",
            json={
                "email": "test@example.com",
                "username": "testuser",
                "password": "testpass123"
            }
        )
        
        # Login
        response = client.post(
            "/auth/login",
            json={
                "username": "testuser",
                "password": "testpass123"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_login_wrong_password(self, client):
        """Test login with wrong password"""
        # Register user first
        client.post(
            "/auth/register",
            json={
                "email": "test@example.com",
                "username": "testuser",
                "password": "testpass123"
            }
        )
        
        # Try wrong password
        response = client.post(
            "/auth/login",
            json={
                "username": "testuser",
                "password": "wrongpass"
            }
        )
        
        assert response.status_code == 401
        assert "Invalid credentials" in response.json()["detail"]
    
    def test_get_current_user(self, client):
        """Test getting current user info"""
        # Register and login
        register_response = client.post(
            "/auth/register",
            json={
                "email": "test@example.com",
                "username": "testuser",
                "password": "testpass123"
            }
        )
        token = register_response.json()["access_token"]
        
        # Get current user
        response = client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"
    
    def test_get_current_user_without_token(self, client):
        """Test accessing protected route without token"""
        response = client.get("/auth/me")
        
        assert response.status_code == 403
        assert "Not authenticated" in response.json()["detail"]

class TestTokenValidation:
    
    def test_invalid_token_format(self, client):
        """Test invalid token format"""
        response = client.get(
            "/auth/me",
            headers={"Authorization": "Bearer invalid_token"}
        )
        
        assert response.status_code == 401
        assert "Invalid token" in response.json()["detail"]
    
    def test_expired_token(self, client):
        """Test expired token"""
        from app.core.security import create_access_token
        from datetime import timedelta
        
        # Create token with past expiry
        token = create_access_token(
            data={"sub": "user123"},
            expires_delta=timedelta(seconds=-1)  # Expired
        )
        
        response = client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 401
```

### Image Upload Tests

Create `backend/tests/test_report.py`:

```python
import pytest
from io import BytesIO
from PIL import Image

class TestReportRoutes:
    
    def test_analyze_image(self, client):
        """Test image analysis endpoint"""
        # Create a test image
        img = Image.new('RGB', (100, 100), color='red')
        img_bytes = BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        response = client.post(
            "/report/analyze",
            files={"file": ("test.jpg", img_bytes, "image/jpeg")}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "image_url" in data
        assert "label" in data
        assert "confidence" in data
    
    def test_analyze_invalid_file(self, client):
        """Test with invalid file"""
        response = client.post(
            "/report/analyze",
            files={"file": ("test.txt", b"invalid", "text/plain")}
        )
        
        assert response.status_code == 400
        assert "Invalid file type" in response.json()["detail"]
    
    def test_analyze_no_file(self, client):
        """Test without file"""
        response = client.post("/report/analyze")
        
        assert response.status_code == 422

class TestReportDatabase:
    
    def test_report_creation(self, db_session):
        """Test creating report in database"""
        from app.models.report import Report
        from sqlalchemy.orm import Session
        
        report = Report(
            image_url="test.jpg",
            label="test_label",
            confidence=0.95
        )
        db_session.add(report)
        db_session.commit()
        
        result = db_session.query(Report).filter_by(label="test_label").first()
        assert result is not None
        assert result.confidence == 0.95
```

### Run Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run specific test
pytest tests/test_auth.py::TestAuthentication::test_hash_password

# Run with verbose output
pytest -v

# Run and show print statements
pytest -s
```

---

## 🧪 Frontend Testing

### Setup

```bash
cd frontend
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### Test Configuration

Update `frontend/vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
  }
})
```

Create `frontend/src/tests/setup.ts`:

```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

afterEach(() => {
  cleanup();
});
```

### Component Tests

Create `frontend/src/tests/components/LoginPage.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import LoginPage from '../../pages/LoginPage';

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('updates input fields', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    const usernameInput = screen.getByLabelText(/username/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('password123');
  });

  it('submits form with valid credentials', async () => {
    const mockLogin = vi.fn().mockResolvedValue({ access_token: 'test-token' });
    
    // Mock API call
    vi.mock('../../services/api', () => ({
      apiClient: {
        post: mockLogin
      }
    }));

    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('/auth/login', {
        username: 'testuser',
        password: 'password123'
      });
    });
  });

  it('displays error on login failure', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
```

Create `frontend/src/tests/context/AuthContext.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';

describe('AuthContext', () => {
  it('provides initial state', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('updates state on login', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    // Mock login call
    act(() => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        username: 'testuser',
        email: 'test@example.com'
      }));
    });

    // Re-render to trigger useEffect
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('clears state on logout', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
```

### Run Frontend Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run test -- --coverage

# Run specific test file
npm run test LoginPage.test.tsx

# Run in watch mode
npm run test -- --watch

# Run UI
npm run test -- --ui
```

---

## 📊 Coverage Goals

### Backend
- **Target**: 80%+ coverage
- **Critical paths**: Authentication, database operations, API endpoints
- **Minimum**: All public functions tested

### Frontend
- **Target**: 75%+ coverage
- **Critical paths**: Auth flows, API calls, protected routes
- **Minimum**: Components with complex logic

---

## 🔍 Integration Tests

### Full Stack Test

Create `backend/tests/test_integration.py`:

```python
def test_complete_auth_flow(client):
    """Test complete authentication flow"""
    # 1. Register new user
    register_response = client.post(
        "/auth/register",
        json={
            "email": "integration@test.com",
            "username": "integrationuser",
            "password": "securepass123"
        }
    )
    assert register_response.status_code == 200
    token = register_response.json()["access_token"]
    
    # 2. Verify user can access protected route
    me_response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_response.status_code == 200
    assert me_response.json()["username"] == "integrationuser"
    
    # 3. Logout (clear token)
    # 4. Verify can't access protected route
    assert client.get("/auth/me").status_code == 403
```

---

## 🚀 CI/CD Integration

### GitHub Actions Test Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest pytest-cov pytest-asyncio
      
      - name: Run tests
        run: cd backend && pytest --cov=app --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd frontend && npm ci
      
      - name: Run tests
        run: cd frontend && npm run test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 📝 Best Practices

1. **Test Names**: Describe what is being tested
   ```python
   # Good
   def test_login_with_valid_credentials_succeeds()
   # Bad
   def test_login()
   ```

2. **Arrange-Act-Assert**:
   ```python
   def test_example():
       # Arrange
       user_data = {"username": "test", "password": "pass"}
       
       # Act
       response = client.post("/auth/login", json=user_data)
       
       # Assert
       assert response.status_code == 200
   ```

3. **One Assertion Focus**: Each test should verify one behavior

4. **Use Fixtures**: Reuse common setup
   ```python
   @pytest.fixture
   def test_user():
       return create_user("test@example.com")
   ```

5. **Mock External Services**: Don't call real APIs
   ```python
   @mock.patch('requests.get')
   def test_with_mock(self, mock_get):
       mock_get.return_value.status_code = 200
   ```

---

**Last Updated**: March 31, 2026
**Version**: 1.0.0
