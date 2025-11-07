# Testing Setup

This project uses Vitest for testing with SQLite in-memory database for integration tests.

## Running Tests

```bash
# Run all tests
npx vitest run

# Run tests in watch mode
npx vitest

# Run specific test file
npx vitest run tests/integration/api-patients.test.ts
```

## Test Structure

- `tests/setup/` - Test utilities and database setup
- `tests/integration/` - Integration tests for API routes

## Test Database

Tests use SQLite in-memory database that is created and cleaned up automatically for each test suite.
