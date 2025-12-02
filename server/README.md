# 🛍️ Multi-Vendor E-Commerce Backend API

A comprehensive Node.js/Express backend for a multi-vendor e-commerce marketplace with JazzCash payment integration, real-time chat, commission management, and seller wallet system.

## 🚀 Features

### Core E-Commerce Features
- **Multi-Vendor Marketplace**: Sellers can create stores and manage products
- **Product Management**: Categories, attributes, variants, inventory tracking
- **Order Management**: Complete order lifecycle with seller assignment
- **User Management**: Role-based access (Superadmin, Admin, Seller, User)
- **Real-time Chat**: Socket.io powered messaging between buyers and sellers
- **Review System**: Product and seller reviews and ratings

### Payment & Financial Management
- **JazzCash Integration**: Complete payment gateway integration with test/bypass modes
- **Commission System**: Category-based commission rates for platform revenue
- **Seller Wallets**: Automatic fund crediting with 7-day hold period
- **Withdrawal Management**: Secure payout requests and processing
- **Transaction Tracking**: Complete audit trail of all financial operations

### Advanced Features
- **Webhook Processing**: JazzCash payment callbacks and seller notifications
- **Analytics Dashboard**: Comprehensive reporting and insights
- **File Upload**: Cloudinary integration for product images
- **Email Notifications**: SMTP-based email system
- **Audit Logs**: Complete system activity tracking
- **Domain Management**: Allowed domains for seller verification

### Technical Features
- **PostgreSQL Database**: Prisma ORM with comprehensive schema
- **Redis Caching**: Session management, webhook storage, performance optimization
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permissions system
- **API Versioning**: v1 and v2 API support
- **Health Checks**: Comprehensive system monitoring
- **Rate Limiting**: DDoS protection and abuse prevention

## 🏗️ Tech Stack

- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for sessions and performance
- **Authentication**: JWT with Passport.js
- **Real-time**: Socket.io for chat functionality
- **Payments**: JazzCash gateway integration
- **File Storage**: Cloudinary for image uploads
- **Email**: SMTP-based notifications
- **Validation**: Custom middleware with error handling
- **Logging**: Winston with structured logging
- **Testing**: Jest for unit and integration tests

## 📁 Project Structure

```
server/
├── src/
│   ├── app.ts                 # Express application setup
│   ├── server.ts              # Server initialization
│   ├── types.d.ts            # TypeScript type definitions
│   ├── infra/                # Infrastructure layer
│   │   ├── database/         # Database configuration
│   │   ├── redis/            # Redis caching
│   │   ├── payment/          # JazzCash integration
│   │   ├── cloudinary/       # File upload service
│   │   └── winston/          # Logging configuration
│   ├── modules/              # Business logic modules
│   │   ├── auth/             # Authentication & authorization
│   │   ├── user/             # User management
│   │   ├── seller/           # Seller profile & onboarding
│   │   ├── product/          # Product catalog management
│   │   ├── category/         # Product categories
│   │   ├── cart/             # Shopping cart functionality
│   │   ├── checkout/         # Order processing & payments
│   │   ├── order/            # Order management
│   │   ├── payment/          # Payment processing
│   │   ├── wallet/           # Seller wallet management
│   │   ├── withdrawal/       # Payout processing
│   │   ├── commission/       # Commission rate management
│   │   ├── analytics/        # Dashboard analytics
│   │   ├── chat/             # Real-time messaging
│   │   ├── webhook/          # Payment webhooks
│   │   ├── logs/             # Audit logging
│   │   └── reports/          # Business reports
│   ├── shared/               # Shared utilities
│   │   ├── middlewares/      # Express middlewares
│   │   ├── utils/            # Helper functions
│   │   ├── errors/           # Error handling
│   │   ├── constants/        # Application constants
│   │   └── templates/        # Email templates
│   └── routes/               # API route definitions
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── seeds/                    # Database seeding
└── JAZZCASH_INTEGRATION_README.md  # Payment integration docs
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev

   # Seed database (optional)
   npm run seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000` (configurable via PORT env var).

## ⚙️ Environment Configuration

### Required Environment Variables

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce_db"

# Redis
REDIS_URL=redis://localhost:6379

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# JazzCash Payment Gateway
JAZZCASH_API_KEY=your_jazzcash_api_key
JAZZCASH_SECRET=your_jazzcash_secret_key
JAZZCASH_MERCHANT_ID=your_merchant_id
JAZZCASH_RETURN_URL=http://localhost:3000/payment/callback
JAZZCASH_CANCEL_URL=http://localhost:3000/payment/cancel
JAZZCASH_TEST_MODE=true

# Payment Testing
PAYMENT_BYPASS=false

# Client URLs
CLIENT_URL_DEV=http://localhost:3000
CLIENT_URL_PROD=https://yourdomain.com

