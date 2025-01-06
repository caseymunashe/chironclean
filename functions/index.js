const functions = require('firebase-functions');
const stripe = require('stripe')('sk_test_your_stripe_secret_key');

// Create Payment Intent
exports.createPaymentIntent = functions.https.onRequest(async (req, res) => {
    try {
        const { amount, currency } = req.body;

        // Create a PaymentIntent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency,
            payment_method_types: ['card'],
        });

        res.status(200).send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).send({ error: error.message });
    }
});

// Webhook to Handle Events
exports.stripeWebhook = functions.https.onRequest((req, res) => {
    const endpointSecret = 'your-webhook-secret';
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        console.log('PaymentIntent was successful:', paymentIntent);
    }

    res.status(200).send({ received: true });
});
