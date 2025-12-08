# Testing Directory

This directory contains all automated tests for the Stock-Room application, organized into two main sections:

## Structure

### `/unit` - Unit Tests (Mocha/Chai)
Contains unit tests using Mocha test framework with Chai assertions. These tests focus on individual functions, components, and business logic.

**Files:**
- `.mocharc.json` - Mocha configuration file
- Add your test files with `.test.js` extension

**Running unit tests:**
```bash
npm run test:unit
# or
mocha
```

### `/e2e` - End-to-End Tests (Cypress)
Contains end-to-end tests using Cypress. These tests validate complete user workflows across the entire application.

**Files:**
- `cypress.config.js` - Cypress configuration file
- `/support/e2e.js` - Cypress support/configuration file
- Add your test files with `.cy.js` extension

**Running E2E tests:**
```bash
npm run test:e2e
# or
npx cypress open
```

## Getting Started

1. Install testing dependencies:
   ```bash
   npm install --save-dev mocha chai cypress
   ```

2. Add test scripts to `package.json`:
   ```json
   {
     "scripts": {
       "test:unit": "mocha",
       "test:e2e": "cypress open",
       "test:e2e:headless": "cypress run"
     }
   }
   ```

3. Start writing tests in the appropriate directories

## Best Practices

- **Unit Tests:** Test individual functions, services, and components in isolation
- **E2E Tests:** Test complete user journeys and application workflows
- Keep tests focused and maintainable
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