# Cloudinary (File Uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Security
COOKIE_SECRET=your-cookie-secret
SESSION_SECRET=your-session-secret
```

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh JWT token

### Products & Categories
- `GET /api/v1/products` - List products with filters
- `POST /api/v1/products` - Create product (seller only)
- `GET /api/v1/categories` - List categories
- `POST /api/v1/categories` - Create category (admin only)

### Cart & Checkout
- `GET /api/v1/cart` - Get user cart
- `POST /api/v1/cart/items` - Add item to cart
- `POST /api/v1/checkout` - Initiate checkout with JazzCash

### Orders
- `GET /api/v1/orders` - List user orders
- `GET /api/v1/orders/:id` - Get order details
- `PUT /api/v1/orders/:id/status` - Update order status

### Seller Management
- `POST /api/v1/sellers/apply` - Apply to become seller
- `GET /api/v1/sellers/profile` - Get seller profile
- `PUT /api/v1/sellers/profile` - Update seller profile & payout details
- `GET /api/v1/sellers/wallet` - Get seller wallet balance
- `POST /api/v1/sellers/withdrawals` - Request withdrawal

### Admin Dashboard
- `GET /api/v1/admin/analytics` - Dashboard analytics
- `GET /api/v1/admin/users` - User management
- `GET /api/v1/admin/sellers` - Seller management
- `GET /api/v1/admin/orders` - Order management
- `PUT /api/v1/admin/withdrawals/:id/approve` - Approve withdrawals

### Real-time Chat
- `POST /api/v1/chat/messages` - Send message
- `GET /api/v1/chat/messages/:conversationId` - Get conversation

### Webhooks
- `POST /api/webhook/jazzcash` - JazzCash payment callbacks
- `POST /api/webhook` - Legacy webhook support

## 💰 Payment & Commission System

### JazzCash Integration
- **Test Mode**: Use sandbox environment for development
- **Bypass Mode**: Skip payments for testing order flow
- **Production**: Real payment processing with security

### Commission Management
- **Category-Based**: Different rates per product category
- **Database-Driven**: Configurable via admin panel
- **Automatic Calculation**: Applied during order processing
- **Seller Earnings**: `order_amount - commission`

### Wallet System
- **Auto-Crediting**: Funds added after successful payment
- **Hold Period**: 7-day security hold on new earnings
- **Available Balance**: Funds ready for withdrawal
- **Pending Balance**: Funds in hold period

## 🧪 Testing & Development

### Database Seeding
```bash
npm run seed
```

### Test Accounts (after seeding)
| Role | Email | Password | Access |
|------|-------|----------|---------|
| Superadmin | `superadmin@example.com` | `password123` | Full system |
| Admin | `admin@example.com` | `password123` | Product management |
| Seller | `seller@example.com` | `password123` | Store management |
| User | `user@example.com` | `password123` | Shopping |

### Health Checks
```bash
# Basic health check
curl http://localhost:5000/health

# Detailed health check
curl http://localhost:5000/health/detailed
```

## 🚀 Deployment

### Railway (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Docker
```bash
# Build image
docker build -t ecommerce-backend .

# Run container
docker run -p 5000:5000 ecommerce-backend
```

### Environment-Specific Configs
- **Development**: Enhanced logging, debug mode
- **Production**: Optimized performance, security headers
- **Testing**: Isolated database, mock services

## 🔧 Development Scripts

```bash
# Development
npm run dev          # Start with nodemon
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio

# Testing
npm run test         # Run tests
npm run test:watch   # Watch mode tests
npm run test:cov     # Coverage report

# Linting
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix linting issues
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: DDoS protection (100 requests/15min)
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configured allowed origins
- **Security Headers**: XSS, CSRF, clickjacking protection
- **Audit Logging**: Complete activity tracking
- **Webhook Verification**: JazzCash callback validation

## 📊 Monitoring & Logging

- **Winston Logging**: Structured JSON logging
- **Health Checks**: System status monitoring
- **Error Tracking**: Comprehensive error handling
- **Performance Monitoring**: Response time tracking
- **Audit Logs**: User activity logging

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

For support, email support@yourcompany.com or create an issue in the repository.

## 📋 Configuration

### Environment Variables

```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# Security
COOKIE_SECRET=your-secret-key
SESSION_SECRET=your-session-secret

# CORS Origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Request Limits
REQUEST_LIMIT_JSON=10mb
REQUEST_LIMIT_URLENCODED=10mb
REQUEST_LIMIT_RAW=50mb

# Timeouts
RESPONSE_TIMEOUT=30000  # 30 seconds
```

### CORS Configuration

The server supports multiple origins and automatically handles:

- Development environments (localhost variants)
- Production domains
- Mobile applications
- API clients

