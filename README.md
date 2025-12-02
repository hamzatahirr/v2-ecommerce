# 🛍️ Multi-Vendor E-Commerce Platform

A complete full-stack multi-vendor e-commerce marketplace with JazzCash payment integration, real-time chat, seller wallet management, and comprehensive admin dashboard.

![Platform Preview](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Multi-Vendor+E-Commerce+Platform)

## 🚀 Features

### 🛒 Customer Experience
- **Product Catalog**: Advanced search, filtering, and categorization
- **Shopping Cart**: Persistent cart with real-time updates
- **JazzCash Payments**: Secure Pakistani payment gateway
- **Order Tracking**: Complete order lifecycle management
- **Real-time Chat**: Direct communication with sellers
- **Product Reviews**: Rating and review system
- **Mobile Responsive**: Optimized for all devices

### 👨‍💼 Seller Management
- **Store Creation**: Complete seller onboarding process
- **Product Management**: Inventory, variants, and pricing
- **Order Processing**: Manage customer orders and fulfillment
- **Wallet System**: Earnings tracking with 7-day security hold
- **Payout Management**: Bank/JazzCash withdrawal requests
- **Analytics Dashboard**: Sales performance and insights

### 👑 Admin Control
- **User Management**: Customer, seller, and admin accounts
- **Product Moderation**: Approve/reject seller products
- **Commission Setup**: Category-based commission rates
- **Analytics**: Platform-wide performance metrics
- **Payout Processing**: Approve seller withdrawal requests
- **Domain Management**: Allowed domains for sellers

### 💳 Payment & Financial
- **JazzCash Integration**: Complete payment gateway
- **Category-Based Commissions**: Database-driven rates
- **Seller Wallets**: Auto-crediting with hold periods
- **Transaction History**: Complete audit trail
- **Multi-Currency Support**: PKR with conversion options

### 🔧 Technical Features
- **Real-time Communication**: Socket.io for chat
- **Role-Based Access**: 4 user types with granular permissions
- **API Versioning**: v1/v2 REST APIs
- **File Uploads**: Cloudinary integration
- **Email Notifications**: SMTP-based system
- **Audit Logging**: Complete activity tracking

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit + RTK Query
- **Real-time**: Socket.io Client
- **Deployment**: Vercel/Railway

### Backend
- **Runtime**: Node.js + Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT
- **Payments**: JazzCash Gateway
- **File Storage**: Cloudinary
- **Deployment**: Railway

### DevOps & Tools
- **Containerization**: Docker
- **Version Control**: Git
- **CI/CD**: GitHub Actions
- **Monitoring**: Winston Logging
- **Testing**: Jest
- **Linting**: ESLint + Prettier

## 📁 Project Structure

```
ecommerce-platform/
├── client/                 # Next.js Frontend
│   ├── app/               # Next.js App Router
│   ├── components/        # Reusable UI Components
│   ├── store/            # Redux Store & APIs
│   ├── types/            # TypeScript Definitions
│   └── public/           # Static Assets
├── server/                # Express.js Backend
│   ├── src/
│   │   ├── modules/      # Business Logic Modules
│   │   ├── infra/        # Infrastructure (DB, Cache, etc.)
│   │   ├── shared/       # Shared Utilities
│   │   └── routes/       # API Route Definitions
│   ├── prisma/           # Database Schema & Migrations
│   └── seeds/            # Database Seeding
├── docker/                # Docker Configuration
├── docker-compose.yml     # Local Development
├── railway.json          # Railway Configuration
└── README.md             # This file
```

## 🚀 Railway Deployment Guide

### **Do You Need Docker for Railway?**

**Answer**: Docker is **recommended** but **not required**. Railway can deploy Node.js apps natively, but Docker gives you:

✅ **Better Control**: Exact environment configuration
✅ **Consistency**: Same setup across all environments
✅ **Dependencies**: Precise Node.js and system packages
✅ **Multi-Service**: Easy management of frontend + backend
✅ **Reproducibility**: Identical deployments every time

**Verdict**: Use Docker for professional deployment.

---

## 📋 Step-by-Step Railway Deployment

### **Step 1: Prerequisites**

#### **Required Accounts & Tools**
```bash
# 1. Create Railway Account
# Visit: https://railway.app
# Sign up with GitHub (recommended)

# 2. Install Railway CLI
npm install -g @railway/cli

# 3. Install Docker (if not already installed)
# Download from: https://docker.com

# 4. Clone your repository
git clone <your-repo-url>
cd ecommerce-platform
```

#### **Required Services & Credentials**
1. **PostgreSQL Database** (Railway provides this)
2. **Redis Instance** (Railway provides this)
3. **JazzCash API Credentials** (from JazzCash merchant portal)
4. **Cloudinary Account** (for file uploads)
5. **SMTP Service** (Gmail, SendGrid, etc. for emails)

