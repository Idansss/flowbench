# Flowbench Quick Setup Guide

## Choose Your Database Option

### Option A: Supabase (Recommended - Free & Easy) ⭐

1. **Create Supabase Account**
   - Go to https://supabase.com
   - Click "Start your project"
   - Create a new project

2. **Get Connection String**
   - Go to Project Settings → Database
   - Copy "Connection string" (Transaction mode)
   - Replace `[YOUR-PASSWORD]` with your database password

3. **Set Up Storage**
   - Go to Storage
   - Create bucket: `flowbench`
   - Set to Public
   - Copy bucket URL

4. **Update .env.local**
   ```bash
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   
   NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
   SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-KEY]
   ```

5. **Run Migrations**
   ```bash
   pnpm db:migrate
   ```

---

### Option B: Local PostgreSQL (For Advanced Users)

1. **Install PostgreSQL**
   - Windows: https://www.postgresql.org/download/windows/
   - Or use Docker:
   ```bash
   docker run --name flowbench-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:14
   ```

2. **Create Database**
   ```bash
   createdb flowbench
   # Or via psql:
   psql -U postgres -c "CREATE DATABASE flowbench;"
   ```

3. **Update .env.local**
   ```bash
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/flowbench
   ```

4. **Run Migrations**
   ```bash
   pnpm db:migrate
   ```

---

### Option C: Railway (Free Tier - Cloud PostgreSQL)

1. **Create Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create PostgreSQL Database**
   - New Project → Add PostgreSQL
   - Copy connection string

3. **Update .env.local**
   ```bash
   DATABASE_URL=[RAILWAY-CONNECTION-STRING]
   ```

4. **Run Migrations**
   ```bash
   pnpm db:migrate
   ```

---

## Quick Start (5 Minutes)

**Fastest Path: Supabase**

1. **Create Supabase project** (2 min)
2. **Copy credentials** to `.env.local` (1 min)
3. **Run `pnpm db:migrate`** (30 sec)
4. **Run `pnpm db:seed`** (30 sec)
5. **Restart dev server** (30 sec)

✅ **Done! Database ready to use.**

---

## Verify Setup

Run this to test your connection:

```bash
cd apps/web
node -e "require('./src/lib/db').sql\`SELECT NOW()\`.then(r => console.log('✅ Database connected!', r))"
```

You should see: `✅ Database connected!`

---

## Next Steps

After database is set up:

1. ✅ Excel Fix It Bot will save jobs
2. ✅ Files will persist in storage  
3. ✅ Job history will work
4. ✅ Audit logs will be saved

**Need help? Check DEPLOYMENT.md for detailed instructions.**

