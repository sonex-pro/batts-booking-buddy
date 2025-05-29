/**
 * Google Apps Script to receive booking data from Netlify and add it to a Google Sheet
 * Last updated: 2025-05-29
 */

/**
 * Manually sort all existing data in the spreadsheet
 * Run this function once to organize existing entries
 */
function sortAllExistingData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Coaching');
  
  if (!sheet) {
    Logger.log('Error: Sheet "Coaching" not found.');
    return;
  }
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    Logger.log('No data to sort.');
    return;
  }
  
  sortAndColorData(sheet);
  Logger.log('All existing data has been sorted and colored.');
}

/**
 * Sorts data by group and date, then applies color coding to rows
 * This is a reusable function called by both doPost and sortAllExistingData
 */
function sortAndColorData(sheet) {
  // Custom group sort order
  const groupOrder = {
    'Under 11': 1,
    'Open': 2,
    'Squad': 3
  };

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return; // No data to sort or only headers
  
  const range = sheet.getRange(2, 1, lastRow - 1, 4);
  const values = range.getValues();

  // Improved helper to parse various date formats for sorting
  const parseDate = (str) => {
    if (!str) return new Date(9999, 11, 31); // Handle empty dates
    
    // Handle DD/MM/YY format
    const dayMonthYearParts = str.split('/');
    if (dayMonthYearParts.length === 3) {
      const [day, month, year] = dayMonthYearParts.map(p => parseInt(p, 10));
      return new Date(year < 100 ? 2000 + year : year, month - 1, day);
    }
    
    // Handle month names like "June 2025"
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
                       'july', 'august', 'september', 'october', 'november', 'december'];
    const monthYearRegex = /(\w+)\s+(\d{4})/i;
    const monthYearMatch = str.match(monthYearRegex);
    
    if (monthYearMatch) {
      const month = monthNames.findIndex(m => m.toLowerCase() === monthYearMatch[1].toLowerCase());
      const year = parseInt(monthYearMatch[2], 10);
      if (month !== -1) {
        return new Date(year, month, 1);
      }
    }
    
    // Try standard date parsing as last resort
    const parsed = new Date(str);
    return isNaN(parsed.getTime()) ? new Date(9999, 11, 31) : parsed;
  };

  // First sort all values by group name according to groupOrder
  values.sort((a, b) => {
    const groupA = a[0];
    const groupB = b[0];
    const orderA = groupOrder[groupA] || 999;
    const orderB = groupOrder[groupB] || 999;
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    // If same group, sort by date
    return parseDate(a[1]) - parseDate(b[1]);
  });
  
  // Write sorted values
  range.clearContent();
  const targetRange = sheet.getRange(2, 1, values.length, 4);
  targetRange.setValues(values);

  // Apply color to entire row based on group
  values.forEach((row, i) => {
    const group = row[0];
    let color = null;

    if (group === 'Under 11') color = '#D0E9FF'; // Light Blue
    else if (group === 'Open') color = '#DFFFD0'; // Light Green
    else if (group === 'Squad') color = '#FFF8D0'; // Light Yellow

    if (color) {
      // Apply color to the entire row instead of just the first cell
      sheet.getRange(i + 2, 1, 1, 4).setBackground(color);
    }
  });
}

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

    // Sort and color the data after adding the new row
    sortAndColorData(sheet);
  

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

