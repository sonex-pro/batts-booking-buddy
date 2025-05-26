const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');

exports.handler = async (event) => {
  try {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Verify Stripe webhook signature
    const stripeSignature = event.headers['stripe-signature'];
    let stripeEvent;

    try {
      stripeEvent = stripe.webhooks.constructEvent(
        event.body,
        stripeSignature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error.message);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Webhook signature verification failed' })
      };
    }

    // Handle the checkout.session.completed event
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object;
      
      // Extract metadata from the session
      const { group, date, playerName, totalPrice, bookingType, plan, yourName, discountCode } = session.metadata;
      
      // Prepare data for Google Apps Script
      const bookingData = {
        group,
        date,
        playerName,
        totalPrice: `£${totalPrice}`,
        bookingType,
        plan,
        yourName,
        discountCode,
        paymentStatus: 'Paid',
        paymentDate: new Date().toISOString(),
        sessionId: session.id
      };

      // Send data to Google Apps Script
      try {
        await axios.post(process.env.GOOGLE_APPS_SCRIPT_URL, bookingData);
        console.log('Data successfully sent to Google Apps Script');
      } catch (error) {
        console.error('Error sending data to Google Apps Script:', error);
        // We don't want to return an error status here as the payment was successful
        // Just log the error and continue
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };
  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
