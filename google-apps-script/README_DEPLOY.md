Deploying the Google Apps Script web app

1) Create the Apps Script project
   - Go to https://script.google.com/
   - Click New project
   - Replace the default Code.gs content with the code from `save_to_doc.gs` (copy/paste).
   - (Optional) Rename the project e.g. `PG Save Emails to Doc`.

2) Set script time zone (optional)
   - In the Apps Script editor, go to Project Settings (gear icon) and set the Time Zone you prefer.

3) Deploy as Web App
   - Click "Deploy" → "New deployment".
   - Select "Deployment type" → "Web app".
   - For "Description" enter something like: Save emails to Google Sheet
   - For "Execute as" choose: Me
   - For "Who has access" choose: Anyone (even anonymous)  <-- important if you want the website to POST directly from browsers
   - Click Deploy. You may be asked to authorize the script (allow access to Google Sheets).
   - Copy the Web App URL shown after deployment. It looks like https://script.google.com/macros/s/XXXXXXXX/exec

4) Paste the Web App URL into your `script.js`
   - Open `script.js` and set the variable GAS_ENDPOINT to the Web App URL. Example:

     const GAS_ENDPOINT = 'https://script.google.com/macros/s/XXXXXXXX/exec';

   - Save and redeploy your site (if using a static host).

5) Test from the site
   - From the site, open the buy modal and submit an email for a product. The frontend will POST { email, product, ts } to the GAS endpoint.
   - If everything is configured, entries will be appended to the Google Doc with format:
       2025-12-31 14:42:11 — Product Name — email@example.com

Notes about CORS and security
- If you set "Who has access" to "Anyone (even anonymous)", the web app should accept POSTs from clients without further auth. Browser CORS behavior varies; in most cases direct fetch works when the web app is public.
- If you need to restrict access, consider adding a shared secret token to the payload and validating it in `doPost`.

If you'd like, puedo:
- Desplegar yo el Apps Script si me das acceso (no recomendado por seguridad).
- Cambiar el script para validar un token (más seguro) y enviarlo desde `script.js`.
- Añadir una versión que guarde a Google Sheets (si lo preferís).

