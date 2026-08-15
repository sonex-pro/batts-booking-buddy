# Batt's Booking Buddy - Payment Integration

This document explains how to set up the Stripe payment integration with Netlify and Google Sheets for Batt's Booking Buddy website.

## Overview

The payment flow works as follows:

1. User selects a booking option and fills in their details
2. On the booking summary page, user clicks "Pay with Stripe"
3. User is redirected to Stripe Checkout to complete payment
4. Upon successful payment, Stripe sends a webhook to Netlify
5. Netlify function processes the webhook and sends booking data to Google Sheets
6. User is redirected back to the website with a success message

## Setup Instructions

### 1. Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Replace the test public key in `booking-summary.html` with your own
4. Set up a webhook in the Stripe Dashboard pointing to your Netlify function URL: `https://your-site.netlify.app/.netlify/functions/stripe-webhook`
5. Note the webhook signing secret for later use

### 2. Netlify Setup

1. Log in to your Netlify account
2. Deploy your site to Netlify (if not already deployed)
3. Go to Site settings > Environment variables
4. Add the following environment variables:
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook signing secret
   - `GOOGLE_APPS_SCRIPT_URL`: The URL of your deployed Google Apps Script web app
   - `URL`: Your Netlify site URL (e.g., `https://batts-booking-buddy.netlify.app`)

### 3. Google Sheets Setup

1. Create a new Google Sheet
2. Go to Extensions > Apps Script
3. Copy and paste the code from `google-apps-script.js` into the script editor
4. Deploy as a web app:
   - Click Deploy > New deployment
   - Select type: Web app
   - Set "Who has access" to "Anyone, even anonymous"
   - Click Deploy
5. Copy the web app URL and use it as `GOOGLE_APPS_SCRIPT_URL` in your Netlify environment variables

## Testing

To test the payment integration:

1. Use Stripe test cards (e.g., `4242 4242 4242 4242`) with any future expiry date and any CVC
2. Check the Netlify function logs for any errors
3. Verify that data is being added to your Google Sheet

## Troubleshooting

- **Stripe Checkout not loading**: Check that your Stripe public key is correct
- **Webhook errors**: Verify your webhook URL and signing secret
- **Data not appearing in Google Sheets**: Check that your Google Apps Script is deployed correctly and the URL is set in Netlify environment variables

## Production Considerations

- Switch to Stripe live mode and update API keys when ready for production
- Consider adding email notifications for successful bookings
- Implement error handling and retry logic for failed data submissions
