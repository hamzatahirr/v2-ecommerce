# 🛍️ Multi-Vendor E-Commerce Frontend

A modern Next.js frontend for a comprehensive multi-vendor e-commerce marketplace with JazzCash payments, real-time chat, seller dashboards, and admin management.

## 🚀 Features

### Customer Experience
- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Product Catalog**: Advanced filtering, search, and categorization
- **Shopping Cart**: Persistent cart with real-time updates
- **JazzCash Payments**: Secure payment processing with test/bypass modes
- **Order Tracking**: Complete order history and status updates
- **Real-time Chat**: Instant messaging with sellers
- **Product Reviews**: Rate and review purchased products

### Seller Features
- **Store Management**: Create and manage seller profiles
- **Product Management**: Add, edit, and manage product inventory
- **Order Management**: Process and fulfill customer orders
- **Wallet Dashboard**: Track earnings and manage withdrawals
- **Analytics**: Sales reports and performance insights
- **Payout Settings**: Configure bank/JazzCash payout details

### Admin Dashboard
- **User Management**: Manage customers, sellers, and admins
- **Product Moderation**: Approve/reject seller products
- **Commission Management**: Set category-based commission rates
- **Analytics**: Platform-wide performance metrics
- **Order Oversight**: Monitor all orders and disputes
- **Payout Processing**: Approve and process seller withdrawals

### Technical Features
- **Server-Side Rendering**: Optimized performance with Next.js
- **TypeScript**: Full type safety and better developer experience
- **Apollo GraphQL**: Efficient data fetching and caching
- **Real-time Updates**: Socket.io integration for live features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **SEO Optimized**: Server-side rendering for search engines
- **Progressive Web App**: Installable and offline-capable

## 🏗️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom components
- **State Management**: Redux Toolkit + RTK Query
- **Data Fetching**: Apollo Client for GraphQL
- **Real-time**: Socket.io for chat functionality
- **Forms**: React Hook Form with validation
- **Icons**: Lucide React icon library
- **Animations**: Framer Motion for smooth transitions
- **Charts**: Recharts for analytics dashboards

## 📁 Project Structure

```
client/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── sign-in/             # Login page
│   │   └── sign-up/             # Registration page
│   ├── (private)/               # Protected routes
│   │   ├── dashboard/           # Admin dashboard
│   │   ├── seller/              # Seller management
│   │   └── user/                # User account pages
│   ├── (public)/                # Public pages
│   │   ├── cart/                # Shopping cart
│   │   ├── product/             # Product pages
│   │   └── shop/                # Product catalog
│   ├── api/                     # API routes (if needed)
│   ├── globals.css              # Global styles
│   └── layout.tsx               # Root layout
├── components/                  # Reusable components
│   ├── atoms/                   # Basic UI components
│   ├── molecules/               # Composite components
│   ├── organisms/               # Complex components
│   ├── templates/               # Page layouts
│   ├── layout/                  # Layout components
│   ├── feedback/                # Loading, errors, etc.
│   └── HOC/                     # Higher-order components
├── hooks/                       # Custom React hooks
│   ├── dom/                     # DOM-related hooks
│   ├── network/                 # API-related hooks
│   ├── state/                   # State management hooks
│   └── ui/                      # UI-related hooks
├── lib/                         # Utility libraries
│   ├── apolloClient.ts          # GraphQL client
│   └── constants/               # App constants
├── store/                       # Redux store
│   ├── apis/                    # RTK Query APIs
│   ├── slices/                  # Redux slices
│   └── store.ts                 # Store configuration
├── types/                       # TypeScript definitions
├── utils/                       # Utility functions
└── public/                      # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend server running (see server README)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## ⚙️ Environment Configuration

### Required Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# GraphQL Configuration (if using)
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:5000/graphql

# Payment Configuration
NEXT_PUBLIC_JAZZCASH_ENABLED=true
NEXT_PUBLIC_PAYMENT_BYPASS=false

# Socket.io Configuration
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Development
NEXT_PUBLIC_NODE_ENV=development
```

## 🧪 Testing & Development

### Test Accounts

After running the backend seed script, use these accounts:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Superadmin** | `superadmin@example.com` | `password123` | Full system control |
| **Admin** | `admin@example.com` | `password123` | Product & user management |
| **Seller** | `seller@example.com` | `password123` | Store & product management |
| **User** | `user@example.com` | `password123` | Shopping & orders |

### Testing Scenarios

1. **Customer Journey**
   - Browse products and categories
   - Add items to cart
   - Complete checkout with JazzCash
   - Track order status
   - Leave product reviews

2. **Seller Experience**
   - Apply to become a seller
   - Set up store profile and payout details
   - Add and manage products
   - Process customer orders
   - Request and track withdrawals

3. **Admin Functions**
   - Moderate seller applications
   - Manage product categories and commissions
   - Process seller withdrawals
   - Monitor platform analytics

