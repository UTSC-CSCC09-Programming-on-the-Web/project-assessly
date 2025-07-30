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
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/candidate-dashboard`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    return res.status(500).json({ error: error.message || "An error occurred while creating the checkout session." });
  }
});

stripeRouter.post(
  '/webhook',
  async (req, res) => {
    let event = req.body;
    // Replace this endpoint secret with your endpoint's unique secret
    // If you are testing with the CLI, find the secret by running 'stripe listen'
    // If you are using an endpoint defined with the API or dashboard, look in your webhook settings
    // at https://dashboard.stripe.com/webhooks
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
      // Get the signature sent by Stripe
      console.log(req.headers);
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
    switch (event.type) {
      case 'checkout.session.completed':
        customerId = event.data.object.customer;
        subscribed = true; // Always grant access on successful checkout
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        customerId = subscription.customer;
        subscribed = subscription.status === 'active';
        break;

      case 'customer.subscription.deleted':
        customerId = event.data.object.customer;
        subscribed = false; // Always false when deleted
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        customerId = invoice.customer;
        subscribed = true; // Ensure they stay subscribed on successful recurring payments
        break;

      default:
        console.log(`Unhandled event type ${event.type}.`);
        return res.status(200).send('OK');
    }
    try {
      await UserModel.update(
        { isSubscribed: subscribed },
        { where: { stripeCustomerId: customerId } }
      );
    } catch (error) {
      console.error(`❌ Failed to update subscription:`, error);
    }
    // Return a 200 response to acknowledge receipt of the event
    res.send();
  }
);

stripeRouter.get('/subscription-status', isSubscribed, async (req, res) => {
  return res.status(200).json({ 
    isSubscribed: true,
    message: "User has active subscription"
  });
});