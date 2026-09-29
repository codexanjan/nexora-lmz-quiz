# Nexora Learn - Production Deployment Guide

## 1. Environment Prerequisites

- **Node.js**: v20 LTS or v22 LTS
- **Database**: PostgreSQL 15+ (Production) / SQLite (Local/Dev)
- **Cache & Queue**: Redis 7+ (for high-volume BullMQ job scheduling)
- **Object Storage**: S3-compatible bucket (AWS S3, Cloudflare R2, MinIO, or Google Cloud Storage)

## 2. Environment Variables Configuration

Copy `.env.example` to `.env.production` and configure the production secrets:

```bash
# Database Connection (PostgreSQL connection pool)
DATABASE_URL="postgresql://nexora_user:STRONG_PASSWORD@postgres.internal:5432/nexora_prod?schema=public&connection_limit=20"

# Application Security
AUTH_SECRET="generate-with-openssl-rand-hex-32"
AUTH_URL="https://learn.yourdomain.com"
APP_URL="https://learn.yourdomain.com"
NODE_ENV="production"

# S3-Compatible Storage
STORAGE_ENDPOINT="https://s3.us-east-1.amazonaws.com"
STORAGE_BUCKET="nexora-learn-assets"
STORAGE_ACCESS_KEY="AKIA..."
STORAGE_SECRET_KEY="..."

# Redis Job Queue
REDIS_URL="redis://:REDIS_PASS@redis.internal:6379"

# Email Provider
EMAIL_PROVIDER="resend" # or "smtp", "postmark"
EMAIL_API_KEY="re_..."
EMAIL_FROM="Nexora Learn <no-reply@learn.yourdomain.com>"
```

## 3. Database Migration & Deployment Procedure

```bash
# 1. Install production dependencies
npm ci --omit=dev

# 2. Generate Prisma Client
npx prisma generate

# 3. Apply schema migrations safely
npx prisma migrate deploy

# 4. Build optimized Next.js standalone application
npm run build

# 5. Start production cluster (e.g. with PM2 or Docker)
node .next/standalone/server.js
```

## 4. Production Process Management (PM2)

```json
{
  "apps": [
    {
      "name": "nexora-web",
      "script": "node_modules/next/dist/bin/next",
      "args": "start -p 3000",
      "instances": "max",
      "exec_mode": "cluster",
      "env": {
        "NODE_ENV": "production"
      }
    }
  ]
}
```