---

### **Step 2: Prepare Your Codebase**

#### **Create Railway Configuration**
```bash
# Create railway.json in root directory
touch railway.json
```

**railway.json** content:
```json
{
  "build": {
    "builder": "dockerfile",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### **Create Root Dockerfile**
```dockerfile
# Multi-stage build for both client and server
FROM node:18-alpine AS base

# Install dependencies for both client and server
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci

# Build client
FROM base AS client-builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY client/ ./client/
COPY package*.json ./

# Build client for production
RUN cd client && npm run build

# Production stage
FROM base AS production
WORKDIR /app

# Install production dependencies only
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

# Copy built client
COPY --from=client-builder /app/client/.next ./client/.next
COPY --from=client-builder /app/client/public ./client/public
COPY --from=client-builder /app/client/package.json ./client/

# Copy server source
COPY server/ ./server/

# Expose ports
EXPOSE 3000 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start both services
CMD ["npm", "run", "start:prod"]
```

#### **Create Root package.json Scripts**
```json
{
  "name": "ecommerce-platform",
  "version": "1.0.0",
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix server\" \"npm run dev --prefix client\"",
    "build": "npm run build --prefix client && npm run build --prefix server",
    "start:prod": "node server/dist/server.js",
    "docker:build": "docker build -t ecommerce-platform .",
    "docker:run": "docker run -p 3000:3000 -p 5000:5000 ecommerce-platform"
  },
  "devDependencies": {
    "concurrently": "^7.6.0"
  }
}
```

---

### **Step 3: Set Up Railway Project**

#### **Create Railway Project**
```bash
# Login to Railway
railway login

# Create new project
railway init ecommerce-platform

# Link to existing project (if created via web)
railway link
```

#### **Add Required Services**
```bash
# Add PostgreSQL database
railway add postgres

# Add Redis instance
railway add redis

# Verify services are added
railway services
```

---

### **Step 4: Configure Environment Variables**

#### **Set Environment Variables in Railway**
```bash
# Database (Railway provides these automatically)
railway variables set DATABASE_URL
railway variables set REDIS_URL

# Server Configuration
railway variables set PORT=5000
railway variables set NODE_ENV=production

# JWT & Security
railway variables set JWT_SECRET=your-super-secret-jwt-key-here
railway variables set JWT_EXPIRES_IN=7d
railway variables set COOKIE_SECRET=your-cookie-secret-here
railway variables set SESSION_SECRET=your-session-secret-here

# Client URLs (Railway provides these)
railway variables set CLIENT_URL_PROD
railway variables set CLIENT_URL_DEV

# JazzCash Payment Gateway
railway variables set JAZZCASH_API_KEY=your_jazzcash_api_key
railway variables set JAZZCASH_SECRET=your_jazzcash_secret
railway variables set JAZZCASH_MERCHANT_ID=your_merchant_id
railway variables set JAZZCASH_RETURN_URL=https://your-app.railway.app/api/webhook/jazzcash
railway variables set JAZZCASH_CANCEL_URL=https://your-app.railway.app/payment/cancel
railway variables set JAZZCASH_TEST_MODE=false

# Payment Testing
railway variables set PAYMENT_BYPASS=false

# Cloudinary (File Uploads)
railway variables set CLOUDINARY_CLOUD_NAME=your_cloudinary_name
railway variables set CLOUDINARY_API_KEY=your_cloudinary_key
railway variables set CLOUDINARY_API_SECRET=your_cloudinary_secret

# Email Configuration
railway variables set SMTP_HOST=smtp.gmail.com
railway variables set SMTP_PORT=587
railway variables set SMTP_USER=your-email@gmail.com
railway variables set SMTP_PASS=your-app-password

# CORS
railway variables set ALLOWED_ORIGINS=https://your-app.railway.app,https://your-frontend-domain.com
```

#### **Get Railway-Provided Variables**
```bash
# Railway automatically provides these - copy from dashboard
railway variables get DATABASE_URL
railway variables get REDIS_URL
railway variables get CLIENT_URL_PROD
```

---

### **Step 5: Database Setup**

#### **Run Database Migrations**
```bash
# Connect to Railway PostgreSQL
railway connect postgres

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed database (optional)
npm run seed
```

---

### **Step 6: Deploy to Railway**

#### **Deploy Your Application**
```bash
# Push changes to GitHub
git add .
git commit -m "Add Railway deployment configuration"
git push origin main

# Railway will auto-deploy from GitHub
# Monitor deployment in Railway dashboard
railway logs
```

#### **Check Deployment Status**
```bash
# Check if services are running
railway status

# View application logs
railway logs

# Get application URL
railway domain
```

---

### **Step 7: Configure Domain & SSL**

#### **Add Custom Domain (Optional)**
```bash
# Add custom domain
railway domain add yourdomain.com

