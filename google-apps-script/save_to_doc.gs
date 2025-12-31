/* Apps Script: save_to_doc.gs

This script accepts POST requests with JSON { email, product, ts }
and appends a line to the configured Google Document.

DEPLOY: Create a new Apps Script project, paste this file and deploy as Web App
(Execute as: Me, Who has access: Anyone (even anonymous)) and copy the Web App URL.
Then paste that URL into your `script.js` variable GAS_ENDPOINT.

IMPORTANT: the DOC_ID below is set from the Google Doc you provided.
*/

const DOC_ID = '1q10ekkkQcmyAurMMG4B9wL0WHupA65V73kKTQ685V-w'; // from your Google Doc URL

function doPost(e){
  try{
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'error', message: 'No post data' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var payload = JSON.parse(e.postData.contents);
    var email = payload.email || '';
    var product = payload.product || '';
    var ts = payload.ts || new Date().toISOString();

    // Open the doc and append a paragraph with date, product and email
    var doc = DocumentApp.openById(DOC_ID);
    var body = doc.getBody();

    var date = new Date(ts);
    // Format date/time in a readable form (server timezone)
    var dateStr = Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

    var line = dateStr + ' — ' + (product || '-') + ' — ' + (email || '-');
    body.appendParagraph(line);
    body.appendHorizontalRule();

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  }catch(err){
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: handle OPTIONS preflight requests. Apps Script doesn't let you set CORS headers directly,
// but many times public web apps work from the browser as-is. If you need CORS headers, consider
// implementing a small proxy or using fetch with `mode: 'no-cors'` (no response body available).
function doOptions(e){
  return ContentService.createTextOutput('');
}
