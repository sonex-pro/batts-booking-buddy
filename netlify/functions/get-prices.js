const priceConfig = {
  "1-Under 11": {
    "3 sessions per week": 30.00,
    "1 session per week": 20.00,
    "Single sessions": 6.00
  },
  "2-Open": {
    "3 sessions per week": 35.00,
    "1 session per week": 25.00,
    "Single sessions": 8.00
  },
  "3-Squad": {
    "3 sessions per week": 40.00,
    "1 session per week": 30.00,
    "Single sessions": 10.00
  },
  // Also keep the original keys for backward compatibility
  "beginner": {
    "3 sessions per week": 30.00,
    "1 session per week": 20.00,
    "Single sessions": 6.00
  },
  "intermediate": {
    "3 sessions per week": 35.00,
    "1 session per week": 25.00,
    "Single sessions": 8.00
  },
  "advanced": {
    "3 sessions per week": 40.00,
    "1 session per week": 30.00,
    "Single sessions": 10.00
  }
};

exports.handler = async (event) => {
  // Set CORS headers for all responses
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
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return { 
        statusCode: 405, 
        headers,
        body: JSON.stringify({ error: 'Method Not Allowed' })
      };
    }

    // Parse the request body
    const data = JSON.parse(event.body);
    
    // Validate required fields
    if (!data.skillLevel || !data.plan) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: skillLevel and plan are required' })
      };
    }

    // Get the price based on skill level and plan
    const skillLevel = data.skillLevel.toLowerCase();
    const plan = data.plan;
    
    // Check if skill level exists in our config
    if (!priceConfig[skillLevel]) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid skill level' })
      };
    }
    
    // Check if plan exists for this skill level
    if (!priceConfig[skillLevel][plan]) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid plan for this skill level' })
      };
    }
    
    // Get the price
    const price = priceConfig[skillLevel][plan];
    
    // Calculate discount if applicable
    let finalPrice = price;
    let discountAmount = 0;
    
    if (data.discountCode && data.discountCode.toUpperCase() === 'SIB') {
      discountAmount = price * 0.5; // 50% discount
      finalPrice = price - discountAmount;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        originalPrice: price.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        finalPrice: finalPrice.toFixed(2)
      })
    };
  } catch (error) {
    console.error('Error getting price:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
