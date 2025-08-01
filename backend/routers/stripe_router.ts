// This is your test secret API key.
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { Router } from 'express';
import { isAuthenticated, isSubscribed } from '../middleware/auth.js';
import { extractTokenFromReq } from '../utils/token-helpers.js';
import { UserModel } from '../models/users_model.js';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const stripeRouter: Router = Router();

stripeRouter.post('/create-checkout-session', isAuthenticated, async (req, res) => {
  const token = await extractTokenFromReq(req);
  const userId = token?.User.id;
  if (!userId) {
    return res.status(400).json({ error: "User not authenticated." });
  }
  const user = await UserModel.findByPk(userId) as any;
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }
  if (!user.stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.username,
    });
    user.stripeCustomerId = customer.id;
    await user.save();
  }
  const customerId = user.stripeCustomerId;
  if (!customerId) {
    return res.status(400).json({ error: "Stripe customer ID not found." });
  }

  // Create a checkout session for the subscription
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [
        {
          price: process.env.STRIPE_SUBSCRIPTION_PRICE_ID!,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL.replace(/\/$/, '')}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL.replace(/\/$/, '')}/candidate-dashboard`,
    });

    console.log('🎯 Created checkout session:', session.id);
    return res.status(200).json({ url: session.url });
  } catch (error) {
    return res.status(500).json({ error: error.message || "An error occurred while creating the checkout session." });
  }
});

stripeRouter.post(
  '/webhook',
  async (req, res) => {
    console.log('🔔 Webhook received:', req.body.type || 'unknown event type');
    let event = req.body;
    // Replace this endpoint secret with your endpoint's unique secret
    // If you are testing with the CLI, find the secret by running 'stripe listen'
    // If you are using an endpoint defined with the API or dashboard, look in your webhook settings
    // at https://dashboard.stripe.com/webhooks
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
      // Get the signature sent by Stripe
      console.log('Webhook headers:', req.headers);
    const signature = req.headers['stripe-signature'];
    try {
      console.log('Verifying event signature');
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        endpointSecret
      );
    } catch (err) {
      console.error(`❌ Error verifying webhook signature: ${err.message}`);
      return res.sendStatus(400);
    }
    let customerId;
    let subscribed;
    // Handle the event
    console.log('📋 Processing event type:', event.type);
    switch (event.type) {
      case 'checkout.session.completed':
        customerId = event.data.object.customer;
        subscribed = true; // Always grant access on successful checkout
        console.log('✅ Checkout completed for customer:', customerId);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        customerId = subscription.customer;
        subscribed = subscription.status === 'active';
        console.log('📦 Subscription updated for customer:', customerId, 'Status:', subscription.status);
        break;

      case 'customer.subscription.deleted':
        customerId = event.data.object.customer;
        subscribed = false; // Always false when deleted
        console.log('❌ Subscription deleted for customer:', customerId);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        customerId = invoice.customer;
        subscribed = true; // Ensure they stay subscribed on successful recurring payments
        console.log('💰 Payment succeeded for customer:', customerId);
        break;

      default:
        console.log(`Unhandled event type ${event.type}.`);
        return res.status(200).send('OK');
    }
    try {
      console.log('🔄 Updating user subscription status:', { customerId, subscribed });
      const result = await UserModel.update(
        { isSubscribed: subscribed },
        { where: { stripeCustomerId: customerId } }
      );
      console.log('✅ Database update result:', result);
    } catch (error) {
      console.error(`❌ Failed to update subscription:`, error);
    }
    // Return a 200 response to acknowledge receipt of the event
    res.send();
  }
);

stripeRouter.get('/subscription-status', isAuthenticated, async (req, res) => {
  console.log('🎯 Stripe subscription-status endpoint hit!');
  try {
    const token = await extractTokenFromReq(req);
    const userId = token?.User.id;
    
    if (!userId) {
      console.log('❌ No user ID found');
      return res.status(400).json({ error: "User not authenticated." });
    }

    const user = await UserModel.findByPk(userId) as any;
    if (!user) {
      console.log('❌ User not found:', userId);
      return res.status(404).json({ error: "User not found." });
    }

    console.log('✅ User found, subscription status:', user.isSubscribed);
    return res.status(200).json({ 
      isSubscribed: user.isSubscribed || false,
      message: user.isSubscribed ? "User has active subscription" : "User does not have active subscription"
    });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return res.status(500).json({ error: "Failed to check subscription status" });
  }
});

// Manual subscription update endpoint for testing
stripeRouter.post('/update-subscription', isAuthenticated, async (req, res) => {
  console.log('🎯 Manual subscription update endpoint hit!');
  try {
    const token = await extractTokenFromReq(req);
    const userId = token?.User.id;
    
    if (!userId) {
      return res.status(400).json({ error: "User not authenticated." });
    }

    const user = await UserModel.findByPk(userId) as any;
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Update subscription status
    await user.update({ isSubscribed: true });
    console.log('✅ Manually updated subscription for user:', userId);

    return res.status(200).json({ 
      isSubscribed: true,
      message: "Subscription manually updated"
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return res.status(500).json({ error: "Failed to update subscription" });
  }
});

// Temporary endpoint to set subscription status for testing (no auth required)
stripeRouter.post('/test-set-subscription', async (req, res) => {
  console.log('🎯 Test subscription set endpoint hit!');
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await UserModel.findOne({ where: { email } }) as any;
    if (!user) {
      return res.status(404).json({ error: "User not found with that email." });
    }

    // Update subscription status
    await user.update({ isSubscribed: true });
    console.log('✅ Test: Updated subscription for user:', email);

    return res.status(200).json({ 
      isSubscribed: true,
      message: "Subscription set for testing",
      user: { email: user.email, id: user.id }
    });
  } catch (error) {
    console.error('Error setting test subscription:', error);
    return res.status(500).json({ error: "Failed to set test subscription" });
  }
});

// Get subscription details
stripeRouter.get('/subscription-details', isAuthenticated, async (req, res) => {
  console.log('🎯 Get subscription details endpoint hit!');
  try {
    const token = await extractTokenFromReq(req);
    const userId = token?.User.id;
    
    if (!userId) {
      return res.status(400).json({ error: "User not authenticated." });
    }

    const user = await UserModel.findByPk(userId) as any;
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (!user.stripeCustomerId) {
      return res.status(404).json({ error: "No Stripe customer found." });
    }

    // Get customer details from Stripe
    const customer = await stripe.customers.retrieve(user.stripeCustomerId);
    
    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active',
      expand: ['data.default_payment_method']
    });

    // Get payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card'
    });

    return res.status(200).json({
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name
      },
      subscription: subscriptions.data[0] || null,
      paymentMethods: paymentMethods.data,
      isSubscribed: user.isSubscribed
    });
  } catch (error) {
    console.error('Error getting subscription details:', error);
    return res.status(500).json({ error: "Failed to get subscription details" });
  }
});

// Create customer portal session
stripeRouter.post('/create-portal-session', isAuthenticated, async (req, res) => {
  console.log('🎯 Create portal session endpoint hit!');
  try {
    const token = await extractTokenFromReq(req);
    const userId = token?.User.id;
    
    if (!userId) {
      return res.status(400).json({ error: "User not authenticated." });
    }

    const user = await UserModel.findByPk(userId) as any;
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (!user.stripeCustomerId) {
      return res.status(404).json({ error: "No Stripe customer found." });
    }

    try {
      // Try to create customer portal session
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${process.env.FRONTEND_URL.replace(/\/$/, '')}/subscription/manage`,
      });

      return res.status(200).json({ url: session.url });
    } catch (portalError) {
      console.error('Portal not configured, using fallback:', portalError.message);
      // Return a fallback response indicating portal is not configured
      return res.status(503).json({ 
        error: "Customer portal not configured",
        message: "Please configure the Stripe Customer Portal in your dashboard",
        fallback: true
      });
    }
  } catch (error) {
    console.error('Error creating portal session:', error);
    return res.status(500).json({ error: "Failed to create portal session" });
  }
});

