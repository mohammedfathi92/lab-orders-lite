# Lab Orders Lite

A modern laboratory order management system built with Next.js, TypeScript, Prisma, and PostgreSQL.

## Features

- **Patient Management** - Create and manage patient records
- **Test Management** - Manage laboratory tests and their configurations
- **Order Management** - Create and track lab orders with automatic cost calculation
- **Authentication** - Secure user authentication with NextAuth
- **Modern UI** - Beautiful, responsive interface built with Tailwind CSS and shadcn/ui

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (development) / SQLite (testing)
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **UI**: React, Tailwind CSS, shadcn/ui
- **State Management**: TanStack Query
- **Validation**: Zod
- **Testing**: Vitest

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL (for development)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd lab-orders-lite
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/lab_orders"
   NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database:**
   ```bash
   # Generate Prisma Client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to `http://localhost:3000`

## Important: Database Setup for Development vs Testing

This project uses **PostgreSQL for development** and **SQLite for testing**. Here's how it works:

### Development (PostgreSQL)
- Uses the main `prisma/schema.prisma` file with PostgreSQL provider
- The `npm run dev` command automatically checks and regenerates the Prisma client for PostgreSQL
- If you see database errors after running tests, run: `npm run db:generate`

### Testing (SQLite)
- Tests automatically create a temporary SQLite database
- A test schema file (`schema.test.prisma`) is created during test setup
- After tests, the test schema file is left as a marker
- The dev server detects this marker and regenerates the PostgreSQL client

### Important Workflow

**⚠️ IMPORTANT: Stop dev server before running tests!**

The recommended workflow:
```bash
# 1. Stop dev server (Ctrl+C) if running
# 2. Run tests
npm test

# 3. Start dev server (it will auto-detect and regenerate PostgreSQL client)
npm run dev
```

**Why?** Tests generate a SQLite Prisma client, which overwrites the PostgreSQL client needed for development. The dev server automatically detects when tests have run and regenerates the PostgreSQL client, but this only works if the dev server is not already running (to avoid file locks).

### Troubleshooting

**If you get database errors after running tests:**
1. Stop the dev server completely (Ctrl+C)
2. Run: `npm run db:generate`
3. Restart the dev server: `npm run dev`

**If dev server fails to start with "file lock" error:**
- The Prisma client file is locked (usually because dev server is already running)
- Stop ALL dev server instances
- Run: `npm run db:generate`
- Start dev server: `npm run dev`

**If tests fail with file lock errors:**
- Make sure no dev server is running
- Close any processes using the Prisma client
- Run tests again

## Run & Test Commands

### Development
```bash
npm run dev          # Start development server on http://localhost:3000
```

### Database
```bash
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to database (development)
npm run db:migrate   # Run database migrations (production)
npm run db:studio    # Open Prisma Studio (database GUI)
npm run db:seed      # Seed database with sample data
```

### Testing
```bash
npm test             # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage report
```

