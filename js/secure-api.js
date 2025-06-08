/**
 * Secure API for Batts Booking Buddy
 * Handles all server-side communications for secure pricing and booking
 */

// Base URL for Netlify functions
const API_BASE_URL = 'https://cbjsonex.netlify.app/.netlify/functions';

/**
 * Get secure pricing from the server based on skill level and plan
 * @param {string} skillLevel - The skill level (beginner, intermediate, advanced)
 * @param {string} plan - The booking plan (e.g., "3 sessions per week")
 * @param {string} discountCode - Optional discount code
 * @returns {Promise<Object>} - Price information including originalPrice, discountAmount, and finalPrice
 */
async function getSecurePricing(skillLevel, plan, discountCode = '') {
  try {
    const response = await fetch(`${API_BASE_URL}/get-prices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        skillLevel,
        plan,
        discountCode
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to get pricing: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching secure pricing:', error);
    
    // Fallback to client-side price calculation for backward compatibility
    // This is used only if the server function fails
    console.warn('Using fallback client-side pricing (legacy)');
    
    // Legacy price calculation
    let price = 0;
    if (skillLevel === 'beginner') {
      if (plan === '3 sessions per week') price = 30.00;
      else if (plan === '1 session per week') price = 20.00;
      else if (plan === 'Single sessions') price = 6.00;
    } else if (skillLevel === 'intermediate') {
      if (plan === '3 sessions per week') price = 35.00;
      else if (plan === '1 session per week') price = 25.00;
      else if (plan === 'Single sessions') price = 8.00;
    } else if (skillLevel === 'advanced') {
      if (plan === '3 sessions per week') price = 40.00;
      else if (plan === '1 session per week') price = 30.00;
      else if (plan === 'Single sessions') price = 10.00;
    }
    
    let discountAmount = 0;
    let finalPrice = price;
    
    if (discountCode && discountCode.toUpperCase() === 'SIB') {
      discountAmount = price * 0.5;
      finalPrice = price - discountAmount;
    }
    
    return {
      originalPrice: price.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      finalPrice: finalPrice.toFixed(2)
    };
  }
}

/**
 * Create a secure booking and Stripe checkout session
 * @param {Object} bookingData - Booking information
 * @returns {Promise<Object>} - Stripe session information
 */
async function createSecureBooking(bookingData) {
  try {
    // First, verify the price server-side
    const priceInfo = await getSecurePricing(
      bookingData.skillLevel,
      bookingData.plan,
      bookingData.discountCode || ''
    );
    
    // Prepare data for checkout with verified price
    const paymentData = {
      group: bookingData.skillLevel || 'Not specified',
      date: bookingData.date || bookingData.month || 'Not specified',
      shortDate: bookingData.shortDate || '',
      rawDate: bookingData.rawDate || '',
      playerName: bookingData.playerName || 'Not specified',
      totalPrice: priceInfo.finalPrice, // Use server-verified price
      bookingType: bookingData.bookingType || 'Not specified',
      plan: bookingData.plan || 'Not specified',
      yourName: bookingData.yourName || 'Not specified',
      discountCode: bookingData.discountCode || 'None',
      month: bookingData.month || ''
    };
    
    // Call the create-checkout-session function
    const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Network response was not ok: ${response.status} ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating secure booking:', error);
    throw error;
  }
}

// Export functions for use in other scripts
window.getSecurePricing = getSecurePricing;
window.createSecureBooking = createSecureBooking;
