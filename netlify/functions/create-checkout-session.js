const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');

exports.handler = async (event) => {
  try {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Parse the request body
    const data = JSON.parse(event.body);
    
    // Validate required fields
    if (!data.totalPrice) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Convert price to cents for Stripe
    const amount = Math.round(parseFloat(data.totalPrice) * 100);

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Windsurfing Booking - ${data.group}`,
              description: `${data.bookingType} booking (${data.plan}) for ${data.playerName}`
            },
            unit_amount: amount
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.URL}/booking-summary.html?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL}/booking-summary.html?payment_canceled=true`,
      metadata: {
        group: data.group,
        date: data.date,
        playerName: data.playerName,
        totalPrice: data.totalPrice,
        bookingType: data.bookingType,
        plan: data.plan,
        yourName: data.yourName,
        discountCode: data.discountCode
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id })
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
