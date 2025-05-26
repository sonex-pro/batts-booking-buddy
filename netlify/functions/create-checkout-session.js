const stripe = require('stripe')(process.env.Stripe_P_key);
const axios = require('axios');

exports.handler = async (event) => {
  // Set CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*', // Allow all origins
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return { 
        statusCode: 405, 
        headers,
        body: 'Method Not Allowed' 
      };
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
              name: `${data.group} Booking - ${data.bookingType || 'Standard'}`,
              description: `Booking for ${data.date}`,
            },
            unit_amount: Math.round(parseFloat(data.totalPrice) * 100), // Convert to cents/pence
          },
          quantity: 1,
        }
      ],
      mode: 'payment',
      success_url: `${process.env.Site_URL}/booking-summary.html?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.Site_URL}/booking-summary.html?payment_canceled=true`,
      metadata: {
        group: data.group,
        date: data.date,
        playerName: data.playerName,
        bookingType: data.bookingType || 'Standard',
        plan: data.plan || 'Standard',
        yourName: data.yourName || '',
        discountCode: data.discountCode || 'None'
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ id: session.id })
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      statusCode: 500,
      headers, // Add CORS headers to error response
      body: JSON.stringify({ error: error.message })
    };
  }
};
