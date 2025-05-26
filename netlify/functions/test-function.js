exports.handler = async (event) => {
  console.log('Test function called with method:', event.httpMethod);
  console.log('Headers:', JSON.stringify(event.headers));
  
  try {
    // Accept any HTTP method
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Test function working!',
        method: event.httpMethod,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Error in test function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
