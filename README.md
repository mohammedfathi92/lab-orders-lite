# Lab Orders Lite

A modern laboratory order management system built with Next.js, featuring patient management, order processing, and test configuration.

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Utility-first CSS framework
- **Shadcn UI** - Component library (New York style)
- **Inter Font** - Typography
- **Lucide React** - Icon library
- **React Query (TanStack Query)** - Server state management
- **date-fns** - Date formatting

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - ORM for database access
- **PostgreSQL** - Primary database (SQLite for testing)
- **NextAuth.js** - Authentication
- **Zod** - Schema validation
- **bcrypt** - Password hashing

### Testing
- **Vitest** - Unit and integration testing
- **Supertest** - API testing
- **Testing Library** - React component testing
- **SQLite (in-memory)** - Test database

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking
- **Prisma Studio** - Database GUI

## Folder Structure

```
lab-orders-lite/
├── prisma/                       # Database
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Database seeding
│
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Auth route group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── api/                  # API routes
│   │   │   ├── auth/             # Authentication endpoints
│   │   │   │   ├── [...nextauth]/
│   │   │   │   │   └── route.ts
│   │   │   │   └── register/
│   │   │   │       └── route.ts
│   │   │   ├── patients/         # Patient CRUD
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── tests/            # Test CRUD
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   └── orders/           # Order CRUD
│   │   │       ├── route.ts
│   │   │       └── [id]/
│   │   │           └── route.ts
│   │   ├── dashboard/            # Dashboard pages
│   │   │   ├── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── patients/         # Patient management
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   ├── tests/            # Test management
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   └── orders/           # Order management
│   │   │       ├── page.tsx
│   │   │       ├── new/
│   │   │       │   └── page.tsx
│   │   │       └── [id]/
│   │   │           └── page.tsx
│   │   ├── globals.css           # Global styles
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Home page
│   │
│   ├── core/                     # Core business logic
│   │   ├── patients/             # Patient domain
│   │   │   ├── patient.repository.ts
│   │   │   ├── patient.service.ts
│   │   │   ├── patient.types.ts
│   │   │   └── index.ts
│   │   ├── orders/               # Order domain
│   │   │   ├── order.repository.ts
│   │   │   ├── order.service.ts
│   │   │   ├── order.types.ts
│   │   │   └── index.ts
│   │   ├── tests/                # Test domain
│   │   │   ├── test.repository.ts
│   │   │   ├── test.service.ts
│   │   │   ├── test.types.ts
│   │   │   └── index.ts
│   │   └── services.ts           # Service exports
│   │
│   ├── lib/                      # Utility libraries
│   │   ├── auth.ts               # NextAuth configuration
│   │   ├── prisma.ts             # Prisma client instance
│   │   ├── api-handler.ts        # API route handler wrapper
│   │   ├── api-response.ts       # API response utilities
│   │   ├── errors.ts             # Custom error classes
│   │   ├── logger.ts             # Logging utility
│   │   ├── utils.ts              # Utility functions
│   │   └── constants.ts          # Constants
│   │
│   ├── components/               # React components
│   │   ├── dashboard/            # Dashboard-specific components
│   │   │   ├── empty-state.tsx
│   │   │   ├── orders-table.tsx
│   │   │   ├── patients-table.tsx
│   │   │   ├── sidebar-nav.tsx
│   │   │   ├── stats-cards.tsx
│   │   │   └── tests-table.tsx
│   │   ├── providers/            # Context providers
│   │   │   ├── query-provider.tsx    # React Query provider
│   │   │   └── session-provider.tsx  # NextAuth provider
│   │   ├── ui/                   # Shadcn UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── select.tsx
│   │   │   └── ...
│   │   ├── hide-dev-panel.tsx
│   │   └── logout-button.tsx
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── use-patients.ts       # Patient data hooks
│   │   ├── use-orders.ts         # Order data hooks
│   │   └── use-mobile.ts
│   │
│   ├── tests/                    # Test files
│   │   ├── integration/          # Integration tests
│   │   │   ├── api-orders.test.ts
│   │   │   └── api-patients.test.ts
│   │   ├── setup/                # Test utilities
│   │   │   ├── test-db.ts
│   │   │   ├── test-helpers.ts
│   │   │   └── test-utils.ts
│   │   └── README.md
│   │
│   └── types/                    # TypeScript type definitions
│       ├── api.ts
│       └── next-auth.d.ts
│
├── proxy.ts                      # Next.js proxy (formerly middleware)
├── vitest.config.ts              # Vitest configuration
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind configuration
└── package.json                  # Dependencies
```

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (or SQLite for development)
- npm or yarn package manager

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
- **Dependency Injection** - Services depend on repositories
- **Single Responsibility** - Each module has one clear purpose
- **Type Safety** - Full TypeScript coverage

