/**
 * Blood Bank Dashboard - Google Apps Script
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1nPdCAaYVckUJodRC5oqswq92XGO1GKw-p1VY5LkKQ3c
 * 2. Go to Extensions → Apps Script
 * 3. Delete any existing code and paste this entire file
 * 4. Click the Save icon (or Ctrl+S)
 * 5. Click Deploy → New Deployment
 * 6. Click the gear icon next to "Select type" and choose "Web app"
 * 7. Set "Execute as" to "Me"
 * 8. Set "Who has access" to "Anyone"
 * 9. Click "Deploy"
 * 10. Click "Authorize access" and follow the prompts
 * 11. Copy the "Web app URL" - you'll need this for the React app
 * 
 * AFTER DEPLOYMENT:
 * Update the APPS_SCRIPT_URL in src/hooks/useGoogleSheetsAPI.ts with your Web app URL
 */

// Sheet Configuration
const DONOR_SHEET_NAME = 'Sheet1';
const DONOR_SHEET_ID = 461703106; // GID from the URL

const INVENTORY_SHEET_NAME = 'Inventory';
const INVENTORY_SHEET_ID = 350030392; // GID from the URL

/**
 * Helper to get sheet by Name or ID
 */
function getSheet(ss, name, id) {
  // Try by ID first (more reliable)
  if (id !== undefined) {
    const sheets = ss.getSheets();
    for (const sheet of sheets) {
      if (sheet.getSheetId() === id) {
        return sheet;
      }
    }
  }
  // Fallback to name
  return ss.getSheetByName(name);
}

/**
 * Handle GET requests (for testing)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Blood Bank API is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle POST requests from the React app
 */
function doPost(e) {
  try {
    // Robust parsing of post data
    let data;
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseError) {
        // If parsing fails, it might be because of content-type issues. 
        // Sometimes the body is just the keys if sent as x-www-form-urlencoded
        console.error('JSON parse error:', parseError);
        data = e.parameter; // Fallback to parameters
      }
    } else {
      data = e.parameter;
    }

    if (!data) {
      throw new Error('No data received');
    }

    const action = data.action;
    let result;

    switch (action) {
      case 'addDonor':
        result = addDonor(data.donor);
        break;
      case 'updateDonorStatus':
        result = updateDonorStatus(data.rowIndex, data.newStatus);
        break;
      case 'updateDonorDetails':
        result = updateDonorDetails(data.rowIndex, data.donor);
        break;
      case 'deleteDonor':
        result = deleteDonor(data.rowIndex);
        break;
      case 'updateInventory':
        result = updateInventory(data.bloodUnits, data.plasmaUnits, data.plateletUnits);
        break;
      default:
        result = { success: false, error: 'Unknown action: ' + action };
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Add a new donor record
 */
function addDonor(donor) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getSheet(ss, DONOR_SHEET_NAME, DONOR_SHEET_ID);

    if (!sheet) return { success: false, error: 'Donor sheet not found' };

    // Columns: A=Timestamp, B=Donor Name, C=Phone, D=Channel, E=Donation Type, F=Appointment Date, G=Time, H=Status
    const timestamp = new Date().toISOString();

    // Ensure donor object has all fields to avoid undefined
    const rowData = [
      timestamp,
      donor.donorName || '',
      donor.phoneNumber || '',
      donor.channel || '',
      donor.donationType || '',
      donor.appointmentDate || '',
      donor.time || '',
      donor.status || 'Queued'
    ];

    sheet.appendRow(rowData);

    return { success: true, message: 'Donor added successfully' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Update donor status in column H (Status column)
 * @param {number} rowIndex - The row number (1-indexed, includes header)
 * @param {string} newStatus - The new status value
 */
function updateDonorStatus(rowIndex, newStatus) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getSheet(ss, DONOR_SHEET_NAME, DONOR_SHEET_ID);

    if (!sheet) {
      return { success: false, error: 'Donor sheet not found' };
    }

    // Column H is the 8th column
    const statusColumn = 8;

    // Update the cell
    sheet.getRange(rowIndex, statusColumn).setValue(newStatus);

    return {
      success: true,
      message: 'Status updated successfully',
      rowIndex: rowIndex,
      newStatus: newStatus
    };

  } catch (error) {
    console.error('Error updating donor status:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update all details of a donor
 */
function updateDonorDetails(rowIndex, donor) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getSheet(ss, DONOR_SHEET_NAME, DONOR_SHEET_ID);

    if (!sheet) return { success: false, error: 'Donor sheet not found' };

    // Update columns B through H (Indices 2 through 8)
    sheet.getRange(rowIndex, 2).setValue(donor.donorName);
    sheet.getRange(rowIndex, 3).setValue(donor.phoneNumber);
    sheet.getRange(rowIndex, 4).setValue(donor.channel);
    sheet.getRange(rowIndex, 5).setValue(donor.donationType);
    sheet.getRange(rowIndex, 6).setValue(donor.appointmentDate);
    sheet.getRange(rowIndex, 7).setValue(donor.time);
    sheet.getRange(rowIndex, 8).setValue(donor.status);

    return { success: true, message: 'Donor details updated successfully' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete a donor record
 */
function deleteDonor(rowIndex) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getSheet(ss, DONOR_SHEET_NAME, DONOR_SHEET_ID);

    if (!sheet) return { success: false, error: 'Donor sheet not found' };

    sheet.deleteRow(rowIndex);

    return { success: true, message: 'Donor deleted successfully' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Update inventory values
 */
function updateInventory(bloodUnits, plasmaUnits, plateletUnits) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getSheet(ss, INVENTORY_SHEET_NAME, INVENTORY_SHEET_ID);

    if (!sheet) {
      return { success: false, error: 'Inventory sheet not found' };
    }

    // Update row 2 (assuming row 1 is headers)
    sheet.getRange('A2').setValue(bloodUnits);
    sheet.getRange('B2').setValue(plasmaUnits);
    sheet.getRange('C2').setValue(plateletUnits);
    sheet.getRange('D2').setValue(new Date().toISOString());

    return {
      success: true,
      message: 'Inventory updated successfully',
      inventory: {
        bloodUnits: bloodUnits,
        plasmaUnits: plasmaUnits,
        plateletUnits: plateletUnits,
        lastUpdated: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('Error updating inventory:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test function - run this in Apps Script to verify setup
 */
function testSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();

  console.log('Available sheets:');
  sheets.forEach(function (sheet) {
    console.log('- ' + sheet.getName() + ' (gid: ' + sheet.getSheetId() + ')');
  });

  // Test reading donor sheet
  const donorSheet = getSheet(ss, DONOR_SHEET_NAME, DONOR_SHEET_ID);
  if (donorSheet) {
    const lastRow = donorSheet.getLastRow();
    console.log('Donor sheet found: ' + donorSheet.getName() + ' with ' + lastRow + ' rows');
  } else {
    console.log('WARNING: Donor sheet not found!');
  }
}
