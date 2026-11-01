/**
 * ===================================================================
 * Growvia Digital — Google Apps Script for Google Sheets Form Handler
 * ===================================================================
 *
 * HOW TO SET THIS UP:
 * 1. Open Google Sheets (https://sheets.new) and create a new sheet.
 *    Rename the sheet tab (at the bottom) to "Inquiries" (or leave as "Sheet1").
 * 2. In Google Sheets top menu, click: Extensions -> Apps Script.
 * 3. Delete any default code in Code.gs and paste ALL the code below.
 * 4. (Optional) Set NOTIFY_EMAIL to your email if you want instant Gmail alerts.
 * 5. Click the "Save" icon (Floppy disk).
 * 6. Click the blue "Deploy" button (top right) -> "New deployment".
 * 7. Click the gear icon next to "Select type" and choose "Web app".
 * 8. Set:
 *    - Description: "Growvia Form Handler"
 *    - Execute as: "Me" (your email)
 *    - Who has access: "Anyone" (CRITICAL: must be "Anyone", NOT "Only myself")
 * 9. Click "Deploy".
 * 10. Click "Authorize access" -> choose your Google account.
 *     If Google shows "Google hasn't verified this app":
 *     Click "Advanced" (small text at bottom left) -> Click "Go to Untitled project (unsafe)" -> Click "Allow".
 * 11. Copy the "Web app URL" (it looks like https://script.google.com/macros/s/AKfycb.../exec).
 * 12. Open script.js in your website project and paste this URL into GOOGLE_SHEET_URL:
 *     var GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/.../exec';
 * ===================================================================
 */

// Configuration options
var CONFIG = {
  // Set to true to receive an email alert whenever an inquiry is submitted
  SEND_EMAIL_NOTIFICATION: false,
  // Where to receive the email notification
  NOTIFICATION_EMAIL: 'your-email@example.com',
  // Tab name in the Google Sheet (leave empty to use the first/active sheet)
  SHEET_NAME: 'Inquiries'
};

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Wait up to 15 seconds for any preceding concurrent write to finish
  lock.tryLock(15000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = CONFIG.SHEET_NAME ? (ss.getSheetByName(CONFIG.SHEET_NAME) || ss.getActiveSheet()) : ss.getActiveSheet();

    // Check if sheet is empty, if so, automatically create formatted header row
    if (sheet.getLastRow() === 0) {
      var headers = [
        'Timestamp',
        'Full Name',
        'Email Address',
        'Company',
        'Service Required',
        'Estimated Budget',
        'Project Details'
      ];
      sheet.appendRow(headers);

      // Style header row with Growvia brand styling
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#0f3d2e'); // Growvia deep forest green
      headerRange.setFontColor('#c8f169');  // Growvia lime accent
      headerRange.setHorizontalAlignment('center');
      headerRange.setVerticalAlignment('middle');
      sheet.setRowHeight(1, 38);
      sheet.setFrozenRows(1);
    }

    // Extract data from URLSearchParams, FormData, or JSON
    var data = {};
    if (e && e.parameter && Object.keys(e.parameter).length > 0) {
      data = e.parameter;
    } else if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    }

    // Prepare row values
    var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT', 'yyyy-MM-dd HH:mm:ss');
    var name = (data.name || '').trim();
    var email = (data.email || '').trim();
    var company = (data.company || '').trim() || '—';
    var service = (data.service || '').trim();
    var budget = (data.budget || '').trim() || 'Prefer to discuss';
    var details = (data.details || '').trim();

    // Append inquiry row
    sheet.appendRow([
      timestamp,
      name,
      email,
      company,
      service,
      budget,
      details
    ]);

    // Format new row
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, 7).setVerticalAlignment('top');
    sheet.autoResizeColumns(1, 7);

    // Optional email notification
    if (CONFIG.SEND_EMAIL_NOTIFICATION && CONFIG.NOTIFICATION_EMAIL && CONFIG.NOTIFICATION_EMAIL !== 'your-email@example.com') {
      try {
        var subject = 'New Website Inquiry: ' + name + ' (' + service + ')';
        var body = [
          'You have received a new inquiry from the Growvia website:',
          '',
          '• Name: ' + name,
          '• Email: ' + email,
          '• Company: ' + company,
          '• Service: ' + service,
          '• Budget: ' + budget,
          '',
          'Project Details:',
          details,
          '',
          '---',
          'Received at: ' + timestamp,
          'View Sheet: ' + ss.getUrl()
        ].join('\n');

        MailApp.sendEmail(CONFIG.NOTIFICATION_EMAIL, subject, body);
      } catch (mailErr) {
        Logger.log('Could not send notification email: ' + mailErr.toString());
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success', message: 'Inquiry saved successfully.' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error processing inquiry: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

// Support GET requests for testing endpoint status in browser
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      result: 'ready',
      message: 'Growvia Google Sheets inquiry endpoint is active and listening for POST submissions.'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