### Data Flow

1. **User Interaction** → React Component
2. **Component** → React Query Hook (`hooks/use-*.ts`)
3. **Hook** → API Route (`app/api/*/route.ts`)
4. **API Route** → Service (`src/core/*/service.ts`)
5. **Service** → Repository (`src/core/*/repository.ts`)
6. **Repository** → Prisma Client → Database

### Features

**Authentication:**
- NextAuth.js with credentials provider
- Session-based authentication
- Protected routes via proxy (formerly middleware)
- Password hashing with bcrypt

**State Management:**
- React Query for server state
- Optimistic updates for mutations
- Automatic cache invalidation
- URL-based pagination and search state

**Data Validation:**
- Zod schemas for runtime validation
- Type-safe API requests/responses
- Form validation with error handling

**UI/UX:**
- Responsive design with Tailwind CSS
- Shadcn UI components
- Toast notifications
- Loading states and skeletons
- Empty states
- Optimistic UI updates

**Testing:**
- Integration tests for API routes
- SQLite in-memory test database
- Test utilities for mocking Prisma
- Vitest for fast test execution

### API Endpoints

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

**Patients:**
- `GET /api/patients?page=1&limit=10&search=John` - List patients (paginated, searchable)
- `POST /api/patients` - Create patient

**Orders:**
- `GET /api/orders?page=1&limit=10&search=Jane` - List orders (paginated, searchable)
- `POST /api/orders` - Create order

**Tests:**
- `GET /api/tests` - List all tests
- `POST /api/tests` - Create test

## Future Improvements

### Features
- [ ] **Order Status Tracking** - Track order progress (pending, processing, completed)
- [ ] **Email Notifications** - Send order confirmations and updates
- [ ] **PDF Reports** - Generate printable order reports
- [ ] **Bulk Operations** - Create multiple orders at once
- [ ] **Advanced Filtering** - Filter by date ranges, cost ranges, status
- [ ] **Export Functionality** - Export data to CSV/Excel
- [ ] **Patient History** - View all orders for a specific patient
- [ ] **Test Templates** - Create and save test combinations
- [ ] **User Roles & Permissions** - Admin, Lab Technician, Receptionist roles
- [ ] **Audit Logging** - Track all changes to records

### Technical
- [ ] **Real-time Updates** - WebSocket support for live order updates
- [ ] **Caching Strategy** - Redis for session and query caching
- [ ] **Rate Limiting** - Protect API endpoints from abuse
- [ ] **API Documentation** - OpenAPI/Swagger documentation
- [ ] **E2E Testing** - Playwright or Cypress tests
- [ ] **Performance Monitoring** - APM integration
- [ ] **Error Tracking** - Sentry or similar error tracking
- [ ] **CI/CD Pipeline** - Automated testing and deployment
- [ ] **Docker Support** - Containerization for easy deployment
- [ ] **Multi-tenancy** - Support for multiple organizations

### UI/UX
- [ ] **Dark Mode** - Theme switching
- [ ] **Keyboard Shortcuts** - Power user features
- [ ] **Drag & Drop** - Reorder tests in order creation
- [ ] **Advanced Search** - Multi-field search with filters
- [ ] **Data Visualization** - Charts and graphs for statistics
- [ ] **Mobile App** - React Native mobile application
- [ ] **Offline Support** - PWA with offline capabilities

### Security
- [ ] **2FA** - Two-factor authentication
- [ ] **Password Reset** - Email-based password recovery
- [ ] **Session Management** - View and manage active sessions
- [ ] **API Keys** - Programmatic access for integrations
- [ ] **Data Encryption** - Encrypt sensitive data at rest

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For issues or questions:
- Check the console for error messages
- Review the browser's Network tab for API errors
- Verify database connection and environment variables
- Check Prisma schema and migrations