// Verify checkout session and update subscription status
stripeRouter.post('/verify-checkout', isAuthenticated, async (req, res) => {
  console.log('🎯 Verify checkout endpoint hit!');
  try {
    const { session_id } = req.body;
    const token = await extractTokenFromReq(req);
    const userId = token?.User.id;
    
    if (!session_id) {
      return res.status(400).json({ error: "Session ID is required." });
    }

    if (!userId) {
      return res.status(400).json({ error: "User not authenticated." });
    }

    const user = await UserModel.findByPk(userId) as any;
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['customer', 'subscription']
    });

    console.log('📋 Session details:', {
      id: session.id,
      customer: session.customer,
      subscription: session.subscription,
      payment_status: session.payment_status
    });

    // Verify the session belongs to this user
    const sessionCustomerId = typeof session.customer === 'string' 
      ? session.customer 
      : session.customer?.id;

    if (sessionCustomerId !== user.stripeCustomerId) {
      console.log('🚨 SECURITY: Session customer mismatch. Session customer ID:', sessionCustomerId, 'User customer ID:', user.stripeCustomerId);
      return res.status(403).json({ error: "Session does not belong to this user" });
    }

    console.log('✅ Customer verification passed:', sessionCustomerId);

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: "Payment not completed" });
    }

    // Extract subscription ID
    const subscriptionId = typeof session.subscription === 'string' 
      ? session.subscription 
      : session.subscription?.id;

    if (!subscriptionId) {
      return res.status(400).json({ error: "No subscription found in session" });
    }

    // Get subscription details
    const subscription = typeof session.subscription === 'object' && session.subscription?.id
      ? session.subscription
      : await stripe.subscriptions.retrieve(subscriptionId);

    console.log('📦 Subscription status:', subscription.status);
    console.log('📦 Subscription metadata:', subscription.metadata);

    // Update user subscription status
    const isActive = subscription.status === 'active';
    await user.update({ isSubscribed: isActive });

    console.log('✅ Updated user subscription status:', { userId, isSubscribed: isActive });

    return res.status(200).json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        current_period_end: subscription.current_period_end
      },
      user: {
        isSubscribed: isActive
      }
    });

  } catch (error) {
    console.error('❌ Error verifying checkout:', error);
    return res.status(500).json({ error: "Failed to verify checkout session" });
  }
});

// Cancel subscription
stripeRouter.post('/cancel-subscription', isAuthenticated, async (req, res) => {
  console.log('🎯 Cancel subscription endpoint hit!');
  try {
    const token = await extractTokenFromReq(req);
    const userId = token?.User.id;
    
    if (!userId) {
      return res.status(400).json({ error: "User not authenticated." });
    }

    const user = await UserModel.findByPk(userId) as any;
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (!user.stripeCustomerId) {
      return res.status(404).json({ error: "No Stripe customer found." });
    }

    // Get active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active'
    });

    if (subscriptions.data.length === 0) {
      return res.status(404).json({ error: "No active subscription found." });
    }

    // Cancel the subscription at period end
    const subscription = await stripe.subscriptions.update(subscriptions.data[0].id, {
      cancel_at_period_end: true
    });

    // Update user subscription status
    await user.update({ isSubscribed: false });

    return res.status(200).json({
      message: "Subscription will be canceled at the end of the current period",
      subscription: subscription
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return res.status(500).json({ error: "Failed to cancel subscription" });
  }
});