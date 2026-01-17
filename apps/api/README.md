# Slate API - User Service

The user service manages user profiles, preferences, and settings for the Slate application.

## Features

- User profile management (CRUD operations)
- User settings and preferences
- Privacy controls
- Session management and tracking
- Audit logging for profile changes
- Soft delete functionality
- JWT authentication

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Installation

```bash
npm install
```

### Environment Setup

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=slate
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key
```

### Database Setup

Run migrations to create the database schema:

```bash
npm run db:migrate
```

### Running the Service

Development mode with hot reload:

```bash
npm run dev
```

Production mode:

```bash
npm run build
npm start
```

## API Endpoints

### User Profile

#### Get My Profile
```
GET /users/me
Authorization: Bearer <token>
```

Returns the authenticated user's complete profile.

#### Get User Profile (Public)
```
GET /users/:userId
Authorization: Bearer <token>
```

Returns a user's public profile (subject to privacy settings).

#### Update My Profile
```
PUT /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Software developer",
  "avatar_url": "https://example.com/avatar.jpg",
  "timezone": "America/New_York",
  "preferred_language": "en"
}
```

### User Settings

#### Get My Settings
```
GET /users/me/settings
Authorization: Bearer <token>
```

#### Update My Settings
```
PUT /users/me/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "profile_visibility": "private",
  "email_notifications": false,
  "push_notifications": true,
  "data_sharing_enabled": false
}
```

### Account Management

#### Delete My Account (Soft Delete)
```
DELETE /users/me
Authorization: Bearer <token>
```

### Session Management

#### Get My Active Sessions
```
GET /users/me/sessions
Authorization: Bearer <token>
```

#### Logout Specific Session
```
DELETE /users/me/sessions/:sessionId
Authorization: Bearer <token>
```

#### Logout All Sessions
```
DELETE /users/me/sessions?keepCurrent=true
Authorization: Bearer <token>
```

## Testing

Run all tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate coverage report:

```bash
npm run test:coverage
```

## Architecture

### Layers

1. **Routes** (`src/routes/`) - Define API endpoints
2. **Controllers** (`src/controllers/`) - Handle HTTP requests/responses
3. **Services** (`src/services/`) - Business logic
4. **Models** (`src/models/`) - Data access layer
5. **Validators** (`src/validators/`) - Input validation with Zod
6. **Middleware** (`src/middleware/`) - Authentication, validation, error handling

### Database Schema

- `users` - User profile information
- `user_settings` - User preferences and privacy settings
- `user_sessions` - Active user sessions for JWT tracking
- `user_audit_logs` - Audit trail of profile changes

## Security

- All endpoints require JWT authentication
- Passwords are hashed using bcrypt
- Sessions are tracked and can be revoked
- Soft delete prevents data loss while marking accounts as deleted
- Audit logging tracks all profile modifications
- Privacy settings control profile visibility

## Development

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

## License

Proprietary - Slate
