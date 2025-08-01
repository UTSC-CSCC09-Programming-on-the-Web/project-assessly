# Stripe Webhook Setup for Local Development

## The Issue
Your Stripe checkout is working, but the subscription status isn't being updated because webhooks aren't reaching your local development server.

## Solution: Use Stripe CLI

### 1. Install Stripe CLI
```bash
# On macOS
brew install stripe/stripe-cli/stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

### 2. Login to Stripe
```bash
stripe login
```

### 3. Forward Webhooks to Local Server
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will give you a webhook endpoint secret. Copy it and update your `.env` file:

```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 4. Test the Webhook
In another terminal, trigger a test webhook:
```bash
stripe trigger checkout.session.completed
```

## Alternative: Manual Testing

If you don't want to use Stripe CLI, you can manually update the subscription status:

1. Go to your Stripe Dashboard
2. Find the customer who completed checkout
3. Check if they have an active subscription
4. Manually update your database:

```sql
UPDATE users SET isSubscribed = true WHERE stripeCustomerId = 'cus_xxx';
```

## Debugging

The backend now has enhanced logging. Check your backend console for:
- 🔔 Webhook received messages
- 📋 Processing event type messages
- ✅ Checkout completed messages
- 🔄 Database update messages

## Production Setup

For production, you'll need to:
1. Configure webhooks in your Stripe Dashboard
2. Point them to: `https://assessly.website/api/stripe/webhook`
3. Use the webhook endpoint secret from Stripe Dashboard 