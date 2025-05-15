# Authentication Module

This module implements user authentication for the Career Guidance system. It provides routes for user registration, login, logout, and session management.

## Features

- User registration with data validation
- Secure password hashing
- Session management with Flask-Login
- Login and logout functionality
- API endpoints for frontend integration

## Database Model

The User model has been extended with additional fields:

```python
class User(db.Model, UserMixin):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(100), nullable=False, unique=True)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(100), nullable=False)
    mobile = db.Column(db.String(15), nullable=True)
    address = db.Column(db.Text, nullable=True)
    qualification = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
```

## API Endpoints

### Registration

- **URL:** `/api/register`
- **Method:** `POST`
- **Required Fields:** `name`, `email`, `password`, `qualification`
- **Optional Fields:** `mobile`, `address`
- **Description:** Registers a new user and logs them in

### Login

- **URL:** `/api/login`
- **Method:** `POST`
- **Required Fields:** `email`, `password`
- **Description:** Authenticates a user and creates a session

### Logout

- **URL:** `/api/logout`
- **Method:** `POST`
- **Description:** Ends the user's session

### Check Authentication Status

- **URL:** `/api/check-auth`
- **Method:** `GET`
- **Description:** Checks if a user is currently authenticated

### Get Current User

- **URL:** `/api/user`
- **Method:** `GET`
- **Description:** Retrieves the current user's information (requires authentication)

## Integration with Frontend

The authentication system is designed to work with both server-side sessions and client-side localStorage for better user experience. The frontend should:

1. Store user data in localStorage after successful login/registration
2. Send session cookies with requests to maintain server-side session
3. Check authentication status on page load
4. Clear localStorage on logout

### Example Usage in Frontend

```javascript
// Login
const handleLogin = async (email, password) => {
  try {
    const response = await axios.post('/api/login', { email, password });
    
    if (response.data.success) {
      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.data));
      // Redirect to dashboard or home page
      window.location.href = '/career';
    }
  } catch (error) {
    console.error('Login failed:', error);
    // Handle error
  }
};

// Check if user is logged in
const checkAuth = async () => {
  try {
    const response = await axios.get('/api/check-auth');
    
    if (response.data.authenticated) {
      // User is authenticated
      return response.data.data;
    } else {
      // User is not authenticated
      return null;
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    return null;
  }
};

// Logout
const handleLogout = async () => {
  try {
    await axios.post('/api/logout');
    // Clear localStorage
    localStorage.removeItem('user');
    // Redirect to login page
    window.location.href = '/signup';
  } catch (error) {
    console.error('Logout failed:', error);
    // Handle error
  }
};
```

## Security Considerations

- Passwords are hashed using Werkzeug's `generate_password_hash` function
- Sessions are managed by Flask-Login with secure cookies
- Input validation is performed on all user-submitted data
- CORS is configured to support secure cross-origin requests with credentials

## Migration

If you're updating an existing installation, run the migration script to add the new fields to the User model:

```bash
python backend/migrations/update_user_model.py
``` 