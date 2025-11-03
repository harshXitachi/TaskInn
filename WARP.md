# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

TaskInn is a micro-task marketplace platform built with Next.js 15, PostgreSQL (via Supabase), and Drizzle ORM. The platform connects employers who post tasks with workers who complete them, featuring payment processing through PayPal and CoinPayments (USDT).

**Key Technologies:**
- Next.js 15 (App Router with Turbopack)
- React 19
- TypeScript 5
- Drizzle ORM with PostgreSQL
- Supabase (auth & database hosting)
- PayPal & CoinPayments integration
- Radix UI components
- Tailwind CSS 4
- Framer Motion for animations

## Development Commands

### Core Commands
```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint the codebase
npm run lint
```

### Database Commands
```bash
# Generate Drizzle migrations after schema changes
npx drizzle-kit generate

# Push schema changes to database (dev only)
npx drizzle-kit push

# Open Drizzle Studio to inspect database
npx drizzle-kit studio

# Run seed scripts
npx tsx scripts/seed-categories.ts
npx tsx scripts/seed-admin-settings.ts
npx tsx scripts/reset-admin-settings.ts
```

## Architecture

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (RESTful endpoints)
│   │   ├── admin/         # Admin-related endpoints
│   │   ├── auth/          # Authentication endpoints
│   │   ├── categories/    # Category management
│   │   ├── disputes/      # Dispute handling
│   │   ├── payments/      # Payment processing
│   │   ├── reviews/       # Review system
│   │   ├── submissions/   # Task submissions
│   │   ├── tasks/         # Task CRUD operations
│   │   ├── users/         # User management
│   │   ├── wallets/       # Wallet operations
│   │   └── workers/       # Worker-specific endpoints
│   ├── dashboard/         # Main dashboard (role-based routing)
│   │   ├── admin/         # Admin panel routes
│   │   ├── earnings/      # Worker earnings
│   │   ├── employer/      # Employer dashboard
│   │   ├── profile/       # User profile
│   │   ├── submissions/   # Submission management
│   │   └── tasks/         # Task management
│   ├── auth/              # Auth flow pages
│   ├── login/             # Login page
│   └── signup/            # Signup page
├── components/            # React components
│   └── sections/          # Landing page sections
├── db/                    # Database layer
│   ├── schema.ts          # Drizzle ORM schema definitions
│   ├── index.ts           # Database client configuration
│   └── seeds/             # Database seed scripts
├── lib/                   # Utility libraries
│   ├── payments/          # Payment integrations
│   ├── supabase/          # Supabase client setup
│   ├── coinpayments.ts    # CoinPayments API wrapper
│   ├── paypal-rest.ts     # PayPal REST API wrapper
│   └── utils.ts           # Utility functions (cn helper)
└── visual-edits/          # Visual editing system (Orchids integration)
    ├── VisualEditsMessenger.tsx    # Client-side visual edit handler
    └── component-tagger-loader.js  # Webpack loader for component tagging
