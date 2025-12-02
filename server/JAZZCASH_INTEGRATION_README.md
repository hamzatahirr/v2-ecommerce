# JazzCash Payment Gateway Integration

This document outlines the environment variables and configuration needed for JazzCash integration.

## Environment Variables

Add these variables to your `.env` file:

### JazzCash Configuration
```bash
# JazzCash Payment Gateway Configuration
JAZZCASH_API_KEY=your_jazzcash_api_key_here
JAZZCASH_SECRET=your_jazzcash_secret_here
JAZZCASH_MERCHANT_ID=your_jazzcash_merchant_id_here
JAZZCASH_RETURN_URL=http://localhost:3000/payment/callback
JAZZCASH_CANCEL_URL=http://localhost:3000/payment/cancel
JAZZCASH_TEST_MODE=true
```

### Payment Testing and Bypass
```bash
# Payment Testing and Bypass
PAYMENT_BYPASS=false          # Set to 'true' to show payment options but skip actual processing
TEST_PAYMENTS=false           # Legacy Stripe test mode (can be removed after full migration)
```

### Platform Configuration
```bash
NODE_ENV=development
```

### Client URLs
```bash
CLIENT_URL_DEV=http://localhost:3000
CLIENT_URL_PROD=https://yourdomain.com
```

## How to Get JazzCash Credentials

1. **Register as a Merchant**:
   - Visit JazzCash merchant portal: https://www.jazzcash.com.pk/merchant
   - Complete the merchant registration process
   - Submit required business documents

2. **Get API Credentials**:
   - After approval, you'll receive:
     - **Merchant ID**: Your unique merchant identifier
     - **API Key**: For authentication
     - **Secret Key**: For secure hash generation

3. **Configure Webhooks**:
   - Set your callback URL in JazzCash merchant dashboard
   - URL: `https://yourdomain.com/api/webhook/jazzcash`

## Payment Flow

### For Customers:
1. Add items to cart
2. Select "JazzCash" payment method
3. Click "Proceed to Payment"
4. Redirected to JazzCash payment page
5. Complete payment on JazzCash
6. Redirected back to your site with success/failure

### For Sellers:
1. Update profile with payout details (bank account/JazzCash mobile)
2. Request withdrawal from available balance
3. Admin processes withdrawal (manual bank transfer/JazzCash payout)
4. Funds transferred to seller's account

## Commission Structure

- **Category-Based Fees**: Each product category has its own commission rate set in the database
- **Commission Table**: Linked to categories with configurable rates (e.g., Electronics: 8%, Clothing: 5%)
- **Calculation**: Commission calculated per order item based on product category
- **Seller Earnings**: Order amount minus total commission for all items
- **Payout Process**: Sellers can withdraw available balance after 7-day hold period

## Testing

### Test Mode (`JAZZCASH_TEST_MODE=true`):
- Uses JazzCash sandbox environment
- Test credentials provided by JazzCash
- Real payment flow but no actual money transfer

### Bypass Mode (`PAYMENT_BYPASS=true`):
- Payment options display normally
- Clicking "Proceed to Payment" immediately creates orders
- No actual payment processing
- Useful for testing order flow without payment integration

## Database Migration

Run the following command after updating the schema:

```bash
npx prisma migrate dev --name add_jazzcash_support
```

## API Endpoints

### New Endpoints:
- `POST /api/webhook/jazzcash` - JazzCash payment callback
- `PUT /api/sellers/profile` - Update seller payout details

### Modified Endpoints:
- `POST /api/checkout` - Now supports JazzCash payments
- `POST /api/withdrawals` - Validates seller payout details

## Security Notes

- Never expose API keys in client-side code
- Always verify payment callbacks server-side
- Use HTTPS for all payment-related communications
- Regularly rotate API keys
- Monitor payment logs for suspicious activity
