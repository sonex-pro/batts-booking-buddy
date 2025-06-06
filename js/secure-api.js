/**
 * secure-api.js
 * Secure API functions for handling pricing and bookings server-side
 * This prevents client-side price manipulation for enhanced security
 */

/**
 * Fetches pricing information from the secure server-side API
 * @param {string} level - The skill level (beginner, intermediate, advanced)
 * @return {Promise} - Promise resolving to pricing data
 */
async function getSecurePricing(level) {
  try {
    const response = await fetch(`/.netlify/functions/get-prices?level=${level}`);
    if (!response.ok) throw new Error('Failed to fetch pricing');
    return await response.json();
  } catch (error) {
    console.error('Error fetching secure pricing:', error);
    // Fallback to default prices if API fails
    return getDefaultPrices(level);
  }
}

/**
 * Creates a secure booking through the server-side API
 * @param {Object} bookingData - The booking details
 * @return {Promise} - Promise resolving to the checkout session
 */
async function createSecureBooking(bookingData) {
  try {
    const response = await fetch('/.netlify/functions/create-booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create booking');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating secure booking:', error);
    throw error;
  }
}

/**
 * Fallback function for pricing if API fails
 * @param {string} level - The skill level
 * @return {Object} - Default pricing object
 */
function getDefaultPrices(level) {
  const pricing = {
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
  
  return pricing[level] || pricing.beginner;
}