```

### Database Schema

The application uses Drizzle ORM with PostgreSQL. Key tables:

**Core Tables:**
- `user` - User accounts with role-based access (worker/employer/admin)
- `session` - User sessions
- `account` - OAuth provider accounts
- `verification` - Email verification tokens

**Business Logic Tables:**
- `categories` - Task categories
- `tasks` - Task postings with slots and pricing
- `taskSubmissions` - Worker submissions for tasks
- `payments` - Payment transactions (PayPal/USDT)
- `reviews` - Rating system for tasks
- `disputes` - Dispute resolution system
- `wallets` - Multi-currency wallets (USD/USDT_TRC20)
- `walletTransactions` - Transaction history
- `userStats` - Aggregated user statistics
- `adminSettings` - Platform-wide settings (commission rate, etc.)

**Important Relationships:**
- Tasks belong to employers and have multiple submissions
- Submissions link workers to tasks
- Payments reference submissions
- Each user can have multiple wallets (USD and USDT)
- Reviews connect reviewers and reviewees through tasks

### State Management & Data Flow

**Server-Side Pattern:**
- API routes in `src/app/api/*/route.ts` handle CRUD operations
- Database queries use Drizzle ORM with the `db` client from `src/db/index.ts`
- Authentication handled via Supabase sessions
- Role-based authorization checks in API routes

**Client-Side Pattern:**
- React Server Components for initial data fetching
- Client components marked with `"use client"`
- Form handling with `react-hook-form` + `zod` validation
- Toast notifications via `sonner`

### Payment Integration

**Two Payment Systems:**

1. **PayPal** (traditional payments)
   - REST API wrapper in `src/lib/paypal-rest.ts`
   - Uses PayPal Server SDK
   - Configured with `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`

2. **CoinPayments** (cryptocurrency - USDT TRC20)
   - API wrapper in `src/lib/coinpayments.ts`
   - Handles crypto withdrawals and deposits
   - IPN (Instant Payment Notification) callbacks
   - Configured with multiple keys: `COINPAYMENTS_PUBLIC_KEY`, `COINPAYMENTS_PRIVATE_KEY`, etc.

**Wallet System:**
- Users maintain separate USD and USDT_TRC20 balances
- All transactions logged in `walletTransactions`
- Platform takes commission on completed tasks (configurable in `adminSettings`)

### Visual Editing System

The project includes a custom visual editing system (Orchids integration):

- **VisualEditsMessenger** - Client component that enables in-browser visual editing
- **component-tagger-loader** - Webpack loader that tags React components with metadata
- Enabled via Turbopack configuration in `next.config.ts`
- Allows real-time editing of text, styles, and images
- Changes are tracked and can be synced back to source code

### Authentication

- Uses Supabase for authentication backend
- Session management via `@supabase/ssr`
- User roles: `worker`, `employer`, `admin`
- Role-based route protection in dashboard

## Configuration

### Environment Variables

Required variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string (Supabase)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-only)
- `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` - PayPal credentials
- `COINPAYMENTS_*` - Multiple CoinPayments API keys and secrets

### TypeScript Configuration

- Path alias: `@/*` maps to `./src/*`
- Strict mode enabled
- Target: ES2017

### Next.js Configuration

- Image optimization allows all remote hostnames
- TypeScript and ESLint errors ignored during builds (configured for production)
- Turbopack loader for visual editing system
- Output file tracing for monorepo support

## Development Workflow

### Making Schema Changes

1. Update `src/db/schema.ts` with new table definitions or modifications
2. Generate migration: `npx drizzle-kit generate`
3. Review migration files in `drizzle/` directory
4. Apply migration: `npx drizzle-kit push` (or use your migration runner)
5. Update TypeScript types automatically (Drizzle infers types from schema)

### Adding API Routes

API routes follow Next.js App Router conventions:
- Place in `src/app/api/[resource]/route.ts`
- Export named functions: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`
- Return `Response` or use `NextResponse.json()`
- Check authentication and authorization before database operations
- Use Drizzle ORM for all database queries

### Working with Payments

**PayPal:**
- Use `src/lib/paypal-rest.ts` wrapper functions
- Create orders, capture payments, process refunds
- Always verify payment status before updating database

**CoinPayments:**
- Use `src/lib/coinpayments.ts` wrapper
- Handle IPN callbacks for async payment verification
- Verify IPN signatures before processing

### Component Development

- Use Radix UI primitives for accessible components
- Style with Tailwind CSS (v4 with new `@tailwindcss/postcss`)
- Animations via Framer Motion
- Utility function `cn()` for conditional class merging
- Components in `src/components/` are organized by feature

## Common Patterns

### Database Queries
```typescript
import { db } from '@/db';
import { tasks, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Query example
const task = await db.query.tasks.findFirst({
  where: eq(tasks.id, taskId),
  with: {
    employer: true,
    category: true,
  },
});
```

### API Route Authentication
```typescript
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // ... handle request
}
```

### Role-Based Access
Check user role from database after authentication, as the role is stored in the `user` table, not in Supabase auth metadata.

## Important Notes

- **Never expose sensitive keys** in client-side code
- Use `NEXT_PUBLIC_*` prefix only for client-safe variables
- **Payment processing:** Always verify payment status from provider before crediting wallets
- **Transaction safety:** Use database transactions for multi-step operations (especially wallet updates)
- **Commission handling:** Platform commission is configured in `adminSettings.commissionRate`
- **Slot management:** Tasks have `slots` (total available) and `slotsFilled` (current submissions)
- **Visual editing system:** Only active when loaded in an iframe with Orchids parent

## Debugging

- Use Drizzle Studio to inspect database: `npx drizzle-kit studio`
- Check Next.js build output for route and bundle information
- Payment issues: Check provider dashboards (PayPal/CoinPayments) for transaction logs
- Authentication issues: Verify Supabase configuration and check session cookies