### Payment Testing

- **Bypass Mode**: Set `NEXT_PUBLIC_PAYMENT_BYPASS=true` to test order flow without real payments
- **JazzCash Test**: Use test credentials for actual payment flow
- **Success/Failure**: Test both successful and failed payment scenarios

## 📱 Key User Flows

### Customer Shopping Flow
1. **Browse** → View products by category
2. **Search** → Find specific products
3. **Product Details** → View specifications and reviews
4. **Add to Cart** → Persistent cart across sessions
5. **Checkout** → JazzCash payment integration
6. **Order Tracking** → Real-time status updates
7. **Support Chat** → Direct communication with sellers

### Seller Management Flow
1. **Apply** → Submit seller application
2. **Setup Profile** → Configure store and payout details
3. **Add Products** → Create product catalog
4. **Manage Orders** → Process customer purchases
5. **Track Earnings** → Monitor wallet balance
6. **Request Payouts** → Withdraw available funds

### Admin Control Flow
1. **Dashboard** → View platform analytics
2. **User Management** → Moderate accounts and permissions
3. **Product Moderation** → Approve/reject seller products
4. **Commission Setup** → Configure category-based rates
5. **Payout Processing** → Approve seller withdrawal requests

## 🚀 Build & Deployment

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Deployment to Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production build
vercel --prod
```

### Railway Deployment
```bash
# Railway handles both frontend and backend
railway init
railway up
```

## 🔧 Development Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Production build
npm run start            # Start production server
npm run preview          # Preview production build

# Code Quality
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix linting issues
npm run type-check       # TypeScript checking
npm run format           # Code formatting

# Testing
npm run test             # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

## 🎨 UI/UX Features

### Design System
- **Consistent Components**: Reusable UI components
- **Design Tokens**: Colors, typography, spacing
- **Responsive Grid**: Mobile-first responsive design
- **Accessibility**: WCAG compliant components

### Performance Optimizations
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Route-based and component splitting
- **Lazy Loading**: Components and images load on demand
- **Caching**: Apollo Client intelligent caching
- **Bundle Analysis**: Webpack bundle analyzer

### User Experience
- **Loading States**: Skeleton loaders and spinners
- **Error Boundaries**: Graceful error handling
- **Toast Notifications**: User feedback for actions
- **Progressive Enhancement**: Works without JavaScript
- **Offline Support**: Service worker for caching

## 🔗 API Integration

### REST API Endpoints
- **Products**: Catalog browsing and management
- **Cart**: Shopping cart operations
- **Checkout**: Payment processing with JazzCash
- **Orders**: Order management and tracking
- **Users**: Profile and authentication
- **Sellers**: Store and payout management

### Real-time Features
- **Chat**: Socket.io for instant messaging
- **Notifications**: Real-time order updates
- **Live Updates**: Inventory and price changes

## 🛡️ Security & Best Practices

- **Type Safety**: Full TypeScript implementation
- **Input Validation**: Client and server-side validation
- **Authentication**: Secure JWT token management
- **Authorization**: Role-based access control
- **XSS Protection**: Sanitized user inputs
- **CSRF Protection**: Secure form handling
- **HTTPS Only**: Secure connections in production

## 📊 Analytics & Monitoring

- **Error Tracking**: Sentry integration for error monitoring
- **Performance**: Web vitals and Core Web Vitals tracking
- **User Analytics**: Google Analytics integration
- **Conversion Tracking**: E-commerce event tracking

## 🤝 Contributing

1. **Setup Development Environment**
   ```bash
   git clone <repository-url>
   cd client
   npm install
   cp .env.example .env.local
   npm run dev
   ```

2. **Code Standards**
   - Use TypeScript for all new code
   - Follow ESLint configuration
   - Write meaningful commit messages
   - Add tests for new features

3. **Pull Request Process**
   - Create feature branch from `develop`
   - Write tests for new functionality
   - Ensure all tests pass
   - Update documentation if needed
   - Submit PR with detailed description

## 📱 Mobile Compatibility

- **Responsive Design**: Works on all screen sizes
- **Touch Optimized**: Mobile-friendly interactions
- **Progressive Web App**: Can be installed as mobile app
- **Offline Support**: Basic functionality works offline

## 🔄 Continuous Integration

- **GitHub Actions**: Automated testing and deployment
- **Code Quality**: Automated linting and type checking
- **Security Scanning**: Dependency vulnerability checks
- **Performance Testing**: Lighthouse CI for performance monitoring

## 📞 Support & Documentation

- **API Documentation**: Backend API docs in server README
- **Component Library**: Storybook for UI components (if implemented)
- **User Guides**: Separate documentation for different user roles
- **Troubleshooting**: Common issues and solutions

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Happy Shopping! 🛍️**

For questions or support, please create an issue or contact the development team.
