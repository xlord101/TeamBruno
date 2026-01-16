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

// Sheet names - update these if your sheet names are different
const DONOR_SHEET_NAME = 'Sheet1'; // or whatever your donor records sheet is named
const INVENTORY_SHEET_NAME = 'Inventory'; // or your inventory sheet name (gid=350030392)

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
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    let result;
    
    switch (action) {
      case 'updateDonorStatus':
        result = updateDonorStatus(data.rowIndex, data.newStatus);
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
 * Update donor status in column H (Status column)
 * @param {number} rowIndex - The row number (1-indexed, includes header)
 * @param {string} newStatus - The new status value
 */
function updateDonorStatus(rowIndex, newStatus) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(DONOR_SHEET_NAME);
    
    if (!sheet) {
      return { success: false, error: 'Sheet not found: ' + DONOR_SHEET_NAME };
    }
    
    // Column H is the 8th column (Status column based on user's structure)
    // Columns: A=Timestamp, B=Donor Name, C=Phone, D=Channel, E=Donation Type, F=Appointment Date, G=Time, H=Status
    const statusColumn = 8; // Column H
    
    // Update the cell
    sheet.getRange(rowIndex, statusColumn).setValue(newStatus);
    
    // Log the update
    console.log('Updated row ' + rowIndex + ' status to: ' + newStatus);
    
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
 * Update inventory values
 * @param {number} bloodUnits - Blood units count
 * @param {number} plasmaUnits - Plasma units count
 * @param {number} plateletUnits - Platelet units count
 */
function updateInventory(bloodUnits, plasmaUnits, plateletUnits) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(INVENTORY_SHEET_NAME);
    
    if (!sheet) {
      // If inventory sheet doesn't exist, try to find it by gid or create one
      return { success: false, error: 'Inventory sheet not found: ' + INVENTORY_SHEET_NAME };
    }
    
    // Update row 2 (assuming row 1 is headers)
    // Columns: A=Blood Units, B=Plasma Units, C=Platelet Units, D=Last Updated
    sheet.getRange('A2').setValue(bloodUnits);
    sheet.getRange('B2').setValue(plasmaUnits);
    sheet.getRange('C2').setValue(plateletUnits);
    sheet.getRange('D2').setValue(new Date().toISOString());
    
    console.log('Inventory updated: Blood=' + bloodUnits + ', Plasma=' + plasmaUnits + ', Platelets=' + plateletUnits);
    
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
  sheets.forEach(function(sheet) {
    console.log('- ' + sheet.getName() + ' (gid: ' + sheet.getSheetId() + ')');
  });
  
  // Test reading donor sheet
  const donorSheet = ss.getSheetByName(DONOR_SHEET_NAME);
  if (donorSheet) {
    const lastRow = donorSheet.getLastRow();
    console.log('Donor sheet found with ' + lastRow + ' rows');
  } else {
    console.log('WARNING: Donor sheet not found. Update DONOR_SHEET_NAME constant.');
  }
}