### Security Headers

All security headers are automatically configured for:

- Modern browsers
- Mobile devices
- API clients
- Cross-origin requests

## 🔧 Usage Examples

### API Versioning

```javascript
// URL-based versioning
GET /api/v1/users
GET /api/v2/users

// Header-based versioning
GET /api/users
X-API-Version: v2

// Query parameter versioning
GET /api/users?version=v2
```

### Device Detection

```javascript
// Server automatically detects and adds headers:
X-Device-Type: mobile
X-Platform: ios
X-Browser: Safari
X-Browser-Version: 15
```

### Health Checks

```bash
# Basic health check
curl http://localhost:5000/health

# Detailed health check
curl http://localhost:5000/health/detailed

# Kubernetes readiness probe
curl http://localhost:5000/ready

# Kubernetes liveness probe
curl http://localhost:5000/live
```

## 🛡️ Security Features

### Request Validation

- **Size limits**: Prevents large payload attacks
- **Content validation**: Validates JSON and form data
- **Header validation**: Validates required headers
- **Method validation**: Only allows specified HTTP methods

### Error Handling

- **No information leakage**: Doesn't expose internal errors
- **Structured responses**: Consistent error format
- **Logging**: Comprehensive error logging for debugging
- **Rate limiting**: Prevents abuse and DoS attacks

## 📱 Mobile Compatibility

### Mobile-Specific Features

- **Touch-friendly endpoints**: Optimized for mobile interactions
- **Reduced payload sizes**: Efficient data transfer
- **Offline support**: Graceful handling of network issues
- **Progressive enhancement**: Works with basic browsers

### Device Detection

- **Automatic detection**: No client-side code required
- **Platform-specific responses**: Tailored responses for different platforms
- **Browser compatibility**: Works with all major mobile browsers

## 🚀 Performance Optimizations

### Compression

- **Gzip compression**: Reduces response sizes
- **Selective compression**: Only compresses appropriate content types
- **Configurable levels**: Adjustable compression levels

### Caching

- **ETag support**: Efficient caching headers
- **Cache control**: Proper cache directives
- **Conditional requests**: Support for If-Modified-Since headers

## 📊 Monitoring & Logging

### Health Monitoring

- **Real-time status**: Live system health information
- **Dependency monitoring**: Database and external service status
- **Performance metrics**: Response times and throughput
- **Error tracking**: Comprehensive error logging

### Logging

- **Structured logging**: JSON format for easy parsing
- **Request logging**: All requests are logged with metadata
- **Error logging**: Detailed error information
- **Performance logging**: Response times and resource usage

## 🔄 Deployment

### Docker Support

The server includes Docker configuration for easy deployment:

```bash
# Build the image
docker build -t your-app .

# Run the container
docker run -p 5000:5000 your-app
```

### Environment-Specific Configurations

- **Development**: Enhanced debugging and logging
- **Production**: Optimized for performance and security
- **Testing**: Isolated configuration for testing

## 📚 API Documentation

### Swagger Integration

- **Auto-generated docs**: Based on route definitions
- **Interactive testing**: Test endpoints directly from docs
- **Schema validation**: Automatic request/response validation
- **Version support**: Documentation for each API version

## 🧪 Testing

### Health Check Testing

```bash
# Test basic health
curl -f http://localhost:5000/health

# Test detailed health
curl -f http://localhost:5000/health/detailed

# Test readiness
curl -f http://localhost:5000/ready
```

### CORS Testing

```bash
# Test CORS preflight
curl -X OPTIONS -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  http://localhost:5000/api/v1/users
```

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**

   - Check allowed origins configuration
   - Verify preflight request handling
   - Ensure credentials are properly configured

2. **Rate Limiting**

   - Check rate limit configuration
   - Monitor rate limit headers in responses
   - Adjust limits for your use case

3. **Timeout Issues**

   - Check request/response timeout settings
   - Monitor server performance
   - Optimize slow database queries

4. **Health Check Failures**
   - Verify database connectivity
   - Check Redis connection
   - Review server logs for errors

## 📈 Best Practices

### Development

1. **Use environment variables** for configuration
2. **Test with different devices** and browsers
3. **Monitor health checks** during development
4. **Use structured logging** for debugging

### Production

1. **Set up monitoring** for health checks
2. **Configure proper CORS** for your domains
3. **Use HTTPS** in production
4. **Monitor rate limiting** and adjust as needed
5. **Set up alerting** for health check failures

### Security

1. **Regularly update dependencies**
2. **Monitor security headers**
3. **Use strong secrets** for cookies and sessions
4. **Implement proper authentication**
5. **Monitor for suspicious activity**

This server is now production-ready with comprehensive browser and device compatibility, security best practices, and monitoring capabilities.
