/**
 * Google Apps Script to receive booking data from Netlify and add it to a Google Sheet
 */

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'GET method not supported' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  Logger.log('doPost function triggered');

  try {
    const data = JSON.parse(e.postData.contents);
    Logger.log('Received data: ' + JSON.stringify(data));

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Coaching');

    // Throw an error if the sheet isn't found
    if (!sheet) {
      throw new Error('Sheet "Coaching" not found.');
    }

    // Add headers if they don't exist
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Group', 'Date', 'Player Name', 'Paid', 'Your Name']);
      sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
    }

    const paymentAmount = data.totalPrice ? `£${data.totalPrice}` : 'No';

    // Determine the date format to use based on booking type
    let dateToDisplay = '';
    if (data.bookingType === 'monthly') {
      dateToDisplay = data.month || data.date || '';
    } else {
      dateToDisplay = data.shortDate || data.date || '';
    }

    // Append new booking data in correct column order
    sheet.appendRow([
      data.group || '',
      dateToDisplay,
      data.playerName || '',
      paymentAmount,
      data.yourName || ''
    ]);

    // Apply color to the group cell in the new row
    const newRow = sheet.getLastRow();
    const groupCell = sheet.getRange(newRow, 1); // Column A

    const groupValue = data.group || '';
    if (groupValue === '1-Under 11') {
      groupCell.setFontColor('green');
    } else if (groupValue === '2-Open') {
      groupCell.setFontColor('blue');
    } else if (groupValue === '3-Squad') {
      groupCell.setFontColor('#9966CC'); // Deep Lilac
    }

    // Sort the sheet by Group (A), then Date (B)
    if (newRow > 1) {
      sheet.getRange(2, 1, newRow - 1, 5).sort([{ column: 1 }, { column: 2 }]);
    }

    Logger.log('Data successfully added.');

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Data added to spreadsheet',
      data: {
        group: data.group,
        date: data.date,
        playerName: data.playerName,
        yourName: data.yourName,
        paid: paymentAmount
      }
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}



