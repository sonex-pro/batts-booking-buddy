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

    if (!sheet) {
      throw new Error('Sheet "Coaching" not found.');
    }

    // Add headers if they don't exist
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Group', 'Date', 'Player Name', 'Paid']);
      sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
    }

    const paymentAmount = data.totalPrice ? `£${data.totalPrice}` : 'No';

    // Determine date to display (remains as plain text)
    let dateToDisplay = '';
    if (data.bookingType === 'monthly') {
      dateToDisplay = data.month || data.date || '';
    } else {
      dateToDisplay = data.shortDate || data.date || '';
    }

    // Append new booking data
    const newRow = [
      data.group || '',
      dateToDisplay,
      data.playerName || '',
      paymentAmount
    ];
    sheet.appendRow(newRow);

    // Custom sort order
    const groupOrder = {
      'Under 11': 1,
      'Open': 2,
      'Squad': 3
    };

    // Sort the data manually
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const range = sheet.getRange(2, 1, lastRow - 1, 4);
      const values = range.getValues();

      values.sort((a, b) => {
        const groupA = groupOrder[a[0]] || 99;
        const groupB = groupOrder[b[0]] || 99;
        if (groupA !== groupB) {
          return groupA - groupB;
        }

        // Parse dates only for comparison (won't affect what's written)
        const parseDate = (str) => {
          const parts = str.split('/');
          if (parts.length === 3) {
            const [day, month, year] = parts.map(p => parseInt(p, 10));
            return new Date(year < 100 ? 2000 + year : year, month - 1, day);
          }
          return new Date(str);
        };

        const dateA = parseDate(a[1]);
        const dateB = parseDate(b[1]);
        return dateA - dateB;
      });

      range.clearContent();
      sheet.getRange(2, 1, values.length, 4).setValues(values);
    }

    Logger.log('Data successfully added and sorted.');

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
    Logger.log('Error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

