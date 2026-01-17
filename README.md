# Slate
One Surface for Everything.

## Overview

Slate is a comprehensive application platform providing user management, settings, and authentication services.

## Project Structure

```
slate/
├── apps/
│   └── api/                 # User service API
│       ├── src/
│       │   ├── config/      # Database and app configuration
│       │   ├── controllers/ # Request handlers
│       │   ├── middleware/  # Auth, validation, error handling
│       │   ├── models/      # Data access layer
│       │   ├── routes/      # API route definitions
│       │   ├── services/    # Business logic
│       │   ├── types/       # TypeScript type definitions
│       │   ├── utils/       # Helper functions
│       │   └── validators/  # Zod schemas
│       ├── tests/           # Unit and integration tests
│       ├── migrations/      # Database migrations
│       └── scripts/         # Utility scripts
└── docker-compose.yml       # Local development setup
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Docker (optional, for containerized setup)

### Installation

```bash
# Install dependencies
npm install

# Set up environment
cp apps/api/.env.example apps/api/.env

# Start PostgreSQL (if using Docker)
docker-compose up -d postgres

# Run migrations
npm run db:migrate --workspace=apps/api

# Seed test data (optional)
npm run db:seed --workspace=apps/api

# Start development server
npm run dev
```

The API will be available at `http://localhost:3000`.

## Services

### User Service

Manages user profiles, preferences, and settings. See [apps/api/README.md](apps/api/README.md) for detailed API documentation.

**Key Features:**
- User profile management
- Privacy and notification settings
- Session tracking and management
- Audit logging
- Soft delete functionality
- JWT authentication

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage --workspace=apps/api
```

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## Deployment

### Using Docker

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f api
```

### Manual Deployment

```bash
# Build the application
npm run build --workspace=apps/api

# Start the production server
NODE_ENV=production npm start --workspace=apps/api
```

## Environment Variables

See `apps/api/.env.example` for required environment variables.

## License

Proprietary - Slate
