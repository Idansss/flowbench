# Deploy Flowbench to Vercel

**Estimated Time:** 10-15 minutes  
**Cost:** FREE (Hobby Plan)

---

## 🚀 **Step-by-Step Vercel Deployment**

### **Step 1: Create Vercel Account (2 min)**

1. Go to **https://vercel.com/signup**
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub repos
4. ✅ Done!

---

### **Step 2: Import Your Repository (1 min)**

1. Go to **https://vercel.com/new**
2. You'll see "Import Git Repository"
3. Find **`Idansss/flowbench`** in the list
4. Click **"Import"**

---

### **Step 3: Configure Project (2 min)**

Vercel will auto-detect Next.js. Configure these settings:

**Framework Preset:** Next.js ✅ (auto-detected)

**Root Directory:** `./` (leave as is)

**Build Command:** `pnpm build` ✅ (auto-detected)

**Output Directory:** `.next` ✅ (auto-detected)

**Install Command:** `pnpm install` ✅ (auto-detected)

Click **"Deploy"** (we'll add environment variables later)

---

### **Step 4: First Deploy (3-5 min)**

Vercel will:
- ✅ Clone your repository
- ✅ Install dependencies (~2 min)
- ✅ Build your app (~1-2 min)
- ✅ Deploy to edge network

**Wait for:** "Congratulations! Your project has been deployed."

You'll get a URL like: **https://flowbench-xxx.vercel.app**

---

### **Step 5: Set Up Supabase Database (5 min)**

**Why:** Your app needs a database to save jobs and files.

1. **Go to:** https://supabase.com/dashboard
2. **Create account** (if you haven't)
3. **New Project:**
   - Name: `flowbench`
   - Database Password: (save this!)
   - Region: (closest to you)
   - Click **"Create project"** (takes 2 min)

4. **Get Connection String:**
   - Go to **Settings** → **Database**
   - Copy **"Connection string"** (Transaction mode)
   - Replace `[YOUR-PASSWORD]` with your actual password

5. **Create Storage Bucket:**
   - Go to **Storage**
   - Click **"New bucket"**
   - Name: `flowbench`
   - Public bucket: ✅ Yes
   - Click **"Create bucket"**

6. **Get API Keys:**
   - Go to **Settings** → **API**
   - Copy:
     - Project URL
     - `anon` `public` key
     - `service_role` `secret` key

---

### **Step 6: Add Environment Variables to Vercel (3 min)**

1. Go to your Vercel project
2. Click **Settings** → **Environment Variables**
3. Add these variables:

```bash
# Database (REQUIRED)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Supabase Storage (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Auth (REQUIRED)
NEXTAUTH_URL=https://flowbench-xxx.vercel.app
NEXTAUTH_SECRET=<click "Generate" button>

# OpenAI (OPTIONAL - for AI tools)
OPENAI_API_KEY=sk-xxx...

# Observability (OPTIONAL)
ENABLE_SENTRY=false
ENABLE_POSTHOG=false

# Configuration (OPTIONAL)
FILE_SIZE_LIMIT_MB=50
RATE_LIMIT_PER_IP=100
CRON_SECRET=<click "Generate" button>
```

4. Click **"Save"** for each variable

---

### **Step 7: Run Database Migrations (2 min)**

**Option A: Via Supabase SQL Editor (Recommended)**

1. Go to Supabase Dashboard → **SQL Editor**
2. Open `infra/database/schema.sql` from your local project
3. Copy the entire SQL content
4. Paste into Supabase SQL Editor
5. Click **"Run"**
6. ✅ Tables created!

**Option B: Via Command Line**

```bash
# Set DATABASE_URL temporarily
$env:DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"

# Run migrations
pnpm db:migrate

# Add sample data
pnpm db:seed
```

---

### **Step 8: Redeploy with Environment Variables (1 min)**

1. Go to Vercel Dashboard
2. Click **"Deployments"** tab
3. Click **"..."** → **"Redeploy"**
4. Check **"Use existing Build Cache"** = NO
5. Click **"Redeploy"**

Vercel rebuilds with your environment variables!

---

### **Step 9: Test Your Live Site! (2 min)**

1. Wait for deployment to finish
2. Click **"Visit"** button
3. You'll see: **https://flowbench-xxx.vercel.app**

**Test:**
- ✅ Homepage loads
- ✅ Click any tool
- ✅ Upload a sample file
- ✅ Click "Run"
- ✅ Download results!

**ALL 10 TOOLS ARE LIVE!** 🎉

---

## 🎯 **Quick Checklist**

Before deploying:
- ✅ All 10 tool UIs complete
- ✅ All APIs functional
- ✅ Security measures in place
- ✅ Code pushed to GitHub

During deployment:
- ⏳ Create Vercel account
- ⏳ Import repository
- ⏳ Create Supabase project
- ⏳ Add environment variables
- ⏳ Run migrations
- ⏳ Redeploy

After deployment:
- ✅ Test all 10 tools
- ✅ Share your URL!

---

## ⚡ **Quick Deploy (Alternative)**

If you want even faster:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd C:\Users\Admin\Desktop\Flowbench
vercel

# Follow prompts!
```

---

## 🔧 **Troubleshooting**

### **Build Fails:**
- Check Node.js version (needs 18+)
- Check pnpm-lock.yaml is pushed
- Review build logs in Vercel

### **Runtime Errors:**
- Verify all environment variables set
- Check DATABASE_URL is correct
- Run migrations in Supabase

### **Database Connection Fails:**
- Verify password in connection string
- Check Supabase project is running
- Test with `pnpm db:test` locally first

---

## 📊 **Vercel Free Tier Limits**

**Generous limits for Flowbench:**
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Preview deployments for PRs

**Perfect for launching!** 🚀

---

## 🎊 **After Deployment**

### **Get a Custom Domain (Optional):**
1. Vercel Settings → **Domains**
2. Add your domain
3. Update DNS records
4. ✅ SSL certificate auto-generated!

### **Set Up Cron Job:**
Vercel will auto-run your cleanup job from `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/cleanup",
    "schedule": "0 2 * * *"  // Daily at 2 AM
  }]
}
```

### **Monitor Your App:**
- Vercel Dashboard → **Analytics**
- See page views, errors, performance
- Real-time logs

---

## ✅ **You're Ready!**

Everything is configured and ready to deploy.

**Start here:** https://vercel.com/new

**Need help?** Follow the steps above or let me know! 🚀

