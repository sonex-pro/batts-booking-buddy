const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Server-side function to validate booking details and create secure checkout sessions
 * This prevents price manipulation by validating all pricing server-side
 */
exports.handler = async function(event, context) {
  // CORS headers to allow requests from your site
  const headers = {
    'Access-Control-Allow-Origin': '*',
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
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    // Parse the booking details from request body
    const data = JSON.parse(event.body);
    const { level, plan, month, date, discountCode } = data;

    // Server-side pricing validation
    // Retrieve correct pricing based on skill level and plan
    const PRICING = {
      beginner: {
        singleSession: 6.00,
        monthlyOneSession: 20.00,
        monthlyThreeSessions: 30.00
      },
      intermediate: {
        singleSession: 7.50,
        monthlyOneSession: 25.00,
        monthlyThreeSessions: 40.00
      },
      advanced: {
        singleSession: 15.00,
        monthlyOneSession: 45.00,
        monthlyThreeSessions: 55.00
      }
    };

    // Validate that the level exists
    if (!PRICING[level]) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid skill level' })
      };
    }

    // Determine the correct price based on plan
    let price;
    let description;
    
    if (plan === 'Single sessions') {
      price = PRICING[level].singleSession;
      description = `${level} table tennis - Single session on ${date}`;
    } else if (plan === '1 session per week') {
      price = PRICING[level].monthlyOneSession;
      description = `${level} table tennis - Monthly (1 session/week) for ${month}`;
    } else if (plan === '3 sessions per week') {
      price = PRICING[level].monthlyThreeSessions;
      description = `${level} table tennis - Monthly (3 sessions/week) for ${month}`;
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid booking plan' })
      };
    }

    // Apply discount if valid code provided
    if (discountCode === 'SIB') {
      price = price * 0.5; // 50% sibling discount
    }

    // Calculate final amount in pence for Stripe (Stripe uses smallest currency unit)
    const amount = Math.round(price * 100);

    // Create a checkout session with Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: description
            },
            unit_amount: amount
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.URL}/booking-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL}/booking-cancelled.html`
    });

    // Return the session ID to the client
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        sessionId: session.id,
        url: session.url
      })
    };
  } catch (error) {
    console.log('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to create checkout session' })
    };
  }
};
