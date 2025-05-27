/**
 * Google Apps Script to receive booking data from Netlify and add it to a Google Sheet
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'GET method not supported' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  Logger.log('doPost function triggered - webhook received from Netlify');
  try {
    const data = JSON.parse(e.postData.contents);
    Logger.log('Received data: ' + JSON.stringify(data));
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Bookings') || ss.insertSheet('Bookings');
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Group', 'Date', 'Player Name', 'Paid']);
      sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
    }
    
    const paymentAmount = data.totalPrice ? `£${data.totalPrice}` : 'No';
    
    // ✅ Append the booking row once
    sheet.appendRow([
      data.group || '',
      data.date || '',
      data.playerName || '',
      paymentAmount
    ]);

    // ✅ Sort by Group (A), then Date (B)
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, 4).sort([{ column: 1 }, { column: 2 }]);
    }

    Logger.log('Added to sheet: ' + JSON.stringify({
      group: data.group,
      date: data.date,
      playerName: data.playerName,
      paid: paymentAmount
    }));

    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'success', 
      message: 'Data added to spreadsheet',
      data: {
        group: data.group,
        date: data.date,
        playerName: data.playerName,
        paid: paymentAmount
      }
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error processing request: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
