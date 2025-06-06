/**
 * Server-side function to securely provide pricing data
 * This prevents price manipulation since prices are stored server-side
 */
exports.handler = async function(event, context) {
  // Define all prices in a server-side constant
  // These cannot be modified by users through the browser
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

  try {
    // Parse request parameters
    const params = event.queryStringParameters;
    const level = params.level;

    if (!level || !PRICING[level]) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid skill level provided' })
      };
    }

    // Return the pricing for the requested level
    return {
      statusCode: 200,
      body: JSON.stringify(PRICING[level])
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error retrieving pricing information' })
    };
  }
};
