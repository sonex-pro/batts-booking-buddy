/**
 * Google Apps Script to receive booking data from Netlify and add it to a Google Sheet
 * 
 * Instructions:
 * 1. Create a new Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Copy and paste this code into the script editor
 * 4. Deploy as a web app (Deploy > New deployment > Web app)
 * 5. Set access to "Anyone, even anonymous"
 * 6. Copy the web app URL and use it as GOOGLE_APPS_SCRIPT_URL in your Netlify environment variables
 */

// The doGet function is required but we'll use doPost for receiving data
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'GET method not supported' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Handle POST requests from Netlify
function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Log the received data for debugging
    console.log('Received data:', JSON.stringify(data));
    
    // Get the active spreadsheet and sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Bookings') || ss.insertSheet('Bookings');
    
    // Check if headers exist, if not add them
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Group',
        'Date',
        'Player Name',
        'Paid'
      ]);
      
      // Format headers
      sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
    }
    
    // Prepare the payment amount string with pound symbol
    const paymentAmount = data.totalPrice ? `£${data.totalPrice}` : 'No';
    
    // Append the new booking data with only the 4 required columns
    sheet.appendRow([
      data.group || '',
      data.date || '',
      data.playerName || '',
      paymentAmount || 'No'  // Use payment amount or 'No' for Paid column
    ]);
    
    // Log what was added to the sheet
    console.log('Added to sheet:', JSON.stringify({
      group: data.group,
      date: data.date,
      playerName: data.playerName,
      paid: paymentAmount || 'No'
    }));
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'success', 
      message: 'Data added to spreadsheet',
      data: {
        group: data.group,
        date: data.date,
        playerName: data.playerName,
        paid: paymentAmount || 'No'
      }
    })).setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Log the error
    console.error('Error processing request:', error);
    
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
