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

    // Determine date to display (as plain text)
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

    // Custom group sort order
    const groupOrder = {
      'Under 11': 1,
      'Open': 2,
      'Squad': 3
    };

    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const range = sheet.getRange(2, 1, lastRow - 1, 4);
      const values = range.getValues();

      // Helper to parse dates for sorting (doesn't affect text in sheet)
      const parseDate = (str) => {
        const parts = str.split('/');
        if (parts.length === 3) {
          const [day, month, year] = parts.map(p => parseInt(p, 10));
          return new Date(year < 100 ? 2000 + year : year, month - 1, day);
        }
        const parsed = new Date(str);
        return isNaN(parsed) ? new Date(9999, 11, 31) : parsed;
      };

      // Group and sort data by custom group and date
      const groupedData = Object.keys(groupOrder).map(group => {
        return values
          .filter(row => row[0] === group)
          .sort((a, b) => parseDate(a[1]) - parseDate(b[1]));
      });

      const sortedValues = groupedData.flat();

      // Write sorted values
      range.clearContent();
      const targetRange = sheet.getRange(2, 1, sortedValues.length, 4);
      targetRange.setValues(sortedValues);

      // Apply color to Group column
      sortedValues.forEach((row, i) => {
        const group = row[0];
        let color = null;

        if (group === 'Under 11') color = '#D0E9FF'; // Light Blue
        else if (group === 'Open') color = '#DFFFD0'; // Light Green
        else if (group === 'Squad') color = '#FFF8D0'; // Light Yellow

        if (color) {
          sheet.getRange(i + 2, 1).setBackground(color);
        }
      });
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