### Production
```bash
npm run build        # Build for production
npm start            # Start production server
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

## Architecture Summary

### Design Patterns

**Layered Architecture:**
- **Presentation Layer** (`app/`, `components/`) - UI components and pages
- **API Layer** (`app/api/`) - RESTful API endpoints
- **Service Layer** (`src/core/*/service.ts`) - Business logic
- **Repository Layer** (`src/core/*/repository.ts`) - Data access
- **Data Layer** (`prisma/`) - Database schema and migrations

**Key Principles:**
- **Separation of Concerns** - Clear boundaries between layers
- **Dependency Injection** - Services depend on repositories, not database
- **Single Responsibility** - Each class/function has one clear purpose
- **DRY (Don't Repeat Yourself)** - Shared utilities and reusable components

### Project Structure

```
lab-orders-lite/
│
├── prisma/                    # Database schema and migrations
│   ├── schema.prisma          # Main schema (PostgreSQL)
│   ├── schema.test.prisma     # Test schema (SQLite, auto-generated)
│   └── seed.ts                # Database seed script
│
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── (auth)/            # Authentication routes
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── api/               # API routes
│   │   │   ├── patients/      # Patient CRUD
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── tests/         # Test CRUD
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   └── orders/        # Order CRUD
│   │   │       ├── route.ts
│   │   │       └── [id]/
│   │   │           └── route.ts
│   │   ├── dashboard/         # Dashboard pages
│   │   │   ├── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── patients/      # Patient management
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   ├── tests/         # Test management
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   └── orders/        # Order management
│   │   │       ├── page.tsx
│   │   │       ├── new/
│   │   │       │   └── page.tsx
│   │   │       └── [id]/
│   │   │           └── page.tsx
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   │
│   ├── core/                  # Core business logic
│   │   ├── patients/          # Patient domain
│   │   │   ├── patient.repository.ts
│   │   │   ├── patient.service.ts
│   │   │   ├── patient.types.ts
│   │   │   └── index.ts
│   │   ├── orders/            # Order domain
│   │   │   ├── order.repository.ts
│   │   │   ├── order.service.ts
│   │   │   ├── order.types.ts
│   │   │   └── index.ts
│   │   ├── tests/             # Test domain
│   │   │   ├── test.repository.ts
│   │   │   ├── test.service.ts
│   │   │   ├── test.types.ts
│   │   │   └── index.ts
│   │   └── services.ts        # Service exports
│   │
│   ├── lib/                   # Utility libraries
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── prisma.ts          # Prisma client instance
│   │   ├── api-handler.ts     # API route handler wrapper
│   │   ├── api-response.ts    # API response utilities
│   │   ├── errors.ts          # Custom error classes
│   │   ├── logger.ts          # Logging utility
│   │   ├── utils.ts           # Utility functions
│   │   └── constants.ts       # Constants
│   │
│   ├── components/            # React components
│   │   ├── dashboard/         # Dashboard-specific components
│   │   ├── ui/                # Reusable UI components
│   │   └── providers/         # Context providers
│   │
│   ├── hooks/                 # Custom React hooks
│   │   └── use-patients.ts    # Patient data fetching hook
│   │
│   └── tests/                 # Test files
│       ├── integration/       # Integration tests
│       └── setup/             # Test setup utilities
│           ├── test-db.ts     # Test database setup
│           └── global-setup.ts # Global test setup
│
├── scripts/                   # Utility scripts
│   ├── check-env.js           # Environment variable checker
│   └── check-prisma-client.js # Prisma client checker
│
├── .env                       # Environment variables (not in git)
├── .env.example               # Example environment variables
├── .gitignore                 # Git ignore rules
├── next.config.ts             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── vitest.config.ts           # Vitest configuration
├── prisma.config.ts           # Prisma configuration
└── package.json               # Project dependencies and scripts

```

## Database Schema

### Models

- **User** - Application users (admin, regular users)
- **Patient** - Patient information and demographics
- **Test** - Laboratory tests with pricing and turnaround times
- **Order** - Lab orders with total cost and ready date calculation
- **OrderTest** - Junction table linking orders to tests

### Key Features

- **Soft Deletes** - Records are marked as deleted, not physically removed
- **Timestamps** - Automatic `createdAt` and `updatedAt` tracking
- **Relationships** - Proper foreign key relationships between entities

## API Endpoints

### Patients
- `GET /api/patients` - List all patients (with pagination and search)
- `POST /api/patients` - Create a new patient
- `GET /api/patients/[id]` - Get patient by ID
- `PUT /api/patients/[id]` - Update patient
- `DELETE /api/patients/[id]` - Delete patient (soft delete)

### Tests
- `GET /api/tests` - List all tests (with pagination and search)
- `POST /api/tests` - Create a new test
- `GET /api/tests/[id]` - Get test by ID
- `PUT /api/tests/[id]` - Update test
- `DELETE /api/tests/[id]` - Delete test (soft delete)

### Orders
- `GET /api/orders` - List all orders (with pagination and filters)
- `POST /api/orders` - Create a new order (automatically calculates total cost and ready date)
- `GET /api/orders/[id]` - Get order by ID
- `PUT /api/orders/[id]` - Update order
- `DELETE /api/orders/[id]` - Delete order (soft delete)

## Testing

Tests use SQLite for fast, isolated testing. The test setup automatically:
- Creates a temporary SQLite database for each test run
- Generates a Prisma client with SQLite schema
- Cleans up after tests complete

### Running Tests

```bash
# Watch mode (recommended for development)
npm test

# Run once
npm run test:run

# With coverage
npm run test:coverage
```

## Deployment

### Environment Variables

Make sure to set these in your production environment:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Secret key for NextAuth (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your production URL

### Build and Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

## License

This project is private and proprietary.

## Support

For issues and questions, please open an issue on GitHub.
