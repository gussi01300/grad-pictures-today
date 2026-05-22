# Grad-Pictures.today

AI-powered graduation photo generation platform built with Next.js 15, TypeScript, and TailwindCSS.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start Docker services
docker-compose -f docker-compose.dev.yml up -d

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Queue**: Redis with BullMQ
- **Storage**: Cloudflare R2 (S3-compatible)
- **Payments**: Stripe
- **AI**: OpenRouter API (Claude model)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/          # Public pages
│   ├── (auth)/            # Auth pages (login, register, admin)
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   └── gallery/          # Gallery components
├── lib/                   # Utilities and clients
│   ├── db.ts            # Prisma client
│   ├── redis.ts         # Redis client
│   ├── r2.ts            # R2/S3 client
│   ├── stripe.ts        # Stripe client
│   ├── openrouter.ts    # OpenRouter API client
│   ├── auth.ts          # JWT authentication
│   └── security.ts      # Security utilities
├── services/              # Business logic services
│   ├── generation.service.ts
│   ├── storage.service.ts
│   └── payment.service.ts
├── workers/               # Background workers
│   └── generation.worker.ts
└── types/                 # TypeScript types
```

## Features

- **Yearbook Photos**: Generate formal yearbook-style portraits with optional reference image matching
- **Graduation Portraits**: Create cinematic portraits with customizable backgrounds and styles
- **AI Generation**: State-of-the-art AI powered by OpenRouter (Claude)
- **Stripe Payments**: Secure checkout with webhook verification
- **Admin Dashboard**: Manage users, payments, and content
- **Rate Limiting**: Protection against abuse
- **Automatic Cleanup**: Expired uploads and generations are automatically deleted

## Environment Variables

See `.env.example` for all required environment variables.

## Docker Deployment

```bash
# Production
docker-compose -f docker-compose.prod.yml up -d

# Development
docker-compose -f docker-compose.dev.yml up -d
```

## API Routes

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Get current session
- `POST /api/generation` - Start image generation
- `GET /api/generation/status` - Get generation status
- `POST /api/upload` - Upload an image
- `POST /api/webhook/stripe` - Stripe webhook handler
- `GET /api/admin/dashboard` - Admin dashboard data

## License

Proprietary - All rights reserved.