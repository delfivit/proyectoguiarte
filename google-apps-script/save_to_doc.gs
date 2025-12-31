/* Apps Script: save_to_doc.gs (updated to write to Google Sheets)

This script accepts POST requests with JSON { email, product, ts [, token] }
and appends a row to the configured Google Spreadsheet.

It also supports GET requests for simple fallback / JSONP (pass email, product, ts as query params),
and an optional `token` validation if you set SECRET_TOKEN below.

DEPLOY: Create/update your Apps Script project, paste this file and deploy as Web App
(Execute as: Me, Who has access: Anyone (even anonymous)) and copy the Web App URL.
Then paste that URL into your `script.js` variable GAS_ENDPOINT.

IMPORTANT: the SPREADSHEET_ID below is set from the Google Sheet URL you provided.
*/

const SPREADSHEET_ID = '195Hnj-jiJGk2GWILSVVYT_3GSJy8pTyRKBfrZkjHQwk'; // from your Google Sheet URL
const SHEET_NAME = ''; // optional: set to the sheet tab name (e.g. 'Sheet1'), otherwise first sheet is used

// Optional security token: if non-empty, requests must include payload.token === SECRET_TOKEN
const SECRET_TOKEN = ''; // set a shared secret if you want to restrict writes

function appendRow(dateStr, product, email){
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
  sheet.appendRow([dateStr, product || '', email || '']);
}

function respond(obj, callback){
  var body = JSON.stringify(obj);
  if (callback){
    // JSONP-style response
    return ContentService
      .createTextOutput(callback + '(' + body + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(body)
    .setMimeType(ContentService.MimeType.JSON);
}

function validateToken(t){
  if (!SECRET_TOKEN) return true; // no token required
  return t && String(t) === String(SECRET_TOKEN);
}

function doPost(e){
  try{
    if (!e) return respond({ status: 'error', message: 'No event' });
    var contents = e.postData && e.postData.contents ? e.postData.contents : null;
    if (!contents) return respond({ status: 'error', message: 'No post data' });

    var payload = JSON.parse(contents);
    if (!validateToken(payload.token)) return respond({ status: 'error', message: 'Invalid token' });

    var email = payload.email || '';
    var product = payload.product || '';
    var ts = payload.ts || new Date().toISOString();

    var date = new Date(ts);
    var dateStr = Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

    appendRow(dateStr, product, email);

    return respond({ status: 'ok' });
  } catch(err){
    return respond({ status: 'error', message: String(err) });
  }
}

// GET fallback: accept query params (email, product, ts, token) and optionally callback for JSONP
function doGet(e){
  try{
    var p = e && e.parameter ? e.parameter : {};
    if (!validateToken(p.token)) return respond({ status: 'error', message: 'Invalid token' }, p.callback);

    var email = p.email || '';
    var product = p.product || '';
    var ts = p.ts || new Date().toISOString();
    var date = new Date(ts);
    var dateStr = Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

    appendRow(dateStr, product, email);

    return respond({ status: 'ok' }, p.callback);
  } catch(err){
    var cb = (e && e.parameter) ? e.parameter.callback : null;
    return respond({ status: 'error', message: String(err) }, cb);
  }
}

// Note: Apps Script Web Apps typically work when deployed as "Anyone, even anonymous".
// Browser CORS behavior can vary; if you still see CORS issues, use the GET/JSONP fallback
// (example: create a script tag with src = WEB_APP_URL + '?product=X&email=Y&callback=cb').

// Helper to force the script to request Spreadsheet scopes from the editor.
// Run this in the Apps Script editor (select `authTest` and press ▶ Run) and
// follow the authorization prompts. This will grant the script permission to
// access the spreadsheet so the web app can write rows when executed as you.
function authTest(){
  // This simply opens the spreadsheet to prompt the OAuth consent for spreadsheets.
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  // touch the sheet to ensure a scope is requested
  var sheet = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
  sheet.getRange(1,1).getValue();
  return 'ok';
}