# Railway automatically provides SSL certificate
# Your app will be available at:
# - Railway domain: https://your-app.railway.app
# - Custom domain: https://yourdomain.com
```

---

### **Step 8: Testing & Verification**

#### **Test Your Deployment**
```bash
# Test health endpoint
curl https://your-app.railway.app/health

# Test API endpoints
curl https://your-app.railway.app/api/v1/products

# Test frontend
open https://your-app.railway.app
```

#### **Verify Key Features**
- ✅ Frontend loads correctly
- ✅ API endpoints respond
- ✅ Database connections work
- ✅ Redis cache functions
- ✅ JazzCash integration works
- ✅ User registration/login works
- ✅ Product browsing works
- ✅ Payment processing works

---

### **Step 9: Post-Deployment Configuration**

#### **Set Up Admin Account**
```bash
# Create superadmin account via API or database
# Use the seeded accounts or create manually
```

#### **Configure Payment Webhooks**
```bash
# Update JazzCash merchant dashboard with:
# Return URL: https://your-app.railway.app/api/webhook/jazzcash
# Cancel URL: https://your-app.railway.app/payment/cancel
```

#### **Set Up Monitoring**
```bash
# Railway provides basic monitoring
# Consider adding external monitoring for production
```

---

## 🐛 Troubleshooting Railway Deployment

### **Common Issues & Solutions**

#### **Build Failures**
```bash
# Check build logs
railway logs --build

# Common fixes:
# 1. Check Dockerfile syntax
# 2. Ensure all dependencies are in package.json
# 3. Verify environment variables are set
```

#### **Database Connection Issues**
```bash
# Verify DATABASE_URL
railway variables get DATABASE_URL

# Test database connection
railway connect postgres
# Then run: \dt (to list tables)
```

#### **Environment Variables**
```bash
# List all variables
railway variables

# Update a variable
railway variables set VARIABLE_NAME=new_value
```

#### **Port Issues**
```bash
# Railway exposes port 3000 by default for Next.js
# Our Dockerfile exposes both 3000 and 5000
# Railway will route traffic correctly
```

#### **Memory/Performance Issues**
```bash
# Upgrade Railway plan if needed
# Optimize database queries
# Add Redis caching
# Use Railway's performance monitoring
```

---

## 💰 Railway Pricing & Costs

### **Free Tier (First Project)**
- **$5/month credit** (sufficient for small production app)
- **PostgreSQL**: Included
- **Redis**: Included
- **Bandwidth**: 512GB/month
- **Custom Domains**: Free

### **Paid Plans (After Free Credit)**
- **Hobby**: $5/month per service
- **Pro**: $10/month per service
- **Team**: Custom pricing

### **Estimated Monthly Cost**
```
Railway Base:     $5-15/month
PostgreSQL:       $5/month
Redis:           $5/month
Custom Domain:   Free
Bandwidth:       Free up to 512GB

TOTAL: $15-25/month for production
```

---

## 🔄 Maintenance & Updates

### **Deploying Updates**
```bash
# Push changes to GitHub
git add .
git commit -m "Update: Add new feature"
git push origin main

# Railway auto-deploys
# Monitor deployment status
railway status
```

### **Database Updates**
```bash
# For schema changes
npx prisma migrate dev --name add_new_feature
git add .
git commit -m "Update: Add new database schema"
git push origin main
```

### **Environment Updates**
```bash
# Update environment variables
railway variables set NEW_VARIABLE=value

# Redeploy to apply changes
railway up
```

---

## 🎯 Quick Railway Deployment Checklist

- [ ] Create Railway account
- [ ] Install Railway CLI
- [ ] Clone repository
- [ ] Create railway.json
- [ ] Create Dockerfile
- [ ] Set environment variables
- [ ] Add PostgreSQL & Redis services
- [ ] Push code to GitHub
- [ ] Monitor deployment
- [ ] Test all features
- [ ] Configure domain (optional)
- [ ] Set up monitoring

---

## 📞 Support & Resources

### **Railway Resources**
- **Documentation**: https://docs.railway.app
- **Discord Community**: https://discord.gg/railway
- **Status Page**: https://status.railway.app

### **Project Resources**
- **Server README**: `server/README.md`
- **Client README**: `client/README.md`
- **JazzCash Integration**: `server/JAZZCASH_INTEGRATION_README.md`

---

## 🚀 You're All Set!

Your multi-vendor e-commerce platform is now deployed on Railway! 🎉

**Access your application at:**
- Railway URL: `https://your-app.railway.app`
- Custom Domain: `https://yourdomain.com` (if configured)

**Test Accounts:**
- **Superadmin**: `superadmin@example.com` / `password123`
- **Admin**: `admin@example.com` / `password123`
- **Seller**: `seller@example.com` / `password123`
- **User**: `user@example.com` / `password123`

Happy selling! 🛍️💰
